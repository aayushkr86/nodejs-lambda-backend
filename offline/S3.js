var Minio = require('minio');

try{
	var minioClient = new Minio.Client({
     	endPoint: "172.17.0.2",
     	port:9000,
	 	secure:false,
	 	accessKey: 'CZ5MTXJLFK9WPWVZXRI1',
     	secretKey: 'splHypa18nqtr9yjYoZaP2/dSjgHv+kB1kkzz8HF'
    //  accessKey: 'V5ZGL06ITLYXVFCBB4VS',
	//  secretKey: 'NBHRoCLFVGk3AczTf6bPGzHlPqh4y80WhcfxnbAZ'
	
	});
	// minioClient.listBuckets(function(err, buckets) {
	//   if (err) return console.log(err)
	//   console.log('buckets :', buckets)
	// });

}catch (e){
	console.log(e);
}

// var S3 = new Minio.Client({
//      endPoint: "http://127.0.0.1",
//      port:9000,
//      accessKey: 'V5ZGL06ITLYXVFCBB4VS',
//      secretKey: 'NBHRoCLFVGk3AczTf6bPGzHlPqh4y80WhcfxnbAZ'
// });

// console.log(S3);

module.exports = minioClient;

