function BoxFeatures(model , settings){

	this.data = model.data;
	this.features = model.features;
	this.filteredData = {};
	this.featuresData = [];
	this.max = -Infinity;
	this.min = Infinity;
	this.boxData = [];
	this.newData = [];
	var x , y0 , y1 , xAxis, yAxis;
	pane = settings.featurePane;

	w = (pane.node().getBoundingClientRect().width);
	h = (pane.node().getBoundingClientRect().height)*9.5/10;
	var margin = {
	    top: 20,
	    right: 10,
	    bottom: 20,
	    left: 60
	},
	width = w - margin.left - margin.right;
	height = Math.max(500,h) - margin.top - margin.bottom;

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
              return "<span>First Quartile:</span> <span>" + d.quartiles[0] + "<br><span>Third Quartile:</span> <span>" + d.quartiles[2];
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
		for(i=0,len=o.length; i<len ; i++){
			if(o[i] != ((i==0)? -Infinity : o[i-1])){
				r.push(o[i]);
			}
		}
		return r;
	}


	this.prepareData = function(nowData){

		this.newData = [];
		this.featuresData = [];

		this.filteredData = nowData;

		// prepare data only for numerical features
		for(j = 0,lenj=(this.features).length; j<lenj ; j++) 
			if(!isNaN(this.filteredData[0][this.features[j]])) 
				(this.featuresData).push([this.features[j] , []]);
			

		for(i=0,len=(this.filteredData).length; i<len ; i++){
			for(j = 0,lenj=(this.featuresData).length; j<lenj ; j++){

				value = this.filteredData[i][this.features[j]];
				(this.featuresData[j][1]).push(value);
				if(this.max < value) this.max = value;
				if(this.min > value) this.min = value;
			}
		}

		for(k = 0,lenk=(this.featuresData).length; k<lenk ; k++){
			n = this.featuresData[k][0];
			d = this.featuresData[k][1].sort(d3.ascending);
			q = this.quartiles(d);
			w = this.whiskers(d , q);
			o = this.outliers(d , w);
			this.newData.push( {
				name : n,
				data : d,
				quartiles : q,
				whiskers : w,
				outliers : o,
				difference : 0
			});
		}
	};

	


	this.makePlots = function(){

		for(i=0,len=(this.newData).length; i<len ; i++){
			this.boxData[i] = this.newData[i];
		}
		pane = settings.featurePane;
		pane.select("*").remove();

		height = Math.max(height , (this.boxData).length * 20);

		y0 = d3.scale.ordinal()
            	.domain(this.boxData.map(function(d){ return d.name;}))
            	.rangeRoundBands([height , 0] , 0.1);

        y1 = d3.scale.ordinal()
            	.domain(d3.range(2))
            	.rangeRoundBands([y0.rangeBand() , 0] , 0.3);


    	x = d3.scale.linear()
        		.domain([this.min , this.max]).nice()
        		.range([0 , width]);
		
        xAxis = d3.svg.axis()
        			.scale(x)
        			.orient("bottom")
        			.tickSize(0.3)
        			.ticks(5);        			

        
        yAxis = d3.svg.axis()
        			.scale(y0)
        			.orient("left")
        			.tickSize(0.3);

        var svg = pane.append("svg")
              		.attr("class" , "svg-boxPlot")
              		.attr("width" , width + margin.left + margin.right)
              		.attr("height" , height + margin.top + margin.bottom)
              		.append("g")
                		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.append("g")
	      	.attr("class" , "feature x axis")
	      	.attr("transform" , "translate(0," + height + ")")
	      	.call(xAxis)
 	

	    svg.append("g")
	      	.attr("class" , "feature y axis")
	      	.attr("transform" , "translate(0,0)")
	      	.call(yAxis)
	      	.selectAll('text')	      	
			.text(function (d,i) {
			   return (d).substr(2);
			});

		svg.call(tipMedian);
		svg.call(tipWhiskerLower);
		svg.call(tipWhiskerUpper);
		svg.call(tipCenter);
		svg.call(tipQuartile);


		var features = svg.selectAll(".feature-group")
						.data(this.boxData , function(d){return d.name;})
						.enter().append("g")
						.attr("class" , "feature-group")
						.attr("transform", function(d) { return "translate(0," + y0(d.name)+")"; });

	    features.append("line")
	    		.attr("class" , "center box-stroke box-dasharray")
	    		.attr("y1" , function(d){return y1(1)})
	    		.attr("y2" , function(d){return y1(1)})
	    		.attr("x1" , function(d){return x(d.whiskers[0])})
	    		.attr("x2" , function(d){return x(d.whiskers[1])})
	    		.attr("transform" , "translate(0,"+y1.rangeBand()/2+")");

	    features.append("line")
	    		.attr("class" , "whisker upper box-stroke")
	    		.attr("y1" , function(d){return y1(1)})
	    		.attr("y2" , function(d){return y1.rangeBand() + y1(1);})
	    		.attr("x1" , function(d){return x(d.whiskers[1])})
	    		.attr("x2" , function(d){return x(d.whiskers[1])})

	    features.append("line")
	    		.attr("class" , "whisker lower box-stroke")
	    		.attr("y1" , function(d){return y1(1)})
	    		.attr("y2" , function(d){return y1.rangeBand() + y1(1);})
	    		.attr("x1" , function(d){return x(d.whiskers[0])})
	    		.attr("x2" , function(d){return x(d.whiskers[0])})

	    features.append("rect")
	    		.attr("class" , "quartile box-stroke box-fill")
	    		.attr("y" , function(d){return y1(1)})
	    		.attr("x" , function(d){return x(d.quartiles[0])})
	    		.attr("width" , function(d){return x(d.quartiles[2]) - x(d.quartiles[0])})
	    		.attr("height" , function(d){return y1.rangeBand()})

	    features.append("line")
	    		.attr("class" , "median box-stroke box-width")
	    		.attr("y1" , function(d){return y1(1)})
	    		.attr("y2" , function(d){return y1.rangeBand() + y1(1);})
	    		.attr("x1" , function(d){return x(d.quartiles[1])})
	    		.attr("x2" , function(d){return x(d.quartiles[1])})




	   	var featuresSelected = svg.selectAll(".feature-group-selected")
						.data(this.newData , function(d){return d.name;})
						.enter().append("g")
						.attr("class" , "feature-group-selected dont-display")
						.attr("transform", function(d) { return "translate(0," + y0(d.name)+")"; });


	    featuresSelected.append("line")
	    		.attr("class" , "center box-stroke-light box-dasharray")
	    		.attr("y1" , function(d){return y1(0)})
	    		.attr("y2" , function(d){return y1(0)})
	    		.attr("x1" , function(d){return x(d.whiskers[0])})
	    		.attr("x2" , function(d){return x(d.whiskers[1])})
	    		.attr("transform" , "translate(0,"+y1.rangeBand()/2+")");

	    featuresSelected.append("line")
	    		.attr("class" , "whisker upper box-stroke-light")
	    		.attr("y1" , function(d){return y1(0)})
	    		.attr("y2" , function(d){return y1.rangeBand() + y1(0);})
	    		.attr("x1" , function(d){return x(d.whiskers[1])})
	    		.attr("x2" , function(d){return x(d.whiskers[1])})

	    featuresSelected.append("line")
	    		.attr("class" , "whisker lower box-stroke-light")
	    		.attr("y1" , function(d){return y1(0)})
	    		.attr("y2" , function(d){return y1.rangeBand() + y1(0);})
	    		.attr("x1" , function(d){return x(d.whiskers[0])})
	    		.attr("x2" , function(d){return x(d.whiskers[0])})

	    featuresSelected.append("rect")
	    		.attr("class" , "quartile box-stroke-light box-fill")
	    		.attr("y" , function(d){return y1(0)})
	    		.attr("x" , function(d){return x(d.quartiles[0])})
	    		.attr("width" , function(d){return x(d.quartiles[2]) - x(d.quartiles[0])})
	    		.attr("height" , function(d){return y1.rangeBand()})

	    featuresSelected.append("line")
	    		.attr("class" , "median box-stroke-light box-width")
	    		.attr("y1" , function(d){return y1(0)})
	    		.attr("y2" , function(d){return y1.rangeBand() + y1(0);})
	    		.attr("x1" , function(d){return x(d.quartiles[1])})
	    		.attr("x2" , function(d){return x(d.quartiles[1])})

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



	};

	this.prepareData(this.data);
	this.makePlots();
	this.bindEvents();

	this.overlap = function(newdata){
		pane = settings.featurePane;
		this.prepareData(newdata);

		old = this.boxData;
		now = this.newData;
		for(i=0,len=now.length; i<len ; i++){
			now[i].diff = Math.abs(old[i].quartiles[1] - now[i].quartiles[1]);
		}

		now.sort(function(a , b){
			// comparator
			return d3.ascending(a.diff , b.diff);
		});

		y0.domain(now.map(function(d){ return d.name;}));

		yAxis = d3.svg.axis()
        			.scale(y0)
        			.orient("left")
        			.tickSize(0.3);

        
		pane.select(".feature.y.axis")
	      	.call(yAxis)
	      	.selectAll('text')	      	
			.text(function (d,i) {
			   return (d).substr(2);
			});

		

		var features = pane.selectAll(".feature-group")
						.attr("transform", function(d) { return "translate(0," + y0(d.name)+")"; });


	   	var featuresSelected = pane.selectAll(".feature-group-selected")
						.data(this.newData , function(d){return d.name;})

		featuresSelected.transition().duration(500)
				.attr("transform", function(d) { return "translate(0," + y0(d.name)+")"; });

	    featuresSelected.select("line.center").transition().duration(500)
	    		.attr("x1" , function(d){return x(d.whiskers[0])})
	    		.attr("x2" , function(d){return x(d.whiskers[1])})
	    		.attr("transform" , "translate(0,"+y1.rangeBand()/2+")");

	    featuresSelected.select("line.whisker.upper").transition().duration(500)
	    		.attr("x1" , function(d){return x(d.whiskers[1])})
	    		.attr("x2" , function(d){return x(d.whiskers[1])})

	    featuresSelected.select("line.whisker.lower").transition().duration(500)
	    		.attr("x1" , function(d){return x(d.whiskers[0])})
	    		.attr("x2" , function(d){return x(d.whiskers[0])})

	    featuresSelected.select("rect.quartile").transition().duration(500)
	    		.attr("x" , function(d){return x(d.quartiles[0])})
	    		.attr("width" , function(d){return x(d.quartiles[2]) - x(d.quartiles[0])})

	    featuresSelected.select("line.median").transition().duration(500)
	    		.attr("x1" , function(d){return x(d.quartiles[1])})
	    		.attr("x2" , function(d){return x(d.quartiles[1])})

		this.bindEvents();
	};
}