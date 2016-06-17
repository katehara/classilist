


// make all probibility histograms
makeHistograms = function(histData, classes, pane, scl){
  h = pane.node().getBoundingClientRect().height;
  w = pane.node().getBoundingClientRect().width;

  for(i in histData){
    probabilityHistogram(histData[i], 300, 200, scl , pane);
  }
}

// make a probability histogram
function probabilityHistogram(data, w, h, scl , pane){
  // console.log(scl);
  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 30
  },
  width = Math.max(200,w) - margin.left - margin.right,
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
              .tickSize(1)
              .tickPadding(6);


  var svg = pane.append("svg")
            .attr("width" , w)
            .attr("height" , h)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
    .attr("class" , "x axis")
    .attr("transform" , "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class" , "y axis")
    .attr("transform" , "translate(" + x(0) +",0)")
    .call(yAxis);

  var tp = ()





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
    // console.log(preparedData);
    for(j in data){
      for(k in preparedData){
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