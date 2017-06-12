ChessPaces = new Mongo.Collection('chesspaces');

// publish the pace step data
if (Meteor.isServer) {
	Meteor.publish('chesspaces', function(options) {
		return ChessPaces.find({}, options);
	})
}


Meteor.methods({
	paceInsert: function (stepdData) {
		var data = _.extend(stepdData, {
			userId: Meteor.user()._id,
			winner: false,
		});
		// 记录每一步的下棋步骤
		var paceId = ChessPaces.insert(data);
		return {
			_id: paceId
		}
	},

	updatePace: function(paceAttrbutes) {
		check(paceAttrbutes, {
			roomId: String,
			pace: Object,
			first: String,
			map: Array,
			winner: Number,
			hasSelected: Boolean,
		});
		ChessPaces.update({'roomId': paceAttrbutes.roomId}, {
			$set: { 
				pace: paceAttrbutes.pace, 
				map: paceAttrbutes.map,
				userId: Meteor.user()._id, 
				winner: paceAttrbutes.winner,
				hasSelected: paceAttrbutes.hasSelected
			},
		});
	},

	// while quit the room remove the paces data
	emptyPaces: function(roomId) {
		console.log('清除步骤数据的房间ID 是: ----- ', roomId);
		ChessPaces.remove({ roomId: roomId });
	},

	// while click the begin btn , update the chesspace begin state
	updatePaceStartState: function(roomId) {
		check(roomId, String);
		ChessPaces.update({ roomId: roomId }, {
			$inc: { start: 1 }
		})
	},

	// update pace ready state
	updatePaceReadyState: function(roomId, userId) {
		check(roomId, String);
		check(userId, String);
	},

	// stop begin state
	stopBeginState: function(roomId) {
		check(roomId, String);
		ChessPaces.update({ roomId: roomId }, {
			$set: { start: 100 }
		});
	}
})