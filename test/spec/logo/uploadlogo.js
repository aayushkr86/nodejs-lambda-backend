var Minio = require('minio')

var minioClient = new Minio.Client({
    endPoint: 'http://127.0.0.1',
    port: 9000,
    secure: true,
    accessKey: 'CZ5MTXJLFK9WPWVZXRI1',
    secretKey: 'splHypa18nqtr9yjYoZaP2/dSjgHv+kB1kkzz8HF'
});


function UPLOAD(){
    var file = '/tmp/photos-europe.tar'
    console.log(file)
    // // Make a bucket called europetrip.
    // minioClient.makeBucket('europetrip', 'us-east-1', function(err) {
    //     if (err) return console.log(err)
    
    //     console.log('Bucket created successfully in "us-east-1".')
    
    //     // Using fPutObject API upload your file to the bucket europetrip.
    //     minioClient.fPutObject('europetrip', 'photos-europe.tar', file, 'application/octet-stream', function(err, etag) {
    //       if (err) return console.log(err)
    //       console.log('File uploaded successfully.')
    //     });
    // });
}


describe('upload file test', function(){
    it('upload file', function(done){
            UPLOAD()
            .then(function(data){
                console.log(data)
                done(null, data)
            })
            .catch(function(error){
                console.log(error)
                done(error)
            })
    })
})
