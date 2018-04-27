
var S3 = require('../../../offline/S3.js');
// console.log(S3);

var fs = require('fs');

	// var totalresult=[];

	var promise_result=[];

function get_S3_file(promise_result,file){
	var totalresult=[];
	let copy_local=function (bucket,filename,pos){
		return new Promise((resolve,reject)=>{
			tmp[pos] = fs.createWriteStream("/tmp/"+filename);
			S3.getObject(bucket,filename,function(err,dataStream){
				if(err){
					reject(err)
				}
				if(dataStream == undefined){

					reject("File not found");
				}else{
						dataStream
						.on('error',(err)=>{ 
							/*promise_result[pos]="error";*/
							reject(err); 
						})
						.pipe(tmp[pos])
						.on('finish',(f)=>{
							// promise_result[pos]=filename+"copied";
							tmp[pos].end();
							resolve("/tmp/"+filename);
						});
				}
			})
		})
	}
	var tmp=[];
	file.map(function(file1,i){
		return new Promise((resolve,reject)=>{
			console.log(file1,i);
			promise_result[i]= copy_local(file1.fileS3Bucket,file1.fileS3Key,i).then(function(data){
				totalresult.push(data);
			});
		})
	})

	return new Promise((resolve1,reject1)=>{
		Promise.all(promise_result)
		.then(function(alldownloaded){
			resolve1(totalresult);
		})
		.catch(function(e){
			reject1(e);
		})
	})
}

var file = [
		{
			"fileS3Bucket":"kal",
			"fileS3Key":"pdf1.pdf"
		},{
			"fileS3Bucket":"kal",
			"fileS3Key":"pdf2.pdf"
		}
	];

get_S3_file(promise_result,file)
	.then(function(alldownloaded){
		console.log(alldownloaded);
	})
	.catch(function(e){
		console.log(e);
	})

// Promise.all(promise_result)
// 	.then(function(alldownloaded){
// 		console.log(promise_result);
// 	})
// 	.catch(function(e){
// 		// console.log(e);
// 		console.log(e.message);
// 	});




