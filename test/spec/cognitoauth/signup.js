var aws = require('aws-sdk');
aws.config.region = "eu-central-1";
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()



// var params={
//   AuthFlow: "ADMIN_NO_SRP_AUTH", /* required */
//     ClientId: '50m8ikgadq32mcc6uf3f903bvs', /* required */
//     UserPoolId: 'eu-central-1_Yx8mPFKz4',  required 
//     // AnalyticsMetadata: {
//     //   AnalyticsEndpointId: 'STRING_VALUE'
//     // },
//     AuthParameters: {
//       'USERNAME': 'Some',
//       'PASSWORD':"Some@1234"
//     },


var params = {
  ClientId: '50m8ikgadq32mcc6uf3f903bvs', /* required */
  Password: 'Some@12345', /* required */
  Username: 'Some', /* required */
  // AnalyticsMetadata: {
  //   AnalyticsEndpointId: 'STRING_VALUE'
  // },
  // SecretHash: 'STRING_VALUE',
  UserAttributes: [
    {
      Name: 'email', /* required */
      Value: 'vinay@code5.org'
    },
    /* more items */
  ],
  // UserContextData: {
  //   EncodedData: 'STRING_VALUE'
  // },
  // ValidationData: [
  //   {
  //     Name: 'STRING_VALUE',  required 
  //     Value: 'STRING_VALUE'
  //   },
  //   /* more items */
  // ]
};
cognitoidentityserviceprovider.signUp(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});