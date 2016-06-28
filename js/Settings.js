function Settings(){
	// state of data switches
	this.dataOptions = {
	    tp : true,
	    tn : true,
	    fp : true,
	    fn : true
	}

	//probability limits
  	this.probLimits = [0.00 , 1.00];

  	//tn filter slider value
  	this.tnFilter = 0.00;

  	//tp filter probability value
  	this.tpFilter = 1.00;

  	// bins count in probability histograms
  	this.bins = 10;






  	// To change the interface values

  	// max bins value on slider
  	this.maxBins = 30;

  	// min bins value on slider
  	this.minBins = 1;

  	// bin slider step
  	this.stepBins = 1;

  	// min probability value on slider
  	this.minProb = 0.00;

  	// max probability value on slider
  	this.maxProb = 1.00;

  	// probability slider step
  	this.stepProb = 0.01;

}