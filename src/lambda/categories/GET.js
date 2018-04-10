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
const validator 	= require('schema-validator');

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	validate(data)
		.then(function(result){
			return somerandon(result);
		})
		.then(function(another_result){
			return another_result(another_result)
		})
		.then(function(series_execution){
			return new Promise((resolve,reject){
				reject(:asd)
			})
			
		})
		.catch(function(err){
			console.log(err);
		})
}
var schema = {
	type:"object",
	"properties":{
	}
};

function validate(data){
	return new Promise((resolve,reject)=>{
		//data object needs to be {} else reject
		if(typeof data == "object"){
			if(data == "")
		}
	})
}

/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};