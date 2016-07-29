function Settings(){

  // define panes
  this.confPane = d3.select(".confusion-matrix");
  this.tablePane = d3.select(".data-table");
  this.pagerPane = d3.select(".pager")
  this.featurePane = d3.select(".box-plots");
  this.histPane = d3.select(".class-histogram");
  this.probPane = d3.select(".probability-histograms");


	// state of data switches
	this.probDataOptions = {
	    tp : true,
	    tn : true,
	    fp : true,
	    fn : true
	}

	//probability limits
  	this.probLimits = [0.00 , 1.00];

  	//tn filter slider value
  	this.probtnFilter = 0.00;

  	//tp filter probability value
  	this.probtpFilter = 1.00;

  	// bins count in probability histograms
  	this.probbins = 10;

    // //Apply switches on summary
    // this.switchesOnSummary = true;

    // //Apply switches on summary
    // this.filtersOnSummary = true;

    






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



    this.tableSize = 500;

    this.tableCurrentPage = 1;

    this.rightProbBounds = [0.00 , 1.00];


    this.updateProbBounds = function(upper){
      binArray = this.getBinValues();
      i = (binArray).indexOf(upper);
      lower = (i==0)? this.probLimits[0] : binArray[--i];
      this.rightProbBounds = [lower , upper];
    };

    this.rightFilteredData = function(data) {
      pr = this.rightProbBounds;
      cls = this.rightClass;
      res = this.rightResult;
      label = "L-"+cls;
      prob = "P-"+cls;

      filteredData = (data).filter(function(d){
              if(res != "all" && d[label] != res.toUpperCase()) return false;
              if(d[prob] <= pr[0] || d[prob] > pr[1]) return false;
              return true;
              });

      return (filteredData);
    };

    this.rightClass = "all";

    this.rightResult = "all";

    this.boxIQR = 1.5;

    this.centerOverlap = false;

}