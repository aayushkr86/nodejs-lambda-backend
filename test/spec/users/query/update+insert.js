var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
request = {
    "username" : "aayush"
};
var toUpdatedata = require('../../../log/user_validations.json').post[0]
// console.log(toUpdatedata)

var update_expression_array = [];
var update_names_object = {};
var update_values_object = {};

for(var key in toUpdatedata) {
    if(key != 'username' && key != 'createdAt') {
        var temp = key.substring(0, 3)
        update_expression_array.push('#'+temp+'=:'+key+'_val');
        update_names_object['#'+temp] = key
        update_values_object[':'+key+'_val'] = toUpdatedata[key]
    }
}

update_expression_array.push('updatedAt = :updatedAt')
update_values_object[':updatedAt'] = new Date().getTime() 

var update_expression_string = update_expression_array.join(', ')
// console.log(update_expression_array)
// console.log(update_expression_string)
// console.log(update_names_object)
// console.log(update_values_object)

var params = {
    TableName: "users",
    Key: {
        "username": request.username,
        // "createdAt": toUpdatedata.createdAt,
    },
    UpdateExpression: 'SET '+update_expression_string,
    ExpressionAttributeNames : update_names_object,
    ExpressionAttributeValues: update_values_object,
    // ConditionExpression: 'attribute_exists(userid) AND attribute_exists(createdAt)',
    ReturnValues: 'ALL_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
}
// console.log(params)

function UPDATE() {
    return new Promise(function(resolve, reject) {
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
    });
}

describe('users queries', function() {
    it('user updated', function(done) { 
        UPDATE()
        .then(function(data){
        //    console.log(data)
           done(null, data);
        })
        .catch(function(err){
            // console.log(err)
            done(err);
        })
    })
})