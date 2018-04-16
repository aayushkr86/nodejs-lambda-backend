var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var toUpdatedata = require('../../../log/email_validations')

var params = {
    TableName: "emails",
    Key: {
        "status": "active",
        "updatedAt": 1523879441860,
    },
    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
}

function UPDATE() {
    return new Promise(function(resolve, reject) {
        docClient.delete(params, function(err, data) {
            if (err) {
                console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            }else if(Object.keys(data).length == 0) {
                reject("no item found")
            } 
            else {
                console.log("deleted succeeded",data);
                params = {
                    TableName: "emails",
                    Item: {},     
                }
                for(var obj in data.Attributes) { 
                    params.Item[obj] = toUpdatedata.update[0][obj] ? toUpdatedata.update[0][obj] : data.Attributes[obj]
                }
                params.Item.updatedAt = new Date().getTime();
                // console.log(params)
                docClient.put(params, function(err, data) {
                    if (err) {
                        console.error("Error:", JSON.stringify(err, null, 2));
                        reject(err.message)
                    } else {
                        console.log("Successfully updated:", data);
                        resolve({"Successfully updated" : data})
                    }
                }) 
            }
        })
    });
}

describe('emails queries', function() {
    it('email updated', function(done) { 
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