Match = new Mongo.Collection('match');

// Match.deny({
// 	update: function (userId, doc, fields, modifier) {
// 		//...
// 		return true;
// 	},
// });
Match.allow({
	update:function(userId,doc){
		let res = getPermission(SysAuth.matchEdit);//matchEdit
		// throwError("no permission");
		if(Meteor.isClient){
			console.log("111111");
			res ? null:throwError("no permission");
		}
		return res;
	},
	remove: function (userId, doc) {
		return getPermission("matchDelete");
		// return false;
	},
	insert:function(userId,doc){
		// return getPermission("matchCreate");
		return true;
	},
});
Meteor.methods({
	matchCreate:function(matchAttributes){
		let user = Meteor.user();
		if(!user){
			Router.go("admin.login");
		}
		let _id = 0;
		Meteor.call('getNextSequenceValue', 'match', function (error, result) {
			console.log("error:",error,"result:",result);
			if(error){
				console.log("error",error);
			}else{
				_id = result;
			}
		});
		if(_id <= 0){
			return 0;
		}else{
			let match = _.extend(matchAttributes,{
				createTimeStamp:(new Date()).getTime(),
				author: user._id,
				userId: user.profile.nickname,
				id: _id,
			}) ;
			var matchId =  Match.insert(match);
			return {
				"_id":matchId,
			};	
		}
	},
	/*	db.collection.update(
	   <query>,
	   <update>,
	   {
	     upsert: <boolean>,
	     multi: <boolean>,
	     writeConcern: <document>
	   }
	)*/
	matchUpdate:function(matchAttributes,id){
		let user = Meteor.user();
		if(!user){
			Router.go("admin.login");
		}
		// if (Meteor.isServer) {
	 //      matchAttributes.title += "(server)";
	 //      // wait for 5 seconds
	 //      Meteor._sleepForMs(5000);
	 //    } else {
	 //      matchAttributes.title += "(client)";
	 //    }
		// let user = Meteor.user();

		let matchId = Match.update({"_id":id},{$set:matchAttributes},{multi: false,upsert:false});
		return matchId;
	},
	matchSelectById:function(id){
		let res = Match.findOne({_id:id});
		// console.log("match.js--------matchSelectById",res);
		return res;
	},
	matchDeleteById:function(id){
		// let res = Match.remove({_id:id},function(err){
		// 	console.log("删除赛事成功 id:",id,err);
		// });
		let res = Match.remove(id);
		return res;
	}
});