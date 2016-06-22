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
			probHist.updateSwitch();
		});

		d3.select(".switch-fp").on("change", function(d){
			probHist.dataOptions.fp = this.checked;
			probHist.updateSwitch();
		});

		d3.select(".switch-tn").on("change", function(d){
			probHist.dataOptions.tn = this.checked;
			probHist.updateSwitch();
		});

		d3.select(".switch-fn").on("change", function(d){
			probHist.dataOptions.fn = this.checked;
			probHist.updateSwitch();
		});

		d3.select(".reset").on("click" , function(){
			bins = 10;
			probs = [0.00 , 1.00];
			binSlider.noUiSlider.set(bins);
			probabilitySlider.noUiSlider.set(probs);
			probHist.applySettings(bins , probs);
		});

		d3.select(".apply").on("click" , function(){
			bins = binSlider.noUiSlider.get();
			probs = probabilitySlider.noUiSlider.get();
			probHist.applySettings(bins , probs);
		});

	});

});




