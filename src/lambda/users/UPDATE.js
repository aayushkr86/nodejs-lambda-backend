/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')

if (process.env.AWS_REGION == 'local') {
  mode 		= 'offline'
  // sns 	= require('../../../offline/sns');
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
const Ajv 		 = require('ajv')
const setupAsync = require('ajv-async')
const ajv 	     = setupAsync(new Ajv())
const fileType   = require('file-type')
var jwt          = require('jsonwebtoken')

var updateSchema = {
  $async:true,
  type: "object",
  properties: {
        firstName : {
            type: "string",
        },
        lastName : {
            type: "string",
        },
        gender : {
            type: "string",
            enum:['male', 'female']
        },
        companyName : {
            type: "string",
        },
        departmentName : {
            type: "string",
        },
        profilePicUrl : {
            type: "string",
        }
    },
    required : []
}

var validate = ajv.compile(updateSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */

function authorization(event) { //console.log(token)
    var token = event.headers.Authorization
    return new Promise ((resolve, reject)=>{
        var decode = jwt.decode(token)
        if(!decode){
            return reject('no authorization token provided')
        }else if(decode['cognito:username'] == undefined){
            return reject('cognito username not found in the token')
        }
        if(typeof event.body == 'string') {
           event.body = JSON.parse(event.body) 
        }
        event.body['username'] = decode['cognito:username'];
        // console.log(event.body)
        resolve(event)
    })  
}

function execute (event, callback) {
        authorization(event)
        .then((event)=>{
            return validate_all(validate, event.body)
        }) 
        .then(function (result) {
        if(result.profilePicUrl) {
            return file_upload(result)
        }else{
            return result;
        }
    })
    .then(function (result) {
        return expressions(result)
    })
    .then(function (result) {
        return update_user(result)
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
function validate_all(validate, data) {  //console.log(data)
  return new Promise((resolve, reject) => {
    validate(data).then(function (res) {
		    resolve(res)
    }).catch(function (err) {
		  console.log(JSON.stringify(err, null, 6))
		  reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}


function file_upload(result) { //console.log(result.profilePicUrl)
    return new Promise((resolve, reject)=>{
        var buffer = Buffer.from(result.profilePicUrl.replace(/^data:image\/\w+;base64,/, ""),"base64");
        var fileMine = fileType(buffer)
        console.log(fileMine)
        if(fileMine.mime == null) {
         return reject('not a image file')
        }
        uploadtoS3(buffer, fileMine)
        .then((url)=>{
            result['profilePicUrl'] = url;
            resolve(result)
        })
        .catch((err)=>{
            reject(err)
        })
    })
}


function uploadtoS3(buffer, fileMine) { //console.log(buffer)
    return new Promise((resolve, reject)=>{
        if(mode == 'offline') {
            var params = {
                "bucketname"   : 'users',
                "filename"     : Date.now()+'.'+fileMine.ext,
                "file"         : buffer,
            }
            //console.log(params)
            S3.putObject(params.bucketname, params.filename, params.file, 'image/jpeg', function(err, etag) { 
                if (err) {
                    console.log(err)  
                    reject(err)
                }
                else {
                    console.log('File uploaded successfully.Tag:',etag) 
                    var url = params.bucketname+'/'+params.filename;
                    resolve(url)  
                } 
            });
        }else{
            var params = {
                Bucket: "talkd",
                Key: 'userpics'+'/'+Date.now()+'.'+fileMine.ext,
                Body: buffer,  
            };
            S3.putObject(params, function(err, data) {
                if (err) {
                    console.log(err)  
                    reject(err)
                }
                else {
                    console.log('File uploaded successfully.Tag:',data) 
                    var url = params.Bucket+'/'+params.Key;
                    resolve(url)  
                }        
            });
        }  
    })
}

function expressions(result) {
    return new Promise((resolve, reject)=>{
        var update_expression_array = [];
        var update_names_object = {};
        var update_values_object = {};
        for(var key in result) {
            if(key != 'username') {
                var temp = key.substring(0, 3)
                update_expression_array.push('#'+temp+'=:'+key+'_val');
                update_names_object['#'+temp] = key
                update_values_object[':'+key+'_val'] = result[key]
            }
        }
        update_expression_array.push('updatedAt = :updatedAt')
        update_expression_array.push('id = :id')
        update_values_object[':updatedAt'] = new Date().getTime()
        update_values_object[':id']      = uuid.v1(); 
        var update_expression_string = update_expression_array.join(', ')
        result = {
            "update_expression_string" : update_expression_string,
            "update_names_object" : update_names_object,
            "update_values_object" : update_values_object,
            "username" : result.username
        }
        resolve(result)
    })
}


function update_user (result) { //console.log(result)
    var params = {
        TableName: "users",
        Key: {
            "username": result.username
        },
        UpdateExpression: 'SET '+result.update_expression_string,
        ExpressionAttributeNames : result.update_names_object,
        ExpressionAttributeValues: result.update_values_object,
        ReturnValues: 'ALL_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
    }
    // console.log(params)
    return new Promise(function(resolve, reject) {
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            }
            else if(Object.keys(data).length == 0) { 
                reject("not able to create new user")
            }
            else {
                result['result'] = {'message': "Successfully updated",'data':data.Attributes}
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
