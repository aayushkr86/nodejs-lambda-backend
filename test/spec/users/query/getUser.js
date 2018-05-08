var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var jwt = require('jsonwebtoken')

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
var jwk = require('./pem.json')
// console.log(jwk)
function authorization(token) { //console.log(token)
    return new Promise ((resolve, reject)=>{
        // jwt.verify(token, 'shhhhh', function(err, decoded) {
        //     console.log(err, decoded)
        // });
        

        // var jwt = require('jsonwebtoken');
        // var jwkToPem = require('jwk-to-pem');
        // var pem = jwkToPem(jwk);
        // jwt.verify(token, pem, function(err, decoded) {
        //   console.log('decoded1', decoded)
        // });
        


        var decode = jwt.decode(token)
        // console.log('decode', decode)
        if(!decode){
            reject('no authorization token provided')
        }
        result = {username : decode['cognito:username'] }
        resolve(result)
    })  
}

function execute(event, cb) { //console.log(event)
    authorization(event.headers.Authorization)
    .then((result)=>{ //console.log(result)
        return userInfo(result)
    })
    .then((result)=>{
    response({code:400, body:result}, cb)
    })
    .catch((err)=>{
    response({code:400, err:{err}}, cb)
    })
}

function userInfo(result) { 
    return new Promise((resolve, reject)=>{
        var params = {
            TableName: 'users',
            KeyConditionExpression: 'username = :value', 
            ExpressionAttributeValues: { 
                ':value': result.username
            },
        };
        docClient.query(params, function(err, data) {
            if (err) {
                console.log(err);
                reject(err)
            }
            else { 
                // console.log(data); 
                resolve({'message' : data.Items}) 
            } 
        });
    })
}

module.exports = { execute }