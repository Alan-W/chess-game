Template.adminLayout.helpers({
	activeRouteClass:function(tabName){
		let curTab =  Router.current().route.getName();
		if(RegExp(tabName).test(curTab)){
		// if(tabName == curTab){
			// console.log(curTab,tabName);
			return "active-li";
		}
		return "";
	},
	currentUser:function(){
		// console.log(Meteor.user());
		return Meteor.user();
	},
});
Template.adminLayout.events({
	'click #login': function (event) {
		// ...
		Router.go('admin.login');
	},
	'click #logout':function(event){
		Meteor.logout(function(){
			console.log("登出账户");
		});
	}
});
