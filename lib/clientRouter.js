// the base touter initial
Router.configure({
	layoutTemplate: '',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notFound',
});

ClientBaseController = RouteController.extend({
	layoutTemplate: 'layout',
});

ClientController = ClientBaseController.extend({
	// wait on the data loaded
	waitOn: function() {
		console.log('clientController: ---------- waiOn()');
		return [
	        Meteor.subscribe('game'),
	        Meteor.subscribe('room'),
		] 
	}
});

ClientLoginController = RouteController.extend({});
ClientGameController = ClientBaseController.extend({
	subscriptions: function() {
		this.gameType = null;
		Meteor.subscribe('game');
	},
	data: function () {
		return {
			games: Games.find({})
		} 
	}
});
// the client base route
Router.route('/client', {
	name: 'welcome',
	controller: ClientBaseController
});

// the client base route
Router.route('/', {
	name: 'clientBase',
	controller: ClientBaseController
});


// the client login route
Router.route('/client/login', {name: 'clientLogin'});

// the client info route
Router.route('/client/info', {
	name: 'info',
	controller: ClientBaseController
});

// the client game route
Router.route('/client/game', {
	name: 'game',
	controller: ClientGameController
});

// the client match route
Router.route('/client/match', {
	name: 'match',
	controller: ClientBaseController
});

// the news page route
Router.route('/client/news', {
	name: 'news',
	controller: ClientBaseController
});

// the different games has different rooms
Router.route('/client/game/rooms/:type/:_id', {
	name: 'room',
	waitOn: function() {
		return Meteor.subscribe('room', this.params._id);
	},
	data: function() {
		return {
			rooms: Rooms.find({gameId: this.params._id}),
			gameId: this.params._id,
		}  
	},
	controller: ClientBaseController
});

Router.route('/client/game/room/roomPage/:gameId', function () {
	gameTemplate = Games.find({_id: this.params.gameId}).fetch()[0].type;
	this.render(gameTemplate);
}, {
	waitOn: function() {
		return [
			Meteor.subscribe('game', this.params.gameId),
			Meteor.subscribe('room', this.params.query.roomId),
			Meteor.subscribe('chesspaces', {roomId: this.params.query.roomId}),
		]; 
	}
})

var requireLogin = function () {
	if (!Meteor.user()) {
		if (Meteor.loggingIn()) {
			this.render(this.loadingTemplate);
		} else {
			this.render('accessDenied');
		}
	} else {
		this.next();
	}
}

Router.onBeforeAction('dataNotFound');
Router.onBeforeAction(requireLogin);