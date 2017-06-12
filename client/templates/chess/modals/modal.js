Template.addRoomModal.onCreated(function() {
	Session.set('addRoomModalErrors', {});
});

Template.addRoomModal.helpers({
	errorMessage: function(field) { 
		// retunn the error by the current field
		return Session.get('addRoomModalErrors')[field];
	},
	errorClass: function(field) {
		// deifne the error style css
		return !! Session.get('addRoomModalErrors')[field] ? 'has-error' : '';
	}
});


Template.addRoomModal.events({
	'submit #createRoom': function(event) {
		event.preventDefault();
		var room = {
			name: $(event.target).find('#roomName').val(),
			password: $(event.target).find('#roomPwd').val(),
			gameId: $('#addRoom').attr('data-gameId'),
		};
		var errors = validateRoom(room);
		if (errors.name || errors.password) {
			return Session.set('addRoomModalErrors', errors);
		};
		Meteor.call('roomInsert', room, function (error, result) {
			// display the error info
			if (error) {
				return throwError(error.reason);
			};
			if (result.roomExists) {
				return throwError('该房间已存在!')
			};
			Meteor.call('enterRoom', result._id, function (e, res) {
				if (e) {
					return throwError(e.reason);
				};
				$('.modal-backdrop').css('display', 'none');
				Router.go('/client/game/room/roomPage/' + Router.current().params._id + '?roomId=' + result._id);
			});	
			console.log('创建房间成功的返回值是:--------', result);
		});
	}
})