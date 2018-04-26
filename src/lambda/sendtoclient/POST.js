///// ...................................... start default setup ............................................////
let mode,sns,dynamodb,docClient,S3;
const AWS 		= require('aws-sdk');
const response 	= require('./lib/response.js');
const database 	= require('./lib/database.js');

if(process.env.AWS_REGION == "local"){
	mode 		= "offline";
	sns 		= require('../../../offline/sns');
	docClient 	= require('../../../offline/dynamodb').docClient;
	S3 			= require('../../../offline/S3');
	// dynamodb = require('../../../offline/dynamodb').dynamodb;
}else{
	mode 		= "online";
	sns 		= new AWS.SNS();
	docClient 	= new AWS.DynamoDB.DocumentClient({});
	S3 			= new AWS.S3();
	// dynamodb = new AWS.DynamoDB();
}
///// ...................................... end default setup ............................................////
if(mode == "offline"){
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/src/lambda/sendtoclient/bin';
	process.env['LD_LIBRARY_PATH'] = process.env['LAMBDA_TASK_ROOT'] + '/src/lambda/sendtoclient/bin';
}else{
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/bin';
	process.env['LD_LIBRARY_PATH'] = process.env['LAMBDA_TASK_ROOT'] + '/bin';
}

//modules defined here
// const uuid 		= require('uuid');
const fs 		= require('fs');
//call another lambda
// const execute_lambda = require('./lib/lambda')('sample2');
const scissors 		= require('scissors');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const mailer 		= require('nodemailer');
const ajv 			= setupAsync(new Ajv);

// configured mail
let transporter = 
	mailer.createTransport({
            service: 'Gmail',
            // host: 'smtp.gmail.com',
            // port: 587,
            // secure: false, // true for 465, false for other ports
            auth: {
                user: 'aayushkr90@gmail.com', 
                pass: 'Qwerty12345#' 
            },
        tls: {
                rejectUnauthorized : false
            }
        });

const postSchema = {
	"$async":true,
  	"additionalProperties": false,
  	"required": ["emailId","emailChangeContent","pdfContent"],
	"type":"object",
  	"properties":{
    	"emailId":{
            "uniqueItems": true,
    		"type":"array",
            "minItems": 1,
            "maxItems": 10,
    		"items":{"type":"string"}
    	},
    	"emailChangeContent":{
    		"type":"array",
            "uniqueItems": true,
            "minItems": 0,
            "maxItems": 10,
    		"items":{
    			"type":"object",
    			"properties":{
    				"contentName":{"type":"string"},
    				"contentValue":{"type":"string"}
    			}
    		}
    	},
    	"pdfContent":{
    		"type":"array",
            "minItems": 1,
            "maxItems": 10,
            "uniqueItems": true,
    		"items":{
                "required": ["mode","fileId","fileOrder","page"],
    			"type":"object",
    			"properties":{
    				"mode":{"type":"string"},
    				"fileId":{"type":"string"},
    				"fileOrder":{"type":"number"},
    				"page":{
                        "anyOf":[
                            {
                                "type":"array",
                                "items":{"type":"number"}
                            },
                            {"enum":["all"]}
                        ]
    				}
    			}
        	}
    	}
  	}
};

const validate = ajv.compile(postSchema);

