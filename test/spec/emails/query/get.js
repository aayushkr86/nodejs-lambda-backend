var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

var params = {
    TableName: "emails",
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
    // ScanIndexForward: false, 
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
                // console.log("Query succeeded",data);
                data.Items.sort(function(a, b){
                    var keyA = a.key.toLowerCase(); 
                    var keyB = b.key.toLowerCase();
                    if (keyA < keyB) //sort string ascending
                        return -1 
                    if (keyA > keyB)
                        return 1
                    return 0 //default return value (no sorting)                    
                })
                resolve({"Query succeeded":data}) 
            }
        })    
    })
}

describe('email queries', function() {
    it('get emails-list', function(done) { 
        QUERY()
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



