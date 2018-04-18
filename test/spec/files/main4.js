var filepreview = require('filepreview');
var options = {
  width: 640,
  height: 480,
  quality: 90
};
filepreview.generate('./word/wordfile.doc', './output/file.gif', options, function(error) {
  if (error) {
  console.log(error);
  }
  console.log('File preview is /home/myfile_preview.gif');
});