module.exports={execute};

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	if(typeof data == "string"){
		data = JSON.parse(data);
	}
	validate_all(validate,data)
		.then(function(result){
			return Get_file_pos(result);
		})
		.then(function(result){
			console.log(JSON.stringify(result,null,6));
			return Get_S3_files(result);
		})
		.then(function(result){
			return Pdf_Manupulation(result);
		})
		.then(function(result){
			return Mail_send(result);
		})
		// .then(function(result){
		// 	fs.readFile('/tmp/out.pdf',function(e,d){
		// 		S3.putObject('kal','out.pdf',d,(err,et)=>{
		// 			console.log(err,et);
		// 		})
		// 	})
		// })
		.then(function(result){
				response({code:200,body:result},callback);
		})
		.catch(function(err){
			response({code:400,err:{err}},callback);
		})
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all(validate,data) {
	return new Promise((resolve,reject)=>{
		validate(data).then(function (res) {
			console.log(res);
		    resolve(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

/**
 * get file position in the S3
 */
function Get_file_pos(result){
	let keys = [];
	console.log(JSON.stringify(result,null,6));

	result.pdfContent.forEach(function(pdf){
		var k = {
			"fileId":pdf.fileId,
			"fileOrder":pdf.fileOrder
		};
		keys.push(k);
	});
	let params={};
	params={
		RequestItems:{
		},
		ReturnConsumedCapacity: 'NONE'
	};
	params.RequestItems[database.Table[0].TableName]= {
							            Keys: keys,
							            AttributesToGet: [
							            	"fileId",
							            	"fileOrder",
							            	"fileS3Key",
											"fileS3Bucket"
							            ],
							            ConsistentRead: false, // optional (true | false)
							        };
		console.log(params);

	return new Promise((resolve,reject)=>{
		docClient.batchGet(params, function(err, data) {
		    if(err){
		    	reject(err);
		    }
		    console.log(data);
		    if(typeof data =="string"){
		    	data = JSON.parse(data);
		    }
		    console.log("===========================>");
		    console.log(data.Responses)
		    let totalfetcheddata=[];
		    result.pdfContent.forEach((elem2,j)=>{
		    	data.Responses.FILES.forEach((elem1,i)=>{
		    		if(elem1.fileId == elem2.fileId && elem1.fileOrder == elem2.fileOrder){
		    			data.Responses.FILES[i].page = result.pdfContent[j].page;
		    			data.Responses.FILES[i].mode = result.pdfContent[j].mode;
		    			file={
		    				"fileS3Bucket":data.Responses.FILES[i].fileS3Bucket,
		    				"fileS3Key":data.Responses.FILES[i].fileS3Key,
		    				"mode":result.pdfContent[j].mode,
		    				"page":result.pdfContent[j].page
		    			};
		    			totalfetcheddata.push(file);
		    		}
		    	});
		    });

		    /**
		     * Now result data and requested data need to merge to get specified data
		     */
		    result['files']=totalfetcheddata;
		    resolve(result);
		});
	})
}

/**
 * get file from the S3
 * from the array of bucket and files asyncrobously
 */
function Get_S3_files(result){
	var promise_result=[];
	const file = result.files;
	console.log(file);
	return new Promise((resolve,reject)=>{
		get_S3_file(promise_result,file,result)
			.then(function(alldownloaded){
				console.log(alldownloaded);
				result['storage']=alldownloaded;
				resolve(result);
			})
			.catch(function(e){
				console.log(e);
				reject(e.message);
			});
	});
}
/** helper for the Get_S3_files */
function get_S3_file(promise_result,file,result){
	var totalresult=[];
	let copy_local=function (bucket,filename,pos,mode,page){
		console.log(bucket,filename,pos);
		return new Promise((resolve,reject)=>{
			
			// for offline
			if(mode == "offline"){
				tmp[pos] = fs.createWriteStream("/tmp/"+filename);
				S3.getObject(bucket,filename,function(err,dataStream){
					console.log(err,dataStream);
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
							let content = {
								"mode": mode,
								"url": "/tmp/"+filename,
								"page": page,
								"i":pos
							};
							resolve(content);
						});
					}
				})
			}else{
				var params = {
				  Bucket: bucket, 
				  Key: filename
				};
				S3.getObject(params,(err,data)=>{
					console.log(err,data);
					if(err){
						reject(err);
					}else{
						if(typeof data =="string"){
							data = JSON.parse(data);
						}
						if(data.Body != undefined){
							let Buffer = data.Body;
							fs.writeFile("/tmp/"+filename,Buffer,(err)=>{
								if(err){
									reject(err);
								}else{
									let content = {
										"mode": mode,
										"url": "/tmp/"+filename,
										"page": page,
										"i":pos
									};
									resolve(content);
								}
							});
							// let dataStream = fs.createReadStream(Buffer);
							// dataStream
							// 	.on('error',(err)=>{
							// 		/*promise_result[pos]="error";*/
							// 		reject(err); 
							// 	})
							// 	.pipe(tmp[pos])
							// 	.on('finish',(f)=>{
							// 		// promise_result[pos]=filename+"copied";
							// 		tmp[pos].end();
							// 		let content = {
							// 			"mode": mode,
							// 			"url": "/tmp/"+filename,
							// 			"page": page,
							// 			"i":pos
							// 		};
							// 		resolve(content);
							// 	});
						}
					}
				});
			}
			// for online
		})
	}
	var tmp=[];
	file.map(function(file1,i){
		return new Promise((resolve,reject)=>{
			console.log(file1,i);
			promise_result[i] = copy_local(file1.fileS3Bucket,file1.fileS3Key+".pdf",i,file1.mode,file1.page).then(function(data){
				console.log(data);
				totalresult[data.i] = data;
			}).catch((e)=>{
				reject(e);
			})

			
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

/**
 * Pdf_Manupulation + - 
 */
function Pdf_Manupulation(result){
	let allfiles=result.storage;
	return new Promise((resolve,reject)=>{
		pdf_manipulation(allfiles)
		  .then(function(res){
		  	result['pdf_manipulation']=res;
		    resolve(result);
		  })
		  .catch(function(e){
		    reject(e);
		  })
	})
}

/** helper for the pdf manupulations */
function pdf_manipulation(selectfile){
  return new Promise((resolve,reject)=>{
      let set=[];
      let params=[];
      selectfile.forEach(function(content,i){
      	console.log(content);
        set.push(scissors(content.url) );
        params.push(set[i].pages(content.page));
      });
      console.log(params);
      scissors
        .join.apply(this,params)
        .pdfStream()
        .pipe(fs.createWriteStream('/tmp/out.pdf'))
        .on('finish',function(){
          resolve("filecreated");
        })
        .on('error',function(e){
          reject("Error"+e.message);
        })
  })
}

/**
 * send mail with attachment of the file
 */
function Mail_send(result){
	return new Promise((resolve,reject)=>{
		file = "/tmp/out.pdf";
		fs.readFile(file,(err,data)=>{
	            let mailOptions = {
	                from: 'aayushkr90@gmail.com', 
	                to: result.emailId, // list of receivers
	                subject: 'Ticket created', 
	                // text: 'power cut will happen today from 2 pm to 3pm', // plain text body
	                body: "output", // html body,
	                attachments: [{'filename': 'out.pdf', 'content': data}]
	            };
	            sendmail(mailOptions,(err,messageId)=>{
			        console.log(err,messageId);
			        if(err){
			        	reject(err)
			        }else{
			        	let sampledata = {"data":"Successfully email send with selected pdf"};
			        	resolve(sampledata);
			        }
			    });
	        });
	    function sendmail(mailOptions,callback) {
    		transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    callback(error);
                }
                console.log("info",info)
                console.log('Message sent: %s', info.messageId);         
                console.log('Preview URL: %s', mailer.getTestMessageUrl(info));
                callback(error, info.messageId);  
            });
	    }
	})
	
}

