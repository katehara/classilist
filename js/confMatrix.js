function confMatrix(model , settings , parent){

	// suffix d means without diagonal notation.

	this.matrix = model.confusionMatrix;
	mind = min = Infinity;
	maxd = max =-Infinity;
	this.matData = this.newData = [];
	classes = model.classNames;
	pane = settings.confPane;
	// w = (pane).node().getBoundingClientRect().width;
	w = pane.node().getBoundingClientRect().width;
	var margin = {
	    top: 20,
	    right: 10,
	    bottom: 30,
	    left: 30
	},
	height = width = Math.max((classes).length*10 , (w - margin.left - margin.right));
	var x , y , xAxis , yAxis , color , colord , cells;

	var tipMat = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Actual:</span> <span>" + d.actual + "</span><br><span>Predicted:</span> <span>" + d.predicted + "</span><br><span>Count:</span> <span>" + d.value + "</span>";
            })

    this.prepareData = function(mat){
    	this.newData = [];
    	for(i=0 , len = (classes).length;i<len;i++){
			for(j=0;j<len;j++){
				c = (mat)[i][j];
				(this.newData).push({
					actual : classes[i],
					predicted : classes[j],
					value : c,
					fill : "#000",
					filld : "#fff"
				});
				if(classes[i] != classes[j] && c < min) min = c;
				if(classes[i] != classes[j] && c > max) max = c;
				if(classes[i] == classes[j] && c < mind) mind = c;
				if(classes[i] == classes[j] && c > maxd) maxd = c;
			}
		}
    }

	this.makeMatrix = function(){
		for(i=0,len=(this.newData).length; i<len ; i++){
			this.matData[i] = this.newData[i];
		}
		pane = settings.confPane;
		pane.selectAll("*").remove();

		x = d3.scale.ordinal()
            .domain((this.matData).map(function(d){return d.predicted}))
            .rangeRoundBands([0, width] , 0.05);        

	    y = d3.scale.ordinal()
	            .domain((this.matData).map(function(d){return d.actual}))
            	.rangeRoundBands([0 , height] , 0.05);

	    color = d3.scale.linear()
	    		.domain([min , max])
	    		.interpolate(d3.interpolateLab)
	    		// .range(["#d1c4e9" , "#312450"]);
	    		.range(["#fff" , "#312450"]);

	    colord = d3.scale.linear()
	    		.domain([mind , maxd])
	    		.interpolate(d3.interpolateLab)
	    		// .range(["#d1c4e9" , "#312450"]);
	    		.range(["#dbecd7" , "#59a954"]);

	    for(i=0, len= (this.matData).length ; i<len ; i++){
	    	if((this.matData)[i].actual == (this.matData)[i].predicted){
	    		(this.matData)[i].fill = colord((this.matData)[i].value);
	    		(this.matData)[i].max = maxd;
	    		(this.matData)[i].min = mind;
	    	}
	    	else{
	    		(this.matData)[i].fill = color((this.matData)[i].value);
	    		(this.matData)[i].max = max;
	    		(this.matData)[i].min = min;
	    	}
	    }


	    xAxis = d3.svg.axis()
	                .scale(x)
	                .orient("top")
	                .tickSize(0.3)
	    
	    yAxis = d3.svg.axis()
	                .scale(y)
	                .orient("left")	                
	                .tickSize(0.3)

	    var svg = pane.append("svg")
              		.attr("class" , "svg-confMat")
              		.attr("width" , width + margin.left + margin.right)
              		.attr("height" , height + margin.top + margin.bottom)
              		.append("g")
                		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.append("g")
	      	.attr("class" , "feature x axis")
	      	.attr("transform" , "translate(0,0)")
	      	.call(xAxis)
 	

	    svg.append("g")
	      	.attr("class" , "feature y axis")
	      	.attr("transform" , "translate(0,0)")
	      	.call(yAxis)

	    svg.call(tipMat);

	    cells = svg.selectAll(".cell")
	    			.data(this.matData)
	    			.enter().append("rect")
	    			.attr("class" , "cell")

	    if(settings.matrixDiagonals == true && settings.matrixMode == 1){
	    	cells.attr("x" , function(d){ return x(d.predicted) + (x.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("y" , function(d){ return y(d.actual) + (y.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("width" , function(d){return x.rangeBand()*d.value/d.max;})
    			.attr("height" , function(d){return y.rangeBand()*d.value/d.max;})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#59a954'
    				else return '#312450';
    				}
    			);
	    	}

	    if(settings.matrixDiagonals == true && settings.matrixMode == 0){
	    	cells.attr("x" , function(d){ return x(d.predicted);})
    			.attr("y" , function(d){ return y(d.actual);})
    			.attr("width" , function(d){return x.rangeBand();})
    			.attr("height" , function(d){return y.rangeBand();})
    			.attr("fill" , function(d){ return d.fill;});
	    	}

	    if(settings.matrixDiagonals == false && settings.matrixMode == 1){
	    	cells.attr("x" , function(d){ return x(d.predicted) + (x.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("y" , function(d){ return y(d.actual) + (y.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("width" , function(d){
    				if(d.predicted == d.actual) return 0;
    				else return x.rangeBand()*d.value/d.max;})
    			.attr("height" , function(d){
    				if(d.predicted == d.actual) return 0;
    				else return y.rangeBand()*d.value/d.max;})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#59a954'
    				else return '#312450';
    				}
    			);
	    	}

	    if(settings.matrixDiagonals == false && settings.matrixMode == 0){
	    	cells.attr("x" , function(d){ return x(d.predicted);})
    			.attr("y" , function(d){ return y(d.actual);})
    			.attr("width" , function(d){return x.rangeBand();})
    			.attr("height" , function(d){return y.rangeBand();})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#fff'
    				else return d.fill;
    				}
    			);
	    	}

	    // var texts = svg.selectAll(".text")
	    // 			.data(this.newData)
	    // 			.enter().append("text")
	    // 			.attr("class" , ".text")
	    // 			.text(function(d){return d.value;})
					// .attr("x" , function(d){return x(d.predicted);})
	    // 			.attr("y" , function(d){ return y(d.actual);})
	    // 			.attr("transform" , "translate(0,"+y.rangeBand()/2+")")
	    // 			.attr("fill","#fff")
				 //    .style("stroke-width", 1)
				 //    .style("font-size" , "0.7em")
				 //    .style("z-index" , "999999")
				 //    .style("text-shadow" ,  "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black")
				 //    .style("text-anchor", "middle")
					// .attr("dy", ".35em")
	    // 			.attr("dx" , "1.6em");

	}

	this.bindEvents = function(){
		pane.selectAll("rect")
		.on('mouseover', tipMat.show)
        .on('mouseout', tipMat.hide)
        .on("click" , function(){
        	if(!(d3.select(this).classed("filled-gray"))){
	        	obj = d3.select(this).data()[0];
	        	settings.oca = obj.actual;
	        	settings.ocp = obj.predicted;
	        	settings.res = "all";
	        	settings.opl = 0.00;
	        	settings.oph = 1.00;
	        	parent.overlaps.overlapActivate(3);
	        }
        });
	}


	this.prepareData(this.matrix);
	this.makeMatrix();
	this.bindEvents();

	this.applySettings = function(){

		if(settings.matrixDiagonals == true && settings.matrixMode == 1){
	    	cells.attr("x" , function(d){ return x(d.predicted) + (x.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("y" , function(d){ return y(d.actual) + (y.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("width" , function(d){return x.rangeBand()*d.value/d.max;})
    			.attr("height" , function(d){return y.rangeBand()*d.value/d.max;})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#59a954'
    				else return '#312450';
    				}
    			);
	    	}

	    if(settings.matrixDiagonals == true && settings.matrixMode == 0){
	    	cells.attr("x" , function(d){ return x(d.predicted);})
    			.attr("y" , function(d){ return y(d.actual);})
    			.attr("width" , function(d){return x.rangeBand();})
    			.attr("height" , function(d){return y.rangeBand();})
    			.attr("fill" , function(d){ return d.fill;});
	    	}

	    if(settings.matrixDiagonals == false && settings.matrixMode == 1){
	    	cells.attr("x" , function(d){ return x(d.predicted) + (x.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("y" , function(d){ return y(d.actual) + (y.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("width" , function(d){
    				if(d.predicted == d.actual) return 0;
    				else return x.rangeBand()*d.value/d.max;})
    			.attr("height" , function(d){
    				if(d.predicted == d.actual) return 0;
    				else return y.rangeBand()*d.value/d.max;})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#59a954'
    				else return '#312450';
    				}
    			);
	    	}

	    if(settings.matrixDiagonals == false && settings.matrixMode == 0){
	    	cells.attr("x" , function(d){ return x(d.predicted);})
    			.attr("y" , function(d){ return y(d.actual);})
    			.attr("width" , function(d){return x.rangeBand();})
    			.attr("height" , function(d){return y.rangeBand();})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#fff'
    				else return d.fill;
    				}
    			);
	    	}
	    
	}

	this.overlap = function(nowdata){
		pane = settings.confPane;
		nowmat = getConfusionMatrix(nowdata, model.classNames, model.target, model.predicted);
		this.prepareData(nowmat);

		color = d3.scale.linear()
	    		.domain([min , max])
	    		.interpolate(d3.interpolateLab)
	    		// .range(["#d1c4e9" , "#312450"]);
	    		.range(["#fff" , "#312450"]);

	    colord = d3.scale.linear()
	    		.domain([mind , maxd])
	    		.interpolate(d3.interpolateLab)
	    		.range(["#fff" , "#59a954"]);
	    		// .range(["#dbecd7" , "#59a954"]);

	    for(i=0, len= (this.newData).length ; i<len ; i++){
	    	if((this.newData)[i].actual == (this.newData)[i].predicted){
	    		(this.newData)[i].fill = colord((this.newData)[i].value);
	    		(this.newData)[i].max = maxd;
	    		(this.newData)[i].min = mind;
	    	}
	    	else{
	    		(this.newData)[i].fill = color((this.newData)[i].value);
	    		(this.newData)[i].max = max;
	    		(this.newData)[i].min = min;
	    	}
	    }

		// color = d3.scale.linear()
	 //    		.domain([min , max])
	 //    		.interpolate(d3.interpolateLab)
	 //    		// .range(["#d1c4e9" , "#312450"]);
	 //    		.range(["#fff" , "#312450"]);

	 //    colord = d3.scale.linear()
	 //    		.domain([mind , maxd])
	 //    		.interpolate(d3.interpolateLab)
	 //    		// .range(["#d1c4e9" , "#312450"]);
	 //    		.range(["#fff" , "#312450"]);

		// for(i=0, len= (this.newData).length ; i<len ; i++){
	 //    	(this.newData)[i].fill = color((this.newData)[i].value);

	 //    	if((this.newData)[i].actual != (this.newData)[i].predicted) 
	 //    		(this.newData)[i].filld = colord((this.newData)[i].value);
	 //    }
		svg = pane.select("svg").select("g");

		// console.log(this.newData);

		overlapcells = svg.selectAll(".overlap-cell")
	    			.data(this.newData)
	    			.enter().append("rect")
	    			.attr("class" , "overlap-cell overlap")
	    			.on('mouseover', tipMat.show)
        			.on('mouseout', tipMat.hide);
	    	

	    if(settings.matrixDiagonals == true && settings.matrixMode == 1){
	    	overlapcells.attr("x" , function(d){ return x(d.predicted) + (x.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("y" , function(d){ return y(d.actual) + (y.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("width" , function(d){return x.rangeBand()*d.value/d.max;})
    			.attr("height" , function(d){return y.rangeBand()*d.value/d.max;})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#59a954'
    				else return '#312450';
    				}
    			);
	    	}

	    if(settings.matrixDiagonals == true && settings.matrixMode == 0){
	    	overlapcells.attr("x" , function(d){ return x(d.predicted);})
    			.attr("y" , function(d){ return y(d.actual);})
    			.attr("width" , function(d){return x.rangeBand();})
    			.attr("height" , function(d){return y.rangeBand();})
    			.attr("fill" , function(d){ return d.fill;});
	    	}

	    if(settings.matrixDiagonals == false && settings.matrixMode == 1){
	    	overlapcells.attr("x" , function(d){ return x(d.predicted) + (x.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("y" , function(d){ return y(d.actual) + (y.rangeBand()*(1-(d.value/d.max)))/2;})
    			.attr("width" , function(d){
    				if(d.predicted == d.actual) return 0;
    				else return x.rangeBand()*d.value/d.max;})
    			.attr("height" , function(d){
    				if(d.predicted == d.actual) return 0;
    				else return y.rangeBand()*d.value/d.max;})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#59a954'
    				else return '#312450';
    				}
    			);
	    	}

	    if(overlapcells.matrixDiagonals == false && settings.matrixMode == 0){
	    	overlapcells.attr("x" , function(d){ return x(d.predicted);})
    			.attr("y" , function(d){ return y(d.actual);})
    			.attr("width" , function(d){return x.rangeBand();})
    			.attr("height" , function(d){return y.rangeBand();})
    			.attr("fill" , function(d){
    				if(d.predicted == d.actual) return '#fff'
    				else return d.fill;
    				}
    			);
	    	}
	    }
}