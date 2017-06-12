MatchTemplate = new Mongo.Collection('matchTemplate');


// MatchTemplate.deny({
// 	insert: function (userId, doc) {
// 		return true;
// 	},
// 	update: function (userId, doc, fields, modifier) {
// 		return true;
// 	},
// 	remove: function (userId, doc) {
// 		return true;
// 	},
// 	fetch: ['locked'],
// 	transform: function () {
// 		return true;
// 	}
// });

SysMatchTemplate = [
	{
		name:"初赛 + 复赛",
		id:1,
		text:[1,2],
	},
	{
		name:"初赛 + 复赛 + 决赛",
		id:2,
		text:[1,2,3],
	},
	{
		name:"复赛 + 决赛",
		id:3,
		text:[2,3],
	},
	{
		name:"决赛",
		id:4,
		text:[3],
	}
]
SysMatchRule=[
	{
		id:1,
		tabName:"初赛",
		tabId:"preliminary",
		rule:[
			{
				name:"小组赛",
				select:[
					{name:"6进1",total:6,promotion:1,matchNum:1},
					{name:"5进1",total:5,promotion:1,matchNum:1},
					{name:"4进1",total:4,promotion:1,matchNum:1},
					{name:"6进2",total:6,promotion:2,matchNum:1},
					{name:"5进2",total:5,promotion:2,matchNum:1},
					],
				desc:"参加比赛的人(队)数较多,时间较紧,可酌情采用单淘汰制.双淘汰制或其他淘汰方式,并适当安排预选赛.附加赛."
			},
			{
				name:"淘汰赛",
				select:[
					{name:"2进1",total:2,promotion:1,matchNum:1},
				],
				desc:"参加比赛的人(队)数较多",
			},
		]
	},
	{
		id:2,
		tabName:"复赛",
		tabId:"semi-finals",
		rule:[
			{
				name:"淘汰赛",
				select:[
					{name:"2进1",total:2,promotion:1,matchNum:1},
				],
				desc:"参加比赛的人(队)数较多",
			}
		]
	},
	{
		id:3,
		tabName:"决赛",
		tabId:"finals",
		rule:[
			{
				name:"决赛",
				select:[
					{name:"冠军赛",total:2,promotion:1,matchNum:1},
				],
				desc:"胜利方为比赛的总冠军",
			}
		]
	}

]
//[1,2,3]
//[1,2]
//[3]
//[1,3]
//[2,3]