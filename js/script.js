$(document).ready(function(){
	
	//activate sidenav on loading window for small and medium sized windows
	$(".button-collapse").sideNav();

	//bind container for visualization svg
	var centralPane = d3.select(".central-pane");
	// var row = d3.select(".left-pane");
	// h=(row.node().getBoundingClientRect().height);

	// centralPane.attr("height" , h+"px").attr("overflow-y" , "scroll");

	//initialize and setup slider for zooming in/out probabilities
	var probabilitySlider = document.getElementById('probability-zoom');
	  noUiSlider.create(probabilitySlider, {
	   start: [0.00, 1],
	   behaviour: 'drag-tap',
	   connect: true,
	   tooltips : true,
	   step: 0.01,
	   range: {
	     'min': 0,
	     'max': 1
	   }	  
	  });

	//initialize and setup slider for increase or decrease in histogram bins
	var binSlider = document.getElementById('rebin');
	  noUiSlider.create(binSlider, {
	   	start: [10],
	   	connect : 'lower',
	   	tooltips : true,
	   	format: wNumb({
	        decimals: 0,
	        thousand: ',',
	    }),
	   	step: 1,
	   	range: {
		     'min': 1,
		     'max': 30
	   	}	  
	  });

	//initialize and setup slider for filtering out high TPs (above 0.5)
	var tpSlider = document.getElementById('filter-high-tp');
	noUiSlider.create(tpSlider, {
	   	start: [1.0],
	   	connect : 'lower',
	   	tooltips : true,
	   	
	   	step: 0.01,
	   	range: {
		     'min': 0.5,
		     'max': 1.0
	   	}	  
	});

	//initialize and setup slider for filtering out low TNs (below 0.5)
	var tnSlider = document.getElementById('filter-low-tn');
	noUiSlider.create(tnSlider, {
	   	start: [0],
	   	connect : 'upper',
	   	tooltips : true,
	   	
	   	step: 0.01,
	   	range: {
		     'min': 0.0,
		     'max': 0.5
	   	}	  
	});
	   
	// read data
	d3.csv("data/prob.csv", function (error, data) {

		//prepare data model do all basic calculations about data
		var model = new Model(data);
		
		//initialize pane for visualizing class probabilities
		probabilityPane = centralPane.append("div").attr("class" , "probability-histograms")

		//initialize class probability histograms
		var probHist = new ProbHist(model , probabilityPane);

		// action listener for TP switch
		d3.select(".switch-tp").on("change", function(d){
			probHist.dataOptions.tp = this.checked;
			probHist.applySettings();
		});

		// action listener for FP switch
		d3.select(".switch-fp").on("change", function(d){
			probHist.dataOptions.fp = this.checked;
			probHist.applySettings();
		});

		// action listener for TN switch
		d3.select(".switch-tn").on("change", function(d){
			probHist.dataOptions.tn = this.checked;
			probHist.applySettings();
		});

		// action listener for FN switch
		d3.select(".switch-fn").on("change", function(d){
			probHist.dataOptions.fn = this.checked;
			probHist.applySettings();
		});

		//reset the probabilty slider and rebin slider 
		d3.select(".reset").on("click" , function(){
			bins = 10;
			probs = [0.00 , 1.00];
			binSlider.noUiSlider.set(bins);
			probabilitySlider.noUiSlider.set(probs);
			probHist.bins = bins;
			probHist.probLimits = probs;
			probHist.applySettings();
		});

		// apply new probability window and rebin settings to histograms
		d3.select(".apply").on("click" , function(){
			bins = binSlider.noUiSlider.get();
			probs = probabilitySlider.noUiSlider.get();
			probHist.bins = Number(bins);
			probHist.probLimits = probs.map(Number);
			probHist.applySettings();
		});

		//bind low probility to TN filter and high probability to TP filter
		// probabilitySlider.noUiSlider.on("update" , function(values){
	 //  		values = values.map(Number);
	 //  		if(values[0]<=0.50 && values[0] > Number(tnSlider.noUiSlider.get())) tnSlider.noUiSlider.set(values[0]);
	 //  		if(values[1]>=0.50 && values[1] < Number(tpSlider.noUiSlider.get())) tpSlider.noUiSlider.set(values[1]);

		//  });

	 	//action listener for High-TP filter
	   	tpSlider.noUiSlider.on("update" , function(values){
	   		value = Number(values);
	   		probHist.tpFilter = value;
	   		probHist.applySettings();
	  	});

	   	// action listener for low TN filter
	   	tnSlider.noUiSlider.on("update" , function(values){
	   		value = Number(values);
	   		probHist.tnFilter = value;
	   		probHist.applySettings();
	  	});

	});

});




