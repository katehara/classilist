function ProbHist(model , settings , parent){

  var _self = this;
  this.data = model.data;
  this.classNames = model.classNames;
  this.histData = this.newData = [];
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

  d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };  

  var tipTP = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.lowProb + " - " + + d.probability + "</span><br><span>TP:</span> <span>" + d.tp + "</span>";
            })
  var tipFP = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.lowProb + " - " + + d.probability + "</span><br><span>FP:</span> <span>" + d.fp + "</span>";
            })
  var tipFN = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.lowProb + " - " + d.probability + "</span><br><span>FN:</span> <span>" + d.fn + "</span>";
            })
  var tipTN = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<span>Probability:</span> <span>" + d.lowProb + " - " + + d.probability + "</span><br><span>TN:</span> <span>" + d.tn + "</span>";
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
  this.prepareData = function(data){
    // data = this.data;
    classes = this.classNames;
    bins = settings.probbins;
    this.newData = [];
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

      this.newData.push(preparedData);
      this.max.left = Math.max(this.max.left, d3.max(preparedData , function(d){return (d.tn+d.fn);} ));
      this.max.right = Math.max(this.max.right, d3.max(preparedData , function(d){return (d.tp+d.fp);} ));
    }

  }

  // make all probibility histograms
  this.makeHistograms = function(){
    pane = settings.probPane;
    pane.selectAll("*").remove();

    for(i=0,len=(this.newData).length; i<len ; i++){
      this.histData[i] = this.newData[i];
    }
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
          if(!(d3.select(this).classed("filled-gray"))){
            obj = d3.select(this).data()[0]
            settings.oca = obj.name;
            settings.ocp = "all";
            settings.opl = obj.lowProb;
            settings.oph = obj.probability;
            settings.ors = "tp";
            parent.overlaps.overlapActivate(2);
          }
      });

      d3.selectAll(".bar-tn")
        .on('mouseover', tipTN.show)
        .on('mouseout', tipTN.hide)
        .on("click" , function(){
          if(!(d3.select(this).classed("filled-gray"))){
            obj = d3.select(this).data()[0]
            settings.oca = obj.name;
            settings.ocp = "all";
            settings.opl = obj.lowProb;
            settings.oph = obj.probability;
            settings.ors = "tn";
            parent.overlaps.overlapActivate(2);
          }
      });

      d3.selectAll(".bar-fp")
        .on('mouseover', tipFP.show)
        .on('mouseout', tipFP.hide)
        .on("click" , function(){
          if(!(d3.select(this).classed("filled-gray"))){
            obj = d3.select(this).data()[0]
            settings.oca = obj.name;
            settings.ocp = "all";
            settings.opl = obj.lowProb;
            settings.oph = obj.probability;
            settings.ors = "fp";
            parent.overlaps.overlapActivate(2);
          }
      });

      d3.selectAll(".bar-fn")
        .on('mouseover', tipFN.show)
        .on('mouseout', tipFN.hide)
        .on("click" , function(){
          if(!(d3.select(this).classed("filled-gray"))){
            obj = d3.select(this).data()[0]
            settings.oca = obj.name;
            settings.ocp = "all";
            settings.opl = obj.lowProb;
            settings.oph = obj.probability;          
            settings.ors = "fn";
            parent.overlaps.overlapActivate(2);
          }
      });
  }

  this.prepareData(this.data);
  this.makeHistograms();
  this.bindEvents();

  this.applySettings = function(){ 
    pane= settings.probPane;
    this.prepareData(this.data);
    scl = Math.max(this.max.left , this.max.right);
    x = d3.scale.linear()
            .domain([-scl , scl]).nice()
            .rangeRound([0, width]);

    y = d3.scale.ordinal()
            .domain(((this.newData)[0]).map(function(d){ return d.probability;}))
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


    var svg = pane.selectAll("svg.svg-probHist")
              .data(this.newData)

        svg = svg.select("g");

    var transitionScale = svg.transition().duration(500);

                        transitionScale.select(".x.axis")
                        .call(xAxis);

                        transitionScale.select(".y.axis")
                        .call(yAxis)

                        transitionScale.select(".y.axis2")
                        .call(yAxis2)

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
  }

  this.overlap = function(nowdata){
    pane = settings.probPane;
    this.prepareData(nowdata);

    var svg = pane.selectAll("svg")
              .data(this.newData)

    groups = svg.select("g");

    var tp = groups.selectAll(".overlap-tp")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" overlap-tp overlap";})
              .attr("x" , function(d){return x(0);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipTP.show)
				.on('mouseout', tipTP.hide);

    var fp = groups.selectAll(".overlap-fp")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" overlap-fp overlap";})
              .attr("x" , function(d){return x(d.tp);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFP.show)
				.on('mouseout', tipFP.hide);

    var fn = groups.selectAll(".overlap-fn")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" overlap-fn overlap";})
              .attr("x" , function(d){return x(-d.fn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFN.show)
				.on('mouseout', tipFN.hide);

    var tn = groups.selectAll(".overlap-tn")
              .data(function(d){return d;})
              .enter().append("rect")
              .attr("class" , function(d){return d.name+" overlap-tn overlap";})
              .attr("x" , function(d){return x(-d.fn-d.tn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipTN.show)
				.on('mouseout', tipTN.hide);




              
  }
}// end of class