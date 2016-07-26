function Model (data){

	//Model variables for Dataset metadata
	this.data = data;
	this.headers = getColumns(this.data);
	this.nCols = getNCols(this.headers);
	this.features = getFeatures(this.headers , this.nCols);
	this.probs = getProbs(this.headers , this.nCols);
	this.target = getTarget(this.headers , this.nCols);
	this.predicted = getPredicted(this.headers , this.nCols);
	this.classNames = getClassNames(this.data , this.target);
	this.confusionMatrix = getConfusionMatrix(this.data, this.classNames, this.target, this.predicted);
	this.labeledData = labelData(this.data, this.classNames, this.target, this.predicted);
	this.numericData = numericData(this.data , this.features)
}

function numericData(data , names){
	for(i=0,len=data.length; i<len ; i++){
		for(j=0,lenj = names.length;j<lenj;j++) 
			if(!isNaN(data[i][names[j]])) 
				data[i][names[j]] = +data[i][names[j]];
	}
}

//
function labelData(data, classNames, target, predicted){
	for(j = 0, lenj =classNames.length;j<lenj;j++){
		name = classNames[j];
		// console.log(name);
		for(i=0,len=data.length; i<len ; i++){

			if(data[i][target] == name && data[i][predicted] == name) data[i]["L-"+name] = "TP";
			else if(data[i][target] != name && data[i][predicted] == name) data[i]["L-"+name] = "FP";
			else if(data[i][target] == name && data[i][predicted] != name) data[i]["L-"+name] = "FN";
			else if(data[i][target] != name && data[i][predicted] != name) data[i]["L-"+name] = "TN";

		}
	}
	return data;
}

// get all column names
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
	for(i=0,len=data.length; i<len ; i++ ){
		if( typeof(unique[data[i][target]]) == "undefined"){
			distinct.push(data[i][target]);
		}
		unique[data[i][target]] = 0;
	}
	distinct.sort(function (a,b) { return a.localeCompare(b);});
	return distinct;
}

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
	return mat
}


// helpers

// create 2d zero matrix for initialization of confusion matrix
function zeros(r , c){
    var array = new Array(r)
    for(i=0;i<r;i++) array[i] = new Array(c).fill(0);
    return array;
}