var AWS = require('aws-sdk')
var Busboy = require('busboy');
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var Minio = require('minio');
var fileType = require('file-type')
var path = require('path');
var fs = require('fs');

var S3 = new Minio.Client({
    endPoint: "172.17.0.2",
    port:9000,
    secure:false,
    accessKey: 'CZ5MTXJLFK9WPWVZXRI1',
    secretKey: 'splHypa18nqtr9yjYoZaP2/dSjgHv+kB1kkzz8HF'
});

function response(execution, cb) {
    if(execution.err) {
        response = {
            statusCode: execution.code || 406,
            headers: execution.headers ||{
            'x-custom-header': 'my custom header value',
            },
            body: JSON.stringify(execution.err||{"error":"Some Error Occured"})
        };
    }else{
        response = {
            statusCode: execution.code || 200,
            headers: execution.headers ||{
            'x-custom-header': 'my custom header value',
            },
            body: JSON.stringify(execution.body) || {}
        };
    }
    cb(null, response)
}

function authorization(token) {
    jwt.verify(token, 'shhhhh', function(err, decoded) {
        console.log(err, decoded.foo) // bar
    });
}

function execute(event, cb) { 
    file_upload(event)
    // file_upload1(event)
    .then((event, cb)=>{
        expressions(event, cb)
    })
    .then((result)=>{
        return UPDATE(result)
    })
    .then((result)=>{
    response({code:400, body:result},cb)
    })
    .catch((err)=>{
    response({code:400, err:{err}},cb)
    })
}

var multiparty = require('multiparty');

function file_upload1(event) { //console.log(event)
    return new Promise((resolve, reject)=>{ 
        var form = new multiparty.Form();
       
        form.parse(event, function(err, fields, files) { console.log('=======>')
            console.log(err, fields, files)
          });
    })
}


function file_upload(event) {
    result = {};
    return new Promise((resolve, reject)=>{
    // console.log(event)
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        };      
        var contentType = event.headers['Content-Type'] || event.headers['content-type'];
        var bb = new Busboy({ headers: { 'content-type': contentType }});

        bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('File [%s]: filename=%j; encoding=%j; mimetype=%j', fieldname, filename, encoding, mimetype);
        

        // AWS.config.update({
        //     accessKeyId: "AKIAIIRUTXFJEY7STPLA",
        //     secretAccessKey: "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",
        //     region: 'us-east-2'
        // });

        // var s3bucket = new AWS.S3({params: {Bucket: 'saletoolusers'}});
        //     s3bucket.createBucket(function (err) {   console.log('bucket created',err) })

        //     var s3 = new AWS.S3({
        //         params: {Bucket: 'saletoolusers', Key: filename, Body: file},
        //         options: {partSize: 5 * 1024 * 1024, queueSize: 10},   // 5 MB
        //     });
        //     s3.upload().on('httpUploadProgress', function (evt) {
        //         console.log(evt);
        //     }).send(function (err, data) {
        //         console.log(err, data);
        //     });

     






        file.on('data', (data) => {//console.log('File [%s] got %d bytes of data', fieldname, data.length, data)
        

            if(fieldname == 'profilepic_url' && (mimetype == "image/jpeg"||"image/png")) {  
                uploadtoS3(data, filename, mimetype)
                // upload(file, filename, mimetype)
                .then((result)=>{
                //    resolve(result) 
                })
                .catch((err)=>{
                    return reject(err)
                })
            }
            else{
                return reject('not a image file')
            }
        })
        file.on('end', () => console.log('File [%s] Finished', fieldname));
        })

        bb.on('field', (fieldname, val) =>{//console.log('Field [%s]: value: %j', fieldname, val)
        // console.log(fieldname,  val)
        // for(var key in fieldname){
        //     result
        // }
        
        })
        bb.on('finish', () => {
        console.log('Done parsing form!');
        // console.log(result)
        })
        bb.on('error', err => {
        console.log('failed', err);
        reject(err)
        });
        // bb.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
        bb.end(event.body);
    })
}

function ReadSharpString(buffer)
    {
        let length = 0, shift = 0, offset = 0;
        let byte;
        do
        {
            byte = buffer[offset++];
            length |= (byte & 0x7F) << shift;
            shift += 7;
        }
        while (byte >= 0x80);
        this.length = () => {
            return length;
        };
        this.toBuffer = () => {
            return buffer.slice(offset, offset + length)
        };
        this.toString = () => {
            return this.toBuffer().toString()
        };
    }



