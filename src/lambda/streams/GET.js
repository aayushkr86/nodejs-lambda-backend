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
var getSchema = {
	$async:true,
	type: "object",
	properties: {
	id : {
			type: "string",
			enum : ['en_1_0','en_1_1']
	},
	date : {
			type: "string",
			format: "date",
	},
	LastEvaluatedKey:{
			type:"object",
			properties:{
			id:{
					type:"string"
			},
			date:{
					type:"number"
			}
			}
	}
	},
	required : ["id", "date"]
}

validate = ajv.compile(getSchema);
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	validate_all(validate,data)
		.then(function(result){
			return get_streams(result);
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

function get_streams(result) {
	var date = "2018-04-15"
	var from = date+" 00:00:00"
	var to = date+" 23:59:59"

	var params = {
			TableName: 'streams',
			KeyConditionExpression: 'id = :value and #dt BETWEEN :from AND :to', 
			ExpressionAttributeNames: { 
					'#dt': 'date'
			},
			ExpressionAttributeValues: { 
				':value': 'en_1_0',
				":from": new Date(from).getTime(),
				":to":   new Date(to).getTime(),
			},
			ScanIndexForward: false, 
			Limit: 5,
			// ExclusiveStartKey :{
			//     id: 'en_1_0', date: 1523771296000 
			// }
	};
	var params1 = {
			TableName: 'streams',
			KeyConditionExpression: 'id = :value and #dt BETWEEN :from AND :to', 
			ExpressionAttributeNames: { 
					'#dt': 'date'
			},
			ExpressionAttributeValues: { 
				':value': 'en_1_1',
				":from": new Date(from).getTime(),
				":to":   new Date(to).getTime(),
			},
			ScanIndexForward: false, 
			// Limit: 1,
	};
		
	return new Promise(function(resolve, reject) { 
		async.waterfall([
				function(done) {
						docClient.query(params, function(err, data) {
								if (err) {
										console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
										done(true, err)
								} else { 
										done(null, data) 
								}
						})    
				},
				function(publish,done) {
						docClient.query(params1, function(err, data) {
								if (err) {
										console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
										done(true, err)
								} else {
										done(null, publish, data) 
								}
						})
				},
				function(publish, show_first) { 
						show_first.Items.forEach(function(elem){ 
								publish.Items.unshift(elem)
						})
						console.log(publish.Items.length)
						if(publish.Items.length == 6){
								publish.Items.splice(5,1);
								publish.LastEvaluatedKey.date = publish.Items[4].date
								publish.LastEvaluatedKey.id   = publish.Items[4].id
						}
				resolve(publish)
				}
				],function(err,data) { 
				reject(data)
				})
	});
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

