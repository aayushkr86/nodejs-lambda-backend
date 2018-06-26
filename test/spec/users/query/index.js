let UPDATE = require('../query/getBatchUsers');

exports.handler = function (event, context, cb) { 
   
    UPDATE.execute(event, cb)
    
}