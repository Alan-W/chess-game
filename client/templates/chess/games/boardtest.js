var boardset = {
	boardSize: {w: 589, h: 653},
	chessBoardBgImage: null,
	pieceImage: null,
	dotImage: null,
	paneImage: null,
	pieceSize: 60,
	gridBeginPos: {x: 28, y: 28},
	gridSize: 66,
	gridCount: {w: 9, h: 10},
	animation_speed: 0.08,
	childList:  [],
	rotate: false,
	pane: {isShow: false},
	boardMap: [
		['C0', 'M0', 'X0', 'S0', 'J0', 'S1', 'X1', 'M1', 'C1'],
		[	 , 	   ,	 , 	   ,	 , 	   ,	 , 	   ,	 ],
		[ 	, 'P0',	 ,	   , 	 , 	   ,	 , 'P1', 	 ],
		['Z0', 	   , 'Z1', 	   , 'Z2',	   , 'Z3', 	   , 'Z4'],
		[	 , 	   ,	 , 	   ,	 , 	   ,	 , 	   ,	 ],
		[	 , 	   ,	 , 	   ,	 , 	   ,	 , 	   ,	 ],
		['z0', 	   , 'z1', 	   , 'z2',	   , 'z3', 	   , 'z4'],
		[	 , 'p0',	 ,	   , 	 , 	   ,	 , 'p1', 	 ],
		[	 , 	   ,	 , 	   ,	 , 	   ,	 , 	   ,	 ],
		['c0', 'm0', 'x0', 's0', 'j0', 's1', 'x1', 'm1', 'c1'],
	],
	indices: [
		1, 2, 3, 4, 0, 4, 3, 2, 1, 5, 5, 6, 6, 6, 6, 6,//0将1車2马3象4士5炮6卒
		6, 6, 6, 6, 6, 5, 5, 1, 2, 3, 4, 0, 4, 3, 2, 1
	],
	boardPiecesObj: {},
};