function uploadtoS3(buffer, filename, mimetype) { console.log(buffer)
    // var buffer_image = Buffer.from(buffer.replace(/^data:image\/\w+;base64,/, ""),"base64");

// let string = new ReadSharpString(buffer);
// var image = string.toBuffer()
// console.log(image);

// var image1 = string.toString()
// console.log(image1);

// var image2 = string.length()
// console.log(image2);

    // var fileinfo2 = fileType(image2)
    // console.log(fileinfo2)

    // var fileinfo1 = fileType(image1)
    // console.log(fileinfo1)

    // var fileinfo = fileType(image)
    // console.log(fileinfo)



//    var abc=  Buffer.from(image1).toString('base64')
//     console.log(abc)

//     var buffer1 = Buffer.from(abc.replace(/^data:image\/\w+;base64,/, ""),"base64");
//     console.log(buffer1)

//     var fileinfo = fileType(buffer1)
//     console.log(fileinfo)

// var b = Buffer(buffer);
// var readStream = fs.createReadStream(buffer);

// console.log(readStream);

    return new Promise((resolve, reject)=>{
        var params = {
            "bucketname"   : 'users',
            "filename"     : Date.now()+filename,
            "file"         : buffer,
            "content-type" : mimetype
        }
        // console.log(params)
        S3.putObject(params.bucketname, params.filename, params.file, 'image/jpeg', function(err, etag) { 
            if (err) {
                console.log(err)  
                reject(err)
            }
            else {
                console.log('File uploaded successfully.Tag:',etag) 
                result['profilepic_url'] = params.bucketname+'/'+params.filename;
                resolve(result)  
            } 
        });




    // var fs = require('fs'),
    // S3FS = require('s3fs'),
    // s3fsImpl = new S3FS('salestoolusers', {
    //     accessKeyId: 'AKIAJ67FD3KSTQ5UAUHQ',
    //     secretAccessKey: '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'
    // });
    
    // var stream = fs.createReadStream(buffer);
    // return s3fsImpl.writeFile(filename, stream).then(function () {
    //     fs.unlink(file.path, function (err) {
    //         if (err) {
    //             console.error(err);
    //         }
    //     });
        
    // });

    })
}


var s3Stream = require('s3-upload-stream')(new AWS.S3({
    accessKeyId: 'AKIAIIRUTXFJEY7STPLA',
    secretAccessKey: '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'
}));

function upload(buffer, filename, mimetype) { console.log(buffer)
    return new Promise((resolve, reject)=>{ 
    var upload = s3Stream.upload({
            'Bucket': 'salestoolusers',
            'Key': filename
        });
       
        // Handle errors.
        upload.on('error', function (err) { 
            console.log(err)
        });
        
        // Handle progress.
        upload.on('part', function (details) {
            console.log(details);
        });
        
        // Handle upload completion.
        upload.on('uploaded', function (details) {
        console.log(details)
        });
        
        // Pipe the Readable stream to the s3-upload-stream module.
        buffer.pipe(upload);
    })
}






function expressions(result, cb) {
//   return new Promise((resolve, reject)=>{
    var update_expression_array = [];
    var update_names_object = {};
    var update_values_object = {};
    for(var key in result) {
        if(key != 'username') {
            var temp = key.substring(0, 3)
            update_expression_array.push('#'+temp+'=:'+key+'_val');
            update_names_object['#'+temp] = key
            update_values_object[':'+key+'_val'] = result[key]
        }
    }
    update_expression_array.push('updatedAt = :updatedAt')
    update_values_object[':updatedAt'] = new Date().getTime() 
    var update_expression_string = update_expression_array.join(', ')
    // console.log(update_expression_array)
    // console.log(update_expression_string)
    // console.log(update_names_object)
    // console.log(update_values_object)
    result = {
        "update_expression_string" : update_expression_string,
        "update_names_object" : update_names_object,
        "update_values_object" : update_values_object,
    }
    cb(result)
    // resolve(result)
//   })
}


function UPDATE(result) {
    var params = {
    TableName: "users",
    Key: {
        "username": request.username,
        // "createdAt": result.createdAt,
    },
    UpdateExpression: 'SET '+result.update_expression_string,
    ExpressionAttributeNames : result.update_names_object,
    ExpressionAttributeValues: result.update_values_object,
    // ConditionExpression: 'attribute_exists(userid) AND attribute_exists(createdAt)',
    ReturnValues: 'ALL_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
    }
    console.log(params)
    return new Promise(function(resolve, reject) {
        // docClient.update(params, function(err, data) {
        //     if (err) {
        //         console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
        //         reject(err.message)
        //     }
        //     else if(Object.keys(data).length == 0) { 
        //         reject("no item found")
        //     }
        //     else {
        //         console.log("updation succeeded",data);
        //         resolve(data)
        //     }
        // })
    });
}



module.exports = {execute};