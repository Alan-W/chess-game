// Template.adminUser.helpers({
// 	users: function () {
// 		// ...
// 		console.log(Meteor.users.find().fetch());
// 		return Meteor.users.find({}).fetch();
// 	}
// });

Template.adminUser.onRendered(function(){
	let filter = Iron.Location.get().hash;
	// console.log("filter",filter,Meteor.users.find().fetch());
});
// Template.adminUser.helpers({
// 	userData: function () {
// 		// ...
// 		return Meteor.users.find().fetch();
// 	}
// });

Template.userRow.helpers({
	userinfo:function(){
        return this.profile.wxinfo.nickname + "(" + this._id + ")";
	},
	imgurl:function(){
		if(this.profile.wxinfo.headImageUrl){
			return this.profile.wxinfo.headImageUrl;	
		}
		
		return "";
	},
	cjid:function(){
		// console.log("this.profile",this.profile);
		return this.profile.wxinfo.cjId;
	},
	email:function(){
		// console.log(this.emails[0].address);
		return this.emails[0].address;
	},
	createTimeStamp:function(){
		// var str = "";
		// if(this.createAt){
		//  	str = moment(this.createAt).format('MMMM Do YYYY, h:mm:ss a');
		// }
		// console.log("this.createAt",this.createdAt,str);
		return moment(this.createAt).format('MMMM Do YYYY, h:mm:ss a');
	},
	city:function(){
		return this.profile.wxinfo.city;
	}


});

Template.userRow.events({
	"click #edit-btn"(events){
		console.log("编辑用户",this);
		Router.go("admin.user.edit",{_id:this._id});
	}
})