const multipart = require('aws-lambda-multipart-parser')
const fileType   = require('file-type')
// const AWS = require('aws-sdk')
// var S3 = new AWS.S3();
exports.handler = function(event, context, callback) {
// console.log(event)
   var data = multipart.parse(event, true)
//   console.log(data);
    var fileMine = fileType(data.profile_pic.content.data)
        console.log(fileMine)
    if(fileMine.mime == null) {
        return callback(null, 'not a image file')
    }



    
var params = {
    "bucketname"   : 'users',
    "filename"     : Date.now(),
    "file"         : data.profile_pic.content.data,
}
//console.log(params)
// S3.putObject(params.bucketname, params.filename, params.file, 'image/jpeg', function(err, etag) { 
//     if (err) {
//         console.log(err)  
//     }
//     else {
//         console.log('File uploaded successfully.Tag:',etag) 
//     } 
// });

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(data),
    };
    callback(null, response);
}