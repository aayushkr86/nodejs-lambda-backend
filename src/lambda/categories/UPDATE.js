///// ...................................... start default setup ............................................////
// let mode,sns,dynamodb,docClient,S3;
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
  	"required": [ "id","name"],
	"type":"object",
  	"properties":{
    	"id":{"type":"string"},
		"listNumbers":{"type":"number"},
    	"name":{"type":"string"},
    	"description":{"type":"string"},
    	"thumbnailId":{"type":"string"}
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
	validate_all(validate,data)
		.then(function(result){
			return update_categories(result);
		})
		.then(function(result){
			console.log("result");
			response({code:200,body:result.result},callback);
		})
		.catch(function(err){
			console.log(err);
			response({code:400,err:err},callback);
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

function update_categories(result){
	// change the attribute_name accordingly
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

		return new Promise((resolve,reject)=>{
			docClient.put(params,function(err,message){
				if(err){
					reject(err.message);
				}
				result['result']={"message":"Inserted Successfully"};

				resolve(result);
			})
		});
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

