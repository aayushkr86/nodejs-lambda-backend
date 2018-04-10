var Minio = require('minio')
var ip = require('ip');


try{
	var minioClient = new Minio.Client({
     endPoint: "172.17.0.2",
     port:9000,
     secure:false,
     accessKey: 'V5ZGL06ITLYXVFCBB4VS',
     secretKey: 'NBHRoCLFVGk3AczTf6bPGzHlPqh4y80WhcfxnbAZ'
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

