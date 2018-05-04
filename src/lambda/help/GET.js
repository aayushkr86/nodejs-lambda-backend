/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')
const database 	= require('./lib/database')

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
const uuid 			 = require('uuid')
const async      = require('async')
const Ajv 			 = require('ajv')
const setupAsync = require('ajv-async')
const ajv 			 = setupAsync(new Ajv())

var getSchema = {
  $async:true,
  type: "object",
  properties: {
      status : {
          type: "string",
          enum : ['open','inprogress','resolved','unresolved']
      },
  LastEvaluatedKey:{
      type:"object",
      properties:{
          userid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          },
          createdAt : {
              type : "number"
          },
          uuid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          },
          status : {
              type: "string",
              enum : ['open','inprogress','resolved','unresolved']
          },
      },
      required : ["userid","createdAt","uuid","status"]
  }
  },
  required : ["status"]
}

var validate = ajv.compile(getSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) {
  if(data['LastEvaluatedKey.userid'] && data['LastEvaluatedKey.createdAt'] &&
     data['LastEvaluatedKey.uuid']   && data['LastEvaluatedKey.status']) {
    LastEvaluatedKey = {
      'userid'    : data['LastEvaluatedKey.userid'],
      'createdAt' : parseInt(data['LastEvaluatedKey.createdAt']),
      'uuid'      : data['LastEvaluatedKey.uuid'],
      'status'    : data['LastEvaluatedKey.status']
    };
    data.LastEvaluatedKey = LastEvaluatedKey
  }
  else if(!data['LastEvaluatedKey.userid'] && !data['LastEvaluatedKey.createdAt'] &&
          !data['LastEvaluatedKey.uuid']   && !data['LastEvaluatedKey.status']) {
  }
  else if(!data['LastEvaluatedKey.userid'] || !data['LastEvaluatedKey.createdAt'] ||
          !data['LastEvaluatedKey.uuid']   || !data['LastEvaluatedKey.status']) { 
    return response({code: 400, err: {"error":"both LastEvaluatedKey.userid,LastEvaluatedKey.createdAt,LastEvaluatedKey.uuid,LastEvaluatedKey.status are required"}}, callback)
  }
  validate_all(validate, data)
    .then(function (result) {
      return get_helps(result)
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

function get_helps (result) { 
  var params = {
    TableName: database.Table[0].TableName,
    IndexName: 'statusIndex',
    KeyConditionExpression: '#HASH = :value',  
    ExpressionAttributeNames : {
        '#HASH'  : 'status',
    },
    ExpressionAttributeValues: { 
      ':value': result.status,
    },
    ScanIndexForward: false, 
    Limit: 5,
  };
  if (result.LastEvaluatedKey != undefined) { 
    params.ExclusiveStartKey = result.LastEvaluatedKey;
  }
  return new Promise(function(resolve, reject) { 
    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            reject(err.message);
        } 
        else if (data.Items.length == 0){
          reject("no item found");
        } 
        else {
            // console.log("Query succeeded",data);
            result['result'] = {'items': data.Items, LastEvaluatedKey : data.LastEvaluatedKey}
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
