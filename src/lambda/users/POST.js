/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk')
const response 	= require('./lib/response.js')
const database 	= require('./lib/database')

if (process.env.AWS_REGION == 'local') {
  mode 		= 'offline'
//   sns 	= require('../../../offline/sns');
  docClient = require('../../../offline/dynamodb').docClient
  S3 		= require('../../../offline/S3');
  dynamodb 	= require('../../../offline/dynamodb').dynamodb;
} else {
  mode 		= 'online'
  // sns 	= new AWS.SNS();
  docClient = new AWS.DynamoDB.DocumentClient({})
  S3 		= new AWS.S3();
  dynamodb 	= new AWS.DynamoDB();
}
/// // ...................................... end default setup ............................................////

/**
 * modules list
 */
const uuid 		 = require('uuid')
const async      = require('async')
const Ajv 	     = require('ajv')
const setupAsync = require('ajv-async')
const ajv 		 = setupAsync(new Ajv())

var postSchema = {
  $async:true,
  type: "object",
  properties: {
    'username' : {
        type: "array",
    },
  },
  required : ["username"]
}

var validate = ajv.compile(postSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) { 
    validate_all(validate, data)
    .then(function (result) { 
      return getBatchUsers(result)
    })
    .then(function (result){ 
      response({code: 200, body: result}, callback)
    })
    .catch(function (err){
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
    }).catch(function (err) {
        console.log(JSON.stringify(err, null, 6))
        reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}

function getBatchUsers(result) { 
    var keys= []
    result.username.forEach((key)=>{
        key = {
            'username' : key
        }
        keys.push(key)
    });
    return new Promise((resolve, reject)=>{
        var Table = database.Table[0].TableName;
        var params = {
            RequestItems: { 
                'users': {
                    Keys: keys,
                    AttributesToGet: [ 
                        'firstname',
                        'lastname',
                        'profilepic_url',
                        'username',
                        'email'    
                    ],
                    ConsistentRead: false, 
                },
            },
            ReturnConsumedCapacity: 'NONE', 
        };
        docClient.batchGet(params, function(err, data) { 
            if (err) {
                console.log(err);
                reject(err)
            }
            else {
                resolve(data.Responses) 
            } 
        });
    })
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
