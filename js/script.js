$(document).ready(function(){

	// file reader
	var reader = new FileReader();

	//bind container for probability histograms
	var probabilityPane = d3.select(".central-pane").select(".probability-histograms");

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
	   	start: settings.probbins,
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
	   	start: settings.probtpDefaultFilter,
	   	connect : 'lower',
	   	tooltips : true,

	   	step: 0.01,
	   	range: {
		     'min': settings.mintpFilter,
		     'max': settings.maxtpFilter
	   	}
	});

	//initialize and setup slider for filtering out low TNs (below 0.5)
	var tnSlider = document.getElementById('filter-low-tn');
	noUiSlider.create(tnSlider, {
	   	start: settings.probtnDefaultFilter,
	   	connect : 'upper',
	   	tooltips : true,

	   	step: 0.01,
	   	range: {
		     'min': settings.mintnFilter,
		     'max': settings.maxtnFilter
	   	}
	});

	renderVisualizations = function(file){

		 reader.addEventListener("load", parseFile, false);
		 if (file) {
			 reader.readAsText(file);
		 }
	}

	function parseFile(){
		var data = d3.csv.parse(reader.result);
		initInterface(data);
	}

	d3.selectAll(".input-file").on("change" , function(){
		renderVisualizations(this.files[0]);
	});

	// read data
	d3.csv("data/out.csv", function (error, data) {
		if(error){
			 $('#file-error-modal').openModal();
		}
		else initInterface(data);
	});

	d3.select(".new-data").on("click", function(d){
		$('#file-upload-modal').openModal();
	});

	initInterface = function(data){

		_self = this;
		//prepare data model do all basic calculations about data
		var model = new Model(data);

		// initialize data table
		var table = new Table(model , settings);

		//initialize Features Box Plots
		var boxPlots = new BoxFeatures(model , settings)

		//initialize class probability histograms
		var probHist = new ProbHist(model , settings, _self);

		//initialize summary class histograms
		var classhist = new classHist(model , settings, _self);

		//initialize confusion Matrix
		var confmat = new confMatrix(model , settings, _self);

		//initialize selection overlaps
		this.overlaps = new Overlaps(model , settings, table, boxPlots, probHist, classhist, confmat);

		// action listener for TP switch
		d3.select(".switch-tp").on("change", function(d){
			settings.probDataOptions.tp = this.checked;
			probHist.applySettings();
			if(settings.switchesOnSummary) classHist.applySettings();
		});

		// action listener for FP switch
		d3.select(".switch-fp").on("change", function(d){
			settings.probDataOptions.fp = this.checked;
			probHist.applySettings();
			if(settings.switchesOnSummary) classHist.applySettings();
		});

		// action listener for TN switch
		d3.select(".switch-tn").on("change", function(d){
			settings.probDataOptions.tn = this.checked;
			probHist.applySettings();
			if(settings.switchesOnSummary) classHist.applySettings();
		});

		// action listener for FN switch
		d3.select(".switch-fn").on("change", function(d){
			settings.probDataOptions.fn = this.checked;
			probHist.applySettings();
			if(settings.switchesOnSummary) classHist.applySettings();
		});

		//reset the probabilty slider and rebin slider
		d3.select(".reset").on("click" , function(){
			if(!d3.select(this).classed("disabled")){
				bins = 10;
				probs = [0.00 , 1.00];
				binSlider.noUiSlider.set(bins);
				probabilitySlider.noUiSlider.set(probs);
				tpSlider.noUiSlider.set(settings.probtpDefaultFilter);
				tnSlider.noUiSlider.set(settings.probtnDefaultFilter);
				settings.probtpFilter = settings.probtpDefaultFilter;
				settings.probtnFilter = settings.probtnDefaultFilter;
				settings.probbins = bins;
				settings.probLimits = probs;
				probHist.applySettings();
			}
		});

		d3.select(".clear").on("click" , function(){
			if(!d3.select(this).classed("disabled")){
				overlaps.overlapDeactivate();
			}
		});

		// apply new probability window and rebin settings to histograms
		d3.select(".apply").on("click" , function(){
			if(!d3.select(this).classed("disabled")){
				settings.probtpFilter = Number(tpSlider.noUiSlider.get());
				settings.probtnFilter = Number(tnSlider.noUiSlider.get());
				settings.probbins = Number(binSlider.noUiSlider.get());
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

		d3.select(".first").on("click" , function(){
				table.slideData(-1);
		});

		d3.select(".last").on("click" , function(){
				table.slideData(2);
		});

		d3.selectAll(".with-gap").on("change", function(d){
			mode = d3.select('input[name="mat-mode"]:checked').property("id");
			if(mode == "size-mode") settings.matrixMode = 1;
			else if (mode == "fill-mode") settings.matrixMode = 0;
			confmat.applySettings();
		});

		d3.select("#diagonal").on("change", function(d){
			settings.matrixDiagonals = this.checked;
			confmat.applySettings();
		});

	}
});
