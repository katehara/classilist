function imageBrowser(model , settings){
	pane = settings.imgPane
	this.data = model.data;
	this.index = model.images;
	this.imgData;
	this.groupedData;

	pane = settings.imgPane;
	imgpager = settings.imgPagerPane;
	imgpage = imgpager.select(".img-page");
	imgprev = imgpager.select(".img-prev");
	imgnext = imgpager.select(".img-next");
	imgfirst = imgpager.select(".img-first");
	imglast = imgpager.select(".img-last");

	this.setPager = function(){
		imgcurr = settings.imgCurrentPage;
		len = (this.groupedData).length;
		curlen = (this.groupedData)[curr-1].length;
		
		imgpage.text(" "+ imgcurr +" ("+curlen+")");
		imgfirst.text(1 + "..");
		imglast.text(".." + len );
		if(imgcurr == 1) imgprev.classed("disabled" , true)
		else imgprev.classed("disabled" , false);

		if(imgcurr == len) imgnext.classed("disabled" , true);
		else imgnext.classed("disabled" , false);
	}

	this.prepareData = function(nowdata){
		this.imgData = [];
		for(i=0,len=nowdata.length; i<len ; i++){
	        (this.imgData).push({
	          url : nowdata[i]["image_url"],
	          actual : nowdata[i][model.target],
	          predicted : nowdata[i][model.predicted],
	          id : nowdata[i]["id"]
	      });
	    }
	}

	this.makeBrowser = function(nowdata){
		this.prepareData(nowdata)
		pane = settings.imgPane;
		
		this.groupedData = sliceImg(this.imgData, settings.imgSize) ;
		settings.imgCurrentPage = 1;

		pane.selectAll("*").remove();
		var images = pane.selectAll(".browser-img")
	    			.data(this.groupedData[settings.imgCurrentPage-1])
	    			.enter().append("img")
						.attr("class" , "browser-img")
						.attr("src" , function(d){ return d.url});
		
		this.setPager();
	}

	this.makeBrowser(this.data);

	this.slideData = function(t){
		pane = settings.imgPane;

		len = (this.groupedData).length;

		if(t==-1){ 
			if(settings.imgCurrentPage == 1) return;
			else imgcurr = settings.imgCurrentPage = 1;
		}
		if(t==2){ 
			if(settings.imgCurrentPage == len) return;
			else imgcurr = settings.imgCurrentPage = len;
		}

		if(t==0) imgcurr = --settings.imgCurrentPage; //previous page
		else if(t==1) imgcurr = ++settings.imgCurrentPage; //next page

		pane.selectAll("*").remove();
		var images = pane.selectAll(".browser-img")
	    			.data(this.groupedData[imgcurr-1])
	    			.enter().append("img")
						.attr("class" , "browser-img")
						.attr("src" , function(d){return d.url});

		this.setPager();
	
	}	
}

function sliceImg(data , size){
	groups = [];
	for(i = 0, m = data.length; i<m ; i+=size ){
		groups.push(data.slice(i , i+size));
	}
	return groups;
}
