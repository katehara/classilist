function Table(model , settings , outerpane) {
	columns = (model.headers).filter(function(d){
					if(d.substr(0,2) != "P-") return true;
					else return false;
				});
	this.data = model.data;
	this.tableData;
	this.groupedData;
	pane = outerpane.select(".data-table");
	pager = outerpane.select(".pager");
	page = pager.select(".page");
	prev = pager.select(".prev");
	next = pager.select(".next");
	first = pager.select(".first");
	last = pager.select(".last");

	this.setPager = function(){
		curr = settings.tableCurrentPage;
		len = (this.groupedData).length;
		page.text(" "+ curr +" ");
		first.text(1 + "..");
		last.text(".." + len);
		if(curr == 1) prev.classed("disabled" , true)
		else prev.classed("disabled" , false);

		if(curr == len) next.classed("disabled" , true);
		else next.classed("disabled" , false);
	}

	this.makeTable = function(){
		this.tableData = settings.rightFilteredData(this.data);
		
		this.groupedData = sliceData(this.tableData, settings.tableSize) ;//spliceData(settings.rightFilteredData(this.data) , settings.tableSize);
		

		pane.select("*").remove();
		var table = pane.append("table")
						.attr("class" , "striped highlight");

		var thead = table.append("thead");
		var tbody = table.append("tbody");

		var heads = thead.append("tr")
						.selectAll("th")
						.data(columns)
						.enter()
						.append("th")
						.text(function(c){
							if(c == "Predicted") return c+"-"+(model.target).substr(2);
							else if(c.substr(0,2) != "P-") return c.substr(2);
							else return c;
						});		

		var rows = tbody.selectAll("tr")
						.data(this.groupedData[settings.tableCurrentPage-1])
						.enter()
						.append("tr");

		var cells = rows.selectAll("td")
						.data(function(row){
							return (columns).map(function(column){
								return {column : column, value: row[column]};
							});
						})
						.enter()
						.append("td")
						.text(function(d){ return d.value; });
		
		this.setPager();
	}

	
	this.makeTable();

	this.slideData = function(t){

		if(t==0) curr = --settings.tableCurrentPage; //previous page
		else if(t==1) curr = ++settings.tableCurrentPage; //previous page
			
		len = (this.groupedData).length;

		var tbody = pane.select("table").select("tbody");

		tbody.selectAll("*").remove();

		var rows = tbody.selectAll("tr")
					.data(this.groupedData[curr-1])
					.enter()
					.append("tr");

		// rows.exit().remove();

		var cells = rows.selectAll("td")
					.data(function(row){
						return (columns).map(function(column){
							return {column : column, value: row[column]};
						});
					})
					.enter()
					.append("td")
					.text(function(d){ return d.value; });

		this.setPager();
	
	}

		
}



function sliceData(data , size){
	groups = [];
	for(i = 0, m = data.length; i<m ; i+=size ){
		groups.push(data.slice(i , i+size));
	}
	return groups;
}