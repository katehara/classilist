$(document).ready(function(){

		
	d3.csv("data/rapidminer.csv", function (error, data) {

		var model = new Model(data);
		// console.log(model.features);
		// console.log(model.probs);
		// console.log(model.target);
		// console.log(model.predicted);
		// console.log(model.classNames);
		// console.log(model.confusionMatrix);

	});

});
