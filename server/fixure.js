
// 测试数据
var now = new Date().getTime();
if (Games.find().count() === 0) {
	
	// create som games
	Games.insert({
		type: 'chineseChess',
		name: '中国象棋',
		icon: 'http://7xj9u3.com1.z0.glb.clouddn.com/chesslogo.jpg',
		maxUserCount: 300,
		limitTime: 20170302,
		desc: '游戏描述',
		rule: '规则描述'
	});
	Games.insert({
		type: 'jumpChess',
		name: '跳棋',
		icon: 'http://7xj9u3.com1.z0.glb.clouddn.com/jumpchess.jpg',
		maxUserCount: 300,
		limitTime: 20170302,
		desc: '游戏描述',
		rule: '规则描述'
	});
	Games.insert({
		type: 'fivwChess',
		name: '五子棋',
		icon: 'http://7xj9u3.com1.z0.glb.clouddn.com/fivechess.jpg',
		maxUserCount: 300,
		limitTime: 20170302,
		desc: '游戏描述',
		rule: '规则描述'
	});
};

// the rooms test data

