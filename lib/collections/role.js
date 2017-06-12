/*
角色权限列表
*/
Role = new Mongo.Collection('role');

systemRoleList = {
	match:["matchSearch","matchEdit","matchCreate","matchDelete"],
	user:["userSearch","userCreate",'userEdit'],
	site:["articleEdit"],
	admin:[],
}
// systemRoleList = null;

initRoleList = function(arr){
	systemRoleList = {};
	for(var i =0;i<arr.length;i++){
		systemRoleList[arr[i].name] = arr[i].authList;
	}
}