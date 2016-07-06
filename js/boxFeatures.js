function BoxFeatures(model , settings , pane){

	this.data = model.data;
	this.features = model.features;
	this.filteredData = {};
	this.featuresData = [];
	this.max = -Infinity;
	this.min = Infinity;
	this.boxData = [];
	this.newData = [];
	var x;
	var y;

	w = (pane.node().getBoundingClientRect().width)* 9/10;
	h = (pane.node().getBoundingClientRect().width)/2;
	var margin = {
	    top: 30,
	    right: 20,
	    bottom: 20,
	    left: 20
	},
	width = w - margin.left - margin.right,
	height = Math.max(250,h) - margin.top - margin.bottom;
	stroke = "#5e35b1";
	fill = "#ede7f6";

	var tipMedian = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Median:</span> <span>" + d.quartiles[1];
            })

  	var tipQuartile = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>First Quartile:</span> <span>" + d.quartiles[0] + "<br><span>Second Quartile:</span> <span>" + d.quartiles[2];
            })

  	var tipOutlier = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Outlier:</span> <span>" + d;
            })

  	var tipWhiskerUpper = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Upper Limit:</span> <span>" + d.whiskers[1];
            })

    var tipWhiskerLower = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Lower Limit:</span> <span>" + d.whiskers[0];
            })

    var tipCenter = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Feature:</span> <span>" + (d.name).substr(2);
            })




	// helpers 
	this.quartiles = function(d){
		return [d3.quantile(d, .25), d3.quantile(d, .5), d3.quantile(d, .75)];
	}

	this.whiskers = function(d , q){
        iqr = (q[2] - q[0]) * settings.boxIQR,
        i = -1,
        j = d.length;
	    while (d[++i] < q[0] - iqr);
	    while (d[--j] > q[2] + iqr);
	    return [d[i], d[j]];
	}

	this.outliers = function(d , w){
		o = d.filter(function(a){
			if(a < w[0] || a > w[1]) return true;
			else return false;
		})
		r = [];
		for(i in o){
			if(o[i] != ((i==0)? -Infinity : o[i-1])){
				r.push(o[i]);
			}
		}
		return r;
	}


	this.prepareData = function(){

		this.newData = [];
		this.featuresData = [];

		this.filteredData = settings.rightFilteredData(this.data);

		// prepare data only for numerical features
		for(j in this.features) 
			if(!isNaN(this.filteredData[0][this.features[j]])) 
				(this.featuresData).push([this.features[j] , []]);
			

		for(i in this.filteredData){
			for(j in this.featuresData){

				value = this.filteredData[i][this.features[j]];
				(this.featuresData[j][1]).push(value);
				if(this.max < value) this.max = value;
				if(this.min > value) this.min = value;
			}
		}

		for(j in this.featuresData){
			n = this.featuresData[j][0];
			d = this.featuresData[j][1].sort(d3.ascending);
			q = this.quartiles(d);
			w = this.whiskers(d , q);
			o = this.outliers(d , w);
			this.newData.push( {
				name : n,
				data : d,
				quartiles : q,
				whiskers : w,
				outliers : o
			});
		}
	};

	


	this.makePlots = function(){

		for(i in this.newData){
			this.boxData[i] = this.newData[i];
		}
		
		pane.select("*").remove();

		width = Math.max(width , (this.boxData).length * 70);


		x = d3.scale.ordinal()
            	.domain(this.boxData.map(function(d){ return d.name;}))
            	.rangeRoundBands([0 , width] , 0.3);

    	y = d3.scale.linear()
        		.domain([this.min , this.max]).nice()
        		.range([height , 0]);
		

        var xAxis = d3.svg.axis()
        			.scale(x)
        			.orient("bottom")
        			.tickSize(1);        			

        
        var yAxis = d3.svg.axis()
        			.scale(y)
        			.orient("left")
        			.tickSize(1)
        			.ticks(10);

        var svg = pane.append("svg")
              		.attr("class" , "svg-boxPlot all")
              		.attr("width" , width + margin.left + margin.right)
              		.attr("height" , height + margin.top + margin.bottom)
              		.append("g")
                		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.append("g")
	      	.attr("class" , "feature x axis")
	      	.attr("transform" , "translate(0," + height + ")")
	      	.call(xAxis)
	      	.selectAll('text')
			.text(function (d,i) {
			   return (d).substr(2);
			});

	    svg.append("g")
	      	.attr("class" , "feature y axis")
	      	.attr("transform" , "translate(0,0)")
	      	.call(yAxis);

		svg.call(tipMedian);
		svg.call(tipOutlier);
		svg.call(tipWhiskerLower);
		svg.call(tipWhiskerUpper);
		svg.call(tipCenter);
		svg.call(tipQuartile);

	    var boxes = svg.selectAll(".box.all")
	    			.data(this.boxData , function(d){return d.name;})
	    			.enter().append("g")
	    			.attr("class" , "box all");

	    boxes.append("text")
	    		.attr("x" , x(margin.left))
	    		.attr("y" , y(this.max + 6))
	    		.style("font-size" , "0.8em")
	    		.style("fill" , "#263238")
	    		.style("font-style" , "roboto")
	    		.text("Feature View for Entire Dataset");

	    boxes.append("line")
	    		.attr("class" , "center")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x(d.name)})
	    		.attr("y1" , function(d){return y(d.whiskers[0])})
	    		.attr("y2" , function(d){return y(d.whiskers[1])})
	    		.attr("transform" , "translate("+x.rangeBand()/2+",0)")
	    		.style("stroke" , stroke)
	    		.style("stroke-dasharray", ("3, 3"));

	    boxes.append("line")
	    		.attr("class" , "whisker upper")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x.rangeBand() + x(d.name);})
	    		.attr("y1" , function(d){return y(d.whiskers[1])})
	    		.attr("y2" , function(d){return y(d.whiskers[1])})
	    		.style("stroke" , stroke);

	    boxes.append("line")
	    		.attr("class" , "whisker lower")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x.rangeBand() + x(d.name);})
	    		.attr("y1" , function(d){return y(d.whiskers[0])})
	    		.attr("y2" , function(d){return y(d.whiskers[0])})
	    		.style("stroke" , stroke);

	    boxes.append("rect")
	    		.attr("class" , "quartile")
	    		.attr("x" , function(d){return x(d.name)})
	    		.attr("y" , function(d){return y(d.quartiles[2])})
	    		.attr("width" , function(d){return x.rangeBand()})
	    		.attr("height" , function(d){return y(d.quartiles[0]) - y(d.quartiles[2])})
	    		.style("stroke" , stroke)
	    		.style("fill" , fill);

	    boxes.append("line")
	    		.attr("class" , "median")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x.rangeBand() + x(d.name);})
	    		.attr("y1" , function(d){return y(d.quartiles[1])})
	    		.attr("y2" , function(d){return y(d.quartiles[1])})
	    		.style("stroke" , stroke);

	    boxes.selectAll("circle")
		    		.data(function(d){ return d.outliers})
		    		.enter().append("circle")
		    		.attr("class" , "outlier")
		    		.attr("cx" , function(d){return (x(d3.select(this.parentNode).datum().name)) + x.rangeBand()/2})
		    		.attr("cy" , function(d){return y(d)})
		    		.attr("r" , 1)
		    		.style("stroke" , stroke)
		    		.style("fill" , fill);

		var svgSelected = pane.append("svg")
              		.attr("class" , "svg-boxPlot selected")
              		.attr("width" , width + margin.left + margin.right)
              		.attr("height" , height + margin.top + margin.bottom)
              		.append("g")
                		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svgSelected.append("g")
	      	.attr("class" , "selection x axis")
	      	.attr("transform" , "translate(0," + height + ")")
	      	.call(xAxis)
	      	.selectAll('text')
			.text(function (d,i) {
			   return (d).substr(2);
			});

	    svgSelected.append("g")
	      	.attr("class" , "selection y axis")
	      	.attr("transform" , "translate(0,0)")
	      	.call(yAxis);


		var boxesSelected = svgSelected.selectAll(".box.selected")
	    			.data(this.boxData , function(d){return d.name;})
	    			.enter().append("g")
	    			.attr("class" , "box selected");

	    boxesSelected.append("text")
	    		.attr("x" , x(margin.left))
	    		.attr("y" , y(this.max + 6))
	    		.style("font-size" , "0.8em")
	    		.style("fill" , "#263238")
	    		.style("font-style" , "roboto")
	    		.text("Feature View for Selection");

	    boxesSelected.append("line")
	    		.attr("class" , "center")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x(d.name)})
	    		.attr("y1" , function(d){return y(d.whiskers[0])})
	    		.attr("y2" , function(d){return y(d.whiskers[1])})
	    		.attr("transform" , "translate("+x.rangeBand()/2+",0)")
	    		.style("stroke" , stroke)
	    		.style("stroke-dasharray", ("3, 3"));

	    boxesSelected.append("line")
	    		.attr("class" , "whisker upper")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x.rangeBand() + x(d.name);})
	    		.attr("y1" , function(d){return y(d.whiskers[1])})
	    		.attr("y2" , function(d){return y(d.whiskers[1])})
	    		.style("stroke" , stroke);

	    boxesSelected.append("line")
	    		.attr("class" , "whisker lower")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x.rangeBand() + x(d.name);})
	    		.attr("y1" , function(d){return y(d.whiskers[0])})
	    		.attr("y2" , function(d){return y(d.whiskers[0])})
	    		.style("stroke" , stroke);

	    boxesSelected.append("rect")
	    		.attr("class" , "quartile")
	    		.attr("x" , function(d){return x(d.name)})
	    		.attr("y" , function(d){return y(d.quartiles[2])})
	    		.attr("width" , function(d){return x.rangeBand()})
	    		.attr("height" , function(d){return y(d.quartiles[0]) - y(d.quartiles[2])})
	    		.style("stroke" , stroke)
	    		.style("fill" , fill);

	    boxesSelected.append("line")
	    		.attr("class" , "median")
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x.rangeBand() + x(d.name);})
	    		.attr("y1" , function(d){return y(d.quartiles[1])})
	    		.attr("y2" , function(d){return y(d.quartiles[1])})
	    		.style("stroke" , stroke);

	    boxesSelected.selectAll("circle")
		    		.data(function(d){ return d.outliers})
		    		.enter().append("circle")
		    		.attr("class" , "outlier")
		    		.attr("cx" , function(d){return (x(d3.select(this.parentNode).datum().name)) + x.rangeBand()/2})
		    		.attr("cy" , function(d){return y(d)})
		    		.attr("r" , 1)
		    		.style("stroke" , stroke)
		    		.style("fill" , fill);



	};

	this.bindEvents = function(){

		d3.selectAll("line.center")
			.on('mouseover', tipCenter.show)
        	.on('mouseout', tipCenter.hide);

        d3.selectAll("line.whisker.upper")
			.on('mouseover', tipWhiskerUpper.show)
        	.on('mouseout', tipWhiskerUpper.hide);

        d3.selectAll("line.whisker.lower")
			.on('mouseover', tipWhiskerLower.show)
        	.on('mouseout', tipWhiskerLower.hide);

        d3.selectAll("rect.quartile")
			.on('mouseover', tipQuartile.show)
        	.on('mouseout', tipQuartile.hide);

        d3.selectAll("line.median")
			.on('mouseover', tipMedian.show)
        	.on('mouseout', tipMedian.hide);

        d3.selectAll("circle.outlier")
			.on('mouseover', tipOutlier.show)
        	.on('mouseout', tipOutlier.hide);



	};

	this.prepareData();
	this.makePlots();
	this.bindEvents();

	this.applySettings = function(){
		this.prepareData();

		var boxesSelected = pane.selectAll(".box.selected")
	    			.data(this.newData , function(d){return d.name;})

	    boxesSelected.select("line.center").transition().duration(500)
	    		.attr("x1" , function(d){return x(d.name)})
	    		.attr("x2" , function(d){return x(d.name)})
	    		.attr("y1" , function(d){return y(d.whiskers[0])})
	    		.attr("y2" , function(d){return y(d.whiskers[1])});

	    boxesSelected.select("line.whisker.upper").transition().duration(500)
	    		.attr("y1" , function(d){return y(d.whiskers[1])})
	    		.attr("y2" , function(d){return y(d.whiskers[1])})

	    boxesSelected.select("line.whisker.lower").transition().duration(500)
	    		.attr("y1" , function(d){return y(d.whiskers[0])})
	    		.attr("y2" , function(d){return y(d.whiskers[0])})

	    boxesSelected.select("rect.quartile").transition().duration(500)
	    		.attr("y" , function(d){return y(d.quartiles[2])})
	    		.attr("height" , function(d){return y(d.quartiles[0]) - y(d.quartiles[2])})

	    boxesSelected.select("line.median").transition().duration(500)
	    		.attr("y1" , function(d){return y(d.quartiles[1])})
	    		.attr("y2" , function(d){return y(d.quartiles[1])})

	    var outliers = boxesSelected.selectAll("circle.outlier")
		    		.data(function(d){ return d.outliers})
		    		
		outliers.enter().append("circle")
		    		.attr("class" , "outlier")


		outliers.transition().duration(500)
		    		.attr("cx" , function(d){return (x(d3.select(this.parentNode).datum().name)) + x.rangeBand()/2})
		    		.attr("cy" , function(d){return y(d)})
		    		.attr("r" , 1)
		    		.style("stroke" , stroke)
		    		.style("fill" , fill);

		outliers.exit().remove();

		this.bindEvents();

	};




	

}