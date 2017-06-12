Template.adminMatchEdit.events({
	"click .nav-tab-li"(event){
		event.preventDefault();
		var id = event.currentTarget.id;
		if(this._tab !=id){
			this._tab = id;
			Session.set("updateRender",true);
			// $(".nav-tab-li").removeClass("acitve");
			// $("#"+id).addClass("active");
			Meteor.setTimeout(function(){
				// this._tab = id;
				// console.log("----------------------");
				Session.set("updateRender",false);
			},500);
			console.log("切换到----",id,this);	
		}
		
	}
});
Template.adminMatchEdit.helpers({
	activeTabClass: function (name) {
		// ...
		console.log("this.tab",this,name);
		if(this._tab == name )
			return "active";
		else
			return "";
	},
	activeTabTemplate:function(name){
		// console.log(this._tab,name);
		if(!this._tab && name == "baseInfo"){
			return true;
		}
		if(this._tab == name){
			$("#"+name).addClass("active");
			return true;
		}else{
			if($("#"+name).hasClass("active")){
				console.log("232222");
				$("#"+name).removeClass("active");
			}
		}
		return false;
	},
	updateRender:function(){
		// console.log("updateRender");
		// return this._tab != this.currentTab;
		return Session.get("updateRender");
	}
});



