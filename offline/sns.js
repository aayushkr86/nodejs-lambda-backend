var list = [{
	"arn":"",
	"path":"./src/sns/Permission"
},{
	"arn":"arn:aws:sns:us-west-2:123456789012:Email",
	"path":"../src/sns/Email"
},
{
	"arn":"",
	"path":"./src/DB"
}];

var uuid 	= require('uuid');

var publish=function (publish,callback) {
			list.forEach(function(ele){
				if(ele.arn == publish.TopicArn){
					var event ={
						Message: publish.Message, 
	        			Subject: publish.Subject,
					};
					var execute = require(ele.path);
					//be more specific about the message send on the event
					execute.handler(event,{},function(err,data) {
						if(err){
							callback(err,{});
						}
						callback(null,{"Message_id":uuid.v4()});
					});
				}
		})
}

module.exports={publish};
