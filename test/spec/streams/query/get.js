var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)



var params = {
    TableName: 'streams',

    KeyConditionExpression: 'id = :value', 
    
    ExpressionAttributeValues: { 
      ':value': 'en_1_0',

    },
    ScanIndexForward: false, 
    // Limit: 5,
    // ExclusiveStartKey :{ id: 'en_1_0', updatedAt: 1523368561542 }
};




function QUERY() {
    return new Promise(function(resolve, reject) {
        docClient.query(params, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            } else {
                console.log("Query succeeded",data);
                resolve(data)   
            }
        })
    });
}



describe('streams queries', function() {
    it('query table', function(done) { 
        QUERY()
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



