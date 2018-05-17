const ypi = require('youtube-playlist-info');
const youtubedl = require('youtube-dl');
const asyncLoop = require('node-async-loop');

function FETCH() {
   return new Promise(function(resolve, reject) {
     
        // const url = process.env.PLAYLIST_URL;
        // // console.log(GOOGLE_API_KEY)
        // console.log(url);
        // const playlistId = url.split('=')
        const options = {
            maxResults: 25
        };
        // ypi(process.env.GOOGLE_API_KEY, playlistId[1], options)
        ypi('AIzaSyCkS6vUvK1MkCxu4iP-hs6tePdKkCXuCzs', 'PL35F93FA3C740F3BB', options)
        
        .then((items)=> {
            // console.log(items);

            var urls = []; 
            items.forEach((elem)=>{
                var videoId = elem.resourceId.videoId;
                var url = 'http://www.youtube.com/watch?v='+videoId;
                urls.push(url)
            })

            var videos = []; var array = [];
            asyncLoop(urls, function (item, next)
            {  
                // youtubedl.getInfo(item, function(err, info) { //console.log(info.url)
                //     if (err) {
                //         console.log(err);
                //         next(err);
                //         return; 
                //     }
                //     var itemObj = {
                //         'id' : info.id,
                //         'title' : info.title,
                //         'thumbnail' : info.thumbnail,
                //         'filename' : info._filename,
                //         'format' : info.format,
                //         'url' : info.url
                //     }; 
                //     // console.log(itemObj);
                //     videos.push(itemObj)
                //     next();
                // });
            }, function (err) {
                if (err) {
                    console.error('Error: ' + err.message);
                    return;
                }
                console.log('Finished!');
                resolve({'items' : videos});
            });

            // resolve(urls)

        }).catch((error)=> {
            // console.error
            reject(error)
        });
    });
}

describe('youtube videos', function() {
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