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
  	this.probtnFilter = [0.10];

  	//tp filter probability value
  	this.probtpFilter = [1.00];

    //tn filter slider value
    this.probtnDefaultFilter = [0.10];

    //tp filter probability value
    this.probtpDefaultFilter = [1.00];


  	// bins count in probability histograms
  	this.probbins = 10;

    this.mintnFilter = 0.0;

    this.mintpFilter = 0.5;

    this.maxtnFilter = 0.5;

    this.maxtpFilter = 1.0;

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



    this.matrixDiagonals = true;

    // 0 : color scale ; fixed dimensions
    // 1 : fixed color ; dimension scale
    this.matrixMode = 0;

    this.tableSize = 500;

    this.tableCurrentPage = 1;


    this.boxIQR = 1.5;

    this.opl = 0.00;
    this.oph = 1.00;
    this.oca = "all";
    this.ocp = "all";
    this.ors = "all"; 

}