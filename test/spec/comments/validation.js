var Ajv = require('ajv');
var setupAsync = require('ajv-async');
var ajv = setupAsync(new Ajv);
var data = require('../../log/comments.json')

var postSchema = {
    $async:true,
    type: "object",
    additionalProperties: false,
    properties: {
        fileId : {type: "string"},
        fileOrder: {type:"number"},
        commentOrder : {type: "number"},
        reply : {type: "string"},
        comment : {type:"string"},
        location: {
            type:"object",
            addionalProperties:true
        },
        tags : {
            type:"object",
            properties:{
                userid:{type:"array"},
                links:{type:"array"}
            }
        }
    },
    required : ["fileId","fileOrder", "commentOrder"]
};

var getSchema = {
    $async:true,
    type: "object",
    additionalProperties: false,
    properties: {
        fileId : {
            type: "string",
        },
        fileOrder:{
            type:"number"
        }
    },
    required : ["fileId","fileOrder"]
};

var updateSchema = {
    $async:true,
    type: "object",
    additionalProperties: false,
    properties: {
        fileId : { type: "string"},
        fileOrder: {type:"number"},
        commentOrder : { type: "number" },
        location : {
            type: "object",
            addionalProperties:true
        },
        comment : { type: "string" },
        reply : {type:"string" }
    },
    required : ["fileId","fileOrder", "commentOrder"]
};

var deleteSchema = {
    $async:true,
    type: "object",
    properties: {
        fileId : { type: "string"},
        fileOrder: {type:"number"},
        commentOrder:{
            type: "number"
        }
    },
    required : ["fileId","fileOrder"]
};

var validate = {};
validate['post'] = ajv.compile(postSchema);
validate['get'] = ajv.compile(getSchema);
validate['update'] = ajv.compile(updateSchema);
validate['delete'] = ajv.compile(deleteSchema);

function validation_all(validate, data) { 
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

describe('comments tests', function(){
    describe('validation test', function(){
        for(var d in data) {
            data[d].forEach(function(key) {
                it(d,function(a){
                    validation_all(validate[d], key)  
                    .then(function(data){
                        a(null,data);
                        // console.log(data)
                    })
                    .catch(function(err){
                        a(err)
                        console.log(err)
                    })
                })
                
            })
        }
    // done()
    })
})