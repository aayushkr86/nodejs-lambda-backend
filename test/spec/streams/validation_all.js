var data = require('../../log/stream_validations')
var Ajv = require('ajv');
var setupAsync = require('ajv-async');
var ajv = setupAsync(new Ajv);

exports.validation_all = validation_all

var postSchema = {
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
    }
    },
    required : ["userid", "title", "date", 'intro_text']
};

var getSchema = {
    $async:true,
    type: "object",
    properties: {
    id : {
        type: "string",
        enum : ['en_1_0','en_1_1']
    },
    date : {
        type: "string",
        format: "date",
    },
    LastEvaluatedKey:{
        type:"object",
        properties:{
        id:{
            type:"string"
        },
        date:{
            type:"number"
        }
        }
    }
    },
    required : ["id", "date"]
}

var patchSchema = {
    $async:true,
    type: "object",
    properties: {
    id : {
        type: "string"
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
        type: "number",
    },
    newdate : {
        type: "number",
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
    }
    },
    required : ["id", "date"]
}

var deleteSchema = {
    $async:true,
    type: "object",
    properties: {
        id : {
            type: "string",
        },
        date : {
            type: "number",
        },
    },
    required : ["id", "date"]
}

var validate = {};
validate['post'] = ajv.compile(postSchema);
validate['get'] = ajv.compile(getSchema);
validate['patch'] = ajv.compile(patchSchema);
validate['delete'] = ajv.compile(deleteSchema);

// console.log(validate)

function validation_all(validate, data) { //console.log(validate)
  return new Promise(function (resolve, reject) {
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
      for(d in data){ 
            data[d].forEach(function (elem) {
            validation_all(validate[d],elem)
            .then(function (data) {
            console.log('Valid:', data)
            })
            .catch(function (err) {
            console.log('Invalid:', err)
            })
        }) 
      }
    done()
  })
})


