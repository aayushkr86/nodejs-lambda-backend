var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

module.exports = INSERT

var params = {
    TableName: "logo",
    Item: {
        "status" : "active",
        "updatedAt" : new Date().getTime(),
        "company" : "code5",
        "logo" : "www.frrgrg.com/fefefefefef/fsfs.jpg",
        "userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "uuid": "c7748f58-3bd9-11e8-b467-0ed5f89f718b",
        "createdAt": new Date().getTime()
    },
    ReturnValues: 'ALL_OLD',
}

function INSERT(params) { 
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

// describe('logo queries', function() {
//     it('new logo insertion', function(done) { 
//         INSERT()
//         .then(function(data){
//            console.log(data)
//            done(null, data);
//         })
//         .catch(function(err){
//             console.log(err)
//             done(err);
//         })
//     })
// })