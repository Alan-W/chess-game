/*// define the chess board
var boardset = {
	boardSize: {w: 589, h: 653},
	pieceImage: null,
	dotImage: null,
	paneImage: null,
	pieceSize: 60,
	gridBeginPos: {x: 28, y: 28},
	gridSize: 66,
	gridCount: {w: 9, h: 10},
	animation_speed: 0.08,
	indices: [
		1, 2, 3, 4, 0, 4, 3, 2, 1, 5, 5, 6, 6, 6, 6, 6, // 0将1車2马3象4士5炮6卒
	],
	default_loc: [
		{ x: 0, y: 0}, { x: 1, y: 0}, { x: 2, y: 0}, // 車马象
		{ x: 3, y: 0}, { x: 4, y: 0}, { x: 5, y: 0}, // 士将士
		{ x: 6, y: 0}, { x: 7, y: 0}, { x: 8, y: 0}, // 象马车
		{ x: 1, y: 2}, { x: 7, y: 2},	// 	炮炮
		{ x: 0, y: 3}, { x: 2, y: 3}, { x: 4, y: 3}, { x: 6, y: 3}, { x: 8, y: 3}, // 卒卒卒卒卒
	],
	limits: [
		{ // 将
			mode: 2,
			area: { x1: 3, x2: 5, y1: 0, y2: 2},
			sign: 'k'
		}, 
		{ // 車
			mode: 0,
			sign: 'r'
		},
		{ // 马
			mode: 0,
			sign: 'n'
		}, 
		{ // 相
			mode: 1,
			pos: [
				{ x: 2, y: 0}, { x: 6, y: 0},
				{ x: 0, y: 2}, { x: 4, y: 2}, { x: 8, y: 2},
				{ x: 2, y: 4}, { x: 6, y: 4},
			],
			sign: 'b'
		},
		{ // 士
			mode: 1,
			pos: [
				{ x: 3, y: 0}, { x: 5, y: 0},
				{ x: 4, y: 1},
				{ x: 3, y: 2}, { x: 5, y: 2},
			],
			sign: 'a'
		}, 
		{ // 炮
			mode: 0,
			sign: 'c'
		},
		{ // 卒
			mode: 3,
			pos: [
				{ x: 0, y: 3}, { x: 2, y: 3}, { x: 4, y: 3}, { x: 6, y: 3}, { x: 8, y: 3},
				{ x: 0, y: 4}, { x: 2, y: 4}, { x: 4, y: 4}, { x: 6, y: 4}, { x: 8, y: 4}
			],
			area: { x1: 0, x2: 8, y1: 5, y2: 9},
			sign: 'p'
		}
	]
};

export var board = (function() {
	var mCanvas, mImage, mContext,
	bylaw = {}, // 棋子能走的着点
	mans = {}, // 所有棋子的集合 
	mImgCursors = [],
	mScale = 1, 
	mBlackThenRed = true,
	mLastTouchTime = 0,
	mSelectedPiece = null,
	mSelectedGrid = null,
	mSoundEnabled = true,
	isPlay = true,
	mPieces = [],
	startX = boardset.gridBeginPos.x,
	startY = boardset.gridBeginPos.y,
	space = boardset.gridSize,
	mMarkingLocations = [],
	mContentSize = {w: 0, h: 0},
	isShow = true,
	dots = [],
	mBatchMoves = [],
	mBatchMoveIndex = -1,
	mBatchMoveFunc = null,
	mMovingQueue = [],
	mSituationQueue = [], mSituationIndex = -1,
	mPieceSize, mBgnPos, mGridSize;
	return {
		init: function (canvas) {
			mCanvas = canvas;
			mContext = canvas.getContext("2d");
			mPieceSize = boardset.pieceSize * mScale;
			mContentSize = { w: mCanvas.width, h: mCanvas.height};
			mBgnPos = {
				x: boardset.gridBeginPos.x * mScale - mPieceSize * 0.5,
				y: boardset.gridBeginPos.y * mScale - mPieceSize * 0.5 
			};
			mGridSize = boardset.gridSize * mScale;
			var count = boardset.indices.length;
			mPieces.length = count * 2;
			for (var i = 0; i < mPieces.length; i++) {
				var p = {
					idx: i,
					type: boardset.indices[i % count],
					loc: { x: 0, y: 0},
					pos: { x: 0, y: 0},
					from: null,
					rate: 0,
					state: 1, // 0: 被吃掉,1: 存在
					side: (i >= count ? 1 : -1) // black or red
				};
				mPieces[i] = p;
			};
			this.resetSituation();
			// 棋子图片
			boardset.pieceImage = new Image();
			boardset.pieceImage.src = '/imgs/chess.png';
			boardset.pieceImage.onload = function() {
				board.draw();
			}

			// 提示点图片
			boardset.dotImage = new Image();
			boardset.dotImage.src = "/imgs/dot.png";

			// 棋子外框图片

			mImgCursors.length = 2;
			mImgCursors[0] = new Image();
			mImgCursors[0].src = "/imgs/r_box.png";
			mImgCursors[1] = new Image();
			mImgCursors[1].src = "/imgs/b_box.png";
		},

		draw: function() {
			if (!mContext) {
			  	alert('您的浏览器版本太低, 请升级浏览器至IE9以上, 或者下载firefox、谷歌浏览器!');
			  	return;
			};
			var needredraw = false;  
			mContext.clearRect(0, 0, mCanvas.width, mCanvas.height);
			mCanvas.style.display = 'none';
			mCanvas.offsetHeight;
			mCanvas.style.display = 'inherit';

			for (var i = 0; i < mPieces.length; i++) {
				var p = mPieces[i];
				if (p.state != 1) {
					continue;
				};
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
				};
				p.pos.x = mBgnPos.x + bx * mGridSize;
				p.pos.y = mBgnPos.y + by * mGridSize;
				var offset = { x: p.type * boardset.pieceSize, y: boardset.pieceSize * (p.side < 0 ? 0 : 1)};
				mContext.drawImage(boardset.pieceImage, offset.x, offset.y, boardset.pieceSize, boardset.pieceSize, p.pos.x, p.pos.y, mPieceSize, mPieceSize);
			};
			for (var i = 0; i < mMarkingLocations.length; i++) {
				var m1 = mMarkingLocations[i];
				var x = mBgnPos.x + m1.x * mGridSize;
				var y = mBgnPos.y + m1.y * mGridSize;
				if (m1.t == 1) {
					continue;
				};
				mContext.drawImage(mImgCursors[m1.c], 0, 0, mImgCursors[m1.c].width, mImgCursors[m1.c].height, x-3, y-3, mGridSize, mGridSize);
			};
			needredraw && setTimeout(function() {
				board.draw();
			})
		},

		resetSituation: function () {
			var count = mPieces.length / 2;
			var locs = new Array(mPieces.length);
			var def_locs = boardset.default_loc;
			var states = new Array(mPieces.length);
			for (var i = 0; i < mPieces.length; i++) {
				var p = mPieces[i];
				if (p.side > 0 && mBlackThenRed) {
					p.loc.x = 8 - def_locs[i % count].x;
					p.loc.y = 9 - def_locs[i % count].y;
				} else {
					p.loc.x = def_locs[i % count].x;
					p.loc.y = def_locs[i % count].y;
				};
				p.rate = 1;
				p.from = null;
				p.state = 1;
				states[i] = 1;
				locs[i] = p.loc;
			};
			this.saveSituation();
		},

		saveSituation: function () {
			var mSituation = this.getSituation();
		},

		getSituation: function () {
			var info = "";
			var dir = mBlackThenRed ? 1 : -1;
			var y = mBlackThenRed ? 0 : 9;
			while (y >= 0 && y < 10) {
				var line = "", space = 0;
				var x = mBlackThenRed ? 0 : 8;
				while (x >= 0 && x < 9) {
					var i = this.getPieceOnLocation(x, y);
					if (i < 0) {
						++space;
					} else {
						if (space > 0) {
							line += space.toString();
						};
						var p = mPieces[i];
						var sign = boardset.limits[p.type].sign;
						if (p.side > 0) {
							sign = sign.toUpperCase();
						};
						line += sign;
						space = 0;
					};
					x += dir;
				};
				if (space > 0) {
					line += space.toString();
				};
				if (info.length > 0) {
					info += "/";
				};
				info += line;
				y += dir;
			}
			return info;
		},

		// click the canvas board
		onClickBoard: function (e) {
			if (!isPlay) return false;
			var gloc = this.getGrid(e.clientX - mCanvas.offsetLeft, e.clientY - mCanvas.offsetTop);
			console.log('打印当前操作的棋子是:----------', mSelectedPiece);
			if (mSelectedPiece != null){
				// 在已经选择棋子的状态下点击棋盘事件
				var time = (new Date()).getTime();
				console.log('打印当前的事件time是: ---------', time);
				if (time - mLastTouchTime < 250 && mSelectedPiece.type != 0){
					// 双击删除
					this.deletePiece(mSelectedPiece);
				} else{
					
					if (gloc != null){
						alert('点击了棋盘的格子!');
						// 点击了棋盘的格子
						for (var i = 0; i < mMarkingLocations.length; i++) {
							var ml = mMarkingLocations[i];
							if (ml.t == 1 && ml.x == gloc.x && ml.y == gloc.y){
								// 为可走格 -> 移动子
								this.movePiece(mSelectedPiece, gloc);
								break;
							}
						};
						mSelectedPiece = null;
						mMarkingLocations.length = 0;
						// env.vars.curOptMode(0);
					}
				}
				mLastTouchTime = 0;
			} else {
				// 在未选择棋子的状态下触发棋盘的点击事件
				mMarkingLocations.length = 0;
				mSelectedPiece = this.getPieceOnPixel(e.clientX - mCanvas.offsetLeft, e.clientY - mCanvas.offsetTop);
				var whichSide = mSelectedPiece.side > 0 ? 0 : 1;
				console.log('未选中棋子的状态下点击的当前棋子是: -------------', mSelectedPiece);	
				if (mSelectedPiece != null){
					// 点击新子
					mMarkingLocations.push({x: mSelectedPiece.loc.x, y: mSelectedPiece.loc.y, t: 0, c: whichSide});
					console.log('打印出当前点击的新棋子是: -----------', mSelectedPiece);
					this.markTargetLocations(); // 获得目标位置
					mLastTouchTime = (new Date()).getTime();
					// env.vars.curOptMode(1);
					this.playSound('select');
				} else if (this.getDeletedPieces().length > 0){
					// 点击空白 & 存在删子
					if (mSelectedGrid){
						// 上次已选格 -> 取消选格
						mSelectedGrid = null;
						// env.vars.curOptMode(0);
					} else if (gloc != null){
						// 点击格 & 上次未选格 -> 选格
						mSelectedGrid = gloc;
						mMarkingLocations.push({x: gloc.x, y: gloc.y, t: 0, c: whichSide});
						// env.vars.curOptMode(1);
					}else{
						return false;
					}
				} else{
					return false;
				}
			}

			this.draw();
			return true;
		},

		markTargetLocations: function () {
			if (mSelectedPiece == null)
			    return;
			var type = boardset.indices[mSelectedPiece.idx % boardset.indices.length];
			var limit = boardset.limits[type];
			var mode = limit.mode;
			var poses = null, area = null;
			if (mode == 0)
			    area = { x1: 0, x2: 8, y1: 0, y2: 9 };
			else if (mode == 1)
			    poses = limit.pos;
			else if (mode == 2)
			    area = limit.area;
			else if (mode == 3) {
			    poses = limit.pos;
			    area = limit.area;
			}
			var dirNormaled = (mBlackThenRed && mSelectedPiece.side == -1) || (!mBlackThenRed && mSelectedPiece.side == 1);
			if (poses != null) {
			    for (var i = 0; i < poses.length; ++i) {
			        var y = (dirNormaled ? poses[i].y : (9 - poses[i].y));
			        var x = mBlackThenRed ? poses[i].x : (8 - poses[i].x);
			        var pi = this.getPieceOnLocation(x, y);
			        if (pi < 0 || (mPieces[pi].side != mSelectedPiece.side && mPieces[pi].type != 0)) {
			            mMarkingLocations.push({ x: x, y: y, t: 1 });
			        }
			    }
			}
			if (area != null) {
				for (var i = area.x1; i <= area.x2; ++i) {
					var y1 = (dirNormaled ? area.y1 : (9 - area.y2));
					var y2 = (dirNormaled ? area.y2 : (9 - area.y1));
					for (var j = y1; j <= y2; ++j) {
						var pi = this.getPieceOnLocation(i, j);
					    if (pi < 0 || (mPieces[pi].side != mSelectedPiece.side && mPieces[pi].type != 0)){
					        mMarkingLocations.push({ x: i, y: j, t: 1 });
					    }
					}
				}
			}
		},

		movePiece: function (p, loc, redraw) {
			if (loc == null){
				if (mSelectedPiece) {
					loc = mSelectedPiece.loc;
					alert('选中的是棋子!');
				} else if (mSelectedGrid) {
					alert('选中的是棋盘!');
					loc = mSelectedGrid;
				} else {
					alert('选中的既不是棋子也不是棋盘!');
					return;
				};
			}
			var i = this.getPieceOnLocation(loc.x, loc.y);
			console.log('打印出movePiece的时候目的地是哪个: -----------------', i);
			var eating = i >= 0;
			console.log('打印出movePiece中的eating 是: ---------------', eating);
			if (eating)
				this.deletePiece(mPieces[i], false, true);
			if (mSelectedGrid){
				mSelectedGrid = null;
				mMarkingLocations.length = 0;
				env.vars.curOptMode(0);
			}
			p.loc = loc;
			p.state = 1;
			redraw && this.draw();
			// env.evts.onBoardChanged();
			this.pushSituation();
			if (eating)
				this.playSound('eat');
			else
				this.playSound('move1');
		},

		// delte the piece
		deletePiece: function (p, redraw, donotrecord) {
			if (p == null)
				p = mSelectedPiece;
			if (p == null || p.state == 0)
				return;
			p.state = 0;
			p.loc = {x: -1, y: -1};
			if (p == mSelectedPiece){
				mSelectedPiece = null;
				mMarkingLocations.length = 0;
				// env.vars.curOptMode(0);
			}
			redraw && this.draw();
			// env.evts.onBoardChanged();
			if (!donotrecord)
				this.pushSituation();
			this.playSound('eat');
		},

		pushSituation: function () {
			if (mBatchMoveFunc)
				return;// donot push while animating
			var info = this.getSituation();
			var idxNext = mSituationIndex + 1;
			if (idxNext < mSituationQueue.length){
				mSituationQueue.splice(idxNext, mSituationQueue.length - idxNext);
			}
			mSituationQueue.push(info);
			mSituationIndex = mSituationQueue.length - 1;
		},

		getDeletedPieces: function(){
			var lst = [];
			for (var i = 0; i < mPieces.length; ++i) {
				var p = mPieces[i];
				if (p.state == 0)
					lst.push(p);
			}
			return lst;
		},

		showDot: function (x, y) {
			for (var i = 0; i < docts.length; i++) {
				if (isShow) {
					boardset.dotImage.onload = function() {
						mContext.drawImage(boardset.dotImage, boardset.pieceSize * dots[i][0] + 10 + boardset.gridBeginPos.x, boardset.pieceSize * dots[i][0] + 10 + boardset.gridBeginPos.y)	
					}
				}
			}
		},
		showPane: function (x, y) {
			if (isShow) {
				mContext.drawImage(boardset.paneImage, boardset.pieceSize * x + boardset.gridBeginPos.x, boardset.pieceSize * x + boardset.gridBeginPos.y);
			}
		},

		playSound: function (name) {
			if (!mSoundEnabled) {
				return;	
			};
			var elem = $('#sound_' + name);
			if (elem.length > 0) {
				var player = elem[0].player || elem[0];
				var media = player.media || elem[0];
				console.log('player: -----------', player);
				console.log('media:------------', media);
				try {
					player.play()
				} catch(e) {
					// statements
					alert(e);
				}
			}
		},
		mMarkingLocations: function () {
			if (! mSelectedPiece == null)
				return;
			var type = boardset.indices[mSelectedPiece.idx % boardset.indices.length];
			var limit = boardset.limits[type];
			var mode = limit.mode;
			var poses = null, area = null;
			if (mode == 0) {
				area = { x1: 0, x2: 8, y1: 0, y2: 9}
			} else if (mode == 1) {
				area = limits.pos;
			} else if (mode == 2) {
				area == limit.area;
			} else if (mode == 3) {
				poses = limit.pos;
				area = limit.area;
			};
			var dirNormaled = (mBlackThenRed && mSelectedPiece.side == -1) || (!mBlackThenRed && mSelectedPiece.side == 1);
			if (poses != null) {
				for (var i = 0; i < poses.length; i++) {
					var x = mBlackThenRed ? poses[i].x : (8 - poses[i].x)
				}
			}
		},

		// 获得棋盘上网格的交点信息
		getGrid: function (x, y) {
			var r = mPieceSize * 0.5;
			x = x - mBgnPos.x + r;
			y = y - mBgnPos.y + r;
			for (var i = 0; i < boardset.gridCount.h; i++) {
				var gy = i * mGridSize;
				var t = gy - r;
				for (var j = 0; j < boardset.gridCount.w; j++) {
					var gx = j * mGridSize;
					var l = gx - r;
					if (x >= 1 && x <= l + r * 2 && y <= t + r * 2) {
						return { x: j - 1, y: i - 1};
					}
				}
			};
			return null;
		},

		//  获得当前位置上是否有棋子
		getPieceOnLocation: function (x, y) {
			for (var i = 0; i < mPieces.length; i++) {
				var p = mPieces[i];
				if (p.state != 0 && p.loc.x == x && p.loc.y == y) {
					return 1;
				};
				return -1;
			}
		},

		// 获得棋子在棋盘上的具体位置
		getPieceOnPixel: function (x, y) {
			var r = mPieceSize * 0.5;
			for (var i = 0; i < mPieces.length; i++) {
				var p = mPieces[i];
				if (p.state != 1) {
					continue;
				};
				var l = p.pos.x, t = p.pos.y;
				if (x >= l && x <= l + r * 2 && y >= t && y <= t + r * 2) {
					return p;
				}
			}
			return null;
		},

	}
})();

//生成map里面有的棋子
board.createMans = function(map){
	for (var i=0; i<map.length; i++){
		for (var n=0; n<map[i].length; n++){
			var key = map[i][n];
			if (key){
				board.mans[key]=new board.class.Man(key);
				board.mans[key].x=n;
				board.mans[key].y=i;
				board.childList.push(board.mans[key])
			}
		}
	}
}

board.initMap = [
	['C0','M0','X0','S0','J0','S1','X1','M1','C1'],
	[    ,    ,    ,    ,    ,    ,    ,    ,    ],
	[    ,'P0',    ,    ,    ,    ,    ,'P1',    ],
	['Z0',    ,'Z1',    ,'Z2',    ,'Z3',    ,'Z4'],
	[    ,    ,    ,    ,    ,    ,    ,    ,    ],
	[    ,    ,    ,    ,    ,    ,    ,    ,    ],
	['z0',    ,'z1',    ,'z2',    ,'z3',    ,'z4'],
	[    ,'p0',    ,    ,    ,    ,    ,'p1',    ],
	[    ,    ,    ,    ,    ,    ,    ,    ,    ],
	['c0','m0','x0','s0','j0','s1','x1','m1','c1']
];

// 棋子的走法
// 車的走法
board.bylaw["c"] = function (x, y, map, my) {
	var d = [];
	// 左侧检索
	for (var i = x -1; i >= 0; i--) {
		if (map[y][i]) { // 该位置上有子
			if (board.mans[map[y][i].my != my]) {
				d.push[i, y];
			};
			break;
		} else { // 该位置上无子
			d.push([i, y]);
		}
	}
	// 右侧检索
	for (var i = x + 1; i <= 8; i++) {
		if (map[y, i]) {
			if (board.mans[map[y][i].my != my]) {
				d.push[i, y];
			}
			break;	
		} else {
			d.push[i, y];
		}
	}
	// 上检索
	for (var i = y -1; i >= 0; i--) {
		if (map[i][x]) {
			if (board.mans[map[i][x].my != my]) {
				d.push([i, x])
			}
			break;
		} else {
			d.push([x, i]);
		}
	}
	//下检索
	for (var i = y + 1; i <= 9; i++) {
		if (map[i][x]) {
			if (board.mans[map[i][x]].my != my) {
				d.push([x, i]);
			}
			break;
		} else {
			d.push([x, i])
		}
	}
	return d;
}


//马
board.bylaw.m = function (x,y,map,my){
	var d=[];
		//1点
		if ( y-2>= 0 && x+1<= 8 && !play.map[y-1][x] &&(!board.mans[map[y-2][x+1]] || board.mans[map[y-2][x+1]].my!=my)) d.push([x+1,y-2]);
		//2点
		if ( y-1>= 0 && x+2<= 8 && !play.map[y][x+1] &&(!board.mans[map[y-1][x+2]] || board.mans[map[y-1][x+2]].my!=my)) d.push([x+2,y-1]);
		//4点
		if ( y+1<= 9 && x+2<= 8 && !play.map[y][x+1] &&(!board.mans[map[y+1][x+2]] || board.mans[map[y+1][x+2]].my!=my)) d.push([x+2,y+1]);
		//5点
		if ( y+2<= 9 && x+1<= 8 && !play.map[y+1][x] &&(!board.mans[map[y+2][x+1]] || board.mans[map[y+2][x+1]].my!=my)) d.push([x+1,y+2]);
		//7点
		if ( y+2<= 9 && x-1>= 0 && !play.map[y+1][x] &&(!board.mans[map[y+2][x-1]] || board.mans[map[y+2][x-1]].my!=my)) d.push([x-1,y+2]);
		//8点
		if ( y+1<= 9 && x-2>= 0 && !play.map[y][x-1] &&(!board.mans[map[y+1][x-2]] || board.mans[map[y+1][x-2]].my!=my)) d.push([x-2,y+1]);
		//10点
		if ( y-1>= 0 && x-2>= 0 && !play.map[y][x-1] &&(!board.mans[map[y-1][x-2]] || board.mans[map[y-1][x-2]].my!=my)) d.push([x-2,y-1]);
		//11点
		if ( y-2>= 0 && x-1>= 0 && !play.map[y-1][x] &&(!board.mans[map[y-2][x-1]] || board.mans[map[y-2][x-1]].my!=my)) d.push([x-1,y-2]);

	return d;
}

//相
board.bylaw.x = function (x,y,map,my){
	var d=[];
	if (my===1){ //红方
		//4点半
		if ( y+2<= 9 && x+2<= 8 && !play.map[y+1][x+1] && (!board.mans[map[y+2][x+2]] || board.mans[map[y+2][x+2]].my!=my)) d.push([x+2,y+2]);
		//7点半
		if ( y+2<= 9 && x-2>= 0 && !play.map[y+1][x-1] && (!board.mans[map[y+2][x-2]] || board.mans[map[y+2][x-2]].my!=my)) d.push([x-2,y+2]);
		//1点半
		if ( y-2>= 5 && x+2<= 8 && !play.map[y-1][x+1] && (!board.mans[map[y-2][x+2]] || board.mans[map[y-2][x+2]].my!=my)) d.push([x+2,y-2]);
		//10点半
		if ( y-2>= 5 && x-2>= 0 && !play.map[y-1][x-1] && (!board.mans[map[y-2][x-2]] || board.mans[map[y-2][x-2]].my!=my)) d.push([x-2,y-2]);
	}else{
		//4点半
		if ( y+2<= 4 && x+2<= 8 && !play.map[y+1][x+1] && (!board.mans[map[y+2][x+2]] || board.mans[map[y+2][x+2]].my!=my)) d.push([x+2,y+2]);
		//7点半
		if ( y+2<= 4 && x-2>= 0 && !play.map[y+1][x-1] && (!board.mans[map[y+2][x-2]] || board.mans[map[y+2][x-2]].my!=my)) d.push([x-2,y+2]);
		//1点半
		if ( y-2>= 0 && x+2<= 8 && !play.map[y-1][x+1] && (!board.mans[map[y-2][x+2]] || board.mans[map[y-2][x+2]].my!=my)) d.push([x+2,y-2]);
		//10点半
		if ( y-2>= 0 && x-2>= 0 && !play.map[y-1][x-1] && (!board.mans[map[y-2][x-2]] || board.mans[map[y-2][x-2]].my!=my)) d.push([x-2,y-2]);
	}
	return d;
}

//士
board.bylaw.s = function (x,y,map,my){
	var d=[];
	if (my===1){ //红方
		//4点半
		if ( y+1<= 9 && x+1<= 5 && (!board.mans[map[y+1][x+1]] || board.mans[map[y+1][x+1]].my!=my)) d.push([x+1,y+1]);
		//7点半
		if ( y+1<= 9 && x-1>= 3 && (!board.mans[map[y+1][x-1]] || board.mans[map[y+1][x-1]].my!=my)) d.push([x-1,y+1]);
		//1点半
		if ( y-1>= 7 && x+1<= 5 && (!board.mans[map[y-1][x+1]] || board.mans[map[y-1][x+1]].my!=my)) d.push([x+1,y-1]);
		//10点半
		if ( y-1>= 7 && x-1>= 3 && (!board.mans[map[y-1][x-1]] || board.mans[map[y-1][x-1]].my!=my)) d.push([x-1,y-1]);
	}else{
		//4点半
		if ( y+1<= 2 && x+1<= 5 && (!board.mans[map[y+1][x+1]] || board.mans[map[y+1][x+1]].my!=my)) d.push([x+1,y+1]);
		//7点半
		if ( y+1<= 2 && x-1>= 3 && (!board.mans[map[y+1][x-1]] || board.mans[map[y+1][x-1]].my!=my)) d.push([x-1,y+1]);
		//1点半
		if ( y-1>= 0 && x+1<= 5 && (!board.mans[map[y-1][x+1]] || board.mans[map[y-1][x+1]].my!=my)) d.push([x+1,y-1]);
		//10点半
		if ( y-1>= 0 && x-1>= 3 && (!board.mans[map[y-1][x-1]] || board.mans[map[y-1][x-1]].my!=my)) d.push([x-1,y-1]);
	}
	return d;
		
}

//将
board.bylaw.j = function (x,y,map,my){
	var d=[];
	var isNull=(function (y1,y2){
		var y1=board.mans["j0"].y;
		var x1=board.mans["J0"].x;
		var y2=board.mans["J0"].y;
		for (var i=y1-1; i>y2; i--){
			if (map[i][x1]) return false;
		}
		return true;
	})();
	
	if (my===1){ //红方
		//下
		if ( y+1<= 9  && (!board.mans[map[y+1][x]] || board.mans[map[y+1][x]].my!=my)) d.push([x,y+1]);
		//上
		if ( y-1>= 7 && (!board.mans[map[y-1][x]] || board.mans[map[y-1][x]].my!=my)) d.push([x,y-1]);
		//老将对老将的情况
		if ( board.mans["j0"].x == board.mans["J0"].x &&isNull) d.push([board.mans["J0"].x,board.mans["J0"].y]);
		
	}else{
		//下
		if ( y+1<= 2  && (!board.mans[map[y+1][x]] || board.mans[map[y+1][x]].my!=my)) d.push([x,y+1]);
		//上
		if ( y-1>= 0 && (!board.mans[map[y-1][x]] || board.mans[map[y-1][x]].my!=my)) d.push([x,y-1]);
		//老将对老将的情况
		if ( board.mans["j0"].x == board.mans["J0"].x &&isNull) d.push([board.mans["j0"].x,board.mans["j0"].y]);
	}
	//右
	if ( x+1<= 5  && (!board.mans[map[y][x+1]] || board.mans[map[y][x+1]].my!=my)) d.push([x+1,y]);
	//左
	if ( x-1>= 3 && (!board.mans[map[y][x-1]] || board.mans[map[y][x-1]].my!=my))d.push([x-1,y]);
	return d;
}

//炮
board.bylaw.p = function (x,y,map,my){
	var d=[];
	//左侧检索
	var n=0;
	for (var i=x-1; i>= 0; i--){
		if (map[y][i]) {
			if (n==0){
				n++;
				continue;
			}else{
				if (board.mans[map[y][i]].my!=my) d.push([i,y]);
				break	
			}
		}else{
			if(n==0) d.push([i,y])	
		}
	}
	//右侧检索
	var n=0;
	for (var i=x+1; i <= 8; i++){
		if (map[y][i]) {
			if (n==0){
				n++;
				continue;
			}else{
				if (board.mans[map[y][i]].my!=my) d.push([i,y]);
				break	
			}
		}else{
			if(n==0) d.push([i,y])	
		}
	}
	//上检索
	var n=0;
	for (var i = y-1 ; i >= 0; i--){
		if (map[i][x]) {
			if (n==0){
				n++;
				continue;
			}else{
				if (board.mans[map[i][x]].my!=my) d.push([x,i]);
				break	
			}
		}else{
			if(n==0) d.push([x,i])	
		}
	}
	//下检索
	var n=0;
	for (var i = y+1 ; i<= 9; i++){
		if (map[i][x]) {
			if (n==0){
				n++;
				continue;
			}else{
				if (board.mans[map[i][x]].my!=my) d.push([x,i]);
				break	
			}
		}else{
			if(n==0) d.push([x,i])	
		}
	}
	return d;
}

//卒
board.bylaw.z = function (x,y,map,my){
	var d=[];
	if (my===1){ //红方
		//上
		if ( y-1>= 0 && (!board.mans[map[y-1][x]] || board.mans[map[y-1][x]].my!=my)) d.push([x,y-1]);
		//右
		if ( x+1<= 8 && y<=4  && (!board.mans[map[y][x+1]] || board.mans[map[y][x+1]].my!=my)) d.push([x+1,y]);
		//左
		if ( x-1>= 0 && y<=4 && (!board.mans[map[y][x-1]] || board.mans[map[y][x-1]].my!=my))d.push([x-1,y]);
	}else{
		//下
		if ( y+1<= 9  && (!board.mans[map[y+1][x]] || board.mans[map[y+1][x]].my!=my)) d.push([x,y+1]);
		//右
		if ( x+1<= 8 && y>=6  && (!board.mans[map[y][x+1]] || board.mans[map[y][x+1]].my!=my)) d.push([x+1,y]);
		//左
		if ( x-1>= 0 && y>=6 && (!board.mans[map[y][x-1]] || board.mans[map[y][x-1]].my!=my))d.push([x-1,y]);
	}
	
	return d;
}*/