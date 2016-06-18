


// make all probibility histograms
makeHistograms = function(histData, classes, pane, scl){
  h = pane.node().getBoundingClientRect().height;
  w = pane.node().getBoundingClientRect().width;

  for(i in histData){
    probabilityHistogram(histData[i], classes[i], 300, 200, scl , pane);
  }
}

// make a probability histogram
function probabilityHistogram(data, name, w, h, scl , pane){
  // console.log(name);
  classtp = name + " bar-tp";
  classtn = name + " bar-tn";
  classfp = name + " bar-fp";
  classfn = name + " bar-fn";

  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 30
  },
  width = Math.max(300,w) - margin.left - margin.right,
  height = Math.max(200,h) - margin.top - margin.bottom;
  // pad = -10;


  var x = d3.scale.linear()
          .domain([-scl , scl])
          .rangeRound([0, width]);

  var y = d3.scale.ordinal()
          .domain(data.map(function(d){ return d.probability;}))
          .rangeRoundBands([0, height] , 0.1);

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
              .ticks(data.length)
              .tickSize(-1)
              .tickPadding(6);


  var svg = pane.append("svg")
            .attr("width" , w)
            .attr("height" , h)
            // .attr("preserveAspectRatio","xMinYMin meet")
            // .attr("viewBox","0 0 " + w +" " + h )
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  

    console.log(data[0]);

  var tp = svg.append("g").selectAll(".bar-tp")
            .data(data)
            .enter().append("rect")
            .attr("class" , classtp)
            .attr("x" , function(d){return x(0);})
            .attr("y" , function(d){return y(d.probability);})
            .attr("width" , function(d){return Math.abs(x(d.tp) - x(0));})
            .attr("height" , function(d){return y.rangeBand()});

  var fp = svg.append("g").selectAll(".bar-fp")
            .data(data)
            .enter().append("rect")
            .attr("class" , classfp)
            .attr("x" , function(d){return x(d.tp);})
            .attr("y" , function(d){return y(d.probability);})
            .attr("width" , function(d){return Math.abs(x(d.fp) - x(0));})
            .attr("height" , function(d){return y.rangeBand()});

  var fn = svg.append("g").selectAll(".bar-fn")
            .data(data)
            .enter().append("rect")
            .attr("class" , classfn)
            .attr("x" , function(d){return x(-d.fn);})
            .attr("y" , function(d){return y(d.probability);})
            .attr("width" , function(d){return Math.abs(x(d.fn) - x(0));})
            .attr("height" , function(d){return y.rangeBand()});

  var tn = svg.append("g").selectAll(".bar-tn")
            .data(data)
            .enter().append("rect")
            .attr("class" , classtn)
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
    .attr("transform" , "translate(" + x(0) +",0)")
    .call(yAxis);
  






}


// prepare histogram data into bins
prepareData = function(data, classes, bins, allData, max){
  max.right = max.left = 0;
  binSize = 1/bins;
  binValues = getBinValues(bins);
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
    //console.log(preparedData);
    for(j in data){
      for(k in preparedData){
        // console.log(data[j]);
        // console.log(prob);
        // console.log(data[j][prob]);
        if(data[j][prob] < preparedData[k].probability){ 
          preparedData[k][data[j][name].toLowerCase()]++;
          break;
        }

      }
    }
    // console.log(name);
    allData.push(preparedData);
    max.left = Math.max(max.left, d3.max(preparedData , function(d){return (d.tn+d.fn);} ));
    max.right = Math.max(max.right, d3.max(preparedData , function(d){return (d.tp+d.fp);} ));
    // console.log(max.right + " " + max.left);
  }
}


// prepare bin boundaries acc to no of bins
getBinValues = function(bins){
  array = [];
  k = 1/bins;
  num=0;
  for(i=1;i<=bins;i++){
    num = i*k;
    num = Math.round((num + 0.00001) * 100) / 100;
    array.push(num);
  }
  return array;
}