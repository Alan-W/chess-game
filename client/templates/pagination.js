
Template.pagination.helpers({
	pages:function(){
		var arr = [];
		var showPage =  Math.ceil(this.currIdx/this.pages);
		console.log("pagination setting",this.pages,this.limit,this.data.length,this.currIdx,showPage);
		let lastShowPage  =  (showPage * this.pages - this.currIdx) * this.limit ;
		
		for(let i =1; i<=this.pages;i++){
			var pageNum = i + (showPage-1)*this.pages; 
			arr.push({
				num:pageNum,
				idx:("pagination-li-"+pageNum),
				active:this.currIdx == pageNum ? "active":"",
				path:this.path,
			});
		}
		console.log("this",this);
		// Session.set("pagination",{li})
		return arr;
	},
	previousDisable:function(){
		var showPage =  Math.ceil(this.currIdx/this.pages);
		if( showPage<=1){
			return "disabled" ;
		}else{
			return "";
		}
	},
	nextDisable:function(){
		// if(!this.currPage)

	}
	
});
Template.pagination.events({
	"click li"(event){
		// var paginationData = Template.parentData(0); 
		var showPage =  Math.ceil(this.currIdx/this.pages);
		console.log("showPage",showPage);
		if(event.currentTarget && event.currentTarget.id){
			var el = event.currentTarget;
			if(el.id == "pagination-previous"){
				if($(el).hasClass("disabled")){
					// console.log("翻到顶了");
				}else{
					// let showPage =  Math.ceil(this.currIdx/this.pages);
					let res = showPage > 1? (showPage-2)*this.pages + 1 :showPage;
					console.log("上页",res);	
					Router.go(this.path,{currIdx:res});
				}
			}else if(el.id == "pagination-next"){
				if($(el).hasClass("disabled")){
						// console.log("翻到底了");
				}else{
					// let showPage =  Math.ceil(this.currIdx/this.pages);
					let res = showPage*this.pages + 1 ;
					Router.go(this.path,{currIdx:res});
					console.log("下页",res);	
				}
			}
		}

	}
})