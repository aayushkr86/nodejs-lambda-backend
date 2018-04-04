var list = [{
	"arn":"",
	"path":"./src/sns/Permission"
},{
	"arn":"",
	"path":"./src/sns/Email"
},
{
	"arn":"",
	"path":"./src/DB"
}];

var publish=function (arn,message) {
	return new Promise(function(reject,resolve){
			list.forEach(function(ele){
			if(ele.arn == arn){
				var execute = require(ele.path);
				//be more specific about the message send on the event
				execute.handler(message,{},function(err,data){
					if(err){
						reject(data);
					}

					resolve(data)
				});

			}
		})
	});
}

module.exports={publish};
