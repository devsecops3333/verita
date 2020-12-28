
  //d3.json('testing_data1.json', function(error, data) {
d3.csv('views/lib/ALM_Defects.csv', function(error, data) {

	if(error)
		throw new Error(error);

		var dataSet = data;
		
		var dateFormat = d3.time.format("%d-%m-%Y");

		dataSet.forEach(function(d) {
			d.Closing_Date = dateFormat.parse(d.Closing_Date);
			d.Detected_on_Date = dateFormat.parse(d.Detected_on_Date);
		});
	
		var ndx = crossfilter(dataSet);

		var severityDimension = ndx.dimension(function(d) {	return d.Severity; });
		var appDimension = ndx.dimension(function(d) {	return d.Application_Name; });

		var detectedDate = ndx.dimension(function(d) { return d.Detected_on_Date; });
		var detectedDateGroup = detectedDate.group();
		
		var closeDate = ndx.dimension(function(d) { return d.Closing_Date; });	
		var closeDateGroup = closeDate.group().reduceCount();

		var bugsBySeverity = severityDimension.group(); 
		var bugsByApp = appDimension.group();
	
		var severityGroup   = severityDimension.group();
		var appGroup   = appDimension.group();

		var all = ndx.groupAll();

		var totalBugsSeverity = severityDimension.group().reduceSum(function(d) {
			return d.Severity;
		});

		var totalBugsApp = appDimension.group().reduceSum(function(d) {
			return d.Application_Name;
		});
		
		var detectMinDate = detectedDate.bottom(1)[0].Detected_on_Date;
		var detectMaxDate = detectedDate.top(1)[0].Detected_on_Date;

		var closeMinDate = closeDate.bottom(1)[0].Closing_Date;
		var closeMaxDate = closeDate.top(1)[0].Closing_Date;
		
		var sevChart = dc.barChart('#sev_chart');
		var appChart = dc.barChart('#app_chart');
		var detectChart = dc.lineChart('#detect_chart');
		var closeChart = dc.lineChart('#close_chart');
		
		var totalBugs = dc.numberDisplay("#total-bugs");

		totalBugs
			.formatNumber(d3.format("d"))
			.valueAccessor(function(d){return d; })
			.group(all);
		
		sevChart
			.width(350).height(200)
			.transitionDuration(1000).clipPadding(40)	
			.xAxisLabel('Severity Level').yAxisLabel('Bug Count')
			.dimension(severityDimension).group(severityGroup)
			.elasticX(true).elasticY(true)
			.centerBar(false)
			.x(d3.scale.ordinal().domain(severityDimension))
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true).renderVerticalGridLines(true)
			//.gap(40)
			.title(function(d) {
				var severityValues = ["0", "1", "2", "3", "4"];
				return 'S-' + d.key  + ': ' + d.value;
			})
			.barPadding(0.4).outerPadding(0.2)
			//.xUnits(function(){return 10;})
			.renderLabel(true)
			.xAxis()
			;	

			sevChart
				.colors(d3.scale.ordinal()
						.domain(["1", "2", "3", "4"])
						.range(["#ff1a1a", "#ff4d4d", "#ff8080", "#ffb3b3"])
					)
				.colorAccessor(function(d){ return d.key; });
					
		appChart
			.width(350).height(200)
			.transitionDuration(1000).clipPadding(10)	
			.colors(['#1f77b4'])
			.xAxisLabel('Application Name').yAxisLabel('Bug Count')
			.dimension(appDimension).group(appGroup)
			.elasticX(true).elasticY(true).centerBar(false)
			.x(d3.scale.ordinal().domain(appDimension)).xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true).renderVerticalGridLines(true)
			.gap(40).barPadding(0.4).outerPadding(0.2)         
			.renderLabel(true).xAxis();	
			 
		detectChart.width(350).height(200)
			.margins({top: 10, right: 50, bottom: 60, left: 50})
			.dimension(detectedDate)
			.group(detectedDateGroup)
			.renderArea(false)
			.colors(['#9fafd9'])	
			.transitionDuration(500)
			.x(d3.time.scale().domain([detectMinDate, detectMaxDate]))
			.elasticX(true)
			.elasticY(true)		
			.brushOn(false)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.xAxisLabel("Detect Date")
			.yAxisLabel("Bug Count")
			.on('renderlet', function(chart) {
				chart.selectAll("g.x text")
					.attr('dx', '-30')
					.attr('dy', '0')
					.attr('transform', "rotate(-55)");
			 })
			;
		
			closeChart.width(350).height(200)
				.margins({top: 10, right: 50, bottom: 60, left: 50})
				.dimension(closeDate)
				.group(closeDateGroup)
				.renderArea(false)
				.transitionDuration(500)
				.x(d3.time.scale().domain([closeMinDate, closeMaxDate]))
				.elasticX(true)
				.elasticY(true)		
				.brushOn(false)
				.renderHorizontalGridLines(true)
				.renderVerticalGridLines(true)
				.xAxisLabel("Close Date")
				.yAxisLabel("Bug Count")
				.on('renderlet', function(chart) {
						chart.selectAll("g.x text")
						  .attr('dx', '-30')
						  .attr('dy', '0')
						  .attr('transform', "rotate(-55)");
					
				 })				
				.yAxis().ticks(6)
				;
			dc.renderAll();

  });