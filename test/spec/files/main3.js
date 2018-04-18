var scissors = require('scissors')
var fs = require('fs')


var pdf = scissors('./pdf/pdf.pdf')
   .pages(5, 1, 3, 2)

pdf.pdfStream()
.pipe(fs.createWriteStream('./output/out.pdf'))
.on('finish', function() {
    console.log("We're done!");
}).on('error',function(err) {
    // throw err;
    console.log(err)
});