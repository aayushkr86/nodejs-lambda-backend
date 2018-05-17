 const ypi = require('youtube-playlist-info');
 const youtubedl = require('youtube-dl');

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

        var videos = [];
        // urls.forEach((elem)=>{
        //     youtubedl.getInfo(elem, function(err, info) {
        //     if (err) {
        //         console.log(err); 
        //     }
        //     var itemObj = {
        //         'id' : info.id,
        //         'title' : info.title,
        //         'url' : info.url,
        //         'thumbnail' : info.thumbnail,
        //         // 'filename' : info.filename
        //     }; 
        //     // console.log(itemObj);
        //     items.push(itemObj)
        //     });
        // })
        
            // var promises = urls.map(function (elem) { // return array of promises
            //     // return the promise:
            //     return youtubedl.getInfo(elem, function(err, info) {
            //         if (err) {
            //             console.log(err); 
            //         }
            //         var itemObj = {
            //             'id' : info.id,
            //             'title' : info.title,
            //             'url' : info.url,
            //             'thumbnail' : info.thumbnail,
            //         }; 
            //         console.log(itemObj);
            //         items.push(itemObj)
            //         });
            // });
            // Promise.all(promises).then(function () {
        
            //     console.log("items", items);
            //     resolve(items);
            // });


async function youtube(array){
    for(const item of array){ 
        await youtubedl.getInfo(item, function(err, info) { console.log(info.url)
                if (err) {
                    console.log(err); 
                }
                var itemObj = {
                    'id' : info.id,
                    'title' : info.title,
                    'thumbnail' : info.thumbnail,
                    'url' : info.url
                }; 
                // console.log(itemObj);
                // return itemObj
                // items.push(itemObj)
        });
    }
    console.log('done')
}
youtube(urls)







        console.log("videos", videos);
        resolve(videos);

       
        
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
        //    console.log(data)
            done(null, data);
        })
        .catch(function(err) {
            console.log(err)
            done(err);
        })
    })
})