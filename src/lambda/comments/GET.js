///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk');
const response 	= require('./lib/response.js');
const database 	= require('./lib/database.js');

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
	S3 			= new AWS.S3();
	// dynamodb = new AWS.DynamoDB();
}
///// ...................................... end default setup ............................................////

//modules defined here
const uuid 		= require('uuid');
//call another lambda
// const execute_lambda = require('./lib/lambda')('sample2');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const getSchema = {
    "$async":true,
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "fileId" : {
            "type": "string",
        },
        "fileOrder":{
            "type":"number"
        },
        "resolved":{
        	"type":"boolean"
        },
        "ExclusiveStartKey":{
        	"type":"object",
        	"additionalProperties":true
        }
    },
    "required" : ["fileId","fileOrder"]
};

const validate = ajv.compile(getSchema);

module.exports={execute};

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	if(data.fileOrder){
		data.fileOrder = parseInt(data.fileOrder);
	}
	if(data.resolved == undefined){
		data.resolved = false;
	}
	if( data['exclusiveStartKey.commentId'] != undefined && data['exclusiveStartKey.commentOrder'] != undefined){
		data.ExclusiveStartKey={
			"commentId": data['exclusiveStartKey.commentId'],
			"commentOrder":data['exclusiveStartKey.commentOrder']
		};
		delete data['exclusiveStartKey.commentId'];
		delete data['exclusiveStartKey.commentOrder'];
	}
	validate_all(validate,data)
		.then(function(result){
			return list_comments(result);
		})
		// .then(function(another_result){
		// 	return another_result(another_result)
		// })
		// .then(function(series_execution){
		// 	return new Promise((resolve,reject){
		// 		reject()
		// 	})
		// })
		.then(function(result){
				response({code:200,body:result},callback);
		})
		.catch(function(err){
			response({code:400,err:{err}},callback);
		})
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all(validate,data){
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
 * show list of comments in the particular file
 * @param  {[type]} data [whole result]
 * @return {[type]}      [Promise with resolve result and reject with error message]
 */
function list_comments(data){
	return new Promise((resolve,reject)=>{
		if(data.fileId == ""){
			reject("Please enter valid fileId");
		}else{
			var params = {
			    TableName: database.Table[0].TableName,
			    KeyConditionExpression: 'commentId = :commentId',
			    FilterExpression: 'resolved=:resolved',
			    ExpressionAttributeValues: {
			      ':commentId': data.fileId+data.fileOrder,
			      ':resolved': data.resolved
			    },
			    ScanIndexForward: true,
			    Limit: 10,
			    ConsistentRead: false,
			    ReturnConsumedCapacity: 'NONE',
			    ExclusiveStartKey: data.ExclusiveStartKey
			};
			console.log(params);
			docClient.query(params, function(err, content) {
			    if (err){
			    	reject(err.message);
			    }else{
			    	var response={};
			    	console.log(content);
			    	response['items'] = content.Items;
			    	response['exclusiveStartKey:']=content.ExclusiveStartKey;
			    	resolve(response);
			    }
			});
		}
	});
}