boardNew = (function () {
	var mCanvas, mImage, mContext, dot, pane, mBgnPos, mGridSize,
	mPieces = [], //棋子集合
	mans = {},
	mDots = [],
	map = [],
	chessPace = [],
	isPlay = true,
	mImageCursors = [],
	mScale = 1,
	winner = 0,
	first = false,
	matchTurn = false,
	mBlackThenRed = false,
	hasSelectedPiece = null,
	mBoardMap = boardset.boardMap;
	return {
		init: function (canvas) {
			mCanvas = canvas;
			mContext = canvas.getContext("2d");
			mPieceSize = boardset.pieceSize * mScale;
			map = this.createChessPieceMap(boardset.boardMap);
			mBgnPos = {
				x: boardset.gridBeginPos.x * mScale - mPieceSize * 0.5,
				y: boardset.gridBeginPos.y * mScale - mPieceSize * 0.5
			};
			var activeData = Rooms.find({}).fetch()[0];
			var users = activeData ? activeData.users : null;
			/*for (var i = 0; i < users.length; i++) {
				if (users[i].first) {
					first = users[i]._id;
				} else if(!users[i].first) second = users[i]._id;
			};*/

			mGridSize = boardset.gridSize * mScale;
			var count = boardset.indices.length;
			var len = 0;
			for (var i = 0; i < mBoardMap.length; i++) {
				for (var j = 0; j < mBoardMap[i].length; j++) {
					var key = mBoardMap[i][j]; 
					if (! key) continue; // 空格
					var p = {
						idx: mPieces.length,
						type: boardset.indices[len],
						state: 1, // 0: 被吃掉, 1: 存在
						rate: 0,
						from : null,
						isShow: true,
						loc: { x: j, y: i},
						pos: { x: j, y: i},
						ps: [], // 着点
						sign: key.slice(0, 1).toLowerCase(),
						side: (len >= (count / 2) ? 1 : -1) // black or red
					}
					mans[key] = p;
					len++;						
				}
			}
			boardset.boardPiecesObj = mans;
			// 棋盘图片
			boardset.chessBoardBgImage = new Image();
			boardset.chessBoardBgImage.src = '/imgs/bg.png';

			// 棋子图片
			boardset.pieceImage = new Image();
			boardset.pieceImage.src = '/imgs/chess.png';
			boardset.pieceImage.onload = function () {
				boardNew.draw();
			}
			// 提示点的图片
			boardset.dotImage = new Image();
			boardset.dotImage.src = '/imgs/dot.png';

			// 棋子外框的图片
			mImageCursors.length = 2;
			mImageCursors[0] = new Image();
			mImageCursors[0].src = "/imgs/r_box.png";
			mImageCursors[1] = new Image();
			mImageCursors[1].src = "/imgs/b_box.png";
		},

		// draw the canvas
		draw: function (newMans) {
			if (! mContext)return;
			var needredraw = false;
			mContext.clearRect(0, 0, mCanvas.width, mCanvas.height);
			mCanvas.style.display = 'none';
			mCanvas.offsetHeight;
			mCanvas.style.display = 'inherit';
			/*var roomId = Router.current() ? Router.current().params.query.roomId :  null;
			var chessUsers = roomId ? Rooms.findOne({_id: roomId}).users : [];
			for (var g = 0; g < chessUsers.length; g++) {
				if (chessUsers[g].first) {
					first = chessUsers[g]._id;
				}
			};*/
			for (var key in mans) {
				var p = newMans ? newMans[key] : mans[key];
				if (p.state != 1) continue; // 该棋子被吃掉
				var bx = p.loc.x, by = p.loc.y;
				if (p.from == null) {
					p.rate = 1;
				} else {
					p.rate < 1 && (needredraw = true);
					p.rate += boardset.animation_speed;
					p.rate > 1 && (p.rate = 1);
					bx = (p.loc.x - p.from.x) * p.rate + p.from.x;
					by = (p.loc.y - p.from.y) * p.rate + p.from.y;
					p.rate == 1 && (p.from = null);
				}
				p.pos.x = mBgnPos.x + bx * mGridSize;
				p.pos.y = mBgnPos.y + by * mGridSize;

				var offset = {x: p.type * boardset.pieceSize, y: boardset.pieceSize * (p.side < 0 ? 0 : 1)};
				mContext.drawImage(boardset.pieceImage, offset.x, offset.y, boardset.pieceSize, boardset.pieceSize, p.pos.x, p.pos.y, mPieceSize, mPieceSize);
			};

			// 画出该棋子的所有着点
			for (var i = 0; i < mDots.length; i++) {
				mContext.drawImage(boardset.dotImage, boardset.gridSize * mDots[i][0] - 15 + boardset.gridBeginPos.x, boardset.gridSize *  mDots[i][1] - 15 + boardset.gridBeginPos.y)	
			};

			// 画出当前点击的棋子外框
			if (hasSelectedPiece) {
				var curPiece = mans[hasSelectedPiece];
				var curPieceSide = curPiece.side > 0 ? 0 : 1;
				var x = mBgnPos.x + curPiece.loc.x * mGridSize;
				var y = mBgnPos.y + curPiece.loc.y * mGridSize;
				mContext.drawImage(mImageCursors[curPieceSide], 0, 0, mImageCursors[curPieceSide].width, mImageCursors[curPieceSide].height, x, y, mPieceSize, mPieceSize);
			}

			needredraw && setTimeout(function(){
				boardNew.draw();
			}, 50);
		},

		// 生成棋子
		createChessPieceMap: function (map) {
			var newArr = [];
			for (var i = 0; i < map.length ; i++){	
				newArr[i] = map[i].slice();
			}
			return newArr;
		},

		// the chess board click event
		onClickChessBoard: function (e) {	
			var activeData = Rooms.findOne({_id: Router.current().params.query.roomId});
			var users = activeData ? activeData.users : null;
			for (var i = 0; i < users.length; i++) {
				if (users[i].first) {
					first = users[i]._id;
				} else if(!users[i].first) second = users[i]._id;
			};
			var pacesData = ChessPaces.findOne({roomId: Router.current().params.query.roomId}) ? ChessPaces.findOne({roomId: Router.current().params.query.roomId}) : null;
			mans = pacesData && pacesData.pace ? pacesData.pace : mans;
			map = pacesData && pacesData.map ? pacesData.map : map;		
			var gloc = this.getGrid(e.clientX - mCanvas.offsetLeft, e.clientY - mCanvas.offsetTop);
			var key = boardNew.getClickPiece(gloc.x, gloc.y);
			if (key) { // 返回的是点击的棋子
				if (this.clickPiece(key, gloc.x, gloc.y)) {
					return {
						mans: mans,
						map: map,
						winner: winner,
						hasSelected: hasSelectedPiece ? true : false,
					};
				} else return false;
			} else { // 点击了棋盘的空白格子
				this.clickPoint(gloc.x, gloc.y);
			};
			return {
				mans: mans,
				map: map,
				winner: winner,
				hasSelected: hasSelectedPiece ? true : false,
			};	
		},

		// click the piece event
		clickPiece: function (key, x, y) {
			var p = mans[key];
			var eating = false;	
			// 吃子
			if (hasSelectedPiece && hasSelectedPiece != key & p.side != mans[hasSelectedPiece].side) {
				// p 为被吃掉的棋子
				if (this.indexOfPs(mans[hasSelectedPiece].ps, [x, y])) {
					eating = true;
					p.state = 0; // 被吃掉!
					delete map[mans[hasSelectedPiece].loc.y][mans[hasSelectedPiece].loc.x];
					map[y][x] = hasSelectedPiece;
					mans[hasSelectedPiece].loc.x = x;
					mans[hasSelectedPiece].loc.y = y;
					hasSelectedPiece = false;
					mDots.length = 0;
					if (key == 'j0') {
						winner = -1; 
						var defaultFirst = first;
						var thisPace = {
							roomId: Router.current().params.query.roomId,
							pace: mans,
							first: defaultFirst,
							map: map,
							winner: winner,
							hasSelected: hasSelectedPiece,  // recode whether selected the piece
						};
						// 更新同一盘棋子的数据, 切换下棋的顺序
						Meteor.call('updatePace', thisPace, function (error, result) {
							if (error) return throwError(error.reason);
						});
						return false;
					};
					if (key == 'J0') {
						winner = 1 ;
						var defaultFirst = first;
						var thisPace = {
							roomId: Router.current().params.query.roomId,
							pace: mans,
							first: defaultFirst,
							map: map,
							winner: winner,
							hasSelected: hasSelectedPiece,  // recode whether selected the piece
						};
						// 更新同一盘棋子的数据, 切换下棋的顺序
						Meteor.call('updatePace', thisPace, function (error, result) {
							if (error) return throwError(error.reason);
						});
						return false;
					};
				} else {
					alert('大兄弟, 不能这么走!');
				}
			} else { // 选中新子
				if (mans[key].side > 0 && second === Meteor.user()._id) { // 如果是红旗但是被后手点击了则false
					return false;
				} else if(mans[key].side < 0 && first === Meteor.user()._id) { // 如果是黑棋但是被先手点击了则false
					
					return false;
				};
				hasSelectedPiece = key;
				mans[key].ps = piecesLaw[mans[key].sign](x, y, map, mans[key].side, mans); // 获得所有的着点
				mDots = mans[key].ps;
				var jLoc = mans['J0'].loc;
				var sLoc = mans['j0'].loc;
				var jPs = piecesLaw.j(jLoc.x, jLoc.y, map, -1, mans);
				var sPs = piecesLaw.j(sLoc.x, sLoc.y, map, 1, mans);
				var hasSelectedPs = hasSelectedPiece ? mans[hasSelectedPiece].ps : null;
				if (mans[key].side > 0) { // 将军是当前走的这步棋的着点中有将或者是帅的位置
					// for (var i = 0; i < jPs.length; i++) {
						for (var j = 0; j < mans[key].ps.length; j++) {
							if (jLoc.x == mans[key].ps[j][0] && jLoc.y == mans[key].ps[j][1]) {
								alert('将军！');
								if (jPs.length == 0) winner = -1; // 将军的情况下， 如果己方的将已经没有着点数据，则宣告失败!
							}
						}
						
					// }
				} else {
					// for (var i = 0; i < sPs.length; i++) {
						for (var j = 0; j < mans[key].ps.length; j++) {
							if (sLoc.x == mans[key].ps[j][0] && sLoc.y == mans[key].ps[j][1]) {
								alert('将军！');
								if (sPs.length == 0) winner = 1;
							}
						}
						
					// }
				}
				/*var jLoc = mans['J0'].loc;
				var sLoc = mans['j0'].loc;
				var jPs = piecesLaw.j(jLoc.x, jLoc.y, map, -1, mans); // 将的着点
				var sPs = piecesLaw.j(sLoc.x, sLoc.y, map, 1, mans); // 帅的着点
				if (mans[key].side > 0) {
					if (this.indexOfPs(mans[key].ps, [jLoc.x, jLoc.y])) {
						alert('将军');
						if (jPs.length < 1) { // 将已经没有着点了
							winner = -1;
						} else {
							if (this.checkWin(-1, jPs)) {
							 	alert('红方赢！');	
							 	winner = -1;
							} else console.log('checkWin的返回值是: ------- ', this.checkWin(-1, jPs));
						}
					}
				} else {
				
					if (this.indexOfPs(mans[hasSelectedPiece].ps, [sLoc.x, sLoc.y])) {
						alert('将军');
						if (this.checkWin(1, sPs)) {
						 	alert('黑方赢！');	
						 	winner =  1;
						}
					};
				}*/
			};
			if (Router.current()) {
				this.draw(ChessPaces.findOne({roomId: Router.current().params.query.roomId}) ? ChessPaces.findOne({roomId: Router.current().params.query.roomId}).pace : null);
			}
			
			chessPace = mans;
			if (eating) 
				this.playSound('eat');
			else
				this.playSound('select');
			return mans;
		},

		// click the chess board point
		clickPoint: function (x, y) {
			var key = hasSelectedPiece;
			var man = mans[key];

			if (hasSelectedPiece) {
				if (this.indexOfPs(mans[key].ps, [x, y])) { // 点击的是着点
					delete map[mans[hasSelectedPiece].loc.y][mans[hasSelectedPiece].loc.x]; // 删除当前选中点的位置, 更新整个棋局的显示!;
					map[y][x] = key; // 更新棋盘的映射
					man.loc.x = x;
					man.loc.y = y;
					var thisManPs = piecesLaw[man.sign](x, y, map, man.side, mans);
					var jLoc = mans['J0'].loc;
					var sLoc = mans['j0'].loc;
					var jPs = piecesLaw.j(jLoc.x, jLoc.y, map, -1, mans);
					var sPs = piecesLaw.j(sLoc.x, sLoc.y, map, 1, mans);
					if (man.side > 0) { // 将军是当前走的这步棋的着点中有将或者是帅的位置
						// for (var i = 0; i < jPs.length; i++) {
						for (var j = 0; j < thisManPs.length; j++) {
							if (jLoc.x == thisManPs[j][0] && jLoc.y == thisManPs[j][1]) {
								alert('将军！');
								if (jPs.length == 0) winner = -1; // 将军的情况下， 如果己方的将已经没有着点数据，则宣告失败!
							}
						}

						// }
					} else {
						// for (var i = 0; i < sPs.length; i++) {
						for (var j = 0; j <thisManPs.length; j++) {
							if (sLoc.x == thisManPs[j][0] && sLoc.y == thisManPs[j][1]) {
								alert('将军！');
								if (sPs.length == 0) winner = 1;
							}
						}

						// }
					}
					hasSelectedPiece = null;
					mDots.length = 0;
					if (Router.current()) {
						this.draw(ChessPaces.findOne({roomId: Router.current().params.query.roomId}) ? ChessPaces.findOne({roomId: Router.current().params.query.roomId}).pace : null);
					}
					this.draw(ChessPaces.find({}).fetch()[0] ? ChessPaces.find({}).fetch()[0].pace : null);
					this.playSound('move');
					return mans;
				} else {
					alert('大兄弟, 不能这么走!');
				}
			};	
		},

		// get the chess board point
		getGrid: function (x, y) {
			var r = mPieceSize * 0.5;
			x -= mBgnPos.x + r;
			y -= mBgnPos.y + r;
			for (var i = 0; i < boardset.gridCount.h; i++) {
				var gy = i * mGridSize;
				var t = gy - r;
				for (var j = 0; j < boardset.gridCount.w; j++) {
					var gx = j * mGridSize;
					var l = gx - r;
					if (x >= l && x <= l + r * 2 && y <= t + r * 2){
						return {x: j, y: i};
					}
				}
			};
			return null;
		},

		// get the cirrent clicking piece
		getClickPiece: function (x, y) {
			if (x < 0 || x > 8 || y < 0 || y > 9) return false;
			return (map[y][x] && map[y][x] != "0") ? map[y][x] : false;
		},

		// return the ps index
		indexOfPs: function (ps, xy) {
			for (var i = 0; i < ps.length; i++) {
			  	if (ps[i][0] == xy[0] && ps[i][1] == xy[1]) return true;
			};
			return false; 
		},

		// play the action sound
		playSound: function (name) {
			var elem = $('#sound_' + name);
			if (elem.length > 0) {
				var player = elem[0].player || elem[0];
				var media = player.media || elem[0];
				try {
					player.play();
				} catch(e) {
					alert('播放声音捕获的错误是: -------------', e);
					console.log('playSound Errors is: -------------', e);
				}
			}
		},

		// judge the chess race result
		showWin: function () { // x, y, map, side, lyMans
			// 首先判断是否将军，然后判断能否化解将军
			var jLoc = mans['J0'].loc;
			var sLoc = mans['j0'].loc;
			var jPs = piecesLaw.j(jLoc.x, jLoc.y, map, -1, mans);
			var sPs = piecesLaw.j(sLoc.x, sLoc.y, map, 1, mans);
			var hasSelectedPs = hasSelectedPiece ? mans[hasSelectedPiece].ps : null;
			if (hasSelectedPiece) {
				if (mans[hasSelectedPiece].side > 0) {
					for (var i = 0; i < jPs.length; i++) {
						for (var j = 0; j < hasSelectedPs.length; j++) {
							if (jPs[i][0] == hasSelectedPs[j][0] && jPs[i][1] == hasSelectedPs[j][1]) {
								alert('将军！');
								if (jPs.length == 0) {
									return -1;
								} else {
									return 0;
								}
							}
						}
						
					}
				} else {
					for (var i = 0; i < sPs.length; i++) {
						for (var j = 0; j < hasSelectedPs.length; j++) {
							if (sPs[i][0] == hasSelectedPs[j][0] && sPs[i][1] == hasSelectedPs[j][1]) {
								alert('将军！');
								if (jPs.length == 0) {
									return -1;
								} else {
									return 0;
								}
							}
						}
						
					}
				}
				
			} else return 0;
			/*for (var key in mans) {
				var thisKeyPs = piecesLaw[mans[key].sign](mans[key].loc.x, mans[key].loc.y, map, mans[key].side, mans); // 当前棋子的所有着点
				if (mans[key].side < 0) { // red
					for (var i = 0; i < thisKeyPs.length; i++) {
						for (var j = 0; j < jPs.length; j++) {
							if (thisKeyPs[i][0] == jPs[j][0] && thisKeyPs[i][1] == jPs[j][1]) {
								alert('将军!');
								if (this.checkWin(-1, jPs)) {
								 	alert('红方赢！');	
								 	return -1;
								};
							};
						}			
					}
				} else { // black
					for (var i = 0; i < thisKeyPs.length; i++) {
						for (var j = 0; j < sPs.length; j++) {
							if (thisKeyPs[i][0] == sPs[j][0] && thisKeyPs[i][1] == sPs[j][1]) {
								alert('将军!');
								if (this.checkWin(1, sPs)) {
								 	alert('红方赢！');	
								 	return -1;
								};
							};
						}
						
					}
				}
			};*/
			return 0;	
		},

		// check the win
		checkWin: function (side, ps) {
			var len = 0;
			for (var key in mans) {
				var thisPs = piecesLaw[mans[key].sign](mans[key].loc.x, mans[key].loc.y, map, mans[key].side, mans); // 获得该棋子的所有着点
				if (side > 0) { // 黑将红
					if (mans[key].side < 0) { // 判断将是否有着点， 有着点时着点是否受到对方棋子的威胁
						for (var i = 0; i < ps.length; i++) {
							for (var j = 0; j < thisPs.length; j++) {
								if (thisPs[j][0] == ps[i][0] || thisPs[j][1] == ps[i][1]) len++;
							}	
						};
						if (len == ps.length) return true; // 帅的着点都收到了对方棋子的威胁
					}
				} else { // 红将黑
					if (mans[key].side > 0) { // 判断红方棋子的着点
						for (var i = 0; i < ps.length; i++) { // 判断将的着点是否受到威胁
							for (var j = 0; j < thisPs.length; j++) {
								if (thisPs[j][0] == ps[i][0] || thisPs[j][1] == ps[i][1]) len++;
							}	
						};
						if (len == ps.length) return true; // 将的着点都受到了对方棋子的威胁
					}
				}
			};
			return false; // 可以化解
		}

	}
})();


