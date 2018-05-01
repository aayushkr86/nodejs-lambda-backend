
var lambda_wrapper = require('lambda-wrapper');

module.exports=function (name_of_lambda) {
	var lambdaFunc;
	if(process.env.AWS_REGION == "local"){
		//offline mode
		lambdaFunc = require('../'+name_of_lambda);
	}else{
		//online mode
		lambdaFunc = {
			region:AWS_Region,
			lambdaFunction:name_of_lambda
		}
	}
	return lambda_wrapper.wrap(lambdaFunc);
}