///// ...................................... start default setup ............................................////
// let mode,sns,dynamodb,docClient,S3;
const AWS 			= require('aws-sdk');
const response 		= require('./lib/response.js');

if(process.env.AWS_REGION == "local"){
	mode 			= "offline";
	// sns 			= require('../../../offline/sns');
	docClient 		= require('../../../offline/dynamodb').docClient;
	// S3 			= require('../../../offline/S3');
	// dynamodb 	= require('../../../offline/dynamodb').dynamodb;
}else{
	mode 			= "online";
	// sns 			= new AWS.SNS();
	docClient 		= new AWS.DynamoDB.DocumentClient({});
	// S3 			= new AWS.S3();
	// dynamodb 	= new AWS.DynamoDB();
}
///// ...................................... end default setup ............................................////

/**
 * modules list
 */
const uuid 			= require('uuid');
const Ajv 			= require('ajv');
const setupAsync 	= require('ajv-async');
const ajv 			= setupAsync(new Ajv);
var postSchema = {
	$async:true,
	type: "object",
	properties: {
	id : {
			type: "string"
	},   
	uuid : {
			type: "string",
			pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
	},
	userid : {
			type: "string",
			pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
	},
	language:{
			type: "string" ,
			enum : ['en','de']
	},
	title : {
			type: "string",
			minLength: 5,
			maxLength: 50,
	},
	date : {
			type: "string",
			format: "date",
	},
	intro_text : {
			type: "string",
			minLength: 2,
			maxLength: 50,
	},
	news_text : {
			type: "string",
			minLength: 2,
			maxLength: 50,
	},
	image: {
			type: "string"
	},
	pdf: {
			type: "string"
	},
	publish: {
			type: "boolean"
	},
	show_at_first_place: {
			type: "boolean"
	}
	},
	required : ["userid", "title", "date", 'intro_text']
};

validate = ajv.compile(postSchema);
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
function execute(data,callback){
	validate_all(validate,data)
		.then(function(result){
			return post_stream(result);
		})
		.then(function(result){
			console.log("result");
			response({code:200,body:result.result},callback);
		})
		.catch(function(err){
			console.log(err);
			response({code:400,err:err},callback);
		})
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate,data) {
	return new Promise((resolve,reject)=>{
		validate(data).then(function (res) {
		    resolve(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

function post_stream(result) {
	var event = {};
	event.show_at_first_place = true;

	var d = new Date();
	var x = "2018-04-15"
	var y = " "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()
	var z = x + y
	console.log(z)

	var params = {
		TableName: "streams",
		Item: {
			"id" : "en_1_1",
			"date"  : Date.parse(new Date(z)),
			"uuid" : "c7748f58-3bd9-11e8-b467-0ed5f89f718b",
			"userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
			"language" : "en",
			"title" : "asaaad",
			"intro_text" : "aaaaa",
			"news_text"  : "aaaaa",
			"image"      : "none",
			"pdf"        : "2018-04-04T07:58:36.145Z-pdf2.pdf",
			"publish"    : true,
			"show_at_first_place" : event.show_at_first_place,
			"createdAt" : new Date().getTime(),
			"updatedAt" : new Date().getTime()
		},
		ReturnValues: 'ALL_OLD',
	}

	
	if(event.show_at_first_place == true) { console.log('=====>1')
    async.waterfall([
        function(done) {
            var params1 = {
                TableName: 'streams',
                KeyConditionExpression: 'id = :value', 
                ExpressionAttributeValues: { 
                    ':value': 'en_1_1',
                },
                ScanIndexForward: false, 
                Limit: 1,
            };
            docClient.query(params1, function(err, data) {
                if (err) {
                    console.error("Unable to query", JSON.stringify(err, null, 2));
                    done(true, err)
                } else if(Object.keys(data).length == 0) {
                    done(true, "no show_first_place data found") 
                }else{
                    done(null, data)
                }
            })
        },
        function(query, done) {
            console.log('=====>2', query)
            var params2 = {
                TableName: "streams",
                Key: {
                    "id": "en_1_1",
                    "date": query.Items[0].date
                },
                ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
            }
            docClient.delete(params2, function(err, data) {
                if (err) {
                    console.error("Unable to delete", JSON.stringify(err, null, 2));
                    done(true, err);
                }else if(Object.keys(data).length == 0) {
                    done(true, "no item found to be deleted")
                }else{
                    console.log("deletion succeeded",data);
                    done(null, data)
                } 
            })
        },
        function(create, done) {
        console.log('=====>3', create)
            var params3 = {
                TableName: "streams",
                Item: {
                    "id" : "en_1_0",
                    "date"  : create.Attributes.date,
                    "uuid" : create.Attributes.uuid,
                    "userid" : create.Attributes.userid,
                    "language" : create.Attributes.language,
                    "title" : create.Attributes.title,
                    "intro_text" : create.Attributes.intro_text,
                    "news_text"  : create.Attributes.news_text,
                    "image"      : create.Attributes.image,
                    "pdf"        : create.Attributes.pdf,
                    "publish"    : create.Attributes.publish,
                    "show_at_first_place" : false,
                    "createdAt" : create.Attributes.createdAt,
                    "updatedAt" : new Date().getTime()
                },
            }
            docClient.put(params3, function(err, data) {
                if (err) {
                    console.error("insertion error", JSON.stringify(err, null, 2));
                    done(true, err);
                } else {
                    console.log("Successfully updated:", data);
                }
                })
        }
    ],function(err, data){
        console.log(err, data)
    })
    }

	return new Promise(function(resolve, reject) {
        docClient.put(params, function(err, data) {
        if (err) {
            console.error("Error:", JSON.stringify(err, null, 2));
            reject(err.message)
        } else {
            console.log("Item added:", data);
            resolve({"Successfully added new stream" : data})
        }
        })  
    });

}
/**
 * last line of code
 * @json {main_object}
 */
module.exports={execute};

