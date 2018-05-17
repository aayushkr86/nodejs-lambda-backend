let GET = require('./GET.js');
let POST = require('./POST.js');
// let UPDATE = require('./UPDATE.js');
// let DELETE = require('./DELETE.js');
let DUMP = require('./DUMP.js'); 

/**
 * Main field where we will fetch all the content and passer
 * @param  {[type]}   event    [description]
 * @param  {[type]}   context  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.handler = function  (event, context, callback) { //console.log(event)
	switch(event.httpMethod) {
		case 'GET': GET.execute(event, callback);
					break;
		case 'POST': POST.execute(event.body, callback);
					break;
		// case 'PUT': UPDATE.execute(event, callback);
					// break;
		// case 'DELETE': DELETE.execute(event.body, callback);
		// 			break;
		default : DUMP.execute({}, callback);
	}
}