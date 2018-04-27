// var params = {
//     TableName: 'emails',
// };
// dynamodb.deleteTable(params, function(err, data) {
//     if (err) ppJson(err); // an error occurred
//     else ppJson(data); // successful response
// });

/* Create Table */
var params = {
    TableName : "emails",
    KeySchema: [       
        { AttributeName: "status", KeyType: "HASH" },
        { AttributeName: "key", KeyType: "RANGE" } 
    ],
    AttributeDefinitions: [       
        { AttributeName: "status", AttributeType: "S" },
        { AttributeName: "key", AttributeType: "S" },
        { AttributeName: "userid", AttributeType: "S" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    },
    GlobalSecondaryIndexes: [ 
        { 
            IndexName: 'keyIndex', 
            KeySchema: [
                { AttributeName: 'key', KeyType: 'HASH', },
                { AttributeName: 'userid', KeyType: 'RANGE', }
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

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
      
    }
})

/** Insert item */
var params = {
    TableName: "emails",
    Item: {
        "status"    : "active",
        "key"       : "Password",
        "subject"   : "Support Password Change Email",
        "body"      : "Hi ${firstname} ${lastname}",
        "userid"    : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "createdAt" : new Date().getTime(),
        "updatedAt" : new Date().getTime()
    },
    ReturnValues: 'ALL_OLD',
}

docClient.put(params, function(err, data) {
    if (err) {
        console.error("Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Item added:", data);
    }
}) 

// delete item
var params = {
    TableName: "emails",
    Key: {
        "status": "active",
        "updatedAt": 1523876546793,
    },
    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
}

docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete. Error:", JSON.stringify(err, null, 2));
    }else if(Object.keys(data).length == 0) {
        console.log("no item found")
    } 
    else {
        console.log("deleted succeeded",data);
        
    }
})

//get data
var params = {
    TableName: "emails",
    KeyConditionExpression: '#HASH = :value',  
    ExpressionAttributeNames : {
        '#HASH'  : 'status',
    },
    ExpressionAttributeValues: { 
      ':value': 'active',
    },
    // ScanIndexForward: false, 
    Limit: 5,
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded",data);
    }
}) 
