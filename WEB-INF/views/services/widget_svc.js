mainApp
		.service(
				'widgetService',
				function($rootScope, $http, $sessionStorage, $timeout,
						ganttService) {

					var AJAX_CONSTANT = API_URI.WIDGET_SVC_API;
					var chartSummaryFull = '';
					var trendLineCharts = [];
					return {

						/**
						 * Get Widget Data For Standard Dashboard
						 */
						getWidgetData : function(dcWidgetId) {
							return $http.get(AJAX_CONSTANT.GET_WIDGET_DATA
									+ dcWidgetId);
						},

						getGanttChartJSONData : function(jsonFileName) {

							// return
							// $http.get("views/customFiles/convertcsv.csv1503557009354.json");
							return $http.get(AJAX_CONSTANT.GET_GANTTCHART_DATA
									+ jsonFileName);
						},

						/**
						 * Get Widget Data For Standard Dashboard by Type
						 */
						getWidgetDataByType : function(dcWidgetId, type) {
							return $http.get(AJAX_CONSTANT.GET_WIDGET_DATA
									+ dcWidgetId + "/" + type);
						},
						/**
						 * Editing Standard Widget
						 */
						postStandWidgetDetails : function(dataObj) {
							return $http({
								method : "POST",
								url : AJAX_CONSTANT.EDIT_STANDARD_WIDGET,
								data : dataObj
							});
						},
						/**
						 * Editing Standard Value-Template Widget
						 */
						postValueTemplateWidgetDetails : function(dataObj) {
							return $http({
								method : "POST",
								url : AJAX_CONSTANT.EDIT_VALUE_TEMPLETE_WIDGET,
								data : dataObj
							});
						},
						/**
						 * Editing Custom Widget
						 */
						postCustomWidgetDetails : function(dataObj) {

							return $http({
								method : "POST",
								url : AJAX_CONSTANT.EDIT_CUSTOM_WIDGET,
								data : dataObj
							});
						},

						/**
						 * Method for Getting ALM Widget Data
						 */
						getALMWidgetData : function(dcWidgetId, releaseId,
								projectName) {
							return $http.get(AJAX_CONSTANT.GET_WIDGET_DATA
									+ dcWidgetId + "/" + releaseId + "/"
									+ projectName);
						},

						/**
						 * Method for drawing gauge chart
						 */
						buildGraphGauge : function(dataSet, options) {

							var defaultOptions = {

								chartId : '#chart',

								chartSummary : 'This is a test chart',
								chartSummaryPositionX : 600,
								chartSummaryPositionY : 10,

								gaugeGroup : '',
								gAggrFunc : '',
								gaugeMaxValue : 100,
								ChartType : 'powerGauge',
								gaugeValue : '',

								colorsArray : '',
								size : 400,
								clipWidth : 400,
								clipHeight : 300,
								ringWidth : 70,

								margins : {
									top : 40,
									right : 10,
									bottom : 80,
									left : 50
								},

							};

							$.extend(true, defaultOptions, options);

							options = defaultOptions;
							$('#' + options.chartId).html('');

							switch (options.ChartType) {

							case "powerGauge":
								return this.plotPowerGaugeChart(options,
										dataSet);
								break;
							case "liquidGauge":
								return this.plotLiquidGaugeChart(options,
										dataSet);
								break;
							default:

							}
						},

						plotPowerGaugeChart : function(options, dataSet) {

							$("#" + options.chartId).html('');
							$('#fillgauge').hide();

							powerGauge = gauge("#" + options.chartId, {
								size : options.size,
								clipWidth : options.clipWidth,
								clipHeight : options.clipHeight,
								ringWidth : options.ringWidth,
								maxValue : 100,
								transitionMs : 4000,
								arcColorFn : d3.interpolateHsl(d3
										.rgb(options.colorsArray[0]),
										shadeBlend(40, options.colorsArray[0]))
							});
							powerGauge.render();

							this.commonCodeForGauge(options, dataSet,
									powerGauge);
							var gaugeVal = "gaugeValue_" + options.chartId;
							powerGauge.update($sessionStorage[gaugeVal]);
							powerGauge.chartType = options.ChartType;
							return powerGauge;

						},
						plotLiquidGaugeChart : function(options, dataSet) {

							$('#power-gauge').html('');

							gaugeConfig = liquidFillGaugeDefaultSettings();
							gaugeConfig.textVertPosition = 0.8;
							gaugeConfig.waveAnimateTime = 5000;
							gaugeConfig.waveHeight = 0.15;
							gaugeConfig.waveAnimate = true;
							gaugeConfig.waveOffset = 0.25;
							gaugeConfig.valueCountUp = false;
							gaugeConfig.displayPercent = true;
							gaugeConfig.maxValue = 100;
							gaugeConfig.circleColor = options.colorsArray[0];
							gaugeConfig.textColor = options.colorsArray[0];
							gaugeConfig.waveTextColor = options.colorsArray[0];
							gaugeConfig.waveColor = options.colorsArray[0];

							var gauge1 = loadLiquidFillGauge(options.chartId,
									50, gaugeConfig);

							gauge1.update(60);

							this.commonCodeForGauge(options, dataSet, gauge1);
							var gaugeVal = "gaugeValue_" + options.chartId;
							gauge1.update($sessionStorage[gaugeVal]);
							gauge1.chartType = options.ChartType;
							return gauge1;

						},

						commonCodeForGauge : function(options, dataSet, chart) {
							if (options.gaugeGroup != '') {
								if (options.gAggrFunc == 'sum'
										|| options.gAggrFunc == 'avg') {
									dataSet.forEach(function(d) {
										// d[gaugeGroup] = +d[gaugeGroup];
									});
								}
								var ndx = crossfilter(dataSet);

								var all = ndx.groupAll();
								var allCount = all.value();

								var netTotal = ndx.groupAll().reduceSum(
										function(d) {
											return d[options.gaugeGroup];
										});
								var allSum = netTotal.value();

								var allAvg = allSum / allCount;
								$(options.chartId).show();
								// $(chartId).css('opacity', '1');
								$(options.chartId).css('fill-opacity', '0.7');

								var gaugeVal = "gaugeValue_" + options.chartId;
								if (options.gAggrFunc == 'sum') {

									$sessionStorage[gaugeVal] = Math
											.floor((allSum / options.gaugeMaxValue) * 100);

								} else if (options.gAggrFunc == 'count') {

									$sessionStorage[gaugeVal] = Math
											.floor((allCount / options.gaugeMaxValue) * 100);

								} else if (options.gAggrFunc == 'avg') {

									$sessionStorage[gaugeVal] = Math
											.floor((allAvg / options.gaugeMaxValue) * 100);
								}

								if (options.brushOnFlag) {
									chart.margins({
										top : 0,
										right : 10,
										bottom : 40,
										left : 50
									});
								}

								// chartSummary
								var screenSize = '';
								if (options.size <= 500) {
									screenSize = 'smallScreen';
								} else {
									screenSize = 'fullScreen';
								}

								var elmnt = '';
								var width = '';
								if (options.chartId == "fillgauge"
										|| options.chartId == "power-gauge") {

									elmnt = document.getElementById('panel');
									width = elmnt.offsetWidth + 150;
								} else {

									var chartIndex = options.chartId.replace(
											/standWidget|custWidget/gi, '');

									elmnt = document.getElementById('panelId'
											+ chartIndex);
									width = elmnt.offsetWidth;

								}

								var height = elmnt.offsetHeight;

								chartSummaryFull = options.chartSummary;
								var summaryPos = '';

								if (screenSize == 'fullScreen') {

									summaryPos = width / 4 + 50;
									options.chartSummary = chartSummaryFull;
								} else if (screenSize == 'smallScreen') {
									summaryPos = width / 3;
									if (options.chartSummary.length > 30) {
										options.chartSummary = options.chartSummary
												.substring(0, 40)
												+ '...';
									}
								}
								var chartId = '';
								if (options.ChartType == 'powerGauge') {
									chartId = "#" + options.chartId + " svg";
								} else {
									chartId = "#" + options.chartId;
								}

								d3.select(chartId).append("text")
												  .attr("x", summaryPos).attr("y", 20)
												  .attr("class", options.chartId.substr(1) + "-chart-summary")
												  .attr("text-anchor", "middle")
												  .style("font-size", "16px").style("font-weight", "bold")
												  .style("text-decoration", "underline")
												  .text(options.chartSummary)
												  ;
								d3.select('.'+options.chartId.substr(1) + "-chart-summary").append("title").text(chartSummaryFull);

							}
						},

						/**
						 * Method for drawing Bar, Line, Area, Pie, Clustered
						 * charts
						 */
						buildGraph : function(dataSet, options) {

							var defaultOptions = {

								chartType : 'lineChart',
								chartId : '#chart',

								chartSummary : 'This is a test chart',
								chartSummaryPositionX : 600,
								chartSummaryPositionY : 10,

								xAxis : "",
								yAxis : "",

								xAggrFunc : "",
								yAggrFunc : "",

								groupBy : "",

								sliderHeight : "",
								xaxisDataType : "String",
								dataFormat : "",
								totalRecordsId : '#total-records',
								showLabels : false,
								legendPos : "Top Left",
								rotateLabel : false,
								valueOrPercentage : "Value",
								xaxisticklength : '',
								brushOnFlag : false,
								noYAxis : false,
								dateFormat : '',
								xAxisLabel : "",
								xAxisLabelRotation : -55,
								yAxisLabel : "",

								// for stacked grouped bar chart
								groupBy1 : "",
								groupBy2 : "",
								groupBy3 : '',
								groupBy4 : '',
								groupArray : "",
								// gautt chart

								startDate : '',
								endDate : '',
								gauttDateFormat : '',
								xTickFormat : '%d %b',
								xTickType : "days",
								task : '',
								taskType : '',
								height : 300,
								width : 500,
								clickevent : false,

								renderHorizontalGridLines : true,
								renderVerticalGridLines : true,

								transformAngle : 55,

								colorsArray : '',

								margins : {
									top : 40,
									right : 10,
									bottom : 80,
									left : 50
								},

								legendOptions : {
									legendX : 10,
									legendY : 20,
									legendGap : 5,
									horizontal : true,
									legendWidth : 400,
									legendAutoItemWidth : false,
									legendItemWidth : 100

								},

								lineChartOptions : {
									dataPointsOptions : {
										radius : 4,
										fillOpacity : 0.8,
										strokeOpacity : 0.8
									}
								},

								/*
								 * areaChartOptions : { renderDataPoints : {
								 * radius : 4, fillOpacity : 0.8, strokeOpacity :
								 * 0.8 } },
								 */

								scatterChartOptions : {
									symbolSize : 10
								},
								barChartOptions : {
									multiColorBars : true,
									renderLabels : true,
									barPadding : 0.4,
									outerPadding : 0.2,

								},

								gaugeChartOptions : {
									gaugeChartType : 'powerGauge',
									gaugeMaxValue : '100'

								},

								stackedBarChartOptions : {
									renderLabels : true,
									barPadding : 0.4,
									outerPadding : 0.2,

								},

								stackedMultiClustered : {
									groupGap : 10
								},
								pieChartOptions : {
									// radius: 10,
									innerRadius : 50,
									externalLabels : 50,
									drawPaths : false,

									legendX : 10,
									legendY : 20,
									legendGap : 5,
									horizontal : true,
									legendWidth : 400,
									legendAutoItemWidth : false,
									legendItemWidth : 100

								}

							};

							$.extend(true, defaultOptions, options);

							options = defaultOptions;

							if (options.chartType != 'ganttChart') {
								var chartSize = getChartSize(options.chartId,
										options.sliderHeight, options.panelId);
								var width = chartSize[0];
								var height = chartSize[1];

								// if (options.chartType == 'barChart'
								// || options.chartType == 'stackedChart'
								// || options.chartType == 'stackedMultiChart'
								// || options.chartType ==
								// 'stackedMultiClustered') {
								//
								// console.log("options.trendLineOptions",
								// options.trendLineOptions);
								//
								// if (options.trendLineOptions != undefined
								// && options.trendLineOptions.length != 1) {
								// var trendLineAndColors =
								// options.trendLineOptions;
								//
								// if (trendLineAndColors[0] != undefined) {
								//
								// var trendLineFlag = $
								// .parseJSON(trendLineAndColors[0]);
								// var trendLineColor = trendLineAndColors[1];
								// }
								// }
								// }
								//								
								var trendLineFlag = false;

								var dimension = options.xAxis;
								var group = options.yAxis;

								var chartIndex = options.chartId.replace(
										/#standWidget|#custWidget/gi, '');

								chartSummaryFull = options.chartSummary;

								var dimDataType = options.xaxisDataType;
								var groupDataType = '';

								if (dimDataType == 'Date') {

									var dateFormat = d3.time
											.format(options.dataFormat);

									dataSet.forEach(function(d) {
										if (dateFormat.parse(d[dimension])) {
											d['dimension_date'] = dateFormat
													.parse(d[dimension]);
										}
										d[group] = +d[group];
									});
									dimension = 'dimension_date';
								} else {
									dataSet.forEach(function(d) {
										d[group] = +d[group];
									});
								}

								var chart = null;
								var mainChart = null;
								var lineChart = null;

								if (trendLineFlag) {
									chart = this.getChartInstance(
											'compositeChart', options.chartId);
									mainChart = this.getChartInstance(
											options.chartType, chart);
									lineChart = this.getChartInstance(
											'lineChart', chart);
								} else {
									chart = this.getChartInstance(
											options.chartType, options.chartId);
								}
								console.log("options ", options);
								var ndx = crossfilter(dataSet);

								var objDim = ndx.dimension(function(d) {
									return d[dimension];
								});
								chart.width(width).height(height);
								chart.dimension(objDim);

								if (options.chartType != "pieChart") {

									if (dimDataType == 'Date') {
										var minDate = objDim.bottom(1)[0][dimension];
										var maxDate = objDim.top(1)[0][dimension];

										minDate = d3.time.day.offset(minDate,
												-1);
										maxDate = d3.time.day
												.offset(maxDate, 1);

										chart
												// .xUnits(function() { return
												// 20;
												// })
												.xUnits(d3.time.days)
												.clipPadding(10)
												.brushOn(options.brushOnFlag)
												.x(
														d3.time
																.scale()
																.domain(
																		[
																				minDate,
																				maxDate ]));

										chart.xAxis().tickFormat(dateFormat);

										var groups = getGroups(dataSet,
												options.dataFormat,
												options.dataFormat, options);
										// var groupsTemp = getGroupsBetween(
										// groups, date1, date2);

										chart.xAxis().ticks(groups.length);
										// chart.centerBar(true);

										this.drillDownAndChartSummary(options,
												chart);

									} else {

										chart.x(
												d3.scale.ordinal().domain(
														objDim)).xUnits(
												dc.units.ordinal);

										/*
										 * chart .x( d3.scale .ordinal()
										 * .domain( dataSet .map(function( d) {
										 * return d[options.xAxis]; })))
										 * .xUnits(dc.units.ordinal);
										 */

										this.tickLengthOption(options, chart,
												trendLineFlag);
										this.drillDownAndChartSummary(options,
												chart);

									}
									if (options.legendPos === "Bottom Left") {
										chart.margins({
											top : 40,
											right : 10,
											bottom : 40,
											left : 50
										});

									} else {
										chart.margins({
											top : 40,
											right : 10,
											bottom : 40,
											left : 50
										});
									}

									if (options.brushOnFlag) {
										chart.margins({
											top : 0,
											right : 10,
											bottom : 0,
											left : 50
										});
									}

								}

								if (options.xAggrFunc == 'count') {
									options.yAxis = '';
								}

							}

							switch (options.chartType) {

							case "ganttChart":
								return ganttService.buildganttWidget(dataSet,
										options);
								break;

							case "lineChart":
							case "areaChart":
								this.plotLineChart(options, objDim, chart);
								break;

							case "barChart":

								this.plotBarChart(options, objDim, chart,
										false, '', dataSet, mainChart,
										lineChart);
								break;

							case "pieChart":
								this.plotPieChart(options, objDim, chart);
								break;

							case "scatterChart":

								this.plotScatter(options, chart, ndx);
								break;

							case "stackedChart":
							case "stackedSingleClustered":
								this.plotStackedChart(options, ndx, objDim,
										chart, trendLineFlag, '', dataSet,
										mainChart, lineChart);

								// this.plotStackedChart(options, ndx, objDim,
								// chart, false, trendLineColor);

								break;

							case "stackedMultiChart":
							case "stackedMultiClustered":
							case "stackedLineMultiChart":
							case "stackedAreaMultiChart":

								this.plotMultiStackedChart(options, ndx,
										objDim, chart, trendLineFlag, false,
										dataSet, mainChart, lineChart);

								// this.plotMultiStackedChart(dataSet, options,
								// ndx, objDim, chart, false,
								// trendLineColor);
								break;
							default:
								// If no chart type matches, throw error (user
								// friendly message)
							}
							if (options.chartType != 'ganttChart') {
								this.commonOptionsForChart(dataSet, options,
										objDim, chart);
								chart.chartType = options.chartType;

								if (options.noYAxis) {
									chart.on('pretransition', function(chart) {
										chart.select("g.y").style("display",
												"none");
									});
								}

								if (trendLineFlag) {
									if (options.chartType == 'stackedMultiChart'
											|| options.chartType == 'stackedMultiClustered') {
										var tempArray = [];
										tempArray.push(mainChart);
										trendLineCharts
												.forEach(function(item, index) {
													tempArray
															.push(trendLineCharts[index]);
												});
										var charts = tempArray;
									} else {
										var charts = [ mainChart, lineChart ];
									}
									chart.compose(charts);
								}

								chart.render();
								return chart;
							}

						},

						plotMultiStackedChart : function(options, ndx, objDim,
								chart, trendLineFlag, trendLineColor, dataSet,
								mainChart, lineChart) {

							var groupByGroups = [];

							$.each(options.groupArray, function(index, value) {
								var groupByGroup = objDim.group().reduceSum(
										function(d) {
											return d[value];
										});
								groupByGroups.push([ groupByGroup, value ]);

							});

							if (trendLineFlag) { // stackedMultiClustered

								mainChart.colors(d3.scale.ordinal().domain(
										dataSet.map(function(d) {
											return d[options.xAxis];
										})).range(options.colorsArray));

								chart.brushOn(false);
								// var trendLineChartsTemp = [];
								trendLineCharts = [];
								for (var i = 0; i < groupByGroups.length; i++) {

									if (i == 0) {
										mainChart.group(groupByGroups[i][0],
												groupByGroups[i][1]);

										if (trendLineColor != ""
												&& trendLineColor[i] !== false
												&& trendLineColor[i] !== "false") {

											var lineChart = this
													.getChartInstance(
															'lineChart', chart);
											lineChart.group(
													groupByGroups[i][0],
													groupByGroups[i][1]);
											lineChart.colors(trendLineColor[i]);
											lineChart.renderArea(false);
											lineChart.renderDataPoints({
												radius : 4,
												fillOpacity : 0.8,
												strokeOpacity : 0.8
											});
											// trendLineChartsTemp.push(lineChart);
											trendLineCharts.push(lineChart);

										}
									} else {
										mainChart.stack(groupByGroups[i][0],
												groupByGroups[i][1]);

										if (trendLineColor != ""
												&& trendLineColor[i] !== false
												&& trendLineColor[i] !== "false") {

											var lineChart = this
													.getChartInstance(
															'lineChart', chart);
											lineChart.group(
													groupByGroups[i][0],
													groupByGroups[i][1]);
											lineChart.colors(trendLineColor[i]);
											lineChart.renderArea(false);
											lineChart.renderDataPoints({
												radius : 4,
												fillOpacity : 0.8,
												strokeOpacity : 0.8
											});
											// trendLineChartsTemp.push(lineChart);
											trendLineCharts.push(lineChart);
										}
									}
								}

							} else {
								chart.colors(d3.scale.ordinal().domain(
										dataSet.map(function(d) {
											return d[options.xAxis];
										})).range(options.colorsArray));

								// groupByGroups
								for (var i = 0; i < groupByGroups.length; i++) {

									if (i == 0) {
										chart.group(groupByGroups[i][0],
												groupByGroups[i][1]);
									} else {
										chart.stack(groupByGroups[i][0],
												groupByGroups[i][1]);
									}
								}

							}

							chart.title(function(d) {
								return d.key + '-' + this.layer + ': '
										+ d.value;
							});

							chart.colors(d3.scale.ordinal().range(
									options.colorsArray));

							chart.renderLabel(options.showLabels);

							if (options.chartType == 'stackedMultiClustered') {

								if (trendLineFlag) {
									mainChart.groupBars(true).groupGap(10);
									mainChart.gap(1).centerBar(true);
									// mainChart.barPadding(1).outerPadding(1);
									chart._outerRangeBandPadding(0.4);
									chart._rangeBandPadding(0);

								} else {
									chart.groupBars(true).groupGap(10);
								}

							}
							if (options.chartType == 'stackedMultiChart') {
								if (trendLineFlag) {
									mainChart.barPadding(0.4).outerPadding(0.2);
									chart._rangeBandPadding(1);
									chart._outerRangeBandPadding(0.5);
									mainChart.gap(1).centerBar(true);
								} else {
									chart.barPadding(0.4).outerPadding(0.2);
								}

							}

							if (options.chartType == 'stackedLineMultiChart') {
								chart.renderArea(false);
								chart.renderDataPoints({
									radius : 4,
									fillOpacity : 0.8,
									strokeOpacity : 0.8
								})
							}

							if (options.chartType == 'stackedAreaMultiChart') {
								chart.renderArea(true);
								chart.renderDataPoints({
									radius : 4,
									fillOpacity : 0.8,
									strokeOpacity : 0.8
								})
							}

						},

						plotStackedChart : function(options, ndx, objDim,
								chart, trendLineFlag, trendLineColor, dataSet,
								mainChart, lineChart) {

							var groupsData = this.getStackedGroupsData(options,
									ndx, objDim);

							var groupGroups = groupsData[0];
							var sVals = groupsData[1];

							// stacked bar - single group:
							if (trendLineFlag) {
								for (var i = 0; i < groupGroups.length; i++) {
									if (i == 0) {
										mainChart.group(groupGroups[i],
												sVals[i]);
									} else {
										mainChart.stack(groupGroups[i],
												sVals[i]);
									}
								}

								mainChart.colors(d3.scale.ordinal().domain(
										sVals).range(options.colorsArray));

								mainChart
										.title(function(d) {
											return d.key + ' - '
													+ options.groupBy + '-'
													+ this.layer + ': '
													+ d.value;
										});

								var objGroup = objDim.group();

								function sort_group(group, order) {
									return {
										all : function() {
											var g = group.all(), map = {};
											g.forEach(function(kv) {
												map[kv.key] = kv.value;
											});
											return order.map(function(k) {
												return {
													key : k,
													value : map[k]
												};
											});
										}
									};
								}

								var order = $.map(dataSet, function(values) {
									return values[options.xAxis];
								});
								var sorted_group = sort_group(objGroup, order);

								chart.brushOn(false);

								// lineChart.group(objGroup);
								lineChart.group(sorted_group);
								lineChart.colors(trendLineColor);
								lineChart.renderArea(false);
								lineChart.renderDataPoints({
									radius : 4,
									fillOpacity : 0.8,
									strokeOpacity : 0.8
								});
								// mainChart.gap(32);
								// mainChart.barPadding(0.4).outerPadding(0.2);
								// mainChart.barPadding(1).outerPadding(1);

								mainChart.gap(8).centerBar(true);
								mainChart.barPadding(0.6).outerPadding(0.4);
								// chart._outerRangeBandPadding(0.4);
								// chart._rangeBandPadding(0);

							} else {
								for (var i = 0; i < groupGroups.length; i++) {
									if (i == 0) {
										chart.group(groupGroups[i], sVals[i]);
									} else {
										chart.stack(groupGroups[i], sVals[i]);
									}
								}
								chart.colors(d3.scale.ordinal().domain(sVals)
										.range(options.colorsArray));

								chart
										.title(function(d) {
											return d.key + ' - '
													+ options.groupBy + '-'
													+ this.layer + ': '
													+ d.value;
										});
								// chart.barPadding(0.4).outerPadding(0.2);
							}

							chart.renderLabel(options.showLabels);

							if (options.chartType == 'stackedSingleClustered') {
								if (trendLineFlag) {
									mainChart.groupBars(true).groupGap(10);
								} else {
									chart.groupBars(true).groupGap(10);
								}

							}

						},
						getStackedGroupsData : function(options, ndx, objDim) {

							var group = options.yAxis;
							var dimension = options.xAxis;

							// Stacked with Group and Group By
							if (options.groupBy != '' && group != '') {
								var groupByDim = ndx.dimension(function(d) {
									return d[options.groupBy];
								});
								var groupByGroup = groupByDim.group();
								var groups = groupByGroup.top(Infinity);

								groups.sort(function(a, b) {
									return a.key - b.key;
								});

								var groupGroups = [];
								var sVals = [];
								groups
										.forEach(function(item, index) {
											var sVal = groups[index].key;
											sVals.push(sVal);
											if (options.yAggrFunc == 'sum') {
												groupGroups[index] = objDim
														.group()
														.reduceSum(
																function(d) {
																	if (d[options.groupBy] == sVal) {
																		return d[group];
																	} else {
																		return false;
																	}
																});
											} else if (options.yAggrFunc == 'count') {
												groupGroups[index] = objDim
														.group()
														.reduceSum(
																function(d) {
																	if (d[options.groupBy] == sVal) {
																		return true;
																	} else {
																		return false;
																	}
																});

											} else {
												groupGroups[index] = objDim
														.group()
														.reduceSum(
																function(d) {
																	if (d[options.groupBy] == sVal) {
																		return true;
																	} else {
																		return false;
																	}
																});
											}
										});
							}
							// Stacked with Group By
							else if (options.groupBy != ''
									&& groupBy != undefined) {
								var groupByDim = ndx.dimension(function(d) {
									return d[options.groupBy];
								});
								var groupByGroup = groupByDim.group();
								var groups = groupByGroup.top(Infinity);

								groups.sort(function(a, b) {
									return a.key - b.key;
								});

								var groupGroups = [];
								var sVals = [];
								groups
										.forEach(function(item, index) {
											var sVal = groups[index].key;
											sVals.push(sVal);
											groupGroups[index] = objDim
													.group()
													.reduceSum(
															function(d) {
																if (d[options.groupBy] == sVal) {
																	return true;
																} else {
																	return false;
																}
															});
										});
							}

							return [ groupGroups, sVals ];

						},
						plotScatter : function(options, chart, ndx) {

							var group = options.yAxis;
							var dimension = options.xAxis;
							objDim = ndx.dimension(function(d) {
								return [ d[dimension], d[group] ];
							});

							chart.symbolSize(10);
							chart.colors(options.colorsArray[0]);
							var objGroup = objDim.group();
							chart.group(objGroup);
						},

						plotBarChart : function(options, objDim, chart,
								trendLineFlag, trendLineColor, dataSet,
								mainChart, lineChart) {

							if (trendLineFlag) {

								mainChart.barPadding(0.4).outerPadding(0.2);

								mainChart.colors(
										d3.scale.ordinal().domain(objDim)
												.range(options.colorsArray))
										.colorAccessor(function(d) {
											return d.key;
										});
							} else {

								chart.barPadding(0.4).outerPadding(0.2);

								chart.colors(
										d3.scale.ordinal().domain(objDim)
												.range(options.colorsArray))
										.colorAccessor(function(d) {
											return d.key;
										});
							}

							chart.renderLabel(options.showValues);
							chart.yAxis().tickFormat(function(d) {
								return d
							});

							this.graphOnOptions(options, objDim, chart,
									trendLineFlag, trendLineColor, dataSet,
									mainChart, lineChart);
						},

						graphOnOptions : function(options, objDim, chart,
								trendLineFlag, trendLineColor, dataSet,
								mainChart, lineChart) {

							var group = options.yAxis;
							var objGroup = objDim.group();

							// options.yAggrFunc = 'sum';
							if (options.xAggrFunc != ''
									&& (group == '' || group == undefined)) {

								if (trendLineFlag) {
									mainChart.group(objGroup);

									function sort_group1(group, order) {
										return {
											all : function() {
												var g = group.all(), map = {};

												g.forEach(function(kv) {
													map[kv.key] = kv.value;
												});
												return order.map(function(k) {
													return {
														key : k,
														value : map[k]
													};
												});
											}
										};
									}

									var order = $.map(dataSet,
											function(values) {
												return values[options.xAxis];
											});
									var sorted_group1 = sort_group1(objGroup,
											order);

									chart.brushOn(false);

									lineChart.group(sorted_group1);
									lineChart.colors(trendLineColor);
									lineChart.renderArea(false);
									lineChart.renderDataPoints({
										radius : 4,
										fillOpacity : 0.8,
										strokeOpacity : 0.8
									});

									// lineChart.colors(colorsArray);
								} else {
									chart.group(objGroup);
								}
							} else if (group != "" && options.yAggrFunc != "") {
								var reducer = reductio().avg(function(d) {
									return d[group];
								});
								reducer(objGroup);
								if (trendLineFlag) {

									function sort_group(group, order) {
										return {
											all : function() {
												var g = group.all(), map = {};
												g.forEach(function(kv) {
													map[kv.key] = kv.value;
												});
												return order.map(function(k) {
													return {
														key : k,
														value : map[k]
													};
												});
											}
										}
									}
									var order = $.map(dataSet,
											function(values) {
												return values[options.xAxis];
											});
									var sorted_group = sort_group(objGroup,
											order);

									mainChart.group(objGroup);

									chart.brushOn(false);
									lineChart.group(sorted_group);

									if (options.yAggrFunc == "count") {
										mainChart.valueAccessor(function(d) {
											return d.value.count;
										});

										lineChart.valueAccessor(function(d) {
											return d.value.count;
										});

									} else if (options.yAggrFunc == "sum") {
										mainChart.valueAccessor(function(d) {
											return d.value.sum;
										});

										lineChart.valueAccessor(function(d) {
											return d.value.sum;
										});

									} else if (options.yAggrFunc == "avg") {
										mainChart.valueAccessor(function(d) {
											return d.value.avg;
										});
										mainChart.valueAccessor(function(d) {
											return d.value.sum;
										});
									}

									lineChart.colors(trendLineColor);
									lineChart.renderArea(false);
									lineChart.renderDataPoints({
										radius : 4,
										fillOpacity : 0.8,
										strokeOpacity : 0.8
									});

								} else {

									chart.group(objGroup);
									if (options.yAggrFunc == "count") {
										chart.valueAccessor(function(d) {
											return d.value.count;
										});
									} else if (options.yAggrFunc == "sum") {
										chart.valueAccessor(function(d) {
											return d.value.sum;
										});
									} else if (options.yAggrFunc == "avg") {
										chart.valueAccessor(function(d) {
											return d.value.avg;
										});
									}
								}

							}
							if (options.xAggrFunc == "count" || group != "") {
								var objGroups = objGroup.top(Infinity);
								if (objGroups.length > 0) {
									objGroups
											.forEach(function(item, index) {
												if (objGroups[index].key != "") {
													var sVal = objGroups[index].value;
													if (!sVal) {
														$("#errorMsg")
																.text(
																		"Please select appropriate values to plot the graph");
														return false;
													} else {
														$("#errorMsg").text("");
														return true;
													}
												}

											});
								}
							} else if (options.groupBy != '') {
								groups
										.forEach(function(item, index) {
											var sVal = groups[index].key;
											if (!sVal) {
												$("#errorMsg")
														.text(
																"Please select appropriate values to plot the graph");
												return false;
											} else {
												$("#errorMsg").text("");
												return true;
											}
										});
							}
						},

						plotLineChart : function(options, objDim, chart) {

							var group = options.yAxis;
							var dimension = options.xAxis;

							chart
									.renderArea((options.chartType == 'areaChart') ? true
											: false);

							chart.renderDataPoints({
								radius : 4,
								fillOpacity : 0.8,
								strokeOpacity : 0.8
							});
							chart.colors(options.colorsArray);

							this.graphOnOptions(options, objDim, chart);

							// var objGroup = objDim.group();
							// chart.group(objGroup);

						},

						plotPieChart : function(options, objDim, chart) {

							var chartSize = getChartSize(options.chartId,
									options.sliderHeight, options.panelId);
							var width = chartSize[0];
							var height = chartSize[1];

							this.graphOnOptions(options, objDim, chart);

							this.optionsOfPiechart(options, objDim, chart);

							var pieChartColors = d3.scale.ordinal().range(
									options.colorsArray);
							chart.colors(pieChartColors);
							chart.filter = function() {
							}

							var radius = (width + height) * 0.12;
							var innerRadius = (width + height) * 0.04;
							chart.innerRadius(innerRadius);
							chart.radius(radius);

							// chart.render();

						},
						optionsOfPiechart : function(options, objDim, chart) {
							var chartVal = "standWidget_" + options.chartId;
							var legendY = 25;
							chart
									.legend(
											dc.legend().x(70).y(legendY)
													.itemHeight(10).gap(5)
													.horizontal(false)
													.legendWidth(400)
													.itemWidth(100))
									.on(
											'postRender',
											function(chart) {

												var chartIndex = options.chartId
														.replace(
																/#standWidget|#custWidget/gi,
																'');
												var dimDataType = options.xaxisDataType;

												var elmnt = document
														.getElementById(options.chartId
																.substr(1));
												var width = elmnt.offsetWidth;
												var height = elmnt.offsetHeight;

												chart.selectAll("g.x text")
														.attr('dx', '0').attr(
																'dy', '20')
														.attr('transform',
																"rotate(0)");
												$(
														options.chartId
																+ ' .'
																+ options.chartId
																		.substr(1)
																+ '-chart-summary')
														.remove();
												var summary = options.chartSummary;
												var summaryPos = width / 2;
												if (chart.screenSize == 'fullScreen') {
													summaryPos = width / 2;
												} else if (chart.screenSize == 'smallScreen') {
													summaryPos = width / 2;
													if (options.chartSummary.length > 40) {
														options.chartSummary = options.chartSummary
																.substring(0,
																		40)
																+ '...';
													}
												}

												chart
														.svg()
														.append("text")
														.attr("x", summaryPos)
														.attr("y", 20)
														.attr(
																"class",
																options.chartId
																		.substr(1)
																		+ "-chart-summary")
														.attr("text-anchor",
																"middle")
														.style("font-size",
																"16px")
														.style("font-weight",
																"bold")
														.style(
																"text-decoration",
																"underline")
														.text(
																options.chartSummary);
												
												d3.select('.'+options.chartId.substr(1) + "-chart-summary").append("title").text(summary);

												chart
														.selectAll(
																'text.pie-slice')
														.text(
																function(d) {
																	var percentage = dc.utils
																			.printSingleValue((d.endAngle - d.startAngle)
																					/ (2 * Math.PI)
																					* 100)
																			+ '%';
																	var value = percentage;

																	if (options.valueOrPercentage == "percentage") {
																		$sessionStorage[chartVal] = value;
																		return $sessionStorage[chartVal];

																	} else if (options.valueOrPercentage == "Value") {
																		$sessionStorage[chartVal] = d.value;
																		return $sessionStorage[chartVal];

																	} else {
																		$sessionStorage[chartVal] = d.value;
																		return $sessionStorage[chartVal];
																	}
																});

												// DrillDown Code

												if (options.chartId == "#standWidget"
														+ chartIndex
														|| options.chartId == "#custWidget"
																+ chartIndex) {
													chart
															.selectAll(
																	'.pie-slice')
															.on(
																	"click",
																	function(d) {

																		$rootScope
																				.drillDownData(
																						chartIndex,
																						d.data.key,
																						d.value);
//																		$(
//																				'#drillDownModel')
//																				.modal(
//																						'show');
																	});
												}

											});
						},

						drillDownAndChartSummary : function(options, chart) {
							chart.on('postRender', function(chart) {

								var chartIndex = options.chartId.replace(
										/#standWidget|#custWidget/gi, '');
								var dimDataType = options.xaxisDataType;

								var elmnt = document
										.getElementById(options.chartId
												.substr(1));
								var width = elmnt.offsetWidth;
								var height = elmnt.offsetHeight;

								chart.selectAll("g.x text").attr('dx', '0')
										.attr('dy', '20').attr('transform',
												"rotate(0)");
								$(
										options.chartId + ' .'
												+ options.chartId.substr(1)
												+ '-chart-summary').remove();

								var summaryPos = width / 2;
								var chartSummary = null;
								console.log("chart.screenSize====",chart.screenSize);
								
								if (chart.screenSize == 'fullScreen') {
									summaryPos = width / 2;
									chartSummary = options.chartSummary;
								} else if (chart.screenSize == 'smallScreen') {
									chartSummary = options.chartSummary;
									summaryPos = width / 2;									
									if (options.chartSummary.length > 40) {
										chartSummary = options.chartSummary
												.substring(0, 40)
												+ '...';
									}
								}
								


								chart.svg().append("text")
										.attr("x", summaryPos).attr("y", 20)
										.attr(
												"class",
												options.chartId.substr(1)
														+ "-chart-summary")
										.attr("text-anchor", "middle").style(
												"font-size", "16px").style(
												"font-weight", "bold").style(
												"text-decoration", "underline")
										.text(chartSummary);
								
								d3.select('.'+options.chartId.substr(1) + "-chart-summary").append("title").text(options.chartSummary);

								if (options.rotateLabel
										|| dimDataType == 'Date') {

									chart.selectAll("g.x text").attr('dx',
											'-30').attr('dy', '0').attr(
											'transform', "rotate(-55)").style(
											"text-anchor", "middle");
								} else {
									chart.selectAll("g.x text").attr('dx', '0')
											.attr('dy', '10').attr('transform',
													"rotate(0)").style(
													"text-anchor", "middle");
								}

								if (options.chartType == "lineChart"
										|| options.chartType == 'areaChart') {

									chart.selectAll('circle.dot').on(
											"click",
											function(d) {

												$rootScope.drillDownData(
														chartIndex, d.data.key,
														d.data.value);
//												$('#drillDownModel').modal(
//														'show');
											});

								} else {

									chart.selectAll('rect').on(
											"click",
											function(d) {

												$rootScope.drillDownData(
														chartIndex, d.data.key,
														d.data.value, d.layer);
//												$('#drillDownModel').modal(
//														'show');
											});

								}
							});

						},

						tickLengthOption : function(options, chart,
								trendLineFlag) {

							var chartVal = "standWidget_" + options.chartId;

							chart
									.xAxis()
									.tickFormat(
											function(d) {
												var returntype = '';
												if (d == "") {
													returntype = "<<>>";
												} else {
													returntype = d;
												}

												if (options.xaxisticklength == ''
														|| options.xaxisticklength == undefined
														|| options.xaxisticklength == null
														|| returntype.length <= options.xaxisticklength) {

													if (returntype != undefined
															|| returntype != null) {

														if (returntype
																.toString().length > 100) {

															$sessionStorage[chartVal] = returntype
																	.toString()
																	.substr(0,
																			10)
																	+ '...';

															return $sessionStorage[chartVal];

														}
													}
													return returntype;

												} else {
													$sessionStorage[chartVal] = returntype
															.toString()
															.substr(
																	0,
																	options.xaxisticklength)
															+ '...';

													return $sessionStorage[chartVal];

												}

											});

							if (options.chartType == "stackedChart"
									|| options.chartType == "stackedMultiChart"
									|| options.chartType == "stackedSingleClustered"
									|| options.chartType == "stackedMultiClustered"
									|| options.chartType == "stackedAreaMultiChart"
									|| options.chartType == "stackedLineMultiChart") {

								var heightOfContainer = 380, legendHeight = 150, legendY = heightOfContainer
										- legendHeight;
								chart.margins().bottom = 100; // 20 for
								// padding.

								legendY = 25;
								legendX = 70;

								if (trendLineFlag) {

									chart.legend(dc.legend().x(legendX).y(
											legendY).itemHeight(10).gap(5)
											.horizontal(true).legendWidth(600)
											.itemWidth(150));
								} else {
									chart.legend(dc.legend().x(legendX).y(
											legendY).itemHeight(10).gap(5)
											.horizontal(true).legendWidth(400)
											.itemWidth(100));
								}

							}
						},

						commonOptionsForChart : function(dataSet, options,
								objDim, chart) {
							if (options.chartType != 'pieChart') {
								chart.transitionDuration(500).elasticY(true)
								// .elasticX(true)
								.yAxisLabel(options.yAxisLabel).xAxisLabel(
										options.xAxisLabel);

								if (options.rotateLabel) {
									chart.selectAll("g.x text").attr('dx',
											'-30').attr('dy', '0').attr(
											'transform', "rotate(-55)");
									chart.margins({
										top : 50,
										right : 10,
										bottom : 100,
										left : 50
									});
								} else {
									chart.selectAll("g.x text").attr('dx', '0')
											.attr('dy', '10').attr('transform',
													"rotate(0)");
									chart.margins({
										top : 40,
										right : 10,
										bottom : 70,
										left : 50
									});
								}

								if (options.showLabels) {
									chart.renderLabel(true);
								} else {
									chart.renderLabel(false);
								}
								this.showRotateLabels(options.rotateLabel,
										chart);

							}

							if (options.chartType == 'pieChart'
									|| options.chartType == 'stackedChart'
									|| options.chartType == 'stackedMultiChart'
									|| options.chartType == 'stackedMultiClustered'
									|| options.chartType === "stackedAreaMultiChart"
									|| options.chartType === "stackedLineMultiChart") {

								var elmnt = document
										.getElementById(options.chartId
												.substr(1));
								var width = elmnt.offsetWidth;
								var height = elmnt.offsetHeight;
								var legendX = 10, legendY = 25;
								if (options.legendPos === 'Top Left') {
									legendX = 40;
									legendY = 25;
								} else if (options.legendPos === 'Top Center') {
									legendX = width / 2;
									legendY = 25;
								} else if (options.legendPos === 'Top Right') {
									legendX = width / 2;
									legendY = 25;

								} else if (options.legendPos === 'Bottom Left') {
									legendX = 10;
									legendY = height - 40;
								} else if (options.legendPos === 'Bottom Center') {
									legendX = 450;
									legendY = 240;
								} else if (options.legendPos === 'Bottom Right') {
									legendX = width / 2 + 50;
									legendY = height - 30;
								}
								chart.legend(dc.legend().x(legendX).y(legendY)
										.itemHeight(10).gap(5).horizontal(true)
										.legendWidth(480).itemWidth(100)
										.autoItemWidth(true));
							}

						},

						showRotateLabels : function(rotateLabel, chart) {
							if (rotateLabel) {
								chart.render();
								chart.renderlet(function(chart) {
									// rotate x-axis labels
									chart.selectAll("g.x text").attr('dx',
											'-30').attr('dy', '0').attr(
											'transform', "rotate(-55)");
								});

							} else {
								chart.render();
								chart.on('renderlet', function(chart) {
									// rotate x-axis labels
									chart.selectAll("g.x text").attr('dx', '0')
											.attr('dy', '10').attr('transform',
													"rotate(0)");
								});
							}
						},
						/**
						 * Method for drawing Dual Y Axis chart
						 */
						buildDualChart : function(chartId, jsonData, width,
								height, x_axis, group1, group2, group3,
								x_axisLabel, y_axisLabel, right_y_axisLabel,
								legendLabel1, legendLabel2, legendLabel3,
								isStacked, colorArray) {

							if (chartId.substr(0, 1) != "#") {
								chartId = "#" + chartId;
							}

							var composite = dc.compositeChart(chartId);
							var ndx = crossfilter(jsonData);
							var dim = ndx.dimension(function(d) {
								return d[x_axis];
							});

							var grp1 = dim.group().reduceSum(function(d) {
								return d[group1];
							});

							var grp2 = dim.group().reduceSum(function(d) {
								return d[group2];
							});
							var grp3 = "";
							if (group3 != '') {
								grp3 = dim.group().reduceSum(function(d) {
									return d[group3];
								});
							}

							function sort_group(group, order) {
								return {
									all : function() {
										var g = group.all(), map = {};
										g.forEach(function(kv) {
											map[kv.key] = kv.value;
										});
										return order.map(function(k) {
											return {
												key : k,
												value : map[k]
											};
										});
									}
								};
							}
							;

							var order = $.map(jsonData, function(values) {
								return values[x_axis];
							});

							var sorted_group = sort_group(grp3, order);

							var elmnt = document.getElementById(chartId
									.substr(1));
							var width = elmnt.offsetWidth;
							var height = elmnt.offsetHeight;

							composite.width(width).height(height);

							composite.margins({
								top : 60,
								right : 60,
								bottom : 40,
								left : 60
							});

							composite.dimension(dim);

							var stackedChart = dc.barChart(composite).group(
									grp1, legendLabel1).stack(grp2,
									legendLabel2).colors(
									d3.scale.ordinal().domain(dim).range(
											colorArray)).renderLabel(true);
							if (isStacked) {
								stackedChart.barPadding(1).outerPadding(1);
							} else {
								stackedChart.gap(1).groupBars(true).groupGap(4);
							}

							var dims = dim.top(Infinity);
							var barCount = dims.length;
							// if (barCount <= 3) {
							// stackedChart.barPadding(1).outerPadding(1);
							// } else {
							// stackedChart.outerPadding(0.9);
							// }

							composite.x(
									d3.scale.ordinal().domain(
											jsonData.map(function(d) {
												return d[x_axis];
											}))).xUnits(dc.units.ordinal);

							composite.xAxis().tickFormat(function(d) {
								if (d.toString().length > 10) {
									return d.toString().substr(0, 10) + '...';
								}
								return d;
							});

							composite.legend(dc.legend().itemWidth(150)
									.horizontal(true).x(80).y(20)
									.itemHeight(10).gap(5));

							composite.renderHorizontalGridLines(true)
									.renderVerticalGridLines(true);
							// .transitionDuration(0);

							composite.title(function(d) {
								return d.key + '-' + this.layer + ': '
										+ d.value;
							});

							composite.elasticY(true);
							composite.yAxis().ticks(6);

							composite.rightYAxis().ticks(6);
							/*
							 * composite.rightYAxis().tickFormat(function(v) {
							 * return v + '%'; });
							 */

							composite.compose([
									stackedChart,
									dc.lineChart(composite).colors(
											colorArray.slice(2, 3)[0]).group(
											sorted_group, legendLabel3)
											.renderDataPoints({
												radius : 4,
												fillOpacity : 0.8,
												strokeOpacity : 0.8
											}).useRightYAxis(true) ]);

							composite.xAxisLabel(x_axisLabel).yAxisLabel(
									y_axisLabel).rightYAxisLabel(
									right_y_axisLabel).brushOn(false);

							// dc.renderAll();
							composite.render();
							window.onresize = function(i) {
								var elmnt = document.getElementById(chartId);
								if (elmnt != null && elmnt != undefined) {
									var width = elmnt.offsetWidth;
									var height = elmnt.offsetHeight;

									composite.width(width).height(height);

									composite.redraw();
								}

							};

							return composite;
						},
						/**
						 * Method for drawing Stacked Area Chart chart
						 */
						buildStackedAreaChart : function(chartId, jsonData,
								width, height, x_axis, group1, group2,
								x_axisLabel, y_axisLabel, legendLabel1,
								legendLabel2) {

							var composite = dc.compositeChart("#" + chartId);
							var ndx = crossfilter(jsonData);
							var dim = ndx.dimension(function(d) {
								return d[x_axis];
							});

							var grp1 = dim.group().reduceSum(function(d) {
								return d[group1];
							});
							var grp2 = dim.group().reduceSum(function(d) {
								return d[group2];
							});
							var elmnt = document.getElementById(chartId);
							var width = elmnt.offsetWidth;
							var height = elmnt.offsetHeight;
							composite.width(width).height(height);

							composite.margins({
								top : 60,
								right : 60,
								bottom : 120,
								left : 40
							});

							composite.dimension(dim);

							composite.x(
									d3.scale.ordinal().domain(
											jsonData.map(function(d) {
												return d[x_axis];
											}))).xUnits(dc.units.ordinal);

							/*
							 * composite.xAxis().tickFormat(function(d){
							 * if(d.toString().length > 10) { return
							 * d.toString().substr(0, 10) + '...'; } return d;
							 * });
							 */

							composite.legend(dc.legend().itemWidth(150)
									.horizontal(true).x(80).y(20)
									.itemHeight(10).gap(5));

							composite.renderHorizontalGridLines(false)
									.renderVerticalGridLines(false);

							composite.title(function(d) {
								return d.key + '-' + this.layer + ': '
										+ d.value;
							});

							composite.elasticY(true);
							composite.yAxis().ticks(6);

							composite.rightYAxis().ticks(6);
							composite.rightYAxis().tickFormat(function(v) {
								return v + '%';
							});

							composite.compose([

									dc.lineChart(composite).colors('#ED7D31')
											.group(grp2, legendLabel1)
											.renderDataPoints({
												radius : 4,
												fillOpacity : 0.8,
												strokeOpacity : 0.8
											}).renderArea(true)

									,
									dc.lineChart(composite).colors('#B991C5')
											.group(grp1, legendLabel2)
											.renderDataPoints({
												radius : 4,
												fillOpacity : 0.8,
												strokeOpacity : 0.8
											}).renderArea(true)

							]);
							composite.xAxisLabel(x_axisLabel).yAxisLabel(
									y_axisLabel).brushOn(false);

							composite.on('renderlet', function(chart) {
								chart.selectAll("g.x text").attr('dx', '-30')
										.attr('dy', '0').attr('transform',
												"rotate(-55)");
							});
							// dc.renderAll();
							composite.render();
							window.onresize = function(i) {

								var elmnt = document.getElementById(chartId);
								var width = elmnt.offsetWidth;
								var height = elmnt.offsetHeight;

								composite.width(width - 100).height(height);

								composite.redraw();

							};
						},

						/**
						 * Method for getting Chart Insance
						 */
						getChartInstance : function(chartType, chartId) {
							var chartInst;
							if (chartType == 'lineChart'
									|| chartType == 'areaChart'
									|| chartType == 'stackedAreaMultiChart'
									|| chartType == 'stackedLineMultiChart') {
								chartInst = dc.lineChart(chartId);
							} else if (chartType == 'barChart') {
								chartInst = dc.barChart(chartId);
							} else if (chartType == 'stackedChart'
									|| chartType == 'stackedMultiChart'
									|| chartType == 'stackedSingleClustered'
									|| chartType == 'stackedMultiClustered') {
								chartInst = dc.barChart(chartId);
							} else if (chartType == 'pieChart') {
								chartInst = dc.pieChart(chartId);
							} else if (chartType == 'scatterChart') {
								chartInst = dc.scatterPlot(chartId);
							} else if (chartType == 'compositeChart') {
								chartInst = dc.compositeChart(chartId);
							}

							return chartInst;
						},

						shadeBlend : function(p, c0, c1) {
							var n = p < 0 ? p * -1 : p, u = Math.round, w = parseInt;
							if (c0.length > 7) {
								var f = c0.split(","), t = (c1 ? c1
										: p < 0 ? "rgb(0,0,0)"
												: "rgb(255,255,255)")
										.split(","), R = w(f[0].slice(4)), G = w(f[1]), B = w(f[2]);
								return "rgb("
										+ (u((w(t[0].slice(4)) - R) * n) + R)
										+ "," + (u((w(t[1]) - G) * n) + G)
										+ "," + (u((w(t[2]) - B) * n) + B)
										+ ")"
							} else {
								var f = w(c0.slice(1), 16), t = w((c1 ? c1
										: p < 0 ? "#000000" : "#FFFFFF")
										.slice(1), 16), R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF;
								return "#"
										+ (0x1000000
												+ (u(((t >> 16) - R1) * n) + R1)
												* 0x10000
												+ (u(((t >> 8 & 0x00FF) - G1)
														* n) + G1) * 0x100 + (u(((t & 0x0000FF) - B1)
												* n) + B1)).toString(16).slice(
												1)
							}
						},

					}

					function shadeBlend(p, c0, c1) {
						var n = p < 0 ? p * -1 : p, u = Math.round, w = parseInt;
						if (c0.length > 7) {
							var f = c0.split(","), t = (c1 ? c1
									: p < 0 ? "rgb(0,0,0)" : "rgb(255,255,255)")
									.split(","), R = w(f[0].slice(4)), G = w(f[1]), B = w(f[2]);
							return "rgb(" + (u((w(t[0].slice(4)) - R) * n) + R)
									+ "," + (u((w(t[1]) - G) * n) + G) + ","
									+ (u((w(t[2]) - B) * n) + B) + ")"
						} else {
							var f = w(c0.slice(1), 16), t = w((c1 ? c1
									: p < 0 ? "#000000" : "#FFFFFF").slice(1),
									16), R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF;
							return "#"
									+ (0x1000000
											+ (u(((t >> 16) - R1) * n) + R1)
											* 0x10000
											+ (u(((t >> 8 & 0x00FF) - G1) * n) + G1)
											* 0x100 + (u(((t & 0x0000FF) - B1)
											* n) + B1)).toString(16).slice(1)
						}
					}

					function getChartSize(chartId, sliderHeight, panelId) {

						var getResizeId = null;
						if (panelId == undefined) {
							getResizeId = chartId.substr(1);
							var elmnt = document.getElementById(getResizeId);

							var width = elmnt.offsetWidth;
							var height = elmnt.offsetHeight;
						} else {
							getResizeId = "panelId" + panelId;
							var elmnt = document.getElementById(getResizeId);

							var width = elmnt.offsetWidth;
							var height = elmnt.offsetHeight;

							if ($sessionStorage["screen" + panelId + "Size"] !== "smallScreen") {
								width = elmnt.offsetWidth - 50;
								height = elmnt.offsetHeight - 80;
							} else {
								var width = elmnt.offsetWidth - 100;
								var height = elmnt.offsetHeight;
							}
						}

						if (sliderHeight && sliderHeight != '') {
							width = width - 60;
							height = sliderHeight;
						}

						return [ width, height ];
					}
					function getGroups(data3, format, format1, options) {
						var dateFormat = d3.time.format(format);
						var dateFormat1 = d3.time.format(format1);
						data3.forEach(function(d) {
							var tempDate = d[options.xAxis];
							d.tempCreated = dateFormat.parse(tempDate);
							// var tempCreated1 = dateFormat1(new Date(
							// d.tempCreated));
							// d.tempCreated1 = dateFormat1.parse(tempCreated1);
						});
						var facts = crossfilter(data3);
						var dateDim = facts.dimension(function(d) {
							return d.tempCreated;
						});
						var timeChartDates = dateDim.group();
						var groups = timeChartDates.top(Infinity);
						return groups;
					}
					function getGroupsBetween(groups, date1, date2) {
						var groupsTemp = [];
						groups.forEach(function(item, index) {
							if (item.key >= date1 && item.key <= date2) {
								groupsTemp.push(item);
							}
						});
						// console.log('groupsTemp: ', groupsTemp);
						return groupsTemp;
					}
				});
