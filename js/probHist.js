function ProbHist(model , settings ){

  var _self = this;
  this.data = model.data;
  this.classNames = model.classNames;
  this.histData = [];
  this.max = {
    right : 0,
    left : 0
  }

  pane = settings.probPane;

  var x, y, xAxis, yAxis, yAxis2;

  w=(pane.node().getBoundingClientRect().width - 30)/4;
  var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  width = Math.max(198,w) - margin.left - margin.right,
  height = Math.max(200,w) - margin.top - margin.bottom;

// console.log(navigator.appName);
  // if ($.browser.mozilla) {
  //   width = Math.max(180,w) - margin.left - margin.right,
  //   height = Math.max(180,w) - margin.top - margin.bottom;
  // }

  d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };  

  var tipTP = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.probability + "</span><br><span>TP:</span> <span>" + d.tp + "</span>";
            })
  var tipFP = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.probability + "</span><br><span>FP:</span> <span>" + d.fp + "</span>";
            })
  var tipFN = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.probability + "</span><br><span>FN:</span> <span>" + d.fn + "</span>";
            })
  var tipTN = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.probability + "</span><br><span>TN:</span> <span>" + d.tn + "</span>";
            })

  // prepare bin boundaries acc to no of bins
  this.getBinValues = function(){
      bins = settings.probbins;
      array = [];
      k = (settings.probLimits[1] - settings.probLimits[0])/bins;
      num=0;
      for(i=1;i<=bins;i++){
        num = i*k;
        num = Math.round((settings.probLimits[0] + num) * 100) / 100;
        array.push( num);
      }
      return array;
  }

  // prepare histogram data into bins and assign it to property -> histData[]
  this.prepareData = function(){
    data = this.data;
    classes = this.classNames;
    bins = settings.probbins;
    this.histData = [];
    this.max.right = this.max.left = 0;
    binValues = this.getBinValues();

    for(i=0,len=classes.length; i<len ; i++){
      name = "L-"+classes[i];
      prob = "P-"+classes[i];

      preparedData = [];
      for(j = 0,lenj=binValues.length; j<lenj ; j++){
        l = (j==0)? (settings.probLimits[0]): Math.round((binValues[j-1]+0.01)*100)/100;
        preparedData.push({
          name : classes[i],
          lowProb : l,
          probability : binValues[j], // upper value for all buckets
          tn : 0,
          tp : 0,
          fn : 0,
          fp : 0,
        });
      }
      for(j = 0,lenj=data.length; j<lenj ; j++){
        for(k = 0,lenk=preparedData.length; k<lenk ; k++){

          if(data[j][name].toLowerCase() == "tn" && data[j][prob] < settings.probtnFilter){
            break;
          }

          if(data[j][name].toLowerCase() == "tp" && data[j][prob] > settings.probtpFilter){
            break;
          }
          
          if(settings.probDataOptions[data[j][name].toLowerCase()] && 
            data[j][prob] >= preparedData[k].lowProb && data[j][prob] <= preparedData[k].probability){
              preparedData[k][data[j][name].toLowerCase()]++;          
            
            break;
          }
        }
      }

      this.histData.push(preparedData);
      this.max.left = Math.max(this.max.left, d3.max(preparedData , function(d){return (d.tn+d.fn);} ));
      this.max.right = Math.max(this.max.right, d3.max(preparedData , function(d){return (d.tp+d.fp);} ));
    }

  }

  // make all probibility histograms
  this.makeHistograms = function(){
    // pane.selectAll("*").remove();
    scl = Math.max(this.max.left , this.max.right);
    x = d3.scale.linear()
            .domain([-scl , scl]).nice()
            .rangeRound([0, width]);

    y = d3.scale.ordinal()
            .domain(((this.histData)[0]).map(function(d){ return d.probability;}))
            .rangeRoundBands([height , 0] , 0.1);

    xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(5)
                .tickSize(0.3)
                .tickFormat(function(d){ 
                  f = Math.abs(d);
                  if(f>=1000) return(Math.round(f/1000) + "K");
                  else return f;
                });
    
    yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickValues(y.domain().filter(function(d,i){ 
                  if(i == 0 || i == (settings.probbins-1) || i == Math.floor((settings.probbins)/2)) return true;
                  return false;
                }))
                .tickSize(0)
                .tickPadding(3);

    yAxis2 = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat("")
                .tickSize(0.3);

                console.log(this.histData);

    var svg = pane.selectAll(".svg-probHist")
              .data(this.histData)
              .enter().append("svg")
              .attr("class" , "svg-probHist")
              .attr("width" , width + margin.left + margin.right)
              .attr("height" , height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tipTP);
    svg.call(tipFP);
    svg.call(tipFN);
    svg.call(tipTN);

    svg.append("text")
              .attr("class" , "class-label")
              .attr("x" , "0")
              .attr("y" , -12)
              .attr("dy" , ".5em")
              .text(function(d , i){return (d[0].name)});

    var tp = svg.selectAll(".bar-tp")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-tp bar";})
              .attr("x" , function(d){return x(0);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

    var fp = svg.selectAll(".bar-fp")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-fp bar";})
              .attr("x" , function(d){return x(d.tp);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

    var fn = svg.selectAll(".bar-fn")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-fn bar";})
              .attr("x" , function(d){return x(-d.fn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

    var tn = svg.selectAll(".bar-tn")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-tn bar";})
              .attr("x" , function(d){return x(-d.fn-d.tn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

    svg.append("g")
      .attr("class" , "x axis")
      .attr("transform" , "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class" , "y axis")
      .attr("transform" , "translate(0,0)")
      .call(yAxis);

    svg.append("g")
      .attr("class" , "y axis2")
      .attr("transform" , "translate(" + x(0) +",0)")
      .call(yAxis2);
    
  }
  
  this.bindEvents = function() {

      d3.selectAll(".bar-tp")      
        .on('mouseover', tipTP.show)
        .on('mouseout', tipTP.hide)
        .on("click" , function(){
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);

        // settings.rightResult = "tp";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });

      d3.selectAll(".bar-tn")
        .on('mouseover', tipTN.show)
        .on('mouseout', tipTN.hide)
        .on("click" , function(){
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);
        // console.log(settings.rightProbBounds);

        // settings.rightResult = "tn";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });

      d3.selectAll(".bar-fp")
        .on('mouseover', tipFP.show)
        .on('mouseout', tipFP.hide)
        .on("click" , function(){
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);

        // settings.rightResult = "fp";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });

      d3.selectAll(".bar-fn")
        .on('mouseover', tipFN.show)
        .on('mouseout', tipFN.hide)
        .on("click" , function(){
        // fullClass = d3.select(this).attr("class");
        // shortClass = fullClass.substr(0, fullClass.indexOf(" "));
        // settings.rightClass = shortClass;

        // prob = d3.select(this).data()[0].probability;
        // settings.updateProbBounds(prob);
        // console.log(settings.rightProbBounds);

        // settings.rightResult = "fn";
        // // settings.centerOverlap = true;

        // table.makeTable();
        // boxPlots.applySettings();
        // _self.overlapUpdate();
        // _self.overlapToggle(true);
      });
  }

  this.prepareData();
  this.makeHistograms();
  this.bindEvents();

  this.applySettings = function(){ 
    pane= settings.probPane;
    this.prepareData();
    scl = Math.max(this.max.left , this.max.right);
    x = d3.scale.linear()
            .domain([-scl , scl]).nice()
            .rangeRound([0, width]);

    y = d3.scale.ordinal()
            .domain(((this.histData)[0]).map(function(d){ return d.probability;}))
            .rangeRoundBands([height , 0] , 0.1);

    xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(5)
                .tickSize(0.3)
                .tickFormat(function(d){ 
                  f = Math.abs(d);
                  if(f>=1000) return(Math.round(f/1000) + "K");
                  else return f;
                });
    
    yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickValues(y.domain().filter(function(d,i){
                  if(i == 0 || i == (settings.probbins-1) || i == Math.floor((settings.probbins)/2)) return true;
                  return false;
                }))
                .tickSize(0)
                .tickPadding(3);

    yAxis2 = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat("")
                .tickSize(0.3);

// pane.selectAll("*").remove();

    var svg = pane.selectAll("svg.svg-probHist")
              .data(this.histData)

        svg = svg.select("g");

              // .enter().append("svg")
              // .attr("class" , "svg-probHist")
              // .attr("width" , width + margin.left + margin.right)
    //           .attr("height" , height + margin.top + margin.bottom)
    //           .append("g")
    //             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var transitionScale = svg.transition().duration(500);

                        transitionScale.select(".x.axis")
                        .call(xAxis);

                        transitionScale.select(".y.axis")
                        .call(yAxis)

                        transitionScale.select(".y.axis2")
                        .call(yAxis2)


    // svg.append("text")
    //           .attr("class" , "class-label")
    //           .attr("x" , "0")
    //           .attr("y" , -12)
    //           .attr("dy" , ".5em")
    //           .text(function(d , i){return (d[0].name)});

    var tp = svg.selectAll(".bar-tp")
              .data(function(d){return d;})

              tp.enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-tp bar";})

              tp.transition().duration(500)
              .attr("x" , function(d){return x(0);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

              tp.exit().remove();

    var fp = svg.selectAll(".bar-fp")
              .data(function(d){return d;})

              fp.enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-fp bar";})

              fp.transition().duration(500)
              .attr("x" , function(d){return x(d.tp);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

              fp.exit().remove();

    var fn = svg.selectAll(".bar-fn")
              .data(function(d){return d;})

              fn.enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-fn bar";})
              
              fn.transition().duration(500)
              .attr("x" , function(d){return x(-d.fn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

              fn.exit().remove();

    var tn = svg.selectAll(".bar-tn")
              .data(function(d){return d;})

              tn.enter().append("rect")
              .attr("class" , function(d){return d.name+" bar-tn bar";})

              tn.transition().duration(500)
              .attr("x" , function(d){return x(-d.fn-d.tn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()});

              tn.exit().remove();

    this.bindEvents();

    // pane.selectAll("g .x.axis")
    //   .call(xAxis);

    // pane.selectAll("g .y.axis")
    //   .call(yAxis);

    // pane.selectAll("g .y.axis2")
    //   .call(yAxis2);

    // xTransition = false;
    // if(scl != Math.max(this.max.left , this.max.right)) xTransition = true;
    // scl = Math.max(this.max.left , this.max.right);

    // for(i=0,len=(this.histData).length; i<len ; i++){   

    //   newd = this.histData[i];
    //   newname = this.classNames[i];

    //   classtp = newname + " bar-tp bar";
    //   classtn = newname + " bar-tn bar";
    //   classfp = newname + " bar-fp bar";
    //   classfn = newname + " bar-fn bar";

    //   x = d3.scale.linear()
    //           .domain([-scl , scl]).nice()
    //           .rangeRound([0, width]);

    //   var xAxis = d3.svg.axis()
    //               .scale(x)
    //               .orient("bottom")
    //               .ticks(5)
    //               .tickSize(1)
    //               .tickFormat(function(d){ 
    //                 f = Math.abs(d);
    //                 if(f>=1000) return(Math.round(f/1000) + "K");
    //                 else return f;
    //               });

    //   y = d3.scale.ordinal()
    //           .domain(newd.map(function(d){ return d.probability;}))
    //           .rangeRoundBands([height , 0] , 0.1);
      
    //   var yAxis = d3.svg.axis()
    //               .scale(y)
    //               .orient("left")
    //               .tickValues(y.domain().filter(function(d,i){ 
    //                 if(i == 0 || i == (settings.bins-1) || i == Math.round((settings.bins-1)/2) || i == Math.round((settings.bins-1)/4) || i == Math.round(3*(settings.bins-1)/4)) 
    //                   return true;
    //                 return false; 
    //               }))
    //               .tickSize(0)
    //               .tickPadding(3);

    //   var yAxis2 = d3.svg.axis()
    //               .scale(y)
    //               .orient("left")
    //               .tickFormat("")
    //               .tickSize(-1);

      

    //   var recttp = pane.select(".svg-"+newname).select("g")
    //                 .selectAll("."+newname+".bar-tp")
    //                 .data(newd, function(d , i){return d.probability;});

    //   recttp.enter().append("rect")
    //         .attr("class" , classtp);

    //   recttp.transition()
    //                 .duration(1000)                    
    //                 .attr("x" , function(d){return x(0);})
    //                 .attr("y" , function(d){return y(d.probability);})
    //                 .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
    //                 .attr("height" , function(d){return y.rangeBand()});                    

    //   recttp.exit().remove();

    //   var recttn = pane.select(".svg-"+newname).select("g")
    //                 .selectAll("."+newname+".bar-tn")
    //                 .data(newd, function(d , i){return d.probability;});

    //   recttn.enter().append("rect")
    //          .attr("class" , classtn);

    //   recttn.transition()
    //                 .duration(1000)                    
    //                 .attr("x" , function(d){return x(-d.fn-d.tn);})
    //                 .attr("y" , function(d){return y(d.probability);})
    //                 .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
    //                 .attr("height" , function(d){return y.rangeBand()});

    //   recttn.exit().remove();

    //   var rectfn = pane.select(".svg-"+newname).select("g")
    //                 .selectAll("."+newname+".bar-fn")
    //                 .data(newd, function(d , i){return d.probability;});

    //   rectfn.enter().append("rect")
    //         .attr("class" , classfn);

    //   rectfn.transition()
    //                 .duration(1000)                    
    //                 .attr("x" , function(d){return x(-d.fn);})
    //                 .attr("y" , function(d){return y(d.probability);})
    //                 .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
    //                 .attr("height" , function(d){return y.rangeBand()});

    //   rectfn.exit().remove();

    //   var rectfp = pane.select(".svg-"+newname).select("g")
    //                 .selectAll("."+newname+".bar-fp")
    //                 .data(newd, function(d , i){return d.probability;});

    //   rectfp.enter().append("rect")
    //         .attr("class" , classfp);

    //   rectfp.transition()
    //                 .duration(1000)                    
    //                 .attr("x" , function(d){return x(d.tp);})
    //                 .attr("y" , function(d){return y(d.probability);})
    //                 .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
    //                 .attr("height" , function(d){return y.rangeBand()});                    

    //   rectfp.exit().remove();

    //   pane.select("."+newname+".x.axis").moveToFront();

    //   pane.select("."+newname+".y.axis2").moveToFront();

    //   this.bindEvents();
                      
    // }
  }
}// end of class