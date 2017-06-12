Auth = new Mongo.Collection('auth');

Auth.deny({
	insert: function (userId, doc) {
		return false;
	},
	update: function (userId, doc, fields, modifier) {
		//...
		return false;
	},
	remove: function (userId, doc) {
		//...
		return false;
	},
});
SysAuth = {
	matchEdit:"matchEdit",
	matchCreate:"matchCreate",
	matchSearch:"matchSearch",
	userSearch:"userSearch",
	articleEdit:"articleEdit",
};
/**/
// authList = null;
authList = [
	{name:"matchSearch",Accesstext:"MATCH_QUERY",id:1},
	{name:"matchCreate",Accesstext:"MATCH_CREATE",id:2},
	{name:"matchEdit",Accesstext:"MATCH_EDIT",id:3},
	{name:"userSearch",Accesstext:"USER_QUERY",id:4},
	{name:"userCreate",Accesstext:"USER_CREATE",id:5},
	{name:"userEdit",Accesstext:"USER_EDIT",id:6},
	{name:"articleEdit",Accesstext:"ARTICLE_EDIT",id:7},
	{name:"matchDelete",Accesstext:"ARTICLE_EDIT",id:8},
];
