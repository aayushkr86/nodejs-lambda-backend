/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')
const database 	= require('./lib/database')

if (process.env.AWS_REGION == 'local') {
  mode 			= 'offline'
  // sns 		= require('../../../offline/sns');
  docClient = require('../../../offline/dynamodb').docClient
  S3 			  = require('../../../offline/S3');
  dynamodb 	= require('../../../offline/dynamodb').dynamodb;
} else {
  mode 			= 'online'
  // sns 		= new AWS.SNS();
  docClient = new AWS.DynamoDB.DocumentClient({})
  S3 			  = new AWS.S3();
  dynamodb 	= new AWS.DynamoDB();
}
/// // ...................................... end default setup ............................................////

/**
 * modules list
 */
var jwt = require('jsonwebtoken')

function authorization(token) { //console.log(token)
  return new Promise ((resolve, reject)=>{
      var decode = jwt.decode(token)
      if(!decode){
          return reject('no authorization token provided')
      }else if(decode['cognito:username'] == undefined){
          return reject('cognito username not found in the token')
      }
      result = {username : decode['cognito:username'] }
      resolve(result)
  })  
}

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (event, callback) {
    authorization(event.headers.Authorization) 
    .then(function (result) {
      return userInfo(result)
    })
    .then(function (result) {
      response({code: 200, body: result}, callback)
    })
    .catch(function (err) {
      console.log(err)
      response({code: 400, err: {err}}, callback)
    })
}

function userInfo (result) { 
  return new Promise((resolve, reject)=>{
    var params = {
        TableName: database.Table[0].TableName,
        KeyConditionExpression: 'username = :value', 
        ExpressionAttributeValues: { 
            ':value': result.username
        },
    };
    docClient.query(params, function(err, data) { 
        if (err) {
            console.log(err);
            return reject(err)
        }
        else if(data.Items.length == 0) {
            return reject('no user found')
        }
        else { 
            resolve({'message' : data.Items[0]}) 
        } 
    });
  })
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
