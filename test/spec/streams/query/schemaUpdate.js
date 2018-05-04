var AWS = require("aws-sdk");
var config = require('./config')
var dynamodb = new AWS.DynamoDB(config);

var params = {
    TableName : "streams",
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "date", AttributeType: "N" },
        { AttributeName: "updatedAt", AttributeType: "N" },
        
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                IndexName: "idIndex",
                KeySchema: [
                    { AttributeName: "id", KeyType: "HASH" }, //Partition key
                    { AttributeName: "updatedAt", KeyType: "RANGE" }, //Sort key
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
};

function CREATE() {
    return new Promise(function(resolve, reject) {
        dynamodb.updateTable(params, function(err, data) {
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


describe('streams schema', function() {
    it('schema creation', function(done) { 
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