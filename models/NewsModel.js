var AWS = require("aws-sdk");
var config = require('./config')

var dynamodb = new AWS.DynamoDB(config);

var params = {
    TableName : "streams",
    KeySchema: [       
        { AttributeName: "language", KeyType: "HASH" },
        { AttributeName: "publish", KeyType: "HASH" },  // Hash key
        { AttributeName: "show_at_first_place", KeyType: "HASH" },
        { AttributeName: "updatedAt", KeyType: "RANGE" }  // Range key
    ],
    AttributeDefinitions: [       
        { AttributeName: "language", AttributeType: "S" },
        { AttributeName: "publish", AttributeType: "B" },
        { AttributeName: "show_at_first_place", AttributeType: "B" },
        { AttributeName: "updatedAt", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
