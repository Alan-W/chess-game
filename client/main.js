/*
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Rooms } from '../imports/api/rooms.js';

// the ui template
import '../imports/ui/user/layout.html';
import '../imports/ui/user/homepage.html';
import '../imports/ui/user/loading.html';
import '../imports/ui/user/notfound.html';
import '../imports/ui/user/modal.html';
import '../imports/ui/user/info.html';
import '../imports/ui/user/match.html';
import '../imports/ui/user/game.html';
import '../imports/ui/user/news.html';
import '../imports/ui/user/roompage.html';
import '../imports/ui/user/welcome.html';
import '../imports/ui/user/room.html';
// import '../imports/ui/user/errors.html';

// the ui css 
import '../imports/css/client.css';
//admin ui css
import '../imports/css/index.css';
// the ui js
import '../imports/ui/user/config.js';
import '../imports/ui/user/layout.js';
import '../imports/ui/user/game.js';
import '../imports/ui/user/modal.js';
// import '../imports/ui/user/errors.js';
import '../imports/ui/user/room.js';
import '../imports/ui/user/roompage.js';

// the api js

// the base touter initial
Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notFound',
	waitOn: function () {
	    return Meteor.subscribe('game');
	}
});

// the chess race page not use the base layout
Router.configure({
	layoutTemplate: 'roomPage',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notFound',/!*
	waiOn: function () {
		return Meteor.subscribe('roomUsers');
	}*!/
})

// the base route
Router.route('/', function() {
	this.render('welcome');
	this.layout('layout');
}, {name: 'welcome'});

// the welcome page route
Router.route('/client', function () {
	if (Meteor.userId()) {
		this.render('welcome');
		this.layout('layout');
	} else {
		Router.go('/client/login');
	}
}, {name: 'client.welcome'});

// the user info page route
Router.route('/client/info', function() {
	this.render('info');
	this.layout('layout');
}, {name: 'client.info'});

// the game page route
Router.route('/client/game', function() {
	this.render('game');
	this.layout('layout');
}, {name: 'client.game'});

// the match page route
Router.route('/client/match', function() {
	this.render('match');
	this.layout('layout');
}, {name: 'client.match'});

// the news page route
Router.route('/client/news', function() {
	this.render('news');
	this.layout('layout');
}, {name: 'client.news'});

// the room page distinguish by the unique _id
Router.route('/client/game/room/:_id', function() {
	this.render('room');
	this.layout('layout');
}, {
	name: 'client.game.room',
	waitOn: function() {
		return Meteor.subscribe('room', this.params._id);
	},
	data: function() {
		console.log('打印当前游戏创建的房间是:-------', Rooms.find({}));
		return {
			rooms: Rooms.find({gameId: this.params._id}),
			gameId: this.params._id,
		}  
	}
});

// the roomPage route
Router.route('/client/game/room/roomPage/:_id', {
	name: 'roomPage',
})

/!*var requireLogin = function () {
	if (!Meteor.user()) {
		if (!Meteor.loggingIn()) {
			this.render(this.loadingTemplate);
		} else {
			this.render('accessDenied');
		}
	}
}

Router.onBeforeAction('dataNotFound');
Router.onBeforeAction(requireLogin);*!/*/
