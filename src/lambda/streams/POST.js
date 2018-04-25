/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')

if (process.env.AWS_REGION == 'local') {
  mode 			= 'offline'
  // sns 			= require('../../../offline/sns');
  docClient 		= require('../../../offline/dynamodb').docClient
  S3 			= require('../../../offline/S3');
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
const uuid 			   = require('uuid')
const async        = require('async')
const Ajv 			   = require('ajv')
const setupAsync 	 = require('ajv-async')
const ajv 			   = setupAsync(new Ajv())
const fileType     = require('file-type')
const randomstring = require("randomstring");

var postSchema = {
  $async: true,
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    uuid: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
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
      type: 'string',
      format: 'date'
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
  required: ['userid', 'title', 'date', 'intro_text', 'show_at_first_place', 'publish']
}

var validate = ajv.compile(postSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) { // console.log(data)
  validate_all(validate, data)
    .then(function (result) {
      return upload_files(result)
    })
    .then(function (result) {
      if(result.show_at_first_place == true){
         update_Show_at_first_place()
         return result;
      }
      else{
        return result
      }
    })
    .then(function (result) {
      return post_stream(result)
    })
    .then(function (result) {
      // console.log("result",result);
      response({code: 200, body: result.result}, callback)
    })
    .catch(function (err) {
      console.log(err);
      response({code: 400, err: {err}}, callback)
    })
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate, data) { 
  return new Promise((resolve, reject) => {
    if(typeof data === 'string'){
      try {
        data = JSON.parse(data)
      }catch(err){
        return reject("Error in JSON")
      }
    }
    validate(data).then(function (res) {
		    resolve(res)
    }).catch(function (err) {  
		  console.log(JSON.stringify(err, null, 6))
		  reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
    })
  })
}

function upload_files(result) { //console.log(result)
  return new Promise((resolve, reject) => {
    var buffer_image = Buffer.from(result.image.replace(/^data:image\/\w+;base64,/, ""),"base64");
    var buffer_pdf = Buffer.from(result.pdf.replace(/^data:image\/\w+;base64,/, ""),"base64");
    var fileMine_image = fileType(buffer_image)
    var fileMine_pdf = fileType(buffer_pdf)
    console.log(fileMine_image)
    console.log(fileMine_pdf)
    if(fileMine_image === null && fileMine_pdf === null) {
      return reject('No image or pdf file')
    }
    var directory = randomstring.generate(10);
    async.parallel({
      one : function(done) {
        if(fileMine_image) {
              var params = {
                  bucketname : 'streams',
                  filename   : Date.now()+'.'+fileMine_image.ext,
                  file       : buffer_image
              }
              S3.putObject(params.bucketname, directory+'/'+params.filename, params.file, 'image/jpeg', function(err, etag) {
                if (err) {
                  console.log(err)  
                  done(true, err)
                }
                else {
                  console.log('Image file uploaded successfully.Tag:',etag) 
                  result.image = params.bucketname+'/'+directory+'/'+params.filename;
                  result['directory'] = directory
                  done(null, result)  
                } 
              });
        }else{
              result.image = null;
              done(null, result)
        }      
      },
      two : function(done) {
            if(fileMine_pdf) {
                var params = {
                      bucketname : 'streams',
                      filename   : Date.now()+'.'+fileMine_pdf.ext,
                      file       : buffer_pdf
                }
                S3.putObject(params.bucketname, directory+'/'+params.filename, params.file, 'application/pdf', function(err, etag) {
                  if (err) {
                    console.log(err)  
                    done(true, err)
                  }
                  else {
                    console.log('Pdf file uploaded successfully.Tag:',etag) 
                    result.pdf = params.bucketname+'/'+directory+'/'+params.filename;
                    result['directory'] = directory
                    done(null, result)
                  } 
                });
            }else{
                result.pdf = null;
                done(null, result)
            } 
          }
    },function(err, data){ //console.log(err, data,result)
      if(err){
        return reject("unable to upload data")
      }
      resolve(result) 
    }) 
  })
}


function update_Show_at_first_place() {
  return new Promise((resolve, reject) => { 
      async.waterfall([
        function (done) {
          var params1 = {
            TableName: 'streams',
            KeyConditionExpression: 'id = :value',
            ExpressionAttributeValues: {
              ':value': 'en_1_1'
            },
            ScanIndexForward: false,
            Limit: 1
          }
          docClient.query(params1, function (err, data) {
            if (err) {
              done(true, err)
            } else if (data.Items.length == 0) {
              done(true, 'no show_at_first_place data found')
            } else {
              done(null, data)
            }
          })
        },
        function (query, done) {
          var params2 = {
            TableName: 'streams',
            Key: {
              'id': 'en_1_1',
              'date': query.Items[0].date
            },
            ReturnValues: 'ALL_OLD' // optional (NONE | ALL_OLD)
          }
          docClient.delete(params2, function (err, data) {
            if (err) {
              done(true, err)
            } else if (Object.keys(data).length == 0) {
              done(true, 'no item found to be deleted')
            } else {
              console.log('deletion succeeded', data)
              done(null, data)
            }
          })
        },
        function (create, done) {
          const pub = create.Attributes.publish ? 1 : 0
          var params3 = {
            TableName: 'streams',
            Item: {
              'id': create.Attributes.language + '_' + pub + '_' + '0',
              'date': create.Attributes.date,
              'uuid': create.Attributes.uuid,
              'userid': create.Attributes.userid,
              'language': create.Attributes.language,
              'title': create.Attributes.title,
              'intro_text': create.Attributes.intro_text,
              'news_text': create.Attributes.news_text,
              'image': create.Attributes.image,
              'pdf': create.Attributes.pdf,
              'publish': create.Attributes.publish,
              'show_at_first_place': false,
              'createdAt': create.Attributes.createdAt,
              'updatedAt': new Date().getTime()
            }
          }
          docClient.put(params3, function (err, data) {
            if (err) {
              done(true, err)
            } else {
              console.log('Successfully updated')
              resolve('Successfully updated previous show at first place')
            }
          })
        }
      ], function (err, data) {
        console.log(err, data)
        resolve(data)
      })
  })
}

function post_stream(result) { 
	const publish = result.publish ? 1 : 0;
	const show_at_first_place = result.show_at_first_place ? 1 : 0;

	var x = result.date;
	var d = new Date();
	var y = " "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	var z = x + y;
	// console.log(z)

	var params = {
		TableName: "streams",
		Item: {
			"id"         : result.language+"_"+publish+"_"+show_at_first_place,
			"date"       : Date.parse(new Date(z)),
			"uuid"       : uuid.v1(),
			"userid"     : result.userid,
			"language"   : result.language,
			"title"      : result.title,
			"intro_text" : result.intro_text,
			"news_text"  : result.news_text,
			"image"      : result.image,
			"pdf"        : result.pdf,
			"publish"    : result.publish,
			"show_at_first_place" : result.show_at_first_place,
			"createdAt" : new Date().getTime(),
      "updatedAt" : new Date().getTime(),
      "directory" : result.directory 
		},
		ReturnValues: 'ALL_OLD',
	}

  return new Promise(function (resolve, reject) {
    docClient.put(params, function (err, data) {
      if (err) {
        console.error('Error:', JSON.stringify(err, null, 2))
        reject(err.message)
      } else {
        console.log('Item added:', data)
        result['result'] = {'message': 'New Stream Inserted Successfully'}
        resolve(result)
      }
    })
  })
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
