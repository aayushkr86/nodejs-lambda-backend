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
					}
				],
				"ProvisionedThroughput": {
					"ReadCapacityUnits": 1,
					"WriteCapacityUnits": 1
				}
			};
dynamodb.createTable(params, function(err, data) {
    // if (err) ppJson(err); // an error occurred
    // else ppJson(data); // successful response
});

/** Insert table */
var params = {
    TableName: 'FOLDERS',
    Item: {
            "folderId": "categories",//uuid
            "folderOrder":12,
            "folderName": "Branding",
            "foldersub":"subcategory",
            "folderDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et risus consequat augue luctus pretium. Integer venenatis tristique bibendum. Duis ullamcorper aliquet lectus. In sit amet vestibulum neque. In non purus vitae tortor mattis placerat vel ut diam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae leo quis sapien volutpat cursus. Morbi in ligula malesuada, tempor dui ac, finibus diam. Quisque convallis est quis ipsum blandit sollicitudin.",
            "folderThumbnailId": "cat_thumb_001",
            "folderSubcount": 4,
            "totalUnreadCount": 13
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