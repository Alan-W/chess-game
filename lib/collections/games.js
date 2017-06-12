Games = new Mongo.Collection('game');

// publish the games collection
if (Meteor.isServer) {
	// This code is only run in server
	Meteor.publish('game', function gamePublication() {
		return Games.find({});
	})
}
