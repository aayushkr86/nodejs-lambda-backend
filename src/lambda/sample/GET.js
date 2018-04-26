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

//modules defined here
const uuid 		= require('uuid');
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

//-----------For reference
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
//}
// function a(){
// 	return new Promise((resolve,reject)=>{
// 		// reject("some error occured")
// 		resolve("done");
// 	});
// }
