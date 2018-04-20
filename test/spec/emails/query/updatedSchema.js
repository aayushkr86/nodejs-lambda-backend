var AWS = require("aws-sdk");
var config = require('./config')
var dynamodb = new AWS.DynamoDB(config);

var params = {
    TableName: "emails",
    AttributeDefinitions:[
        {AttributeName: "key", AttributeType: "S"},
        {AttributeName: "userid", AttributeType: "S"},
        {AttributeName: "status", AttributeType: "S"},
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                IndexName: "keyIndex",
                KeySchema: [
                    {AttributeName: "key", KeyType: "HASH"}, //Partition key
                    {AttributeName: "userid", KeyType: "RANGE"}, //Sort key
                ],
                Projection: {
                    ProjectionType: "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                }
            }
        }
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                IndexName: "statusIndex",
                KeySchema: [
                    {AttributeName: "status", KeyType: "HASH"}, //Partition key
                    {AttributeName: "key", KeyType: "RANGE"}, //Sort key
                ],
                Projection: {
                    ProjectionType: "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                }
            }
        }
    ]
};


function UPDATESCHEMA() {
    return new Promise(function(resolve, reject) {
        dynamodb.updateTable(params, function(err, data) {
            if (err) {
                console.error("Unable to update table. Error JSON:", JSON.stringify(err, null, 2));
                reject(err.message);
            } else {
                console.log("Updated table. Table description JSON:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        })
    })
}


describe('Update emails schema', function() {
    it('emailSchema updation', function(done) { 
        UPDATESCHEMA()
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