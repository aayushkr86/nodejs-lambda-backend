/// // ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk')
const response 		= require('./lib/response.js')
const database 	= require('./lib/database')

if (process.env.AWS_REGION == 'local') {
  mode 			= 'offline'
  // sns 		= require('../../../offline/sns');
  docClient = require('../../../offline/dynamodb').docClient
  S3 			  = require('../../../offline/S3');
  dynamodb 	= require('../../../offline/dynamodb').dynamodb;
} else {
  mode 			= 'online'
  // sns 		= new AWS.SNS();
  docClient = new AWS.DynamoDB.DocumentClient({})
  S3 			  = new AWS.S3();
  dynamodb 	= new AWS.DynamoDB();
}
/// // ...................................... end default setup ............................................////

/**
 * modules list
 */
const ypi = require('youtube-playlist-info');

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute (event, callback) {
    fecthVideos()
    .then(function (result) {
      response({code: 200, body: result}, callback)
    })
    .catch(function (err) {
      console.log(err)
      response({code: 400, err: {err}}, callback)
    })
}

function fecthVideos () { 
    const url = process.env.PLAYLIST_URL;
    const API_KEY = process.env.GOOGLE_API_KEY;
    const playlistId = url.split('=')
    const options = {
        maxResults: 25
    };

    return new Promise((resolve, reject)=>{
        // ypi(API_KEY, playlistId[1], options) 
        ypi(API_KEY, 'PL35F93FA3C740F3BB', options) 
        .then((items)=> {
            // console.log(items);
            resolve(items)
        }).catch((error)=> {
            console.log(error);
            reject("something went wrong")
        });
    })
}
/**
 * last line of code
 * @json {main_object}
 */
module.exports = {execute}
