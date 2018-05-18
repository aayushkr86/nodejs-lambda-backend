/**
 * Neo4j permission check module
 * ASK Mulitple Permission to do check
 */
/**
 * Module level access
 * DB operation access
 */
/**
 * 
 * @param {*} Neo4j 
 * @param {*} param 
 *      contains user:User
 *      contains level: list of Module or Project or any Company Management Module
 */
function Module(Neo4j,param){
    Neo4j.cypher({
        "query":"",
        "params":{}
    },function(err,data){

    })
}

/**
  * @param {*} Neo4j Neo4j is the DB access
  * @param {*} param 
  *     contains user:User
  *     contains level:(list of Node to access)
  *     contains CRUD operations
  */
function DB_Operation(Neo4j,param){

}

module.exports = function(connector){
    return{
        "Module": Module(connector,param),
        "DB_Operation": DB_Operation(connector,param)
    }
}
