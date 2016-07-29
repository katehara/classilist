function Overlaps(model, settings, table, box, probs, hist, conf ){


	data = model.data;
	var overlapData , probData, classData, tableData, boxData, confData; 
	// probMax = settings.overlapProbLimits[0],
	// probMin = settings.overlapProbLimits[1],
	// selClass = settings = overlapClass;

	this.prepareData = function(){


	}

	this.overlapProbHist = function(){

	}

	this.overlapBoxFeatures = function(){

	}

	this.overlapClassHist = function(){

	}

	this.overlapConfMat = function(){

	}

	this.overlapTable = function(){

	}

	this.overlapActivate = function(){

	}

	this.overlapDeactivate = function(){

	}
}

this.overlapToggle = function(set){
    if(set){
      d3.selectAll(".bar").classed("dont-display", true);//style("display" , "none");//"fill" , "#bdbdbd");
      // d3.selectAll(".overlap-bar").attr("display" , "");
      // d3.select(".switch-over").property('checked', true);
      _self.overlapUpdate();
      d3.selectAll(".overlap-bar").classed("dont-display", false);//style("display" , "");
      d3.selectAll(".collapsible-body").selectAll("*").attr("disabled" , "disabled");
      d3.selectAll(".collapsible-body").selectAll("a").classed("disabled", true);



    }

    else {
      d3.selectAll(".overlap-bar").remove();
      d3.selectAll(".d3-tip").style("opacity" , "0");
      d3.selectAll(".bar").classed("dont-display", false);
      d3.selectAll(".collapsible-body").selectAll("*").attr("disabled" , null);
      d3.selectAll(".collapsible-body").selectAll("a").classed("disabled", false);
    }

  }

  this.overlapUpdate = function(){
    data = table.tableData;
    classes = model.classNames;
    this.overData = [];
    binSize = 1/settings.bins;
    binValues = settings.getBinValues();

    for(i=0,len=classes.length; i<len ; i++){
      classname = classes[i];
      name = "L-"+classes[i];
      prob = "P-"+classes[i];

      preparedData = [];
      for(j = 0,lenj=binValues.length; j<lenj ; j++){
        preparedData.push({
          probability : binValues[j], // upper value for all buckets
          tn : 0,
          tp : 0,
          fn : 0,
          fp : 0,
        });
      }
      for(j = 0,lenj=data.length; j<lenj ; j++){
        for(k = 0,lenk=preparedData.length; k<lenk ; k++){

              // if(data[j][name].toLowerCase() == "tn" && data[j][prob] < settings.tnFilter){
              // break;
              // }

              // if(data[j][name].toLowerCase() == "tp" && data[j][prob] > settings.tpFilter){
              //   break;
              // }
            
              if(
                // settings.dataOptions[data[j][name].toLowerCase()] && 
                data[j][prob] >= settings.probLimits[0] && data[j][prob] <= preparedData[k].probability){
                    preparedData[k][data[j][name].toLowerCase()]++;          
              
                break;
              }
          }
        }
        var svg = pane.select(".svg-"+classname).select("g");

        var overTP = svg.selectAll("."+classname + ".overlap-bar.overlap-tp")
              .data(preparedData, function(d , i){return d.probability;})

        overTP.enter().append("rect")
              .attr("class" , classname + " overlap-bar overlap-tp")
              .attr("x" , function(d){return x(0);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipTP.show)
              .on('mouseout', tipTP.hide)
              .on("click" , function(){
              _self.overlapToggle(false);
              });


        var overFP = svg.selectAll("."+classname + ".overlap-bar.overlap-fp")
              .data(preparedData, function(d , i){return d.probability;})

        overFP.enter().append("rect")
              .attr("class" , classname + " overlap-bar overlap-fp")
              .attr("x" , function(d){return x(d.tp);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFP.show)
              .on('mouseout', tipFP.hide)
              .on("click" , function(){
              _self.overlapToggle(false);
              });

        var overFN = svg.selectAll("."+classname + ".overlap-bar.overlap-fn")
              .data(preparedData, function(d , i){return d.probability;})

        overFN.enter().append("rect")
              .attr("class" , classname + " overlap-bar overlap-fn")
              .attr("x" , function(d){return x(-d.fn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFN.show)
              .on('mouseout', tipFN.hide)
              .on("click" , function(){
              _self.overlapToggle(false);
              });;


        var overTN = svg.selectAll("."+classname + ".overlap-bar.overlap-tn")
              .data(preparedData, function(d , i){return d.probability;})

        overTN.enter().append("rect")
              .attr("class" , classname + " overlap-bar overlap-tn")
              .attr("x" , function(d){return x(-d.fn-d.tn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipTN.show)
              .on('mouseout', tipTN.hide)
              .on("click" , function(){
              _self.overlapToggle(false);
              });;


        d3.selectAll(".overlap-bar").classed("dont-display", true);    
    }
  }
