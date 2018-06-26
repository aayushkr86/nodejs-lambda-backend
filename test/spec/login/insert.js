var AWS = require("aws-sdk");
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var uuid = require('uuid')

var params = {
    TableName: "login",
    Item: {
        "status" : "active",
        "loginAt" : new Date().getTime(),
        "id" : uuid.v1(),
        "username" : 'arpit' 
    },
    ReturnValues: 'ALL_OLD',
}

function LOGIN(){
    return new Promise((resolve, reject)=>{
        docClient.put(params, function(err, data) {
            if (err) {
                // console.error("Error:", JSON.stringify(err, null, 2));
                reject(err)
            } else {
                // console.log("Item added:", data);
                resolve({"Successfully added new login data" : data})
            }
        })  
    })
}



describe('login tests', function(){
    it('login',function(done){
        LOGIN()
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