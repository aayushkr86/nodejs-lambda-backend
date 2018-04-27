var mailer =require('nodemailer');
var fs = require('fs');

console.log(mailer);

let transporter = mailer.createTransport({
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
fs.readFile(file,(err,data)=>{
            let mailOptions = {
                from: 'aayushkr90@gmail.com', 
                to: ['vinay@code5.org'], // list of receivers
                subject: 'Ticket created', 
                // text: 'power cut will happen today from 2 pm to 3pm', // plain text body
                body: "output", // html body,
                attachments: [{'filename': 'out.pdf', 'content': data}]
            };
        });
            
        sendmail(mailOptions,'out.pdf',(err,messageId)=>{
        	console.log(err,messageId);
        });
        function sendmail(mailOptions,file,callback) {
        	// fs.readFile(file,(err,data)=>{
        		transporter.sendMail(mailOptions, (error, info) => {
	                if (error) {
	                    console.log(error);
	                    return callback(error)
	                }
	                console.log("info",info)
	                console.log('Message sent: %s', info.messageId);         
	                console.log('Preview URL: %s', mailer.getTestMessageUrl(info));
	                callback(err, info.messageId)        
	            });
        	// })
        }