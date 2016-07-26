function confMatrix(model , settings){

	this.matrix = model.confusionMatrix;
	this.min = Infinity;
	this.max =-Infinity;
	this.matData = [];
	classes = model.classNames;
	pane = settings.confPane;
	// w = (pane).node().getBoundingClientRect().width;
	w = (settings.featurePane).node().getBoundingClientRect().width;
	var margin = {
	    top: 20,
	    right: 10,
	    bottom: 30,
	    left: 30
	},
	height = width = Math.max((classes).length*40 , (w - margin.left - margin.right));
	var x , y , xAxis , yAxis, color;

	var tipMat = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Actual:</span> <span>" + d.actual + "</span><br><span>Predicted:</span> <span>" + d.predicted + "</span><br><span>Count:</span> <span>" + d.value + "</span>";
            })

    this.prepareData = function(){
    	for(i=0 , len = (classes).length;i<len;i++){
			for(j=0;j<len;j++){
				c = (this.matrix)[i][j];
				(this.matData).push({
					actual : classes[i],
					predicted : classes[j],
					value : c
				});
				if(c < this.min) this.min = c;
				if(c > this.max) this.max = c;
			}
		}
    }

	this.makeMatrix = function(){

		x = d3.scale.ordinal()
            .domain((this.matData).map(function(d){return d.predicted}))
            .rangeRoundBands([0, width] , 0.05);

	    y = d3.scale.ordinal()
	            .domain((this.matData).map(function(d){return d.actual}))
            	.rangeRoundBands([0 , height] , 0.05);

	    color = d3.scale.linear()
	    		.domain([this.min , this.max])
	    		.interpolate(d3.interpolateLab)
	    		.range(["#d1c4e9" , "#311b92"]);


	    xAxis = d3.svg.axis()
	                .scale(x)
	                .orient("top")
	                .tickSize(1)
	    
	    yAxis = d3.svg.axis()
	                .scale(y)
	                .orient("left")	                
	                .tickSize(1)

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
	    // var rows = svg.selectAll(".row")
	    // 			.data(this.matData)
	    // 			.enter().append("g")
	    // 			.attr("class" , "row")
	    // 			.attr("transform" , function(d , i) {return "translate(0," + y(i) + ")";})

	    var cells = svg.selectAll(".cell")
	    			.data(this.matData)
	    			.enter().append("rect")
	    			.attr("class" , "cell")
	    			.attr("x" , function(d){ return x(d.predicted);})
	    			.attr("y" , function(d){ return y(d.actual);})
	    			.attr("width" , x.rangeBand())
	    			.attr("height" , y.rangeBand())
	    			.attr("fill" , function(d){ return color(d.value);})

	    var texts = svg.selectAll(".text")
	    			.data(this.matData)
	    			.enter().append("text")
	    			.attr("class" , ".text")
	    			.text(function(d){return d.value;})
					.attr("x" , function(d){return x(d.predicted);})
	    			.attr("y" , function(d){ return y(d.actual);})
	    			.attr("transform" , "translate(0,"+y.rangeBand()/2+")")
	    			.attr("fill","#fff")
				    .style("stroke-width", 1)
				    .style("font-size" , "0.7em")
				    .style("z-index" , "999999")
				    .style("text-shadow" ,  "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black")
				    .style("text-anchor", "middle")
					.attr("dy", ".35em")
	    			.attr("dx" , "1.6em");

	}

	this.bindEvents = function(){
		pane.selectAll("rect")
		.on('mouseover', tipMat.show)
        .on('mouseout', tipMat.hide)
        .on("click" , function(){
        	// this.remove();
        	// console.log("f")
        });
	}


	this.prepareData();
	this.makeMatrix();
	this.bindEvents();

}