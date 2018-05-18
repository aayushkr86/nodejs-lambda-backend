/*
1. give me certain model
2. give me its attributes

if some relation in them give then too
I will create a node with that relation here

*/

module.exports = function (connector) {
	console.log(connector);
	return function(code,overide){
		console.log(code,overide);
		console.log("well defined first");
		return new Promise((resolve,reject)=>{
			console.log(code);
		//overide mean create if not exist
		let query=``;
		if(overide == true){
			query=`merge (v1:${code.model}{data_model}) `
		}else{
			query=`create (v1:${code.model}{data_model}) `
		}
		if(code.edge != undefined ){
			if(overide == true){
				query += `merge (v2:${code.edge}{data_edge}) `;
				query += `merge (v1)-[${code.relate}{data_relation}]->(v2) `
			}else{
				query += `create (v2:${code.edge}{data_edge}) `;
				query += `create (v1)-[${code.relate}{data_relation}]->(v2) `;
			}
		}else{
			// no query modified
		}
	/**
	 * code sample format
	 * {
	 * 	"model":"Company",
	 * 	"edge":"Projects",
	 * 	"data_model":{
	 * 		"Name":"asd",
	 * 		"CreatedAt":"pro"
	 * 	},
	 * 	"data_relation":{
	 * 		"blah":"asd"
	 * },
	 * "data_edge":{
	 * "some":"asd"
	 * }
	 */
	
	/** get connection from the neo4j do the query and give the response */

	//for any object addiion on the neo4j
		var params={
			query: query,
			params:code
		};
		console.log(params);
		connector.cypher(params,
		function(err,result){
			console.log(err,result);
		});
	});
    //for any array with realtion on the neo4j
	}
}