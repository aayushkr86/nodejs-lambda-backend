var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

exports.INSERT = INSERT

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

var params1 = {
TableName: 'streams',
KeyConditionExpression: 'id = :value', 
ExpressionAttributeValues: { 
    ':value': 'en_1_1',
},
ScanIndexForward: false, 
Limit: 1,
};

function INSERT() { 
  
    if(event.show_at_first_place == true) {
        docClient.query(params1, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                
            } else if(Object.keys(data).length != 0) {
                console.log("Query succeeded",data);
                var params2 = {
                    TableName: "streams",
                    Key: {
                        "id": "en_1_1",
                        "date": data[0].date
                    },
                    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
                }

                docClient.delete(params2, function(err, data) {
                    if (err) {
                        console.error("Unable to delete. Error:", JSON.stringify(err, null, 2));
                    }else if(Object.keys(data).length == 0) {
                        console.log("no item found")
                    } 
                    else {
                        console.log("deleted succeeded",data);
                        
                        params = {
                            TableName: "streams",
                            Item: {
                                "id" : "en_1_0",
                                "date"  : data.date,
                                "uuid" : data.uuid,
                                "userid" : data.userid,
                                "language" : data.language,
                                "title" : data.title,
                                "intro_text" : data.intro_text,
                                "news_text"  : data.news_text,
                                "image"      : data.image,
                                "pdf"        : data.pdf,
                                "publish"    : data.publish,
                                "show_at_first_place" : false,
                                "createdAt" : data.createdAt,
                                "updatedAt" : new Date().getTime()
                            },
                           
                        }
                        // console.log(params)
                        docClient.put(params, function(err, data) {
                            if (err) {
                                console.error("Error:", JSON.stringify(err, null, 2));
                                reject(err.message)
                            } else {
                                console.log("Successfully updated:", data);
                                resolve({"Successfully updated" : data})
                            }
                            }) 
        
                    }
                })


            }
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