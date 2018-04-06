///// ...................................... start default setup ............................................////
var mode,sns,dynamodb,docClient,S3;
var AWS = require('aws-sdk');
var response = require('./response.js');

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
var uuid = require('uuid');
//call another lambda
var execute_lambda = require('./lambda')('sample2');

exports.handler = function  (event,context,callback) {
	//promise function calls that will be passed as list of function 
	/**
	 * execute nother lambda function
	 */
		// execute_lambda.run(event,function(err,data){
		// 	if(err){
		// 		console.log(err);
		// 		response({"err":"someerror occeured"},callback);
		// 	}
		// 	response({"body":"asdasdasd"},callback);
		// })
	 
	/**
	 * sns 
	 */
		 // sns.publish({
		 // 	TopicArn: "arn:aws:sns:us-west-2:123456789012:Email",
		 // 	Message: "eventText", 
   //      	Subject: "Test SNS From Lambda",
		 // },function(err,data){
		 // 	console.log(err,data);
		 // });
	
	/**
	 * S3
	 * Note - before run docker to open minio(development purposes)
	 */
		// S3.PutObject("hello world",(err,data)=>{
		// 
		// })
	
	/**
	 * dynamodb docClient
	 * Note - Start dynamodb server
	 */
		 // docClient.query({},(err,data)=>{
		 // 	console.log(err,data);
		 // })
	
	/**
	 * send response to the server
	 */
	 // response({"code":200,"body":"asdlkansdnas","headers":{}},callback)
	 // a().then(function(data){
	 // 	console.log(data);
	 // }).catch(function(err){
	 // 	console.log(err);
	 // })

}

// function a(){
// 	return new Promise((resolve,reject)=>{
// 		// reject("some error occured")
// 		resolve("done");
// 	});
// }
