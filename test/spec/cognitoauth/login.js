var aws = require('aws-sdk');
aws.config.region = "eu-central-1";
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

// var params = {
//   AuthFlow: "ADMIN_NO_SRP_AUTH", /* required */
//   ClientId: '50m8ikgadq32mcc6uf3f903bvs', /* required */
//   // AnalyticsMetadata: {
//   //   AnalyticsEndpointId: 'STRING_VALUE'
//   // },
//   AuthParameters: {
//     'Username': 'vinay@code5.org',
//     'Password':"asd"
//   },
//   PoolId: 'eu-central-1_Yx8mPFKz4',
//   Region: 'eu-central-1'
//   // ClientMetadata: {
//   //   '<StringType>': 'STRING_VALUE',
//   //    '<StringType>': ... 
//   // },
//   // UserContextData: {
//   //   EncodedData: 'STRING_VALUE'
//   // }
// };

var params={
	AuthFlow: "ADMIN_NO_SRP_AUTH", /* required */
	  ClientId: '50m8ikgadq32mcc6uf3f903bvs', /* required */
	  UserPoolId: 'eu-central-1_Yx8mPFKz4', /* required */
	  // AnalyticsMetadata: {
	  //   AnalyticsEndpointId: 'STRING_VALUE'
	  // },
	  AuthParameters: {
	    'USERNAME': 'Some',
    	'PASSWORD':"Some@12345"
	  },
	  // ClientMetadata: {
	  //   '<StringType>': 'STRING_VALUE',
	  //   /* '<StringType>': ... */
	  // },
	  // ContextData: {
	  //   // HttpHeaders: [ /* required */
	  //   //   {
	  //   //     headerName: 'STRING_VALUE',
	  //   //     headerValue: 'STRING_VALUE'
	  //   //   },
	  //   //   /* more items */
	  //   // ],
	  //   IpAddress: '192.168.1.1', /* required */
	  //   ServerName: 'STRING_VALUE', /* required */
	  //   ServerPath: 'STRING_VALUE', /* required */
	  //   EncodedData: 'mydeviceheheh'
	  // }
};
cognitoidentityserviceprovider.adminInitiateAuth(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});