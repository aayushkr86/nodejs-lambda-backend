// var params = {
//     TableName: 'FOLDERS',
// };
// dynamodb.deleteTable(params, function(err, data) {
//     if (err) ppJson(err); // an error occurred
//     else ppJson(data); // successful response
// });
/* Create Table */
var params = {
    TableName: 'FILES',
    KeySchema: [ // The type of of schema.  Must start with a HASH type, with an optional second RANGE.
        { // Required HASH type attribute
            AttributeName: 'fileId',
            KeyType: 'HASH',
        },
        { // Optional RANGE key type for HASH + RANGE tables
            AttributeName: 'fileOrder', 
            KeyType: 'RANGE', 
        }
    ],
    AttributeDefinitions: [ // The names and types of all primary and index key attributes only
        {
            AttributeName: 'fileId',
            AttributeType: 'S', // (S | N | B) for string, number, binary
        },
        {
            AttributeName: 'fileOrder',
            AttributeType: 'N', // (S | N | B) for string, number, binary
        },
         {
            AttributeName: 'fileFormat',
            AttributeType: 'S', // (S | N | B) for string, number, binary
        },
        
    ],
    ProvisionedThroughput: { // required provisioned throughput for the table
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1, 
    },
    GlobalSecondaryIndexes: [ // optional (list of GlobalSecondaryIndex)
        { 
            IndexName: 'fileFormatIndex', 
            KeySchema: [
                { // Required HASH type attribute
                    AttributeName: 'fileFormat',
                    KeyType: 'HASH',
                },
                { // Optional RANGE key type for HASH + RANGE secondary indexes
                    AttributeName: 'fileOrder', 
                    KeyType: 'RANGE', 
                }
            ],
            Projection: { // attributes to project into the index
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: { // throughput to provision to the index
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
        // ... more global secondary indexes ...
    ]
};

dynamodb.createTable(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});

/** Insert table */
var params = {
    TableName: 'FILES',
    Item: {
            "fileId": "categories",//uuid
            "fileOrder":12,
            "fileName": "Branding",
            "fileDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et risus consequat augue luctus pretium. Integer venenatis tristique bibendum. Duis ullamcorper aliquet lectus. In sit amet vestibulum neque. In non purus vitae tortor mattis placerat vel ut diam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae leo quis sapien volutpat cursus. Morbi in ligula malesuada, tempor dui ac, finibus diam. Quisque convallis est quis ipsum blandit sollicitudin.",
            "fileThumbnailId": "cat_thumb_001"
    }
};
docClient.put(params, function(err, data) {
    // if (err) ppJson(err); // an error occurred
    // else ppJson(data); // successful response
});
/** End result */
var params = {
    TableName: 'FILES'
};
dynamodb.scan(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});