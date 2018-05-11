var youtubedl = require('youtube-dl');

function FETCH() {
    return new Promise(function(resolve, reject) {
        var url = 'http://www.youtube.com/watch?v=D7w-v0zbV10';
        // Optional arguments passed to youtube-dl.
        var options = ['--username=user', '--password=hunter2'];
        youtubedl.getInfo(url, options, function(err, info) {
          if (err){
            reject(err) ;
          } 
         
          console.log('id:', info.id);
          console.log('title:', info.title);
          console.log('url:', info.url);
          console.log('thumbnail:', info.thumbnail);
          console.log('description:', info.description);
          console.log('filename:', info._filename);
          console.log('format id:', info.format_id);
          resolve(info);
        });
    });
}

describe('fetch videos', function() {
    it('playlist videos', function(done) { 
        FETCH()
        .then(function(data) {
           console.log(data)
            done(null, data);
        })
        .catch(function(err) {
            console.log(err)
            done(err);
        })
    })
})