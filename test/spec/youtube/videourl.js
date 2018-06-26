var youtubedl = require('youtube-dl');

function FETCH() {
    return new Promise(function(resolve, reject) {
        var array = ['MXhhXXsxSfE', 'e_06yUCGOZw']
        // array.forEach(function(key){

            // var url = `http://www.youtube.com/watch?v=${key}`;
            var url1 = 'http://www.youtube.com/watch?v=MXhhXXsxSfE';
            var url2 = 'http://www.youtube.com/watch?v=e_06yUCGOZw';
            var url3 = 'http://www.youtube.com/watch?v=e_06yUCGOZw';
            var url4 = 'http://www.youtube.com/watch?v=e_06yUCGOZw';
            var url5 = 'http://www.youtube.com/watch?v=e_06yUCGOZw';
            var url6 = 'http://www.youtube.com/watch?v=e_06yUCGOZw';

        // Optional arguments passed to youtube-dl.
        var options = ['--username=user', '--password=hunter2'];
        youtubedl.getInfo([url1, url2, url3, url4, url5, url6], options, function(err, info) { console.log(err, info)
          if (err){
            reject(err) ;
          } 
         
        //   console.log('id:', info.id);
        //   console.log('title:', info.title);
        //   console.log('url:', info.url);
        //   console.log('thumbnail:', info.thumbnail);
        //   console.log('description:', info.description);
        //   console.log('filename:', info._filename);
        //   console.log('format id:', info.format_id);
          
        });
        // });
        resolve();
        
    });
}

describe('fetch videos', function() {
    it('playlist videos', function(done) { 
        FETCH()
        .then(function(data) {
        //    console.log(data)
            done(null, data);
        })
        .catch(function(err) {
            console.log(err)
            done(err);
        })
    })
})