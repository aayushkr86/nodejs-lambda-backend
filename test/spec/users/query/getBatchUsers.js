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

function authorization(token) { //console.log(token)
    return new Promise ((resolve, reject)=>{
        // jwt.verify(token, 'shhhhh', function(err, decoded) {
        //     console.log(err, decoded)
        // });
        var decode = jwt.decode(token)
        // (jwt.decode( event.params.header['Authorization'] )["cognito:username"]);
        // console.log('decode', decode)
        result = {username : decode['cognito:username'] }
        resolve(result)
    })  
}

function execute(event, cb) { //console.log(event)
    // authorization(event.headers.Authorization)

    // .then((result)=>{ //console.log(result)
        // return 
        userInfo(event.body)
    // })
    .then((result)=>{
    response({code:400, body:result}, cb)
    })
    .catch((err)=>{
    response({code:400, err:{err}}, cb)
    })
}

function userInfo(result) { //console.log(result)
    var array = JSON.parse(result)
    // console.log(array.username)
    var keys= []
    array.username.forEach((key)=>{
        key = {
            'username' : key
        }
        keys.push(key)
    })
    // console.log(keys)
    return new Promise((resolve, reject)=>{
        var params = {
            RequestItems: { // map of TableName to list of Key to get from each table
                users: {
                    Keys: keys,
                    AttributesToGet: [ 
                        'firstname',
                        'lastname',
                        'profilepic_url',
                        'username',
                        'email'    
                    ],
                    ConsistentRead: false, // optional (true | false)
                },
            },
            ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
        };
        docClient.batchGet(params, function(err, data) {
            if (err) {
                console.log(err);
                reject(err)
            }
            else { 
                // console.log(data); 
                resolve(data.Responses) 
            } 
        });
    })
}

module.exports = { execute }