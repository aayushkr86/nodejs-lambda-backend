var data = require('../../log/sample-4-4-2018')
var Ajv = require('ajv');

// foo: { regexp: '/foo/i' },
 var ajv = new Ajv({allErrors : true});
//  var ajv = new Ajv({ useDefaults: true });
// var ajv = new Ajv({ coerceTypes: true });
var schema = {
    type: "object",
    properties: {
    userid : {
        type: "string",
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    },
    title : {
        type: "string",
        minLength: 5,
        maxLength: 50,
    },
    date : {
        type: "string",
        format: "date",
        // pattern: '/(\d{4})-(\d{2})-(\d{2})/',
    },
    intro_text : {
        type: "string",
        minLength: 2,
        maxLength: 50,
    },
    news_text : {
        type: "string",
        minLength: 2,
        maxLength: 50,
    },
    image: {
        type: "string"
    },
    pdf: {
        type: "string"
    },
    publish: {
        type: "boolean"
    },
    show_at_first_place: {
        type: "boolean"
    },
    },
    required : ["userid", "title", "date", 'intro_text']
};


<<<<<<< HEAD
    var check = validator.check(data);
=======
function streams (data) { //console.log(data)
  return new Promise(function (resolve, reject) {
    var validate = ajv.compile(schema);
    //console.log(validate(data));
    var valid = validate(data);
>>>>>>> a8b55115232563d817bf3a65dba40daf44324926

    if (!valid) {
    //    console.log(validate.errors); 
       reject(validate.errors)
    }
       resolve(valid)
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