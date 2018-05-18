/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 	= require('./lib/response.js')
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
const Ajv 			  = require('ajv')
const setupAsync 	= require('ajv-async')
const ajv 		    = setupAsync(new Ajv())

var deleteSchema = {
  $async:true,
  type: "object",
  properties: {
      userid : {
          type : "string",
          pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      },
      createdAt : {
          type: "number",       
      },
  },
  required : ["userid", "createdAt"]
}

const validate = ajv.compile(deleteSchema)

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) { // console.log(data)
<<<<<<< HEAD
=======
  if (typeof data === 'string') {
    data = JSON.parse(data)
  }
>>>>>>> development-vinay
  validate_all(validate, data)
    .then(function (result) {
      return delete_help(result)
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
function validate_all (validate, data) { // console.log(data)
<<<<<<< HEAD
  if (typeof data === 'string') {
    data = JSON.parse(data)
  }
=======
>>>>>>> development-vinay
  return new Promise((resolve, reject) => {
    validate(data).then(function (res) {
		    resolve(res)
    }).catch(function (err) {
		  console.log(JSON.stringify(err, null, 6))
		  reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}

function delete_help (result) { 
  var params = {
    TableName: database.Table[0].TableName,
    Key: {
        "userid": result.userid,
        "createdAt": result.createdAt,
    },
    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
  }
  return new Promise(function(resolve, reject) {
    docClient.delete(params, function(err, data) {
        if (err) {
            console.error("Unable to delete. Error:", JSON.stringify(err, null, 2));
            reject(err.message)
        }else if(Object.keys(data).length == 0) {
            reject("no item found")
        } 
        else {
          result['result'] = {'message': 'deleted succeeded', data}
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
