const AWS = require('aws-sdk')
// var S3 = new AWS.S3();
var S3 = new AWS.S3({region: 'eu-central-1'});
AWS.config.region = 'eu-central-1';

AWS.config.update({accessKeyId: 'AKIAIIRUTXFJEY7STPLA', secretAccessKey: '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'})


function deleteFilesFromS3(array, directory) {
    return new Promise((resolve, reject)=>{
        var params = { 
            Bucket: 'talkd',
            Delimiter: '/',
            Prefix: `streams/${directory}`
           }
           S3.listObjects(params, function (err, data) {
            if (err) {
              console.log('Unable to list object', err);
              reject('unable to list objects');
            }
      
            console.log(data);
        })
    })
}

describe('pdf upload test', function(){
    it('test', function(done){
        var array = ['.pdf'];
        deleteFilesFromS3(array,'aeef9d20-5771-11e8-8657-5b3132062559')
        .then((data)=>{
            // console.log(data)
        })
        .catch((err)=>{
            console.log(err)
        })
        done()
    })
})