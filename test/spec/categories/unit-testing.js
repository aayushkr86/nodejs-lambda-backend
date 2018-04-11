var Ajv = require('ajv');
var setupAsync = require('ajv-async');

var ajv = setupAsync(new Ajv);

var data = require('../../log/categories-10-4-2018')
var schema ={
	"$async":true,
	"type":"object",
  "properties":{
    "id":{"type":"string"},
    "listNumber":{"type":"number"},
    "name":{"type":"string"},
    "description":{"type":"string"},
    "thumbnail":{"type":"string"},
    "sub":{"type":"string"},
    "subCount":{"type":"number"},
    "totalUnreadCount":{"type":"number"}
  }
};

var validate = ajv.compile(schema);

function validate_categories (data) {
	return new Promise((resolve,reject)=>{
		validate(data).then(function (res) {
		    console.log(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}

describe('categories tests', function () {
  it('validation test', function (done) {
    data.forEach(function (elem) {
      validate_categories(elem)
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
