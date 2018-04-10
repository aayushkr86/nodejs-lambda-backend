var data = require('../../log/sample-4-4-2018')
var Validator = require('schema-validator')

var StreamSchema = {
  userid: {
    type: String,
    required: true,
    test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  },
  title: {
    type: String,
    required: true,
    length: {
      min: 5,
      max: 36
    }
  },
  date: {
    type: String,
    require: true,
    test: /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
  },
  intro_text: {
    type: String,
    required: true,
    length: {
      min: 5,
      max: 50
    }
  },
  news_text: {
    type: String,
    required: true,
    length: {
      min: 5,
      max: 50
    }
  },
  image: {
    type: String
  },
  pdf: {
    type: String
  },
  publish: {
    type: Boolean
  },
  show_at_first_place: {
    type: Boolean
  }
}

function streams (data) {
  return new Promise(function (resolve, reject) {
    var validator = new Validator(StreamSchema)

    var check = validator.check({
      userid: data.userid,
      title: data.title,
      date: data.date,
      intro_text: data.intro_text,
      news_text: data.news_text,
      image: data.image,
      pdf: data.pdf,
      publish: data.publish,
      show_at_first_place: data.show_at_first_place
    })

    if (check._error) {
      reject(check)
    }
    resolve(check)
  })
}

describe('streams tests', function () {
  it('validation test', function (done) {
    data.forEach(function (elem) {
      streams(elem)
        .then(function (data) {
          console.log('Valid:', data)
        })
        .catch(function (err) {
          console.log('Invalid:', err)
        })
    })
    done()
  })
})
