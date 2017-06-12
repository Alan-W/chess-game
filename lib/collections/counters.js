Counters = new Mongo.Collection('counters');


Meteor.methods({
	getNextSequenceValue:function(sequenceName){
		if(Counters.find({"_id":sequenceName}).fetch().length===0){
			Meteor.call('insertCollectionName', sequenceName);
		}
		Counters.update({"_id":sequenceName}, {$inc:{sequence_value:1}});
	    var num = Counters.findOne({"_id":sequenceName}).sequence_value;
	    return num;
	},
	insertCollectionName:function(collectionName){
		Counters.insert({"_id":collectionName,"sequence_value":0})	
	}
});