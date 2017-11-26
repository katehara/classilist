function classHist(model , settings , parent){

	classes = model.classNames;
	this.data = model.data;
	this.histData = this.newData = [];
	this.max = 0;
	var left, right , x , y , xAxis , yAxis , yAxis2;
	pane = settings.histPane;
	pane.selectAll("*").remove();
	w=(pane.node().getBoundingClientRect().width);
	h=(pane.node().getBoundingClientRect().height);
	var margin = {
	    top: 5,
	    right: 10,
	    bottom: 10,
	    left: 30
	},
	width = Math.min(180,w) - margin.left - margin.right,
  	height = Math.max(180,h) - margin.top - margin.bottom;

  	var tipTP = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Class:</span> <span>" + d.name + "</span><br><span>TP:</span> <span>" + d.tp + "</span>";
            })
  	var tipFP = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Class:</span> <span>" + d.name + "</span><br><span>FP:</span> <span>" + d.fp + "</span>";
            })
  	var tipFN = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Class:</span> <span>" + d.name + "</span><br><span>FN:</span> <span>" + d.fn + "</span>";
            })
  	
	this.prepareData = function(nowdata){
		this.newData = [];
		for(i=0,len=classes.length; i<len ; i++){

	        (this.newData).push({
	          name : classes[i],
	          tp : 0,
	          fn : 0,
	          fp : 0,
	      });
	    }

      	for(j = 0,lenj=nowdata.length; j<lenj ; j++){
        	for(k = 0,lenk=(this.newData).length; k<lenk ; k++){
        		Cname = "L-"+(this.newData)[k].name;        		

	          	(this.newData)[k][nowdata[j][Cname].toLowerCase()]++;
        	}
      	}

    	left = d3.max((this.newData) , function(d){return (d.fn);} );
      	right = d3.max((this.newData) , function(d){return (d.tp+d.fp);} );
    	this.max = Math.max(left , right);
	}

	this.makeHist = function(){

		for(i=0,len=(this.newData).length; i<len ; i++){
			this.histData[i] = this.newData[i];
		}
		pane = settings.histPane;
		pane.selectAll("*").remove();
	    x = d3.scale.linear()
	            .domain([-(this.max) , this.max]).nice()
	            .rangeRound([0, width]);

	    y = d3.scale.ordinal()
	            .domain((this.histData).map(function(d){ return d.name;}))
	            .rangeRoundBands([0 , height] , 0.1);

	    xAxis = d3.svg.axis()
	                .scale(x)
	                .orient("bottom")
	                .ticks(5)
	                .tickSize(0.3)
	                .tickFormat(function(d){ 
	                  f = Math.abs(d);
	                  if(f>=1000) return(Math.round(f/1000) + "K");
	                  else return f;
	                });
	    
	    yAxis = d3.svg.axis()
	                .scale(y)
	                .orient("left")
	                .tickSize(0)
	                .tickPadding(3);

	    yAxis2 = d3.svg.axis()
	                .scale(y)
	                .orient("left")
	                .tickFormat("")
	                .tickSize(0.3);

	    var svg = pane
	    			.append("svg")
	              .attr("class" , "svg-classHist")
	              .attr("width" , width + margin.left + margin.right)
	              .attr("height" , height + margin.top + margin.bottom)
	              .append("g")
	                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    svg.call(tipTP);
	    svg.call(tipFP);
	    svg.call(tipFN);
	    
	    var bars = svg.selectAll(".left-bar")
	    			.data(this.histData , function(d){ return d.name;})
	    			.enter().append("g")
	    			.attr("class" , "left-bar")

	    var tp = bars.append("rect")
	              .attr("class" , "left-bar-tp")
	              .attr("x" , function(d){return x(0);})
	              .attr("y" , function(d){return y(d.name);})
	              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
	              .attr("height" , function(d){return y.rangeBand()});

	    var fp = bars.append("rect")
	              .attr("class" , "left-bar-fp")
	              .attr("x" , function(d){return x(d.tp);})
	              .attr("y" , function(d){return y(d.name);})
	              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
	              .attr("height" , function(d){return y.rangeBand()});

	    var fn = bars.append("rect")
	              .attr("class" , "left-bar-fn")
	              .attr("x" , function(d){return x(-d.fn);})
	              .attr("y" , function(d){return y(d.name);})
	              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
	              .attr("height" , function(d){return y.rangeBand()});

	    svg.append("g")
	      .attr("class" , "x axis")
	      .attr("transform" , "translate(0," + height + ")")
	      .call(xAxis);

	    svg.append("g")
	      .attr("class" , "y axis")
	      .attr("transform" , "translate(0,0)")
	      .call(yAxis);

	    svg.append("g")
	      .attr("class" , "y axis2")
	      .attr("transform" , "translate(" + x(0) +",0)")
	      .call(yAxis2);
	}

	this.bindEvents = function(){
		d3.selectAll(".left-bar-tp")      
        .on('mouseover', tipTP.show)
        .on('mouseout', tipTP.hide)
        .on("click" , function(){
        	if(!(d3.select(this).classed("filled-gray"))){
	        	fullClass = d3.select(this).data()[0].name;
	        	settings.oca = fullClass;
	        	settings.ocp = "all";
	        	settings.opl = 0.00;
	        	settings.oph = 1.00;
	        	settings.ors = "tp";
	        	parent.overlaps.overlapActivate(1);
        	}
      	});

    //   d3.selectAll(".left-bar-tn")
    //     .on('mouseover', tipTN.show)
    //     .on('mouseout', tipTN.hide)
    //     .on("click" , function(){
    //     	if(!(d3.select(this).classed("filled-gray"))){
				// fullClass = d3.select(this).data()[0].name;
	   //      	settings.oca = fullClass;
	   //      	settings.ocp = "all";
	   //      	settings.opl = 0.00;
	   //      	settings.oph = 1.00;
	   //      	settings.ors = "tn";
	   //      	parent.overlaps.overlapActivate(1); 
    //     	}
    //   	});

      d3.selectAll(".left-bar-fp")
        .on('mouseover', tipFP.show)
        .on('mouseout', tipFP.hide)
        .on("click" , function(){
        	if(!(d3.select(this).classed("filled-gray"))){
				fullClass = d3.select(this).data()[0].name;
	        	settings.oca = fullClass;
	        	settings.ocp = "all";
	        	settings.opl = 0.00;
	        	settings.oph = 1.00;
	        	settings.ors = "fp";
	        	parent.overlaps.overlapActivate(1);    
	        }    
      });

      d3.selectAll(".left-bar-fn")
        .on('mouseover', tipFN.show)
        .on('mouseout', tipFN.hide)
        .on("click" , function(){
        	if(!(d3.select(this).classed("filled-gray"))){
				fullClass = d3.select(this).data()[0].name;
	        	settings.oca = fullClass;
	        	settings.ocp = "all";
	        	settings.opl = 0.00;
	        	settings.oph = 1.00;
	        	settings.ors = "fn";
	        	parent.overlaps.overlapActivate(1);    
	        }    
      });

	}


	this.prepareData(this.data);
	this.makeHist();
	this.bindEvents();

	this.overlap = function(nowdata){
		pane = settings.histPane;
		this.prepareData(nowdata);

		var svg = pane.select("svg").select("g");

		var overlapBars = svg.selectAll(".overlap-left-bar")
	    			.data(this.newData , function(d){ return d.name;})
	    			.enter().append("g")
	    			.attr("class" , "overlap-left-bar overlap")

	    var tp = overlapBars.append("rect")
	              .attr("class" , "overlap-left-bar-tp")
	              .attr("x" , function(d){return x(0);})
	              .attr("y" , function(d){return y(d.name);})
	              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
	              .attr("height" , function(d){return y.rangeBand()})
	              .on('mouseover', tipTP.show)
        		  .on('mouseout', tipTP.hide);

	    var fp = overlapBars.append("rect")
	              .attr("class" , "overlap-left-bar-fp")
	              .attr("x" , function(d){return x(d.tp);})
	              .attr("y" , function(d){return y(d.name);})
	              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
	              .attr("height" , function(d){return y.rangeBand()})
	              .on('mouseover', tipFP.show)
        		  .on('mouseout', tipFP.hide);

	    var fn = overlapBars.append("rect")
	              .attr("class" , "overlap-left-bar-fn")
	              .attr("x" , function(d){return x(-d.fn);})
	              .attr("y" , function(d){return y(d.name);})
	              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
	              .attr("height" , function(d){return y.rangeBand()})
	              .on('mouseover', tipFN.show)
        		  .on('mouseout', tipFN.hide);

	    // var tn = overlapBars.append("rect")
	    //           .attr("class" , "overlap-left-bar-tn")
	    //           .attr("x" , function(d){return x(-d.fn-d.tn);})
	    //           .attr("y" , function(d){return y(d.name);})
	    //           .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
	    //           .attr("height" , function(d){return y.rangeBand()})
	    //           .on('mouseover', tipTN.show)
     //    		  .on('mouseout', tipTN.hide);
	}

}