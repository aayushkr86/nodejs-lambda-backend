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
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const updateSchema = {
  "$async":true,
  "type":"object",
  "additionalProperties": false,
  "required": [ "folderId","folderOrder" ],
  "properties":{
    "folderId":{"type":"string"},
    "folderOrder":{"type":"number"},
    "folderName":{"type":"string"},
    "folderDescription":{"type":"string"},
    "folderThumbnailId":{"type":"string"},
    "newfolderOrder":{"type":"number"}
  }
};

const validate = ajv.compile(updateSchema);

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	if(typeof data == "string"){
		data = JSON.parse(data);
	}
	validate_all(validate,data)
		.then(function(result){
			return JSON_to_querystring(result);
		})
		.then(function(result){
			return update_categories(result);
		})
		.then(function(result){
			console.log("result");
			response({code:200,body:result.result},callback);
		})
		.catch(function(err){
			console.log(err);
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

function JSON_to_querystring(result){
	return new Promise((resolve,reject)=>{
		let querystring="";
		let queryvalue = {};
		let count=0;
		for(key in result){
			if(key != "folderId" && key != "folderOrder"){
				++count;
				if(count>1){
					querystring+=" ,";
				}
				querystring+=""+key +"=:"+key;
				queryvalue[":"+key]=result[key]
			}
		}
		if(querystring == ""){
			reject("Nothing to update");
		}else{
			result['querystring']=querystring;
			result['queryvalue']=queryvalue;
			resolve(result);
		}
	})
}

function update_categories(result){
	// change the attribute_name accordingly
	    var params = {
		    TableName: database.Table[0].TableName,
		    Key: {
		    	folderId: result.folderId,
		    	folderOrder: result.folderOrder      
		    },
		    UpdateExpression: 'SET '+result.querystring,
		    ExpressionAttributeValues:result.queryvalue,
		    ConditionExpression: 'attribute_exists(folderId) AND attribute_exists(folderOrder)'
		};
		console.log(params);
		return new Promise((resolve,reject)=>{
			docClient.update(params,function(err,message){
				if(err){
					reject(err.message);
				}
				result['result']={"message":"Updated Successfully"};
				resolve(result);
			})
		});
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

