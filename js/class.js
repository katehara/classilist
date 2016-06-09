function Class (confusion , name, cnames){
	// console.log(name , cnames);

	this.name = name;
	this.index = getIndex(name, cnames);
	this.tp = getTP(confusion , this.index);
	this.fp = getFP(confusion, this.index);
	this.tn = getTN(confusion, this.index);
	this.fn = getFN(confusion, this.index);



}

// get index of this class in confusion matrix and classmap (chronological)
function getIndex(name, cnames){
	return cnames.indexOf(name);
}

// get True Positives
function getTP(mat, ind){
	return mat[ind][ind];
}

// get True Positives
function getFP(mat, ind){
	var fp = 0;
	for(i=0;i<mat.length;i++) if(i != ind) fp =fp+mat[i][ind];
	return fp;
}

// get False negatives
function getFN(mat, ind){
	var fn = 0;
	for(i=0;i<mat.length;i++) if(i != ind) fn =fn+mat[ind][i];
	return fn;
}

// get false positives
function getTN(mat, ind){
	var tn = 0;
	for(i=0;i<mat.length;i++){
		if(i != ind){
			for(j=0;j<mat[i].length;j++){
				if(j != ind)
					tn = tn + mat[i][j];
			}
		}
	}
	return tn;
}
