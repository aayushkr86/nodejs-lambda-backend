
let GET = require('./GET');
let POST = require('./POST');
let PUT = require('./PUT');
let DELETE = require('./DELETE');
let DUMP = require('./DUMP');
/**
 * Main field where we will fetch all the content and passer
 * @param  {[type]}   event    [description]
 * @param  {[type]}   context  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.handler = function  (event,context,callback) {
	switch(event.httpMethod){
		case 'GET': GET.execute(event.queryStringParameters,callback);
					break;
		case 'POST': POST.execute(event.body,callback);
					break;
		case 'PUT': PUT.execute(event.body,callback);
					break;
		case 'DELETE': DELETE.execute(event.body,callback);
					break;
		default : DUMP.execute({},callback);
	}
}