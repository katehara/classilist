$(document).ready(function(){


	var centralPane = d3.select(".central-pane");
		
	d3.csv("data/rapidminer.csv", function (error, data) {

		var model = new Model(data);
		// console.log(model.features);
		// console.log(model.probs);
		// console.log(model.target);
		// console.log(model.predicted);
		// console.log(model.classNames);
		// console.log(model.confusionMatrix);

		var  hist = model.getHistograms(); 
		// console.log(hist);

	});

});
