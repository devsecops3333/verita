mainApp
		.service(
				'myDashboardService',
				function($rootScope, $http, $compile, $sessionStorage,
						$timeout, widgetService, commonService) {
					return {
						// This calls buildgarphgauge function from widget_svc
						buildGaugeChart : function(dataSet, chartId, chartInfo,
								screenSize) {

							var options = {
								chartId : chartId,
								chartSummary : chartInfo.chartSummary,
								chartSummaryPositionX : 600,
								chartSummaryPositionY : 10,
								gaugeGroup : chartInfo.gaugeColumn,
								gAggrFunc : chartInfo.aggrFunG,
								gaugeMaxValue : chartInfo.gaugeMaxValue,
								ChartType : chartInfo.gaugeType,
								colorsArray : commonService
										.getColorsArray(chartInfo.colorsArray),
								size : screenSize,
								clipWidth : screenSize,
								clipHeight : screenSize - 100,
								ringWidth : screenSize / 4,
								margins : {
									top : 40,
									right : 10,
									bottom : 80,
									left : 50
								},
							};

							return widgetService.buildGraphGauge(dataSet,
									options);
						},

						buildGraphs : function(dataSet, chartId, chartInfo,
								index) {

							var trendline = [];

							if (chartInfo.chartType === "stackedMultiClustered"
									|| chartInfo.chartType === "stackedMultiChart") {

								if (commonService
										.getColorsArray(chartInfo.trendLineOptions).length !== 1) {

									trendline = [
											true,
											commonService
													.getColorsArray(chartInfo.trendLineOptions) ];
								} else {

									trendline = [ false, "" ];
								}

							} else {
								trendline = commonService
										.getColorsArray(chartInfo.trendLineOptions)
							}

							var options = {
								panelId : index,
								chartType : chartInfo.chart_type,
								chartId : chartId,
								chartSummary : chartInfo.chartSummary,
								xAxis : chartInfo.x_axis,
								yAxis : chartInfo.y_axis,
								xAggrFunc : chartInfo.aggr_func,
								yAggrFunc : chartInfo.aggr_func_y,
								groupBy : chartInfo.groupBy,
								xAxisLabel : chartInfo.x_axis_title,
								yAxisLabel : chartInfo.y_axis_title,
								// for stacked
								// grouped bar chart
								groupBy1 : chartInfo.groupBy1,
								groupArray : commonService
										.getColorsArray(chartInfo.groupArray),

								colorsArray : commonService
										.getColorsArray(chartInfo.colorsArray),
								valueOrPercentage : chartInfo.valueOrPercentage,
								xaxisticklength : chartInfo.xAxisticklength,

								showLabels : chartInfo.showLabels,
								rotateLabel : chartInfo.rotateLabel,

								xaxisDataType : chartInfo.xAxisDataType,
								dataFormat : chartInfo.xaxisDateFormat,

								legendPos : chartInfo.legendPos,
								brushOnFlag : false,
								noYAxis : false,
								sliderHeight : '',
								trendLineOptions : trendline,
							}

							var chartObj = widgetService.buildGraph(dataSet,
									options);
							chartObj.on('renderlet', function(chart) {
								$('.dc-legend-item line:last').removeAttr(
										"stroke-dasharray");
								chart.selectAll('.axis line, .axis path')
										.style({
											'stroke' : 'Black',
											'fill' : 'none',
											'stroke-width' : '1px'
										});
								chart.selectAll('.dc-legend line').style({
									'stroke-width' : '10px'
								});
								chart.selectAll('.dc-chart path.area').style({
									'fill-opacity' : '0.3'
								});
								chart.selectAll('path.line').style({
									'fill' : '#FFF',
									'fill-opacity' : '0'
								});
								chart.selectAll('.dc-chart .pie-slice text')
										.style({
											'fill' : '#FFF',
											'fill-opacity' : '0'
										});

								chart.svg().style("font-size", "12px");
								var chartIndex = options.chartId.replace(
										/#standWidget|#custWidget/gi, '');

								if (options.chartType !== "pieChart"
										|| options.chartType !== "lineChart"
										|| options.chartType !== 'areaChart') {

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
							return chartObj;

						},
						/**
						 * Method for displaying slider to a chart
						 */
						showSliderChart : function(index, dataSet, charts,
								chartInfo) {
							var sliderChart = null;
							var sliderChartIdTemp = 'custWidget' + index
									+ '_Slider';
							var sliderChartId = '#custWidget' + index
									+ '_Slider';

							var slider = "<div id='"
									+ sliderChartIdTemp
									+ "' style='width: 100%; display: block;'></div>";
							$(sliderChartId).show()
							if ($(sliderChartId).html() == undefined
									|| $(sliderChartId).html() == '') {
								$(slider).insertBefore('#custWidget' + index);
							}

							var brushStarted = false;

							var options = {

								chartType : chartInfo.chartType,
								chartId : sliderChartId,
								chartSummary : '',
								xAxis : chartInfo.xAxisName,
								yAxis : chartInfo.yAxisName,
								xAggrFunc : chartInfo.aggrFunc,
								yAggrFunc : chartInfo.aggrFuncY,
								groupBy : chartInfo.groupBy,
								// xAxisLabel : chartInfo.xAxisNameTitle,
								// yAxisLabel : chartInfo.yAxisNameTitle,
								// for stacked
								// grouped bar chart
								groupBy1 : chartInfo.groupBy1,
								groupBy2 : chartInfo.groupBy2,
								groupBy3 : chartInfo.groupBy3,
								groupBy4 : '',

								colorsArray : commonService
										.getColorsArray(chartInfo.colorsArray),
								valueOrPercentage : chartInfo.valueOrPercentage,
								xaxisticklength : chartInfo.xAxisticklength,

								showLabels : chartInfo.showLabels,
								rotateLabel : chartInfo.rotateLabel,

								xaxisDataType : chartInfo.xaxisDataType,
								dataFormat : chartInfo.dataFormat,
								legendPos : chartInfo.legendPosition,
								brushOnFlag : true,
								noYAxis : true,
								sliderHeight : 120,
							}

							sliderChart = widgetService.buildGraph(dataSet,
									options);

							var dates = this.getDatesMinMax(dataSet,
									chartInfo.xAxisName, chartInfo.dataFormat);
							var minDate = dates[0];
							var maxDate = dates[1];

							minDate = d3.time.day.offset(minDate, -1);
							maxDate = d3.time.day.offset(maxDate, 1);

							var mainChart = charts[index];
							mainChart.rangeChart(sliderChart);
							mainChart.redraw();
							mainChart.render();

							sliderChart.on("filtered", function(chart) {
								dc.events.trigger(function() {
									mainChart.focus(chart.filter());
								});
							});

							mainChart.on('postRender', function(chart) {
								if (!brushStarted) {
									sliderChart.filter(dc.filters.RangedFilter(
											minDate, maxDate));
									brushStarted = true;
								}
							});

						},
						/**
						 * End
						 */
						// /////////////////////////// Drill down and filter
						// dialog related methods://///////////////////
						buildHtmlTable : function(myList, container) {
							var dataobject = null;

							$(container).html('');
							var columns = this.addAllColumnHeaders(myList,
									container);

							for (var i = 0; i < myList.length; i++) {
								var row$ = $('<tr/>');
								for (var colIndex = 0; colIndex < columns.length; colIndex++) {
									var cellValue = myList[i][columns[colIndex]];
									if (cellValue == null) {
										cellValue = "";
									}
									row$.append($(
											'<td data-val="' + colIndex + '_'
													+ cellValue + '"/>').html(
											cellValue));
								}
								$(container).append(row$);
								if (myList.length - 1 === i) {

									if (!$.fn.dataTable.isDataTable(container)) {
										dataobject = $(container)
												.DataTable(
														{
															"aLengthMenu" : [
																	[ 9, 15,
																			50,
																			-1 ],
																	[ 9, 15,
																			50,
																			"All" ] ],
															"iDisplayLength" : 9,
															"ordering" : false
														});
										return dataobject;
									}

								}
							}
						},

						addAllColumnHeaders : function(myList, container) {
							var columnSet = [];
							var headerTr$ = $('<tr/>');
							var tHead$ = $('<thead/>');

							for (var i = 0; i < myList.length; i++) {
								var rowHash = myList[i];
								var j = 0;
								for ( var key in rowHash) {
									if ($.inArray(key, columnSet) == -1) {
										columnSet.push(key);
										headerTr$
												.append($(
														'<th><i class="fa fa-filter" index="'
																+ j
																+ '" aria-hidden="true"><div class="filter" align="left" style="display: none;"></div></i></th>')
														.prepend(key));
										j++;
									}
								}
							}
							$(tHead$).append(headerTr$);
							$(container).append(tHead$);

							return columnSet;
						},

						// ///////////////////////////// End of Drill down
						// methods///////////////////////////

						/*******************************************************
						 * get empty widget dom building
						 */
						buildSEmptyWidgetDOM : function(userWidnfo, index,
								noDataDiv, chartDiv, sprintDiv, type) {

							var onlineOfflineToggle = "";
							if ($sessionStorage.dataSourceTypeFromDB == "Offline") {
								onlineOfflineToggle = '<input id="'
										+ index
										+ '" class="datatypesCheck1" type="checkbox" checked data-toggle="toggle" data-style="ios" data-size="mini"/>';
							}

							var menuItem = '<div class="widgetMenuIncludeDiv" ng-include src="\'views/app/widgets/widgetMenu/widgetCIOMenu.html\'"></div>';
							var domBody = '<div class="col-md-'
									+ (type == undefined ? userWidnfo.type
											: type)
									+ ' col-xs-12 widgetDiv custPanelP'
									+ userWidnfo.customWidgetId
									+ '"><div class="customWidgetPanel hvr-glow panel custPanel'
									+ index
									+ '"><div class="panel-heading">'
									+ menuItem
									+ '<b class="panelHeaderTextPadding_'
									+ index
									+ '">'
									+ userWidnfo.widgetName
									+ '</b>'
									+ "<div class='dropdownL dropbtn myDBIcon' align='right'>"
									+ "<a class='TitleName'"
									+ ' ng-click = "deleteWidget('
									+ userWidnfo.customWidgetId
									+ ' ,'
									+ index
									+ ')">'
									+ '<i class="fa fa-times-circle menu-item-icon" aria-hidden="true" title="Remove From MyDashboard"></i></a>'
									+ onlineOfflineToggle
									+ '<a class="TitleName" id="edit_'
									+ index
									+ '" ng-click= "editWidget('
									+ index
									+ ')"><i class="fa fa-pencil-square-o" aria-hidden="true" title="Edit"></i></a>'
									+ '<a class="TitleName" data-toggle="modal" data-target="#filterModel" id="filter_'
									+ index
									+ '" ng-click= "filterData('
									+ index
									+ ')"><i class="fa fa-filter" data-placement="bottom" data-toggle="tooltip" title="Filter" aria-hidden="true"></i></a></div></div>'
									+ '<div class="customWidgetPanelBody panel-body" id="panelId'
									+ index
									+ '">'
									+ '<div class="loadImage_class" id="loader'
									+ index
									+ '"><img src="views/assets/images/spinner.gif" alt="" class="whiteImg"/>'
									+ '<img src="views/assets/images/spinner_blacktheme.gif" alt="" class="blackImg"/></div>'
									+ noDataDiv + chartDiv + sprintDiv
									+ '</div></div></div></div>';

							return domBody;
						},

						buildSPreviewEmptyWidgetDOM : function(userWidnfo,
								index, noDataDiv, chartDiv, sprintDiv, type) {

							var menuItem = '<div class="widgetMenuIncludeDiv" ng-include src="\'views/app/widgets/widgetMenu/widgetCIOMenu.html\'"></div>';
							var domBody = '<div class="col-md-'
									+ (type == undefined ? userWidnfo.type
											: type)
									+ ' col-xs-12 widgetDiv previewCustPanelStandWidgetP'
									+ userWidnfo.customWidgetId
									+ '"><div class="customWidgetPanel hvr-glow panel custPanel'
									+ index
									+ '"><div class="panel-heading">'
									+ '<b class="panelHeaderTextPadding_'
									+ index
									+ '">'
									+ userWidnfo.widgetName
									+ '</b>'
									+ "<div class='dropdownL dropbtn myDBIcon' align='right'>"
									+ "<a class='TitleName'"
									+ ' ng-click = "deleteWidget('
									+ userWidnfo.customWidgetId
									+ ' ,'
									+ index
									+ ')">'
									+ '</a>'
									+ '<a class="TitleName" id="edit_'
									+ index
									+ '" ng-click= "editWidget('
									+ index
									+ ')"></a>'
									+ '<a class="TitleName" data-toggle="modal" data-target="#filterModel" id="filter_'
									+ index
									+ '" ng-click= "filter Data('
									+ index
									+ ')"></a></div></div>'
									+ '<div class="customWidgetPanelBody panel-body" id="panelId'
									+ index
									+ '">'
									+ '<div class="loadImage_class" id="loader'
									+ index
									+ '"><img src="views/assets/images/spinner.gif" alt="" class="whiteImg"/>'
									+ '<img src="views/assets/images/spinner_blacktheme.gif" alt="" class="blackImg"/></div>'
									+ noDataDiv + chartDiv + sprintDiv
									+ '</div></div></div></div>';

							return domBody;
						},
						buildEmptyWidgetDOM : function(userWidnfo, index,
								noDataDiv, chartDiv) {

							var menuItem = '<div class="widgetMenuIncludeDiv" ng-include src="\'views/app/widgets/widgetMenu/widgetCIOMenu.html\'"></div>';
							var domBody = '<div class="col-md-6 col-xs-12 widgetDiv custPanelP'
									+ userWidnfo.customWidgetId
									+ '"><div class="customWidgetPanel hvr-glow panel custPanel'
									+ index
									+ '"><div class="panel-heading">'
									+ menuItem
									+ '<b class="panelHeaderTextPadding_'
									+ index
									+ '">'
									+ userWidnfo.widgetName
									+ '</b>'
									+ '<div class="dropdownL dropbtn myDBIcon" align="right"><a class="TitleName" ng-click="deleteWidget('
									+ userWidnfo.customWidgetId
									+ ' ,'
									+ index
									+ ');"><i class="fa fa-times-circle" aria-hidden="true" title="Remove From MyDashboard"></i></a>'
									+ '<a class="TitleName" id="edit_'
									+ index
									+ '" ng-click= "editWidget('
									+ index
									+ ')"><i class="fa fa-pencil-square-o" aria-hidden="true" title="Edit"></i></a>'
									+ '<a class="TitleName" data-toggle="modal" data-target="#filterModel" id="filter_'
									+ index
									+ '" ng-click= "filterData('
									+ index
									+ ')"><i class="fa fa-filter" data-placement="bottom" data-toggle="tooltip" title="Filter" aria-hidden="true"></i></a></div></div>'
									+ '<div class="customWidgetPanelBody panel-body" id="panelId'
									+ index
									+ '">'
									+ noDataDiv
									+ chartDiv
									+ '<div class="loadImage_class" id="loader'
									+ index
									+ '"><img src="views/assets/images/spinner.gif" alt="" class="whiteImg"/>'
									+ '<img src="views/assets/images/spinner_blacktheme.gif" alt="" class="blackImg"/></div>'

									+ '</div></div></div></div>';
							return domBody;
						},
						buildEmptyWidgetDOMPreview : function(userWidnfo,
								index, noDataDiv, chartDiv) {

							var menuItem = '<div class="widgetMenuIncludeDiv" ng-include src="\'views/app/widgets/widgetMenu/widgetCIOMenu.html\'"></div>';
							var domBody = '<div class="col-md-6 col-xs-12 widgetDiv myDashboardCustPanelPreview'
									+ userWidnfo.customWidgetId
									+ '"><div class="customWidgetPanel hvr-glow panel custPanel'
									+ index
									+ '"><div class="panel-heading">'
									+ menuItem
									+ '<b class="panelHeaderTextPadding_'
									+ index
									+ '">'
									+ userWidnfo.widgetName
									+ '</b>'
									+ '<div class="dropdownL dropbtn myDBIcon" align="right"><a class="TitleName" ng-click="deleteWidget('
									+ userWidnfo.customWidgetId
									+ ' ,'
									+ index
									+ ');"><i class="fa fa-times-circle" aria-hidden="true" title="Remove From MyDashboard"></i></a>'
									+ '<a class="TitleName" id="edit_'
									+ index
									+ '" ng-click= "editWidget('
									+ index
									+ ')"><i class="fa fa-pencil-square-o" aria-hidden="true" title="Edit"></i></a>'
									+ '<a class="TitleName" data-toggle="modal" data-target="#filterModel" id="filter_'
									+ index
									+ '" ng-click= "filterData('
									+ index
									+ ')"><i class="fa fa-filter" data-placement="bottom" data-toggle="tooltip" title="Filter" aria-hidden="true"></i></a></div></div>'
									+ '<div class="customWidgetPanelBody panel-body" id="panelId'
									+ index
									+ '">'
									+ noDataDiv
									+ chartDiv
									+ '<div class="loadImage_class" id="loader'
									+ index
									+ '"><img src="views/assets/images/spinner.gif" alt="" class="whiteImg"/>'
									+ '<img src="views/assets/images/spinner_blacktheme.gif" alt="" class="blackImg"/></div>'

									+ '</div></div></div></div>';
							return domBody;
						},
						/**
						 * End
						 */

						/**
						 * For Power gauge
						 */

						buildPowerGaugeSmallScreen : function(chartId, colors) {

							return gauge(chartId, {
								size : 400,
								clipWidth : 400,
								clipHeight : 300,
								ringWidth : 70,
								maxValue : 100,
								transitionMs : 4000,
								arcColorFn : d3.interpolateHsl(d3.rgb(colors),
										widgetService.shadeBlend(40, colors))
							});
						},
						/**
						 * End
						 */

						/**
						 * Common Methods
						 */

						getJSONByKeyVal : function(obj, key, val) {
							var objects = [];
							for ( var i in obj) {

								if (!obj.hasOwnProperty(i))
									continue;
								if (typeof obj[i] == 'object') {
									objects = objects.concat(this
											.getJSONByKeyVal(obj[i], key, val));
								} else if (i == key && obj[i] == val
										|| i == key && val == '') { //
									objects.push(obj);
								} else if (obj[i] == val && key == '') {
									if (objects.lastIndexOf(obj) == -1) {
										objects.push(obj);
									}
								}
							}
							return objects;
						},

						filterJsonByKeys : function(data, keys) {

							var newData = [];
							for (var i = 0; i < data.length; i++) {
								var temp = {};
								for (var colIndex = 0; colIndex < keys.length; colIndex++) {
									var cellValue = data[i][keys[colIndex]];
									if (cellValue == null) {
										cellValue = "";
									} else {
										temp[keys[colIndex]] = cellValue;
									}

								}
								newData.push(temp);
							}

							return newData;
						},

						getDatesMinMax : function(data, dimension, dataFormat) {

							var dateFormat = d3.time.format(dataFormat);
							data.forEach(function(d) {
								d['dimension_new'] = dateFormat
										.parse(d[dimension]);
							});
							dimension = 'dimension_new';
							var dataIndex = crossfilter(data);
							var dateDim = dataIndex.dimension(function(d) {
								return d[dimension];
							});

							minDate = dateDim.bottom(1)[0][dimension];
							maxDate = dateDim.top(1)[0][dimension];

							return [ minDate, maxDate ];
						},

						tableToJson : function(table) {
							var myRows = [];
							var headersText = [];
							var $headers = $(table + " th");

							var $rows = $(table + " tbody tr")
									.each(
											function(index, ele) {
												if ($(ele).is(":visible")) {
													$cells = $(this).find("td");
													var temp = {}
													$cells
															.each(function(
																	cellIndex) {
																if (headersText[cellIndex] === undefined) {
																	var text = $(
																			$headers[cellIndex])
																			.contents()
																			.filter(
																					function() {
																						return this.nodeType == 3;
																					})
																			.text();
																	headersText[cellIndex] = text;
																}
																temp[headersText[cellIndex]] = $(
																		this)
																		.text();
															});
													myRows.push(temp);
												}
											});

							$timeout(function() {
								if (!$.fn.dataTable.isDataTable(table)) {
									$(table).DataTable(
											{
												"aLengthMenu" : [
														[ 9, 15, 50, -1 ],
														[ 9, 15, 50, "All" ] ],
												"iDisplayLength" : 9,
												"ordering" : false
											});
								}
							}, 10);
							return myRows;
						}

					/**
					 * End
					 */

					}

				});