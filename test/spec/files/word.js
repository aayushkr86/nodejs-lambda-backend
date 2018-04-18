const getPageCount = require('docx-pdf-pagecount');

getPageCount('./word/wordfile1.docx')
  .then(pages => {
    console.log(pages);
  })
  .catch((err) => {
    console.log(err);
  });
  
// var office2pdf = require(office2pdf),
//   generatePdf = office2pdf.generatePdf;
 
// generatePdf('./ppt/Presentations-Tips.ppt', function(err, result) {
//   console.log(result);
// });