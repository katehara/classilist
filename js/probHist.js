function ProbHist(model , pane) {

  this.data = model.data;
  this.headers = model.headers;
  this.nCols = model.nCols;
  this.features = model.features;
  this.probs = model.probs;
  this.target = model.target;
  this.predicted = model.predicted;
  this.classNames = model.classNames;
  this.dataOptions = {
    tp : true,
    tn : true,
    fp : true,
    fn : true
  }
  this.probLimits = [0.00 , 1.00];
  this.tnFilter = 0.00;
  this.tpFilter = 1.00;
  this.bins = 10;
  this.histData = [];
  this.max = {
    right : 0,
    left : 0
  }

  w=(pane.node().getBoundingClientRect().width - 30)/3;
  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 30
  },
  width = Math.max(200,w) - margin.left - margin.right,
  height = Math.max(200,w) - margin.top - margin.bottom;

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

  // prepare histogram data into bins and assign it to property -> histData[]
  this.prepareData = function(){
    data = this.data;
    classes = this.classNames;
    bins = this.bins;
    this.histData = [];
    this.max.right = this.max.left = 0;
    binSize = 1/bins;
    binValues = this.getBinValues();

    for(i in classes){
      name = "L-"+classes[i];
      prob = "P-"+classes[i];

      preparedData = [];
      for(j in binValues){
        preparedData.push({
          probability : binValues[j],
          tn : 0,
          tp : 0,
          fn : 0,
          fp : 0,
        });
      }
      for(j in data){
        for(k in preparedData){

          if(data[j][name].toLowerCase() == "tn" && data[j][prob] < this.tnFilter){
            break;
          }

          if(data[j][name].toLowerCase() == "tp" && data[j][prob] > this.tpFilter){
            break;
          }
          
          if(data[j][prob] < preparedData[k].probability){ 
            if(this.dataOptions[data[j][name].toLowerCase()] && data[j][prob] >= this.probLimits[0])
              preparedData[k][data[j][name].toLowerCase()]++;            
            
            break;
          }

        }
      }

      // console.log(name);
      this.histData.push(preparedData);
      this.max.left = Math.max(this.max.left, d3.max(preparedData , function(d){return (d.tn+d.fn);} ));
      this.max.right = Math.max(this.max.right, d3.max(preparedData , function(d){return (d.tp+d.fp);} ));
    }

  }

  // make all probibility histograms
  this.makeHistograms = function(){
    pane.selectAll("*").remove();
    for(i in this.histData){
      this.probabilityHistogram(this.histData[i], this.classNames[i]);
    }
  }



  // make a probability histogram
  this.probabilityHistogram = function(data, name){
    
    scl = Math.max(this.max.left , this.max.right);
    classtp = name + " bar-tp";
    classtn = name + " bar-tn";
    classfp = name + " bar-fp";
    classfn = name + " bar-fn";
       
    var x = d3.scale.linear()
            .domain([-scl , scl])
            .rangeRound([0, width]);

    var y = d3.scale.ordinal()
            .domain(data.map(function(d){ return d.probability;}))
            .rangeRoundBands([height , 0] , 0.1);

    var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(1)
                .tickFormat(function(d){ 
                  f = Math.abs(d);
                  if(f>=1000) return(Math.round(f/1000) + "K");
                  else return f;
                });
    
    var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickValues(y.domain().filter(function(d,i){ 
                      if(this.bins <= 15) return true;
                      return !(i%(2)); } ))
                .tickSize(0)
                .tickPadding(3);

    var yAxis2 = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat("")
                .tickSize(-1);

    var svg = pane.append("svg")
              .attr("class" , "svg-"+name)
              .attr("width" , width + margin.left + margin.right)
              .attr("height" , height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
    svg.call(tipTP);
    svg.call(tipFP);
    svg.call(tipFN);
    svg.call(tipTN);

    var tp = svg.selectAll("."+name + ".bar-tp")
              .data(data, function(d , i){return d.probability;})
              .enter().append("rect")
              .attr("class" , classtp)
              .attr("x" , function(d){return x(0);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipTP.show)
              .on('mouseout', tipTP.hide);

    var fp = svg.selectAll("."+name + ".bar-fp")
              .data(data, function(d , i){return d.probability;})
              .enter().append("rect")
              .attr("class" , classfp)
              .attr("x" , function(d){return x(d.tp);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFP.show)
              .on('mouseout', tipFP.hide);

    var fn = svg.selectAll("."+name + ".bar-fn")
              .data(data, function(d , i){return d.probability;})
              .enter().append("rect")
              .attr("class" , classfn)
              .attr("x" , function(d){return x(-d.fn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFN.show)
              .on('mouseout', tipFN.hide);

    var tn = svg.selectAll("."+name + ".bar-tn")
              .data(data, function(d , i){return d.probability;})
              .enter().append("rect")
              .attr("class" , classtn)
              .attr("x" , function(d){return x(-d.fn-d.tn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipTN.show)
              .on('mouseout', tipTN.hide);

    svg.append("g")
      .attr("class" , name + " x axis")
      .attr("transform" , "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)" );

    svg.append("g")
      .attr("class" , name + " y axis")
      .attr("transform" , "translate(0,0)")
      .call(yAxis);

    svg.append("g")
      .attr("class" , name + " y axis2")
      .attr("transform" , "translate(" + x(0) +",0)")
      .call(yAxis2);

    svg.append("text")
        .attr("class" , "class-label")
        .attr("x" , "0")
        .attr("y" , -12)
        .attr("dy" , ".5em")
        .text(name);
  }

  this.prepareData();
  this.makeHistograms();

  this.applySettings = function(){   
    this.prepareData();
    xTransition = false;
    if(scl != Math.max(this.max.left , this.max.right)) xTransition = true;
    scl = Math.max(this.max.left , this.max.right);



    for(i in this.histData){   

      newd = this.histData[i];
      newname = this.classNames[i];

      classtp = newname + " bar-tp";
      classtn = newname + " bar-tn";
      classfp = newname + " bar-fp";
      classfn = newname + " bar-fn";

      var transitionScale = pane.transition().duration(500);


      var x = d3.scale.linear()
              .domain([-scl , scl])
              .rangeRound([0, width]);

      var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickSize(1)
                  .tickFormat(function(d){ 
                    f = Math.abs(d);
                    if(f>=1000) return(Math.round(f/1000) + "K");
                    else return f;
                  });

      var y = d3.scale.ordinal()
              .domain(newd.map(function(d){ return d.probability;}))
              .rangeRoundBands([height , 0] , 0.1);
      
      var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left")
                  .tickValues(y.domain().filter(function(d,i){ 
                    if(this.bins <= 15) return true;
                    return !(i%(2)); } ))
                  .tickSize(0)
                  .tickPadding(3);

      var yAxis2 = d3.svg.axis()
                  .scale(y)
                  .orient("left")
                  .tickFormat("")
                  .tickSize(-1);

      if(xTransition){
        transitionScale.select("."+newname+".x.axis")
                  .call(xAxis)
                  .selectAll("text")  
                      .style("text-anchor", "end")
                      .attr("dx", "-.8em")
                      .attr("dy", ".15em")
                      .attr("transform", "rotate(-90)" );
      }

      transitionScale.select("."+newname+".y.axis")
                  .call(yAxis)

      transitionScale.select("."+newname+".y.axis2")
                  .call(yAxis2)

      var recttp = pane.select(".svg-"+newname).select("g")
                    .selectAll("."+newname+".bar-tp")
                    .data(newd, function(d , i){return d.probability;});

      recttp.enter().append("rect")
            .attr("class" , classtp)
            .on('mouseover', tipTP.show)
            .on('mouseout', tipTP.hide);

      recttp.transition()
                    .duration(1000)                    
                    .attr("x" , function(d){return x(0);})
                    .attr("y" , function(d){return y(d.probability);})
                    .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
                    .attr("height" , function(d){return y.rangeBand()});                    

      recttp.exit().remove();

      var recttn = pane.select(".svg-"+newname).select("g")
                    .selectAll("."+newname+".bar-tn")
                    .data(newd, function(d , i){return d.probability;});


      recttn.enter().append("rect")
             .attr("class" , classtn)
             .on('mouseover', tipTN.show)
              .on('mouseout', tipTN.hide);

      recttn.transition()
                    .duration(1000)                    
                    .attr("x" , function(d){return x(-d.fn-d.tn);})
                    .attr("y" , function(d){return y(d.probability);})
                    .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
                    .attr("height" , function(d){return y.rangeBand()});

      recttn.exit().remove();

      var rectfn = pane.select(".svg-"+newname).select("g")
                    .selectAll("."+newname+".bar-fn")
                    .data(newd, function(d , i){return d.probability;});

      rectfn.enter().append("rect")
            .attr("class" , classfn)
            .on('mouseover', tipFN.show)
            .on('mouseout', tipFN.hide);


      rectfn.transition()
                    .duration(1000)                    
                    .attr("x" , function(d){return x(-d.fn);})
                    .attr("y" , function(d){return y(d.probability);})
                    .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
                    .attr("height" , function(d){return y.rangeBand()});

      rectfn.exit().remove();

      var rectfp = pane.select(".svg-"+newname).select("g")
                    .selectAll("."+newname+".bar-fp")
                    .data(newd, function(d , i){return d.probability;});

      rectfp.enter().append("rect")
            .attr("class" , classfp)
            .on('mouseover', tipFP.show)
            .on('mouseout', tipFP.hide);

      rectfp.transition()
                    .duration(1000)                    
                    .attr("x" , function(d){return x(d.tp);})
                    .attr("y" , function(d){return y(d.probability);})
                    .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
                    .attr("height" , function(d){return y.rangeBand()});                    

      rectfp.exit().remove();

      pane.select("."+newname+".x.axis").moveToFront();

      pane.select("."+newname+".y.axis2").moveToFront();
                      
    }
  }
}// end of class