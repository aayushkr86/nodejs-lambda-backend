
var mode,sns,dynamodb,docClient,S3;

var AWS = require('aws-sdk');
var uuid = require('uuid');

if(AWS.Region == undefined){
	mode = "offline";
	sns 		= require('../../../offline/sns');
	docClient 	= require('../../../offline/dynamodb').docClient;
	// dynamodb = require('../../../offline/dynamodb').dynamodb;
	S3 			= require('../../../offline/S3');
	
}else{
	mode = "online";
	sns = new AWS.SNS();
	// dynamodb = new AWS.DynamoDB();
	docClient = new AWS.DynamoDB.DocumentClient({});
	S3 = new AWS.S3({
		s3ForcePathStyle: true,
    	endpoint: new AWS.Endpoint('http://localhost:8000')
    });
}

//offline
//online
exports.handler = function  (event,context,callback) {
	console.log(uuid.v4());
	console.log(S3);
	// S3.putObject({
	// 	Bucket: 'local-bucket',
 //    	Key: '1234',
 //    Body: new Buffer('abcd')
	// },function(err,grab){
	// 	console.log(arguments);
	// })
}

/*
var data={};
		var body = event.body;
		/**
		 * All request vise action (module wise for every request)
		 * Module wise Permission utils
		 * Now remainig functions
		 * Validitor (test case execution)
		 * response (error handled)
		 * 
		 */
/*
		callback(null,{
			statusCode: 300,
		    headers: {
		      'x-custom-header': 'my custom header value',
		      "Access-Control-Allow-Origin":"*"
		    },
		    body: JSON.stringify(data)
		});
		*/
