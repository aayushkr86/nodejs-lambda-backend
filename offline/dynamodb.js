var ip = require('ip');
var AWS = require('aws-sdk');

var configure = {
	"region":"localhost",
	"endpoint":"http://"+ip.address()+":8000"
};

var dynamodb = new AWS.DynamoDB({
	region: 'localhost',
	endpoint: 'http://192.168.1.26:8000'
});

var docClient = new AWS.DynamoDB.DocumentClient({
	region: 'localhost',
	endpoint: 'http://192.168.1.26:8000'
});

module.exports={
	docClient,dynamodb
};

