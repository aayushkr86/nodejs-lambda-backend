var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB({
	// region: 'localhost',
	// endpoint: 'http://192.168.0.12:8000'
	"region": "localhost",
    "endpoint": "http://192.168.5.244:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient({
	// region: 'localhost',
	// endpoint: 'http://192.168.0.12:8000',
	"region": "localhost",
    "endpoint": "http://192.168.5.244:8000"
});
// console.log(configure);

module.exports={
	docClient,dynamodb
};
