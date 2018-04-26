// var params = {
//     TableName: 'FOLDERS',
// };
// dynamodb.deleteTable(params, function(err, data) {
//     if (err) ppJson(err); // an error occurred
//     else ppJson(data); // successful response
// });
/* Create Table */
var params ={
				"TableName": "FILES",
				"KeySchema": [
					{
						"AttributeName": "fileId",
						"KeyType": "HASH"
					},
					{
					"AttributeName": "fileOrder",
					"KeyType": "RANGE"
					}
				],
				"AttributeDefinitions": [
					{
						"AttributeName": "fileId",
						"AttributeType": "S"
					},
					{
						"AttributeName": "fileOrder",
						"AttributeType": "N"
					}
				],
				"ProvisionedThroughput": {
					"ReadCapacityUnits": 1,
					"WriteCapacityUnits": 1
				}
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