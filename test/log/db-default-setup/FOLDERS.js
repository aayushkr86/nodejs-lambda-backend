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
						"AttributeName": "id",
						"KeyType": "HASH"
					},
					{
					"AttributeName": "listNumbers",
					"KeyType": "RANGE"
					}
				],
				"AttributeDefinitions": [
					{
						"AttributeName": "id",
						"AttributeType": "S"
					},
					{
						"AttributeName": "listNumbers",
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
            "id": "categories",//uuid
            "listNumbers":12,
            "name": "Branding",
            "subcategory":"subcategory",
            "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et risus consequat augue luctus pretium. Integer venenatis tristique bibendum. Duis ullamcorper aliquet lectus. In sit amet vestibulum neque. In non purus vitae tortor mattis placerat vel ut diam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae leo quis sapien volutpat cursus. Morbi in ligula malesuada, tempor dui ac, finibus diam. Quisque convallis est quis ipsum blandit sollicitudin.",
            "thumbnailId": "cat_thumb_001",
            "count": 4,
            "totalUnreadCount": 13
    }
};
docClient.put(params, function(err, data) {
    // if (err) ppJson(err); // an error occurred
    // else ppJson(data); // successful response
});
var params = {
    TableName: 'FOLDERS',
    Item: {
				"id": "categories",
				"listNumbers":2,
				"name": "Systeme",
				"subcategory":"subcategory",
				"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et risus consequat augue luctus pretium. Integer venenatis tristique bibendum. Duis ullamcorper aliquet lectus. In sit amet vestibulum neque. In non purus vitae tortor mattis placerat vel ut diam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae leo quis sapien volutpat cursus. Morbi in ligula malesuada, tempor dui ac, finibus diam. Quisque convallis est quis ipsum blandit sollicitudin.",
				"thumbnail": "cat_thumb_002",
				"subCount": 7,
				"totalUnreadCount": 6
			}
};
docClient.put(params, function(err, data) {
    // if (err) ppJson(err); // an error occurred
    // else ppJson(data); // successful response
});

var params = {
    TableName: 'FOLDERS',
    Item: {
				"id": "subcategory",
				"listNumbers":1,
				"name": "sub categories1",
				"subcategory":"subcategory",
				"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et risus consequat augue luctus pretium. Integer venenatis tristique bibendum. Duis ullamcorper aliquet lectus. In sit amet vestibulum neque. In non purus vitae tortor mattis placerat vel ut diam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae leo quis sapien volutpat cursus. Morbi in ligula malesuada, tempor dui ac, finibus diam. Quisque convallis est quis ipsum blandit sollicitudin.",
				"thumbnail": "cat_thumb_0012",
				"subCount": 7,
				"totalUnreadCount": 6
			}
};
docClient.put(params, function(err, data) {
    // if (err) ppJson(err); // an error occurred
    // else ppJson(data); // successful response
});

var params = {
    TableName: 'FOLDERS',
    Item: {
				"id": "subcategory",
				"listNumbers":1,
				"name": "sub categories1",
				"subcategory":"subcategory",
				"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et risus consequat augue luctus pretium. Integer venenatis tristique bibendum. Duis ullamcorper aliquet lectus. In sit amet vestibulum neque. In non purus vitae tortor mattis placerat vel ut diam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae leo quis sapien volutpat cursus. Morbi in ligula malesuada, tempor dui ac, finibus diam. Quisque convallis est quis ipsum blandit sollicitudin.",
				"thumbnail": "cat_thumb_0012",
				"subCount": 7,
				"totalUnreadCount": 6
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