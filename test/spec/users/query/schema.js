var AWS = require("aws-sdk");
var config = require('./config')
var dynamodb = new AWS.DynamoDB(config);

var params = {
    TableName : "users",
    KeySchema: [       
        { AttributeName: "username", KeyType: "HASH" },
    ],
    AttributeDefinitions: [       
        { AttributeName: "username", AttributeType: "S" },
        { AttributeName: "updatedAt", AttributeType: "N" },
        { AttributeName: "uuid", AttributeType: "S" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    },
    GlobalSecondaryIndexes: [ 
        { 
            IndexName: 'uuidIndex', 
            KeySchema: [
                { AttributeName: 'uuid', KeyType: 'HASH', },
                { AttributeName: 'updatedAt', KeyType: 'RANGE', }
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


describe('users schema', function() {
    it('users Schema creation', function(done) { 
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