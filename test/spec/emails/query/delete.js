var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)


var params = {
    TableName: "emails",
    Key: {
        "status": "active",
        "updatedAt": 1523876546793,
    },
    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
}

function DELETE() {
    return new Promise(function(resolve, reject) {
        docClient.delete(params, function(err, data) {
            if (err) {
                console.error("Unable to delete. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            }else if(Object.keys(data).length == 0) {
                reject("no item found")
            } 
            else {
                console.log("deleted succeeded",data);
                resolve(data)   
            }
        })
    });
}

describe('emails queries', function() {
    it('delete email', function(done) { 
        DELETE()
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