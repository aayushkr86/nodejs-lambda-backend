//now find the nested call from the db upto a limit


// var params = {
//     TableName: 'FOLDERS',
//     Key: { // a map of attribute name to AttributeValue for all primary key attributes
    
//         folderId: "categories"
//         folderOrder: 1
//     },
//     AttributesToGet: [ // optional (list of specific attribute names to return)
//         'folderSub',
//         // ... more attribute names ...
//     ],
//     ConsistentRead: false, // optional (true | false)
//     ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
// };

// query of the list of that item 

// nested of the query until you will get blank result

// then delete in batchwriteItem command with
/**
 * algorith
 * 1. make a queue to find the total no of nested files or ducuments
 * 2. if documents then 
 */

function getcall(folderId,folderOrder){

}

function recursive_call (folderId) {
	var params={
	    TableName: 'FOLDERS',
	    KeyConditionExpression: 'folderId = :folderId, folderOrder > :folderOrder', // a string representing a constraint on the attribute
	    ExpressionAttributeValues: {
	      ':folderId': folderId,
	      ':folderOrder': folderOrder
	    },
	    ConsistentRead: false, // optional (true | false)
	    Select: 'SPECIFIC_ATTRIBUTES',
	    AttributesToGet: [ 
	        'folderId',
	        'folderOrder',
	        'folderSub'
	    ]
	};
	//added it to the some sort of store with linear phase
	//then delete in the batch_delete
	
	//now next folders then next until its blank
	
}
