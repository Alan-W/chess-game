
// User = Meteor.users;//new Mongo.Collection('user');
if(Meteor.isServer){
	let api = new Restivus({
		userDefaultAuth:true,
		prettyJson:true
	});
	api.addCollection(Meteor.users);
}

