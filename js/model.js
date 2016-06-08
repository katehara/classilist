function Model (data){

	this.headers = getColumns(data);
	this.nCols = getNCols(this.headers);
	this.features = getFeatures(this.headers , this.nCols);
	this.probs = getProbs(this.headers , this.nCols);
	this.target = getTarget(this.headers , this.nCols);
	this.predicted = getPredicted(this.headers , this.nCols);
	this.classes = getClasses(data , this.target);






















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
function getClasses(data , k){
	var unique = {};
	var distinct = [];
	for( var i in data ){
		if( typeof(unique[data[i][k]]) == "undefined"){
			distinct.push(data[i][k]);
		}
		unique[data[i][k]] = 0;
	}
	return distinct;
}