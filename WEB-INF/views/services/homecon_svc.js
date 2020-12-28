mainApp
		.service(
				'homeService',
				function($rootScope, $http, $compile, $sessionStorage,
						$timeout, widgetService, commonService) {
					return {
						// This calls buildgarphgauge function from widget_svc
						callGaugeGraph : function(dataSet, chartId, chartInfo,
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

						callBuildGraph : function(dataSet, chartId, chartInfo,
								id) {

							var trendline = [];
							var options = {
								panelId : chartId,
								chartType : chartInfo.chart_type,
								chartId : id + chartId,
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
								groupBy2 : chartInfo.groupBy2,
								groupBy3 : chartInfo.groupBy3,
								groupBy4 : '',
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

								// trendLineOptions : trendline,

								xTickFormat : chartInfo.xTickFormat,
								xTickType : chartInfo.xTickType,
								height : chartInfo.height,
								clickevent : chartInfo.clickevent,
								width : chartInfo.width
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

						// method for refresh of widgets
						callRefresh : function(userInfo, index) {

							$('#power-gauge').html('');
							$('#standWidget' + index).html('');
							$('#standWidget' + index).hide();
							$('#loader' + index).show();
							/* $('#errDiv' + index).hide(); */

							var onOffFlag = "Offline";
							if ($sessionStorage.dataSourceTypeFromDB == "Offline") {
								var checkState = $('.datatypesCheck').is(
										":checked");
								if (checkState) {
									onOffFlag = "Online";
								}
							} else {
								onOffFlag = $sessionStorage.dataSourceTypeFromDB;
							}

							return widgetService.getWidgetDataByType(
									userInfo.datacenter_widget_id, onOffFlag);
						},

						/**
						 * Method for displaying slider to a chart
						 */
						showSliderChart : function(index, dataSet, charts) {
							var sliderChart = null;
							var sliderChartIdTemp = 'standWidget' + index
									+ '_Slider';
							var sliderChartId = '#standWidget' + index
									+ '_Slider';

							var slider = "<div id='"
									+ sliderChartIdTemp
									+ "' style='width: 100%; display: block;'></div>";
							$(sliderChartId).show();
							if ($(sliderChartId).html() == undefined
									|| $(sliderChartId).html() == '') {

								$(slider).insertBefore('#standWidget' + index);
							}

							var brushStarted = false;
							var chartInfo = $sessionStorage.UserWidgetsInfo[index].chartInformation;
							var options = {

								chartType : chartInfo.chart_type,
								chartId : sliderChartId,
								chartSummary : '',
								xAxis : chartInfo.x_axis,
								yAxis : chartInfo.y_axis,
								xAggrFunc : chartInfo.aggr_func,
								yAggrFunc : chartInfo.aggr_func_y,
								groupBy : chartInfo.groupBy,
								// xAxisLabel : chartInfo.x_axis_title,
								// yAxisLabel : chartInfo.y_axis_title,
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

								xaxisDataType : chartInfo.xAxisDataType,
								dataFormat : chartInfo.xaxisDateFormat,
								legendPos : chartInfo.legendPos,
								brushOnFlag : true,
								noYAxis : true,
								sliderHeight : 120,
							}
							sliderChart = widgetService.buildGraph(dataSet,
									options);

							var dates = this
									.getDatesMinMax(
											dataSet,
											$sessionStorage.UserWidgetsInfo[index].chartInformation.x_axis,
											chartInfo.xaxisDateFormat);
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

						/**
						 * Method for calculating value for a gauge chart.
						 */
						showGaugeAggrValue : function(dataSet, gaugeGroup,
								gAggrFunc) {

							if (gaugeGroup == "") {
								$("#errorMsg").text("Please select a column");
								return false;
							} else {
								$("#errorMsg").text("");
							}

							var ndx = crossfilter(dataSet);

							var all = ndx.groupAll();
							var allCount = all.value();

							var netTotal = ndx.groupAll().reduceSum(
									function(d) {
										return d[gaugeGroup];
									});
							var allSum = netTotal.value();

							var allAvg = allSum / allCount;

							if (gAggrFunc == 'sum') {
								$('#selAggrHM').show();
								$('#selAggrValHM').show();
								$('#selAggrHM').text('Sum:	');
								$('#selAggrValHM').text(allSum);
								return allSum;
							} else if (gAggrFunc == 'count') {
								$('#selAggrHM').show();
								$('#selAggrValHM').show();
								$('#selAggrHM').text('Count:	');
								$('#selAggrValHM').text(allCount);
								return allCount;
							} else if (gAggrFunc == 'avg') {
								$('#selAggrHM').show();
								$('#selAggrValHM').show();
								$('#selAggrHM').text('Avg:	');
								$('#selAggrValHM').text(allAvg);
								return allAvg;
							}

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
														'<th><i class="fa fa-filter filter-options" index="'
																+ j
																+ '" aria-hidden="true"><div class="filter" align="left" style="display: none;"></div></i></th>')
												// .append(
												// $('<div class="filter"
												// align="left" style="display:
												// none;"></div>'))
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
						buildEmptyWidgetDOM : function(userWidnfo, index,
								noDataDiv, chartDiv, sprintDiv, type, slideVar) {

							var onlineOfflineToggle = "";
							if ($sessionStorage.dataSourceTypeFromDB == "Offline") {
								onlineOfflineToggle = '<input id="'
										+ index
										+ '" class="datatypesCheck" name="dashboardOnOff" type="checkbox" checked data-toggle="toggle" data-style="ios" data-size="mini"/>';
							}

							var menuItem = '<div class="widgetMenuIncludeDiv" ng-include src="\'views/app/widgets/widgetMenu/widgetCIOMenu.html\'"></div>';
							var domBody = '<div class="col-md-'
									+ (type == undefined ? userWidnfo.type
											: type)
									+ ' widgetDiv custPanelP'
									+ index
									+ '"><div class="customWidgetPanel hvr-glow panel custPanel'
									+ index
									+ '"><div class="panel-heading">'
									+ menuItem
									+ '<b class="panelHeaderTextPadding_'
									+ index
									+ '">'
									+ userWidnfo.name
									+ '</b><div class="dropdownL dropbtn myDBIcon" align="right">'
									+ onlineOfflineToggle
									+ '<a class="TitleName" id="add_'
									+ index
									+ '" ng-click = "add2MyDashboard('
									+ index
									+ ')"><i class="fa fa-tachometer menu-item-icon"  data-placement="bottom" data-toggle="tooltip" title="Add to My Dashboard" aria-hidden="true"></i></a>'
									+ '<a class="TitleName" id="edit_'
									+ index
									+ '" ng-click= "editWidget('
									+ index
									+ ')"><i class="fa fa-pencil-square-o" data-placement="bottom" data-toggle="tooltip" title="Edit" aria-hidden="true"></i></a>'
									+ '<a class="TitleName" data-toggle="modal" id="filter_'
									+ index
									+ '" data-target="#filterModel" ng-click= "filterData('
									+ index
									+ ')"><i class="fa fa-filter" data-placement="bottom" data-toggle="tooltip" title="Filter" aria-hidden="true"></i></a></div></div><div class="customWidgetPanelBody panel-body" id="panelId'
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

						buildEmptyWidgetDOMDownload : function(userWidnfo,
								index, noDataDiv, chartDiv, sprintDiv, type) {
							var menuItem = '<div class="widgetMenuIncludeDiv" ></div>';
							var domBody = '<div class="col-md-'
									+ (type == undefined ? userWidnfo.type
											: type)
									+ ' widgetDiv previewCustPanelP'
									+ index
									+ '"><div class="customWidgetPanel hvr-glow panel custPanel'
									+ index
									+ '"><div class="panel-heading">'
									+ menuItem
									+ '<b class="panelHeaderTextPadding">'
									+ userWidnfo.name
									+ '</b><div class="dropdownL dropbtn myDBIcon" align="right"><a class="TitleName" id="add_'
									+ index
									+ '" ng-click = "add2MyDashboard('
									+ index
									+ ')"></a>'
									+ '<a class="TitleName" id="edit_'
									+ index
									+ '" ng-click= "editWidget('
									+ index
									+ ')"></a>'
									+ '<a class="TitleName" data-toggle="modal" id="filter_'
									+ index
									+ '" data-target="#filterModel" ng-click= "filterData('
									+ index
									+ ')"></a></div></div><div class="customWidgetPanelBody panel-body" id="panelId'
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

						/**
						 * End
						 */

						/**
						 * Update Session Object Method
						 */

						updateSessionObject : function(dataObject) {

							var chartObj = {
								"chart_type" : dataObject.chartType,
								"x_axis" : dataObject.xAxis,
								"x_axis_title" : dataObject.xAxisTitle,
								"y_axis" : dataObject.yAxis,
								"y_axis_title" : dataObject.yAxisTitle,
								"aggr_func" : dataObject.aggrFunc,
								"aggr_func_y" : dataObject.aggrFuncY,
								"groupBy" : this
										.returnValidData(dataObject.groupBy),
								"groupBy1" : this
										.returnValidData(dataObject.groupBy1),
								"groupBy2" : this
										.returnValidData(dataObject.groupBy2),
								"groupBy3" : this
										.returnValidData(dataObject.groupBy3),

								"rotateLabel" : dataObject.rotateLabel,
								"chartSummary" : dataObject.chartSummary,
								"colorsArray" : dataObject.colorsArray,
								"showLabels" : dataObject.showLabels,
								"legendPos" : dataObject.legendPosition,
								"gaugeColumn" : dataObject.gaugeColumn,
								"gaugeType" : dataObject.gaugeType,
								"aggrFunG" : dataObject.aggrFunG,
								"gaugeMaxValue" : dataObject.gaugeMaxValue,
								"valueOrPercentage" : dataObject.valueOrPercentage,
								"xAxisticklength" : dataObject.xAxisticklength,
								"xAxisDataType" : dataObject.xDataType,
								"xaxisDateFormat" : dataObject.xDateFormat,
								"groupArray" : dataObject.groupArray,
								"trendLineOptions" : dataObject.trendLineOptions,
								"mainObject" : dataObject.mainObject,
								"searchObject" : dataObject.searchObject,
								"widgetType" : dataObject.widgetType,
								"onlineCustomUrl" : dataObject.onlineCustomUrl,
								"onlineAuthenticationType" : dataObject.onlineAuthenticationType,
								"onlineRequestType" : dataObject.onlineRequestType,
								"offlineCustomUrl" : dataObject.offlineCustomUrl,
								"offlineAuthenticationType" : dataObject.offlineAuthenticationType
							};

							return chartObj;

						},
						updateSessionObjectForValueTemplate : function(
								dataObject) {
							var chartObj = {
								"iconsDataArray" : dataObject.iconsDataArray,
								"iconsArray" : dataObject.iconsArray,
								"titleColor" : dataObject.titleColor,
								"titleSize" : dataObject.titleSize,
								"valueColor" : dataObject.valueColor,
								"valueSize" : dataObject.valueSize,
								"defaultImage" : dataObject.defaultImage,
								"imageType" : dataObject.imageType,
								"backgroundColor" : dataObject.backgroundColor
							};

							return chartObj;

						},
						/**
						 * End
						 */

						/**
						 * Method for Showing Options based on chart type
						 */

						showOptionsForChartType : function() {
							if ($("#chartType").val() == "gaugeChart") {

								$('#chartOptions').hide();
								$('#gaugeOptions').show();
								$('#gaugeTypes').show();
								$('#selAggr').hide();
								$('#selAggrVal').hide();
							} else {
								$('#chartOptions').show();
								$('#gaugeOptions').hide();
								$('#gaugeTypes').hide();
							}

							if ($("#chartType").val() == "stackedChart") {
								$('#group_by').show();

							} else {
								$('#group_by option[value=""]').attr(
										'selected', 'selected');
								$('#group_by').hide();
							}

							if ($("#chartType").val() == "scatterChart") {
								$('#xAggr').hide();
								$('#yAxis').prop('disabled', false);
							} else {
								$('#xAggr').show();
							}

							if ($("#chartType").val() == "stackedMultiChart"
									|| $("#chartType").val() == "stackedMultiClustered") {
								$('#group_by1').show();
								$('#group_by2').show();

								$('#group_by1').prop('disabled', false);
								$('#group_by2').prop('disabled', false);

							} else {
								$("#group_by1 > [value='']").attr("selected",
										"true");
								$("#group_by2 > [value='']").attr("selected",
										"true");

								$('#group_by1').prop('disabled', true);
								$('#group_by2').prop('disabled', true);

								$('#group_by1').hide();
								$('#group_by2').hide();
							}
						},
						/**
						 * End
						 */

						/**
						 * Common Methods
						 */

						returnValidData : function(data) {
							if (data == undefined)
								return "";
							else
								return data;
						},

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

						getDatesMinMax : function(data, dimension, dataFormat) {

							// var tickFormat = d3.time.format("%Y-%m-%d");
							// var dateFormat = d3.time.format("%m/%d/%Y");
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

						filterJsonByKeys : function(data, keys) {

							var newData = [];
							for (var i = 0; i < data.length; i++) {
								var temp = {};
								for (var colIndex = 0; colIndex < keys.length; colIndex++) {
									var cellValue = data[i][keys[colIndex]];
									if (cellValue == null
											|| cellValue == undefined) {
										cellValue = "";
									}
									temp[keys[colIndex]] = cellValue;
								}
								newData.push(temp);
							}

							return newData;
						},

						filterKeysForJSONTable : function(data) {

							var newData = [];
							if (data.length > 0) {
								// var temp = {};
								// for (var colIndex = 0; colIndex <
								// keys.length; colIndex++) {
								// var cellValue = data[i][keys[colIndex]];
								// if (cellValue == null
								// || cellValue == undefined) {
								// cellValue = "";
								// }
								// temp[keys[colIndex]] = cellValue;
								// }
								// newData.push(temp);
							}

							return newData;
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
