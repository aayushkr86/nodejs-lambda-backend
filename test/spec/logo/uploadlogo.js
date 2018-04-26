var Minio = require('minio')

var minioClient = new Minio.Client({
    endPoint: '172.17.0.2',
    port: 9000,
    secure: false,
    accessKey: 'CZ5MTXJLFK9WPWVZXRI1',
    secretKey: 'splHypa18nqtr9yjYoZaP2/dSjgHv+kB1kkzz8HF'
});


function UPLOAD(){
    return new Promise((resolve, reject) =>{
        var file = './upload/cat.jpg'
        // console.log(file)
        // // Make a bucket called europetrip.
        // minioClient.makeBucket('logo', 'us-east-1', function(err) {
        //     if (err) {
        //     //    console.log(err)
        //     //    return reject(err)
        //     }
        //     console.log('Bucket created successfully in "us-east-1".')
        
            // Using fPutObject API upload your file to the bucket europetrip.
            minioClient.fPutObject('logo', `catphoto_${Date.now()}`, file, 'application/octet-stream', function(err, etag) {
              if (err) {
                   console.log(err)
                   return reject(err)
                }
              console.log('File uploaded successfully.Tag:',etag)
                    resolve(etag)
            });
        // });
    })
}


describe('upload file test', function(){
    it('upload file', function(done){
            UPLOAD()
            .then(function(data){
                // console.log(data)
                done(null, data)
            })
            .catch(function(error){
                console.log(error)
                done(error)
            })
    })
})
