var AWS = require('aws-sdk')
var config = require('./config')
var docClient = new AWS.DynamoDB.DocumentClient(config)
var nodemailer = require('nodemailer')
var async = require('async')

function send_email(email_array, str) {
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
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
        let mailOptions = {
            from    : 'aayushkr90@gmail.com', 
            to      : email_array, // list of receivers
            subject : 'Ticket created', 
            text    : str
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }else{
                console.log("info",info)
            }
        });
    });
}

function user_email_notifications() {
    var params = {
        TableName: "emails",
        IndexName: 'keyIndex',
        KeyConditionExpression: '#HASH = :value',  
        ExpressionAttributeNames : {
            '#HASH'  : 'key',
        },
        ExpressionAttributeValues: { 
          ':value': 'Help Desk User',
        },
        ScanIndexForward: false, 
        Limit: 1,
    };
    return new Promise(function(resolve, reject) {
        async.waterfall([
            function(done){
                docClient.query(params, function(err, data) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                        done(true, err.message)
                    } else {
                        // console.log("Email Query succeeded",data);
                        done(null, data)
                    }
                })
            },function(data, done){
                var str = data.Items[0].body
                var email_array = ['aayushkr10@gmail.com'];
                //query user table to get user email id and user data.
                console.log(str)
                var mapObj = {
                    '{{firstname}}':"anand",
                    '{{lastname}}':"kumar rai",
                };
                str = str.replace(/{{firstname}}|{{lastname}}/gi, function(matched){ 
                return mapObj[matched];
                });
                console.log(str)
                done(null, email_array, str)
            },
            function(email_array, str){
                send_email(email_array, str)
                resolve()
            }
        ],function(err, data){
            console.log(err, data)
            reject(data)
        })
    })
}

function admin_email_notifications() {
    var params = {
        TableName: "emails",
        IndexName: 'keyIndex',
        KeyConditionExpression: '#HASH = :value',  
        ExpressionAttributeNames : {
            '#HASH'  : 'key',
        },
        ExpressionAttributeValues: { 
          ':value': 'Help Desk Admin',
        },
        ScanIndexForward: false, 
        Limit: 1,
    };
    return new Promise(function(resolve, reject) {
        async.waterfall([
            function(done){
                docClient.query(params, function(err, data) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                        done(true, err.message)
                    } else {
                        // console.log("Email Query succeeded",data);
                        done(null, data)
                    }
                })
            },function(data, done){
                var str = data.Items[0].body
                var email_array = ['aayushkr10@gmail.com'];
                //and then admin table to get all admins emails ids.
                console.log(str)
                var mapObj = {
                    '{{username}}'    : "anand kumar rai",
                    '{{clientmail}}'  : "aayushkr10@gmail.com",
                    '{{description}}' :  'description'
                };
                str = str.replace(/{{username}}|{{clientmail}}/gi, function(matched){ 
                return mapObj[matched];
                });
                console.log(str)
                done(null, email_array, str)
            },
            function(email_array, str){
                send_email(email_array, str)
                resolve()
            }
        ],function(err, data){
            console.log(err, data)
            reject(data)
        })
    })
}

describe('email queries', function() {
    it('Help Desk email template', function(done) { 
        
        admin_email_notifications()
        .then(function(data){
        //console.log(data)
            return user_email_notifications()
        }).then(function(data){
        //console.log(data)
            done(null, data);
        })
        .catch(function(err){
            console.log(err)
            done(err);
        })
    })
})