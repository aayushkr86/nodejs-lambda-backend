			///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk');
const response 		= require('./lib/response.js');

if(process.env.AWS_REGION == "local"){
	mode 			= "offline";
	// sns 			= require('../../../offline/sns');
	docClient 		= require('../../../offline/dynamodb').docClient;
	// S3 			= require('../../../offline/S3');
	// dynamodb 	= require('../../../offline/dynamodb').dynamodb;
}else{
	mode 			= "online";
	// sns 			= new AWS.SNS();
	docClient 		= new AWS.DynamoDB.DocumentClient({});
	// S3 			= new AWS.S3();
	// dynamodb 	= new AWS.DynamoDB();
}
///// ...................................... end default setup ............................................////

/**
 * modules list
 */
const uuid 			= require('uuid');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const postSchema = {
	"$async":true,
	"additionalProperties": false,
	"required": [ "folderId","folderOrder","folderName"],
	"type":"object",
	"properties":{
	    "folderId":{"type":"string"},
	    "folderOrder":{"type":"number"},
	    "folderName":{"type":"string"},
	    "folderDescription":{"type":"string"},
	    "folderThumbnailId":{"type":"string"}
	 }
};

const validate = ajv.compile(postSchema);

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	if(typeof data == "string"){
		data = JSON.parse(data);
	}
	validate_all(validate,data)
		.then(function(result){
			//default values
			result["folderSub"]=uuid.v4();
			result["folderSubCount"]=0;
			return post_categories(result);
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
			console.log("result");
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
		    resolve(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

function post_categories(result){
	var params = {
	    TableName: database.Table[0].TableName,
	    Item: result,
	    ConditionExpression: 'attribute_not_exists(folderOrder)'
	};
	
	return new Promise((resolve,reject)=>{
		docClient.put(params,function(err,categories){
			if(err){
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
		TableName: database.Table[0].TableName,
	    IndexName: 'folderSub-index',
	    KeyConditionExpression: 'folderSub = :value', 
	    ExpressionAttributeValues: { // a map of substitutions for all attribute values
	      ':value': result.folderId
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
	    TableName: database.Table[0].TableName,
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
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

