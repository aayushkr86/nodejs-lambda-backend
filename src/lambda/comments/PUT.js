///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk');
const response 	= require('./lib/response.js');
const database 	= require('./lib/database.js');

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
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);

const updateSchema = {
    "$async":true,
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "fileId" : { "type": "string"},
        "fileOrder": {"type":"number"},
        "commentOrder" : { "type": "number" },
        "refLocation" : {
            "type": "object",
            "addionalProperties":true
        },
        "commentText" : { "type": "string" },
        "reply" : {"type":"string" },
        "replypos":{"type":"number"},
        "tags" : {
            "type":"object",
            "properties":{
                "userid":{"type":"string"},
                "links":{"type":"array"}
            }
        }
    },
    "required" : ["fileId","fileOrder", "commentOrder"]
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
		try{
			data = JSON.parse(data);
		}catch(e){
			response({code:400,err:{err:"Parameters are invalid"}},callback);
		}
	}
	validate_all(validate,data)
		.then(function(result){
			if(data.replypos != undefined ){
				if(data.reply != undefined){
					return update_reply(result);
				}else{
					return new Promise((resolve,reject)=>{
						reject("Parameters in reply is wrong");
					})
				}
			}else if(data.commentText != undefined){
				return update_comments(result);
			}else{
				return new Promise((resolve,reject)=>{
					reject("Nothing to change");
				})
			}
		})
		// .then(function(another_result){
		// 	return another_result(another_result)
		// })
		// .then(function(series_execution){
		// 	return new Promise((resolve,reject){
		// 		reject()
		// 	})
		// })
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
function validate_all(validate,data){
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
 * [delete_reply ]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function update_reply(data){
	return new Promise((resolve,reject)=>{
		//change particular reply message with another
		var params = {
		    TableName: 'comments',
		    Key: {
		        "commentId": data.fileId+data.fileOrder,
		        "commentOrder": data.commentOrder
		    },
		    UpdateExpression: 'SET reply['+data.replypos+'] =:value',
		    ConditionExpression: 'resolved=:resolved',
		    ExpressionAttributeValues: { // a map of substitutions for all attribute values
		        ':value': [{
		        	"data":data.reply,
		        	"tags":data.tags,
		        	"userid":"anonymus",
		        	"createdAt":new Date().toISOString()
		        }],
		        ':resolved': false
		    },
		    ReturnValues: 'ALL_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
		    // ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		    // ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
		};
		docClient.update(params, function(err, data) {
		    if(err){
		    	reject(err.message);
		    }else{
		    	if(data.Attributes == null){
		    		reject("Something went wring");
		    	}else{
		    		var response={
		    			"data":"Successfully updated",
		    			"items":data.Attributes
		    		}
		    		resolve(response);
		    	}
		    }
		});
	});
}

/**
 * delete comments
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function update_comments(data){
	if(data.reply){
		delete data.reply;
	}
	//now go throw the process update all the things
	var update_expression = "SET";
	first = false;
	for(key in data){
		if(first){
			update_expression +=",";
		}
		if(key != "fileId" && key != "fileOrder" && key != "commentOrder"){
			update_expression += " "+key+"= :"+key;
			data[":"+key]=data[key];
			delete data[key];
			first = true;
		}
	}
	data[':resolved']=false;
	
	return new Promise((resolve,reject)=>{
		var params = {
		    TableName: database.Table[0].TableName,
		    Key: { 
		    	"commentId": data.fileId + data.fileOrder,
		    	"commentOrder": data.commentOrder
		    },
		    UpdateExpression: update_expression,
		    ConditionExpression: 'attribute_exists(commentOrder) AND resolved=:resolved',
		    ExpressionAttributeValues: data,
		    ReturnValues: 'ALL_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
		    // ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		    // ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
		};
		delete data.fileId;
		delete data.fileOrder;
		delete data.commentOrder;
		console.log(params);
		docClient.update(params, function(err, data) {
		    if(err){
		    	reject(err.message);
		    }
		    if(data.Attributes == null){
		    	reject("Something went wring");
		    }else{
		    	var response={
		    		"data":"Successfully updated",
		    		"items":data.Attributes
		    	}
		    	resolve(response);
		    }
		    
		});
	});
}


module.exports={execute};