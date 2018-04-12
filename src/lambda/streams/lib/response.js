
module.exports = function (execution,callback) {
	console.log(execution);
	if(execution.err){
		callback(null,{
			statusCode: execution.code || 406,
		    headers:execution.headers || {
		      'x-custom-header': 'my custom header value',
		      // "Access-Control-Allow-Origin":"*"
		    } ,
		    body: execution.body|| {"error":"Some Error Occured"}
		});
	}else{
		callback(null,{
			statusCode: execution.code || 200,
		    headers: execution.headers ||{
		      'x-custom-header': 'my custom header value',
		      // "Access-Control-Allow-Origin":"*"
		    },
		    body: JSON.stringify(execution.body) || {}
		});
	}
}