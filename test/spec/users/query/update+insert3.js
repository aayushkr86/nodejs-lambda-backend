var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
var Busboy = require('busboy');
var config = require('./config');
var docClient = new AWS.DynamoDB.DocumentClient(config);
var Minio = require('minio');
var fileType = require('file-type');
var path = require('path');
var fs = require('fs');

var S3 = new Minio.Client({
    endPoint: "172.17.0.2",
    port:9000,
    secure:false,
    accessKey: 'CZ5MTXJLFK9WPWVZXRI1',
    secretKey: 'splHypa18nqtr9yjYoZaP2/dSjgHv+kB1kkzz8HF'
});

function response(execution, cb) {
    if(execution.err) {
        response = {
            statusCode: execution.code || 406,
            headers: execution.headers ||{
            'x-custom-header': 'my custom header value',
            },
            body: JSON.stringify(execution.err||{"error":"Some Error Occured"})
        };
    }else{
        response = {
            statusCode: execution.code || 200,
            headers: execution.headers ||{
            'x-custom-header': 'my custom header value',
            },
            body: JSON.stringify(execution.body) || {}
        };
    }
    cb(null, response)
}


var jwkToPem = require('jwk-to-pem');




function authorization(event) { //console.log(event)
    token = event.headers['Authorization']
    // console.log(token)
    // jwt.decode(token, 'shhhhh', function(err, decoded) {
    //     console.log(err, decoded) 
    // });
    
    var jwk = { kty: 'EC', crv: 'P-256', x: '...', y: '...' }
    var pem = jwkToPem(jwk);
    jwt.verify(token, pem, function(err, decoded) {
        console.log(err, decoded)
      });
}

function execute(event, cb) { 
    event = JSON.parse(event.body) 

    // authorization(event)
    // .then((result)=>{
    //     console.log(result)
    // })
    file_upload(event)
    // .then((event, cb)=>{
    //     expressions(event, function(data){
    //         // console.log(data)
    //         // return data;
    //         cb(data)
    //     })
    // })
    .then((result)=>{
        return expressions(result)
    })
    .then((result)=>{
        return UPDATE(result)
    })
    .then((result)=>{
    response({code:400, body:result},cb)
    })
    .catch((err)=>{
        console.log(err)
    response({code:400, err:{err}},cb)
    })
}

function file_upload(result) { //console.log(result.profilepic_url)
    return new Promise((resolve, reject)=>{
        var buffer = Buffer.from(result.profilepic_url.replace(/^data:image\/\w+;base64,/, ""),"base64");
        var fileMine = fileType(buffer)
        console.log(fileMine)
        if(fileMine.mime != ('image/jpeg'||'image/png')) {
         return reject('not a image file')
        }
        uploadtoS3(buffer, fileMine)
        .then((url)=>{
            result['profilepic_url'] = url;
            resolve(result)
        })
        .catch((err)=>{
            reject(err)
        })
    })
}

function uploadtoS3(buffer, fileMine) { //console.log(buffer)
    return new Promise((resolve, reject)=>{
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
                url = params.bucketname+'/'+params.filename;
                resolve(url)  
            } 
        });
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
    update_values_object[':updatedAt'] = new Date().getTime() 
    var update_expression_string = update_expression_array.join(', ')
    // console.log(update_expression_array)
    // console.log(update_expression_string)
    // console.log(update_names_object)
    // console.log(update_values_object)
    result = {
        "update_expression_string" : update_expression_string,
        "update_names_object" : update_names_object,
        "update_values_object" : update_values_object,
    }
    // cb(result)
    resolve(result)
  })
}

request = {
    username : 'aayush'
}
function UPDATE(result) { //console.log(result)
    var params = {
    TableName: "users",
    Key: {
        "username": request.username,
        // "createdAt": result.createdAt,
    },
    UpdateExpression: 'SET '+result.update_expression_string,
    ExpressionAttributeNames : result.update_names_object,
    ExpressionAttributeValues: result.update_values_object,
    // ConditionExpression: 'attribute_exists(username) AND attribute_exists(createdAt)',
    ReturnValues: 'ALL_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
    }
    // console.log(params)
    return new Promise(function(resolve, reject) { 
        docClient.update(params, function(err, data) { console.log('===>',err,data)
            if (err) {
                console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            }
            else if(Object.keys(data).length == 0) { 
                reject("no item found")
            }
            else {
                console.log("updation succeeded",data);
                resolve(data)
            }
        })
    });
}

module.exports = {execute};