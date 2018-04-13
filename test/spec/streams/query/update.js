var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)

var updateData = require('../../../log/stream_update')

var params = {
    TableName: "streams",
    Key: {
        "id": "en_1_0",
        "date": 1523736359000
    },
    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
}

function UPDATE() {
    return new Promise(function(resolve, reject) {
        docClient.delete(params, function(err, data) {
            if (err) {
                console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
                reject(err.message)
            }else if(Object.keys(data).length == 0) {
                reject("no item found")
            } 
            else {
                console.log("deleted succeeded",data);
                
                params = {
                    TableName: "streams",
                    Item: {
                        "updatedAt" : new Date().getTime()
                    },
                   
                }

                params.Item.id         = updateData.id ? updateData.id : data.id,
                params.Item.date       = updateData.newdate ? updateData.newdate : data.date,
                params.Item.uuid       = updateData.uuid ? updateData.uuid : data.uuid,
                params.Item.userid     = updateData.userid ? updateData.userid : data.userid,
                params.Item.language   = updateData.language ? updateData.language : data.language,
                params.Item.title      = updateData.title ? updateData.title : data.title,
                params.Item.intro_text = updateData.intro_text ? updateData.intro_text : data.intro_text,
                params.Item.news_text  = updateData.news_text ? updateData.news_text : data.news_text,
                params.Item.image      = updateData.image ? updateData.image : data.image,
                params.Item.pdf        = updateData.pdf ? updateData.pdf : data.pdf,
                params.Item.publish    = updateData.publish ? updateData.publish : data.publish,
                params.Item.show_at_first_place = updateData.show_at_first_place ? updateData.show_at_first_place : data.show_at_first_place,
                params.Item.createdAt  = updateData.createdAt ? updateData.createdAt : data.createdAt,

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