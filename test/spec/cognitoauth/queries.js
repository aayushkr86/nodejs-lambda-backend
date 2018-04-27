
let AWS 					= require('aws-sdk');
let AmazonCognitoIdentity 	= require('amazon-cognito-identity-js');

var pooldata = {
	"UserPoolId":"eu-central-1_Yx8mPFKz4",
	"ClientId":"50m8ikgadq32mcc6uf3f903bvs"
};

// password "testuser"
signup('asdsad','asdasd',pooldata);

function login () {
	var authenticationData = {
        Username : 'username',
        Password : 'password',
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = {
        UserPoolId : '...', // Your user pool id here
        ClientId : '...' // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
   
	var userdata={
		Username:"asethi7",
		pool:userPool
	};

	cognitoUser=new AmazonCognitoIdentity.CognitoUser(userdata);
	cognitoUser.authenticateUser()

}
/**
 * signup setup
 * @param  {[string]} username 
 * @param  {[string]} password 
 * @return {[type]}          
 */
function signup(username,password,pooldata){

	var dataEmail = {
        Name : 'email',
        Value : 'vinay@code5.org'
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributeList=[];
    attributeList.push(attributeEmail);
	var userpool 	= new AmazonCognitoIdentity.CognitoUserPool(pooldata);
	userpool.signup(username, password,attributeEmail,null,(err,result)=>{
		console.log(err,result);
	});
}

function challenge(){
	cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');

    cognitoUser.initiateAuth(authenticationDetails, {
        onSuccess: function(result) {
            // User authentication was successful
        },
        onFailure: function(err) {
            // User authentication was not successful
        },
        customChallenge: function(challengeParameters) {
            // User authentication depends on challenge response
            var challengeResponses = 'challenge-answer'
            cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
        }
    });
}


function password_change(){
	 cognitoUser.changePassword('oldPassword', 'newPassword', function(err, result) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        console.log('call result: ' + result);
    });
}

function forgot_password(){
	  cognitoUser.forgotPassword({
        onSuccess: function (data) {
            // successfully initiated reset password request
	          console.log('CodeDeliveryData from forgotPassword: ' + data);
        },
        onFailure: function(err) {
            alert(err.message || JSON.stringify(err));
        },
        //Optional automatic callback
        inputVerificationCode: function(data) {
            console.log('Code sent to: ' + data);
            var verificationCode = prompt('Please input verification code ' ,'');
            var newPassword = prompt('Enter new password ' ,'');
            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess() {
                    console.log('Password confirmed!');
                },
                onFailure(err) {
                    console.log('Password not confirmed!');
                }
            });
        }
    });
}