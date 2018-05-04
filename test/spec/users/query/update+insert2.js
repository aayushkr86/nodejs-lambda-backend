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
    // file_upload(event)
    // file_upload1(event)
    file_upload2(event)
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


function file_upload(event) { 
    var multipart = require('aws-lambda-multipart-parser');
    var Multipart = require('lambda-multipart');

    return new Promise((resolve, reject)=>{
    console.log('====>')
        // multipart.parse(event, spotText, function(data) {   console.log('====>')
        //     console.log(data)
        // })

        var parser = new Multipart(event);

        parser.on('field',function(key, value){
        console.log('received field', key, value);
        });

        parser.on('file',function(file){ console.log(file)
        //file.headers['content-type']
        // file.pipe(fs.createWriteStream(__dirname+"/downloads/"+file.filename));
        });

        parser.on('finish',function(result){
        //result.files (array of file streams)
        //result.fields (object of field key/values)
        console.log("Finished")
        console.log(result.files)

        try {
          result.files[0].pipe(fs.createWriteStream(__dirname+"/new_photo.png"));  
        }
        catch(err) {
            console.log('fs write err:', err)
        }

        // var streamToBuffer = require('stream-to-buffer')
        // var stream = result.files[0]
         
        // streamToBuffer(stream, function (err, buffer) {
        //   console.log(err, buffer)

        // var fileinfo = fileType(buffer)
        // console.log(fileinfo)
        // uploadtoS3(buffer, 'new file.png', 'new')
        // })

        // uploadtoS3(result.files[0], 'new file.png', 'new')

        });
    })
}



function file_upload1(event) { //console.log(event)
// console.log(event['body'])
console.log(event.headers['Content-Type'])

    // var abc=  event.headers['Content-Type']
    // var a = abc.split(';')
    // var b = a[1].split('=') 
    // console.log(b[1])

    var multipart = require('parse-multipart');
    return new Promise((resolve, reject)=>{

        //method 1
        var body = event['body'];
        var boundary = event.headers['Content-Type'];
        var parts = multipart.Parse(abc, boundary);
        console.log(parts)
        for(var i=0;i<parts.length;i++) {
            var part = parts[i];
            // will be:
            // { filename: 'A.txt', type: 'text/plain', 
            //		data: <Buffer 41 41 41 41 42 42 42 42> }
            // console.log(part)
        }

        

        //method2
        var bodyBuffer = new Buffer(abc.toString(),'base64');
        var boundary = multipart.getBoundary(event.headers['Content-Type']);
        var parts = multipart.Parse(bodyBuffer,boundary);
        console.log(parts)

        
    })
}



function file_upload2(event) { //console.log(event)
    // console.log(event['body'])
    // console.log(event.headers['Content-Type'])
    // var formidable = require('formidable')
        return new Promise((resolve, reject)=>{
            var form = new formidable.IncomingForm();
            form.parse(event, function(err, fields, files) {  console.log('=======>')
              console.log(err, fields, files)
            });  




        })

}
    












function uploadtoS3(buffer, filename, mimetype) { //console.log(buffer)
    // var buffer_image = Buffer.from(buffer.replace(/^data:image\/\w+;base64,/, ""),"base64");
    // var fileinfo = fileType(buffer)
    // console.log(fileinfo)
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
                console.log("err", err)  
                reject(err)
            }
            else {
                console.log('File uploaded successfully.Tag:',etag) 
                // result['profilepic_url'] = params.bucketname+'/'+params.filename;
                resolve("result")  
            } 
        }); 
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