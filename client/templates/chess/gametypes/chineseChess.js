
Template.chineseChess.onCreated(function() {
	var chessPaceData = Router.current() ? ChessPaces.findOne({roomId: Router.current().params.query.roomId}) : null;
	if (chessPaceData) {
		window.onload = function () {
			alert('window onload !!!!');
			boardNew.draw(chessPaceData ? chessPaceData.pace : null); // 重新打开页面， 如果有数据画出当前棋局	
		};
	}
});

Template.chineseChess.onRendered(function() {
	// 下棋同步的autorun
	this.autorun(function() {
		var activeData = Router.current() ? ChessPaces.findOne({roomId: Router.current().params.query.roomId}) : null;
		console.log('打印当前的路径是: -----------', activeData ? activeData.userId : ''); // 不能删除也不能注释！
		boardNew.draw(activeData ? activeData.pace : null);
	});

	// 初始化棋盘的
	this.autorun(function(computation) {
		var activeData = Router.current() ? Rooms.findOne({_id: Router.current().params.query.roomId }) : null;
		var beginState = activeData ? activeData.start : false;
		var users = activeData ? activeData.users : null;
		var num = 0;
		if (users) {
			for (var i = 0; i < users.length; i++) {
				if (users[i].state) {
					num++;
				};
			}
		};
		console.log('初始化棋盘的autorun数据是: ------ ', beginState);
		if(beginState) {
			if (document.getElementById('chess')) {
				boardNew.init(document.getElementById('chess')); // 双方都点击开始后初始化棋盘
			}
		} else {
			if (num == 2) {
				computation.stop(); // 停止计算!	
			}
		}
	});

	this.autorun(function(computation) {
		var activeData = Router.current

		() ? Rooms.findOne({_id: Router.current().params.query.roomId }) : null;
		if (activeData) {
			if (activeData.winner && activeData.winner > 0) {
				if (Meteor.user()._id != activeData.first) {
					alert('很遗憾, 您输了！');
					computation.stop();
				} else {
					alert('恭喜您, 红方获胜！');
					computation.stop();
				}
			} else if(activeData.winner && activeData.winner < 0) {
				if (Meteor.user()._id != activeData.first) {
					alert('恭喜您, 黑方获胜！');
					computation.stop();
				} else {
					alert('很遗憾, 您输了！');
					computation.stop();
				}
			};
		}  
	});
});

Template.chineseChess.helpers({
	showState: function() {
		var roomId = Router.current() ? Router.current().params.query.roomId: null;
		if (roomId) {
			var users = Rooms.findOne({ _id: roomId }).users;
			for (var i = 0; i < users.length; i++) {
				if (users[i]._id === Meteor.user()._id) {
					return users[i].state;				
				}		
			}
		};
	},
	users: function () {
		return Rooms.findOne({ _id: Router.current().params.query.roomId }).users;
	},
	leagueIs: function () {
		return !this._id === Meteor.user()._id;
	},
	// 显示用户信息
	userAccount: function () {
		var roomUsers = Rooms.findOne({ _id: Router.current().params.query.roomId }).users;
		console.log('打印当前房间的用户是: ------ ', roomUsers);
		return {
			me: Meteor.user().username,
			opponent: 'aaa',
		}
	},
});

