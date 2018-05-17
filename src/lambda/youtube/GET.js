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
const youtubedl = require('youtube-dl');

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
    const playlistId = url.split('=')
    const options = {
        maxResults: 25
    };
    return new Promise((resolve, reject)=> {
        if(url == undefined || process.env.GOOGLE_API_KEY == undefined) {
            return reject('PLAYLIST_URL or GOOGLE_API_KEY env variables not set')
        }
        ypi(process.env.GOOGLE_API_KEY, playlistId[1], options)
        .then((items)=> {
            var urls = []; 
            items.forEach((elem)=>{
                var videoId = elem.resourceId.videoId;
                var url = 'http://www.youtube.com/watch?v='+videoId;
                urls.push(url)
            })
            var videos = [];
            function delay(url) { //console.log(url)
                return new Promise((resolve)=>{ 
                    youtubedl.getInfo(url, function(err, info) { console.log(info.length)
                        if (err) {
                            console.log(err); 
                        }
                        info.forEach((elem)=>{
                        var itemObj = {
                            'id' : elem.id,
                            'title' : elem.title,
                            'thumbnail' : elem.thumbnail,
                            'filename' : elem._filename,
                            'format' : elem.format,
                            'url' : elem.url
                        }; 
                        // console.log(itemObj);
                        videos.push(itemObj)
                        })
                        resolve()
                    });  
                }) 
            }
            // series
            async function youtube(array) {
                for(var i=0; i<array.length; i=i+5) {
                    var item = [];
                    for(var j=0; j<5; j++) {
                        if(array[i+j] != undefined) {
                            item.push(array[j+i]);
                        }
                    }
                // console.log(item);
                await delay(item)
                }
                console.log('DONE');
                // console.log("videos", videos);
                resolve({'items' : videos});
            }

            youtube(urls)

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
