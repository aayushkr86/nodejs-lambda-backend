var youTubeParser = require('youtube-parser');

function FETCH() {
    return new Promise(function(resolve, reject) {
        // youTubeParser.getMetadata('http://www.youtube.com/watch?v=e_06yUCGOZw')
        // .then(
        //   function (metadata) {
        //     // Access video info.
        //     console.log(metadata);
        //     console.log(metadata.keywords);
        //   }
        // );
         
        youTubeParser.getMetadata('http://www.youtube.com/watch?v=e_06yUCGOZw', {quality: 'high', container: 'mp4'})
        .then(function (urlList) {
            // Access URLs.
            console.log(urlList[0]);
            resolve(urlList);
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