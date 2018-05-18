
let GET = require('./GET');
let POST = require('./POST');
let PUT = require('./PUT');
let DELETE = require('./DELETE');
// let DUMP = require('./DUMP');
/**
 * Main field where we will fetch all the content and passer
 * @param  {[type]}   event    [description]
 * @param  {[type]}   context  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.handler = function  (event,context,callback) {
	switch(event.httpMethod){
		/** refresh token */
		case 'GET': GET.execute(event.queryStringParameters,callback);
					break;
		/** login / signip */
		case 'POST': POST.execute(event.body,callback);
					break;
		/** challenge */
		case 'PUT': PUT.execute(event.body,callback);
					break;
		/** logout */
		case 'DELETE': DELETE.execute(event.body,callback);
					break;
		/** not Found */
		default : GET.execute({},callback);
	}
}
