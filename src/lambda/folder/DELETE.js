///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk');
const response 		= require('./lib/response.js');
const database 		= require('./lib/database');

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

const deleteSchema = {
  "$async":true,
  "type":"object",
  "additionalProperties": false,
  "required": [ "folderId","folderOrder" ],
  "properties":{
    "folderId":{"type":"string"},
    "folderOrder":{"type":"number"}
  }
};

const validate = ajv.compile(deleteSchema);

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
			return delete_categories(result);
		})
		.then(function(result){
			console.log(result);
			return find_parent_folder(result);
		})
		.then(function(result){
			console.log(arguments);
			if(result.decrease== undefined){
				return result;
			}else{
				return remove_folderCount(result);
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

/**
 * [delete_categories description]
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
function delete_categories(result){
	var params = {
	    TableName: database.Table[0].TableName,
	    Key: {
	    	"folderId":result.folderId,
	    	"folderOrder":result.folderOrder
	    }
	};
	console.log(params);
	return new Promise((resolve,reject)=>{
		docClient.delete(params,function(err,categories){
			if(err){
				reject(err.message);
			}
			result['result']={"message":"Deleted Successfully"};

			resolve(result);
		})
	});
}

/**
 * find_parent_folder description
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
function find_parent_folder(result){
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
				result['decrease']=content;
			}
			resolve(result);
		})
	})
}

/**
 * remove_folderCount description
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
function remove_folderCount(result){
	let decrease = result.decrease;
	var params = {
	    TableName: database.Table[0].TableName,
	    Key: {
	        folderId: decrease.folderId,
	        folderOrder: decrease.folderOrder  
	    },
	    UpdateExpression: 'SET folderSubCount = folderSubCount - :value', 
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