// 生成棋子的走法
export const piecesLaw = (function () {
	return {
		// 車的走法
		c: function (x, y, map, side, lyMans) {
			var d = [];
			//左侧检索
			for (var i = x-1; i >= 0; i--){
				if (map[y][i]) {
					if (lyMans[map[y][i]].side!=side) d.push([i,y]);
					break
				} else{
					d.push([i,y])	
				}
			}
			//右侧检索
			for (var i = x+1; i <= 8; i++){
				if (map[y][i]) {
					if (lyMans[map[y][i]].side!=side) d.push([i,y]);
					break
				}else{
					d.push([i,y])	
				}
			}
			//上检索
			for (var i = y-1 ; i >= 0; i--){
				if (map[i][x]) {
					if (lyMans[map[i][x]].side!=side) d.push([x,i]);
					break
				}else{
					d.push([x,i])	
				}
			}
			//下检索
			for (var i = y+1 ; i<= 9; i++){
				if (map[i][x]) {
					if (lyMans[map[i][x]].side!=side) d.push([x,i]);
					break
				}else{
					d.push([x,i])	
				}
			}
			return d;
		},

		// 马的走法
		m: function (x, y, map, side, lyMans) {
			var d=[];
			//1点
			if ( y-2>= 0 && x+1<= 8 && !map[y-1][x] &&(!lyMans[map[y-2][x+1]] || lyMans[map[y-2][x+1]].side!=side)) d.push([x+1,y-2]);
			//2点
			if ( y-1>= 0 && x+2<= 8 && !map[y][x+1] &&(!lyMans[map[y-1][x+2]] || lyMans[map[y-1][x+2]].side!=side)) d.push([x+2,y-1]);
			//4点
			if ( y+1<= 9 && x+2<= 8 && !map[y][x+1] &&(!lyMans[map[y+1][x+2]] || lyMans[map[y+1][x+2]].side!=side)) d.push([x+2,y+1]);
			//5点
			if ( y+2<= 9 && x+1<= 8 && !map[y+1][x] &&(!lyMans[map[y+2][x+1]] || lyMans[map[y+2][x+1]].side!=side)) d.push([x+1,y+2]);
			//7点
			if ( y+2<= 9 && x-1>= 0 && !map[y+1][x] &&(!lyMans[map[y+2][x-1]] || lyMans[map[y+2][x-1]].side!=side)) d.push([x-1,y+2]);
			//8点
			if ( y+1<= 9 && x-2>= 0 && !map[y][x-1] &&(!lyMans[map[y+1][x-2]] || lyMans[map[y+1][x-2]].side!=side)) d.push([x-2,y+1]);
			//10点
			if ( y-1>= 0 && x-2>= 0 && !map[y][x-1] &&(!lyMans[map[y-1][x-2]] || lyMans[map[y-1][x-2]].side!=side)) d.push([x-2,y-1]);
			//11点
			if ( y-2>= 0 && x-1>= 0 && !map[y-1][x] &&(!lyMans[map[y-2][x-1]] || lyMans[map[y-2][x-1]].side!=side)) d.push([x-1,y-2]);
			return d;
		},

		//相的走法
		x: function (x, y, map, side, lyMans) {
			var d=[];
			if (side===1){ //红方
				//4点半
				if ( y+2<= 9 && x+2<= 8 && !map[y+1][x+1] && (!lyMans[map[y+2][x+2]] || lyMans[map[y+2][x+2]].side!=side)) d.push([x+2,y+2]);
				//7点半
				if ( y+2<= 9 && x-2>= 0 && !map[y+1][x-1] && (!lyMans[map[y+2][x-2]] || lyMans[map[y+2][x-2]].side!=side)) d.push([x-2,y+2]);
				//1点半
				if ( y-2>= 5 && x+2<= 8 && !map[y-1][x+1] && (!lyMans[map[y-2][x+2]] || lyMans[map[y-2][x+2]].side!=side)) d.push([x+2,y-2]);
				//10点半
				if ( y-2>= 5 && x-2>= 0 && !map[y-1][x-1] && (!lyMans[map[y-2][x-2]] || lyMans[map[y-2][x-2]].side!=side)) d.push([x-2,y-2]);
			}else{
				//4点半
				if ( y+2<= 4 && x+2<= 8 && !map[y+1][x+1] && (!lyMans[map[y+2][x+2]] || lyMans[map[y+2][x+2]].side!=side)) d.push([x+2,y+2]);
				//7点半
				if ( y+2<= 4 && x-2>= 0 && !map[y+1][x-1] && (!lyMans[map[y+2][x-2]] || lyMans[map[y+2][x-2]].side!=side)) d.push([x-2,y+2]);
				//1点半
				if ( y-2>= 0 && x+2<= 8 && !map[y-1][x+1] && (!lyMans[map[y-2][x+2]] || lyMans[map[y-2][x+2]].side!=side)) d.push([x+2,y-2]);
				//10点半
				if ( y-2>= 0 && x-2>= 0 && !map[y-1][x-1] && (!lyMans[map[y-2][x-2]] || lyMans[map[y-2][x-2]].side!=side)) d.push([x-2,y-2]);
			}
			return d;
		},

		// 士的走法
		s: function (x, y, map, side, lyMans) {
			var d=[];
			if (side === 1){ //红方
				//4点半
				if ( y+1<= 9 && x+1<= 5 && (!lyMans[map[y+1][x+1]] || lyMans[map[y+1][x+1]].side!=side)) d.push([x+1,y+1]);
				//7点半
				if ( y+1<= 9 && x-1>= 3 && (!lyMans[map[y+1][x-1]] || lyMans[map[y+1][x-1]].side!=side)) d.push([x-1,y+1]);
				//1点半
				if ( y-1>= 7 && x+1<= 5 && (!lyMans[map[y-1][x+1]] || lyMans[map[y-1][x+1]].side!=side)) d.push([x+1,y-1]);
				//10点半
				if ( y-1>= 7 && x-1>= 3 && (!lyMans[map[y-1][x-1]] || lyMans[map[y-1][x-1]].side!=side)) d.push([x-1,y-1]);
			} else{
				//4点半
				if ( y+1<= 2 && x+1<= 5 && (!lyMans[map[y+1][x+1]] || lyMans[map[y+1][x+1]].side!=side)) d.push([x+1,y+1]);
				//7点半
				if ( y+1<= 2 && x-1>= 3 && (!lyMans[map[y+1][x-1]] || lyMans[map[y+1][x-1]].side!=side)) d.push([x-1,y+1]);
				//1点半
				if ( y-1>= 0 && x+1<= 5 && (!lyMans[map[y-1][x+1]] || lyMans[map[y-1][x+1]].side!=side)) d.push([x+1,y-1]);
				//10点半
				if ( y-1>= 0 && x-1>= 3 && (!lyMans[map[y-1][x-1]] || lyMans[map[y-1][x-1]].side!=side)) d.push([x-1,y-1]);
			}
			return d;
		},

		// 将的走法
		j: function (x, y, map, side, lyMans) {
			var d = [];
			var isNull = (function (y1,y2){
				var y1 = lyMans["j0"].loc ? lyMans["j0"].loc.y : null;
				var x1 = lyMans["J0"].loc ? lyMans["J0"].loc.x : null;
				var y2 = lyMans["J0"].loc ? lyMans["J0"].loc.y : null;
				for (var i = y1 - 1; i > y2; i--){
					if (map[i][x1]) return false;
				}
				return true;
			})();
		
			if (side === 1){ //红方
				//下
				if ( y+1<= 9  && (!lyMans[map[y+1][x]] || lyMans[map[y+1][x]].side!=side)) d.push([x,y+1]);
				//上
				if ( y-1>= 7 && (!lyMans[map[y-1][x]] || lyMans[map[y-1][x]].side!=side)) d.push([x,y-1]);
				//老将对老将的情况
				if ( lyMans["j0"].x == lyMans["J0"].x &&isNull) d.push([lyMans["J0"].x,lyMans["J0"].y]);
				
			} else{
				//下			
				if ( y+1<= 2  && (!lyMans[map[y+1][x]] || lyMans[map[y+1][x]].side!=side)) d.push([x,y+1]);
				//上
				if ( y-1>= 0 && (!lyMans[map[y-1][x]] || lyMans[map[y-1][x]].side!=side)) d.push([x,y-1]);
				//老将对老将的情况
				if ( lyMans["j0"].x == lyMans["J0"].x &&isNull) d.push([lyMans["j0"].x,lyMans["j0"].y]);
			}
			//右
			if ( x+1<= 5  && (!lyMans[map[y][x+1]] || lyMans[map[y][x+1]].side!=side)) d.push([x+1,y]);
			//左
			if ( x-1>= 3 && (!lyMans[map[y][x-1]] || lyMans[map[y][x-1]].side!=side))d.push([x-1,y]);
			return d;
		},

		// 炮的走法
		p: function (x, y, map, side, lyMans) {
			var d=[];
			//左侧检索
			var n = 0;
			for (var i = x-1; i >= 0; i--){
				if (map[y][i]) {
					if (n == 0){
						n++;
						continue;
					} else {
						if (lyMans[map[y][i]].side != side) d.push([i,y]);
						break;
					}
				} else{
					if(n==0) d.push([i,y])	
				}
			}
			//右侧检索
			var n = 0;
			for (var i = x+1; i <= 8; i++){
				if (map[y][i]) {
					if (n==0){
						n++;
						continue;
					} else {
						if (lyMans[map[y][i]].side != side) d.push([i,y]);
						break;	
					}
				} else {
					if(n==0) d.push([i,y])	
				}
			}
			//上检索
			var n = 0;
			for (var i = y-1 ; i >= 0; i--){
				if (map[i][x]) {
					if (n == 0){
						n++;
						continue;
					} else {
						if (lyMans[map[i][x]].side != side) d.push([x,i]);
						break;	
					}
				} else {
					if(n==0) d.push([x,i])	
				}
			}
			//下检索
			var n=0;
			for (var i = y+1 ; i<= 9; i++){
				if (map[i][x]) {
					if (n == 0){
						n++;
						continue;
					} else {
						if (lyMans[map[i][x]].side != side) d.push([x,i]);
						break;	
					}
				} else {
					if(n==0) d.push([x,i])	
				}
			}
			return d;
		},

		// 卒的走法
		z: function (x, y, map, side, lyMans) {
			var d=[];
			if (side === 1){ //红方
				//上
				if ( y-1 >= 0 && (!lyMans[map[y-1][x]] || lyMans[map[y-1][x]].side!=side)) d.push([x,y-1]);
				//右
				if ( x+1 <= 8 && y <= 4  && (!lyMans[map[y][x+1]] || lyMans[map[y][x+1]].side!=side)) d.push([x+1,y]);
				//左
				if ( x-1 >= 0 && y <= 4 && (!lyMans[map[y][x-1]] || lyMans[map[y][x-1]].side!=side))d.push([x-1,y]);
			} else{
				//下
				if ( y+1 <= 9  && (!lyMans[map[y+1][x]] || lyMans[map[y+1][x]].side!=side)) d.push([x,y+1]);
				//右
				if ( x+1 <= 8 && y >= 6  && (!lyMans[map[y][x+1]] || lyMans[map[y][x+1]].side!=side)) d.push([x+1,y]);
				//左
				if ( x-1>= 0 && y >= 6 && (!lyMans[map[y][x-1]] || lyMans[map[y][x-1]].side!=side))d.push([x-1,y]);
			}
			return d;
		}
	}
})()



