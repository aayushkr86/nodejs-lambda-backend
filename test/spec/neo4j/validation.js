var Company_schema={
	"type":"object",
	"properties":{
		"name":{"type":"string"},
		"description":{"type":"string"}
	}
};

var Group_schema={
	"type":"object",
	"properties":{
		"name":{"type":"string"},
		"description":{"type":"string"},
		"updatedat":{"type":"date"},
		"updateby":{"type":"string"}
	}
};

var Role_schema={
	"type":"object",
	"properties":{
		"name":{"type":"string"},
		"updatedat":{"type":"date"},
		"updateby":{"type":"string"}
	}
};

var Users = {
	"type":"object",
	"properties":{
		"id":{"type":"string"}
	}
};

var Projects = {
	"type":"object",
	"properties":{
		"name":{"type":"string"}
	}
};

var Modules={
	"type":"object",
	"properties":{
		"name":{"type":"string"}
	}
};

var funcionalities={
	"type":"object",
	"properties":{
		"name":{"type":"string"}
	}
};

// //relation between then
// USERS -- have (group)
// 		have (role)

// users/group/role --- access company/project/modules/funcionalities

// company --- access inside modules (! user/group/role)



