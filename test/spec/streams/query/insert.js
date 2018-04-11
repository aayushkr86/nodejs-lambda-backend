var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

exports.INSERT = INSERT

var params = {
    TableName: "streams",
    Item: {
        "id" : "en_1_1",
        "uuid" : "c7748f58-3bd9-11e8-b467-0ed5f89f718b",
        "userid" : "b3cd50a2-3c83-11e8-b467-0ed5f89f718b",
        "language" : "en",
        "title" : "asaaad",
        "date"  : "2018-04-18",
        "intro_text" : "aaaaa",
        "news_text"  : "aaaaa",
        "image"      : "none",
        "pdf"        : "2018-04-04T07:58:36.145Z-pdf2.pdf",
        "publish"    : true,
        "show_at_first_place" : false,
        "createdAt" : new Date().getTime(),
        "updatedAt" : new Date().getTime()
    },
    ReturnValues: 'ALL_OLD',
}

function INSERT(params) { //console.log(params)
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



// describe('streams queries', function() {
//     it('new stream insertion', function(done) { 
//         INSERT(params)
//         .then(function(data){
//            console.log(data)
//            done(null, data);
//         })
//         .catch(function(err){
//             console.log(err)
//             done(err);
//         })
//     })

// })