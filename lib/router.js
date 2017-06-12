
Router.configure({
	layoutTemplate:'',
	notFoundTemplate:'dataNotFound',
});

BaseController = RouteController.extend({
	layoutTemplate:'adminLayout',
});

AdminController = BaseController.extend({
	waitOn:function(){
		console.log("admincontroller.waiton:--");
		return[
			Meteor.subscribe('match'),
			Meteor.subscribe("auth"),
			Meteor.subscribe("role"),
			Meteor.subscribe('game_type'),
		];
	},
	// layoutTemplate:'adminLayout',
	onBeforeAction(){
		document.title="游戏后台中心";
		$("head meta[name='viewport']").remove();
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');

        // console.log(Session.get("user"));
        if(!Meteor.user()){
        	Router.go('admin.login');
        } 
        this.next();
	}
});
AdminLoginController = RouteController.extend({});
AdminWelcomeController = BaseController.extend({});
AdminUserController = BaseController.extend({
		waitOn:function(){
		// console.log("Meteor.subscribe('allUserData');");
		// var  startPage = parseInt(this.params.currIdx)||1;
		// var startId = (startPage - 1 )*10;
		return[
			Meteor.subscribe('allUserData'),
			Meteor.subscribe("auth"),
			Meteor.subscribe("role"),
		];
	},
});


AdminMatchController = BaseController.extend({
	waitOn:function(){
		// var  startPage = parseInt(this.params.currIdx)||1;
		// var startId = (startPage - 1 )*10;
		// (Math.ceil(startPage/5) -1 ) * 5
		// id:{$gt:startId}
		return [
			Meteor.subscribe('match',{},{skip:this.params.currIdx*10,limit:10*5}),
			Meteor.subscribe("auth"),
			Meteor.subscribe("role"),
		]
	},
});
AdminMatchEditController = AdminMatchController.extend({
	waitOn:function(){
		return [
			Meteor.subscribe('match',{id:this.params._id},{}),
			Meteor.subscribe("auth"),
			Meteor.subscribe("role"),
			Meteor.subscribe('game_type'),
			Meteor.subscribe('matchTemplate'),
			Meteor.subscribe('matchTemplateItem'),
		];		
	},
});
AdminSiteController = AdminController.extend({

});
AdminAdminController = AdminController.extend({

});

Router.route('/admin',{name:'admin.welcome'});
Router.route('/admin/user/:currIdx',{
	name:'admin.user',
	data:function(){
		// console.log("123123131",Meteor.users.find().fetch());
		// return Meteor.users.find().fetch();
		return {
            users(){
                return Meteor.users.find({});
            },
            currIdx(){
            	return parseInt(this.params.currIdx);
            }
        }
	}
});
Router.route('/admin/match/:currIdx',{
	name:'admin.match',
	data:function(){
		var _currIdx = parseInt(this.params.currIdx);
		// console.log("route  admin.match/:currIdx",this.params.currIdx);
		return{
			setingdata(){
				return {
							pages:5,
							limit:10,
							currIdx:_currIdx,
							path:"admin.match",
							data:Match.find({}).fetch(),
						};
			}
		} 
	},
});
// Router.route('/admin/match',{name:'admin.match'});
Router.route('/admin/admin',{name:'admin.admin'});
Router.route('/admin/site',{name:'admin.site'});
Router.route('/admin/match/edit/:_id',{
	name:'admin.match.edit',
	data:function(){
		console.log(Match.findOne(this.params._id));
		// var tab = this.params._tab;
		// console.log(tab);
		var attr = Match.findOne(this.params._id) ||{};
		return _.extend(attr,{_tab:"baseInfo"});
		// return attr;
	},
});
Router.route('/admin/login',{name:'admin.login'});
Router.route('/admin/user/edit/:_id',{
	name:'admin.user.edit',
	data:function(){
		return Meteor.users.findOne({_id:this.params._id});
	}
});
var requireLoginAndPermissions = function() {

	if(!authList){
	
		authList = Auth.find().fetch();
		console.log("authList",authList);
	}
	if(!systemRoleList){
		initRoleList(Role.find().fetch());
		console.log("roleList",systemRoleList);
	}

	let routeName = Router.current().route.getName();
	// console.log(Router.current().data.accessName);
	if(routeName == 'admin.login'){
		this.next()
	}else{
		if (! Meteor.user()) {
		    if (Meteor.loggingIn()) {
		      this.render(this.loadingTemplate);
		    } else {
		    	// this._accessDenied = "NOT_LOG_IN";
		      this.render('accessDenied',{data:{_accessDenied:"login"}});
		      // Router.go('admin.login');
		    }
		} else {
			let denyText = "";
			if(routeName == "admin.match"){
				denyText = "matchSearch";
			}else if(routeName == "admin.match.edit"){
				// console.log("0000000",Router.current());
				if(this.params._id==0){
					denyText = "matchCreate";
				}else{
					denyText = "matchEdit";	
				}	
			}else if(routeName=="admin.user"){
				denyText = "userSearch";
			}else if(routeName == "admin.user.edit"){
				denyText = "userEdit";
			}else if(routeName == "admin.site"){
				denyText ="articleEdit"
			}

		  	if(getPermission(denyText)){
		  		this.next();
		  	}else{
		  		this.render('accessDenied',{data:{_accessDenied:denyText}});
		  		console.log("没有有权限进入");
		  	}
		    
		}
	}
}


Router.onBeforeAction('dataNotFound', {only:'admin.match'});
Router.onBeforeAction(requireLoginAndPermissions, {});

