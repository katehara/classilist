$(document).ready(function(){

	$(".button-collapse").sideNav();

	var centralPane = d3.select(".central-pane");
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
	   

	d3.csv("data/prob.csv", function (error, data) {

		var model = new Model(data);
		// console.log(model.features);
		// console.log(model.probs);
		// console.log(model.target);
		// console.log(model.predicted);
		// console.log(model.classNames);
		// console.log(model.confusionMatrix);

		// var  hist = model.getHistograms(); 
		// console.log(data);

		probabilityPane = centralPane.append("div")
							.attr("class" , "probability-histograms")
		var probHist = new ProbHist(model , probabilityPane);


		d3.select(".switch-tp").on("change", function(d){
			probHist.dataOptions.tp = this.checked;
			probHist.applySettings();
		});

		d3.select(".switch-fp").on("change", function(d){
			probHist.dataOptions.fp = this.checked;
			probHist.applySettings();
		});

		d3.select(".switch-tn").on("change", function(d){
			probHist.dataOptions.tn = this.checked;
			probHist.applySettings();
		});

		d3.select(".switch-fn").on("change", function(d){
			probHist.dataOptions.fn = this.checked;
			probHist.applySettings();
		});

		d3.select(".reset").on("click" , function(){
			bins = 10;
			probs = [0.00 , 1.00];
			binSlider.noUiSlider.set(bins);
			probabilitySlider.noUiSlider.set(probs);
			probHist.bins = bins;
			probHist.probLimits = probs;
			probHist.applySettings();
		});

		d3.select(".apply").on("click" , function(){
			bins = binSlider.noUiSlider.get();
			probs = probabilitySlider.noUiSlider.get();
			probHist.bins = Number(bins);
			probHist.probLimits = probs.map(Number);
			probHist.applySettings();
		});

		// probabilitySlider.noUiSlider.on("update" , function(values){
	 //   		values = values.map(Number);
	 //   		if(values[0]<=0.50 && values[0] > Number(tnSlider.noUiSlider.get())) tnSlider.noUiSlider.set(values[0]);
	 //   		if(values[1]>=0.50 && values[1] < Number(tpSlider.noUiSlider.get())) tpSlider.noUiSlider.set(values[1]);

	 //  });

	   tpSlider.noUiSlider.on("change" , function(values){
	   		value = Number(values);

	   		probHist.tpFilter = value;
	   		probHist.applySettings();
	  });

	   tnSlider.noUiSlider.on("change" , function(values){
	   		value = Number(values);
	   		probHist.tnFilter = value;
	   		probHist.applySettings();
	  });

	});

});




