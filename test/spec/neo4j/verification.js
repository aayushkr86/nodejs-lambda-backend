var model = require('../../../src/lambda/permission/helper/models.json');
// console.log(a);
// let body={
// 	"model":"Users",
// 	"edge":"Groups",
// 	"data_model":{
// 		"Name":"asd",
// 		"CreatedAt":"pro"
// 	},
// 	"data_relation":{
// 			"Name":"21-May"
// 	}
// };
const Ajv = require('ajv');
const setupAsync = require('ajv-async');
const ajv = setupAsync(new Ajv);

let body={
	"model":"Company",
	"data_model":{
		"Name":"asd",
		"CreatedAt":"pro"
	},
	"edge":"Projects",
	"data_edge":{
		"Name":"asd",
		"CreatedAt":"as"
	},
	"data_relation":{
		"blah":""
	}
};
/*

	
*/

validate(body).then(function(s){
	console.log("final result");
	console.log(s);
}).catch(function(e){
	console.log("error");
	console.log(e);
})
function validate (data) {
	let body = data;
	// body need to have kind of this patter for doing operations
	// let body={
	// 	"model":"Company",
	// 	"edge":"Projects",
	// 	"data_model":{
	// 		"Name":"asd",
	// 		"CreatedAt":"pro"
	// 	},
	// 	"data_relation":{
	// 		"blah":"asd"
	// 	},
	// 	"data_edge":{
	// 		"Name":"asd",
	// 		"CreateAt":"asdasdsd"
	// 	}
	// };
	return new Promise((resolve,reject)=>{
		Model_Relationship(body.model,body.edge,model,body)
		.then(function(result){
			console.log(result);
			/**pass the fomatter to be dynamic*/
			if(result.model)
			result.validate_model = ajv.compile(result.json.Models[result.model]);
			if(result.model)
			result.validate_relation = ajv.compile(result.json.Relationships[result.model]['value']);
			if(result.edge)
			result.validate_edge  = ajv.compile(result.json.Models[result.edge ]);
			return result;
		})
		.then(validator)
		.then(function(fullresponse){
			console.log("ok");
			resolve(fullresponse);
		})
		.catch(function(e){
			if(e.errors != undefined){
				reject(e.errors[0].dataPath+" "+e.errors[0].message);
			}else{
				reject(e);
			}
		})
	})
}

/**
 * Model_Relationship description
 * @param {[type]} model    [description]
 * @param {[type]} relation [description]
 * @param {[type]} json     [description]
 * @param {[type]} body     [description]
 */
function Model_Relationship(model,edge,json,body){
	return new Promise((resolve,reject)=>{
		if(edge != undefined){
			let set = json.Relationships[model]['relate'];
			let relate = json.Relationships[model]['relation'];/**called :have OR :access OR :contain */
			body.relate = relate;
			let related = false;
			set.forEach(function(elem){
				if(elem == edge){
					related = true;
				}
			});
			if(related){
				resolve({model,edge,json,body});
			}else{
				reject("No edge find between them");
			}
		}else{
			/* Create only the node*/
			resolve({model,edge,json,body});
		}
	})
}

/**
 * validator to check schema for both model and relation
 * @param  {[type]} arg [description]
 * @return {[type]}     [description]
 */
function validator(arg){
	console.log(arg);
	return new Promise((resolve,reject)=>{
		if(arg.model != undefined && arg.body.data_model != undefined){
			console.log("validate model data");
			if( 
				arg.edge != undefined || 
				arg.body.data_relation != undefined || 
				arg.body.data_edge != undefined
			){
				/**if any one of them is present */
				console.log((arg.edge != undefined || arg.body.data_relation != undefined || arg.body.data_edge != undefined));
				if( arg.edge != undefined && 
					arg.body.data_relation != undefined && 
					arg.body.data_edge != undefined
				){
					/**if any one of them is not defined */
					console.log("validate relation data");
					Promise.all([
						validate_all(arg.validate_model,arg.body.data_model),
						validate_all(arg.validate_relation,arg.body.data_relation),
						validate_all(arg.validate_edge,arg.body.data_edge)
						]).then(function(all){
							
							if(all[0]){
								arg['data_model']=all[0];
							}
							if(all[1]){
								arg['data_relation']=all[1];
							}
							if(all[2]){
								arg['data_edge']=all[2];
								/** show what can be related with these two of them */
								arg['relate']= arg.body.relate;
							}
							delete arg.json;
							delete arg.validate_model;
							delete arg.validate_relation;
							delete arg.validate_edge;
							delete arg.body;
							delete arg.edge;
							resolve(arg);
						}).catch(function(e){
							reject(e);
						})
				}else{
					reject("Relation is invalid");
					//every one is there
				}
			}else{
				// reject("No Relation data");
				// maybe create only the node
				validate_all(arg.validate_model,arg.body.data_model).then(function(all){
					console.log(all);
					if(all != undefined){
						arg['data_model']=all;
					}
					// if(all[0]){
					// 	arg['data_model']=all[0];
					// }
					// if(all[1]){
					// 	arg['data_relation']=all[1];
					// }
					// if(all[2]){
					// 	arg['data_edge']=all[2];
					// 	arg['relate']= arg.body.relate;
					// }
					delete arg.json;
					delete arg.validate_model;
					delete arg.validate_relation;
					delete arg.validate_edge;
					delete arg.body;
					delete arg.edge;
					resolve(arg);
				}).catch(function(e){
					reject(e);
				})
			}
		}else{
			reject("No Models data");
		}
	})
}

/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all (validate,data) {
	return new Promise((resolve,reject)=>{
		validate(data).then(function (res) {
			console.log(res);
		    resolve(res);
		}).catch(function(err){
		  console.log(JSON.stringify( err,null,6) );
		  reject(err.errors[0].dataPath+" "+err.errors[0].message);
		})
	})
}
