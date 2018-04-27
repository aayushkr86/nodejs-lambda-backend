var scissors = require('scissors')
var fs = require('fs')
    
var selectfile = [
                    {
                        "mode":"pdf",
                        "url":"./pdf1.pdf",
                        "page":[1]
                    },
                    {
                        "mode":"pdf",
                        "url":"./pdf2.pdf",
                        "page":[1]
                    }
                ];

pdf_manipulation(selectfile)
  .then(function(res){
    console.log(res);
  })
  .catch(function(e){
    console.log(e);
  })

function pdf_manipulation(selectfile){
  return new Promise((resolve,reject)=>{
      let set=[];
      let params=[];
      selectfile.forEach(function(content,i){
        set.push(scissors(content.url) );
        params.push(set[i].pages(content.page));
      });

      scissors
        .join.apply(this,params)
        .pdfStream()
        .pipe(fs.createWriteStream('./out.pdf'))
        .on('finish',function(){
          resolve("filecreated");
        })
        .on('error',function(e){
          reject("Error"+e.message);
        })
  })
}


  // let params=[
  //   set[0].pages(selectfile[0].page),
  //   set[1].pages(selectfile[1].page)
  // ];



// scissors
// .apply(join, argumetns)
// .pdfStream()
// .pipe(fs.createWriteStream(`./output/${Date.now()}out.pdf`))
// .on('finish',function(){})
// .on('error',function(){})



// getpdf(selectfile,function(err, data) {
// // console.log(err,data)
// })

// function getpdf(selectfile, cb) {
//     console.log(selectfile)

//     var pdfA = scissors(selectfile[0].url), pdfB = scissors(selectfile[1].url), pdfC = scissors(selectfile[2].url)

//     scissors
//       .join(
//         pdfA.pages(selectfile[0].page),
//         pdfB.pages(selectfile[1].page),
//         pdfC.pages(selectfile[2].page)
//       ).pdfStream()
//       .pipe(fs.createWriteStream(`./output/${Date.now()}out.pdf`))
//       .on('finish', function() { console.log("We're done!");  })
//       .on('error',function(err) { console.log(err)    })

//     cb()
// }