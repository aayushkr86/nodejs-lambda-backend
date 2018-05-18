/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
<<<<<<< HEAD
const AWS 		= require('aws-sdk')
const response 	= require('./lib/response.js')
const database 	= require('./lib/database')

if (process.env.AWS_REGION == 'local') {
  mode 			= 'offline'
  // sns 		= require('../../../offline/sns');
  docClient 	= require('../../../offline/dynamodb').docClient
  // S3 		= require('../../../offline/S3');
  // dynamodb 	= require('../../../offline/dynamodb').dynamodb;
} else {
  mode 			= 'online'
  // sns 		= new AWS.SNS();
  docClient 	= new AWS.DynamoDB.DocumentClient({})
  // S3 		= new AWS.S3();
=======
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')
const database 	= require('./lib/database')
const email_database = require('../emails/lib/database')

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
>>>>>>> development-vinay
  // dynamodb 	= new AWS.DynamoDB();
}
/// // ...................................... end default setup ............................................////

/**
 * modules list
 */
<<<<<<< HEAD
const uuid 		 = require('uuid')
const async      = require('async')
const nodemailer = require('nodemailer')
const Ajv 	     = require('ajv')
const setupAsync = require('ajv-async')
const ajv 		 = setupAsync(new Ajv())
=======
const uuid 			  = require('uuid')
const async       = require('async')
const nodemailer  = require('nodemailer')
const Ajv 			  = require('ajv')
const setupAsync 	= require('ajv-async')
const ajv 			  = setupAsync(new Ajv())
>>>>>>> development-vinay

var postSchema = {
  $async:true,
  type: "object",
  properties: {
      userid : {
          type: "string",
          pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      },
      status : {
          type: "string",
          enum : ['open','inprogress','resolved','unresolved']
      },
      description : {
          type: "string",
      },
  },
  required : ["userid","status","description"]
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
      return post_help(result)
    })
    .then(function (result){ 
      return admin_email_notifications(result)
    })
    .then(function (result){ 
      return user_email_notifications(result)
    })
    .then(function (result){ 
      // console.log("result",result);
      response({code: 200, body: result.result}, callback)
    })
    .catch(function (err){
<<<<<<< HEAD
      console.log(err);
=======
      // console.log(err);
>>>>>>> development-vinay
      response({code: 400, err: {err}}, callback)
    })
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate, data) { 
<<<<<<< HEAD
    if (typeof data === 'string') {
        data = JSON.parse(data)
    }
  return new Promise((resolve, reject) => {
    validate(data).then(function (res) {
=======
  return new Promise((resolve, reject) => {
    validate(JSON.parse(data)).then(function (res) {
>>>>>>> development-vinay
		    resolve(res)
    }).catch(function (err) { // console.log(err)
		  console.log(JSON.stringify(err, null, 6))
		  reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}

function post_help (result) { 
  var params = {
    TableName: database.Table[0].TableName,
    Item: {
        "userid"      : result.userid,
        "createdAt"   : new Date().getTime(),
        "status"      : result.status,
        "uuid"        : uuid.v1(),
        "description" : result.description,
        "updatedAt"   : new Date().getTime()
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
        result['result'] = {'message': 'Tickets raised Successfully'}
        resolve(result)
    }
    })  
  });
}

function send_email(email_array, str) { 
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        // host: 'smtp.gmail.com',
        // port: 587,
        // secure: false, // true for 465, false for other ports
        auth: {
<<<<<<< HEAD
            user: 'testcodefive@gmail.com', 
            pass: '1qazxsw23edc@#@!' 
=======
            user: 'aayushkr90@gmail.com', 
            pass: 'Qwerty12345#' 
>>>>>>> development-vinay
            },
        tls: {
                rejectUnauthorized : false
            }
    });
    let mailOptions = {
<<<<<<< HEAD
        from    : 'testcodefive@gmail.com', 
=======
        from    : 'aayushkr90@gmail.com', 
>>>>>>> development-vinay
        to      : email_array, // list of receivers
        subject : 'Ticket created', 
        text    : str
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }else{
            console.log("info",info)
        }
    });
  });
}

function user_email_notifications(result) { 
  var params = {
<<<<<<< HEAD
      TableName: database.Table[1].TableName,
=======
      TableName: email_database.Table[0].TableName,
>>>>>>> development-vinay
      IndexName: 'keyIndex',
      KeyConditionExpression: '#HASH = :value',  
      ExpressionAttributeNames : {
          '#HASH'  : 'key',
      },
      ExpressionAttributeValues: { 
        ':value': 'Help Desk User',
      },
      ScanIndexForward: false, 
      Limit: 1,
  };
  return new Promise(function(resolve, reject) {
    async.waterfall([
        function(done){
            docClient.query(params, function(err, data) {
                if (err) {
                    console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    done(true, err.message)
<<<<<<< HEAD
                } else if(data.Items.length == 0){
                    done(true, 'query raised but mail not send to users because (key: Help Desk User) not set in emails table')
                }
                else {
                    console.log("Email Query succeeded",data);
=======
                } else {
                    // console.log("Email Query succeeded",data);
>>>>>>> development-vinay
                    done(null, data)
                }
            })
        },function(data, done){
            var str = data.Items[0].body
            var email_array = ['aayushkr10@gmail.com'];

            //query from user table to get user email id and user data to be added.

            // console.log(str)
            var mapObj = {
                '{{firstname}}':"anand",
                '{{lastname}}':"kumar rai",
            };
            str = str.replace(/{{firstname}}|{{lastname}}/gi, function(matched){ 
            return mapObj[matched];
            });
            // console.log(str)
            done(null, email_array, str)
        },
        function(email_array, str){
            send_email(email_array, str)
            resolve(result)
        }
    ],function(err, data){
        console.log(err, data)
        reject(data)
    })
  })
}

function admin_email_notifications(result) { 
  var params = {
<<<<<<< HEAD
      TableName:  database.Table[1].TableName,
=======
      TableName: email_database.Table[0].TableName,
>>>>>>> development-vinay
      IndexName: 'keyIndex',
      KeyConditionExpression: '#HASH = :value',  
      ExpressionAttributeNames : {
          '#HASH'  : 'key',
      },
      ExpressionAttributeValues: { 
        ':value': 'Help Desk Admin',
      },
      ScanIndexForward: false, 
      Limit: 1,
  };
  return new Promise(function(resolve, reject) {
    async.waterfall([
        function(done){
            docClient.query(params, function(err, data) {
                if (err) {
                    console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    done(true, err.message)
<<<<<<< HEAD
                } else if(data.Items.length == 0){
                    done(true, 'query raised but mail not send to admins because (key: Help Desk Admin) not set in emails table')
                } 
                else {
                    console.log("Email Query succeeded",data);
=======
                } else {
                    // console.log("Email Query succeeded",data);
>>>>>>> development-vinay
                    done(null, data)
                }
            })
        },function(data, done){
            var str = data.Items[0].body
            var email_array = ['aayushkr10@gmail.com'];

            //query from admin table to get all admins emails ids to be added.

            // console.log(str)
            var mapObj = {
                '{{username}}'    : "anand kumar rai",
                '{{clientmail}}'  : "aayushkr10@gmail.com",
                '{{description}}' :  result.description
            };
            str = str.replace(/{{username}}|{{clientmail}}|{{description}}/gi, function(matched){ 
            return mapObj[matched];
            });
            // console.log(str)
            done(null, email_array, str)
        },
        function(email_array, str){
            send_email(email_array, str)
            resolve(result)
        }
    ],function(err, data){
        console.log(err, data)
        reject(data)
    })
  })
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
