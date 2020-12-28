mainApp
		.controller(
				'MyDashboardController',
				function($scope, $sessionStorage, $rootScope, $http, $compile,
						customwidgetService, widgetService, $timeout,
						myDashboardService, commonService, $state) {

					$(".maxpanel").remove();
					$("body").css('overflow', 'auto !important');
					var MESSAGE_CONSTANT = API_URI.MESSAGES;
					$scope.valueOrPercentage = {
						check : "Value"
					};
					$scope.xdatatype = "String";
					$scope.maxValue = {
						value : 100
					};

					var filterflag = false;
					$scope.responseArray = null;
					var dataSet, chart;
					var charts = [];
					var dateFlag = false;
					var gaugeConfig, gauge1, powerGauge;
					var workbook;
					// $scope.widgetIdList = [ 30, 10, 21, 22, 23, 29, 35, 36,
					// 37,
					// 38 ];
					$scope.widgetIdList = [];
					$scope.showChart = false;
					$scope.dataSet = [];
					$scope.colorVar = '#ED7D31';
					$("#color1").val($scope.colorVar);
					$scope.colorsArray = [];
					$scope.widgetDataArray = [];
					$scope.widgetdrillDownArray = [];
					$scope.dataIndex = null;
					var counter = 0;

					$scope.items = [];
					$scope.newitem = '';
					var groupIndex = 0;

					chartTypeOnload();

					function chartTypeOnload() {

						var chartType = $scope.chartType;

						if (chartType === 'stackedMultiChart'
								|| chartType === 'stackedMultiClustered'
								|| chartType === 'stackedLineMultiChart'
								|| chartType === 'stackedAreaMultiChart') {
							$scope.AllCharts = true;
							$scope.forGauttChart = false;
							$scope.xaggregationfromAll = true;
							$scope.yaxishideorshow = false;
							$scope.aggregNone = false;
							$scope.aggregation = 'count'
						} else if (chartType === 'gaugeChart') {
							$scope.AllCharts = true;
							$scope.forGauttChart = false;
							$scope.aggregNone = false;
							$scope.xaggregationfromAll = false;
							$scope.yaxishideorshow = false;
						} else if (chartType === 'ganttChart') {
							$scope.AllCharts = false;
							$scope.forGauttChart = true;
						} else {
							$scope.AllCharts = true;
							$scope.forGauttChart = false;
							$scope.aggregNone = true;
							$scope.xaggregationfromAll = true;
							$scope.yaxishideorshow = true;
						}

					}
					$scope.onxaxisDatatype = function(xdatatype) {
						if (xdatatype == "Date") {
							$scope.dateformat = true;
							$scope.dateandtimeformat = false;
						} else if (xdatatype == "DateandTime") {
							$scope.dateandtimeformat = true;
							$scope.dateformat = false;
						} else {
							$scope.dateformat = false;
							$scope.dateandtimeformat = false;
						}
					}

					$scope.loadData = function(filePath) {
						return queue().defer(d3.csv,
								"views/customFiles/" + filePath);
					}

					$sessionStorage.filterByIndex = [];
					$sessionStorage.filterDatatable = [];

					var widgetRes = customwidgetService.getCustomWidgets(
							$sessionStorage.userId, $sessionStorage.projectId);

					console.log("widgetRes", widgetRes);

					widgetRes
							.then(
									function(response) {

										$sessionStorage.MyDashboardWidgetInfo = response.data;
										$sessionStorage.MyDashboardWidgetInfo = $sessionStorage.MyDashboardWidgetInfo
												.sort(function(a, b) {
													return parseFloat(a.customWidgetOrderNo)
															- parseFloat(b.customWidgetOrderNo);
												});

										$scope.responseArray = $sessionStorage.MyDashboardWidgetInfo;
										// Creating Empty Widgets with Loaders

										if ($scope.responseArray.length == 0) {

											$('#message').show();
											$('#loaderMain').hide();
										} else {
											$('#message').hide();

											var myDashboardUserWidgetsInfoNames = [];

											for (i = 0; i < $scope.responseArray.length; i++) {
												if ($scope.responseArray[i].widgetType === 'custom') {

													if ($scope.responseArray[i].custFilePath === '') {

														getEmptyWidget(i);
														var widgetData = customwidgetService
																.getChartData($scope.responseArray[i].sourceUrl);
														getChartInfoFromURL(
																widgetData, i);

														$sessionStorage.filterByIndex[i] = i;
														$sessionStorage.filterDatatable[i] = i;

													} else {
														getEmptyWidget(i);
														var widgetData1 = customwidgetService
																.getChartDataFromCSV(
																		"views/customFiles/"
																				+ $scope.responseArray[i].custFilePath,
																		$scope.responseArray[i].custFileRealPath,
																		$scope.responseArray[i].sheetName);
														getChartInfoFromURL(
																widgetData1, i);

														$sessionStorage.filterByIndex[i] = i;
														$sessionStorage.filterDatatable[i] = i;

													}
													myDashboardUserWidgetsInfoNames
															.push('custPanelP'
																	+ $scope.responseArray[i].customWidgetId);
												} else {
													if ($scope.widgetIdList
															.indexOf($scope.responseArray[i].widgetId) != -1) {
														getSWidgetTemplate(
																$scope.responseArray[i],
																i);
														myDashboardUserWidgetsInfoNames
																.push('standPanel'
																		+ $scope.responseArray[i].customWidgetId);

														$sessionStorage.filterByIndex[i] = i;
														$sessionStorage.filterDatatable[i] = i;

													} else {

														getSEmptyWidget(i);
														var widgetData = widgetService
																.getWidgetDataByType(
																		$scope.responseArray[i].datacenterWidgetId,
																		$sessionStorage.dataSourceTypeFromDB);

														getStandardChartInfo(
																widgetData, i);
														myDashboardUserWidgetsInfoNames
																.push('custPanelP'
																		+ $scope.responseArray[i].customWidgetId);

														$sessionStorage.filterByIndex[i] = i;
														$sessionStorage.filterDatatable[i] = i;

													}
												}
												if (i == 0) {
													$('#message').hide();
													$('#loaderMain').hide();
												}
											}

											$sessionStorage.myDashboardUserWidgetsInfoNames = myDashboardUserWidgetsInfoNames;
										}
									}, function(errorResponse) {

									});

					$scope.deleteWidget = function(widId, index) {
						$scope.deleteWidgetID = widId;
						$scope.deleteWidgetIndex = index;
						charts.splice(index, 1);
						$('#deleteCustWidgetModal').modal('show');
					}

					window.onresize = function(ind) {

						if (charts.length != 0) {
							for (var i = 0; i < charts.length; i++) {
								var elmnt = document.getElementById("panelId"
										+ i);
								if (elmnt == null) {
									i++;
									elmnt = document.getElementById("panelId"
											+ i);
									if (elmnt == null) {
										i++;
										elmnt = document
												.getElementById("panelId" + i);
										if (elmnt == null) {
											i++;
											elmnt = document
													.getElementById("panelId"
															+ i);
										}
									}
								}

								var width = elmnt.offsetWidth;
								var height = elmnt.offsetHeight;
								var radius = (width + height) * 0.12;
								var innerRadius = (width + height) * 0.04;
								charts[i].width(width - 100).height(height);

								if (charts[i].chartType == 'pieChart') {
									charts[i].radius(radius);
									charts[i].innerRadius(innerRadius);
								}

								if (charts[i].chartType != 'pieChart') {
									charts[i].rescale();
								}

								charts[i].redraw();

							}
						}
					};

					$scope.removeWidgetFromDB = function() {

						var deleteWidgetResp = customwidgetService
								.deleteCustomWidget($scope.deleteWidgetID);
						deleteWidgetResp.then(function(response) {

							if (response.data === 1) {

								$('#deleteCustWidgetModal').modal('hide');

								$("body").css('overflow', 'auto !important');
								$(".bodyback").css('overflow',
										'auto !important');

								$('.custPanelP' + $scope.deleteWidgetID + '')
										.remove();
								$('.custPanel' + $scope.deleteWidgetIndex + '')
										.remove();

								$scope.$digest();
							} else {

							}
						}, function(errorResponse) {

						});
					}

					var drillDownSet = null;

					function getStandardChartInfo(widgetData, index) {
						widgetData
								.then(
										function(responseInn) {

											var respData = responseInn.data;
											var dataSet = respData.chartData;
											var errortext = respData.errormsg;
											var memCahceNoObjError = respData.error;
											if (errortext != "CONNECTION_TIMED_OUT") {
												if (respData == ""
														|| respData == undefined) {

													$scope
															.toShowErrorMessage(
																	index,
																	MESSAGE_CONSTANT.NO_DATA_FOUND)

												} else if (errortext == "No Offline URL"
														|| errortext == "No Online URL"
														|| errortext == "No Data Center") {
													$scope
															.toShowErrorMessage(
																	index,
																	MESSAGE_CONSTANT.CONTACT_PROJECT_ADMIN);
												} else if (memCahceNoObjError == "Please provide valid id.") {
													$scope
															.toShowErrorMessage(
																	index,
																	MESSAGE_CONSTANT.NO_DATA_FOUND);
												} else if (respData == "401") {

													$scope
															.toShowErrorMessage(
																	index,
																	MESSAGE_CONSTANT.NO_DATA_FOUND_RELOAD)

													$(
															'.custPanel'
																	+ index
																	+ ' .icon-refresh-1')
															.unbind()
															.on(
																	'click',
																	function(
																			ev,
																			lobiPanel) {
																		$(
																				'#standWidget'
																						+ index)
																				.html(
																						'');
																		$(
																				'#errDiv'
																						+ index)
																				.hide();
																		$(
																				'#loader'
																						+ index)
																				.show();
																		if ($scope.responseArray[index].custFilePath !== '') {
																			$(
																					'#loader'
																							+ index)
																					.hide();
																		}
																		var widgetData = widgetService
																				.getWidgetDataByType(
																						$scope.responseArray[index].datacenterWidgetId,
																						$sessionStorage.dataSourceTypeFromDB);
																		getStandardChartInfo(
																				widgetData,
																				index);

																		$sessionStorage.filterByIndex[index] = index;
																		$sessionStorage.filterDatatable[index] = null;
																		if ($.fn.dataTable
																				.isDataTable('#graphData_'
																						+ index)) {
																			$(
																					'#graphData_'
																							+ index)
																					.dataTable()
																					.fnDestroy();
																		}

																	});

												} else {
													$("#edit_" + index)
															.removeClass(
																	"disabled");
													$(
															".custPanel"
																	+ index
																	+ ' li a[data-title="Fullscreen"]')
															.attr("data-func",
																	"expand");

													$scope.widgetDataArray[index] = dataSet;
													drillDownSet = respData.drillDownData;
													$scope.widgetdrillDownArray[index] = drillDownSet;

													$("#sprintValue" + index)
															.text(
																	respData.sprintData);
													if ($scope.responseArray[index].chartType == 'gaugeChart') {
														$("#filter_" + index)
																.addClass(
																		"disabled");

														$('#loader' + index)
																.hide();
														$('#errDiv' + index)
																.hide();
														$(
																'#standWidget'
																		+ index)
																.show();
														var elmnt = document
																.getElementById('panelId'
																		+ index);
														var width = elmnt.offsetWidth;
														var height = elmnt.offsetHeight;

														var size = width / 2 + 100;

														myDashboardService
																.buildGaugeChart(
																		dataSet,
																		'standWidget'
																				+ index,
																		$scope.responseArray[index].chartInformation,
																		size);

														$(
																'.custPanel'
																		+ index
																		+ ' .icon-refresh-1')
																.unbind()
																.on(
																		'click',
																		function(
																				ev,
																				lobiPanel) {
																			$(
																					'#standWidget'
																							+ index)
																					.html(
																							'');
																			$(
																					'#errDiv'
																							+ index)
																					.hide();
																			$(
																					'#loader'
																							+ index)
																					.show();
																			if ($scope.responseArray[index].custFilePath !== '') {
																				$(
																						'#loader'
																								+ index)
																						.hide();
																			}
																			var widgetData = widgetService
																					.getWidgetDataByType(
																							$scope.responseArray[index].datacenterWidgetId,
																							$sessionStorage.dataSourceTypeFromDB);
																			getStandardChartInfo(
																					widgetData,
																					index);

																			$sessionStorage.filterByIndex[index] = index;
																			$sessionStorage.filterDatatable[index] = null;
																			if ($.fn.dataTable
																					.isDataTable('#graphData_'
																							+ index)) {
																				$(
																						'#graphData_'
																								+ index)
																						.dataTable()
																						.fnDestroy();
																			}
																		});

														$('.custPanel' + index)
																.on(
																		'onFullScreen.lobiPanel',
																		function(
																				ev,
																				lobiPanel) {
																			$timeout(
																					function() {
																						$(
																								".customWidgetPanelBody")
																								.css(
																										{
																											"max-height" : "100%",
																											"min-height" : "100%",
																										});
																						$(
																								'.custPanel'
																										+ index)
																								.addClass(
																										"maxpanel");

																						$scope
																								.onfullScreenGaugeCharts(
																										index,
																										'standWidget'
																												+ index,
																										dataSet);

																					},
																					500);

																		});
														$('.custPanel' + index)
																.on(
																		'onSmallSize.lobiPanel',
																		function(
																				ev,
																				lobiPanel) {
																			$timeout(
																					function() {
																						$(
																								".customWidgetPanelBody")
																								.css(
																										{
																											"max-height" : "315px",
																											"min-height" : "315px"
																										});
																						$(
																								'.custPanel'
																										+ index)
																								.removeClass(
																										"maxpanel");
																						$scope
																								.onSmallScreenGaugeChart(
																										index,
																										"standWidget"
																												+ index,
																										dataSet)
																					},
																					500);
																		});

													} else {
														$('#loader' + index)
																.hide();
														$('#errDiv' + index)
																.hide();
														$("#filter_" + index)
																.removeClass(
																		"disabled");
														$(
																'#standWidget'
																		+ index)
																.show();

														var widgetTypeFromDB = $scope.responseArray[index].customWidgetType;
														if (widgetTypeFromDB != null
																&& widgetTypeFromDB != undefined
																&& widgetTypeFromDB == "Table") {

															var graphData = "<table id='tableData_"
																	+ index
																	+ "' class='grid table table-striped tablesorter genericTableBorder'></table>";
															$(
																	'#standWidget'
																			+ index)
																	.empty();
															$(
																	'#standWidget'
																			+ index)
																	.append(
																			graphData);
															$(
																	'#tableData_'
																			+ index)
																	.html('');
															$("#edit_" + index)
																	.addClass(
																			"disabled");
															$(
																	"#filter_"
																			+ index)
																	.addClass(
																			"disabled");
															if ($scope.widgetDataArray[index] != null
																	&& $scope.widgetDataArray[index] != undefined) {

																var tableObj = commonService
																		.buildGenericHtmlTable(
																				$scope.widgetDataArray[index],
																				'#tableData_'
																						+ index);
																$sessionStorage["screen"
																		+ index
																		+ "Size"] = "smallScreen";
															} else {
																$scope
																		.toShowErrorMessage(
																				index,
																				MESSAGE_CONSTANT.NO_DATA_FOUND);
															}

														} else {
															var chart = myDashboardService
																	.buildGraphs(
																			dataSet,
																			'#standWidget'
																					+ index,
																			$scope.responseArray[index].chartInformation,
																			index);

															charts[index] = chart;
															chart.screenSize = 'smallScreen';
														}

														$(
																'.custPanel'
																		+ index
																		+ ' .icon-refresh-1')
																.unbind()
																.on(
																		'click',
																		function(
																				ev,
																				lobiPanel) {

																			$(
																					'#standWidget'
																							+ index)
																					.hide();
																			$(
																					'#loader'
																							+ index)
																					.show();

																			$scope
																					.forAllChartsAllFunctions(
																							index,
																							'refresh');

																		});
														$('.custPanel' + index)
																.on(
																		'onFullScreen.lobiPanel',
																		function(
																				ev,
																				lobiPanel) {
																			$timeout(
																					function() {
																						$(
																								".customWidgetPanelBody")
																								.css(
																										{
																											"max-height" : "100%",
																											"min-height" : "100%"
																										});
																						$(
																								'.custPanel'
																										+ index)
																								.addClass(
																										"maxpanel");
																						$scope
																								.forAllChartsAllFunctions(
																										index,
																										'fullScreen');

																					},
																					500);

																		});
														$('.custPanel' + index)
																.on(
																		'onSmallSize.lobiPanel',
																		function(
																				ev,
																				lobiPanel) {
																			$timeout(
																					function() {
																						$(
																								".customWidgetPanelBody")
																								.css(
																										{
																											"max-height" : "315px",
																											"min-height" : "315px"
																										});
																						$(
																								'.custPanel'
																										+ index)
																								.removeClass(
																										"maxpanel");

																						$scope
																								.forAllChartsAllFunctions(
																										index,
																										'smallScreen');

																					},
																					500);

																		});
													}
												}
											} else {
												$scope.toShowErrorMessage(
														index,
														"Connection Time out");

											}

										},
										function(errorResponseIn) {

											$scope
													.toShowErrorMessage(
															index,
															MESSAGE_CONSTANT.NO_DATA_FOUND);

										});
					}

					function getSWidgetTemplate(widgetData, index) {
						var obj = {
							name : widgetData.widgetName,
							widgetType : widgetData.widgetType,
							id : widgetData.widgetId,
							datacenter_id : widgetData.datacenterId,
							datacenter_widget_id : widgetData.datacenterWidgetId,
							template : widgetData.template,
							custom_widget_id : widgetData.customWidgetId
						}
						if ($state.current.name == 'home') {
							$rootScope['widget_Data_' + widgetData.template] = obj;
						} else {
							$rootScope['widget_Data_' + widgetData.template
									+ '_' + widgetData.customWidgetId] = obj;
						}

						if (widgetData.template == "releaseReadyness") {

							var tempId = Math
									.floor((Math.random() * 10000) + 1);

							$scope.NormalGauge_id = widgetData.template + "_"
									+ tempId;
							$scope.EngGauge_id = widgetData.template + "_Eng"
									+ "_" + tempId;
							$scope.AnGauge_id = widgetData.template + "_An"
									+ "_" + tempId;

							jQuery("#customDashboard")
									.append(
											$compile(
													"<div class='col-md-6 col-xs-12 widgetDiv standPanel"
															+ widgetData.customWidgetId
															+ "'><div ng-include src=\"'views/app/widgetTemplates/"
															+ widgetData.template
															+ ".html'\"  ng-init='burndowntitle = \""
															+ widgetData.widgetName
															+ "\"; widgetIndexTemp=\""
															+ index
															+ "\"; widgetNameTemp=\""
															+ $sessionStorage.UserWidgetsInfo[i].name
															+ "\"; customWidgetId = \""
															+ widgetData.customWidgetId
															+ "\"; NormalGauge_id = \""
															+ $scope.NormalGauge_id
															+ "\"; EngGauge_id = \""
															+ $scope.EngGauge_id
															+ "\"; AnGauge_id = \""
															+ $scope.AnGauge_id
															+ "\"'  ng-if=\"'true'\"></div></div>")
													($scope));

							// } else if (widgetData.template == "ganttChart") {
							//
							// jQuery("#customDashboard")
							// .append(
							// $compile(
							// "<div class='col-md-6 col-xs-12 widgetDiv
							// standPanel"
							// + widgetData.customWidgetId
							// + "'><div ng-include
							// src=\"'views/app/widgetTemplates/"
							// + widgetData.template
							// + ".html'\" ng-init='burndowntitle = \""
							// + widgetData.widgetName
							// + "\"; customWidgetId = \""
							// + widgetData.customWidgetId
							// + "\"; ng-if=\"'true'\"></div></div>")
							// ($scope));

						} else {

							jQuery("#customDashboard")
									.append(
											$compile(
													"<div class='col-md-"
															+ widgetData.type
															+ " col-xs-12 sample_"
															+ index
															+ " widgetDiv standPanel"
															+ widgetData.customWidgetId
															+ "' id="
															+ widgetData.customWidgetId
															+ "><div ng-include src=\"'views/app/widgetTemplates/"
															+ widgetData.template
															+ ".html'\"  ng-init='burndowntitle = \""
															+ widgetData.widgetName
															+ "\"; widgetIndexTemp=\""
															+ index
															+ "\"; widgetNameTemp=\""
															+ $sessionStorage.UserWidgetsInfo[i].name
															+ "\"; customWidgetId = \""
															+ widgetData.customWidgetId
															+ "\";'  ng-if=\"'true'\"></div></div>")
													($scope));
						}

					}

					$scope.deleteStandartWidget = function() {
						var widgetId = $scope.widgetid;
						var deleteWidgetResp = customwidgetService
								.deleteCustomWidget(widgetId);
						deleteWidgetResp.then(function(response) {
							if (response.data === 1) {
								$('.standPanel' + widgetId).remove();
								$('.maxpanel').remove();
								$('#deleteStandWidgetModal').modal('hide');
							} else {
							}
						}, function(errorResponse) {
						});
					}

					$scope.add2MyDashboard = function(index, widgetId) {
						$scope.msg = "";
						$scope.button = "";
						$scope.overRideBtn = false;
						// var widgetInfo =
						// $sessionStorage.UserWidgetsInfo[index];
						var widgetInfo = $scope.responseArray[index];
						if (typeof index == 'object') {
							widgetInfo = index;
						}
						if (widgetInfo.widgetType === 'standard') {
							$scope.widgetid = widgetId;
							$("#deleteStandWidgetModal").modal('show');
						} else {
							$scope.CustDataObj = {
								customWidgetId : 0,
								projectId : $sessionStorage.projectId,
								userId : $sessionStorage.userId,
								sourceUrl : '',
								chartType : widgetInfo.chartInformation.chart_type,
								xAxis : widgetInfo.chartInformation.x_axis,
								xAxisTitle : widgetInfo.chartInformation.x_axis_title,
								yAxis : widgetInfo.chartInformation.y_axis,
								yAxisTitle : widgetInfo.chartInformation.y_axis_title,
								aggrFunc : widgetInfo.chartInformation.aggr_func,
								aggrFuncY : widgetInfo.chartInformation.aggr_func_y,
								widgetName : widgetInfo.name,
								groupBy : widgetInfo.chartInformation.groupBy,
								groupBy1 : widgetInfo.chartInformation.groupBy1,
								groupBy2 : widgetInfo.chartInformation.groupBy2,
								custFilePath : '',
								gaugeType : widgetInfo.chartInformation.gaugeType,
								gaugeColumn : widgetInfo.chartInformation.gaugeColumn,
								aggrFunG : widgetInfo.chartInformation.aggrFunG,
								gaugeMaxValue : widgetInfo.chartInformation.gaugeMaxValue,
								widgetType : 'standard',
								widgetId : widgetInfo.id,
								datacenterId : widgetInfo.datacenter_id,
								datacenterWidgetId : widgetInfo.datacenter_widget_id,
								template : widgetInfo.template,
								rotateLabel : widgetInfo.chartInformation.rotateLabel,
								chartSummary : widgetInfo.chartInformation.chartSummary,
								custFileRealPath : widgetInfo.chartInformation.custFileRealPath,
								sheetName : widgetInfo.chartInformation.sheetName,
								widgetName : widgetInfo.chartInformation.chartSummary,
								colorsArray : commonService
										.getColorsArray(widgetInfo.chartInformation.colorsArray),
								showLabels : widgetInfo.chartInformation.showLabels,
								legendPosition : widgetInfo.chartInformation.legendPos,
								groupArray : commonService
										.getColorsArray(widgetInfo.chartInformation.groupsArray)
							};
							var widgetResponse = customwidgetService
									.postCustomWidgetDetails($scope.CustDataObj);
							widgetResponse.then(function(response) {

								if (response.data === 'success') {
									$('#addDeleteWidgetModal').modal('show');
								} else {
									$('#existWidgetModal').modal('show');
									$scope.customWidgetId = response.data;
								}
							}, function(errorResponse) {
							});
						}
					}

					function getSEmptyWidget(index) {

						$sessionStorage["screen" + index + "Size"] = 'smallScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:300px;" id="standWidget'
								+ index + '"></div>';
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning" id="errMessage_'
								+ index + '"></span></h4></div>';

						if ($scope.responseArray[index].chartInformation.chartType == "gaugeChart") {
							if ($scope.responseArray[index].chartInformation.gaugeType === 'powerGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><div id="standWidget'
										+ index + '"></div>';
							} else if ($scope.responseArray[index].chartInformation.gaugeType === 'liquidGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="standWidget'
										+ index
										+ '" width="400" height="300"></div>';
							}
						}

						var sprintDiv = null;
						if ($scope.responseArray[index].chartInformation.toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						jQuery("#customDashboard")
								.append(
										$compile(
												myDashboardService
														.buildSEmptyWidgetDOM(
																$scope.responseArray[index],
																index,
																noDataDiv,
																chartDiv,
																sprintDiv))(
												$scope));
						$('.custPanel' + index).lobiPanel({
							// Options go here
							sortable : false,
							reload : true,
							editTitle : false,
							close : false,
							reload : true,
							minimize : false,
							expand : true,
							unpin : false,
							reload : {
								icon : 'icon-refresh-1'
							},
							expand : {
								icon : 'icon-maximize',
								icon2 : 'fa fa-compress'
							}
						});

					}

					function getEmptyWidget(index) {
						$sessionStorage["screen" + index + "Size"] = 'smallScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:300px;" id="custWidget'
								+ index + '"></div>';
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';
						if ($scope.responseArray[index].chartInformation.chartType == "gaugeChart") {
							if ($scope.responseArray[index].chartInformation.gaugeType === 'powerGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><div align="center" id="custWidget'
										+ index + '"></div>';
							} else if ($scope.responseArray[index].chartInformation.gaugeType === 'liquidGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="custWidget'
										+ index
										+ '" width="400" height="300"></svg>';
							}
						}
						myDashboardService.buildEmptyWidgetDOM(
								$scope.responseArray[index], index, noDataDiv,
								chartDiv)
						jQuery("#customDashboard").append(
								$compile(
										myDashboardService.buildEmptyWidgetDOM(
												$scope.responseArray[index],
												index, noDataDiv, chartDiv))(
										$scope));
						$('.custPanel' + index).lobiPanel({
							// Options go here
							sortable : false,
							reload : true,
							editTitle : false,
							close : false,
							reload : true,
							minimize : false,
							expand : true,
							unpin : false,
							reload : {
								icon : 'icon-refresh-1'
							},
							expand : {
								icon : 'icon-maximize',
								icon2 : 'fa fa-compress'
							}
						});
					}

					function getChartInfoFromURL(widgetData, index) {
						widgetData
								.then(
										function(responseInn) {
											if (responseInn.data.Defects) {
												dataSet = responseInn.data.Defects;
											} else if (responseInn.data.issues) {
												dataSet = responseInn.data.issues;
											} else {
												dataSet = responseInn.data;
											}

											if (dataSet == ""
													|| dataSet == undefined) {

												$scope
														.toShowErrorMessage(
																index,
																MESSAGE_CONSTANT.NO_DATA_FOUND);

											} else {
												$scope.widgetDataArray[index] = dataSet;
												if ($scope.responseArray[index].chartInformation.chartType == 'gaugeChart') {
													if ($scope.responseArray[index].chartInformation.gaugeType === 'powerGauge'
															|| $scope.responseArray[index].chartInformation.gaugeType === 'liquidGauge') {
														$("#filter_" + index)
																.addClass(
																		"disabled");
														$('#loader' + index)
																.hide();
														$('#custWidget' + index)
																.show();

														var elmnt = document
																.getElementById('panelId'
																		+ index);
														var width = elmnt.offsetWidth;
														var height = elmnt.offsetHeight;

														var size = width / 2 + 100;

														myDashboardService
																.buildGaugeChart(
																		dataSet,
																		'custWidget'
																				+ index,
																		$scope.responseArray[index].chartInformation,
																		size);

														$(
																'.custPanel'
																		+ index
																		+ ' .icon-refresh-1')
																.unbind()
																.on(
																		'click',
																		function(
																				ev,
																				lobiPanel) {

																			$(
																					'#loader'
																							+ index)
																					.show();
																			var widgetData = '';
																			if ($scope.responseArray[index].custFilePath === '') {

																				widgetData = customwidgetService
																						.getChartData($scope.responseArray[index].sourceUrl);
																				getChartInfoFromURL(
																						widgetData,
																						index);

																			} else {
																				widgetData = customwidgetService
																						.getChartDataFromCSV(
																								"views/customFiles/"
																										+ $scope.responseArray[index].custFilePath,
																								$scope.responseArray[index].custFileRealPath,
																								$scope.responseArray[index].sheetName);

																			}

																			getChartInfoFromURL(
																					widgetData,
																					index);
																			$(
																					'#loader'
																							+ index)
																					.hide();

																			$sessionStorage.filterByIndex[index] = index;
																			$sessionStorage.filterDatatable[index] = null;
																			if ($.fn.dataTable
																					.isDataTable('#graphData_'
																							+ index)) {
																				$(
																						'#graphData_'
																								+ index)
																						.dataTable()
																						.fnDestroy();
																			}
																		});

														$('.custPanel' + index)
																.on(
																		'onFullScreen.lobiPanel',
																		function(
																				ev,
																				lobiPanel) {
																			$timeout(
																					function() {

																						$(
																								".customWidgetPanelBody")
																								.css(
																										{
																											"max-height" : "100%",
																											"min-height" : "100%",
																										});
																						$(
																								'.custPanel'
																										+ index)
																								.addClass(
																										"maxpanel");

																						$scope
																								.onfullScreenGaugeCharts(
																										index,
																										"custWidget"
																												+ index,
																										dataSet);

																					},
																					500);

																		});
														$('.custPanel' + index)
																.on(
																		'onSmallSize.lobiPanel',
																		function(
																				ev,
																				lobiPanel) {
																			$timeout(
																					function() {
																						$(
																								".customWidgetPanelBody")
																								.css(
																										{
																											"max-height" : "315px",
																											"min-height" : "315px"
																										});
																						$(
																								'.custPanel'
																										+ index)
																								.removeClass(
																										"maxpanel");

																						$scope
																								.onSmallScreenGaugeChart(
																										index,
																										"custWidget"
																												+ index,
																										dataSet)

																					},
																					500);
																		});
													}
												} else if ($scope.responseArray[index].chartType == 'ganttChart') {
													// if gantt chart:

													$('#custWidget' + index)
															.show();

													$('#loader' + index).hide();
													$('#errDiv' + index).hide();
													myDashboardService
															.buildGraphs(
																	dataSet,
																	'#custWidget'
																			+ index,
																	$scope.responseArray[index].chartInformation,
																	index);

												} else {
													// if other than gauge and
													// gantt charts

													$('#custWidget' + index)
															.show();

													$('#loader' + index).hide();
													$('#errDiv' + index).hide();

													$("#edit_" + index)
															.removeClass(
																	"disabled");
													$("#filter_" + index)
															.removeClass(
																	"disabled");

													var chart = myDashboardService
															.buildGraphs(
																	dataSet,
																	'#custWidget'
																			+ index,
																	$scope.responseArray[index].chartInformation,
																	index);

													charts[index] = chart;
													chart.screenSize = 'smallScreen';

													$(
															'.custPanel'
																	+ index
																	+ ' .icon-refresh-1')
															.unbind()
															.on(
																	'click',
																	function(
																			ev,
																			lobiPanel) {

																		$(
																				'#custWidget'
																						+ index)
																				.hide();
																		$(
																				'#loader'
																						+ index)
																				.show();

																		if ($scope.responseArray[index].custFilePath === '') {
																			var widgetData = customwidgetService
																					.getChartData($scope.responseArray[index].sourceUrl);
																			getChartInfoFromURL(
																					widgetData,
																					index);
																		} else {
																			var widgetData1 = customwidgetService
																					.getChartDataFromCSV(
																							"views/customFiles/"
																									+ $scope.responseArray[index].custFilePath,
																							$scope.responseArray[index].custFileRealPath,
																							$scope.responseArray[index].sheetName);
																			getChartInfoFromURL(
																					widgetData1,
																					index);

																			$sessionStorage.filterByIndex[index] = index;
																			$sessionStorage.filterDatatable[index] = null;
																			if ($.fn.dataTable
																					.isDataTable('#graphData_'
																							+ index)) {
																				$(
																						'#graphData_'
																								+ index)
																						.dataTable()
																						.fnDestroy();
																			}
																		}

																		$timeout(
																				function() {

																					$scope
																							.forAllChartsAllFunctions(
																									index,
																									'');

																					if ($scope.responseArray[index].chartInformation.xaxisDataType == 'Date'
																							&& charts[index].screenSize == 'fullScreen') {
																						charts[index]
																								.width(
																										width - 40)
																								.height(
																										height - 90);
																						myDashboardService
																								.showSliderChart(
																										index,
																										dataSet,
																										charts,
																										$scope.responseArray[index].chartInformation);
																					}

																				},
																				500);

																	});

													$('.custPanel' + index)
															.on(
																	'onFullScreen.lobiPanel',
																	function(
																			ev,
																			lobiPanel) {
																		$timeout(
																				function() {
																					$(
																							".customWidgetPanelBody")
																							.css(
																									{
																										"max-height" : "100%",
																										"min-height" : "100%"
																									});
																					$(
																							'.custPanel'
																									+ index)
																							.addClass(
																									"maxpanel");
																					$scope
																							.forAllChartsAllFunctions(
																									index,
																									'fullScreen');

																					if ($scope.responseArray[index].chartInformation.xaxisDataType == 'Date') {
																						charts[index]
																								.width(
																										width)
																								.height(
																										height - 90);
																						myDashboardService
																								.showSliderChart(
																										index,
																										dataSet,
																										charts,
																										$scope.responseArray[index].chartInformation);
																					}
																				},
																				500);

																	});
													$('.custPanel' + index)
															.on(
																	'onSmallSize.lobiPanel',
																	function(
																			ev,
																			lobiPanel) {

																		var sliderChartId = '#custWidget'
																				+ index
																				+ '_Slider';
																		$(
																				sliderChartId)
																				.html(
																						'');
																		$(
																				sliderChartId)
																				.hide();
																		$timeout(
																				function() {
																					$(
																							".customWidgetPanelBody")
																							.css(
																									{
																										"max-height" : "315px",
																										"min-height" : "315px"
																									});
																					$(
																							'.custPanel'
																									+ index)
																							.removeClass(
																									"maxpanel");

																					$scope
																							.forAllChartsAllFunctions(
																									index,
																									'smallScreen');

																					if ($scope.responseArray[index].chartInformation.xaxisDataType == 'Date') {

																						var brushOnFlag = false;
																						var noYAxis = false;
																						var sliderHeight = '';
																						myDashboardService
																								.buildGraphs(
																										dataSet,
																										sliderChartId,
																										$scope.responseArray[index].chartInformation,
																										brushOnFlag,
																										noYAxis);
																					}

																				},
																				500);

																	});
												}
											}

										},
										function(errorResponseIn) {

											$scope
													.toShowErrorMessage(
															index,
															MESSAGE_CONSTANT.NO_DATA_FOUND);

										});
					}

					$scope.onfullScreenGaugeCharts = function(index, id,
							dataSet) {

						$('#power-gauge').html('');
						$('#loader' + index).show();
						$("#" + id).html('');

						var elmnt = document.getElementById('panelId' + index);
						var width = elmnt.offsetWidth;
						var height = elmnt.offsetHeight;

						var size = width / 2 + 100;

						if ($scope.responseArray[index].chartInformation.gaugeType === 'powerGauge') {

							$("#" + id).css('width', width);
							$("#" + id).css('height', height);

							var powerGauge = myDashboardService
									.buildGaugeChart(dataSet, id,
											$scope.responseArray[index], size);

						} else {

							$("#" + id).css('width', width - 100);
							$("#" + id).css('height', height - 100);

							gauge1 = myDashboardService.buildGaugeChart(
									dataSet, id, $scope.responseArray[index],
									size);

						}
						$('#loader' + index).hide();

					}

					$scope.onSmallScreenGaugeChart = function(index, id,
							dataSet) {
						$('#power-gauge').html('');

						$('#' + id).html('');

						var elmnt = document.getElementById('panelId' + index);
						var width = elmnt.offsetWidth;
						var height = elmnt.offsetHeight;
						var size = width / 2 + 100;
						if ($scope.responseArray[index].chartInformation.gaugeType === 'powerGauge') {
							$('#' + id).css('width', width);
							$('#' + id).css('height', height);

							var powerGauge = myDashboardService
									.buildGaugeChart(dataSet, id,
											$scope.responseArray[index], size);

						} else {
							$('#' + id).css('width', width - 100);
							$('#' + id).css('height', height - 15);

							gauge1 = myDashboardService.buildGaugeChart(
									dataSet, id, $scope.responseArray[index],
									size);

						}
						$('#loader' + index).hide();

					}

					$scope.toShowErrorMessage = function(index, errorText) {

						$('#loader' + index).hide();
						$('#errDiv' + index).show();
						$scope.errormessage = errorText;
						$('#errMessage_' + index).empty();
						$('#errMessage_' + index).append(errorText);
						$("#edit_" + index).addClass("disabled");
						$("#add_" + index).addClass("disabled");
						$("#filter_" + index).addClass("disabled");

						$("#standWidget" + index).html('');

						$(
								".custPanel" + index
										+ ' li a[data-title="Fullscreen"]')
								.removeAttr("data-func");

					}

					$scope.forAllChartsAllFunctions = function(index, stage) {
						console
								.log("widget type ",
										$scope.responseArray[index]);
						var widgetTypeFromDB = $scope.responseArray[index].customWidgetType;

						if (stage === 'refresh') {

							var onOffFlag = "Offline";
							if ($sessionStorage.dataSourceTypeFromDB == "Offline") {
								var checkState = $('.datatypesCheck1').is(
										":checked");
								if (checkState) {
									onOffFlag = "Online";
								}
							} else {
								onOffFlag = $sessionStorage.dataSourceTypeFromDB;
							}

							var widgetData = widgetService
									.getWidgetDataByType(
											$scope.responseArray[index].datacenterWidgetId,
											onOffFlag);

							getStandardChartInfo(widgetData, index);

							if (filterflag == true)
								$('#filterDiv').empty();

							if (widgetTypeFromDB == "Graph") {
								var screenSize = $sessionStorage["screen"
										+ index + "Size"];
								charts[index].screenSize = screenSize;
							}

							$sessionStorage.filterByIndex[index] = index;
							$sessionStorage.filterDatatable[index] = null;
							if ($.fn.dataTable.isDataTable('#graphData_'
									+ index)) {
								$('#graphData_' + index).dataTable()
										.fnDestroy();
							}

						} else if (stage === 'fullScreen') {
							if (widgetTypeFromDB == "Graph") {
								charts[index].screenSize = 'fullScreen';
							}
							$sessionStorage["screen" + index + "Size"] = 'fullScreen';

						} else if (stage === 'smallScreen') {
							if (widgetTypeFromDB == "Graph") {
								charts[index].screenSize = 'smallScreen';
							}
							$sessionStorage["screen" + index + "Size"] = 'smallScreen';

						} else {
							if (widgetTypeFromDB == "Graph") {
								var screenSize = $sessionStorage["screen"
										+ index + "Size"];

								charts[index].screenSize = screenSize;
							}
						}
						console.log("widgetTypeFromDB ", widgetTypeFromDB);
						if (widgetTypeFromDB != null
								&& widgetTypeFromDB != undefined
								&& widgetTypeFromDB == "Graph") {
							$timeout(
									function() {
										var elmnt = document
												.getElementById('panelId'
														+ index);
										var width = elmnt.offsetWidth;
										var height = elmnt.offsetHeight;
										if (height >= 500) {
											width = elmnt.offsetWidth - 100;
											height = elmnt.offsetHeight - 100;
										}
										var radius = (width + height) * 0.12;
										var innerRadius = (width + height) * 0.04;

										charts[index].width(width - 40).height(
												height);

										if (charts[index].chartType == 'pieChart') {
											charts[index].radius(radius);
											charts[index]
													.innerRadius(innerRadius);
											charts[index].render();
										}

										if (charts[index].chartType === "stackedChart"
												|| charts[index].chartType === "stackedMultiChart"
												|| charts[index].chartType === "stackedMultiClustered"
												|| charts[index].chartType === "stackedAreaMultiChart"
												|| charts[index].chartType === "stackedLineMultiChart"
												|| charts[index].chartType === "pieChart") {

											var legendX = 10, legendY = 10;
											if ($scope.responseArray[index].chartInformation.legendPosition === 'Top Left') {
												legendX = 40;
												legendY = 25;
											} else if ($scope.responseArray[index].chartInformation.legendPosition === 'Bottom Left') {
												legendX = 10;
												legendY = height - 40;
											}

											charts[index].legend(dc.legend().x(
													legendX).y(legendY)
													.itemHeight(10).gap(5)
													.horizontal(true)
													.legendWidth(400)
													.itemWidth(100)
													.autoItemWidth(true));

										}

										if (charts[index].chartType != 'pieChart') {
											charts[index].rescale();
											charts[index].redraw();
										}

									}, 100);
						}

					}

					$scope.editWidget = function(index) {
						$scope.groupbyThree = false;
						$("#TextBoxesGroup").html('');
						$scope.colorsArray = [];
						$scope.dataIndex = index;
						$scope.showChart = false;
						var widgetInfo = $scope.responseArray[index];
						$scope.widgetTitle = widgetInfo.widgetName;
						$scope.chartType = widgetInfo.chartInformation.chart_type;

						if (widgetInfo.chartType == 'ganttChart') {
							$scope.taskColumn = widgetInfo.chartInformation.y_axis;
							$scope.taskTypeColumn = widgetInfo.chartInformation.x_axis;
							$scope.startDateColumn = widgetInfo.chartInformation.groupBy;
							$scope.endDateColumn = widgetInfo.chartInformation.groupBy;
							$scope.dateformatColumn = widgetInfo.chartInformation.xaxisDateFormat;
						} else {
							$scope.xAxis = widgetInfo.chartInformation.x_axis;
							$scope.yAxis = widgetInfo.chartInformation.y_axis;
							$scope.dateformatselect = widgetInfo.chartInformation.xaxisDateFormat;

							if ($scope.dateformatselect == ''
									|| $scope.dateformatselect == null) {
								$scope.dateformat = false;
							} else {
								$scope.dateformat = true;
							}

						}

						$scope.widgetInfo = widgetInfo;
						$scope.gaugeColumn = widgetInfo.chartInformation.gaugeColumn;
						$scope.gAggregation = widgetInfo.chartInformation.aggrFunG;
						$scope.maxValue.value = widgetInfo.chartInformation.gaugeMaxValue;
						$scope.gaugeTypeMyD = widgetInfo.chartInformation.gaugeType;

						if ($scope.maxValue.value == '') {
							$scope.maxValue = {
								value : 100
							};
						}
						if ($scope.gaugeTypeMyD == '') {
							$scope.gaugeTypeMyD = 'powerGauge';
						}
						if ($scope.gAggregation == '') {
							$scope.gAggregation = 'sum';
						}

						$scope.widgetInfo.source_url = widgetInfo.sourceUrl;
						$scope.widgetInfo.datacenter_id = widgetInfo.datacenterId
						$scope.widgetInfo.datacenter_widget_id = widgetInfo.datacenterWidgetId;
						$scope.widgetInfo.custom_widget_id = widgetInfo.customWidgetId;

						$scope.xAxisLabel = widgetInfo.chartInformation.x_axis_title;
						$scope.yAxisLabel = widgetInfo.chartInformation.y_axis_title;
						$scope.chartSummary = widgetInfo.chartInformation.chartSummary;
						$scope.custFileRealPath = widgetInfo.custFileRealPath;
						$scope.sheetName = widgetInfo.sheetName;
								$scope.widgetName = widgetInfo.widgetName,
								$scope.showLabels = widgetInfo.chartInformation.showLabels;

						$scope.rLable = widgetInfo.chartInformation.rotateLabel;
						$scope.yAggregation = widgetInfo.chartInformation.aggr_func_y;
						$scope.aggregation = widgetInfo.chartInformation.aggr_func;
						$scope.groupBy = widgetInfo.chartInformation.groupBy;

						if (widgetInfo.groupBy3 != "") {
							$scope.groupbyThree = true;
						} else {
							$scope.groupbyThree = false;
						}

						var trendLineAndColors = commonService
								.getColorsArray(widgetInfo.trendLineOptions);

						$scope.groupbymulti = commonService
								.getColorsArray(widgetInfo.chartInformation.groupArray);

						var item = [];
						var selectedGroups = [];
						groupIndex = 0;
						// Need to change this trend lines
						var trendLineAndColors = null;
						if ($scope.groupbymulti != null) {
							for (var i = 0; i < $scope.groupbymulti.length; i++) {

								item.push(i);

								selectedGroups.push({
									"id" : i,
									"name" : $scope.groupbymulti[i]
								});

								groupIndex++;
							}
							$scope.items = item;

							$timeout(
									function() {
										for ( var key in selectedGroups) {

											$("#groupbymulti" + key).val(
													selectedGroups[key].name);

											if (trendLineAndColors == null
													|| trendLineAndColors[key]
															.indexOf('#') == -1) {
												$(
														'input:radio[name="trndline'
																+ key
																+ '"][value="no"]')
														.attr('checked',
																'checked');
												$('#colorLineTrend' + key).val(
														'#49b7e4');
												$('#cPickerLineTrend' + key)
														.colorpicker(
																'setValue',
																'#49b7e4');

											} else {
												$(
														'input:radio[name="trndline'
																+ key
																+ '"][value="yes"]')
														.attr('checked',
																'checked');

												$('#colorLineTrend' + key)
														.val(
																trendLineAndColors[key]);
												$('#cPickerLineTrend' + key)
														.colorpicker(
																'setValue',
																trendLineAndColors[key]);
											}

										}
									}, 100);
						}
						if (widgetInfo.chartType == "barChart"
								|| widgetInfo.chartType == "stackedChart") {

							if (trendLineAndColors !== null) {
								if (trendLineAndColors[0] !== null) {
									$scope.trendLine = $
											.parseJSON(trendLineAndColors[0]);
									$('#colorLine1').val(trendLineAndColors[1]);
									$('#cPickerLine1').colorpicker('setValue',
											trendLineAndColors[1]);
								}
							}
						}

						$scope.colorsArray = commonService
								.getColorsArray(widgetInfo.colorsArray);
						$scope.legendPos = widgetInfo.legendPos;

						if (widgetInfo.chartInformation.xAxisticklength == ''
								|| widgetInfo.chartInformation.xAxisticklength == undefined
								|| widgetInfo.chartInformation.xAxisticklength == null) {
							$scope.xAxisticklength = '';
						} else {
							$scope.xAxisticklength = widgetInfo.chartInformation.xAxisticklength;
						}

						$scope.xdatatype = widgetInfo.chartInformation.xaxisDataType;

						if (widgetInfo.chartInformation.valueOrPercentage == ''
								|| widgetInfo.chartInformation.valueOrPercentage == undefined
								|| widgetInfo.chartInformation.valueOrPercentage == null) {

							$scope.valueOrPercentage = {
								check : "Value"
							};
						} else {
							$scope.valueOrPercentage = {
								check : widgetInfo.chartInformation.valueOrPercentage
							};
						}

						chartTypeOnload();
						counter = $scope.colorsArray.length;
						buildCharts($scope.widgetDataArray[index]);

						$timeout(function() {
							$scope.trendlineOnchange();
							getColorArrayAndCountByhartType('', $scope.dataSet,
									$scope.xAxis, $scope.groupBy);

							$('#myDoodahModel').modal('show');
							$scope.drawChart();
						}, 100);

					}

					$scope.trendlineOnchange = function() {

						if ($("#trndline").is(':checked'))
							$scope.trendLineShow = true; // checked
						else
							$scope.trendLineShow = false;
					}

					function validateChart() {

						if ($scope.aggregation == "count") {
							$scope.yAxis = ''
						}

						var flag = true;
						if ($scope.chartType == 'barChart'
								|| $scope.chartType == 'lineChart'
								|| $scope.chartType == 'areaChart'
								|| $scope.chartType == 'pieChart'
								|| $scope.chartType == 'scatterChart') {

							if ($scope.xAxis == '') {
								$('#xColumn').css("borderColor", "red");
								$('#errortext').html('');
								$('#errortext').append("Please select X-Axis");
								flag = false;
							}

							if ($scope.aggregation == '' && $scope.yAxis == '') {
								$('#errortext').html('');
								$('#errortext').append("Please select Y-Axis");
								flag = false;
							}

							if (flag == true) {
								if ($scope.yAxis != '') {

									for ( var key in $scope.dataSet) {
										var item = $scope.dataSet[key][$scope.yAxis];

										if (item != '') {
											if ((parseInt(item) == item)
													|| parseFloat(item) == item) {
												flag = true;
												break;
											} else if (typeof item == "string"
													&& $scope.yAggregation == "count") {
												flag = true;
												break;
											} else {
												$('#errortext').html('');
												$('#errortext')
														.append(
																"Please select another option as Y Axis accept only numericals");
												flag = false;
												break;
											}
										}
									}
								}
							}
						} else if ($scope.chartType == 'stackedChart'
								|| $scope.chartType == 'stackedSingleClustered') {

							if ($scope.xAxis == '') {
								$('#errortext').html('');
								$('#errortext').append("Please select X-Axis");
								flag = false;
							}

							if ($scope.aggregation != 'count'
									&& $scope.yAxis == '') {
								$('#errortext').html('');
								$('#errortext').append("Please select Y-Axis");
								flag = false;
							}

							if ($scope.groupBy == '') {
								$('#errortext').html('');
								$('#errortext').append("Please select groupBy");
								flag = false;
							}
							if (flag == true) {
								if ($scope.yAxis != '') {

									for ( var key in $scope.dataSet) {
										var item = $scope.dataSet[key][$scope.yAxis];

										if (item != '') {
											if ((parseInt(item) == item)
													|| parseFloat(item) == item) {
												flag = true;
												break;

											} else if (typeof item == "string"
													&& $scope.yAggregation == "count") {
												flag = true;
												break;
											} else {
												$('#errortext').html('');
												$('#errortext')
														.append(
																"Please select another option as Y Axis accept only numericals");
												flag = false;
												break;
											}
										}
									}
								}
							}

						} else if ($scope.chartType == 'stackedMultiChart'
								|| $scope.chartType == 'stackedMultiClustered'
								|| $scope.chartType == 'stackedLineMultiChart'
								|| $scope.chartType == 'stackedAreaMultiChart') {

							if ($scope.xAxis == '') {
								$('#errortext').html('');
								$('#errortext').append("Please select X-Axis");
								flag = false;
							}

						} else if ($scope.chartType == 'gaugeChart') {

							$scope.gaugeAggrValue = $scope.showGaugeAggrValue(
									$scope.dataSet, $scope.gaugeColumn,
									$scope.gAggregation);

							if (isNaN($scope.gaugeAggrValue)
									|| $scope.gaugeAggrValue == '') {

								$('#errortext').html('');
								$('#errortext')
										.append(
												"Cannot Plot Chart with selected Aggregation");
								flag = false;
							}

							if ($scope.gaugeTypeMyD == '') {
								$('#errortext').html('');
								$('#errortext').append(
										"Please select gauge type");
								flag = false;
							}
							if ($scope.gaugeColumn == '') {
								$('#errortext').html('');
								$('#errortext').append(
										"Please Select Gauge Column");
								flag = false;
							}
							if ($scope.gAggregation == ''
									|| $scope.gAggregation == undefined) {
								$('#errortext').html('');
								$('#errortext').append(
										"Please select aggregation..");
								flag = false;
							}
							if ($scope.maxValue.value == '') {
								$('#errortext').html('');
								$('#errortext').append("Please give Max Value");
								flag = false;
							}
						} else if ($scope.chartType == 'ganttChart') {
							flag = true;
							return flag;
						}

						return flag;
					}

					$scope.errortext = false;
					$scope.drawChart = function() {

						var validate = validateChart();
						if (validate == false) {
							$scope.showChart = false;
							$scope.errortext = true;
						} else {
							$("#saveBtn").removeClass("disabled");
							$scope.errortext = false;
							$scope.colorsArray = [];
							$scope.groupbymulti = [];
							$scope.groupBymultiTrend = false;
							$scope.groupBymulticolorTrend = [];
							var modalshow = true;

							for (i = 0; i < counter.length; i++) {
								if ($('#color' + i).val() == ''
										|| $('#color' + i).val() == undefined) {
									$scope.showChart = false;
									$scope.errortext = true;
									$('#errortext').html('');
									$('#errortext')
											.append(
													"Please pick a color for drawing chart");
									modalshow = false;
								} else {
									$scope.colorsArray.push($('#color' + i)
											.val());
								}
							}

							if ($scope.chartType == 'stackedMultiChart'
									|| $scope.chartType == 'stackedMultiClustered'
									|| $scope.chartType == 'stackedLineMultiChart'
									|| $scope.chartType == 'stackedAreaMultiChart') {

								if (groupIndex === 0) {
									$scope.showChart = false;
									$scope.errortext = true;
									$('#errortext').html('');
									$('#errortext')
											.append(
													"Please Add Group by for plotting chart");
									modalshow = false;

								} else {

									for (var i = 0; i < groupIndex; i++) {
										if ($(
												"#groupbymulti" + i
														+ " option:selected")
												.val() == '') {
											$scope.showChart = false;
											$scope.errortext = true;
											$('#errortext').html('');
											$('#errortext').append(
													"Please Select Group by");
											modalshow = false;
										} else {
											$scope.groupbymulti
													.push($(
															"#groupbymulti"
																	+ i
																	+ " option:selected")
															.val());

											if ($(
													'input[name=trndline' + i
															+ ']:checked')
													.val() === 'yes') {
												$scope.groupBymulticolorTrend
														.push($(
																"#colorLineTrend"
																		+ i)
																.val());
												$scope.groupBymultiTrend = true;
											} else {

												$scope.groupBymulticolorTrend
														.push(false);
											}
										}
									}
								}
							}

							if (modalshow == true) {
								$timeout(function() {
									$scope.chartRedraw();

								}, 1000);
								$scope.showChart = true;
								$scope.errortext = false;
							}

						}

					}

					$scope.chartRedraw = function() {
						if ($scope.chartType == 'gaugeChart') {
							$scope.errortext = false;
							$('#sDChart').hide();
							$('#gaChart').show();
							$('#power-gauge').hide();

							var elmnt = document.getElementById('panel');
							var width = elmnt.offsetWidth;
							var height = elmnt.offsetHeight;

							var screenSize = width / 2 + 200;

							var chartId = '';
							if ($scope.gaugeTypeMyD == "powerGauge") {
								chartId = 'power-gauge';
							} else {
								chartId = 'fillgauge';
							}
							var options = {

								chartId : chartId,
								// chartIdwithIndex : "custWidget0custWidget"
								chartSummary : $scope.chartSummary,
								custFileRealPath : $scope.custFileRealPath,
								sheetName : $scope.sheetName,
								widgetName : $scope.widgetName,
								chartSummaryPositionX : 600,
								chartSummaryPositionY : 10,
								gaugeGroup : $scope.gaugeColumn,
								gAggrFunc : $scope.gAggregation,
								gaugeMaxValue : $scope.maxValue.value,
								ChartType : $scope.gaugeTypeMyD,
								gaugeValue : $scope.gaugeAggrValue,
								colorsArray : commonService
										.getColorsArray($scope.colorsArray),
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

							if ($scope.gaugeTypeMyD == 'powerGauge') {
								$('#fillgauge').html('');
								$('#fillgauge').hide();
								$('#power-gauge').html('');
								$('#power-gauge').show();

							} else {

								$('#power-gauge').html('');
								$('#power-gauge').hide();
								$('#fillgauge').html('');
								$('#fillgauge').show();

							}

							chartIn = widgetService.buildGraphGauge(
									$scope.dataSet, options);

							$('#gaChart').css({
								'opacity' : 1
							});

						} else {
							$('#saveBtn').attr('disabled', false);
							$('#gaChart').hide();
							$('#gaChart').css('opacity', '0');
							$('#sDChart').show();

							var xAxis = null;
							var yAxis = null;
							var groupBy1 = null;
							var groupBy2 = null;
							var dataFormat = null;

							if ($scope.chartType == 'ganttChart') {
								yAxis = $scope.taskColumn;
								xAxis = $scope.taskTypeColumn;
								groupBy1 = $scope.startDateColumn;
								groupBy2 = $scope.endDateColumn;
								dataFormat = $scope.dateformatColumn

							} else {
								xAxis = $scope.xAxis;
								yAxis = $scope.yAxis;
								dataFormat = $scope.dateformatselect;
							}
							var xdatetimeformat = '';
							if ($scope.chartType == "ganttChart") {
								xdatetimeformat = $scope.dateformatColumn;
							} else {
								if ($scope.xdatatype == 'Date') {
									xdatetimeformat = $scope.dateformatselect;
								} else if ($scope.xdatatype == 'DateandTime') {
									xdatetimeformat = $scope.datetimeformatselect
											+ '@' + $scope.timeformatselect;
								}
							}

							var trendLineoptions = [];

							if ($scope.chartType === 'barChart'
									|| $scope.chartType === 'stackedChart') {
								trendLineoptions = [ $scope.trendLine,
										$('#colorLine1').val() ];
							} else if ($scope.chartType === 'stackedMultiClustered'
									|| $scope.chartType === 'stackedMultiChart') {
								trendLineoptions = [ $scope.groupBymultiTrend,
										$scope.groupBymulticolorTrend ];
							}

							var options = {
								chartType : $scope.chartType,
								chartId : '#sDChart',
								chartSummary : $scope.chartSummary,
								custFileRealPath : $scope.custFileRealPath,
								sheetName : $scope.sheetName,
								widgetName : $scope.widgetName,
								xAxis : xAxis,
								yAxis : yAxis,
								xAggrFunc : $scope.aggregation,
								yAggrFunc : $scope.yAggregation,
								groupBy : $scope.groupBy,
								xAxisLabel : $scope.xAxisLabel,
								yAxisLabel : $scope.yAxisLabel,
								// for stacked grouped bar chart
								groupBy1 : groupBy1,
								groupArray : $scope.groupbymulti,

								rotateLabel : $scope.rLable,

								colorsArray : commonService
										.getColorsArray($scope.colorsArray),

								valueOrPercentage : $scope.valueOrPercentage.check,
								xaxisticklength : $scope.xAxisticklength,
								showLabels : $scope.showLabels,
								xaxisDataType : $scope.xdatatype,
								dataFormat : xdatetimeformat,
								legendPos : $scope.legendPos,
								trendLineOptions : trendLineoptions,
								brushOnFlag : false,
								noYAxis : false,
								sliderHeight : '',
							}

							chart = widgetService.buildGraph($scope.dataSet,
									options);
						}
						$('#sDChart').css({
							'opacity' : 1
						});

					}

					$scope.saveToDB = function() {
						var validate = validateChart();

						var index = $scope.dataIndex;
						var widgetName = $('#widgetName').val();
						$(".panelHeaderTextPadding_" + index).text(widgetName);

						if (validate == true) {

							$scope.errortext = false;
							$scope.colorsArray = [];
							$scope.groupbymulti = [];
							$scope.trendLineoptions = [];
							$scope.groupBymultiTrend = false;
							$scope.groupBymulticolorTrend = [];
							var modalshow = true;

							for (i = 0; i < counter.length; i++) {
								if ($('#color' + i).val() == ''
										|| $('#color' + i).val() == undefined) {
									$scope.showChart = false;
									$scope.errortext = true;
									$('#errortext').html('');
									$('#errortext')
											.append(
													"Please pick a color for drawing chart");
									modalshow = false;
								} else {
									$scope.colorsArray.push($('#color' + i)
											.val());
								}
							}

							if ($scope.chartType == 'stackedMultiChart'
									|| $scope.chartType == 'stackedMultiClustered'
									|| $scope.chartType == 'stackedLineMultiChart'
									|| $scope.chartType == 'stackedAreaMultiChart') {

								if (groupIndex === 0) {
									$scope.showChart = false;
									$scope.errortext = true;
									$('#errortext').html('');
									$('#errortext')
											.append(
													"Please Add Group by for plotting chart");
									modalshow = false;

								} else {

									for (var i = 0; i < groupIndex; i++) {
										if ($(
												"#groupbymulti" + i
														+ " option:selected")
												.val() == '') {
											$scope.showChart = false;
											$scope.errortext = true;
											$('#errortext').html('');
											$('#errortext').append(
													"Please Select Group by");
											modalshow = false;
										} else {
											$scope.groupbymulti
													.push($(
															"#groupbymulti"
																	+ i
																	+ " option:selected")
															.val());

											if ($(
													'input[name=trndline' + i
															+ ']:checked')
													.val() === 'yes') {
												$scope.groupBymulticolorTrend
														.push($(
																"#colorLineTrend"
																		+ i)
																.val());
												$scope.groupBymultiTrend = true;
											} else {

												$scope.groupBymulticolorTrend
														.push(false);
											}
										}
									}
								}
							}
							var trendLineoptions = [];
							if ($scope.chartType === 'barChart'
									|| $scope.chartType === 'stackedChart') {
								trendLineoptions = [ $scope.trendLine,
										$('#colorLine1').val() ];
							} else if ($scope.chartType === 'stackedMultiClustered'
									|| $scope.chartType === 'stackedMultiChart') {
								if ($scope.groupBymultiTrend) {
									trendLineoptions = $scope.groupBymulticolorTrend;
								}
							}

							if (modalshow == true) {

								if ($scope.chartType == 'barChart'
										|| $scope.chartType == 'pieChart'
										|| $scope.chartType == 'lineChart'
										|| $scope.chartType == 'areaChart') {
									$scope.groupBy = '';
									$scope.groupBy1 = '';
									$scope.groupBy2 = '';
								}

								var xdatetimeformat = '';
								if ($scope.chartType == "ganttChart") {
									xdatetimeformat = $scope.dateformatColumn;
								} else {
									if ($scope.xdatatype == 'Date') {
										xdatetimeformat = $scope.dateformatselect;
									} else if ($scope.xdatatype == 'DateandTime') {
										xdatetimeformat = $scope.datetimeformatselect
												+ '@' + $scope.timeformatselect;
									}
								}

								var xAxis = null;
								var yAxis = null;
								var groupBy1 = null;
								var groupBy2 = null;
								var dataFormat = null;

								if ($scope.chartType == 'ganttChart') {
									yAxis = $scope.taskColumn;
									xAxis = $scope.taskTypeColumn;
									groupBy1 = $scope.startDateColumn;
									groupBy2 = $scope.endDateColumn;
									dataFormat = $scope.dateformatColumn

								} else {
									xAxis = $scope.xAxis;
									yAxis = $scope.yAxis;
									dataFormat = $scope.dateformatselect;
								}
								var dataObj = {
									customWidgetId : $scope.widgetInfo.custom_widget_id,
									projectId : $sessionStorage.projectId,
									userId : $sessionStorage.userId,
									sourceUrl : $scope.widgetInfo.source_url,
									chartType : $scope.chartType,
									type : $scope.responseArray[index].type,
									xAxis : xAxis,
									xAxisTitle : $scope.xAxisLabel,
									yAxis : yAxis,
									yAxisTitle : $scope.yAxisLabel,
									aggrFunc : $scope.aggregation,
									aggrFuncY : $scope.yAggregation,
									widgetName : $scope.widgetTitle,
									groupBy : $scope.groupBy,
									groupBy1 : groupBy1,
									groupBy2 : groupBy2,
									custFilePath : $scope.widgetInfo.custFilePath,
									gaugeType : $scope.gaugeTypeMyD,
									gaugeColumn : $scope.gaugeColumn,
									aggrFunG : $scope.gAggregation,
									gaugeMaxValue : $scope.maxValue.value,
									widgetType : $scope.widgetInfo.widgetType,
									widgetId : $scope.widgetInfo.widgetId,
									datacenterId : $scope.widgetInfo.datacenter_id,
									datacenterWidgetId : $scope.widgetInfo.datacenter_widget_id,
									template : $scope.widgetInfo.template,
									rotateLabel : $scope.rLable,
									chartSummary : $scope.chartSummary,
									custFileRealPath : $scope.custFileRealPath,
									sheetName : $scope.sheetName,
									widgetName : $scope.widgetName,
									colorsArray : $scope.colorsArray,
									showLabels : $scope.showLabels,
									legendPosition : $scope.legendPos,
									valueOrPercentage : $scope.valueOrPercentage.check,
									xAxisticklength : $scope.xAxisticklength,
									xaxisDataType : $scope.xdatatype,
									xaxisDateFormat : xdatetimeformat,
									groupArray : $scope.groupbymulti,
									trendLineOptions : trendLineoptions,
									customWidgetType : $scope.widgetInfo.customWidgetType
								};

								var widgetResponse = customwidgetService
										.postCustomWidgetDetails(dataObj);
								widgetResponse.then(function(response) {

									if (response.data === 'success') {
										updateSessionObj(dataObj);
										$('#myDoodahModel').modal('hide');
										$('#succWidgetModal').modal('show');
									} else {

									}
								}, function(errorResponse) {

								});
							}
						} else {
							$scope.showChart = false;
							$scope.errortext = true;
						}
					}
					$scope.drawFinalChart = function() {
						$('#succWidgetModal').modal('hide');

						var tempChartId = 'standWidget' + $scope.dataIndex;

						$timeout(
								function() {
									if ($scope.widgetInfo.widgetType === 'custom') {
										tempChartId = 'custWidget'
												+ $scope.dataIndex;
									}
									if ($scope.chartType == 'gaugeChart') {
										$("#filter_" + $scope.dataIndex)
												.addClass("disabled");

										var elmnt = document
												.getElementById('panelId'
														+ $scope.dataIndex);
										var width = elmnt.offsetWidth;
										var height = elmnt.offsetHeight;
										var screenSize = width / 2 + 100;

										var options = {
											chartId : tempChartId,
											chartSummary : $scope.chartSummary,
											custFileRealPath : $scope.custFileRealPath,
											sheetName : $scope.sheetName,
											widgetName : $scope.widgetName,
											chartSummaryPositionX : 600,
											chartSummaryPositionY : 10,
											gaugeGroup : $scope.gaugeColumn,
											gAggrFunc : $scope.gAggregation,
											gaugeMaxValue : $scope.maxValue.value,
											ChartType : $scope.gaugeTypeMyD,
											gaugeValue : $scope.gaugeAggrValue,
											colorsArray : commonService
													.getColorsArray($scope.colorsArray),
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

										$("#" + tempChartId).html('');
										if ($scope.gaugeTypeMyD == 'powerGauge') {

											var chartDiv = '<div class="row graphWell bTop" align="center"><div id="'
													+ tempChartId + '"></div>';

											if ($scope.widgetInfo.widgetType === 'custom') {
												$(
														'#custWidget'
																+ $scope.dataIndex)
														.replaceWith(chartDiv);
												tempChartId = 'custWidget'
														+ $scope.dataIndex;
											} else {
												$(
														'#standWidget'
																+ $scope.dataIndex)
														.replaceWith(chartDiv);
												tempChartId = 'standWidget'
														+ $scope.dataIndex;
											}

											$("#" + tempChartId).css('width',
													width);
											$("#" + tempChartId).css('height',
													height);

											charts[$scope.dataIndex] = widgetService
													.buildGraphGauge(
															$scope.dataSet,
															options);
										} else {
											var chartDivSvg = '<svg class="mTop" id="'
													+ tempChartId + '" ></svg>';

											$('#fillgauge').html('');
											if ($scope.widgetInfo.widgetType === 'custom') {
												$(
														'#custWidget'
																+ $scope.dataIndex)
														.replaceWith(
																chartDivSvg);
												tempChartId = 'custWidget'
														+ $scope.dataIndex;
											} else {
												$(
														'#standWidget'
																+ $scope.dataIndex)
														.replaceWith(
																chartDivSvg);
												tempChartId = 'standWidget'
														+ $scope.dataIndex;
											}

											if (height >= 500) {
												$("#" + tempChartId).css(
														'height', height - 100);
											} else {
												$("#" + tempChartId).css(
														'height', height - 15);
											}
											$("#" + tempChartId).css('width',
													width - 100);

											charts[$scope.dataIndex] = widgetService
													.buildGraphGauge(
															$scope.dataSet,
															options);
											$('#gaChart').css({
												'opacity' : 1
											});
										}

									} else {
										$("#filter_" + $scope.dataIndex)
												.removeClass("disabled");
										var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:300px;" id="'
												+ tempChartId + '"></div>';

										if ($scope.widgetInfo.widgetType === 'custom') {
											$('#custWidget' + $scope.dataIndex)
													.replaceWith(chartDiv);
											tempChartId = '#custWidget'
													+ $scope.dataIndex;
										} else {
											$('#standWidget' + $scope.dataIndex)
													.replaceWith(chartDiv);
											tempChartId = '#standWidget'
													+ $scope.dataIndex;
										}
										$('#loader' + $scope.dataIndex).hide();
										$(tempChartId).html('');

										var xAxis = null;
										var yAxis = null;
										var groupBy1 = null;
										var groupBy2 = null;
										var dataFormat = null;

										if ($scope.chartType == 'ganttChart') {
											yAxis = $scope.taskColumn;
											xAxis = $scope.taskTypeColumn;
											groupBy1 = $scope.startDateColumn;
											groupBy2 = $scope.endDateColumn;
											dataFormat = $scope.dateformatColumn

										} else {
											xAxis = $scope.xAxis;
											yAxis = $scope.yAxis;
											dataFormat = $scope.dateformatselect;
										}
										var xdatetimeformat = '';
										if ($scope.chartType == "ganttChart") {
											xdatetimeformat = $scope.dateformatColumn;
										} else {
											if ($scope.xdatatype == 'Date') {
												xdatetimeformat = $scope.dateformatselect;
											} else if ($scope.xdatatype == 'DateandTime') {
												xdatetimeformat = $scope.datetimeformatselect
														+ '@'
														+ $scope.timeformatselect;
											}
										}

										var trendLineoptions = [];
										if ($scope.chartType === 'barChart'
												|| $scope.chartType === 'stackedChart') {
											trendLineoptions = [
													$scope.trendLine,
													$('#colorLine1').val() ];
										} else if ($scope.chartType === 'stackedMultiClustered'
												|| $scope.chartType === 'stackedMultiChart') {
											trendLineoptions = [
													$scope.groupBymultiTrend,
													$scope.groupBymulticolorTrend ];
										}

										var options = {

											chartType : $scope.chartType,
											chartId : tempChartId,
											chartSummary : $scope.chartSummary,
											custFileRealPath : $scope.custFileRealPath,
											sheetName : $scope.sheetName,
											widgetName : $scope.widgetName,
											xAxis : xAxis,
											yAxis : yAxis,
											xAggrFunc : $scope.aggregation,
											yAggrFunc : $scope.yAggregation,
											groupBy : $scope.groupBy,
											xAxisLabel : $scope.xAxisLabel,
											yAxisLabel : $scope.yAxisLabel,
											// for stacked grouped bar chart
											groupBy1 : groupBy1,
											groupBy2 : groupBy2,
											groupArray : $scope.groupbymulti,
											rotateLabel : $scope.rLable,

											colorsArray : commonService
													.getColorsArray($scope.colorsArray),

											valueOrPercentage : $scope.valueOrPercentage.check,
											xaxisticklength : $scope.xAxisticklength,
											showLabels : $scope.showLabels,
											xaxisDataType : $scope.xdatatype,
											dataFormat : xdatetimeformat,
											legendPos : $scope.legendPos,
											trendLineOptions : trendLineoptions,
											brushOnFlag : false,
											noYAxis : false,
											sliderHeight : '',

										}

										charts[$scope.dataIndex] = widgetService
												.buildGraph($scope.dataSet,
														options);

										var index = $scope.dataIndex;

										$scope.forAllChartsAllFunctions(index,
												'');

									}
								}, 500);

					}
					function updateSessionObj(dataObject) {

						var xdatetimeformat = '';
						if ($scope.chartType == "ganttChart") {
							xdatetimeformat = $scope.dateformatColumn;
						} else {
							if ($scope.xdatatype == 'Date') {
								xdatetimeformat = $scope.dateformatselect;
							} else if ($scope.xdatatype == 'DateandTime') {
								xdatetimeformat = $scope.datetimeformatselect
										+ '@' + $scope.timeformatselect;
							}
						}

						var xAxis = null;
						var yAxis = null;
						var groupBy1 = null;
						var groupBy2 = null;
						var dataFormat = null;

						if ($scope.chartType == 'ganttChart') {
							yAxis = $scope.taskColumn;
							xAxis = $scope.taskTypeColumn;
							groupBy1 = $scope.startDateColumn;
							groupBy2 = $scope.endDateColumn;
							dataFormat = $scope.dateformatColumn

						} else {
							xAxis = $scope.xAxis;
							yAxis = $scope.yAxis;
							groupBy1 = $scope.groupBy1;
							groupBy2 = $scope.groupBy2;
							dataFormat = $scope.dateformatselect;
						}
						var chartObj = {
							aggrFunG : $scope.gAggregation,
							customWidgetId : $scope.widgetInfo.custom_widget_id,
							datacenterId : $scope.widgetInfo.datacenter_id,
							datacenterWidgetId : $scope.widgetInfo.datacenter_widget_id,
							gaugeColumn : $scope.widgetInfo.gaugeColumn,
							type : $scope.responseArray[$scope.dataIndex].type,
							gaugeMaxValue : $scope.widgetInfo.gaugeMaxValue,
							gaugeType : $scope.widgetInfo.gaugeType,
							projectId : $scope.widgetInfo.project_id,
							template : $scope.widgetInfo.template,
							userid : $scope.widgetInfo.userid,
							widgetId : $scope.widgetInfo.widgetId,
							widgetName : $scope.widgetInfo.widgetName,
							chartType : $scope.chartType,
							xAxisName : xAxis,
							xAxisNameTitle : $scope.xAxisLabel,
							yAxisName : yAxis,
							yAxisNameTitle : $scope.yAxisLabel,
							aggrFunc : $scope.aggregation,
							aggrFuncY : $scope.yAggregation,
							groupBy : $scope.groupBy,
							groupBy1 : groupBy1,
							groupBy2 : groupBy2,
							groupBy3 : $scope.groupBy3,
							rotateLabel : $scope.rLable,
							chartSummary : $scope.chartSummary,
							custFileRealPath : $scope.custFileRealPath,
							sheetName : $scope.sheetName,
							widgetName : $scope.widgetName,
							colorsArray : $scope.colorsArray,
							showLabels : $scope.showLabels,
							legendPosition : $scope.legendPos,
							widgetType : $scope.widgetInfo.widgetType,
							sourceUrl : $scope.widgetInfo.source_url,
							custFilePath : $scope.widgetInfo.custFilePath,
							gaugeColumn : $scope.gaugeColumn,
							gaugeMaxValue : $scope.maxValue.value,
							gaugeType : $scope.gaugeTypeMyD,
							xaxisDataType : $scope.xdatatype,
							dataFormat : xdatetimeformat,
							groupsArray : $scope.groupbymulti,
							trendLineOptions : dataObject.trendLineOptions,
							customWidgetType : $scope.widgetInfo.customWidgetType
						};
						$scope.responseArray[$scope.dataIndex] = chartObj;
					}

					function buildCharts(data) {
						if (data["Defects"]) {
							dataSetMain = data["Defects"];
						} else if (data["issues"]) {
							dataSetMain = data["issues"];
						} else if (data["issues"]) {
							dataSetMain = data["allBuilds"];
						} else if (data["chartData"]) {
							dataSetMain = data["chartData"];
						} else {
							dataSetMain = data;
						}

						$scope.dataSet = dataSetMain;
						$scope.dataOptions = dataSetMain[0];

					}
					$scope.changeLegendPos = function() {
						var elmnt = document.getElementById("sDChart");
						var width = elmnt.offsetWidth;
						var height = elmnt.offsetHeight;
						var legendY;

						if ($scope.legendPos === 'Top Left') {
							legendX = 10;
							legendY = 10;

						} else if ($scope.legendPos === 'Top Center') {
							legendX = width / 2;
							legendY = 10;

						} else if ($scope.legendPos === 'Top Right') {
							legendX = width / 2;
							legendY = 10;

						} else if ($scope.legendPos === 'Bottom Left') {
							legendX = 10;
							legendY = height - 50;
						} else if ($scope.legendPos === 'Bottom Center') {
							legendX = 10;
							legendY = 150;
						} else if ($scope.legendPos === 'Bottom Right') {
							legendX = width / 2;
							legendY = height - 50;
						}

						charts[i].legend(dc.legend().x(legendX).y(legendY)
								.itemHeight(10).gap(5).horizontal(true)
								.autoItemWidth(true));
						charts[i].render();

					}
					$scope.changeChartType = function() {
						$("#addBtn").addClass("disabled");
						chartTypeOnload();
						getColorArrayAndCountByhartType('onchange',
								$scope.dataSet, $scope.xAxis, $scope.groupBy);
					}

					// Drilldown Code
					var sprintProgressTableObj = '';
					$rootScope.drillDownData = function(index, key, value,
							layer) {
						console.log("====", index);
						if (!isNaN(index)) {
							var myList = [];
							$scope.dataPreviousIndex = $scope.dataIndex;
							$scope.dataIndex = index;
							var dataSetMain = $scope.widgetDataArray[index];
							defaultcheck = key;
							var dimension = $scope.responseArray[index].chartInformation.x_axis;

							var groupBy = $scope.responseArray[index].groupBy;

							if (groupBy && groupBy != ''
									&& groupBy != undefined) {
								myList = myDashboardService.getJSONByKeyVal(
										myList, groupBy, layer);
							}

							$('#graphDrillData_' + $scope.dataPreviousIndex)
									.hide();
							$('#graphDrillData_' + index).show();
							// index
							var graphData = "<table id='graphDrillData_"
									+ index
									+ "' class='table table-striped tablesorter backColorWhite theadColor'></table>";

							$('#drillDownDiv').html(graphData);

							if (typeof key == 'string') {

								key = (key);
								dimension = getChangedData(dimension);

							} else if (typeof key == 'number') {
								key = key;
							}

							var drilldowndata = null;

							if ($scope.widgetdrillDownArray[index] == undefined) {
								drilldowndata = getJsonObject(dataSetMain);
							} else {
								drilldowndata = $scope.widgetdrillDownArray[index];
							}
							console.log("drilldowndata ****  ", drilldowndata);
							var columnIndex = buildDrillHtmlTable(
									'#graphDrillData_' + index, drilldowndata,
									'#drillDownModel', index,
									'#sprintProgresAccordin1', dimension);

							sprintProgressTableObj = $(
									'table' + '#graphDrillData_' + index)
									.DataTable(
											{
												"aLengthMenu" : [
														[ 6, 30, 70, -1 ],
														[ 6, 30, 70, "All" ] ],
												"iDisplayLength" : 6,
												"order" : [ [ 0, "asc" ] ]
											});

							$timeout(function() {
								$("input:checkbox").prop('checked', false);
								// key = escapeRegExp(key);
								$(
										'input:checkbox[name="'
												+ dimension.toLowerCase()
												+ '[]"]').filter(
										'[value="' + key + '"]').prop(
										'checked', true);

								$scope.filterForDrillDown(dimension
										.toLowerCase(), columnIndex);

							}, 500);

							$('#drillDownModel').modal('show');
						}
					}

					function getJsonObject(data) {
						var changedObject = [];

						for ( var key in data) {
							var changedfori = [];
							for ( var i in data[key]) {

								var keyName = i.replace(/\n/ig, '')

								changedfori[keyName] = data[key][i];
							}

							changedObject[key] = changedfori;
						}

						return changedObject;
					}

					function buildDrillHtmlTable(tableId, drillDownWidgetData,
							popupId, widgetIndex, collapseId, headerName) {

						if ($.fn.dataTable.isDataTable(tableId)) {
							$(tableId).dataTable().fnDestroy();
						}

						var columnIndex = 0;

						$("#table_header_status_" + widgetIndex).html('');
						$("#table_body_status_" + widgetIndex).html('');

						console.log(" drillDownWidgetData=======",
								drillDownWidgetData);
						var keys = [];

						for ( var value in drillDownWidgetData) {
							keys = Object.keys(drillDownWidgetData[value]);
						}

						console.log(" keys=======", keys);
						jQuery(tableId)
								.append(
										$compile(
												'<thead><tr id="table_header_status_'
														+ widgetIndex
														+ '"></tr></thead><tbody id="table_body_status_'
														+ widgetIndex
														+ '"></tbody>')($scope));

						$(collapseId).empty();

						var table_body_data = '';

						for ( var value in drillDownWidgetData) {

							table_body_data = table_body_data
									+ '<tr class="hyperLink theadColor">';
							for (var i = 0; i < keys.length; i++) {
								var changedvalue = drillDownWidgetData[value][keys[i]];

								var isNan = isNaN(changedvalue) ? -1
										: changedvalue;
								if (changedvalue == null) {
									changedvalue = '';
								}
								if (isNan == -1
										&& typeof changedvalue == "number") {

								} else {
									table_body_data = table_body_data + '<td>'
											+ changedvalue + '</td>';
								}

								// if (typeof
								// drillDownWidgetData[value][keys[i]] !==
								// "number") {
								// if (changedvalue == null) {
								// changedvalue = '';
								// }
								//
								// table_body_data = table_body_data + '<td>'
								// + changedvalue + '</td>';
								//
								// }

							}
							table_body_data = table_body_data + '</tr>';
						}

						jQuery("#table_body_status_" + widgetIndex).append(
								$compile(table_body_data)($scope));

						// keys
						for (var i = 0; i < keys.length; i++) {

							var changedkey = getChangedData(keys[i]);
							if (keys[i] != '') {
								if (changedkey !== '') {

									var headerNameFormattedValue = keys[i]
											.replace("_", " ");
									var headerNameFormattedValue = headerNameFormattedValue
											.toLowerCase().replace(
													/\b[a-z]/g,
													function(letter) {
														return letter
																.toUpperCase();
													});

									jQuery(
											"#table_header_status_"
													+ widgetIndex)
											.append(
													$compile(
															'<th>'
																	+ headerNameFormattedValue
																	+ '</th>')(
															$scope));
									var array_header = [];
									var divData = "";
									var arrayPush = [];

									for ( var value in drillDownWidgetData) {
										var changedvalue = getChangedData(drillDownWidgetData[value][keys[i]]);

										if (changedvalue == null) {
											changedvalue = '';
										}

										if ($.inArray(changedvalue, arrayPush) == -1) {
											arrayPush.push(changedvalue);
											array_header
													.push({
														"changed" : changedvalue,
														"actual" : drillDownWidgetData[value][keys[i]]
													});

										}
									}

									var checkBoxKey = getChangedData(keys[i]);

									// 

									for (var k = 0; k < array_header.length; k++) {

										divData = divData
												+ '<div class="checkbox checkboxfilter checkbox-info"> '
												+ '<input ng-change="filterForDrillDown(\''
												+ checkBoxKey.toLowerCase()
												+ '\',\'' + i
												+ '\')" ng-model="'
												+ checkBoxKey + "_"
												+ widgetIndex + '[' + k
												+ '].checked" type="checkbox"'
												+ 'name="'
												+ checkBoxKey.toLowerCase()
												+ '[]" value="'
												+ array_header[k].actual
												+ '" id="Id'
												+ array_header[k].changed + '_'
												+ i + '"> <label' + ' for="Id'
												+ array_header[k].changed + '_'
												+ i + '">'
												+ array_header[k].actual
												+ '</label> </div>';

									}

									jQuery(collapseId)
											.append(
													$compile(
															'<div class="panel panel-default tableFontSize"><div class="panel-heading header_panel '
																	+ checkBoxKey
																	+ '" align="left"><b class="panel-title tableFontSize"><a class="accordion-toggle" data-toggle="collapse" data-parent="'
																	+ collapseId
																	+ '"data-target="#'
																	+ checkBoxKey
																	+ "_"
																	+ widgetIndex
																	+ '"> <span class="fa fa-filter"></span> '
																	+ headerNameFormattedValue
																	+ '</a></b></div><div id="'
																	+ checkBoxKey
																	+ "_"
																	+ widgetIndex
																	+ '"class="panel-collapse collapse"><div class="panel-body panelStyle">'
																	+ divData
																	+ '</div></div></div>')
															($scope));

									if (checkBoxKey.toLowerCase() == headerName
											.toLowerCase()) {
										columnIndex = i;
									}
								}
							}
						}

						return columnIndex;
					}

					function getChangedData(input) {

						var textAfterModif = null;

						if (typeof input == 'number') {
							return input;
						} else if (input == null) {
							return '';
						} else {
							textAfterModif = input
									// .replace(/\n/ig, '')
									.replace(
											/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/g,
											'').replace(/^(-)+|(-)+$/g, '');

							var input = textAfterModif.trim();

							return input.toLowerCase();
						}

					}

					$scope.filterForDrillDown = function(headerName,
							columnIndex, defaultCheck) {
						var types = "";
						var topic = "";
						var ntypes = "";

						// build a regex filter string with an or(|) condition
						types = $(
								'input:checkbox[name="' + headerName
										+ '[]"]:checked').map(function() {

							return this.value;
						}).get().join('|');

						if (types != "") {

							$("#" + headerName + "_" + $scope.dataIndex)
									.addClass("in");
							$('.' + headerName).css("background", "#b3cccc");

							sprintProgressTableObj.columns(columnIndex).search(
									"^(" + types + ")$", true, false, false)
									.draw();

						} else {
							$('.' + headerName).css("background", "");
							var types = $(
									'input:checkbox[name="' + headerName
											+ '[]"]').map(function() {
								return this.value;
							}).get().join('|');

							sprintProgressTableObj.columns(columnIndex).search(
									"^(" + types + ")$", true, false, false)
									.draw();
						}

						$("#resetAll").click(
								function() {
									$("input:checkbox").prop('checked', false);

									$('.' + headerName).css("background", "");

									ntypes = "";

									ntypes = $(
											'input:checkbox[name="'
													+ headerName + '[]"]').map(
											function() {

												$(
														'input:checkbox[name="'
																+ headerName
																+ '[]"]').prop(
														'checked', false);

												return this.value;
											}).get().join('|');

									sprintProgressTableObj.columns(columnIndex)
											.search("^(" + ntypes + ")$", true,
													false, false).draw();

									types = "";

								});

					}

					// Drilldown End

					// Filter Code
					$scope.filterData = function(index) {

						var myList = [];
						$scope.dataPreviousIndex = $scope.dataIndex;
						$scope.dataIndex = index;
						var dimension = $scope.responseArray[index].chartInformation.x_axis;
						var group = $scope.responseArray[index].chartInformation.y_axis;
						var chartType = $scope.responseArray[index].chartInformation.chart_type;
						var xAggrFunc = $scope.responseArray[index].chartInformation.aggr_func;
						var yAggrFunc = $scope.responseArray[index].chartInformation.aggr_func_y;
						var groupBy = $scope.responseArray[index].chartInformation.groupBy;
						var groupBy1 = $scope.responseArray[index].chartInformation.groupBy1;
						var groupBy2 = $scope.responseArray[index].chartInformation.groupBy2;
						var groupBy3 = $scope.responseArray[index].chartInformation.groupBy3;
						var gaugeGroup = $("#gColumn option:selected").val();
						var gAggrFunc = $(
								"input:radio[name='gAggrFunc']:checked").val();
						var gaugeMaxValue = $('#maxGuageValue').val();

						var gaugeChartType = $(
								"input:radio[name='gaugeChartType']:checked")
								.val();
						$scope.groupbymulti = commonService
								.getColorsArray($scope.responseArray[index].chartInformation.groupsArray);
						var xLabel = dimension;
						var yLabel = group;
						if (xAggrFunc == 'count') {
							yLabel = 'Count';
							$scope.yAxis = 'Count';
						}
						var dataSetMain = $scope.widgetDataArray[index];
						// $('#filterDiv').empty();

						if (chartType == 'stackedMultiChart'
								|| chartType == 'stackedMultiClustered'
								|| chartType == 'stackedLineMultiChart'
								|| chartType == 'stackedAreaMultiChart') {
							var arr = $scope.groupbymulti;
							arr.splice(0, 0, dimension)
							myList = myDashboardService.filterJsonByKeys(
									dataSetMain, arr);
						} else {

							if (dimension != '' && xAggrFunc == 'count'
									&& groupBy != '') {

								myList = myDashboardService.filterJsonByKeys(
										dataSetMain, [ dimension, groupBy ]);

							} else if (dimension != '' && xAggrFunc == 'count'
									&& group == '') {

								myList = myDashboardService.filterJsonByKeys(
										dataSetMain, [ dimension ]);
							} else if (dimension != '' && group != ''
									&& groupBy != '') {

								myList = myDashboardService.filterJsonByKeys(
										dataSetMain, [ dimension, group,
												groupBy ]);
							} else if (dimension != '' && group != '') {

								myList = myDashboardService.filterJsonByKeys(
										dataSetMain, [ dimension, group ]);

							} else if (groupBy != '') {

								myList = myDashboardService.filterJsonByKeys(
										dataSetMain, [ dimension, groupBy ]);

							}
						}

						$('#graphData_' + $scope.dataPreviousIndex + '_wrapper')
								.hide();
						$('#graphData_' + index + '_wrapper').show();
						if ($('#graphData_' + index).html() == ''
								|| $('#graphData_' + index).html() == undefined
								|| $sessionStorage.filterDatatable[index] == null) {
							// index
							var graphData = "<table id='graphData_"
									+ index
									+ "' class='grid table table-striped tablesorter backColorWhite graphData_filters'></table>";
							$('#filterDiv').append(graphData);

							$sessionStorage.filterDatatable[index] = myDashboardService
									.buildHtmlTable(myList, '#graphData_'
											+ index);
						}
					}

					$("#customDashboard").on('click',
							'.grid thead th .fa-filter', function(e) {
								showFilterOption(this);
							});

					var arrayMap = [];

					function showFilterOption(tdObject) {

						var dataSetTemp = $scope.widgetDataArray[$scope.dataIndex];

						var temp = $(tdObject).parent()[0].firstChild;

						var columnName = temp.textContent ? temp.textContent
								: temp.innerText;

						var filterGrid = $(tdObject).find(".filter");
						if (filterGrid.is(":visible")) {
							filterGrid.hide();
							return;
						}

						$(".filter").hide();

						var index = 0;
						filterGrid.empty();
						var allSelected = true;
						filterGrid
								.append('<div><input id="all" type="checkbox" checked>Select All</div>');

						var uniques = [];
						var filterObj = [];

						var filteredData = myDashboardService.filterJsonByKeys(
								dataSetTemp, [ columnName ]);

						if ($sessionStorage.filterByIndex[$scope.dataIndex] != $scope.dataIndex) {

							filterObj = [];

							for ( var key in filteredData) {

								var values = filteredData[key][columnName];
								var checked = '';

								if ($.inArray(values, uniques) === -1) {
									uniques.push(values);
									var uniquesFiltered = [];
									for ( var keys in $sessionStorage.filterByIndex[$scope.dataIndex]) {

										var val = $sessionStorage.filterByIndex[$scope.dataIndex][keys][columnName]

										if ($.inArray(val, uniquesFiltered) === -1) {
											uniquesFiltered.push(val);

											if (val == values) {

												checked = 'checked';
											}
										}
									}

									filterObj.push({
										"name" : values,
										"checkValue" : checked
									});

								}
							}

						} else {

							filterObj = [];
							for ( var key in filteredData) {

								var values = filteredData[key][columnName];
								if ($.inArray(values, uniques) === -1) {
									uniques.push(values);

									filterObj.push({
										"name" : values,
										"checkValue" : 'checked'
									});

								}
							}
						}
						for ( var key in filterObj) {

							var value = filterObj[key];

							var div = document.createElement("div");
							div.classList.add("grid-item");

							div.innerHTML = '<input type="checkbox" name="'
									+ columnName + '[]" value="' + value.name
									+ '" ' + value.checkValue + '>'
									+ value.name;
							filterGrid.append(div);

						}

						if (!allSelected) {
							filterGrid.find("#all").removeAttr("checked");
						}
						filterGrid
								.append('<div><button type="button" class="btn btn-primary mRightMini" id="ok">OK</button><button type="button" class="btn btn-primary" id="close">Close</button></div>');

						filterGrid.show();

						var $closeBtn = filterGrid.find("#close");
						var $okBtn = filterGrid.find("#ok");
						var $checkElems = filterGrid
								.find("input[type='checkbox']");
						// var $gridItems = filterGrid.find(".grid-item");
						// var $all = filterGrid.find("#all");

						var $gridItems = filterGrid.find(".grid-item");
						var $gridItem = $('.grid-item');
						var $all = filterGrid.find("#all");

						$all.change(function() {
							var chked = $(this).is(":checked");
							filterGrid.find(".grid-item [type='checkbox']")
									.prop("checked", chked);
						});

						$gridItem
								.change(function() {
									var checkedLen = filterGrid
											.find(".grid-item [type='checkbox']:checked").length;
									if ($gridItems.length == checkedLen)
										$all.prop("checked", 'checked');
									else
										$all.prop("checked", '');
								});

						filterGrid.click(function(event) {
							event.stopPropagation();
						});

						$closeBtn.click(function() {
							filterGrid.hide();
							return false;
						});

						$okBtn
								.click(function() {

									var types = $(
											'input:checkbox[name="'
													+ columnName
													+ '[]"]:checked').map(
											function() {
												return this.value;
											}).get().join('|');

									$sessionStorage.filterDatatable[$scope.dataIndex]
											.columns($(tdObject).attr("index"))
											.search("^(" + types + ")$", true,
													false, false).draw();

									var rows = $sessionStorage.filterDatatable[$scope.dataIndex]
											.rows({
												"filter" : "applied"
											}).data();

									var heads = [];
									$(
											"#graphData_" + $scope.dataIndex
													+ " thead tr")
											.find("th")
											.each(
													function() {
														var temp = $(this)[0].firstChild;
														var heading = temp.textContent ? temp.textContent
																: temp.innerText;
														heads.push(heading);
													});

									var jsonData1 = [];
									rows
											.each(function(value, index) {
												cur = {};
												for (var i = 0, len = value.length; i < len; i++) {
													cur[heads[i]] = value[i];
												}
												jsonData1.push(cur);
												cur = {};
											});

									$sessionStorage.filterByIndex[$scope.dataIndex] = jsonData1;

									var chartId = '#standWidget';
									if ($scope.responseArray[$scope.dataIndex].widgetType == 'custom') {
										chartId = '#custWidget';
									}

									var chart = myDashboardService
											.buildGraphs(
													jsonData1,
													chartId + $scope.dataIndex,
													$scope.responseArray[$scope.dataIndex],
													$scope.dataIndex);
									charts[$scope.dataIndex] = chart;

									$scope.forAllChartsAllFunctions(index, '');

									return false;
								});

						$checkElems.click(function(event) {
							event.stopPropagation();
						});

						$gridItems.click(function(event) {
							var chk = $(this).find("input[type='checkbox']");
							$(chk).prop("checked", !$(chk).is(":checked"));
						});

						$all.change(function() {
							var chked = $(this).is(":checked");
							filterGrid.find(".grid-item [type='checkbox']")
									.prop("checked", chked);
						})

						filterGrid.click(function(event) {
							event.stopPropagation();
						});

						return filterGrid;
					}

					$('select[id="gColumn"]')
							.on(
									'change',
									function() {
										var gaugeGroup = $(
												"#gColumn option:selected")
												.val();
										var gAggrFunc = $(
												"input:radio[name='gAggrFunc']:checked")
												.val();
										$scope.gaugeAggrValue = $scope
												.showGaugeAggrValue(
														dataSetMain,
														gaugeGroup, gAggrFunc);
									});

					$('input:radio[name="gAggrFunc"]')
							.on(
									'click',
									function() {
										var gaugeGroup = $(
												"#gColumn option:selected")
												.val();
										var gAggrFunc = $(
												"input:radio[name='gAggrFunc']:checked")
												.val();
										$scope.gaugeAggrValue = $scope
												.showGaugeAggrValue(
														dataSetMain,
														gaugeGroup, gAggrFunc);
									});

					// Filter Code --Ends

					$scope.toGetColors = function(key) {
						$scope.xAxisLabel = $scope.xAxis;
						getColorArrayAndCountByhartType('onchange',
								$scope.dataSet, key, key);
					}

					$scope.onyaxischange = function() {
						// $scope.yAxisLabel="";
						$scope.yAxisLabel = $scope.yAxis;
					}

					function getColorArrayAndCountByhartType(name, data,
							xaxiskey, groupbykey) {

						if (name == "onchange") {
							$scope.colorsArray = [ "#49b7e4", "#b4d042",
									"#ef7f28", "#2f4455", "#acc2c0", "#fdd962",
									"#65c7c8", "#c2af2f", "#006a9c", "#9ca6b2" ];
							colorsarraydesign($scope.colorsArray, data,
									xaxiskey, groupbykey);
						} else {

							var widgetInfo = $scope.responseArray[$scope.dataIndex];
							$scope.widgetInfo = widgetInfo;
							$scope.colorsArray = commonService
									.getColorsArray(widgetInfo.chartInformation.colorsArray);
							colorsarraydesign($scope.colorsArray, data,
									xaxiskey, groupbykey);
						}

					}

					function colorsarraydesign(array, data, xaxiskey,
							groupbykey) {
						$scope.colorsArray = array;

						if ($scope.chartType == "gaugeChart") {
							var uniquedata = [ {
								key : "Gauge",
							} ];

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array;
						} else if ($scope.chartType == "scatterChart") {

							var uniquedata = [ {
								key : "Scatter",
							} ];

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array;
						} else if ($scope.chartType == "areaChart") {

							var uniquedata = [ {
								key : "Area",
							} ];

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array;
						} else if ($scope.chartType == "lineChart") {

							var uniquedata = [ {
								key : "Line",
							} ];

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array;
						} else if ($scope.chartType == "barChart"
								|| $scope.chartType == "pieChart") {

							var uniquedata = commonService.getColorsCount(data,
									xaxiskey);

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array.sort();

						} else if ($scope.chartType == 'stackedChart'
								|| $scope.chartType == 'stackedSingleClustered') {

							var uniquedata = commonService.getColorsCount(data,
									groupbykey);

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array.sort();

						} else if ($scope.chartType == 'stackedMultiChart'
								|| $scope.chartType == 'stackedMultiClustered'
								|| $scope.chartType == 'stackedLineMultiChart'
								|| $scope.chartType == 'stackedAreaMultiChart') {

							var array = [];
							for (var i = 0; i < groupIndex; i++) {
								array.push($(
										"#groupbymulti" + i
												+ " option:selected").val());
							}
							counter = array;

						} else if ($scope.chartType == "ganttChart") {

							var uniquedata = commonService.getColorsCount(data,
									$scope.taskColumn);

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array.sort();
						}
						commonService.getColorsDiv(counter, $scope.colorsArray);
					}

					$("#filter-toggle").click(function() {
						if ($(this).data('name') == 'show') {
							$("#drillDownDiv").css("width", "98%");
							$("#entireDrillDownData").hide();
							$("#resetAll").hide();
							$(this).data('name', 'hide')
						} else {
							$("#drillDownDiv").css("width", "75%");
							$("#entireDrillDownData").show();
							$("#resetAll").show();
							$(this).data('name', 'show')
						}
					});
					$("#myDoodahModel").on(
							'hide.bs.modal',
							function() {
								$timeout(function() {
									$(".colorpicker.dropdown-menu").addClass(
											'colorpicker-hidden').removeClass(
											'colorpicker-visible');
								}, 100);
							});

					/**
					 * Method for calculating value for a gauge chart.
					 */
					$scope.showGaugeAggrValue = function(dataSet, gaugeGroup,
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

						var netTotal = ndx.groupAll().reduceSum(function(d) {
							return d[gaugeGroup];
						});
						var allSum = netTotal.value();

						var allAvg = allSum / allCount;

						if (gAggrFunc == 'sum') {
							$scope.selectAggr = "Sum : " + allSum;
							return allSum;
						} else if (gAggrFunc == 'count') {

							$scope.selectAggr = "Count : " + allCount;

							return allCount;
						} else if (gAggrFunc == 'avg') {

							$scope.selectAggr = "Avg : " + allAvg;

							return allAvg;
						}

					},
					/**
					 * End
					 */

					// Multigroup
					$scope.add = function() {
						if ($scope.items.length < 6) {
							$scope.items.push($scope.items.length);
						}

						$scope.colorsArray = [ "#49b7e4", "#b4d042", "#ef7f28",
								"#2f4455", "#acc2c0", "#fdd962", "#65c7c8",
								"#c2af2f", "#006a9c", "#9ca6b2" ];
						$timeout(function() {
							colorsarraydesign($scope.colorsArray, '', '', '');
						}, 100);
						groupIndex++;
					}

					$scope.del = function(i) {
						if (groupIndex !== 2) {
							groupIndex--;
							$scope.items.splice(i, 1);
							$scope.colorsArray = [ "#49b7e4", "#b4d042",
									"#ef7f28", "#2f4455", "#acc2c0", "#fdd962",
									"#65c7c8", "#c2af2f", "#006a9c", "#9ca6b2" ];

							colorsarraydesign($scope.colorsArray, '', '', '');
						}
					}
					$timeout(
							function() {
								$('.datatypesCheck1').bootstrapToggle('off');
								$('.datatypesCheck1')
										.on(
												'change',
												function() {
													console
															.log("datatypesCheck1 change funcion");
													var index = $(this).attr(
															'id');
													var isChecked = $(this)
															.prop('checked');

													$('#standWidget' + index)
															.html('');
													$('#standWidget' + index)
															.hide();
													$('#errMessage_' + index)
															.empty();
													$('#errDiv' + index).hide();
													$('#loader' + index).show();
													var widgetData = "";

													if (isChecked == false) {
														widgetData = widgetService
																.getWidgetDataByType(
																		$scope.responseArray[index].datacenterWidgetId,
																		'Offline');
													} else {
														widgetData = widgetService
																.getWidgetDataByType(
																		$scope.responseArray[index].datacenterWidgetId,
																		'Online');
													}

													$("#edit_" + index)
															.removeClass(
																	"disabled");
													$("#add_" + index)
															.removeClass(
																	"disabled");
													$("#filter_" + index)
															.removeClass(
																	"disabled");
													getStandardChartInfo(
															widgetData, index);

													$sessionStorage.filterByIndex[index] = index;
													$sessionStorage.filterDatatable[index] = null;
													if ($.fn.dataTable
															.isDataTable('#graphData_'
																	+ index)) {
														$('#graphData_' + index)
																.dataTable()
																.fnDestroy();
													}

												});
							}, 500);

				});