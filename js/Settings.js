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

    this.getBinValues = function(){
      bins = this.bins;
      array = [];
      k = (this.probLimits[1] - this.probLimits[0])/bins;
      num=0;
      for(i=1;i<=bins;i++){
        num = i*k;
        num = Math.round((this.probLimits[0] + num) * 100) / 100;
        array.push( num);
      }
      return array;
    }






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