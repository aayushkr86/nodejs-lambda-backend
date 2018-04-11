var validate = require('../validation')
var insert = require('../query/insert')
var data = require('../../../log/sample-4-4-2018')

function streams(data) { 
    return new Promise(function(resolve, reject) {
        validate.validation(data)
                    .then(function(data) {
                    console.log('Valid:', data)
                    
                    var params = {
                        TableName: "streams",
                        Item: {
                            "id" : data.id,
                            "uuid" : data.uuid,
                            "userid" : data.userid,
                            "language" : data.language,
                            "title" : data.title,
                            "date"  : data.date,
                            "intro_text" : data.intro_text,
                            "news_text"  : data.news_text,
                            "image"      : data.image,
                            "pdf"        : data.pdf,
                            "publish"    : data.publish,
                            "show_at_first_place" : data.show_at_first_place,
                            "createdAt" : new Date().getTime(),
                            "updatedAt" : new Date().getTime()
                        },
                    }
                
                        insert.INSERT(params).then(function(result) {
                        // console.log(result)
                        resolve(result)
                        })
                        .catch(function(err) {
                        // console.log(err)    
                        reject(err)    
                        })

                        
                    })
                    .catch(function(err){
                    // console.log('Invalid:', err)
                    reject('Invalid:',err)
                    })
    })
    
}

describe('stream integration-test',function() {
    it('validation and insertion', function(done) {
        data.forEach(function(elem) {
            streams(elem)
            .then(function(data){
                console.log(data)
            })
            .catch(function(err){
                console.log(err)
            })
        })
        done()
    })

})
