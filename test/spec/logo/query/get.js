var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

var params = {
    TableName: "logo",
    KeyConditionExpression: '#HASH = :value', 
    // and #RANGE > :RANGE_VALUE', 
    ExpressionAttributeNames : {
        '#HASH'  : 'status',
        // '#RANGE' : 'updatedAt'
    },
    ExpressionAttributeValues: { 
      ':value': 'active',
    //   ':RANGE_VALUE' : 0
    },
    ScanIndexForward: false, 
    // Limit: 5,
    // ExclusiveStartKey :{
    //     id: 'en_1_0', date: 1523771296000 
    // }
};

function QUERY() {
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

describe('logo queries', function() {
    it('get logo-list', function(done) { 
        QUERY()
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



