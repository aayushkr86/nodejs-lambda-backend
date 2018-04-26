
//create table
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

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
       
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        
    }
})

//insert item
var params = {
    TableName: "help",
    Item: {
        "userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "createdAt" : new Date().getTime(),
        "status" : "inprogress",
        "uuid": uuid.v1(),
        "description" : "asasasas",
        "updatedAt":  new Date().getTime()
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

//delete item
var params = {
    TableName: "help",
    Key: {
        "userid": "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "createdAt": 1524049551466,
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

// get items
var params = {
    TableName: "help",
    IndexName: 'statusIndex',
    KeyConditionExpression: '#HASH = :value', 
    // and #RANGE > :RANGE_VALUE', 
    ExpressionAttributeNames : {
        '#HASH'  : 'status',
        // '#RANGE' : 'updatedAt'
    },
    ExpressionAttributeValues: { 
      ':value': 'inprogress',
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
    } 
    else if(data.Items.length == 0){
        console.log("no item found");
    }else {
        console.log("Query succeeded",data);
      
    }
})  