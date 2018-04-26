var Ajv = require('ajv');
var setupAsync = require('ajv-async');
var ajv = setupAsync(new Ajv);
var data = require('../../log/email_validations.json')

var postSchema = {
    $async:true,
    type: "object",
    properties: {
        id : {
            type: "number",
        },
        status : {
            type: "string",
            enum : ['active']
        },
        key : {
            type: "string",
        },
        subject : {
            type: "string",
        },
        body : {
            type: "string",
        },
        userid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        },
    },
    required : ["key", "subject", "body"]
}

var getSchema = {
    $async:true,
    type: "object",
    properties: {
        id : {
            type: "number",
        },
        status : {
            type: "string",
            enum : ['active']
        },
    LastEvaluatedKey:{
        type:"object",
        properties:{
            id : {
                type: "number",
            },
            status : {
                type: "string",
                enum : ['active']
            },
        },
        required : ["id", "status"]
    }
    },
    required : ["id", "status"]
}

var updateSchema = {
    $async:true,
    type: "object",
    properties: {
        id : {
            type: "number",
        },
        status : {
            type: "string",
            enum : ['active']
        },
        key : {
            type: "string",
        },
        subject : {
            type: "string",
        },
        body : {
            type: "string",
        },
        userid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        },
    },
    required : ["id", "status"]
}

var deleteSchema = {
    $async:true,
    type: "object",
    properties: {
        id : {
            type: "number",
        },
        status : {
            type: "string",
            enum : ['active']
        },
    },
    required : ["id", "status"]
}

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

describe('email tests', function(){
    it('validation test', function(done){
        for(var d in data) { 
            data[d].forEach(function(key) {
                validation_all(validate[d], key)  
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