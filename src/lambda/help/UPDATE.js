/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')
const database 	= require('./lib/database')

if (process.env.AWS_REGION == 'local') {
  mode 			= 'offline'
  // sns 			= require('../../../offline/sns');
  docClient 		= require('../../../offline/dynamodb').docClient
  // S3 			= require('../../../offline/S3');
  // dynamodb 	= require('../../../offline/dynamodb').dynamodb;
} else {
  mode 			= 'online'
  // sns 			= new AWS.SNS();
  docClient 		= new AWS.DynamoDB.DocumentClient({})
  // S3 			= new AWS.S3();
  // dynamodb 	= new AWS.DynamoDB();
}
/// // ...................................... end default setup ............................................////

/**
 * modules list
 */
const uuid 			= require('uuid')
const async         = require('async')
const Ajv 			= require('ajv')
const setupAsync 	= require('ajv-async')
const ajv 			= setupAsync(new Ajv())

var updateSchema = {
    $async:true,
    type: "object",
    properties: {
        userid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        },
        createdAt : {
            type : "number"
        },
        status : {
            type: "string",
            enum : ['open','inprogress','resolved','unresolved']
        },
        description : {
            type: "string",
        },
    },
    required : ["userid","createdAt","status"]
}

var validate = ajv.compile(updateSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) {
  validate_all(validate, data)
    .then(function (result) {
        return update_expressions(result)
    })
    .then(function (result) {
      return update_help(result)
    })
    .then(function (result) {
      response({code: 200, body: result.result}, callback)
    })
    .catch(function (err) {
      console.log(err)
      response({code: 400, err: {err}}, callback)
    })
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate, data) { // console.log(data)
  return new Promise((resolve, reject) => {
    validate(JSON.parse(data)).then(function (res) {
		    resolve(res)
    }).catch(function (err) {
		  console.log(JSON.stringify(err, null, 6))
		  reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}

function update_expressions(result){
    return new Promise(function(resolve, reject) {
        var update_expression_array = [];
        var update_names_object = {};
        var update_values_object = {};
        var update_expression_string
        for(var key in result) {
            if(key != 'userid' && key != 'createdAt') {
                var temp = key.substring(0, 2)
                update_expression_array.push('#'+temp+'=:'+key+'_val');
                update_names_object['#'+temp] = key
                update_values_object[':'+key+'_val'] = result[key]
            }
        }
        update_expression_array.push('updatedAt = :updatedAt')
        update_values_object[':updatedAt'] = new Date().getTime() 
        update_expression_string = update_expression_array.join(', ')

        result['update_expression_string'] = update_expression_string;
        result['update_names_object'] = update_names_object;
        result['update_values_object'] = update_values_object;
        resolve(result)
    });
}

function update_help (result) { 
    var params = {
        TableName: database.Table[0].TableName,
        Key: {
            "userid": result.userid,
            "createdAt": result.createdAt,
        },
        UpdateExpression: 'SET '+result.update_expression_string,
        ExpressionAttributeNames : result.update_names_object,
        ExpressionAttributeValues: result.update_values_object,
        ConditionExpression: 'attribute_exists(userid) AND attribute_exists(createdAt)',
        ReturnValues: 'ALL_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
    }
    return new Promise(function(resolve, reject) {
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            }
            else if(Object.keys(data).length == 0) { 
                reject("no item found")
            }
            else {
                console.log("updation succeeded",data);
                result['result'] = {'message': "Successfully updated",data}
                resolve(result)
            }
        })
    });
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
