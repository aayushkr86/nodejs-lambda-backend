var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var async = require('async')

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



function INSERT() {
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

describe('streams queries', function() {
    it('new stream insertion', function(done) { 
        INSERT()
        .then(function(data){
           console.log(data)
           done(null, data);
        })
        .catch(function(err){
            console.log(err)
            done(err);
        })
    })

})