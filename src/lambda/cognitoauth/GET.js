///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk');
const response 	= require('./lib/response.js');
<<<<<<< HEAD
const database 	= require('./lib/database')

=======
AWS.config.region 	= "eu-central-1";
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()
>>>>>>> development-vinay

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
<<<<<<< HEAD

module.exports={execute};
=======
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const getSchema = {
  "$async":true,
  "type":"object",
  "required":["RefreshToken"],
  "additionalProperties": false,
  "properties":{
    "RefreshToken":{"type":"string"},
    "clientId":{"type":"string"},
    "userpool":{"type":"string"}
  }
};

const validate = ajv.compile(getSchema);

>>>>>>> development-vinay

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
<<<<<<< HEAD
function execute(data,callback) {
	login_details()
		.then(function(result) {
				response({code:200, body:result}, callback);
		})
		.catch(function(err) {
			response({code:400, err:{err}}, callback);
		})
}

function login_details() {
	return new Promise((resolve,reject)=>{
		var params = {
			TableName: database.Table[0].TableName,
			KeyConditionExpression: '#HASH = :value', 
			ExpressionAttributeNames : {
				'#HASH'  : 'status',
			},
			ExpressionAttributeValues: { 
			  ':value': 'active',
			},
			// Limit: 20,
		};
		docClient.query(params, function(err, data) { 
			if (err) {
				console.log(err);
				reject(err)
			}
			else if(data.Items.length == 0) {
				reject('no user loggedin details found')
			}
			else { 
				resolve({'message' : data.Items}) 
			} 
=======

function execute(data,callback){
	validate_all(validate,data)
		.then(function(result){
			return general(result);
		})
		.then(function(result){
				response({code:200,body:result},callback);
		})
		.catch(function(err){
			response({code:400,err:{err}},callback);
		})
}

function general(data){
	return new Promise((resolve,reject)=>{
		var params={
			AuthFlow: "REFRESH_TOKEN",
			ClientId: data.clientId,
			UserPoolId: data.userpool,
			AuthParameters: {
			    'REFRESH_TOKEN': data.RefreshToken
			}
		};
		if(data.contextdata != undefined){
			params.ContextData = data.ContextData;
		}
		cognitoidentityserviceprovider.adminInitiateAuth(params, function(err, data) {
		  if (err) reject(err.message) // an error occurred
		  else resolve(data);           // successful response
>>>>>>> development-vinay
		});
	})
}

<<<<<<< HEAD
=======
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
 * last line of code
 * @type {Object}
 */
module.exports={execute};
//code deployed on the aws
>>>>>>> development-vinay
