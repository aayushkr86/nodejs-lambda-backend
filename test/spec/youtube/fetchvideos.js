const google = require('googleapis');//console.log(google)
// const youtube = google.youtube('v3');
// const secrets = require('./secrets.json');

function FETCH() {
    return new Promise(function(resolve, reject) {
        // youtube.playlistItems.list({
        //     key: secrets.web.api_key,
        //     part: 'id,snippet',
        //     playlistId: 'PLvxLmGsmqdZc-GYVeLhS0N_6jfrzEleQm',
        //     maxResult: 10,
        //   }, (err, results) => {
        //     console.log(err ? err.message : results.items[0].snippet);
        //   });


        const ypi = require('youtube-playlist-info');

        const url = process.env.PLAYLIST_URL;
        console.log(GOOGLE_API_KEY)
        console.log(url);
        const playlistId = url.split('=')
        const options = {
            maxResults: 25
        };
        // ypi(process.env.GOOGLE_API_KEY, playlistId[1], options)
        ypi('AIzaSyCZbA0lomdNbhkWsMcptbEdxuaXO1jiN-Q', playlistId[1], options)
       
        .then((items)=> {
            // console.log(items);
            resolve(items)
        }).catch((error)=> {
            console.error
            reject(error)
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