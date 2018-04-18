
var selectfile =[
        {
            "mode":"pdf",
            "url":"../filepath",
            "page":[1]
        },
        {
            "mode":"pdf",
            "url":"",
            "word":"all"
        },
        {
            "ppt":[1,2,3,4]
        }
];
console.log("asd")

/**
 * task
 * 1. get the document
 * 2. get all the related documents anyformat (get docs pages from any format i.e word,ppt,pdf) 
 * 3. now all the docs in pdf(/word/ppt)       (convert docs into pdf)
 * 4. download api.()
 */

var PDFDocument = require('pdfkit');
var fs = require('fs');
// var blobStream = require('blob-stream');
var doc = new PDFDocument();
// var stream = doc.pipe(blobStream());

doc.pipe(fs.createWriteStream('./output/out.pdf'));
doc.save()
   .moveTo(100, 150)
   .lineTo(100, 250)
   .lineTo(200, 250)
   .fill("#FF3300")
// doc.end();
// stream.on('finish', function() {
//     iframe.src = stream.toBlobURL('application/pdf');
//   });



doc.addPage()
   .fontSize(25)
   .text('Here is some vector graphics...', 100, 100)


doc.save()
   .moveTo(100, 150)
   .lineTo(100, 250)
   .lineTo(200, 250)
   .fill("#FF3300")


doc.scale(0.6)
   .translate(470, -380)
   .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
   .fill('red', 'even-odd')
   .restore()


doc.addPage()
   .fillColor("blue")
   .text('Here is a link!', 100, 100)
   .underline(100, 100, 160, 27, {color: "#0000FF"})
   .link(100, 100, 160, 27, 'http://google.com/')


doc.end();