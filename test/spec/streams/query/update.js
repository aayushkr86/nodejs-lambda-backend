var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

var data = require('../../../log/stream_update')

var ExpressionString = "set ";
var ValuesObj = {};
var ExpressionString_arr = [];

var bodyparams = new Bodyparams()
var filesparams = new Filesparams()

function Bodyparams() { //console.log(data)
    // if(data.language != undefined) { 
    //     ExpressionString_arr.push('language = :language')
    //     ValuesObj[':language'] = data.language
    // }
    if(data.title != undefined) { 
        ExpressionString_arr.push('title = :title')
        ValuesObj[':title'] = data.title
    }
    if(data.intro_text != undefined) { 
        ExpressionString_arr.push('intro_text = :intro_text')
        ValuesObj[':intro_text'] = data.intro_text 
    }
    if(data.news_text != undefined) { 
        ExpressionString_arr.push('news_text = :news_text')
        ValuesObj[':news_text'] = data.news_text   
    }
    if(data.publish != undefined) { 
        ExpressionString_arr.push('publish = :publish')
        ValuesObj[':publish'] = data.publish   
    }
    if(data.show_at_first_place != undefined) { 
        ExpressionString_arr.push('show_at_first_place = :show_at_first_place')
        ValuesObj[':show_at_first_place'] = data.show_at_first_place  
    } 
    // if(data.date != undefined) { 
    //     ExpressionString_arr.push('date = :date')
    //     ValuesObj[':date'] = data.date
    // }
}

function Filesparams() { // console.log(data)
    if(data.image != undefined) { 
        ExpressionString_arr.push('image = :image')
        ValuesObj[':image'] = data.image
    } 
    if(data.pdf != undefined) { 
        ExpressionString_arr.push('pdf = :pdf')
        ValuesObj[':pdf'] = data.pdf  
    } 
}
    // updatedAt
    ExpressionString_arr.push('updatedAt = :updatedAt')
    ValuesObj[':updatedAt'] = new Date().getTime()  

    var ExpressionString_arrSplit = ExpressionString_arr.join(", "); //spereate array by commas and space
    ExpressionString += ExpressionString_arrSplit; 

var params = {
    TableName: "streams",
    Key: {
        "id": "en_1_0",
        "updatedAt": 1523368694193
    },
    UpdateExpression : ExpressionString,
    ExpressionAttributeValues : ValuesObj,
    ReturnValues: 'ALL_NEW', 
}

function UPDATE() {
    return new Promise(function(resolve, reject) {
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            }else if(Object.keys(data).length == 0) {
                reject("no item found")
            } 
            else {
                console.log("updation succeeded",data);
                resolve(data)   
            }
        })
    });
}

describe('streams queries', function() {
    it('update table', function(done) { 
        UPDATE()
        .then(function(data){
        //    console.log(data)
           done(null, data);
        })
        .catch(function(err){
            // console.log(err)
            done(err);
        })
    })

})