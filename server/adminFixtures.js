//插入一个相对应集合的自增标识
function insertCollectionName(collectionName){
	Counters.insert({"_id":collectionName,"sequence_value":0})	
}
function getNextSequenceValue(sequenceName){
   // var sequenceDocument = Counters.findAndModify(
   //    {
   //       query:{_id: sequenceName },
   //       update: {$inc:{sequence_value:1}},
   //       new:true
   //    });
  	 // return sequenceDocument.sequence_value;
  	 // Match.find().fetch()
  	 if(Counters.find({"_id":sequenceName}).fetch().length===0){
		insertCollectionName(sequenceName);
	}
    Counters.update({"_id":sequenceName}, {$inc:{sequence_value:1}});
    var num = Counters.findOne({"_id":sequenceName}).sequence_value;
    return num;
}

if(Meteor.isServer){
	
	if(Counters.find().count()===0){
		insertCollectionName("match");
		insertCollectionName("users");	
	} 
	if(!Counters.findOne({"_id":"article"})){
		insertCollectionName("article");
	}

	if(Meteor.users.find().count()===0){
		const adminLogo = 'http://7xj9u3.com1.z0.glb.clouddn.com/redapple/logo_admin0.jpg?imageView2/2/w/50/h/50';
		let accounts = [
			{
				username:'grape',
				email:'grape@163.com',
				password:'111111',
				"id":getNextSequenceValue("users"),
				profile: {
                    wxinfo: { cjId:'112321123',cellphone:'13654530986',nickname: '李志勇',
                    sex: 1, country: '中国', province: '北京',
                    city: '北京', headImageUrl: adminLogo,
                    roleList:['match'], }
				},
			},
			{
				"id":getNextSequenceValue("users"),
				username:'danta',
				email:'danta@163.com',
				password:'111111',
				profile: {
                    wxinfo: { nickname: '蛋挞君',
                    cjId:'112321123', roleList:['user'],
                    cellphone:'13654530986',sex: 2, country: '中国', province: '北京', city: '北京', headImageUrl: adminLogo }
				},
			},
			{
				"id":getNextSequenceValue("users"),
				username:'danjuan',
				email:'danjuan@163.com',
				createTime:'1464074452',
				password:'111111',
				profile: {
                    wxinfo: { nickname: '蛋卷君',cjId:'123123123123123123', roleList:['site'],cellphone:'13654530986',sex: 1, country: '中国', province: '北京', city: '北京', headImageUrl: adminLogo }
				},
			},

		]
		accounts.forEach(function(info){
	        // if (!Accounts.findUserByEmail(info.email)) {
	        //     Accounts.createUser(info);
	        // }
	        Accounts.createUser(info);
	    });
	}

	if(Match.find().count()===0){
		var date = (new Date()).getTime();
		Match.insert({
			"id":getNextSequenceValue("match"),
			title:"北京象棋赛",
			subtitle:"中国区比赛",
			entryStartTime:date,
			entryEndTime:date,
			gameType:'国际象棋',
			content:{profile:"这是比赛的简介",rule:"这是游戏规则"},
			minNumber:"100",
			createId:"McmGjFjq2eGHvdLup",
			ruleTemplate:"初赛 + 决赛",
			matchStartTime:date+1000000,
			createTimeStamp:date+Math.ceil(Math.random()*100000000),
			author:"p9Nc9M3Ljmkf6KLiq",
		});
		Match.insert({
			"id":getNextSequenceValue("match"),
			title:"国际象棋公开赛",
			subtitle:"中国区比赛",
			entryStartTime:date,
			entryEndTime:date,
			gameType:'象棋',
			content:{profile:"这是比赛的简介",rule:"这是游戏规则",minNumber:"100"},
			createId:"McmGjFjq2eGHvdLup",
			minNumber:100,
			ruleTemplate:"初赛 + 决赛",
			matchStartTime:date+2000000,
			createTimeStamp:date+Math.ceil(Math.random()*100000000),
			author:"p9Nc9M3Ljmkf6KLiq",
		});
		Match.insert({
			"id":getNextSequenceValue("match"),
			title:"大师象棋赛",
			subtitle:"中国区比赛",
			entryStartTime:date,
			entryEndTime:date,
			minNumber:200,
			gameType:'象棋',
			content:{profile:"这是比赛的简介",rule:"这是游戏规则",minNumber:"100"},
			createId:"skbfuzGvWGmvWPgaw",
			ruleTemplate:"初赛",
			matchStartTime:date+3000000,
			createTimeStamp:date+Math.ceil(Math.random()*100000000),
			author:"p9Nc9M3Ljmkf6KLiq",
		});
		for(var i=0;i<50;i++){
			Match.insert({
				"id":getNextSequenceValue("match"),
				title:"大师象棋赛",
				subtitle:"中国区比赛",
				minNumber:Math.ceil(Math.random()*100000),
				entryStartTime:(date+Math.ceil(Math.random()*100000)),
				entryEndTime: (date+Math.ceil(Math.random()*100000)-10000),
				gameType:'五子棋',
				content:{profile:"这是比赛的简介",rule:"这是游戏规则"},
				createId:"skbfuzGvWGmvWPgaw",
				ruleTemplate:"初赛",
				matchStartTime:date+5000000,
				createTimeStamp:date+Math.ceil(Math.random()*100000000),
				author:"p9Nc9M3Ljmkf6KLiq",
			});
		}

	}
	if(GameType.find().count()===0){
		GameType.insert({id:1,name:"象棋",});
		GameType.insert({id:2,name:"国际象棋",});
		GameType.insert({id:3,name:"围棋",});
		GameType.insert({id:4,name:"五子棋",});
	}
	if(Role.find().count()==0){
		//插入角色配置
		for( var key in systemRoleList){
			let it = systemRoleList[key];
			Role.insert({name:key,authList:it});
		}
		// Role.insert({name:'match',authList:["matchSearch","matchCreate","matchEdit","matchDelete"],text:'赛事管理'});
		// Role.insert({name:'user',authList:["userSearch","userCreate",'userEdit'],text:'用户管理'});
		// Role.insert({name:'site',authList:["articleEdit"],text:'首页管理'});
		// Role.insert({name:'admin',authList:[],text:'管理员管理'});
	}
	if(Auth.find().count()==0){
		//插入权限配置
		for(var i = 0;i< authList.length;i++){
			Auth.insert(authList[i]);
		}
		// Auth.insert({name:"matchSearch",Accesstext:"MATCH_QUERY",id:1});
		// Auth.insert({name:"matchCreate",Accesstext:"MATCH_CREATE",id:2});
		// Auth.insert({name:"matchEdit",Accesstext:"MATCH_EDIT",id:3});
		// Auth.insert({name:"userSearch",Accesstext:"USER_QUERY",id:4});
		// Auth.insert({name:"userCreate",Accesstext:"USER_CREATE",id:5});
		// Auth.insert({name:"userEdit",Accesstext:"USER_EDIT",id:6});
		// Auth.insert({name:"articleEdit",Accesstext:"ARTICLE_EDIT",id:7});
		// Auth.insert({name:"matchDelete",Accesstext:"ARTICLE_EDIT",id:8});

	}

	if(MatchTemplate.find().count()==0){
		var matchTemplate = [
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
		];
		for(var i=0;i<matchTemplate.length;i++){
			MatchTemplate.insert(matchTemplate[i]);
		}
	}
	if(MatchTemplateItem.find().count()==0){
		var item=[
				{
					id:1,
					tabName:"初赛",
					tabId:"preliminary",
					rule:[{
							name:"小组赛",
							select:[{name:"6进1",total:6,promotion:1,matchNum:1},{name:"5进1",total:5,promotion:1,matchNum:1},{name:"4进1",total:4,promotion:1,matchNum:1},
								{name:"6进2",total:6,promotion:2,matchNum:1},{name:"5进2",total:5,promotion:2,matchNum:1},],
							desc:"参加比赛的人(队)数较多,时间较紧,可酌情采用单淘汰制.双淘汰制或其他淘汰方式,并适当安排预选赛.附加赛."
						},
						{
							name:"淘汰赛",
							select:[{name:"2进1",total:2,promotion:1,matchNum:1},],
							desc:"参加比赛的人(队)数较多",
						},]
				},
				{
					id:2,
					tabName:"复赛",
					tabId:"semi-finals",
					rule:[{
							name:"淘汰赛",
							select:[{name:"2进1",total:2,promotion:1,matchNum:1},],
							desc:"参加比赛的人(队)数较多",
						}]
				},
				{
					id:3,tabName:"决赛",tabId:"finals",
					rule:[{
							name:"决赛",
							select:[{name:"冠军赛",total:2,promotion:1,matchNum:1},],
							desc:"胜利方为比赛的总冠军",
						}]
				}
			];
		for(var i=0;i<item.length;i++){
			MatchTemplateItem.insert(item[i]);
		}
	}
}
