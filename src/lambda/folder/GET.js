///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk');
const response 		= require('./lib/response.js');
const database 		= require('./lib/database.js');

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
// const uuid 			= require('uuid');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const getSchema = {
  "$async":true,
  "type":"object",
  "required":["folderId"],
  "properties":{
    "folderId":{"type":"string"},
    "lastEvaluatedKey":{
      "type":"object",
      "additionalProperties": false,
      "properties":{
        "folderId":{"type":"string"},
        "folderOrder":{"type":"number"}
      }
    }
  }
};

const validate = ajv.compile(getSchema);
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	if(data['lastEvaluatedKey.folderId'] != undefined && data['lastEvaluatedKey.folderOrder'] != undefined){
		data.lastEvaluatedKey={
			"folderId": data['lastEvaluatedKey.folderId'],
			"folderOrder": parseInt(data['lastEvaluatedKey.folderOrder'])
		}
	}
	console.log(data);
	validate_all(validate,data)
		.then(function(result){
			return get_categories(result);
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
			console.log(res);
		    resolve(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

function get_categories(result){
	console.log(result);
	var params = {
	    TableName: database.Table[0].TableName,
	    KeyConditionExpression: '#HASH = :HASH_VALUE and #RANGE > :RANGE_VALUE',
	    ExpressionAttributeNames: {
	        '#HASH': 'folderId',
	        "#RANGE": 'folderOrder'
	    },
	    ExpressionAttributeValues: {
	      ':HASH_VALUE': result.folderId,
	      ':RANGE_VALUE': 0
	    },
	    ExclusiveStartKey:result.lastEvaluatedKey,
	    ScanIndexForward: true, // optional (true | false) defines direction of Query in the index
<<<<<<< HEAD
	    Limit: 1, // optional (limit the number of items to evaluate)
=======
	    Limit: 10, // optional (limit the number of items to evaluate)
>>>>>>> development-vinay
	    ConsistentRead: false
	};
	
	return new Promise((resolve,reject)=>{
		docClient.query(params,function(err,folder){
			if(err){
				reject(err);
			}
			
			result['result']={};
			result.result['items']=folder.Items;
			result.result['lastEvaluatedKey']=folder.LastEvaluatedKey;

			resolve(result);
		})
	});
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

