// import { Session } from 'meteor/session';
Template.matchEditBase.events({
	"submit .match-edit-form"(event){
		event.preventDefault();
		let gameTemplate = event.target.matchTemplate.value;
		// console.log(event.target.endDateTimePicker.value,Date.parse(event.target.endDateTimePicker.value));
		var obj = {
			title:event.target.matchTitle.value,
			subtitle:event.target.matchSubtitle.value,
			gameType:event.target.matchType.value,
			entryStartTime: Date.parse(event.target.entryStartTime.value),
			entryEndTime: Date.parse(event.target.entryEndTime.value),
			matchStartTime:Date.parse(event.target.matchStartTime.value),
			minNumber:event.target.minNumber.value,
			content:{
				profile:event.target.matchDesc.value,
			},
			ruleTemplate:event.target.matchTemplate.value,
		};
		console.log("this._id",this._id,obj);
		if(obj.title.length<5){
			Session.set("errorMessage","标题不得少于5个汉字");
		}else if(obj.content.profile <10){
			Session.set("errorMessage","简介不得少于10个汉字");
		}else{
			if(!this._id){
				if(!getPermission(SysAuth.matchCreate)){
				 	throwError("您没有权限创建赛事");
				 	return;
				}
				Meteor.call('matchCreate',obj,function(error,result){
					// console.log(error,result);
					if(error){
						alert("创建失败"+error);
					}else{
						alert("创建成功");
						Router.go("admin.match",{currIdx:1});
					}
				});
			}else{
				console.log("赛事修改");
				 if(!getPermission(SysAuth.matchEdit)){
				 	throwError("您没有权限修改赛事");
				 	return;
				 }
				// Meteor.call('matchUpdate',obj,this._id, function (error, result) {
				// 	console.log('matchUpdate:',error,result);
				// });	
				Match.update({"_id":this._id},{$set:obj},{multi: false,upsert:false});
			}
		}
		console.log(obj);
	}
});


Session.set("errorMessage",null);
// Template.textLengthAlert.helpers({
// 	texdShow:function(length){
// 		return "文字上限"+length;
// 	}
// })

Template.matchEditBase.helpers({
	gameTypeData:function(){
		var res = GameType.find().fetch(); 
		var type = this.gameType;
		res.forEach(function (item) {
			// ...
			item.selected = type == item.name?"selected":""; 
		});
		return res;
	},
	ruleSelectActive:function(str){
		var res = str == this.ruleTemplate? "selected":""; 
		// console.log("res",res);
		return res;
	},
	
	
});

Template.startDateTimePicker.onRendered(function(){
	var data = Template.currentData();
	var date = null;
	if(data){
		date = moment(data.entryStartTime);
	}
	this.$('#startDateTimePicker').datetimepicker({
            defaultDate:date ?date.format():"",
        });
});
Template.endDateTimePicker.onRendered(function(){
	// this.$('.datetimepicker').datetimepicker();
	var data = Template.currentData();
	var date = null;
	if(data){
		date = moment(data.entryEndTime);
	}
	this.$('#endDateTimePicker').datetimepicker({
            defaultDate:date ?date.format():"",
        });
});
Template.matchDateTimePicker.onRendered(function(){
	// this.$('.datetimepicker').datetimepicker();
	// this.$('#matchDateTimePicker').datetimepicker();
	let data = Template.currentData();	
	// let dt =  new Date();
	// dt.setTime(data.matchStartTime);
	var date = null;
	if(data){
		date = moment(data.matchStartTime);	
		console.log("moment,",date.format(),data.matchStartTime);
	}
 	this.$('#matchDateTimePicker').datetimepicker({
            defaultDate:date ?date.format():"",
        });
});

