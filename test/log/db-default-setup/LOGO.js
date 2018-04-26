//create table
var params = {
    TableName : "logo",
    KeySchema: [       
        { AttributeName: "status", KeyType: "HASH" },
        { AttributeName: "updatedAt", KeyType: "RANGE" } 
    ],
    AttributeDefinitions: [       
        { AttributeName: "status", AttributeType: "S" },
        { AttributeName: "updatedAt", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
})

//insert item
var params = {
    TableName: "logo",
    Item: {
        "status" : "active",
        "updatedAt" : new Date().getTime(),
        "company" : "code5",
        "logo" : "www.frrgrg.com/fefefefefef/fsfs.jpg",
        "userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "uuid": "c7748f58-3bd9-11e8-b467-0ed5f89f718b",
        "createdAt": new Date().getTime()
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

//get item
var params = {
    TableName: "logo",
    KeyConditionExpression: '#HASH = :value', 
    // and #RANGE > :RANGE_VALUE', 
    ExpressionAttributeNames : {
        '#HASH'  : 'status',
        // '#RANGE' : 'updatedAt'
    },
    ExpressionAttributeValues: { 
      ':value': 'active',
    //   ':RANGE_VALUE' : 0
    },
    ScanIndexForward: false, 
    // Limit: 5,
    // ExclusiveStartKey :{
    //     id: 'en_1_0', date: 1523771296000 
    // }
};
docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded",data);
    }
}) 

//delete item
var params = {
    TableName: "logo",
    Key: {
        "status": "active",
        "updatedAt": 1523950304115,
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