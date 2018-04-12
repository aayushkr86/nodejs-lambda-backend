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
var postSchema = {
	$async:true,
	type: "object",
	properties: {
	id : {
			type: "string"
	},   
	uuid : {
			type: "string",
			pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
	},
	userid : {
			type: "string",
			pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
	},
	language:{
			type: "string" ,
			enum : ['en','de']
	},
	title : {
			type: "string",
			minLength: 5,
			maxLength: 50,
	},
	date : {
			type: "string",
			format: "date",
	},
	intro_text : {
			type: "string",
			minLength: 2,
			maxLength: 50,
	},
	news_text : {
			type: "string",
			minLength: 2,
			maxLength: 50,
	},
	image: {
			type: "string"
	},
	pdf: {
			type: "string"
	},
	publish: {
			type: "boolean"
	},
	show_at_first_place: {
			type: "boolean"
	}
	},
	required : ["userid", "title", "date", 'intro_text']
};

validate = ajv.compile(postSchema);
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	validate_all(validate,data)
		.then(function(result){
			return post_stream(result);
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
function validate_all (validate,data) {
	return new Promise((resolve,reject)=>{
		validate(data).then(function (res) {
		    resolve(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

function post_stream(result){
	var d = new Date();
	var x = "2018-04-15"
	var y = " "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()
	var z = x + y
	console.log(z)
	
	var params = {
			TableName: "streams",
			Item: {
					"id" : "en_1_0",
					"date"  : Date.parse(new Date(z)),
					"uuid" : "c7748f58-3bd9-11e8-b467-0ed5f89f718b",
					"userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
					"language" : "en",
					"title" : "asaaad",
					"intro_text" : "aaaaa",
					"news_text"  : "aaaaa",
					"image"      : "none",
					"pdf"        : "2018-04-04T07:58:36.145Z-pdf2.pdf",
					"publish"    : true,
					"show_at_first_place" : false,
					"createdAt" : new Date().getTime(),
					"updatedAt" : new Date().getTime()
			},
			ReturnValues: 'ALL_OLD',
	}
	
	return new Promise((resolve,reject)=>{
			docClient.put(params, function(err, data) {
			if (err) {
					console.error("Error:", JSON.stringify(err, null, 2));
					reject(err.message)
			} else {
					console.log("Item added:", data);
					resolve({"Successfully added new stream" : data})
			}
			})  
	});
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

