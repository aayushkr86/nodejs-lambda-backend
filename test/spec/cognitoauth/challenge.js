var params = {
  ChallengeName: SMS_MFA | SOFTWARE_TOKEN_MFA | SELECT_MFA_TYPE | MFA_SETUP | PASSWORD_VERIFIER | CUSTOM_CHALLENGE | DEVICE_SRP_AUTH | DEVICE_PASSWORD_VERIFIER | ADMIN_NO_SRP_AUTH | NEW_PASSWORD_REQUIRED, /* required */
  ClientId: 'STRING_VALUE', /* required */
  AnalyticsMetadata: {
    AnalyticsEndpointId: 'STRING_VALUE'
  },
  ChallengeResponses: {
    '<StringType>': 'STRING_VALUE',
    /* '<StringType>': ... */
  },
  Session: 'STRING_VALUE',
  UserContextData: {
    EncodedData: 'STRING_VALUE'
  }
};
cognitoidentityserviceprovider.respondToAuthChallenge(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});