Template.chineseChess.events({
	// 点击棋盘canvas事件
	'click #chess': function (e, template) {
		var paceData = Router.current() ? Rooms.findOne({_id: Router.current().params.query.roomId }) : null;
		var roomId = Router.current().params.query.roomId;
		var users = Rooms.findOne({_id: roomId}).users;
		var defaultFirst = null;
		for (var i = 0; i < users.length; i++) {
			if(users[i].first) {
				defaultFirst = users[i]._id;
				break;
			} 
		};
		var turn = 0, steps = 0, stepData = null, thisPace = null, stepHasSelected = false;
		if (!paceData) { // the first step
			if (defaultFirst != Meteor.user()._id) {
				alert('您不是先手(先手默认为红方)！');
				return false;
			} else {
				stepData = boardNew.onClickChessBoard(e);
				if (!stepData) return false;
				stepMans = stepData.mans;
				stepMap = stepData.map;  
				stepWinner = stepData.winner;
				stepHasSelected = stepData.hasSelected;
				thisPace = {
					roomId: roomId,
					pace: stepMans,
					map: stepMap,
					winner: stepWinner,
					first: defaultFirst, // the first enter person is the first turn!
					hasSelected: stepHasSelected,  // recode whether selected the piece
				};
				Meteor.call('paceInsert', thisPace, function (error, result) {
					if (error) {
						return throwError(error.reason);
					};
				});
			}
			return true;
			/*sss*/
		};

		if (paceData.winner) return false; // 判定输赢之后结束游戏!
		if (paceData.hasSelected) { // 上一步为选中棋子, 下棋顺序不做改变!
			stepData = boardNew.onClickChessBoard(e);
			console.log('打印返回的值是； -0------ ', stepData);
			stepMans = stepData.mans;
			if (!stepData) return false;
			stepMap = stepData.map;
			stepWinner = stepData.winner;
			stepHasSelected = stepData.hasSelected;
			thisPace = {
				roomId: roomId,
				pace: stepMans,
				first: defaultFirst,
				map: stepMap,
				winner: stepWinner,
				hasSelected: stepHasSelected,  // recode whether selected the piece
			};
			// 更新同一盘棋子的数据, 切换下棋的顺序
			Meteor.call('updatePace', thisPace, function (error, result) {
				if (error) return throwError(error.reason);
			});
		} else {
			if (Meteor.user()._id != paceData.userId) { 
				stepData = boardNew.onClickChessBoard(e);
				if (!stepData) return false;
				stepMans = stepData.mans;
				stepMap = stepData.map;
				stepWinner = stepData.winner;
				stepHasSelected = stepData.hasSelected;
				thisPace = {
					roomId: roomId,
					pace: stepMans,
					map: stepMap,
					first: defaultFirst,
					winner: stepWinner,
					hasSelected: stepHasSelected,  // recode whether selected the piece
				};
				// 更新同一盘棋子的数据, 切换下棋的顺序
				Meteor.call('updatePace', thisPace, function (error, result) {
					if (error) return throwError(error.reason);
				});
			} else {
				return false;
			}
		}
	},

	// the quit event
	'click #quit': function(e, template) {
		e.preventDefault();
		var roomId = Router.current().params.query.roomId;
		var activeData = Router.current() ? Rooms.findOne({_id: Router.current().params.query.roomId }) : null;
		var winner = activeData ? activeData.winner : false;
		Meteor.call('quitRoom', roomId, function (error, result) {
			if (error) return throwError(error.reason);
			if (result.count == 0) { // 两人都退出的时候，删除房间
				Meteor.call('emptyRoom', result.id, function(e, res) {
					if (e) {
						console.log('清空房间报错: ----- ', e.reason);
						return throwError(e.reason);
					}
				});
			};
			Meteor.call('emptyPaces', result.id, function(e, r) { // 一旦有人退出,删除棋局数据
				if (e) return throwError(e.reason);
				console.log('退出房间之后删除步骤数据的返回结果是: ------ ', r);
			});
		});
		history.back(); // 回退到上一页面!
	},

	// the prepare btn 
	'click #prepare': function(e) {
		e.preventDefault();
		var roomId = Router.current().params.query.roomId;
		var paceData = ChessPaces.findOne({roomId: roomId});
		// 修改chesspaces的状态
		Meteor.call('updateState', roomId, function(error, result) {
			if (error) throwError(error.reason);
		});
		if (Rooms.findOne({_id: roomId}).state > 1) { // 满了两个人
			if (!paceData) { // 无数据
				var thisPace = {
					roomId: roomId,
					pace: null,
					map: null,
					winner: null,
					start: 1,
					first: Meteor.user()._id, // 谁先点击准备谁就成为先手
					hasSelected: null,  // recode whether selected the piece
				};
				Meteor.call('paceInsert', thisPace, function (error, result) {
					if (error) {
						return throwError(error.reason);
					};
				});
			} else { // 有数据
				Meteor.call('updatePaceStartState', roomId, function(error, result) {
					if (error) throwError(error.reason)
				});
			};
		}
	}
})