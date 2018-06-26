var AWS = require("aws-sdk");
var config = require('./config')
var dynamodb = new AWS.DynamoDB(config);

var params = {
    TableName : "login",
    KeySchema: [       
        { AttributeName: "status", KeyType: "HASH" },
        { AttributeName: "loginAt", KeyType: "RANGE" } 
    ],
    AttributeDefinitions: [       
        { AttributeName: "status", AttributeType: "S" },
        { AttributeName: "loginAt", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    }
};

function CREATE() {
    return new Promise(function(resolve, reject) {
        dynamodb.createTable(params, function(err, data) {
            if (err) {
                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                reject(err.message);
            } else {
                console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        })
    })
}


describe('login schema', function() {
    it('login creation', function(done) { 
        CREATE()
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