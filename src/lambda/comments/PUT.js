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

const updateSchema = {
    "$async":true,
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "fileId" : { "type": "string"},
        "fileOrder": {"type":"number"},
        "commentOrder" : { "type": "number" },
        "location" : {
            "type": "object",
            "addionalProperties":true
        },
        "comment" : { "type": "string" },
        "reply" : {"type":"string" }
    },
    "required" : ["fileId","fileOrder", "commentOrder"]
};

const validate = ajv.compile(updateSchema);

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	if(typeof data == "string"){
		try{
			data = JSON.parse(data);
		}catch(e){
			response({code:400,err:{err:"Parameters are invalid"}},callback);
		}
	}
	validate_all(validate,data)
		.then(function(result){
			if(data.replypos != undefined ){
				return update_reply(result);
			}else{
				return update_comments(result);
			}
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
 * [delete_reply ]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function update_reply(data){
	return new Promise((resolve,reject)=>{
		var params = {
		    TableName: database.Table[0].TableName,
		    Key: { 
		    	"commentId": data.fileId+data.fileOrder,
		    	"commentOrder": data.commentOrder
		    },
		    UpdateExpression: 'REMOVE reply['+data.replypos+']',
		    // ConditionExpression: 'attribute_exists(reply['+data.replypos+'])'
		};
		console.log(params);
		docClient.update(params, function(err, data) {
		    if(err){
		    	reject(err.message);
		    }else{
		    	var response={
		    		"data":"Successfully removed"
		    	}
		    	resolve(response);
		    }
		});
	});
}

/**
 * delete comments
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function update_comments(data){
	return new Promise((resolve,reject)=>{

		var params = {
		    TableName: 'table_name',
		    Key: { // The primary key of the item (a map of attribute name to AttributeValue)

		        attribute_name: attribute_value, //(string | number | boolean | null | Binary)
		        // more attributes...
		    },
		    UpdateExpression: 'SET attribute_name :value', // String representation of the update to an attribute
		        // SET set-action , ... 
		        // REMOVE remove-action , ...  (for document support)
		        // ADD add-action , ... 
		        // DELETE delete-action , ...  (previous DELETE equivalent)
		    ConditionExpression: 'attribute_exists(attribute_name)', // optional String describing the constraint to be placed on an attribute
		    ExpressionAttributeNames: { // a map of substitutions for attribute names with special characters
		        //'#name': 'attribute name'
		    },
		    ExpressionAttributeValues: { // a map of substitutions for all attribute values
		        ':value': 'VALUE'
		    },
		    ReturnValues: 'NONE', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
		    ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		    ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
		};
		docClient.update(params, function(err, data) {
		    if (err) ppJson(err); // an error occurred
		    else ppJson(data); // successful response
		});
	});
}


module.exports={execute};