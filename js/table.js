function Table(model , settings , pane)
{
	columns = model.headers;
	this.data = model.data;
	this.tableData = [];

	this.makeTable = function(){

		pane.select("*").remove();

		pr = settings.rightProbBounds;
		cls = settings.rightClass;
		res = settings.rightResult;

		console.log(pr + "  " + cls + "  "+ res);

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
						.data((this.data).filter(function(d){
							pr = settings.rightProbBounds;
							cls = settings.rightClass;
							res = settings.rightResult;

							// if(cls != "all" && d[model.target] != cls) return false;

							if(res != "all" && d["L-"+cls] != res.toUpperCase()) return false;

							if(d["P-"+cls] < pr[0] || d["P-"+cls] > pr[1]) return false;

							return true;
						}))
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