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
	S3 			= new AWS.S3();
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
  "required":["fileId"],
  "additionalProperties": false,
  "properties":{
    "fileId":{"type":"string"},
    "LastEvaluatedKey":{
      "type":"object",
      "additionalProperties": false,
      "properties":{
        "fileId":{"type":"string"},
        "fileOrder":{"type":"number"}
      }
    }
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
	if(data != undefined && data.LastEvaluatedKey != undefined){
		try{
			data.LastEvaluatedKey = JSON.parse(data.LastEvaluatedKey);
		}catch(e){
			console.log("cannot be able to process the LastEvaluatedKey");
			delete data.LastEvaluatedKey;
		}
	}
	
	validate_all(validate,data)
		.then(function(result){
			return get_files(result);
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

function get_files(result){
	var params = {
	    TableName: 'FILES',
	    KeyConditionExpression: '#HASH = :HASH_VALUE and #RANGE > :RANGE_VALUE',
	    ExpressionAttributeNames: {
	        '#HASH': 'fileId',
	        "#RANGE": 'fileOrder'
	    },
	    ExpressionAttributeValues: {
	      ':HASH_VALUE': result.fileId,
	      ':RANGE_VALUE': 0
	    },
	    ExclusiveStartKey:result.LastEvaluatedKey,
	    ScanIndexForward: true, // optional (true | false) defines direction of Query in the index
	    Limit: 5, // optional (limit the number of items to evaluate)
	    ConsistentRead: false
	};
	
	return new Promise((resolve,reject)=>{
		docClient.query(params,function(err,folder){
			if(err){
				reject(err);
			}
			
			result['result']={};
			result.result['items']=folder.Items;

			resolve(result);
		})
	});
}

module.exports={execute};