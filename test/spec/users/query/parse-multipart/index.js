var multipart = require("parse-multipart");

exports.handler = function(event,context,callback) {
 var bodyBuffer = new Buffer(event['body-json'].toString(),'base64');
 var boundary = multipart.getBoundary(event.params.header['Content-Type']);

 var parts = multipart.Parse(bodyBuffer,boundary);
 
 callback(null,{ result : 'SUCCESS' , files : parts });
}
