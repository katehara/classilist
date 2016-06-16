function Class (data , name, target, predicted){
	// console.log(name , cnames);

	this.name = name;
	this.prob = "P-"+name;
	this.result = "L-"+name;
	this.defaultBin = 10;
	this.table = labelData(data, this.name, target, predicted);
	this.histogram = probabilityHistogram(this.data, this.name, this.prob, this.result, this.defaultBin);
	


	// this.tp = getTP(confusion , this.index);
	// this.fp = getFP(confusion, this.index);
	// this.tn = getTN(confusion, this.index);
	// this.fn = getFN(confusion, this.index);
	// console.log(this.table[0][this.x]);
	// console.log(this.table[0][this.y]);
	// console.log(this.table);

}


// label the data 
function labelData(dt , name, target, predicted){
	
	this.tempdata = dt;

	for(i in tempdata){

		if(tempdata[i][target] == name && tempdata[i][predicted] == name) tempdata[i]["L-"+name] = "TP";
		else if(tempdata[i][target] != name && tempdata[i][predicted] == name) tempdata[i]["L-"+name] = "FP";
		else if(tempdata[i][target] == name && tempdata[i][predicted] != name) tempdata[i]["L-"+name] = "FN";
		else if(tempdata[i][target] != name && tempdata[i][predicted] != name) tempdata[i]["L-"+name] = "TN";

	}

	return tempdata;
}




// // get index of this class in confusion matrix and classmap (chronological)
// function getIndex(name, cnames){
// 	return cnames.indexOf(name);
// }

// // get True Positives
// function getTP(mat, ind){
// 	return mat[ind][ind];
// }

// // get True Positives
// function getFP(mat, ind){
// 	var fp = 0;
// 	for(i=0;i<mat.length;i++) if(i != ind) fp =fp+mat[i][ind];
// 	return fp;
// }

// // get False negatives
// function getFN(mat, ind){
// 	var fn = 0;
// 	for(i=0;i<mat.length;i++) if(i != ind) fn =fn+mat[ind][i];
// 	return fn;
// }

// // get false positives
// function getTN(mat, ind){
// 	var tn = 0;
// 	for(i=0;i<mat.length;i++){
// 		if(i != ind){
// 			for(j=0;j<mat[i].length;j++){
// 				if(j != ind)
// 					tn = tn + mat[i][j];
// 			}
// 		}
// 	}
// 	return tn;
// }
