///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;

const AWS = require('aws-sdk');
const response = require('./lib/response.js');
const database = require('./lib/database');

if(process.env.AWS_REGION == "local") {
	mode 		= "offline";
	//sns 		= require('../../../offline/sns');
	docClient 	= require('../../../offline/dynamodb').docClient;
	S3 			= require('../../../offline/S3');
	// dynamodb = require('../../../offline/dynamodb').dynamodb;
}else {
	mode 		= "online";
	//sns 		= new AWS.SNS();
	docClient 	= new AWS.DynamoDB.DocumentClient({});
	S3 			= new AWS.S3({region: 'eu-central-1'});
	AWS.config.region = 'eu-central-1';
	dynamodb    = new AWS.DynamoDB();
}
///// ...................................... end default setup ............................................////

//modules defined here
const uuid 			= require('uuid');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const putSchema = {
	"$async":true,
	"additionalProperties": false,
	"required": [ "fileId","fileOrder","fileName","fileType","fileFormat"],
	"type":"object",
	"properties":{
	    "fileId":{"type":"string"},
	    "fileOrder":{"type":"number"},
	    "fileName":{"type":"string"},
	    "fileDescription":{"type":"string"},
	    "fileThumbnailId":{"type":"string"},
	    "fileSize":{"type":"number"},
	    "fileType":{"type":"string"},
	    "fileFormat":{
	    	"type":"string",
	    	"enum":[
	    		"document",
	    		"NormalVideo",
	    		"TeaserVideo"
	    	]
	    }
	 }
};

/*
	maual entry of 
	"fileS3Bucket":{"type":"string"},
	"fileS3Key":{"type":"string"},
	"createAt":{"type":"string"},
	"createBy":{"type":"string"},
	"updateAt":{type:"string"},
	"updatedBy":{type:"string"}
 */

//call another lambda
// var execute_lambda = require('./lib/lambda')('sample2');
const validate = ajv.compile(putSchema);

/**
 * add the file to the system
 * @param  {[type]}   data     [content]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	console.log(data);
	if(typeof data == "string"){
		data = JSON.parse(data);
	}
	validate_all(validate,data)
		.then(function(result){
			result['fileS3Bucket']="salestool-container";
			result['fileS3Key']=uuid.v4();
			result['createAt']=Date.now()+"";
			result['createBy']="anonymus";

			/** apply restriction when fileId == "Normal" && fileId =="Teaser" only allowing fileType to mov */
			/** and also deny fileType of other format if not pdf 
			condition request to be something like allow for format
			*/
			//if fileId is start with video then allow it to upload 
			if( result.fileId.startsWith("Videos_") ){
				let allow = false;
				switch(result.fileType){
					case 'mp4':
					case 'mov':
					case 'webm':
					case 'wmv':allow =true;
						break;
					default:
				}
				if(allow == true){
					result['fileS3Key']="public/TeaserVideo/"+result['fileS3Key'];
					result['fileLoc']="https://s3.eu-central-1.amazonaws.com/"+result['fileS3Bucket']+"/"+result['fileS3Key']+"."+result['fileType'];
					return post_file(result);
				}else{
					return new Promise((resolve,reject)=>{
						reject("Only support video format");
					})
				}
			}else{
				if(result.fileFormat){
					delete result.fileFormat;
				}
				if(result.fileType == "pdf"){
					return post_file(result);
				}else{
					return new Promise((resolve,reject)=>{
						reject("Only support pdf format");
					})
				}
			}
		})
		.then(function(result){
			console.log(result);
			return find_count_increase_folder(result);
		})
		.then(function(result){
			console.log(arguments);
			if(result.increseCount== undefined){
				return result;
			}else{
				return increase_folder_count(result);
			}
		})
		.then(function(result){
			return new Promise((resolve,reject)=>{
				signed_url(result,function(response){
					console.log(response);
					result.result['data'] = response;
					resolve(result);
				});
			});
		})
		.then(function(result){
			console.log(result);
			response({code:200,body:result.result},callback);
		})
		.catch(function(err){
			console.log(err);
			response({code:400,err:{err}},callback);
		})
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate,data) {
	return new Promise((resolve,reject)=>{
		validate(data).then(function (res) {
			console.log(res);
		    resolve(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

/**
 * give access of S3 to upload data on the 
 * @param  {[type]} key      [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
function signed_url(data,response){
	
	var params = {
		Bucket:data.fileS3Bucket,
		Key:data.fileS3Key+"."+data.fileType,
		Expires: 360
	};
	if( mode == "offline"){
		/** convert to the params in minio format */
		
		S3.presignedPutObject(params.Bucket, params.Key, params.Expires,function(err,url){
			if(err){
				console.log(err);
				response({err:{"err":"Some Thing went wrong"}});
			}else{
				response({url});
			}
		});
	}else{
		S3.getSignedUrl('putObject',params,function(err,url){
			if(err){
				console.log(err);
				response({err:{"err":"Some Thing went wrong"}});
			}else{
				response({url});
			}
		});

	}
}

function post_file(result){
	console.log(result);
	var params = {
	    TableName: database.Table[0].TableName,
	    Item: result
	};
	
	return new Promise((resolve,reject)=>{
		docClient.put(params,function(err,categories){
			if(err){
				console.log(err);
				reject(err.message);
			}
			result['result']={"message":"Inserted Successfully"};
			resolve(result);
		})
	});
}

function find_count_increase_folder(result){
	//find the folderid in folderSub 
	var params = {
		TableName: database.Table[1].TableName,
	    IndexName: 'folderSub-index',
	    KeyConditionExpression: 'folderSub = :value', 
	    ExpressionAttributeValues: { // a map of substitutions for all attribute values
	      ':value': result.fileId
	    },
	    Limit: 1, // optional (limit the number of items to evaluate)
	};
	return new Promise((resolve,reject)=>{
		docClient.query(params,function(err,folder){
			if(err){
				reject(err.message);
			}
			console.log(folder);
			if(folder.Items[0] != undefined){
				let content = folder.Items[0];
				result['increseCount']=content;
			}
			resolve(result);
		})
	})
}

function increase_folder_count(result){
	let increseCount = result.increseCount;
	var params = {
	    TableName: database.Table[1].TableName,
	    Key: {
	        folderId: increseCount.folderId,
	        folderOrder: increseCount.folderOrder  
	    },
	    UpdateExpression: 'ADD folderSubCount :value', 
	    ExpressionAttributeValues: { // a map of substitutions for all attribute values
	        ':value': 1
	    }
	};
	return new Promise((resolve,reject)=>{
		docClient.update(params, function(err, folder) {
		   	if(err){
				reject(err.message);
			}
				resolve(result);
		});
	})
}

module.exports={execute};