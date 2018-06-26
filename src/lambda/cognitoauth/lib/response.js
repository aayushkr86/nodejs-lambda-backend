
module.exports = function (execution,callback) {
	var response = {};
<<<<<<< HEAD
	// console.log(execution);
=======
	console.log(execution);
>>>>>>> development-vinay
	if(execution.err){
		response = {
			statusCode: execution.code || 406,
		    headers: execution.headers ||{
		      'xCustomHeader': 'my custom header value',
		      // "Access-Control-Allow-Origin":"*"
		    },
		    body: JSON.stringify(execution.err||{"error":"Some Error Occured"})
		};
	}else{
		response = {
			statusCode: execution.code || 200,
		    headers: execution.headers ||{
		      'x-custom-header': 'my custom header value',
		      // "Access-Control-Allow-Origin":"*"
		    },
		    body: JSON.stringify(execution.body) || {}
		};
	}
<<<<<<< HEAD
	// console.log(response);
=======
	console.log(response);
>>>>>>> development-vinay
	callback(null,response);
}