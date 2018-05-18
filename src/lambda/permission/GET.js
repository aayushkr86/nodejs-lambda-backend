///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk');
const response 	= require('./lib/response.js');
const database 	= require('./lib/database.js');

if(process.env.AWS_REGION == "local"){
	mode 		= "offline";
	neo4j		= require('../../../offline/Neo4j');
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

const validate 		= require('./helper/model_validator.js');
const ADD 			= require('./helper/ADD')(neo4j);
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	console.log(neo4j);
	var data={
		"model":"Projects",
		"edge":"Modules",
		"data_model":{
			"Name":"asd",
			"CreatedAt":"pro"
		},
		"data_relation":{
		},
		"data_edge":{
			"Name":"asd",
			"CreatedAt":"asdasdsd"
		}
	};
	validate(data).then(function(r){
		console.log(r)
		return ADD(r,false);
	}).catch(function(e){
		console.log(e);
	})
}

/**
 * last line of code
 * @type {Object}
 */
module.exports={execute};
