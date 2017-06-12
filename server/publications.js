Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {fields: {'profile': 1,'emails':1,'createdAt':1}});
});

// Meteor.publish('user',function(){
// 	return User.find();
// });

Meteor.publish('match',function(coditions,options){
	// return Match.find();
	return Match.find(coditions,options);
});
Meteor.publish('game_type',function(){
	return GameType.find();
});
Meteor.publish('role',function(){
	return Role.find();
});
Meteor.publish('auth',function(){
	return Auth.find();
});
Meteor.publish('matchTemplate',function(){
	return MatchTemplate.find();
});
Meteor.publish('matchTemplateItem',function(){
	return MatchTemplateItem.find();
});