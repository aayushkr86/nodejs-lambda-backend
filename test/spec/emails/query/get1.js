var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

var params = {
    TableName: "emails",
    KeyConditionExpression: '#HASH = :value',  
    ExpressionAttributeNames : {
        '#HASH'  : 'status',
    },
    ExpressionAttributeValues: { 
      ':value': 'active',
    },
    // ScanIndexForward: false, 
    Limit: 5,
};

function KEYSORT() {
   return new Promise(function(resolve, reject) { 
        docClient.query(params, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            } else {
                console.log("Query succeeded",data);
                resolve({"Query succeeded":data}) 
            }
        })    
    })
}

describe('email queries', function() {
    it('get emails-list by key sort', function(done) { 
        KEYSORT()
        .then(function(data){
        //    console.log(data)
           done(null, data);
        })
        .catch(function(err){
            console.log(err)
            done(err);
        })
    })
})



