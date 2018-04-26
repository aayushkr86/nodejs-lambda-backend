// var params = {
//     TableName: 'FOLDERS',
// };
// dynamodb.deleteTable(params, function(err, data) {
//     if (err) ppJson(err); // an error occurred
//     else ppJson(data); // successful response
// });
/* Create Table */
var params ={
				"TableName": "FOLDERS",
				"KeySchema": [
					{
						"AttributeName": "folderId",
						"KeyType": "HASH"
					},
					{
					"AttributeName": "folderOrder",
					"KeyType": "RANGE"
					}
				],
				"AttributeDefinitions": [
					{
						"AttributeName": "folderId",
						"AttributeType": "S"
					},
					{
						"AttributeName": "folderOrder",
						"AttributeType": "N"
					},
					{
					    "AttributeName": "folderSub",
						"AttributeType": "S"   
					}
				],
				"ProvisionedThroughput": {
					"ReadCapacityUnits": 1,
					"WriteCapacityUnits": 1
				},
				GlobalSecondaryIndexes: [ // optional (list of GlobalSecondaryIndex)
			        { 
			            IndexName: 'folderSub-index', 
			            KeySchema: [
			                { // Required HASH type attribute
			                    AttributeName: 'folderSub',
			                    KeyType: 'HASH',
			                }
			            ],
			            "Projection": {
                            "ProjectionType": "ALL"
                        },
			            ProvisionedThroughput: { // throughput to provision to the index
			                ReadCapacityUnits: 1,
			                WriteCapacityUnits: 1,
			            },
			        }
			    ],
			};
dynamodb.createTable(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});

/** Insert table */
var params = {
    TableName: 'FOLDERS',
    Item: {
            "folderId": "categories",//uuid
            "folderOrder":12,
            "folderName": "Branding",
            "folderSub":"subcategory",
            "folderDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et risus consequat augue luctus pretium. Integer venenatis tristique bibendum. Duis ullamcorper aliquet lectus. In sit amet vestibulum neque. In non purus vitae tortor mattis placerat vel ut diam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae leo quis sapien volutpat cursus. Morbi in ligula malesuada, tempor dui ac, finibus diam. Quisque convallis est quis ipsum blandit sollicitudin.",
            "folderThumbnailId": "cat_thumb_001",
            "folderSubCount": 4
    }
};
docClient.put(params, function(err, data) {
    // if (err) ppJson(err); // an error occurred
    // else ppJson(data); // successful response
});
/** End result */
var params = {
    TableName: 'FOLDERS'
};
dynamodb.scan(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});