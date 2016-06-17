function Model (data){

	headers = getColumns(data);
	nCols = getNCols(headers);
	features = getFeatures(headers , nCols);
	probs = getProbs(headers , nCols);
	target = getTarget(headers , nCols);
	predicted = getPredicted(headers , nCols);
	classNames = getClassNames(data , target);
	confusionMatrix = getConfusionMatrix(data, classNames, target, predicted);
	defaultBin = 10;
	histData = [];

	labelData(data, classNames, target, predicted);
	prepareData(data, classNames, defaultBin, histData);
	// console.log(histData);

	




















}

prepareData = function(data, classes, bins, allData){
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
	}
}

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

labelData = function(data, classNames, target, predicted){
	for(j in classNames){
		name = classNames[j];
		// console.log(name);
		for(i in data){

			if(data[i][target] == name && data[i][predicted] == name) data[i]["L-"+name] = "TP";
			else if(data[i][target] != name && data[i][predicted] == name) data[i]["L-"+name] = "FP";
			else if(data[i][target] == name && data[i][predicted] != name) data[i]["L-"+name] = "FN";
			else if(data[i][target] != name && data[i][predicted] != name) data[i]["L-"+name] = "TN";

		}
	}
}

// get column names
function getColumns(data){
	  var names = d3.keys(data[0]);
	  return names;
}

//get no. of columns
function getNCols(names){
	return (names.length);
}

//get feature column names
function getFeatures(names , n){
	a = [];
	for(i=0;i<n;i++){
		if(names[i].substr(0,2)=="F-") a.push(names[i]);
	}
	return a;
}

//get probability column names
function getProbs(names , n){
	a = [];
	for(i=0;i<n;i++){
		if(names[i].substr(0,2)=="P-") a.push(names[i]);
	}
	return a;
}

//get target column name
function getTarget(names , n){
	for(i=0;i<n;i++){
		if(names[i].substr(0,2)=="A-")  break;
	}
	return names[i];
}

// get predicted column name
function getPredicted(names , n){
	for(i=0;i<n;i++){
		if(names[i].substr(0,9)=="Predicted") break;
	}
	return names[i];
}

// get all distinc classes from target column
function getClassNames(data , target){
	var unique = {};
	var distinct = [];
	for( var i in data ){
		if( typeof(unique[data[i][target]]) == "undefined"){
			distinct.push(data[i][target]);
		}
		unique[data[i][target]] = 0;
	}
	distinct.sort(function (a,b) { return a.localeCompare(b);});
	return distinct;
}

//get array of class objects having all respective details


// get confusion matrix
function getConfusionMatrix(data, classNames, target, predicted) {
	classmap = {};
	cl = classNames.length;
	mat = zeros(cl , cl);
	// console.log(mat);
	for( i=0;i<cl;i++){
		classmap[classNames[i]] = i;
	}
	// console.log(classmap);
	for(i=0;i<data.length;i++){ 
		aclass = data[i][target]; 
		pclass = data[i][predicted]; 
		aind = classmap[aclass]; 
		pind = classmap[pclass]; 
		(mat[aind][pind])++;
	}
	// console.log(mat);
	return mat;
}
















// helpers

// create 2d zero matrix for initialization of confusion matrix
function zeros(r , c){
    var array = new Array(r)
    for(i=0;i<r;i++) array[i] = new Array(c).fill(0);
    return array;
}