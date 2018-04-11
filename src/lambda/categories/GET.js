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
const schema ={
	"$async":true,
	"type":"object"
};
const validate 		= ajv.compile(schema);

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	validate_categories(data)
		.then(function(result){
			return get_categories(result);
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
function validate_categories (data) {
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
	var params = {
	    TableName: 'FOLDERS',
	    KeyConditionExpression: '#HASH = :HASH_VALUE and #RANGE > :RANGE_VALUE',
	    ExpressionAttributeNames: {
	        '#HASH': 'id',
	        "#RANGE": 'listNumbers'
	    },
	    ExpressionAttributeValues: {
	      ':HASH_VALUE': 'categories',
	      ':RANGE_VALUE': 0
	    },
	    ScanIndexForward: true, // optional (true | false) defines direction of Query in the index
	    Limit: 10, // optional (limit the number of items to evaluate)
	    ConsistentRead: false
	};
	
	return new Promise((resolve,reject)=>{
		docClient.query(params,function(err,categories){
			if(err){
				reject(err);
			}
			result['result']=categories;

			resolve(result);
		})
	});
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

