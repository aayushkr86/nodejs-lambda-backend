var data = require('../../log/sample-4-4-2018')
var Ajv = require('ajv');
var setupAsync = require('ajv-async');
var ajv = setupAsync(new Ajv);

exports.validation = validation


// foo: { regexp: '/foo/i' },
//  var ajv = new Ajv({allErrors : true});
//  var ajv = new Ajv({ useDefaults: true });
// var ajv = new Ajv({ coerceTypes: true });
var schema = {
    $async:true,
    type: "object",
    properties: {
    id : {
        type: "string"
    },   
    uuid : {
        type: "string",
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    },
    userid : {
        type: "string",
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    },
    language:{
        type: "string" ,
        enum : ['en','de']
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


function validation(data) { //console.log(data)
  return new Promise(function (resolve, reject) {
    var validate = ajv.compile(schema);
    //console.log(validate(data));
    // var valid = validate(data);

    // if (!valid) {
    // //    console.log(validate.errors); 
    //    reject(validate.errors)
    // }
    //    resolve(valid)

        validate(data).then(function (result){
        // console.log(result);
        resolve(result)
        })
        .catch(function(err){
        // console.log(err);
        reject(err);
        })
  })
}


describe('streams tests', function () {
  it('validation test', function (done) {
    data.forEach(function (elem) {
        validation(elem)
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


