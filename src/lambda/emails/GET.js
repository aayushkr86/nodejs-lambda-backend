/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')

if (process.env.AWS_REGION == 'local') {
  mode 			= 'offline'
  // sns 			= require('../../../offline/sns');
  docClient 		= require('../../../offline/dynamodb').docClient
  // S3 			= require('../../../offline/S3');
  // dynamodb 	= require('../../../offline/dynamodb').dynamodb;
} else {
  mode 			= 'online'
  // sns 			= new AWS.SNS();
  docClient 		= new AWS.DynamoDB.DocumentClient({})
  // S3 			= new AWS.S3();
  // dynamodb 	= new AWS.DynamoDB();
}
/// // ...................................... end default setup ............................................////

/**
 * modules list
 */
const uuid 			= require('uuid')
const async = require('async')
const Ajv 			= require('ajv')
const setupAsync 	= require('ajv-async')
const ajv 			= setupAsync(new Ajv())
var getSchema = {
  $async:true,
  type: "object",
  properties: {
      status : {
          type: "string",
          enum : ['active']
      },
    LastEvaluatedKey:{
        type:"object",
        properties:{
          key : {
                type: "string",
            },
            status : {
                type: "string",
                enum : ['active']
            },
        },
        required : ["key", "status"]
    }
  },
}

var validate = ajv.compile(getSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) { 
  if(data['LastEvaluatedKey.key'] && data['LastEvaluatedKey.status']) {
    LastEvaluatedKey = {
      'key'    : data['LastEvaluatedKey.key'],
      'status' : data['LastEvaluatedKey.status']
    };
    data.LastEvaluatedKey = LastEvaluatedKey
  }
  else if(!data['LastEvaluatedKey.key'] && !data['LastEvaluatedKey.status']) {
  }
  else if(!data['LastEvaluatedKey.key'] || !data['LastEvaluatedKey.status']) {
    return response({code: 400, err: {"error":"both LastEvaluatedKey.key and LastEvaluatedKey.status are required"}}, callback)
  }
  validate_all(validate, data)
    .then(function (result) {
      return get_emails(result)
    })
    .then(function (result) {
      response({code: 200, body: result.result}, callback)
    })
    .catch(function (err) {
      console.log(err)
      response({code: 400, err: {err}}, callback)
    })
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate, data) { 
  return new Promise((resolve, reject) => {
    validate(data).then(function (res) {
		    resolve(res)
    }).catch(function (err) {
		  console.log(JSON.stringify(err, null, 6))
		  reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}

function get_emails (result) { 
  var params = {
    TableName: "emails",
    KeyConditionExpression: '#HASH = :value', 
    ExpressionAttributeNames : {
        '#HASH'  : 'status',
    },
    ExpressionAttributeValues: { 
      ':value': 'active',
    },
    // ScanIndexForward: false, 
    Limit: 5,
  };
  if (result.LastEvaluatedKey != undefined) {
    params.ExclusiveStartKey = result.LastEvaluatedKey;
  }
  // console.log(params)
  return new Promise(function(resolve, reject) { 
    docClient.query(params, function(err, data) { 
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            reject(err.message)
        }else if(data.Items.length == 0){
            reject("no item found")
        } 
        else {
            result['result'] = {'message': data}
            resolve(result)
        }
    })    
  })
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
