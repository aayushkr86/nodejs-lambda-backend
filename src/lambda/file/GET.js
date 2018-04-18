///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk');
const response 	= require('./lib/response.js');

if(process.env.AWS_REGION == "local"){
	mode 		= "offline";
	sns 		= require('../../../offline/sns');
	docClient 	= require('../../../offline/dynamodb').docClient;
	S3 			= require('../../../offline/S3');
	// dynamodb = require('../../../offline/dynamodb').dynamodb;
}else{
	mode 		= "online";
	sns 		= new AWS.SNS();
	docClient 	= new AWS.DynamoDB.DocumentClient({});
	S3 			= new AWS.S3({region: 'eu-central-1'});
	AWS.config.region = 'eu-central-1';
	// dynamodb = new AWS.DynamoDB();
}
///// ...................................... end default setup ............................................////

//call another lambda
// const execute_lambda = require('./lib/lambda')('sample2');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const getSchema = {
  "$async":true,
  "type":"object",
  "required":["fileId","fileOrder"],
  "additionalProperties": false,
  "properties":{
    "fileId":{"type":"string"},
    "fileOrder":{"type":"number"}
  }
};

const validate = ajv.compile(getSchema);

/**
 * fetch and show the file
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	if(data != undefined){
		if(typeof data.fileOrder == "string"){
			data.fileOrder = parseInt(data.fileOrder);
			validate_all(validate,data)
				.then(function(result){
					return get_files(result);
				})
				.then(function(files){
					console.log(files);
					return new Promise((resolve,reject)=>{
						getRequest_Url(files.result,function(res){
							if(res.err){
								reject(res.err);
							}else{
								resolve({"data":res});
							}
						})
					})
				})
				.then(function(result){
						response({code:200,body:result},callback);
				})
				.catch(function(err){
					response({code:400,err:{err}},callback);
				})
		}
	}else{
		response({code:400,err:{"err":"Please provide file to view"}},callback);
	}
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
 * get file from DB
 * @param  {[type]} result [get file details]
 * @return {[type]}        [Promise based reject or response of file fetched or not]
 */
function get_files(result){
	var params={
	    TableName: 'FILES',
	    Key: {
	        'fileId': result.fileId,
	        'fileOrder': result.fileOrder
	    },
	    AttributesToGet: [ // optional (list of specific attribute names to return)
	        'fileS3Key',
			'fileS3Bucket',
			'fileType'
	    ],
	    ConsistentRead: false, // optional (true | false)
	};
	return new Promise((resolve,reject)=>{
		docClient.get(params, function(err, file) {
		    if(err){
				reject(err);
			}
			if(file.Item == undefined){
				reject("No such file");
			}
			// result['result']={};
			result['result']=file.Item;
			resolve(result);
		});
	});
}

/**
 * get Request file id from the S3
 * @param  {[type]} file [get file S3 link]
 * @return {[type]}      [return the promise either reject with error and resolve with error]
 */
function getRequest_Url(data,response){
	var params = {
		Bucket:data.fileS3Bucket,
		Key:data.fileS3Key+"."+data.fileType,
		Expires: 360
	};
	console.log(params);
	if( mode == "offline"){
		/** convert to the params in minio format */
		
		S3.presignedGetObject(params.Bucket, params.Key, params.Expires,function(err,url){
			if(err){
				console.log(err);
				response({err:{"err":"Some Thing went wrong"}});
			}else{
				if(url == undefined){
					response({err:{"err":"Cannot able to located the file"}});
				}
				response({url});
			}
		});
	}else{
		S3.getSignedUrl('getObject',params,function(err,url){
			if(err){
				console.log(err);
				response({err:{"err":"Some Thing went wrong"}});
			}else{
				if(url == undefined){
					response({err:{"err":"Cannot able to located the file"}});
				}
				response({url});
			}
		});

	}
}

module.exports={execute};