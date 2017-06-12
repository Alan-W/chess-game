 Rooms = new Mongo.Collection('room');

// publish the rooms collection
if (Meteor.isServer) {
	// This code is only run in server
	Meteor.publish('room', function gamePublication(gameId) {
		console.log('打印服务器端的发布的房间数据:-----', Rooms.find({gameId: gameId}).count());
		return Rooms.find({});
	})
}

Rooms.allow({
	update: function (userId, room) {
		return ownsDocument(userId, room);
	},
	remove: function (userId, room) {
		return ownsDocument(userId, room);
	}
});

validateRoom = function (room) {
	var errors = {};
	if (!room.name) {
		errors.name = "请填写房间名称";
	};
	if (!room.password) {
		errors.password = '请输入房间密码';
	};
	return errors;
};

// if the update operate has error, deny the update
Rooms.deny({
	update: function (userId, room, fieldNames, modifier) {
		var errors = validateRoom(modifier.$set);
		return errors.name || errors.password;
	}
});

// just allow user to update two fields
Rooms.deny({
	update: function (userId, room, fieldNames) {
		return (_.without(fieldNames, 'name', 'password').length > 0);
	}
});

// define the room methods
Meteor.methods({
	roomInsert: function (roomAttrbutes) {
		var now = new Date().getTime();
		check(Meteor.userId(), String);
		check(roomAttrbutes, {
			name: String,
			password: String,
			gameId: String,
		});

		// test whether the room attubuteshave errors
		var errors = validateRoom(roomAttrbutes); 
		if (errors.name || errors.password) {
			throw new Meteor.Error('invalid-room', "请填写房间的名称和密码!");
		};

		// test whether the room name has already exsited!
		var roomWithSameName = Rooms.findOne({name: roomAttrbutes.name});
		if (roomWithSameName) {
			return {
				roomExists: true,
			}
		};

		var user = Meteor.user();
		var room = _.extend(roomAttrbutes, {
			type: 0,
			state: 0,
			start: false,
			createUser: user._id,
			createTime: now,
			users: [],
		});
		var roomId = Rooms.insert(room);
		return {
			_id: roomId
		}
	},

	// enter the room
	enterRoom: function(roomId) {
		check(this.userId, String);
		check(roomId, String);
		var room = Rooms.findOne(roomId);
		if (!room) {
			throw new Meteor.Error('invalid', 'Room Is Not Found!')
		};
		if (_.include(room.users, this.userId)) {
			throw new Meteor.Error('invalid', 'The user is already enter this room!')
		};
		Rooms.update(room._id, {
			$addToSet: { users: {_id: Meteor.user()._id, username: Meteor.user().username, state: false, first: false} },
			$inc: { state: 1},
		})
	},

	// quit the room
	quitRoom: function(roomId) {
		check(this.userId, String);
		check(roomId, String);
		var room = Rooms.findOne({_id: roomId});
		var users = room.users;
		if (!room) {
			throw new Meteor.Error('invalid', 'Room Is Not Found!')
		};
		/*for (var i = 0; i < users.length; i++) { // 只要有一方退出, 重置另一方的准备状态以及先手状态
			users[i].state = false;
			users[i].first = false;
		};*/
		for (var j = 0; j < users.length; j++) {
			if (users[j]._id == this.userId) { // 删除当前退出的用户
				users.splice(j, 1);
			};
		};
		Rooms.update({_id: roomId}, {
			$set: { 
				users: users,
				start: false,
			},
			$inc: { state: -1}
		});
		return {
			count: users.length,
			id: room._id,
		}
	},

	// while quit the room remove the paces data
	emptyRoom: function(roomId) {
		Rooms.remove({ _id: roomId });
	},

	// uodate ths room state
	updateState: function(roomId) {
		check(roomId, String);
		var room = Rooms.findOne({_id: roomId});
		var users = room.users;
		var whetherStart = false;
		var ready = 0, first = false, firstId = Meteor.user()._id;
		for (var i = 0; i < users.length; i++) {
			var thisuser= users[i];
			if (thisuser.first) {
				first = true;
				firstId = thisuser._id;
			};
			if (thisuser._id == Meteor.user()._id) { // 更新玩儿家的准备状态
				thisuser.state = true;
			};
			if (thisuser.state) {
				ready++;
			}
		};
		if (first) { // 已经有人成为了先手
			for (var t = 0; t < users.length; t++) {
				if (users[t]._id != firstId) {
					users[t].first = false;
				}
			}
		} else { // 没有人成为先手
			for (var r = 0; r < users.length; r++) {
				if (users[r]._id === firstId) {
					users[r].first = true;
				}
			}
		};
		if (ready == 2) {
			whetherStart = true;
		};
		Rooms.update(roomId, {
			$set: { 
				users: users,
				start: whetherStart,
			},
		})
	},
})

