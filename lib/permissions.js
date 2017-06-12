

/**判断管理员权限**/
getPermission = function(missionType){
	if(!missionType)
		return true;
	let userinfo = Meteor.user().profile.wxinfo;
	for(var i=0;i<userinfo.roleList.length;i++){
		let rolename =  userinfo.roleList[i];
		// console.log("0-----role name",rolename,missionType,systemRoleList);
		if(systemRoleList && systemRoleList[rolename]){
			// console.log("systemRoleList:0000",systemRoleList[rolename].length);
			for(var j =0;j<systemRoleList[rolename].length;j++){
				if( missionType == systemRoleList[rolename][j]){
					return true;
				}		
			}
		}
	}
	return false;
}
/**判断是否是管理员*/
getLoginPermission = function(user){
	return user.profile.wxinfo && user.profile.wxinfo.roleList;
}