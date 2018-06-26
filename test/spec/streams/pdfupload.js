const AWS = require('aws-sdk')
// var S3 = new AWS.S3();
var S3 = new AWS.S3({region: 'eu-central-1'});
AWS.config.region = 'eu-central-1';

AWS.config.update({accessKeyId: 'AKIAIIRUTXFJEY7STPLA', secretAccessKey: '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'})
var Minio = require('minio');
const uuid = require('uuid')

var mode = 'online';
if (mode == 'offline'){
    var S3 = new Minio.Client({
        endPoint: "172.17.0.2",
        port:9000,
        secure:false,
        accessKey: 'CZ5MTXJLFK9WPWVZXRI1',
        secretKey: 'splHypa18nqtr9yjYoZaP2/dSjgHv+kB1kkzz8HF'
    //  accessKey: 'V5ZGL06ITLYXVFCBB4VS',
    //  secretKey: 'NBHRoCLFVGk3AczTf6bPGzHlPqh4y80WhcfxnbAZ'

    });
}


function pdfUpload() {
    return new Promise((resolve, reject)=>{
        var directory = uuid.v1();
        if(mode == 'offline'){ 
            var params = {
                bucketname : 'talkd',
                filename   : 'streams'+'/'+directory+'/'+new Date().getTime()+'.'+'pdf',
                expiry:  24*60*60
            } 
            S3.presignedPutObject(params.bucketname, params.filename, params.expiry, function(err, presignedUrl){
                if(err){
                    reject(err);
                }
                resolve(presignedUrl)
            })
        }else{ 
            var params = {
                Bucket: 'talkd',
                Key: 'streams'+'/'+directory+'/'+new Date().getTime()+'.'+'pdf',
                Expires:  24*60*60
            }
            S3.getSignedUrl('putObject', params, function(err, presignedUrl){
                if(err){
                    reject(err);
                }
                resolve(presignedUrl)
            })
        }
    })
}

describe('pdf upload test', function(){
    it('test', function(done){
        pdfUpload()
        .then((data)=>{
            console.log(data)
        })
        .catch((err)=>{
            console.log(err)
        })
        done()
    })
})