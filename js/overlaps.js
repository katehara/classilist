function Overlaps(model, settings, table, box, probs, hist, conf ){


	data = model.data;
	var overlapData , probData, classData, tableData, boxData, confData; 
  var status = 0;

  var problow , probhigh , acls , pcls , res ;

	this.prepareData = function(){
    problow = settings.opl;
    probhigh = settings.oph;
    acls = settings.oca;
    pcls = settings.ocp;
    res = settings.ors;


    //table data 
    if(acls != "all") 
        tableData = data.filter(function(d){
        
        if(status == 3) if(d[model.target] != acls) return false;

        if(status == 3) if(pcls != "all" && d[model.predicted] != pcls) return false;

        if(status == 2) if(d["P-"+acls] < problow || d["P-"+acls] > probhigh) return false;

        if(status == 1 || status == 2) if(d["L-"+acls].toLowerCase() != res) return false;

        return true;

      });

    else tableData = data;





	}

	this.overlapProbHist = function(){
    pane = settings.probPane;
    pane.selectAll(".bar").classed("filled-gray" , true);
    probs.overlap(tableData);

	}

	this.overlapBoxFeatures = function(){
    pane = settings.featurePane;
    // pane.selectAll(".feature-group rect").classed("stroked-gray" , true);
    // pane.selectAll(".feature-group line").classed("stroked-gray" , true);
    pane.selectAll(".feature-group-selected").classed("dont-display" , false);
    box.overlap(tableData);

	}

	this.overlapClassHist = function(){
    pane = settings.histPane;
    pane.selectAll("rect").classed("filled-gray" , true);
    hist.overlap(tableData);


	}

	this.overlapConfMat = function(){
    pane = settings.confPane;
    pane.selectAll("rect").classed("filled-gray" , true);
    conf.overlap(tableData);

	}

	this.overlapTable = function(){
    pane = settings.tablePane;
    table.makeTable(tableData);
	}

	this.overlapActivate = function(from){
    status = from;
    d3.selectAll(".collapsible-body").selectAll("*").attr("disabled" , "disabled");
    d3.selectAll(".collapsible-body").selectAll(".clear").attr("disabled", null);
    d3.selectAll(".control-matrix").selectAll("*").attr("disabled" , "disabled");
    this.prepareData();
    this.overlapTable();
    this.overlapProbHist();
    this.overlapBoxFeatures();
    this.overlapConfMat();
    this.overlapClassHist();
	}

	this.overlapDeactivate = function(){
    table.makeTable(table.data);
    d3.selectAll(".collapsible-body").selectAll("*").attr("disabled" , null);
    d3.selectAll(".control-matrix").selectAll("*").attr("disabled" , null);
    d3.selectAll(".filled-gray").classed("filled-gray" , false);
    d3.selectAll(".stroked-gray").classed("stroked-gray" , false);
    d3.selectAll(".feature-group-selected").classed("dont-display" , true);
    d3.selectAll(".d3-tip").style("opacity" , "0");
    d3.selectAll(".overlap").remove();

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
