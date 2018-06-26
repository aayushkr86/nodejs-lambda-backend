var path = require('path'),
fs = require('fs');

  exports.execute = function (event, cb){
  
  /* Use a Buffer object in case we have binary file data */
  var buffer = Buffer(0);
        
 
      buffer = Buffer.concat([buffer, event.body], buffer.length + event.body.length);

  

          
      var boundary = "--" + event.headers["content-type"].match(/boundary="?([^"]*)"?$/)[1],
          bufferIndex = 0,
          dataLineEnding = '',
          lineEndingRegEx,
          bufferChar,
          key,
          value,
          filename,
          contentType,
          data = {};
          
      while (true) {
          /* Get the boundary marker */
          var bufferStr = buffer.toString('utf-8', bufferIndex, bufferIndex + boundary.length);
          if (bufferStr !== boundary) {
              // Set an error on the data object and return what has been parsed so far 
              data._error = "Expected boundary marker, received " + bufferStr;
              break;
          }
          bufferIndex += boundary.length;
          
          /* Is this the final boundary marker? */
          if (buffer.toString('utf-8', bufferIndex, bufferIndex + 2) == '--')
              break;
              
          /* Move past the line ending */
          if (dataLineEnding == '') {
              // Find the line ending length if we don't have it yet
              bufferChar = buffer.toString('utf-8', bufferIndex, bufferIndex + 1);
              while (bufferChar == '\r' || bufferChar == '\n') {
                  dataLineEnding += bufferChar;
                  bufferIndex++;
                  bufferChar = buffer.toString('utf-8', bufferIndex, bufferIndex + 1);
              }
              lineEndingRegEx = new RegExp(dataLineEnding, "g");
          } else
              bufferIndex += dataLineEnding.length;
              
          /* Get the Content-Disposition line */
          bufferStr = buffer.slice(bufferIndex, buffer.indexOf(dataLineEnding, bufferIndex)).toString('utf-8');
          bufferIndex += bufferStr.length + dataLineEnding.length;
          
          var cdArray = bufferStr.split('; ');
          if (cdArray[0] !== 'Content-Disposition: form-data') {
              data._error = 'Expected "Content-Disposition: form-data", received "' + cdArray[0] + '"';
              break;
          }
          
          key = cdArray[1].match(/name="?([^"]*)"?$/)[1];

          if (cdArray.length == 3) {
              // Capture the submitted filename
              filename = cdArray[2].match(/filename="?([^"]*)"?$/)[1];
          } else
              filename = null;
              
          /* Is there a Content-Type line? */
          if (buffer.indexOf('Content-Type:', bufferIndex) == bufferIndex) {
              bufferStr = buffer.slice(bufferIndex, buffer.indexOf(dataLineEnding, bufferIndex)).toString('utf-8');
              bufferIndex += bufferStr.length + dataLineEnding.length;
              
              contentType = bufferStr.match(/Content-Type:\s([^\s]*)/)[1];
          } else
              contentType = 'text/plain';
              
          /* Find the beginning of the data area */
          bufferIndex = buffer.indexOf(dataLineEnding, bufferIndex) + (dataLineEnding.length);
              
          // Find the end of the data area by looking for the next boundary marker
          var dataEndIndex = buffer.indexOf(boundary, bufferIndex);

          if (contentType == 'text/plain') {
              value = buffer.toString('utf-8', bufferIndex, dataEndIndex - dataLineEnding.length).replace(lineEndingRegEx, lineEndings);
          } else {
              if (bufferIndex == dataEndIndex - dataLineEnding.length)
                  value = null;
              else {
                  value = new Buffer(dataEndIndex - bufferIndex - dataLineEnding.length);
                  buffer.copy(value, 0, bufferIndex, dataEndIndex - dataLineEnding.length);
              }
          }
          
          if (filename) {
              if (maxFileSize && value.length > maxFileSize) {
                  value = new RangeError(filename + " is larger than " + maxFileSize + " bytes.");
              } else {
                  var tempName = Date.now() + "_" + filename;
                  var filePath = path.normalize(fileDir);
                  var tempFile = path.join(filePath, tempName);
                  var fileObject = {};
                  
                  try {
                      fs.writeFileSync(tempFile, value);
                      value = {
                          filename: filename,
                          path: tempFile,
                          size: value.length
                      };
                  } catch (err) {
                      value = err;
                  }
              }
          }
          
          /* key values appearing multiple times become arrays */
          if (data[key]) {
              if (Array.isArray(data[key])) /* Already an array, push the new value */
                  data[key].push(value);
              else {
                  /* Change the stored value to an array, and add the new value */
                  data[key] = [data[key]];
                  data[key].push(value);
              }
          } else {
              data[key] = value;
          }

          // Move the buffer index past the data area
          bufferIndex = dataEndIndex;
      }            

      event[dataKey] = data;
      console.log('data', data)
}