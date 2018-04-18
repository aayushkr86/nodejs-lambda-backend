var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var uuid = require('uuid')

module.exports = INSERT

var params = {
    TableName: "help",
    Item: {
        "userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "createdAt" : new Date().getTime(),
        "status" : "inprogress",
        "uuid": uuid.v1(),
        "description" : "asasasas",
        "updatedAt":  new Date().getTime()
    },
    ReturnValues: 'ALL_OLD',
}

function INSERT() { 
    return new Promise(function(resolve, reject) {
        docClient.put(params, function(err, data) {
        if (err) {
            // console.error("Error:", JSON.stringify(err, null, 2));
            reject(err.message)
        } else {
            // console.log("Item added:", data);
            resolve({"Successfully added new logo" : data})
        }
        })  
    });
}

describe('help queries', function() {
    it('new help insertion', function(done) { 
        INSERT()
        .then(function(data){
           console.log(data)
           done(null, data);
        })
        .catch(function(err){
            console.log(err)
            done(err);
        })
    })
})