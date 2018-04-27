var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

function response(execute, callback) {
if(execute.error) {
    response = {
        statusCode: 400,
        headers: {'xCustomHeader' : 'my custom header value'},
        body: JSON.stringify({"message" : execute.error})
    }
}
else{
    response = {
        statusCode: 200,
        headers: {'xCustomHeader' : 'my custom header value'},
        body: JSON.stringify({"message" : execute.body})
    }
}
    callback(null, response)
}

exports.handler = function(event, context, callback) {
    update_users(event)
    .then(function (result) {
        return update_expressions(result)
    })
    .then(function (result) {
        return update_user(result)
      })
    .then((data)=>{
    console.log(data)
    response({body :data},callback)
    })
    .catch((error)=>{
    response({error :"some error occured"},callback)
    })
}


function update_expressions(result) {
    return new Promise(function(resolve, reject) {
        var update_expression_array = [];
        var update_names_object = {};
        var update_values_object = {};
        var update_expression_string
        for(var key in result) {
            if(key != 'username' && key != 'createdAt') {
                var temp = key.substring(0, 2)
                update_expression_array.push('#'+temp+'=:'+key+'_val');
                update_names_object['#'+temp] = key
                update_values_object[':'+key+'_val'] = result[key]
            }
        }
        update_expression_array.push('updatedAt = :updatedAt')
        update_values_object[':updatedAt'] = new Date().getTime() 
        update_expression_string = update_expression_array.join(', ')

        result['update_expression_string'] = update_expression_string;
        result['update_names_object'] = update_names_object;
        result['update_values_object'] = update_values_object;
        resolve(result)
    });
}

function update_user(result) {
    var params = {
        TableName: "users",
        Key: {
            "username": request.username,
            // "createdAt": toUpdatedata.createdAt,
        },
        UpdateExpression: 'SET '+result.update_expression_string,
        ExpressionAttributeNames : result.update_names_object,
        ExpressionAttributeValues: result.update_values_object,
       
        ReturnValues: 'ALL_NEW', // 
    }
    return new Promise((resolve, reject)=>{
       docClient.update(params, function(err, data) {
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
    })  
}