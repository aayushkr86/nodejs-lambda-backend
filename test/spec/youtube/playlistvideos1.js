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


function delay(url){ //console.log('url', url)
    return new Promise((resolve)=>{
        // setImmediate(function(){
            youtubedl.getInfo(url, function(err, info) { //console.log(info.length)
                    if (err) {
                        console.log(err); 
                    }
                    info.forEach((elem)=>{
                    var itemObj = {
                        'id' : elem.id,
                        'title' : elem.title,
                        'thumbnail' : elem.thumbnail,
                        'filename' : elem._filename,
                        'format' : elem.format,
                        'url' : elem.url
                    }; 
                    // console.log(itemObj);
                    videos.push(itemObj)
                    })
                    resolve()
            });
        // });    
    }) 
}

// series
// async function youtube(array){
//     for(const item of array){ //console.log(item)
//         await delay(item)
//     }
//     console.log('DONE');
//     console.log("videos", videos);
//     resolve({'items' : videos});
// }


async function youtube(array){
    for(var i=0; i<array.length; i=i+5){
	    var item = [];
	    for(var j=0; j<5; j++){
            if(array[i+j] != undefined){
                item.push(array[j+i]);
            }
	    }
    // console.log(item);
    await delay(item)
    }
    console.log('DONE');
    console.log("videos", videos);
    resolve({'items' : videos});
}
















// parallel
// async function youtube(array){
//     const promises = array.map(delay);
//     await Promise.all(promises);
    
//     console.log('DONE')
//     console.log("videos", videos);
//     resolve(videos);
// }

youtube(urls)
 
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