function classHist(model , settings){

	classes = model.classNames;
	this.data = model.data;
	this.histData = [];
	this.max = 0;
	var left, right , x , y , xAxis , yAxis , yAxis2;
	pane = settings.histPane;
	w=(pane.node().getBoundingClientRect().width);
	h=(pane.node().getBoundingClientRect().height);
	var margin = {
	    top: 30,
	    right: 20,
	    bottom: 10,
	    left: 20
	},
	width = Math.max(198,w) - margin.left - margin.right,
  	height = Math.max(200,h) - margin.top - margin.bottom;

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
  	var tipTN = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Class:</span> <span>" + d.name + "</span><br><span>TN:</span> <span>" + d.tn + "</span>";
            })



	this.prepareData = function(){


		for(i=0,len=classes.length; i<len ; i++){

	        (this.histData).push({
	          name : classes[i],
	          tn : 0,
	          tp : 0,
	          fn : 0,
	          fp : 0,
	      });
	    }


      	for(j = 0,lenj=data.length; j<lenj ; j++){
        	for(k = 0,lenk=(this.histData).length; k<lenk ; k++){
        		Cname = "L-"+(this.histData)[k].name;        		

	           // 	if(settings.filtersOnSummary && data[j][name].toLowerCase() == "tn" && data[j][prob] < settings.probtnFilter){
	           //  	break;
	          	// }

	          	// if(settings.filtersOnSummary && data[j][name].toLowerCase() == "tp" && data[j][prob] > settings.probtpFilter){
	           //  	break;
	          	// }
	          
	          	// if(settings.switchesOnSummary && !(settings.probDataOptions[data[j][name].toLowerCase()])){
	          	// 	break;
	          	// }

	          	// if(settings.filtersOnSummary && (data[j][prob] > settings.probLimits[1] || data[j][prob] < settings.probLimits[0]))
	          	// {            
	           //  	break;
	          	// }

	          	(this.histData)[k][data[j][Cname].toLowerCase()]++;
        	}
      	}


      		// left = Math.max(left, d3.max((this.histDafunction(d){return (d.tn+d.fn);} ));
      		// right = Math.max(right, d3.max((this.histData) , function(d){return (d.tp+d.fp);} ));
    	

    	left = d3.max((this.histData) , function(d){return (d.tn+d.fn);} );
      	right = d3.max((this.histData) , function(d){return (d.tp+d.fp);} );
    	this.max = Math.max(left , right);
	}

	this.makeHist = function(){

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
		                // .tickValues(y.domain().filter(function(d,i){ 
		                //   if(i == 0 || i == (settings.bins-1) || i == Math.floor((settings.bins)/2)) return true;
		                //   return false;
		                // }))
		                .tickSize(0)
		                .tickPadding(3);

		    yAxis2 = d3.svg.axis()
		                .scale(y)
		                .orient("left")
		                .tickFormat("")
		                .tickSize(0.3);

		    var svg = pane
		    			// .selectAll("svg")
		       //        .data(this.histData)
		       //        .enter()
		              .append("svg")
		              .attr("class" , "svg-classHist")
		              .attr("width" , width + margin.left + margin.right)
		              .attr("height" , height + margin.top + margin.bottom)
		              .append("g")
		                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		    svg.call(tipTP);
		    svg.call(tipFP);
		    svg.call(tipFN);
		    svg.call(tipTN);

		    // svg.append("text")
		    //           .attr("class" , "class-label")
		    //           .attr("x" , "0")
		    //           .attr("y" , -12)
		    //           .attr("dy" , ".5em")
		    //           .text(function(d , i){return (d[0].name)});


		    var bars = svg.selectAll(".left-bar")
		    			.data(this.histData , function(d){ return d.name;})
		    			.enter().append("g")
		    			.attr("class" , function(d){ return ("left-bar "+d.name);})

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

		    var tn = bars.append("rect")
		              .attr("class" , "left-bar-tn")
		              .attr("x" , function(d){return x(-d.fn-d.tn);})
		              .attr("y" , function(d){return y(d.name);})
		              .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
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
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);

        // settings.rightResult = "tp";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });

      d3.selectAll(".left-bar-tn")
        .on('mouseover', tipTN.show)
        .on('mouseout', tipTN.hide)
        .on("click" , function(){
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);
        // console.log(settings.rightProbBounds);

        // settings.rightResult = "tn";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });

      d3.selectAll(".left-bar-fp")
        .on('mouseover', tipFP.show)
        .on('mouseout', tipFP.hide)
        .on("click" , function(){
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);

        // settings.rightResult = "fp";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });

      d3.selectAll(".left-bar-fn")
        .on('mouseover', tipFN.show)
        .on('mouseout', tipFN.hide)
        .on("click" , function(){
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);
        // console.log(settings.rightProbBounds);

        // settings.rightResult = "fn";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });

	}


	this.prepareData();
	this.makeHist();
	this.bindEvents();

}