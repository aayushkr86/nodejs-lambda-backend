
let GET = require('./GET');
let POST = require('./POST');
let PUT = require('./PUT');
<<<<<<< HEAD
// let DELETE = require('./DELETE');
=======
let DELETE = require('./DELETE');
>>>>>>> development-vinay
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
<<<<<<< HEAD
		case 'GET': GET.execute(event.queryparameter,callback);
=======
		case 'GET': GET.execute(event.queryStringParameters,callback);
>>>>>>> development-vinay
					break;
		/** login / signip */
		case 'POST': POST.execute(event.body,callback);
					break;
		/** challenge */
		case 'PUT': PUT.execute(event.body,callback);
					break;
		/** logout */
<<<<<<< HEAD
		// case 'DELETE': DELETE.execute(event.body,callback);
		// 			break;
=======
		case 'DELETE': DELETE.execute(event.body,callback);
					break;
>>>>>>> development-vinay
		/** not Found */
		default : GET.execute({},callback);
	}
}
