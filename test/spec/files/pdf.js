var scissors = require('scissors')
var fs = require('fs')
    
var selectfile = [
                    {
                        "mode":"pdf",
                        "url":"./pdf/pdf1.pdf",
                        "page":[1]
                    },
                    {
                        "mode":"pdf",
                        "url":"./pdf/pdf2.pdf",
                        "page":[0]
                    },
                    {
                        "mode":"pdf",
                        "url":"./pdf/pdf3.pdf",
                        "page":[1]
                    }
                ];

getpdf(selectfile,function(err, data) {
// console.log(err,data)
})

function getpdf(selectfile, cb) {
    console.log(selectfile)

    var pdfA = scissors(selectfile[0].url), pdfB = scissors(selectfile[1].url), pdfC = scissors(selectfile[2].url)

    scissors.join(pdfA.pages(selectfile[0].page),
                  pdfB.pages(selectfile[1].page),
                  pdfC.pages(selectfile[2].page)
                ).pdfStream()
  
    .pipe(fs.createWriteStream(`./output/${Date.now()}out.pdf`))
    .on('finish', function() { console.log("We're done!");  })
    .on('error',function(err) { console.log(err)    })
                    
    cb()
}

/* dynamic code based on user input 

let combination = [];
fs.readdir(config.outFolder, (err, files) => {
  if(err) log.error(err);
  files.map((file) => {
    return path.join(config.outFolder ,file);
  }).filter((file) => {
    return fs.statSync(file).isFile();
  }).forEach(file => {
    combination.push(scissors(file).odd());
  })
  .then(() => {
   scissors.join(combination)
     .pdfStream()
     .pipe(fs.createWriteStream('badges-final.pdf'))
     .on('finish', () => log.info('PDF combination Complete'))
     .on('error', (err) => log.error(err));
   })
}
*/