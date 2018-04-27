//delete stream
var params = {
    TableName: "streams",
    Key: {
        "id": "en_true_false",
        "date": 1524041595000,
    },
    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
}
docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete. Error:", JSON.stringify(err, null, 2));
    }else if(Object.keys(data).length == 0){
        console.log("no item found")
    } 
    else {
        console.log("deleted succeeded",data);
    }
})

// schema creation
var params = {
    TableName : "streams",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH" },
        { AttributeName: "date", KeyType: "RANGE" } 
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "date", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        reject(err.message);
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        resolve(data);
    }
})

// insert stream
var params = {
    TableName: "streams",
    Item: {
        "date"  : "2018-04-20",
        "userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "language" : "en",
        "title" : "asaaad",
        "intro_text" : "aaaaa",
        "news_text"  : "aaaaa",
        "image"      : "none",
        "pdf"        : "2018-04-04T07:58:36.145Z-pdf2.pdf",
        "publish"    : true,
        "show_at_first_place" : false,
    },
    ReturnValues: 'ALL_OLD',
}

docClient.put(params, function(err, data) {
    if (err) {
        console.error("Error:", JSON.stringify(err, null, 2));
        reject(err.message)
    } else {
        console.log("Item added:", data);
        resolve({"Successfully added new stream" : data})
    }
})

// get streams
var params = {
    TableName: 'streams',

    KeyConditionExpression: 'id = :value', 
    ExpressionAttributeValues: { 
      ':value': 'en_1_1',
    },
    ScanIndexForward: false, 
    Limit: 5,
    ExclusiveStartKey :{
        id: 'en_1_0', date: 1523771296000 
    }
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
       console.log(data)
    }
}) 


