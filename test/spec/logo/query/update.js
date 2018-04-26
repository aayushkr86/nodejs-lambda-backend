var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var toUpdatedata = require('../../../log/logo_validations.json').update[0]
var async = require('async')
var params = {
    TableName: "logo",
    Key: {
        "status": "active",
        "updatedAt": 1523950290720,
    },
    ReturnValues: 'ALL_OLD', // optional (NONE | ALL_OLD)
}

// function UPDATE() {
//     return new Promise(function(resolve, reject) {
//         docClient.delete(params, function(err, data) {
//             if (err) {
//                 console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
//                 reject(err.message)
//             }else if(Object.keys(data).length == 0) {
//                 reject("no item found")
//             } 
//             else {
//                 console.log("deleted succeeded",data);
//                 params = {
//                     TableName: "logo",
//                     Item: {},     
//                 }
//                 for(var obj in data.Attributes) { 
//                     params.Item[obj] = toUpdatedata[obj] ? toUpdatedata[obj] : data.Attributes[obj]
//                 }
//                 params.Item.updatedAt = new Date().getTime();
//                 console.log(params)
//                 docClient.put(params, function(err, data) {
//                     if (err) {
//                         console.error("Error:", JSON.stringify(err, null, 2));
//                         reject(err.message)
//                     } else {
//                         console.log("Successfully updated:", data);
//                         resolve({"Successfully updated" : data})
//                     }
//                 }) 
//             }
//         })
//     });
// }


function UPDATE() {
    return new Promise(function(resolve, reject) {
        async.waterfall([
            function(done) {
                docClient.delete(params, function(err, data) {
                    if (err) {
                        console.error("Unable to update. Error:", JSON.stringify(err, null, 2));
                        done(true, err.message)
                    }else if(Object.keys(data).length == 0) {
                        done(true, "no item found")
                    } 
                    else {
                        console.log("deleted succeeded",data);
                        done(null, data)
                    }
                })
            },
            function(create, done) {
                params = {
                    TableName: "logo",
                    Item: {},     
                }
                for(var obj in create.Attributes) { 
                    params.Item[obj] = toUpdatedata[obj] ? toUpdatedata[obj] : create.Attributes[obj]
                }
                params.Item.updatedAt = new Date().getTime();
                console.log(params)
                docClient.put(params, function(err, data) {
                    if (err) {
                        console.error("Error:", JSON.stringify(err, null, 2));
                        done(true, err.message)
                    } else {
                        console.log("Successfully updated:", data);
                        resolve({"Successfully updated" : data})
                    }
                }) 
            }
        ],function(err, data) {
            console.log(data)
            reject(data)
        })
    })
}




describe('logo queries', function() {
    it('logo updated', function(done) { 
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