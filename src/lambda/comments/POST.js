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

const postSchema = {
    "$async":true,
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "fileId" : {"type": "string"},
        "fileOrder": {"type":"number"},
        "commentOrder" : {"type": "number"},
        "reply" : {"type": "string"},
        "commentText" : {"type":"string"},
        "refLocation": {
            "type":"object",
            "addionalProperties":true
        },
        "tags" : {
        	"additionalProperties": false,
            "type":"object",
            "required":["userid"],
            "properties":{
                "userid":{"type":"string"},
                "links":{"type":"array"}
            }
        }
    },
    "required" : ["fileId","fileOrder","tags"]
};

const validate = ajv.compile(postSchema);

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
			result.createdAt = new Date().toISOString();
			result.userid = "anonymus";

			if(data.reply != undefined ){
				return add_reply(result);
			}else{
				return add_comment(result);
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

function add_comment(data){
	return new Promise((resolve,reject)=>{
		auto_inrement_comment(data)
			.then(function(data){
				console.log(data);
				return add_with_increment_comments(data);
			})
			.then(function(response){
				resolve(response);
			})
			.catch(function(e){
				reject(e);
			});
	})
}

function auto_inrement_comment(data){
	return new Promise((resolve,reject)=>{
		/*
		find the previous one and get the last element
		if not defined then 1 else +1
		 */
		var params = {
		    TableName: database.Table[0].TableName,
		    KeyConditionExpression: 'commentId = :value ', // a string representing a constraint on the attribute
		    ExpressionAttributeValues: { // a map of substitutions for all attribute values
		      ':value': data.fileId+data.fileOrder
		    },
		    ScanIndexForward: false, // optional (true | false) defines direction of Query in the index
		    Limit: 1, // optional (limit the number of items to evaluate)
		};
		console.log(params);
		docClient.query(params,function(err,data1){
			if(err){
				reject(err.message);
			}else{
				console.log(data1.Items[0]);
				if(data1.Items[0] != undefined && data1.Items[0].commentOrder){
					data.commentOrder = data1.Items[0].commentOrder+1;
				}else{
					data.commentOrder =1;
				}
				resolve(data);
			}
		})
	})
}
/**
 * show list of comments in the particular file
 * @param  {[type]} data [whole result]
 * @return {[type]}      [Promise with resolve result and reject with error message]
 */
function add_with_increment_comments(data){
	return new Promise((resolve,reject)=>{
		if(data.fileId == ""){
			reject("Please enter valid fileId");
		}else{
			var item =Object.assign({},data);
			//addition
				item.commentId = data.fileId+data.fileOrder;
				item.reply = [];
				item.resolved = false;
			//removed
				delete item.fileId;
				delete item.fileOrder;

			var params = {
			    TableName: database.Table[0].TableName,
			    Item: item,
			    ConditionExpression: 'attribute_not_exists(commentOrder)',
			    ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
			    // ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
			    // ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
			};
			console.log(params);
			docClient.put(params, function(err, data) {
			    if (err){
			    	reject(err.message);
			    }else{
			    	var response = {
			    		"data":"Successfully added"
			    	};
			    	resolve(response);
			    }
			});
		}
	});
}

/**
 * add reply if existing comments
 * @param {[type]} data [whole content]
 * @return {[type]}		[Promise with resolved and rejected with error message]
 */
function add_reply(data){
	return new Promise((resolve,reject)=>{
		var params = {
		    TableName: database.Table[0].TableName,
		    Key: {
		        "commentId": data.fileId + data.fileOrder,
		        "commentOrder": data.commentOrder
		    },
		    UpdateExpression: 'SET #reply = list_append(#reply,:value)',
		    ConditionExpression: 'attribute_exists(commentOrder)',
		    ExpressionAttributeNames: {
		      '#reply': 'reply'
		    },
		    ExpressionAttributeValues: {
		        ':value': [{
		        	"data":data.reply,
		        	"tags":data.tags,
		        	"userid":"anonymus",
		        	"createdAt": new Date().toISOString()
		        }]
		    },
		    ReturnValues: 'NONE'
		    // ReturnConsumedCapacity: 'NONE',
		    // ReturnItemCollectionMetrics: 'NONE',
		};
		console.log(params);
		docClient.update(params, function(err, data) {
		    if (err){
		    	reject(err.message);
		    }else{
		    	var response = {
		    		"data":"Successfully added"
		    	};
		    	resolve(response);
		    }
		});
	})
}

module.exports={execute};