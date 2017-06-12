
Template.adminMatch.helpers({
	matches:function(){
		// let data = this.setingdata();
		// let  startPage = parseInt(data.currIdx)||1;
		// {id:{$gt:(startPage - 1 )*data.limit}}
		// var res = Match.find(this.condition?this.condition:{},{skip: data.currIdx*data.limit,limit:data.limit}).fetch(); 
		var res = Match.find({}).fetch();
		console.log(res);
		return res;
	},
	noRender:function(){
		return Session.get('noRender');
	}
	// pagenationMatch:Match.find()
});
Template.adminMatch.events({
	"click #create-btn"(event){
		if(getPermission("matchCreate")){
			Router.go("admin.match.edit",{_id:0});
		}else{
			throwError("没有创建权限");
		}	
		// console.log("新建赛事");
	},
	"click .search-type-li"(event){
		event.preventDefault();
		console.log($(event.target).attr("data-type"),$(event.target).text());
		this.searchType = $(event.target).attr("data-type");
		// this.searchNameText=$(event.target).value;
		$("#search-type-text").html($(event.target).text()+"<span class='caret'></span>");

	},
	"click #search-btn"(event){
		event.preventDefault();
		if(this.searchType){
			this.condition = {};
			this.condition[this.searchType] = $("#search-input")[0].value;
			Session.set("noRender",true);
			Meteor.setTimeout(function(){
				// this._tab = id;
				// console.log("----------------------");
				Session.set("noRender",false);
			},500);
			console.log($("#search-input")[0].value,this.condition,Match.find(this.condition ).fetch());
		}
	}
});
Template.matchRow.helpers({
	getTimeDuringString:function(start,end){
		let date = new Date();
		date.setTime(start);
		// console.log("time",start,"year:",date.getFullYear(),"month:",date.getMonth());
		let dateStr = date.getFullYear() +"/"+ (date.getMonth()+1)+"/"+ date.getDate();
		date.setTime(end);
		dateStr += " - "+date.getFullYear() +"/"+ (date.getMonth()+1)+"/"+ date.getDate();
		return dateStr;
	},
	pathId:function(){
		return this._id._str;
	},
});
Template.matchRow.events({
	"click #del-btn"(event){
		console.log("删除赛事",event,this);
		Match.remove(this._id);
	},
	"click #edit-btn"(event){
		Router.go("admin.match.edit",{_id:this._id});
		// console.log("编辑赛事",event,this);
	},

});
