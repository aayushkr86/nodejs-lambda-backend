var Ajv = require('ajv');
var setupAsync = require('ajv-async');
var ajv = setupAsync(new Ajv);
var data = require('../../log/help_validations.json')

var postSchema = {
    $async:true,
    type: "object",
    properties: {
        userid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        },
        createdAt : {
            type : "number"
        },
        status : {
            type: "string",
            enum : ['open','inprogress','resolved','unresolved']
        },
        description : {
            type: "string",
        },
    },
    required : ["userid","createdAt","status"]
}

var getSchema = {
    $async:true,
    type: "object",
    properties: {
        status : {
            type: "string",
            enum : ['open','inprogress','resolved','unresolved']
        },
    LastEvaluatedKey:{
        type:"object",
        properties:{
            status : {
                type: "string",
                enum : ['open','inprogress','resolved','unresolved']
            },
            updatedAt : {
                type : "number"
            },
        },
        required : ["status","updatedAt"]
    }
    },
    required : ["status"]
}

var updateSchema = {
    $async:true,
    type: "object",
    properties: {
        userid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        },
        createdAt : {
            type : "number"
        },
        status : {
            type: "string",
            enum : ['open','inprogress','resolved','unresolved']
        },
        description : {
            type: "string",
        },
    },
    required : ["userid","createdAt","status"]
}

var deleteSchema = {
    $async:true,
    type: "object",
    properties: {
        userid : {
            type : "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        },
        createdAt : {
            type: "number",       
        },
    },
    required : ["userid", "createdAt"]
}

var validate = {};
validate['post']   = ajv.compile(postSchema);
validate['get']    = ajv.compile(getSchema);
validate['update'] = ajv.compile(updateSchema);
validate['delete'] = ajv.compile(deleteSchema);

function validation(validate, data) { 
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

describe('help desk tests', function(){
    it('help test', function(done){
        for(var d in data) { 
            data[d].forEach(function(key) {
                validation(validate[d], key)  
                    .then(function(data){
                        console.log(data)
                    })
                    .catch(function(err){
                        console.log(err)
                    })
            })
        }
    done()
    })  
})

module.exports = validation;