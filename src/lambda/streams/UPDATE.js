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
const async     = require('async')
const Ajv 			= require('ajv')
const setupAsync 	= require('ajv-async')
const ajv 			= setupAsync(new Ajv())
var patchSchema = {
  $async: true,
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    userid: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    },
    language: {
      type: 'string',
      enum: ['en', 'de']
    },
    title: {
      type: 'string',
      minLength: 5,
      maxLength: 50
    },
    date: {
      type: 'number'
    },
    newdate: {
      type: 'number'
    },
    intro_text: {
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    news_text: {
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    image: {
      type: 'string'
    },
    pdf: {
      type: 'string'
    },
    publish: {
      type: 'boolean'
    },
    show_at_first_place: {
      type: 'boolean'
    }
  },
  required: ['id', 'date']
}

var validate = ajv.compile(patchSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) {
  validate_all(validate, data)
    .then(function (result) {
      return update_streams(result)
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

function update_streams (result) {
  var params = {
    TableName: database.Table[0].TableName,
    Key: {
      'id': result.id,
      'date': result.date
    },
    ReturnValues: 'ALL_OLD' // optional (NONE | ALL_OLD)
  }
  return new Promise(function (resolve, reject) {
    docClient.delete(params, function (err, data) {
      if (err) {
        console.error('Unable to update. Error:', JSON.stringify(err, null, 2))
        reject(err.message)
      } else if (Object.keys(data).length == 0) {
        reject('no item found')
      } else {
        console.log('deleted succeeded', data)
        var params = {
          TableName: database.Table[0].TableName,
          Item: {
            'updatedAt': new Date().getTime()
          }
        }
        params.Item.id = result.id
        params.Item.date = result.newdate ? result.newdate : data.Attributes.date,
        params.Item.uuid = result.uuid ? result.uuid : data.Attributes.uuid,
        params.Item.userid = result.userid ? result.userid : data.Attributes.userid,
        params.Item.language = result.language ? result.language : data.Attributes.language,
        params.Item.title = result.title ? result.title : data.Attributes.title,
        params.Item.intro_text = result.intro_text ? result.intro_text : data.Attributes.intro_text,
        params.Item.news_text = result.news_text ? result.news_text : data.Attributes.news_text,
        params.Item.image = result.image ? result.image : data.Attributes.image,
        params.Item.pdf = result.pdf ? result.pdf : data.Attributes.pdf,
        params.Item.publish = data.Attributes.publish,
        params.Item.show_at_first_place = data.Attributes.show_at_first_place,
        params.Item.createdAt = result.createdAt ? result.createdAt : data.Attributes.createdAt
        if (result.publish != undefined) {
          params.Item.publish = result.publish
          var publish = result.publish ? 1 : 0
          var show_first = params.Item.show_at_first_place ? 1 : 0
          params.Item.id = params.Item.language + '_' + publish + '_' + show_first
        }
        if (result.show_at_first_place != undefined) {
          params.Item.show_at_first_place = result.show_at_first_place
          var show_first = result.show_at_first_place ? 1 : 0
          var publish = params.Item.publish ? 1 : 0
          params.Item.id = params.Item.language + '_' + publish + '_' + show_first
        }
        console.log('params', params)
        docClient.put(params, function (err, data) {
          if (err) {
            console.error('Error:', JSON.stringify(err, null, 2))
            reject(err.message)
          } else {
            console.log('Successfully updated:', data)
            result['result'] = {'message': 'Successfully updated'}
            resolve(result)
          }
        })
      }
    })
  })
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
