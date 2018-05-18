/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk')
const response 	= require('./lib/response.js')
const database 	= require('./lib/database')

if (process.env.AWS_REGION == 'local') {
  mode 		= 'offline'
//   sns 	= require('../../../offline/sns');
  docClient = require('../../../offline/dynamodb').docClient
  S3 		= require('../../../offline/S3');
  dynamodb 	= require('../../../offline/dynamodb').dynamodb;
} else {
  mode 		= 'online'
  // sns 	= new AWS.SNS();
  docClient = new AWS.DynamoDB.DocumentClient({})
  S3 		= new AWS.S3();
  dynamodb 	= new AWS.DynamoDB();
}
/// // ...................................... end default setup ............................................////

/**
 * modules list
 */
const youtubedl  = require('youtube-dl');
const Ajv 	     = require('ajv')
const setupAsync = require('ajv-async')
const ajv 		 = setupAsync(new Ajv())

var postSchema = {
  $async:true,
  type: "object",
  properties: {
    'videoIds' : {
        type: "array",
        maxItems:5,
        minItems:1
    },
  },
  required : ["videoIds"]
}

var validate = ajv.compile(postSchema)
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (data, callback) { 
    validate_all(validate, data)
    .then(function (result) { 
      return getUrl(result)
    })
    .then(function (result){ 
      response({code: 200, body: result}, callback)
    })
    .catch(function (err){
      response({code: 400, err: {err}}, callback)
    })
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate, data) { 
    if(typeof data == 'string'){
        data = JSON.parse(data)
    }
    return new Promise((resolve, reject) => {
        validate(data).then(function (res) {
            resolve(res)
        }).catch(function (err) {
            console.log(JSON.stringify(err, null, 6))
            reject(err.errors[0].dataPath + ' ' + err.errors[0].message)
        })
    })
}

function getUrl(result){ 
    return new Promise((resolve, reject)=>{
        var urls = []; 
        result.videoIds.forEach((videoId)=>{
            var url = 'http://www.youtube.com/watch?v='+videoId;
            urls.push(url)
        });
        youtubedl.getInfo(urls, function(err, info) { //console.log(info.url)
            if (err) {
                console.log(err);
                reject(err) 
            }
            var videos = [];
            if(info.length){
                info.forEach((elem)=>{
                var itemObj = {
                    'id' : elem.id,
                    'title' : elem.title,
                    'thumbnail' : elem.thumbnail,
                    'filename' : elem._filename,
                    'format' : elem.format,
                    'url' : elem.url
                }; 
                videos.push(itemObj)
                })
                resolve({'urls' : videos})
            }else{
                var itemObj = {
                    'id' : info.id,
                    'title' : info.title,
                    'thumbnail' : info.thumbnail,
                    'filename' : info._filename,
                    'format' : info.format,
                    'url' : info.url
                }; 
                videos.push(itemObj)
                resolve({'urls' : videos})
            } 
        });  
    })
}


/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
