var data = require('../../../log/logo_validations').post[0]
var logo_insert = require('../query/insert')
var validation = require('../validations_all')
var Ajv = require('ajv');
var setupAsync = require('ajv-async');
var ajv = setupAsync(new Ajv);
var postSchema = {
    $async:true,
    type: "object",
    properties: {
        status : {
            type: "string",
            enum : ['active']
        },
        updatedAt : {
            type : "number"
        },
        company : {
            type: "string",
        },
        logo : {
            type: "string",
        },
        userid : {
            type: "string",
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        },
    },
    required : ["status","updatedAt"]
}
var validate = {};
validate['post']   = ajv.compile(postSchema);

function INSERT(data) {
    return new Promise(function(resolve, reject) {
        validation(validate['post'], data)
        .then(function(result){
            // console.log(result)
            return result
        })
        .then(function(result){
            // console.log(result)
            return INSERT_LOGO(result)
            // .then(function(data){
            //     // console.log(data)
            //     resolve(data)
            // }).catch(function(err){
            //     console.log(err)
            //     reject(err)
            // })
        })
        .then(function(data){
            // console.log(data)
            resolve(data)
        })
        .catch(function(error){
            // console.log(error)
            reject(error)
        })
    })
}

function INSERT_LOGO(result) { 
    return new Promise(function(resolve, reject) {
        var params = {
            TableName: "logo",
            Item: {
                "status" : result.status,
                "updatedAt" : new Date().getTime(),
                "company" :result.company,
                "logo" : result.logo,
                "userid" : result.userid,
                "uuid": result.uuid,
                "createdAt": new Date().getTime()
            },
            ReturnValues: 'ALL_OLD',
        }
        logo_insert(params)
        .then(function(result){
            // console.log(result)
            resolve(result)
        })
        .catch(function(error){
            // console.log(error)
            reject(error)
        })
    })
}

describe('logo integration tests', function(){
    it('tests', function(done){
        INSERT(data)
        .then(function(result){
          console.log(result)
        })
        .catch(function(err){
            console.log(err)
        })
        done()
    })
})

