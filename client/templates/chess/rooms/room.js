function stop(event) {
	var e = event || window.event;
	e.returnValue = "退出房间将默认认输!";
}

window.onpopstate = function (event) {
	var isEntered = event.state ? event.state.entered : null;
	if (!isEntered) {
		console.log('the event is :------------', event);
	}
};

window.addEventListener('beforeunload', function (e) {
	e.preventDefault();
});


Template.room.events({
	'click .add-room': function() {
	/*	$('#addRoomModal').css('display', 'block');
		$('.modal-backdrop').css('display', 'block');*/
	}
})

Template.roomItem.helpers({
	canEnter: function() {
		return {
			txt: this.state > 1 ? 'reject' : 'enter',
			condition:  this.state > 1 ? false : true,
		}; 	 
	} 
});

Template.roomItem.events({
	'click .enter': function (e) {
		e.preventDefault();
		var that = this;
		Meteor.call('enterRoom', this._id, function (error, result) {
			if (error) {
				return throwError(error.reason);
			};
			history.pushState({entered: true}, "entered=true");
			window.addEventListener('beforeunload', stop, false);
			Router.go('/client/game/room/roomPage/' + that.gameId + '?roomId=' + that._id);
		});	
	},
})