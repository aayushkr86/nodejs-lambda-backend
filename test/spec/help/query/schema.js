var AWS = require("aws-sdk");
var config = require('./config')
var dynamodb = new AWS.DynamoDB(config);

var params = {
    TableName : "help",
    KeySchema: [       
        { AttributeName: "userid", KeyType: "HASH" },
        { AttributeName: "createdAt", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [       
        { AttributeName: "userid", AttributeType: "S" },
        { AttributeName: "createdAt", AttributeType: "N" },
        { AttributeName: "status", AttributeType: "S" },
        { AttributeName: "uuid", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    },
    GlobalSecondaryIndexes: [ 
        { 
            IndexName: 'statusIndex', 
            KeySchema: [
                { AttributeName: 'status', KeyType: 'HASH', },
                { AttributeName: 'uuid', KeyType: 'RANGE', }
            ],
            Projection: { 
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
    ],
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


describe('help desk schema', function() {
    it('Help Desk Schema creation', function(done) { 
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