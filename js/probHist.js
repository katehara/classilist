function ProbHist(model , pane) {


  this.data = model.data;
  this.headers = model.headers;
  this.nCols = model.nCols;
  this.features = model.features;
  this.probs = model.probs;
  this.target = model.target;
  this.predicted = model.predicted;
  this.classNames = model.classNames;

  // pane = pane;

  this.dataOptions = {
    tp : true,
    tn : true,
    fp : true,
    fn : true
  }
  this.probLimits = [0.00 , 1.00];
  // this.probBegin = 0.00;
  // this.probEnd = 1.00;
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

// console.log(this.getBinValues());

  // prepare histogram data into bins and assign it to property -> histData[]
  this.prepareData = function(){
    data = this.data;
    classes = this.classNames;
    bins = this.bins;
    this.histData = [];
    // console.log(this.histData);

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
          // console.log(data[j]);
          // console.log(prob);
          // console.log(data[j][prob]);
          if(data[j][prob] < preparedData[k].probability){ 
            if(this.dataOptions[data[j][name].toLowerCase()])
              preparedData[k][data[j][name].toLowerCase()]++;

              // console.log(this.dataOptions[data[j][name].toLowerCase()]);
              // console.log(preparedData[k][data[j][name].toLowerCase()]);
            
            break;
          }

        }
      }
            // console.log(preparedData);

      // console.log(name);
      this.histData.push(preparedData);
      this.max.left = Math.max(this.max.left, d3.max(preparedData , function(d){return (d.tn+d.fn);} ));
      this.max.right = Math.max(this.max.right, d3.max(preparedData , function(d){return (d.tp+d.fp);} ));
      // console.log(max.right + " " + max.left);
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


  //   w=(pane.node().getBoundingClientRect().width - 30)/3;
  // var margin = {
  //   top: 20,
  //   right: 20,
  //   bottom: 30,
  //   left: 30
  // },
  // width = Math.max(200,w) - margin.left - margin.right,
  // height = Math.max(200,w) - margin.top - margin.bottom;
  
    // console.log(Math.max(w,200));
    
    scl = Math.max(this.max.left , this.max.right);
    classtp = name + " bar-tp";
    classtn = name + " bar-tn";
    classfp = name + " bar-fp";
    classfn = name + " bar-fn";
       
    // pad = -10;
    console.log(width + "   " + height);

    var x = d3.scale.linear()
            .domain([-scl , scl])
            .rangeRound([0, width]);

    var y = d3.scale.ordinal()
            .domain(data.map(function(d){ return d.probability;}))
            .rangeRoundBands([0, height] , 0.1);

    // console.log(y(2));
    //             console.log(y(3));


    // console.log(x(6));
    // console.log(y(0.1));

    var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(1)
                .tickFormat(function(d){ return Math.abs(d);});

                // .tickFormat(d3.format)
    
    var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickValues(y.domain().filter(function(d,i){ 
                      if(this.bins <= 15) return true;

                      return !(i%(2)); } ))
                // .tickValues(y.domain().filter(function(d,i){ console.log(d + " " + i%(this.bins/10) );return !Math.floor((i%(this.bins/10))); } ))
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
              // .attr("preserveAspectRatio","xMinYMin meet")
              // .attr("viewBox","0 0 " + w +" " + h )
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
    svg.call(tipTP);
    svg.call(tipFP);
    svg.call(tipFN);
    svg.call(tipTN);

      // console.log(data[0]);

    var tp = svg/*.append("g")*/.selectAll("."+name + ".bar-tp")
              .data(data, function(d , i){return d.probability;})
              .enter().append("rect")
              .attr("class" , classtp)
              .attr("x" , function(d){return x(0);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipTP.show)
              .on('mouseout', tipTP.hide);

    var fp = svg/*.append("g")*/.selectAll("."+name + ".bar-fp")
              .data(data, function(d , i){return d.probability;})
              .enter().append("rect")
              .attr("class" , classfp)
              .attr("x" , function(d){return x(d.tp);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFP.show)
              .on('mouseout', tipFP.hide);

    var fn = svg/*.append("g")*/.selectAll("."+name + ".bar-fn")
              .data(data, function(d , i){return d.probability;})
              .enter().append("rect")
              .attr("class" , classfn)
              .attr("x" , function(d){return x(-d.fn);})
              .attr("y" , function(d){return y(d.probability);})
              .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
              .attr("height" , function(d){return y.rangeBand()})
              .on('mouseover', tipFN.show)
              .on('mouseout', tipFN.hide);

    var tn = svg/*.append("g")*/.selectAll("."+name + ".bar-tn")
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
      // .attr("transform" , "translate(" + x(0) +",0)")
      .call(yAxis);

    svg.append("g")
      .attr("class" , name + " y axis2")
      // .attr("transform" , "translate(0,0)")
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






  this.updateSwitch = function(){

    

    this.prepareData();
    // this.makeHistograms();
    // console.log(this.histData)
    scl = Math.max(this.max.left , this.max.right);

    var x = d3.scale.linear()
            .domain([-scl , scl])
            .rangeRound([0, width]);

    var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(1)
                .tickFormat(function(d){ return Math.abs(d);});

     





    var transitionScale = pane.transition().duration(500);

    transitionScale.selectAll(".x.axis")
              .call(xAxis)
              .selectAll("text")  
                  .style("text-anchor", "end")
                  .attr("dx", "-.8em")
                  .attr("dy", ".15em")
                  .attr("transform", "rotate(-90)" );

    for(i in this.histData){

       





        newd = this.histData[i];
        name = this.classNames[i];

        var y = d3.scale.ordinal()
                .domain(newd.map(function(d){ return d.probability;}))
                .rangeRoundBands([0, height] , 0.1);

                // console.log(y(.2));
                // console.log(y(.3));

  
        
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

        pane.selectAll("."+name+".bar-tp").data(newd);
        pane.selectAll("."+name+".bar-tn").data(newd);
        pane.selectAll("."+name+".bar-fn").data(newd);
        pane.selectAll("."+name+".bar-fp").data(newd);


        var trans = pane.transition().duration(500);

        trans.selectAll("."+name+".bar-tp")
              .attr("x" , function(d){return x(0);})
                      .attr("y" , function(d){return y(d.probability);})
                      .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
                      .attr("height" , function(d){return y.rangeBand()});

        trans.selectAll("."+name+".bar-fp")
              .attr("x" , function(d){return x(d.tp);})
                      .attr("y" , function(d){return y(d.probability);})
                      .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
                      .attr("height" , function(d){return y.rangeBand()});

        trans.selectAll("."+name+".bar-fn")
              .attr("x" , function(d){return x(-d.fn);})
                      .attr("y" , function(d){return y(d.probability);})
                      .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
                      .attr("height" , function(d){return y.rangeBand()});

        trans.selectAll("."+name+".bar-tn")
              .attr("x" , function(d){return x(-d.fn-d.tn);})
                      .attr("y" , function(d){return y(d.probability);})
                      .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
                      .attr("height" , function(d){return y.rangeBand()});




    }

  }

  this.applySettings = function(bins , probs){
    if(this.probLimits != probs.map(Number)) this.probLimits = probs.map(Number);
    if(this.bins != Number(bins))this.bins = Number(bins);

   
  

    
    
    // console.log(this.bins);
    // console.log(this.probLimits);

    this.prepareData();

    scl = Math.max(this.max.left , this.max.right);

    


    for(i in this.histData){

     

        newd = this.histData[i];
        newname = this.classNames[i];

         classtp = newname + " bar-tp";
    classtn = newname + " bar-tn";
    classfp = newname + " bar-fp";
    classfn = newname + " bar-fn";


    // console.log(width + "   " + height);


        var x = d3.scale.linear()
                .domain([-scl , scl])
                .rangeRound([0, width]);



        var y = d3.scale.ordinal()
                .domain(newd.map(function(d){ return d.probability;}))
                .rangeRoundBands([0, height] , 0.1);

                // console.log(y(.2));
                // console.log(y(.3));

        var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickSize(1)
                    .tickFormat(function(d){ return Math.abs(d);});

                    // .tickFormat(d3.format)
        
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
                      // .on('mouseover', tipTN.show)
                      // .on('mouseout', tipTN.hide);

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
                      // .on('mouseover', tipFN.show)
                      // .on('mouseout', tipFN.hide);

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


        var transitionScale = pane.transition().duration(500);

        transitionScale.select("."+newname+".x.axis")
                  .call(xAxis)
                  .selectAll("text")  
                      .style("text-anchor", "end")
                      .attr("dx", "-.8em")
                      .attr("dy", ".15em")
                      .attr("transform", "rotate(-90)" );

        transitionScale.select("."+newname+".y.axis")
                    .call(yAxis)

        transitionScale.select("."+newname+".y.axis2")
                    .call(yAxis2)

                    pane.select("."+newname+".x.axis").moveToFront();

                    pane.select("."+newname+".y.axis2").moveToFront();
                      // .attr("stroke" , "red");
      


        // t1 = pane.selectAll("."+name+".bar-tp").data(newd);
        // t2 = pane.selectAll("."+name+".bar-fp").data(newd);
        // t3 = pane.selectAll("."+name+".bar-fn").data(newd);
        // t4 = pane.selectAll("."+name+".bar-tn").data(newd);





        // t1.attr("x" , function(d){return x(0);})
        //       .attr("y" , function(d){return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()});

        // t2.attr("x" , function(d){return x(d.tp);})
        //       .attr("y" , function(d){ return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()});

        // t3.attr("x" , function(d){return x(-d.fn);})
        //       .attr("y" , function(d){return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()});

        // t4.attr("x" , function(d){return x(-d.fn-d.tn);})
        //       .attr("y" , function(d){return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()});

        // t1.enter().append("rect")
        //       .attr("class" , classtp)
        //       .attr("x" , function(d){return x(0);})
        //       .attr("y" , function(d){return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()})
        //       .on('mouseover', tipTP.show)
        //       .on('mouseout', tipTP.hide);


        // t2.enter().append("rect")
        //       .attr("class" , classfp)
        //       .attr("x" , function(d){return x(d.tp);})
        //       .attr("y" , function(d){return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()})
        //       .on('mouseover', tipFP.show)
        //       .on('mouseout', tipFP.hide);

        // t3.enter().append("rect")
        //       .attr("class" , classfn)
        //       .attr("x" , function(d){return x(-d.fn);})
        //       .attr("y" , function(d){ return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()})
        //       .on('mouseover', tipFN.show)
        //       .on('mouseout', tipFN.hide);

        // t4.enter().append("rect")
        //       .attr("class" , classtn)
        //       .attr("x" , function(d){return x(-d.fn-d.tn);})
        //       .attr("y" , function(d){return y(d.probability);})
        //       .attr("width" , function(d){return Math.abs(x(d.tn) - x(0));})
        //       .attr("height" , function(d){return y.rangeBand()})
        //       .on('mouseover', tipTN.show)
        //       .on('mouseout', tipTN.hide);
        


        // t1.exit().transition().remove();
        // t2.exit().transition().remove();
        // t3.exit().transition().remove();
        // t4.exit().transition().remove();

    }

    // this.makeHistograms();

  }


}// end of class









