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
var postSchema = {
  $async:true,
  type: "object",
  properties: {
      status : {
          type: "string",
          enum : ['active']
      },
      key : {
          type: "string",
          maxLength : 20,
          minLength : 5
      },
      subject : {
          type: "string",
          maxLength : 20,
          minLength : 4
      },
      body : {
          type: "string",
          maxLength : 200,
          minLength : 10
      },
      userid : {
          type: "string",
          pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      },
  },
  required : ["key", "subject", "body"]
}

var validate = ajv.compile(postSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) { //console.log(data)
  validate_all(validate, data)
    .then(function (result) {
      return post_email(result)
    })
    .then(function (result) {
      // console.log("result",result);
      response({code: 200, body: result.result}, callback)
    })
    .catch(function (err) {
      // console.log(err);
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
    validate(JSON.parse(data)).then(function (res) {
		    resolve(res)
    }).catch(function (err) { // console.log(err)
		  console.log(JSON.stringify(err, null, 6))
		  reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}

function post_email (result) {
  var params = {
    TableName: "emails",
    Item: {
        "status"    : "active",
        "key"       : result.key,
        "subject"   : result.subject,
        "body"      : result.body,
        "userid"    : result.userid,
        "createdAt" : new Date().getTime(),
        "updatedAt" : new Date().getTime()
    },
    ReturnValues: 'ALL_OLD',
  }
  return new Promise(function(resolve, reject) {
    docClient.put(params, function(err, data) {
    if (err) {
        console.error("Error:", JSON.stringify(err, null, 2));
        reject(err.message)
    } else {
        console.log("Item added:", data);
        result['result'] = {'message': 'Inserted Successfully'}
        resolve(result)
    }
    })  
  });
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
