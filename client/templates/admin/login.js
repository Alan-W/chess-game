Template.adminLogin.helpers({
	errorMessage:function(){
		return Session.get("errorMessage");
	},
	activeShow:function(){
		if(Session.get("errorMessage")!=null){
			return 'fullOpacity';	
		}else
		return "zeroOpacity";
		
	}
});
Session.set("errorMessage",null);
Template.adminLogin.events({
	'submit .login-form'(event){
		
		event.preventDefault();
		var email = event.target.emailInput.value;
		var pwd = event.target.passwordInput.value;

		if(!email || !email.length){
			Session.set('errorMessage','请正确输入email地址');
		}
		else if(!pwd || !pwd.length){
			Session.set('errorMessage','您还未输入密码');
		}else{
			// let useraccount = User.find({"email" : email}).fetch();
			// console.log("useraccount",useraccount);
			// if(!useraccount.length){
			// 	Session.set('errorMessage',"未找到此账户");
			// }else{
				// if(useraccount[0].password != pwd){
				// 	console.log("pwd",pwd,"password sql:",useraccount[0].password);
				// 	Session.set('errorMessage',"账户或密码错误");	
				// }else{
					// Session.set('errorMessage',null);
					// // alert("登录成功");
					// // Session.set("user",useraccount[0]);
					// CurrentUser = useraccount[0];
					Meteor.loginWithPassword(email,pwd,function(err){
		                if(!err) {
		                    // Router.go('/admin');
		                    if(!getLoginPermission(Meteor.user())){
		                    	console.log("不是管理员");
		                    }else{
		                    	Router.go("admin.welcome");	
		                    }
		                }else{
		                    Session.set('errorMessage', err.message);
		                }
		            });
					// Router.go("admin.welcome");	
				// }
			// }
		}


		console.log("click login",email,pwd);
	}
});
