var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var async = require('async')

var date = "2018-04-15"
var from = date+" 00:00:00"
var to = date+" 23:59:59"

var params = {
    TableName: 'streams',

    KeyConditionExpression: 'id = :value and #dt BETWEEN :from AND :to', 
    // FilterExpression: 'show_at_first_place = :val',
    ExpressionAttributeNames: { 
        '#dt': 'date'
    },
    
    ExpressionAttributeValues: { 
      ':value': 'en_1_0',
    //   ":val" : true,
      ":from": new Date(from).getTime(),
      ":to":   new Date(to).getTime(),
    },
    ScanIndexForward: false, 
    Limit: 5,
    // ExclusiveStartKey :{
    //     id: 'en_1_0', date: 1523771296000 
    // }
};
var event = {};
if(typeof event.LastEvaluatedKey != undefined){
    params.ExclusiveStartKey = event.LastEvaluatedKey;
}

var params1 = {
    TableName: 'streams',

    KeyConditionExpression: 'id = :value', 
    // and #dt BETWEEN :from AND :to', 
    // // FilterExpression: 'show_at_first_place = :val',
    // ExpressionAttributeNames: { 
    //     '#dt': 'date'
    // },
    
    ExpressionAttributeValues: { 
      ':value': 'en_1_1',
    //   ":val" : true,
    //   ":from": new Date(from).getTime(),
    //   ":to":   new Date(to).getTime(),
    },
    ScanIndexForward: false, 
    // Limit: 1,
    // ExclusiveStartKey :{
    //     id: 'en_1_0', date: 1523771296000 
    // }
};

function QUERY() {
   return new Promise(function(resolve, reject) { 
        async.waterfall([
            function(done) {
                docClient.query(params, function(err, data) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                        // reject(err.message)
                        done(true, err)
                    } else {
                        // console.log("Query succeeded",data);
                        // resolve(data) 
                        done(null, data) 
                    }
                })    
            },
            function(publish,done) {
                docClient.query(params1, function(err, data) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                        // reject(err.message)
                        done(true, err)
                    } else {
                        // console.log("Query succeeded",data);
                        // resolve(data) 
                        done(null, publish, data) 
                    }
                })
            },
            function(publish, show_first) { 
                show_first.Items.forEach(function(elem){ 
                    publish.Items.unshift(elem)
                })
                console.log(publish.Items.length)

                if(publish.Items.length == 6) {
                    publish.Items.splice(5,1);
                    publish.LastEvaluatedKey.date = publish.Items[4].date
                    publish.LastEvaluatedKey.id   = publish.Items[4].id
                }
            resolve(publish)
            }
            ],function(err,data) { 
            reject(data)
            })
    });
}




describe('streams queries', function() {
    it('query table', function(done) { 
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



