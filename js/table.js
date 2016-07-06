function Table(model , settings , pane)
{
	columns = model.headers;
	this.data = model.data;
	this.tableData = [];

	this.makeTable = function(){
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
						.data(settings.rightFilteredData(this.data))
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

	}

	this.makeTable();

}