const AWS               = require('aws-sdk');
const dynamodb          = new AWS.DynamoDB({});
const docClient         = new AWS.DynamoDB.DocumentClient({});

const database          = require('lib/database.js');
const uuid              = require('uuid');

exports.handler = (event, context, callback) => {
    // TODO implement
//     { 
//         version: '1',
//         region: 'eu-central-1',
//         userPoolId: 'eu-central-1_N7k63TALj',
//         userName: 'user1',
//         callerContext: 
//         { 
//             awsSdkVersion: 'aws-sdk-unknown-unknown',
//             clientId: '3meuebfjtq2r12sj55ti4rbkhf' 
//         },
//         triggerSource: 'PostConfirmation_ConfirmSignUp',
//         request: 
//         { userAttributes: {
//             sub: '8e6cba80-334e-4856-902e-9d54a5101536',
//             'cognito:user_status': 'CONFIRMED',
//             email_verified: 'true',
//             'cognito:email_alias': 'vinay@code5.org',
//             email: 'vinay@code5.org'
//             }
//         },
//     response: {} 
// }

/**
 * dynamodb wrapper which will add username to the both the table
 * 
 */

		var params = {
            TableName: database.Table[0].TableName,
            Item: {
            	"username":event.userName,
                "email":event.request.userAttributes.email,
                "id": uuid.v4(),
                "createdAt": new Date().toISOString()
            }
        };
        docClient.put(params, function(err, data) {
            console.log(err,data);
            callback(null,event);
        });
};