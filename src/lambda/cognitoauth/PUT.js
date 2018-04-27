///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk');
const response 		= require('./lib/response.js');
AWS.config.region 	= "eu-central-1";
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()

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
// const uuid 		= require('uuid');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const PutSchema = {
  "$async":true,
  "type":"object",
  "required":["clientId","username","password"],
  "properties":{
    "clientId":{"type":"string"},
    "username":{"type":"string"},
    "password":{"type":"string"}
  }
};

const validate = ajv.compile(PutSchema);

//call another lambda
// const execute_lambda = require('./lib/lambda')('sample2');

module.exports={execute};

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	console.log(data);
	if(typeof data == "string"){
		try{
			data = JSON.parse(data);
		}catch(excep){
			delete data;
		}
	}
	validate_all(validate,data)
		.then(function(result){
			return signup(result);
		})
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
 * signup
 * @param  {[type]} data data => username,password,clientId,userpool,
 * @return {[type]}      [description]
 */
function signup(data){
	return new Promise((resolve,reject)=>{
		var params = {
		  ClientId: data.clientId, /* required */
		  Password: data.password, /* required */
		  Username: data.username, 
		  // UserAttributes: data.userattributes
		  // 
		  // SecretHash: 'STRING_VALUE',
		  // UserContextData: {
		  //   EncodedData: 'STRING_VALUE'
		  // },
		  // ValidationData: [
		  //   {
		  //     Name: 'STRING_VALUE',  required 
		  //     Value: 'STRING_VALUE'
		  //   },
		  //   /* more items */
		  // ]
		};
		if(data.userattributes != undefined){
			params.UserAttributes=[{
				Name:data.userattributes[0].attributeName,
				Value: data.userattributes[0].attributeValue
			}];
		}
		console.log(params);
		cognitoidentityserviceprovider.signUp(params, function(err, data) {
		  if (err) reject(err.message) // an error occurred
		  else resolve(data); 
		});
	})
}