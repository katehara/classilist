$(document).ready(function(){
	
	//activate sidenav on loading window for small and medium sized windows
	$(".button-collapse").sideNav();

	//bind container for visualization svg
	var centralPane = d3.select(".central-pane");

	//initialize settigns
	var settings = new Settings();

	//bind container for Data View
	var dataPane = d3.select("#data-samples");//.select(".data-table");

	//bind container for Feature View 	
	var featurePane = d3.select("#feature-view");

	//initialize and setup slider for zooming in/out probabilities
	var probabilitySlider = document.getElementById('probability-zoom');
	  noUiSlider.create(probabilitySlider, {
	   start: settings.probLimits,
	   behaviour: 'drag-tap',
	   connect: true,
	   tooltips : true,
	   step: settings.stepProb,
	   range: {
	     'min': settings.minProb,
	     'max': settings.maxProb
	   }	  
	  });

	//initialize and setup slider for increase or decrease in histogram bins
	var binSlider = document.getElementById('rebin');
	  noUiSlider.create(binSlider, {
	   	start: settings.bins,
	   	connect : 'lower',
	   	tooltips : true,
	   	format: wNumb({
	        decimals: 0,
	        thousand: ',',
	    }),
	   	step: settings.stepBins,
	   	range: {
		     'min': settings.minBins,
		     'max': settings.maxBins
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
	// d3.csv("data/rapidminer.csv", function (error, data) {
	d3.csv("data/prob.csv", function (error, data) {

		//prepare data model do all basic calculations about data
		var model = new Model(data);
		
		// initialize data table 
		var table = new Table(model , settings , dataPane);

		//initialize Features Box Plots
		var boxPlots = new BoxFeatures(model , settings , featurePane);

		//initialize pane for visualizing class probabilities
		probabilityPane = centralPane.append("div").attr("class" , "probability-histograms")

		//initialize class probability histograms
		var probHist = new ProbHist(model , settings , probabilityPane , table , boxPlots);

		// action listener for TP switch
		d3.select(".switch-tp").on("change", function(d){
			settings.dataOptions.tp = this.checked;
			probHist.applySettings();
		});

		// action listener for FP switch
		d3.select(".switch-fp").on("change", function(d){
			settings.dataOptions.fp = this.checked;
			probHist.applySettings();
		});

		// action listener for TN switch
		d3.select(".switch-tn").on("change", function(d){
			settings.dataOptions.tn = this.checked;
			probHist.applySettings();
		});

		// action listener for FN switch
		d3.select(".switch-fn").on("change", function(d){
			settings.dataOptions.fn = this.checked;
			probHist.applySettings();
		});

		//reset the probabilty slider and rebin slider 
		d3.select(".reset").on("click" , function(){
			if(!d3.select(this).classed("disabled")){
				bins = 10;
				probs = [0.00 , 1.00];
				binSlider.noUiSlider.set(bins);
				probabilitySlider.noUiSlider.set(probs);
				settings.bins = bins;
				settings.probLimits = probs;
				probHist.applySettings();
			}
		});

		// apply new probability window and rebin settings to histograms
		d3.select(".apply").on("click" , function(){
			if(!d3.select(this).classed("disabled")){
				settings.bins = Number(binSlider.noUiSlider.get());
				settings.probLimits = probabilitySlider.noUiSlider.get().map(Number);
				probHist.applySettings();
			}
		});

		d3.select(".prev").on("click" , function(){
			if(!d3.select(this).classed("disabled")){
				table.slideData(0);
			}
		});

		d3.select(".next").on("click" , function(){
			if(!d3.select(this).classed("disabled")){
				table.slideData(1);
			}
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
	   		settings.tpFilter = value;
	   		if(settings.tpFilter < settings.probLimits[1]) probHist.applySettings();
	  	});

	   	// action listener for low TN filter
	   	tnSlider.noUiSlider.on("update" , function(values){
	   		value = Number(values);
	   		settings.tnFilter = value;
	   		if(settings.tnFilter > settings.probLimits[0])probHist.applySettings();
	  	});

	  	
	});
});