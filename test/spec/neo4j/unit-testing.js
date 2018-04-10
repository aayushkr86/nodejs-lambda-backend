
'use strict';
	/**
	 * default set up to connect with the neo4j
	 */
		const uri = "bolt://localhost";
		const user = "neo4j";
		const password = "vinay";

		const neo4j = require('neo4j-driver').v1;

		const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
		const session = driver.session();
		
	describe('Connection',()=>{
		describe('Neo4j',()=>{
			it('test',function(done){
				TEST(session)
					.then(function(data){
						console.log(data);
						done(null,data);
					}).catch(function(err){
						done(err);
					});
			})
			it('add',function(done){
				ADD(session)
					.then(function(data){
						console.log(data);
						done(null,data);
					}).catch(function(err){
						done(err);
					});
			})
			it('delete',function(done){
				DELETE(session)
					.then(function(data){
						done(null,data);
					}).catch(function(err){
						done(err);
					})
			})
			it('find',function(done){
				let q="Match (n) return n";
				FIND(q,session)
					.then(function(data){
						done(null,data)
					}).catch(function(err){
						done(err);
					})
			})
		})
	});
/**
 * [TEST - Allow to detect the Neo4j is running on the system or not]
 * @param {[json]} session [This is the session of Neo4j connection]
 */
function TEST(session){
	return new Promise((resolve,reject)=>{
		// console.log(session);
		session.run('match (company:Comapny) RETURN company')
			.then(r=>{
				// console.log(r.records);
				if(r.records[0] == undefined){
					resolve(r.records);
				}else{
					// console.log(r.records[0]._fields[0].properties);
					resolve(r.records[0]._fields[0].properties);
				}
				// []
				// [record{keys:[],length,_fields:[],_fieldsLookup:[]}]
			})
			.catch((err)=>{
				console.log(err);
				reject(err);
			})
	});
}
/**
 * [ADD - Add nodes in the Neo4j]
 * @param {[json]} session [This is the session of Neo4j connection]
 */
function ADD(session){
	return new Promise((resolve,reject)=>{
		session.run('merge (T:TEST{param}) return T',{param:{data:"as"}})
			.then(r=>{
				if(r.records[0] == undefined){
					resolve(r.records);
				}else{
					resolve(r.records[0]._fields[0].properties);
				}
			})
			.catch((err)=>{
				reject(err);
			})
	})
}
/**
 * [DELETE - Allow users to delete the particualar node]
 * @param {[json]} session [This is the session of Neo4j connection]
 */
function DELETE(session){
	return new Promise((resolve,reject)=>{
		session.run('match (T:TEST) delete T')
			.then(t=>{
				resolve(t.records);
			})
			.catch((err)=>{
				reject(err);
			})
	})
}
/**
 * [FIND Neo4j query to excute a query must be start with match]
 * @param {[type]} q       [query to execute on Neo4j]
 * @param {[type]} session [This is the session of Neo4j connection]
 */
function FIND(q,session){
	return new Promise((resolve,reject)=>{
		session.run(q+" LIMIT 10")
			.then(result=>{
				resolve(result.records[0]);
			})
	})
}
