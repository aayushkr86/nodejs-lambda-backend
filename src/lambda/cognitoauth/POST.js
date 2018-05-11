///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk');
const response 		= require('./lib/response.js');
AWS.config.region 	= "eu-central-1";
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()
const database 	= require('./lib/database')

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
var jwt             = require('jsonwebtoken');

const PostSchema = {
  "$async":true,
  "type":"object",
  "required":["clientId","userpool","username","password"],
  "properties":{
    "clientId":{"type":"string"},
    "userpool":{"type":"string"},
    "username":{"type":"string"},
    "password":{"type":"string"}
  }
};

const validate = ajv.compile(PostSchema);

//call another lambda
// const execute_lambda = require('./lib/lambda')('sample2');

module.exports={execute};

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback) {
	// console.log(data);
	if(typeof data == "string"){
		try{
			data = JSON.parse(data);
		}catch(excep){
			delete data;
		}
	}
	validate_all(validate,data)
		.then(function(result){
			return login(result);
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
			// console.log(res);
		    resolve(res);
		}).catch(function(err){
		//   console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

/**
 * login
 * @param  {[type]} data data=> username,password,clientId,userpool,contextdata
 * @return {[type]}      resolve
 */
function login(data) {
	return new Promise((resolve,reject)=>{
		var params={
			AuthFlow: "ADMIN_NO_SRP_AUTH",
			ClientId: data.clientId,
			UserPoolId: data.userpool,
			AuthParameters: {
			    'USERNAME': data.username,
		    	'PASSWORD':data.password
			}
		};
		if(data.contextdata != undefined) {
			params.ContextData = data.ContextData;
		}
		cognitoidentityserviceprovider.adminInitiateAuth(params, function(err, data) {
			if (err) {
				reject(err.message) // an error occurred
			}
			else {
			  	// console.log(data)
				const token = data.IdToken			  	
				const decode = jwt.decode(token)
				const username = decode['cognito:username']
				var params = {
					TableName: database.Table[0].TableName,
					Item: {
						"status" : "active",
						"loginAt" : new Date().getTime(),
						"id" : uuid.v1(),
						"username" : username 
					},
					ReturnValues: 'ALL_OLD',
				}
				docClient.put(params, function(err, data) {
					if (err) {
						console.error("Error:", JSON.stringify(err, null, 2));
					} else {
						console.log(username +'Successfully logged in');
					}
				}) 
			  	resolve(data);           
		 	}
		});
	})
}
