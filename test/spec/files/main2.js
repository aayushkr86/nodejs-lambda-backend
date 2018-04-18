var inspect = require('eyes').inspector({maxLength:20000});
var pdf_extract = require('pdf-extract');

var data = {
    // hash: <sha1 hash of the input pdf file here>,
    text:"",
    index: 2,
    num_pages: 4,
    pdf_path: "./pdf/pdf.pdf",
    single_page_pdf_path: "./output/out.pdf"
  }

var absolute_path_to_pdf = './pdf/pdf.pdf'
var options = {
    type: 'ocr', // (required), perform ocr to get the text within the scanned image
    clean: false, // keep the single page pdfs created during the ocr process
    ocr_flags: [
      '-psm 1',       // automatically detect page orientation
      '-l dia',       // use a custom language file
      'alphanumeric'  // only output ascii characters
    ]
  }
// var options = {
//   type: 'text'  // extract the actual text in the pdf file
// }
var processor = pdf_extract(absolute_path_to_pdf, options, function(err) {
  if (err) {
    return callback(err);
  }
});
processor.on('complete', function(data) {
  inspect(data.text_pages, 'extracted text pages');
//   callback(null, data.text_pages);
console.log(null, data.text_pages)
});
processor.on('error', function(err) {
  inspect(err, 'error while extracting pages');
//   return callback(err);
console.log(err)
});
