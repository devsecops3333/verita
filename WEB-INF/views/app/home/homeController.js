mainApp
		.controller(
				'HomeController',
				function($http, $scope, $sessionStorage, $rootScope,
						indexService, customwidgetService, $compile,
						widgetService, $timeout, homeService, commonService,
						myDashboardService, $state, $stateParams) {

					var sprintProgressTableObj;
					var dashboardId = null;

					var MESSAGE_CONSTANT = API_URI.MESSAGES;
					if ($stateParams.dashboardName == 99999) {
						dashboardId = $sessionStorage.currentMenuId;
					} else {
						dashboardId = $stateParams.dashboardName;
					}

					$scope.valueOrPercentage = {
						check : "Value"
					};
					$scope.xdatatype = "String";
					$scope.maxValue = {
						value : 100
					};
					$scope.items = [];
					$scope.newitem = '';
					var groupIndex = 0;

					$(".maxpanel").remove();
					$("body").css('overflow', 'auto');

					$scope.userData = $sessionStorage.userData;
					$scope.successmessage = '';
					var charts = [];
					$scope.userID = $sessionStorage.userId;
					// $scope.widgetIdList = [ 30, 10, 21, 22, 23, 29, 35, 36,
					// 37,
					// 38 ];
					$scope.widgetIdList = [];
					$scope.allWidgetInfo = [];
					$scope.showChart = false;
					$scope.dataSet = [];
					$scope.colorVar = '#49b7e4';
					$("#color1").val($scope.colorVar);
					$scope.colorsArray = [];
					$scope.widgetDataArray = [];
					$scope.widgetdrillDownArray = [];
					$scope.dataIndex = null;
					$rootScope.dwid = '';
					$scope.xAxis = "";
					$scope.yAxis = "";
					$scope.groupBy = "";
					$scope.dateformat = false;
					$scope.dateandtimeformat = false;
					$scope.newWidgetName = '';
					var counter = 0;
					var chart;
					$scope.overRideBtn = false;
					$scope.showValueTemplate = false;
					$sessionStorage.filterByIndex = [];
					$sessionStorage.filterDatatable = [];

					var arrayMap = [];
					var filterflag = false;
					var drillDownSet = null;

					chartTypeOnload();

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

					function chartTypeOnload() {

						var chartType = $scope.chartType;
						if (chartType === 'stackedMultiChart'
								|| chartType === 'stackedMultiClustered'
								|| chartType === 'stackedLineMultiChart'
								|| chartType === 'stackedAreaMultiChart') {

							$scope.xaggregationfromAll = true;
							$scope.yaxishideorshow = false;
							$scope.aggregNone = false;
							$scope.aggregation = 'count'
						} else if (chartType === 'gaugeChart') {
							$scope.aggregNone = false;
							$scope.xaggregationfromAll = false;
							$scope.yaxishideorshow = false;
						} else {
							$scope.aggregNone = true;
							$scope.xaggregationfromAll = true;
							$scope.yaxishideorshow = true;
						}

					}
					if ($sessionStorage.UserWidgetsInfo.length > 0) {
						$sessionStorage.UserWidgetsInfo.sort(function(a, b) {
							return parseFloat(a.widget_order_number)
									- parseFloat(b.widget_order_number);
						});
					}

					$scope.generateWidgets = function() {
						// $scope.allWidgetInfo
						for (i = 0; i < $scope.allWidgetInfo.length; i++) {
							if ($scope.allWidgetInfo[i].customWidgetId != undefined) {
								if ($scope.allWidgetInfo[i].widgetType === 'custom') {
									if ($scope.allWidgetInfo[i].custFilePath === '') {
										if ($scope.allWidgetInfo[i].menuid == dashboardId) {
											getCustomEmptyWidget(i);
											var widgetData = customwidgetService
													.getChartData($scope.allWidgetInfo[i].sourceUrl);
											getChartInfoFromURL(widgetData, i);
											$sessionStorage.filterByIndex[i] = i;
											$sessionStorage.filterDatatable[i] = i;
										}
									} else {
										if ($scope.allWidgetInfo[i].menuid == dashboardId) {
											getCustomEmptyWidget(i);
											var widgetData1 = customwidgetService
													.getChartDataFromCSV(
															"views/customFiles/"
																	+ $scope.allWidgetInfo[i].custFilePath,
															$scope.allWidgetInfo[i].custFileRealPath,
															$scope.allWidgetInfo[i].sheetName);

											getChartInfoFromURL(widgetData1, i);

											$sessionStorage.filterByIndex[i] = i;
											$sessionStorage.filterDatatable[i] = i;
										}
									}
								}
							} else {
								if ($scope.widgetIdList
										.indexOf($scope.allWidgetInfo[i].id) != -1) {
									if ($scope.allWidgetInfo[i].menuid == dashboardId) {

										getWidgetTemplate(
												$scope.allWidgetInfo[i].template,
												$scope.allWidgetInfo[i].type, i);
										$rootScope['widget_Data_'
												+ $scope.allWidgetInfo[i].template] = $scope.allWidgetInfo[i];
										$sessionStorage.filterByIndex[i] = i;
										$sessionStorage.filterDatatable[i] = i;
									}
								} else {
									if ($scope.allWidgetInfo[i].menuid == dashboardId) {
										getEmptyWidget(i);
										var widgetData = widgetService
												.getWidgetDataByType(
														$scope.allWidgetInfo[i].datacenter_widget_id,
														$sessionStorage.dataSourceTypeFromDB);
										getStandardChartInfo(widgetData, i);
										$sessionStorage.filterByIndex[i] = i;
										$sessionStorage.filterDatatable[i] = i;
									}
								}
							}
						}
						$('.datatypesCheck').bootstrapToggle('off');

						$('.datatypesCheck')
								.on(
										'change',
										function() {
											var index = $(this).attr('id');
											var isChecked = $(this).prop(
													'checked');

											$('#standWidget' + index).html('');
											$('#standWidget' + index).hide();
											$('#errMessage_' + index).empty();
											$('#errDiv' + index).hide();
											$('#loader' + index).show();
											var widgetData = "";

											if (isChecked == false) {
												widgetData = widgetService
														.getWidgetDataByType(
																$sessionStorage.UserWidgetsInfo[index].datacenter_widget_id,
																'Offline');
											} else {
												widgetData = widgetService
														.getWidgetDataByType(
																$sessionStorage.UserWidgetsInfo[index].datacenter_widget_id,
																'Online');
											}
											$("#edit_" + index).removeClass(
													"disabled");
											$("#add_" + index).removeClass(
													"disabled");
											$("#filter_" + index).removeClass(
													"disabled");
											getStandardChartInfo(widgetData,
													index);

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

					}

					if ($scope.userData === 'Yes') {
						var widgetResponse = customwidgetService
								.getCustomWidgets($sessionStorage.userId,
										$sessionStorage.projectId);

						widgetResponse
								.then(function(response) {
									$sessionStorage.MyDashboardWidgetInfo = response.data;
									$scope.allWidgetInfo = $sessionStorage.UserWidgetsInfo
											.concat($sessionStorage.MyDashboardWidgetInfo);

									console.log(" $scope.allWidgetInfo : ",
											$scope.allWidgetInfo);

									$scope.generateWidgets();
								});
					}

					/*
					 * $scope.$watch(function() { return $scope.allWidgetInfo; },
					 * function(newValue, oldValue) { if (newValue !== oldValue) {
					 * $scope.generateWidgets(); } });
					 */

					$scope.closeBtn = function() {
						$(".filter").empty();
						$(".filter").css("display", "none");
					}
					function getWidgetTemplate(name, type, index) {
						$rootScope.dwid = $sessionStorage.UserWidgetsInfo[i].datacenter_widget_id
								+ "_" + index;

						if (type != null && type != undefined) {
							var classname = 'col-md-' + type
									+ ' col-xs-12 sample_' + index
									+ ' widgetDiv';
						} else {
							var classname = 'col-md-12 col-xs-12 sample_'
									+ index + 'widgetDiv ';
						}

						jQuery("#homeContainer")
								.append(
										$compile(
												"<div class='"
														+ classname
														+ "' id='"
														+ $sessionStorage.UserWidgetsInfo[i].datacenter_widget_id
														+ "'><div ng-include src=\"'views/app/widgetTemplates/"
														+ name
														+ ".html'\" ng-init='burndowntitle = \""
														+ $sessionStorage.UserWidgetsInfo[i].name
														+ "\"; widgetIndexTemp=\""
														+ index
														+ "\"; widgetNameTemp=\""
														+ $sessionStorage.UserWidgetsInfo[i].name
														+ "\"; customWidgetId = \""
														+ $sessionStorage.UserWidgetsInfo[i].datacenter_widget_id
														+ "\";' ng-if=\"'true'\"></div></div>")
												($scope));

					}

					function getEmptyWidget(index) {

						$sessionStorage["screen" + index + "Size"] = 'smallScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:315px;" id="standWidget'
								+ index + '"></div>';

						if ($sessionStorage.UserWidgetsInfo[index].chartInformation != null
								|| $sessionStorage.UserWidgetsInfo[index].chartInformation != undefined) {

							if ($sessionStorage.UserWidgetsInfo[index].chartInformation.chart_type == 'gaugeChart') {

								if ($sessionStorage.UserWidgetsInfo[index].chartInformation.gaugeType == 'powerGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><div id="standWidget'
											+ index + '"></div>';
								} else if ($sessionStorage.UserWidgetsInfo[index].chartInformation.gaugeType == 'liquidGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="standWidget'
											+ index
											+ '" width="400" height="300"></svg>';
								}
							}
						}

						var sprintDiv = '<div></div';

						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning" id="errMessage_'
								+ index + '"></span></h4></div>';

						jQuery("#homeContainer")
								.append(
										$compile(
												homeService
														.buildEmptyWidgetDOM(
																$sessionStorage.UserWidgetsInfo[index],
																index,
																noDataDiv,
																chartDiv,
																sprintDiv))(
												$scope));
						$('.custPanel' + index).lobiPanel({
							// Options go here
							sortable : false,
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

					$(function() {
						$('[data-toggle="tooltip"]').tooltip()
					})

					function getStandardChartInfo(widgetData, index) {
						widgetData
								.then(
										function(responseInn) {
											var respData = responseInn.data;
											var status = responseInn.status;
											var errortext = respData.errormsg;
											var memCahceNoObjError = respData.error;
											if (errortext != "CONNECTION_TIMED_OUT") {
												if (respData == ""
														|| respData == undefined) {

													$scope
															.toShowErrorMessage(
																	index,
																	MESSAGE_CONSTANT.NO_DATA_FOUND);

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
																	MESSAGE_CONSTANT.NO_DATA_FOUND_RELOAD);

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
																		var widgetData = homeService
																				.callRefresh(
																						$sessionStorage.UserWidgetsInfo[index],
																						index);

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

													var dataSet = respData.chartData;
													drillDownSet = respData.drillDownData;
													$scope.widgetdrillDownArray[index] = drillDownSet;
													$scope.widgetDataArray[index] = dataSet;
													$("#edit_" + index)
															.removeClass(
																	"disabled");
													$(
															".custPanel"
																	+ index
																	+ ' li a[data-title="Fullscreen"]')
															.attr("data-func",
																	"expand");

													$("#sprintValue" + index)
															.text(
																	respData.sprintData);

													if ($sessionStorage.UserWidgetsInfo[index].chartInformation.chart_type === 'gaugeChart') {
														$(
																'#standWidget'
																		+ index)
																.show();
														$("#filter_" + index)
																.addClass(
																		"disabled");

														$('#errDiv' + index)
																.hide();
														$('#loader' + index)
																.hide();

														var elmnt = document
																.getElementById('panelId'
																		+ index);
														var width = elmnt.offsetWidth;
														var height = elmnt.offsetHeight;

														var size = width / 2 + 100;

														homeService
																.callGaugeGraph(
																		dataSet,
																		'standWidget'
																				+ index,
																		$sessionStorage.UserWidgetsInfo[index].chartInformation,
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
																			var widgetData = homeService
																					.callRefresh(
																							$sessionStorage.UserWidgetsInfo[index],
																							index);

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
																										dataSet)

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
																										'standWidget'
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

														var widgetTypeFromDB = $sessionStorage.UserWidgetsInfo[index].chartInformation.widgetType;
														if (widgetTypeFromDB != null
																&& widgetTypeFromDB != undefined) {
															if (widgetTypeFromDB == "Table") {
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
																		.html(
																				'');
																$(
																		"#edit_"
																				+ index)
																		.addClass(
																				"disabled");
																$(
																		"#filter_"
																				+ index)
																		.addClass(
																				"disabled");
																if ($scope.widgetDataArray[index] != null
																		&& $scope.widgetDataArray[index] != undefined) {
																	commonService
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

															} else if (widgetTypeFromDB == "ValueTemplate") {
																var widgetName = $sessionStorage.UserWidgetsInfo[index].name;

																$(
																		"#filter_"
																				+ index)
																		.addClass(
																				"disabled");

																$scope.widgetDataArray[index] = dataSet;
																$(
																		'#standWidget'
																				+ index)
																		.empty();

																if ($scope.widgetDataArray[index] != null
																		&& $scope.widgetDataArray[index] != undefined) {

																	commonService
																			.setDataForValueTemplates(
																					index,
																					$scope.widgetDataArray[index],
																					widgetName,
																					$sessionStorage.UserWidgetsInfo[index].valueTempInformation,
																					'#standWidget'
																							+ index)
																} else {
																	$scope
																			.toShowErrorMessage(
																					index,
																					MESSAGE_CONSTANT.NO_DATA_FOUND);
																}
															} else {

																var chartType = $sessionStorage.UserWidgetsInfo[index].chartInformation.chart_type;
																if (chartType === '') {
																	$scope
																			.toShowErrorMessage(
																					index,
																					MESSAGE_CONSTANT.NO_GRAPH_PROPERTIES);
																	$(
																			"#edit_"
																					+ index)
																			.removeClass(
																					"disabled");
																} else {
																	var chart = homeService
																			.callBuildGraph(
																					dataSet,
																					index,
																					$sessionStorage.UserWidgetsInfo[index].chartInformation,
																					'#standWidget');

																	charts[index] = chart;
																	chart.screenSize = $sessionStorage["screen"
																			+ index
																			+ "Size"];
																}

															}

														} else {
															var chartType = $sessionStorage.UserWidgetsInfo[index].chartInformation.chart_type;
															if (chartType === '') {
																$scope
																		.toShowErrorMessage(
																				index,
																				MESSAGE_CONSTANT.NO_GRAPH_PROPERTIES);
																$(
																		"#edit_"
																				+ index)
																		.removeClass(
																				"disabled");
															} else {

																var chart = homeService
																		.callBuildGraph(
																				dataSet,
																				index,
																				$sessionStorage.UserWidgetsInfo[index].chartInformation,
																				'#standWidget');

																charts[index] = chart;
																chart.screenSize = $sessionStorage["screen"
																		+ index
																		+ "Size"];
															}
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
																										'fullScreen')

																						if ($sessionStorage.UserWidgetsInfo[index].chartInformation.xAxisDataType == 'Date') {
																							charts[index]
																									.width(
																											width)
																									.height(
																											height - 90);
																							homeService
																									.showSliderChart(
																											index,
																											dataSet,
																											charts);
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
										function(error) {
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
						if ($sessionStorage.UserWidgetsInfo[index].chartInformation.gaugeType === 'powerGauge') {

							$("#" + id).css('width', width);
							$("#" + id).css('height', height);

							var powerGauge = homeService
									.callGaugeGraph(
											dataSet,
											id,
											$sessionStorage.UserWidgetsInfo[index].chartInformation,
											size);

						} else {

							$("#" + id).css('width', width - 100);
							$("#" + id).css('height', height - 100);
							gauge1 = homeService
									.callGaugeGraph(
											dataSet,
											id,
											$sessionStorage.UserWidgetsInfo[index].chartInformation,
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
						if ($sessionStorage.UserWidgetsInfo[index].chartInformation.gaugeType === 'powerGauge') {
							$('#' + id).css('width', width);
							$('#' + id).css('height', height);

							var powerGauge = homeService
									.callGaugeGraph(
											dataSet,
											id,
											$sessionStorage.UserWidgetsInfo[index].chartInformation,
											size);

						} else {
							$('#' + id).css('width', width - 100);
							$('#' + id).css('height', height - 15);
							gauge1 = homeService
									.callGaugeGraph(
											dataSet,
											id,
											$sessionStorage.UserWidgetsInfo[index].chartInformation,
											size);

						}
						$('#loader' + index).hide();

					}

					$scope.forAllChartsAllFunctions = function(index, stage) {

						if ($scope.allWidgetInfo[index].customWidgetId != undefined) {
							var widgetTypeFromDB = $scope.allWidgetInfo[index].customWidgetType;
						} else {
							var widgetTypeFromDB = $sessionStorage.UserWidgetsInfo[index].chartInformation.widgetType;
						}

						if (stage === 'refresh') {

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

							var widgetData = widgetService
									.getWidgetDataByType(
											$sessionStorage.UserWidgetsInfo[index].datacenter_widget_id,
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
											if ($sessionStorage.UserWidgetsInfo[index].chartInformation.legendPos === 'Top Left') {

												legendX = 40;
												legendY = 25;
											} else if ($sessionStorage.UserWidgetsInfo[index].chartInformation.legendPos === 'Bottom Left') {
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
											/* charts[index].redraw(); */
											charts[index].render();
										}

									}, 100);
						}
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

					window.onresize = function(i) {

						if (charts.length != 0) {
							for (var i = 0; i < charts.length; i++) {
								var elmnt = document.getElementById("panelId"
										+ i);
								var width = 400;
								var height = 300;
								if (elmnt) {
									width = elmnt.offsetWidth;
									height = elmnt.offsetHeight;
								}

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

					$scope.add2MyDashboard = function(index, widgetId) {

						$scope.msg = "";
						$scope.button = "";
						$scope.overRideBtn = false;
						var widgetInfo = $sessionStorage.UserWidgetsInfo[index];
						console.log("widgetInfo ", widgetInfo);
						if (typeof index == 'object') {
							widgetInfo = index;
						}
						console.log("widgetInfo ", widgetInfo);
						if (widgetInfo.widgetType === 'standard') {

							var deleteWidgetResp = customwidgetService
									.deleteCustomWidget(widgetId);
							deleteWidgetResp.then(function(response) {
								if (response.data === 1) {
									$('.standPanel' + widgetId).remove();
									$('#addDeleteWidgetModal').modal('show');
								} else {

								}
							}, function(errorResponse) {

							});
						} else {

							$scope.CustDataObj = {

								customWidgetId : 0,
								projectId : $sessionStorage.projectId,
								userId : $sessionStorage.userId,
								sourceUrl : '',
								chartType : widgetInfo.chartInformation.chart_type,
								type : widgetInfo.type,
								xAxis : widgetInfo.chartInformation.x_axis,
								xAxisTitle : widgetInfo.chartInformation.x_axis_title,
								yAxis : widgetInfo.chartInformation.y_axis,
								yAxisTitle : widgetInfo.chartInformation.y_axis_title,
								aggrFunc : widgetInfo.chartInformation.aggr_func,
								aggrFuncY : widgetInfo.chartInformation.aggr_func_y,
								widgetName : widgetInfo.name,
								groupBy : widgetInfo.chartInformation.groupBy,
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
								colorsArray : commonService
										.getColorsArray(widgetInfo.chartInformation.colorsArray),
								showLabels : widgetInfo.chartInformation.showLabels,
								legendPosition : widgetInfo.chartInformation.legendPos,
								valueOrPercentage : widgetInfo.chartInformation.valueOrPercentage,
								xAxisticklength : widgetInfo.chartInformation.xAxisticklength,
								groupArray : commonService
										.getColorsArray(widgetInfo.chartInformation.groupArray),
								trendLineOptions : commonService
										.getColorsArray(widgetInfo.chartInformation.trendLineOptions),
								customWidgetType : widgetInfo.chartInformation.widgetType

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

					// Over Write Widget
					$rootScope.overWriteWidget = function() {
						$scope.button = "";
						$scope.CustDataObj.customWidgetId = $scope.customWidgetId;
						var widgetResponse = customwidgetService
								.postCustomWidgetDetails($scope.CustDataObj);
						widgetResponse.then(function(response) {
							if (response.data === 'success') {
								$('#existWidgetModal').modal('hide');
								$timeout(function() {
									$('#addDeleteWidgetModal').modal('show');
								}, 500);
							} else {
								$('#existWidgetModal').modal('show');
							}
						});
					}
					$rootScope.createNewWidget = function() {
						$scope.msg = "";
						$scope.button = "new";
						$scope.newWidgetName = "";
						$scope.overRideBtn = true;
					}

					$scope.saveNewWidget = function() {

						if ($scope.newWidgetName == '') {
							$scope.msg = "errormsg";
						} else {
							$scope.CustDataObj.widgetName = $scope.newWidgetName;
							var widgetResponse = customwidgetService
									.postCustomWidgetDetails($scope.CustDataObj);
							widgetResponse.then(function(response) {

								if (response.data === 'success') {
									$('#existWidgetModal').modal('hide');
									$timeout(function() {
										$('#addDeleteWidgetModal')
												.modal('show');
									}, 500);
								} else {
									$scope.msg = "exists";
								}
							});
						}
					}

					$scope.closepopup = function() {
						$('#addDeleteWidgetModal').modal('hide');
					}

					// Edit Widget Function
					$scope.editWidget = function(index) {

						if ($scope.allWidgetInfo[index] == []
								|| $scope.widgetDataArray[index] == "") {
							$('#myDoodahModel').modal('hide');
						} else {
							var widgetTypeFromDB = "Graph";
							if ($scope.allWidgetInfo[index].customWidgetId != undefined) {
								widgetTypeFromDB = $scope.allWidgetInfo[index].customWidgetType;
							} else {
								widgetTypeFromDB = $scope.allWidgetInfo[index].chartInformation.widgetType;
							}
							console.log("widgetTypeFromDB ", widgetTypeFromDB);
							if (widgetTypeFromDB == "Graph") {
								$scope.editFunctionalityForGraphs(index);
							} else if (widgetTypeFromDB == "Table") {
								// need to write Edit functionality
							} else if (widgetTypeFromDB == "ValueTemplate") {
								$scope
										.editFunctionalityForValueTemplates(index);
							}
						}

					}
					// Edit functionality for Value Templates
					$scope.editFunctionalityForValueTemplates = function(index) {

						$scope.dataIndex = index;
						$scope.widgetInfo = $scope.allWidgetInfo[index];
						var datacenter_widget_id = $scope.allWidgetInfo[index].datacenter_widget_id;
						$('#valueTemplateModel').modal('show');
						$scope.widgetTitle = $scope.allWidgetInfo[index].name;
						var valueTempInformation = $scope.allWidgetInfo[index].valueTempInformation;
						$('#titleColor').val('');
						$('#titleColor').val(valueTempInformation.titleColor);
						$('#cPickerLineForTemplateTitle').colorpicker(
								'setValue', valueTempInformation.titleColor);

						$scope.titleFontSize = valueTempInformation.titleSize;

						$('#valueColor').val('');
						$('#valueColor').val(valueTempInformation.valueColor);
						$('#cPickerLineForTemplateValue').colorpicker(
								'setValue', valueTempInformation.valueColor);

						$('#templateBGColor').val('');
						$('#templateBGColor').val(
								valueTempInformation.backgroundColor);
						$('#cPickerLineForTemplateBGColor').colorpicker(
								'setValue',
								valueTempInformation.backgroundColor);

						$scope.callColorClass("valuetemplate");
						$scope.valueFontSize = valueTempInformation.valueSize;

						$scope.imageType = valueTempInformation.imageType;
						console.log("$scope.imageType ", $scope.imageType);

						var data = $scope.widgetDataArray[index];

						console.log("$scope.data ", data);

						var valueTemplateItems = [];
						if (data != null && data != undefined) {
							for (var i = 0; i < data.length; i++) {
								var dataObj = data[i];
								var Status = dataObj['Status'];
								if (Status == null || Status == undefined) {
									var key = Object.keys(dataObj)[0];
									Status = dataObj[key];
								}
								valueTemplateItems.push(Status);
							}
							$scope.image = '';
							$scope.valueTemplateItems = valueTemplateItems;
						}

						$timeout(function() {
							$scope.setDataForTemplateIcons(
									valueTempInformation, $scope.imageType);
							// need to set all the fields by default
							// then will call draw template method
							$scope.drawValueTemplate();
						}, 1000);

					}
					$scope.setDataForTemplateIcons = function(
							valueTempInformation, imageType) {
						var valueTemplateItems = $scope.valueTemplateItems;
						var iconsArray = valueTempInformation.iconsArray;
						$scope.filePath = "";
						if (valueTemplateItems.length > 0) {
							// Set icons
							for (var i = 0; i < valueTemplateItems.length; i++) {

								if (iconsArray != null
										&& iconsArray != undefined
										&& iconsArray != '') {
									var arrayObj = iconsArray;
									if (typeof iconsArray == "string") {
										arrayObj = iconsArray.split(",");
									}
									// Set default values for font awesome icons
									$('#fontAwesomeIcon' + i).val(
											'fa fa-circle-o');
									$('#fontAwesomeValueColor' + i).val(
											'#4287f0');
									$('#colorVal' + i).colorpicker('setValue',
											'#4287f0');

									if (imageType == "image_upload") {
										var valueTemplatePhotoPath = "valueTemplatePhotoPath"
												+ i;
										$('#valueTemplatePhoto' + i).val('');
										$scope.valueTemplatePhotoPath = "";
										var iconsDataArray = valueTempInformation.iconsDataArray;
										if (typeof iconsDataArray == "string") {
											iconsDataArray = JSON
													.parse(iconsDataArray);
										}

										if (arrayObj[i] == "defaultImage") {
											$scope.valueTemplatePhotoPath = valueTempInformation.defaultImage;
											$('#valueTemplatePhoto' + i)
													.attr(
															'src',
															valueTempInformation.defaultImage);
										} else {
											var imageData = iconsDataArray[i];
											$scope.valueTemplatePhotoPath = imageData;
											$('#valueTemplatePhoto' + i).attr(
													'src', imageData);
										}

									} else {

										if (arrayObj[i].includes(":")) {
											var iconAndColorArray = arrayObj[i]
													.split(":");

											$('#fontAwesomeIcon' + i).val(
													iconAndColorArray[0]);
											if (iconAndColorArray[1] != '') {
												$('#fontAwesomeValueColor' + i)
														.val(
																iconAndColorArray[1]);
												$('#colorVal' + i).colorpicker(
														'setValue',
														iconAndColorArray[1]);
											}

										} else {
											if (arrayObj[i] != '') {
												$('#fontAwesomeIcon' + i).val(
														arrayObj[i]);
											} else {
												$('#fontAwesomeIcon' + i)
														.val(
																valueTempInformation.defaultImage);
											}

										}
									}

								} else {
									if (imageType == "image_upload") {
										$scope.valueTemplatePhotoPath = valueTempInformation.defaultImage;
										$('#valueTemplatePhoto' + i)
												.attr(
														'src',
														valueTempInformation.defaultImage);
									} else {
										$('#fontAwesomeIcon' + i).val('');
										$('#fontAwesomeValueColor' + i).val('');
										$('#colorVal' + i).colorpicker(
												'setValue', '#4287f0');
										$('#fontAwesomeIcon' + i)
												.val(
														valueTempInformation.defaultImage);
									}
								}
								$scope.callColorClass("valuetemplate");
							}
						}
					}
					$('input:radio[name="imageType"]')
							.on(
									'click',
									function(e) {
										var imageType = $(
												"input:radio[name='imageType']:checked")
												.val();
										$timeout(function() {
											$scope.drawValueTemplate();
										}, 100);
									});

					// to edit image
					$scope.changeForValueTemplateImage = function(input,
							indexNo) {
						if (input.files && input.files[0]) {
							var reader = new FileReader();
							reader.onload = function(e) {
								$scope.image = $(
										'#valueTemplatePhoto' + indexNo).attr(
										'src', e.target.result);
							}
							reader.readAsDataURL(input.files[0]);
							$timeout(function() {
								$scope.drawValueTemplate();
							}, 500);
						}
					}

					$scope.drawValueTemplate = function() {
						$scope.errortextForValueTemplate = false;
						var validate = $scope.validationsForValueTemplates();
						if (validate) {
							$scope.showValueTemplate = false;
							$scope.errortextForValueTemplate = true;
						} else {
							$scope.errortextForValueTemplate = false;

							$scope.showValueTemplate = true;

							var options = {
								templateId : $scope.dataIndex,
								widgetName : $scope.widgetTitle,
								titleColor : $('#titleColor').val(),
								titleSize : $scope.titleFontSize,
								valueColor : $('#valueColor').val(),
								valueSize : $scope.valueFontSize,
								imageType : $scope.imageType,
								backgroundColor : $('#templateBGColor').val()
							};
							var valueTemplateItems = $scope.valueTemplateItems;
							if (valueTemplateItems.length > 0) {
								// Set icons
								for (var i = 0; i < valueTemplateItems.length; i++) {
									if ($scope.imageType == "font_awesome") {
										options["image" + (i + 1)] = $(
												'#fontAwesomeIcon' + i).val();
										options["color" + (i + 1)] = $(
												'#fontAwesomeValueColor' + i)
												.val();
									} else {
										options["image" + (i + 1)] = $(
												'#valueTemplatePhoto' + i)
												.attr('src');
									}
								}
							}

							var valueTemp = commonService
									.callValueTemplateStructure(
											$scope.widgetDataArray[$scope.dataIndex],
											"", options);
							$('#valueTemplateId').empty();
							$('#valueTemplateId').append(valueTemp);

							commonService.buildValueTemplateStructure(
									$scope.widgetDataArray[$scope.dataIndex],
									"");

						}

					}
					// Validations for Value templates
					$scope.validationsForValueTemplates = function() {
						var flag = false;
						if ($scope.widgetTitle == ''
								|| $scope.widgetTitle == undefined) {
							$('#errortextForValueTemplate').html('');
							$('#errortextForValueTemplate').append(
									"Please Enter Widget Name");
							flag = true;
							return flag;
						}
						if ($scope.titleFontSize != null
								&& $scope.titleFontSize != undefined) {
							var titleFontSize = $scope.titleFontSize;
							if ((parseInt(titleFontSize) == titleFontSize)
									|| parseFloat(titleFontSize) == titleFontSize) {
							} else {
								$('#errortextForValueTemplate').html('');
								$('#errortextForValueTemplate')
										.append(
												"Please Enter number for Title Font Size");
								flag = true;
								return flag;
							}
						}
						if ($scope.valueFontSize != null
								&& $scope.valueFontSize != undefined) {
							var valueFontSize = $scope.valueFontSize;
							if ((parseInt(valueFontSize) == valueFontSize)
									|| parseFloat(valueFontSize) == valueFontSize) {
							} else {
								$('#errortextForValueTemplate').html('');
								$('#errortextForValueTemplate')
										.append(
												"Please Enter number for Value Font Size");
								flag = true;
								return flag;
							}
						}

						return flag;
					}

					// Save functionality For saving ValueTemplates data to
					// Database
					$scope.saveValueTemplateToDB = function() {

						var validate = $scope.validationsForValueTemplates();
						if (validate) {
							$scope.showValueTemplate = false;
							$scope.errortextForValueTemplate = true;
						} else {
							$scope.errortextForValueTemplate = false;

							var valueTemplateItems = $scope.valueTemplateItems;
							var iconsArray = [];
							for (var i = 0; i < valueTemplateItems.length; i++) {
								if ($scope.imageType == "font_awesome") {
									iconsArray.push($('#fontAwesomeIcon' + i)
											.val()
											+ ":"
											+ $('#fontAwesomeValueColor' + i)
													.val());
								} else {
									iconsArray
											.push($('#valueTemplatePhoto' + i)
													.attr('src'));
								}

							}
							var dataObj = {
								id : $scope.widgetInfo.datacenter_widget_id,
								datacenterId : $scope.widgetInfo.datacenter_id,
								projectWidgetMapId : $scope.widgetInfo.projectWidgetMap_id,
								widgetName : $scope.widgetTitle,
								titleColor : $('#titleColor').val(),
								titleSize : $scope.titleFontSize,
								valueColor : $('#valueColor').val(),
								valueSize : $scope.valueFontSize,
								iconsArray : iconsArray,
								iconsDataArray : iconsArray,
								defaultImage : $scope.defaultImage,
								imageType : $scope.imageType,
								backgroundColor : $('#templateBGColor').val(),
								userId : $sessionStorage.userId
							};

							dataObj = JSON.stringify(dataObj, function(key,
									value) {
								return (value === undefined) ? "" : value
							});
							dataObj = JSON.parse(dataObj);

							var resp = widgetService
									.postValueTemplateWidgetDetails(dataObj);
							resp
									.then(function(data) {
										$sessionStorage.UserWidgetsInfo[$scope.dataIndex].valueTempInformation = homeService
												.updateSessionObjectForValueTemplate(dataObj);
										$sessionStorage.UserWidgetsInfo[$scope.dataIndex].name = $scope.widgetTitle;
										$('#valueTemplateModel').modal('hide');
										$('#succWidgetModalForValueTemplate')
												.modal('show');

									});

						}

					}
					// Redraw Value template
					$scope.drawEditedValueTemplate = function() {
						$('#succWidgetModalForValueTemplate').modal('hide');
						$timeout(
								function() {
									var index = $scope.dataIndex;

									var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:315px;" id="standWidget'
											+ index + '"></div>';
									$('#standWidget' + index).replaceWith(
											chartDiv);

									$(".panelHeaderTextPadding_" + index)
											.html(
													$sessionStorage.UserWidgetsInfo[index].name);
									commonService
											.setDataForValueTemplates(
													index,
													$scope.widgetDataArray[index],
													$sessionStorage.UserWidgetsInfo[index].name,
													$sessionStorage.UserWidgetsInfo[index].valueTempInformation,
													'#standWidget' + index)

								}, 500);

					}
					// Edit functionality for Graphs
					$scope.editFunctionalityForGraphs = function(index) {
						$scope.groupbyThree = false;
						$scope.dateformat = false;
						$scope.dateandtimeformat = false;
						$scope.gaugeColumn = $scope.allWidgetInfo[index].chartInformation.gaugeColumn;
						$scope.gAggregationHome = $scope.allWidgetInfo[index].chartInformation.aggrFunG;
						$scope.maxValue.value = $scope.allWidgetInfo[index].chartInformation.gaugeMaxValue;
						$scope.gaugeTypeHome = $scope.allWidgetInfo[index].chartInformation.gaugeType;

						// $scope.gaugeTypeHome = "powerGauge";

						if ($scope.maxValue.value == '') {
							$scope.maxValue = {
								value : 100
							};
						}
						if ($scope.gaugeTypeHome == '') {
							$scope.gaugeTypeHome = 'powerGauge';
						}
						if ($scope.gAggregationHome == '') {
							$scope.gAggregationHome = 'sum';
						}
						$scope.colorsArray = [];
						$scope.dataIndex = index;
						$scope.showChart = false;
						$scope.widgetInfo = $scope.allWidgetInfo[index];
						if ($scope.allWidgetInfo[index].customWidgetId != undefined) {
							$scope.widgetTitle = $scope.allWidgetInfo[index].widgetName;
						} else {
							$scope.widgetTitle = $scope.allWidgetInfo[index].name;
						}

						$scope.chartType = $scope.allWidgetInfo[index].chartInformation.chart_type;
						$scope.xAxis = $scope.allWidgetInfo[index].chartInformation.x_axis;
						$scope.yAxis = $scope.allWidgetInfo[index].chartInformation.y_axis;
						$scope.xAxisLabel = $scope.allWidgetInfo[index].chartInformation.x_axis_title;
						$scope.yAxisLabel = $scope.allWidgetInfo[index].chartInformation.y_axis_title;
						$scope.chartSummary = $scope.allWidgetInfo[index].chartInformation.chartSummary;
						$scope.showLabels = $scope.allWidgetInfo[index].chartInformation.showLabels;
						$scope.rLable = $scope.allWidgetInfo[index].chartInformation.rotateLabel;
						$scope.yAggregation = $scope.allWidgetInfo[index].chartInformation.aggr_func_y;
						$scope.aggregation = $scope.allWidgetInfo[index].chartInformation.aggr_func;
						$scope.groupBy = $scope.allWidgetInfo[index].chartInformation.groupBy;

						$scope.mainObject = $scope.allWidgetInfo[index].chartInformation.mainObject;
						$scope.searchObject = $scope.allWidgetInfo[index].chartInformation.searchObject;
						$scope.widgetType = $scope.allWidgetInfo[index].chartInformation.widgetType;

						$scope.onlineCustomUrl = $scope.allWidgetInfo[index].chartInformation.onlineCustomUrl;
						$scope.onlineAuthenticationType = $scope.allWidgetInfo[index].chartInformation.onlineAuthenticationType;
						$scope.onlineRequestType = $scope.allWidgetInfo[index].chartInformation.onlineRequestType;
						$scope.offlineCustomUrl = $scope.allWidgetInfo[index].chartInformation.offlineCustomUrl;
						$scope.offlineAuthenticationType = $scope.allWidgetInfo[index].chartInformation.offlineAuthenticationType;

						if ($scope.allWidgetInfo[index].chartInformation.groupBy3 != "") {
							$scope.groupbyThree = true;
						} else {
							$scope.groupbyThree = false;
						}
						var trendLineAndColors = null;
						if ($scope.allWidgetInfo[index].chartInformation.chart_type == "barChart"
								|| $scope.allWidgetInfo[index].chartInformation.chart_type == "stackedChart") {
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

						$scope.groupbymulti = commonService
								.getColorsArray($scope.allWidgetInfo[index].chartInformation.groupArray);

						var item = [];
						var selectedGroups = [];
						groupIndex = 0;
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
																"checked");
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

						$scope.colorsArray = commonService
								.getColorsArray($scope.allWidgetInfo[index].chartInformation.colorsArray);
						$scope.legendPos = $scope.allWidgetInfo[index].chartInformation.legendPos;

						$scope.xdatatype = $scope.allWidgetInfo[index].chartInformation.xAxisDataType;
						$scope.dateformatselect = $scope.allWidgetInfo[index].chartInformation.xaxisDateFormat;
						if ($scope.dateformatselect == ''
								|| $scope.dateformatselect == null) {
							$scope.dateformat = false;
						} else {
							$scope.dateformat = true;
						}

						if ($scope.allWidgetInfo[index].chartInformation.xAxisticklength == ''
								|| $scope.allWidgetInfo[index].chartInformation.xAxisticklength == undefined
								|| $scope.allWidgetInfo[index].chartInformation.xAxisticklength == null) {
							$scope.xAxisticklength = '';
						} else {

							$scope.xAxisticklength = $scope.allWidgetInfo[index].chartInformation.xAxisticklength;
						}

						if ($scope.allWidgetInfo[index].chartInformation.valueOrPercentage == ''
								|| $scope.allWidgetInfo[index].chartInformation.valueOrPercentage == undefined
								|| $scope.allWidgetInfo[index].chartInformation.valueOrPercentage == null) {
							$scope.valueOrPercentage = {
								check : "Value"
							}
						} else {

							$scope.valueOrPercentage = {
								check : $scope.allWidgetInfo[index].chartInformation.valueOrPercentage
							};
						}

						counter = $scope.colorsArray.length;
						buildCharts($scope.widgetDataArray[index]);

						var uniques = [];
						var data = $scope.widgetDataArray[index];
						chartTypeOnload();
						data.forEach(function(obj, index) {
							var value = obj[$scope.xAxis];
							if ($.inArray(value, uniques) === -1) {
								uniques.push(value);
							}
						});

						var colorLabel = 'Choose ';
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

						if ($scope.widgetTitle == '') {
							$('#errortext').html('');
							$('#errortext').append("Please Enter Widget Name");
							flag = false;
						}

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
												return flag;
											} else if (typeof item == "string"
													&& $scope.yAggregation == "count") {
												flag = true;
												return flag;
											} else {
												$('#errortext').html('');
												$('#errortext')
														.append(
																"Please select another option as Y Axis accept only numericals");
												flag = false;
												return flag;
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
							if ($scope.aggregation == '' && $scope.yAxis == '') {
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
												return flag;
											} else if (typeof item == "string"
													&& $scope.yAggregation == "count") {
												flag = true;
												return flag;
											} else {
												$('#errortext').html('');
												$('#errortext')
														.append(
																"Please select another option as Y Axis accept only numericals");
												flag = false;
												return flag;
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

							$scope.gaugeAggrValue = homeService
									.showGaugeAggrValue($scope.dataSet,
											$scope.gaugeColumn,
											$scope.gAggregationHome);

							if (isNaN($scope.gaugeAggrValue)
									|| $scope.gaugeAggrValue == '') {

								$('#errortext').html('');
								$('#errortext')
										.append(
												"Cannot Plot Chart with selected Aggregation");
								flag = false;
							}

							if ($scope.gaugeTypeHome == '') {
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
							if ($scope.gAggregationHome == ''
									|| $scope.gAggregationHome == undefined) {
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
						}
						if ($scope.chartType == 'ganttChart') {
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
							$scope.errortext = false;
							$scope.colorsArray = [];
							$scope.groupbymulti = [];
							$scope.groupBymulticolorTrend = [];
							$scope.groupBymultiTrend = false;
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

							var chartId = '';
							if ($scope.gaugeTypeHome == "powerGauge") {
								chartId = 'power-gauge';
							} else {
								chartId = 'fillgauge';
							}

							if ($scope.gaugeTypeHome == 'powerGauge') {
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

							var options = {

								chartId : chartId,
								chartSummary : $scope.chartSummary,
								widgetName : $scope.widgetTitle,
								chartSummaryPositionX : 600,
								chartSummaryPositionY : 10,
								gaugeGroup : $scope.gaugeColumn,
								gAggrFunc : $scope.gAggregationHome,
								gaugeMaxValue : $scope.maxValue.value,
								ChartType : $scope.gaugeTypeHome,
								gaugeValue : $scope.gaugeAggrValue,
								colorsArray : $scope.colorsArray,
								margins : {
									top : 40,
									right : 10,
									bottom : 80,
									left : 50
								},

							};

							chart = widgetService.buildGraphGauge(
									$scope.dataSet, options);

							$('#gaChart').css({
								'opacity' : 1
							});

						} else {

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
							$('#saveBtn').attr('disabled', false);
							$('#gaChart').hide();
							$('#gaChart').css('opacity', '0');
							$('#sDChart').html('');
							$('#sDChart').show();

							var options = {

								chartType : $scope.chartType,
								chartId : '#sDChart',
								chartSummary : $scope.chartSummary,
								widgetName : $scope.widgetTitle,
								xAxis : $scope.xAxis,
								yAxis : $scope.yAxis,
								xAggrFunc : $scope.aggregation,
								yAggrFunc : $scope.yAggregation,
								groupBy : $scope.groupBy,
								xAxisLabel : $scope.xAxisLabel,
								yAxisLabel : $scope.yAxisLabel,
								groupArray : $scope.groupbymulti,
								colorsArray : commonService
										.getColorsArray($scope.colorsArray),
								valueOrPercentage : $scope.valueOrPercentage.check,
								xaxisticklength : $scope.xAxisticklength,
								xaxisDataType : $scope.xdatatype,
								dataFormat : $scope.dateformatselect,
								legendPos : $scope.legendPos,

								rotateLabel : $scope.rLable,
								showLabels : $scope.showLabels,
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

						if (validate == true) {
							if ($scope.widgetInfo.customWidgetId != undefined) {
								$scope.saveCustomWidgetToDB();
							} else {
								$scope.errortext = false;
								$scope.colorsArray = [];
								$scope.groupbymulti = [];
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
													"#groupbymulti"
															+ i
															+ " option:selected")
													.val() == '') {
												$scope.showChart = false;
												$scope.errortext = true;
												$('#errortext').html('');
												$('#errortext')
														.append(
																"Please Select Group by");
												modalshow = false;
											} else {
												$scope.groupbymulti
														.push($(
																"#groupbymulti"
																		+ i
																		+ " option:selected")
																.val());
											}
										}
									}
								}
								var trendLineoptions = []
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
									$scope.showChart = true;
									$scope.errortext = false;
									if ($scope.chartType == 'barChart'
											|| $scope.chartType == 'pieChart'
											|| $scope.chartType == 'lineChart'
											|| $scope.chartType == 'areaChart') {
										$scope.groupBy = '';
									}

									var dataObj = {
										id : $scope.widgetInfo.datacenter_widget_id,
										datacenterId : $scope.widgetInfo.datacenter_id,
										projectWidgetMapId : $scope.widgetInfo.projectWidgetMap_id,
										datacenterWidgetParam : $scope.widgetInfo.datacenter_widget_param,
										chartType : $scope.chartType,
										xAxis : $scope.xAxis,
										xAxisTitle : $scope.xAxisLabel,
										yAxis : $scope.yAxis,
										yAxisTitle : $scope.yAxisLabel,
										aggrFunc : $scope.aggregation,
										aggrFuncY : $scope.yAggregation,
										groupBy : $scope.groupBy,
										gaugeType : $scope.gaugeTypeHome,
										gaugeColumn : $scope.gaugeColumn,
										aggrFunG : $scope.gAggregationHome,
										gaugeMaxValue : $scope.maxValue.value,
										rotateLabel : $scope.rLable,
										chartSummary : $scope.chartSummary,
										widgetName : $scope.widgetTitle,
										colorsArray : $scope.colorsArray,
										showLabels : $scope.showLabels,
										legendPosition : $scope.legendPos,
										valueOrPercentage : $scope.valueOrPercentage.check,
										xAxisticklength : $scope.xAxisticklength,
										xDataType : $scope.xdatatype,
										xDateFormat : $scope.dateformatselect,
										groupArray : $scope.groupbymulti,
										trendLineOptions : trendLineoptions,
										mainObject : $scope.mainObject,
										searchObject : $scope.searchObject,
										widgetType : $scope.widgetType,
										onlineCustomUrl : $scope.onlineCustomUrl,
										onlineAuthenticationType : $scope.onlineAuthenticationType,
										onlineRequestType : $scope.onlineRequestType,
										offlineCustomUrl : $scope.offlineCustomUrl,
										offlineAuthenticationType : $scope.offlineAuthenticationType,
										userId : $sessionStorage.userId

									};

									dataObj = JSON.stringify(dataObj, function(
											key, value) {
										return (value === undefined) ? ""
												: value
									});
									dataObj = JSON.parse(dataObj);
									var resp = widgetService
											.postStandWidgetDetails(dataObj);
									resp
											.then(function(data) {
												$scope.allWidgetInfo[$scope.dataIndex].chartInformation = homeService
														.updateSessionObject(dataObj);
												$scope.allWidgetInfo[$scope.dataIndex].name = $scope.widgetTitle;
												$('#myDoodahModel').modal(
														'hide');
												$('#succWidgetModal').modal(
														'show');
												$(
														".panelHeaderTextPadding_"
																+ $scope.dataIndex)
														.text(
																$scope.widgetTitle);
											});
								}
							}

						} else {
							$scope.showChart = false;
							$scope.errortext = true;
						}
					}
					$scope.drawStandFinalChart = function() {

						$('#succWidgetModal').modal('hide');
						$timeout(
								function() {
									$('#errDiv' + $scope.dataIndex).hide();
									if ($scope.chartType == 'gaugeChart') {
										$("#filter_" + $scope.dataIndex)
												.addClass("disabled");
										var elmnt = document
												.getElementById('panelId'
														+ $scope.dataIndex);
										var width = elmnt.offsetWidth;
										var height = elmnt.offsetHeight;
										var screenSize = width / 2 + 100;

										$('#sDChart').hide();
										$('#gaChart').show();

										var chartId = 'standWidget'
												+ $scope.dataIndex;

										var options = {
											chartId : chartId,
											chartSummary : $scope.chartSummary,
											chartSummaryPositionX : 600,
											chartSummaryPositionY : 10,
											gaugeGroup : $scope.gaugeColumn,
											gAggrFunc : $scope.gAggregationHome,
											gaugeMaxValue : $scope.maxValue.value,
											ChartType : $scope.gaugeTypeHome,
											gaugeValue : '',
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
										if ($scope.gaugeTypeHome == 'powerGauge') {
											$('#standWidget' + $scope.dataIndex)
													.show();
											$('#standWidget' + $scope.dataIndex)
													.html('');

											var chartDiv = '<div class="row graphWell bTop" align="center"><div id="standWidget'
													+ $scope.dataIndex
													+ '"></div>';

											$('#standWidget' + $scope.dataIndex)
													.replaceWith(chartDiv);

											$('#standWidget' + $scope.dataIndex)
													.css('width', width);
											$('#standWidget' + $scope.dataIndex)
													.css('height', height);

											charts[$scope.dataIndex] = widgetService
													.buildGraphGauge(
															$scope.dataSet,
															options);

										} else {

											$('#standWidget' + $scope.dataIndex)
													.show();
											$('#standWidget' + $scope.dataIndex)
													.html('');

											var chartDivSvg = '<svg class="mTop" id="standWidget'
													+ $scope.dataIndex
													+ '" ></svg>';

											$('#standWidget' + $scope.dataIndex)
													.replaceWith(chartDivSvg);

											$('#standWidget' + $scope.dataIndex)
													.css('width', width);

											if (height >= 500) {
												$(
														'#standWidget'
																+ $scope.dataIndex)
														.css('height',
																height - 100);
											} else {
												$(
														'#standWidget'
																+ $scope.dataIndex)
														.css('height',
																height - 15);
											}

											charts[$scope.dataIndex] = widgetService
													.buildGraphGauge(
															$scope.dataSet,
															options);
											$('#gaChart').css({
												'opacity' : 1
											});
										}
									} else {
										var trendLineoptions = []
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

										var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:315px;" id="standWidget'
												+ $scope.dataIndex + '"></div>';
										$('#standWidget' + $scope.dataIndex)
												.replaceWith(chartDiv);

										$("#filter_" + $scope.dataIndex)
												.removeClass("disabled");
										var options = {

											chartType : $scope.chartType,
											chartId : '#standWidget'
													+ $scope.dataIndex,
											chartSummary : $scope.chartSummary,
											xAxis : $scope.xAxis,
											yAxis : $scope.yAxis,
											xAggrFunc : $scope.aggregation,
											yAggrFunc : $scope.yAggregation,

											groupBy : $scope.groupBy,
											xAxisLabel : $scope.xAxisLabel,
											yAxisLabel : $scope.yAxisLabel,

											groupArray : $scope.groupbymulti,
											colorsArray : commonService
													.getColorsArray($scope.colorsArray),
											valueOrPercentage : $scope.valueOrPercentage.check,
											xaxisticklength : $scope.xAxisticklength,

											rotateLabel : $scope.rLable,
											showLabels : $scope.showLabels,
											trendLineOptions : trendLineoptions,
											xaxisDataType : $scope.xdatatype,
											dataFormat : $scope.dateformatselect,
											legendPos : $scope.legendPos,
											brushOnFlag : false,
											noYAxis : false,
											sliderHeight : ''

										}

										var chart = widgetService.buildGraph(
												$scope.dataSet, options);
										charts[$scope.dataIndex] = chart;
										// chart.screenSize = 'smallScreen';
									}

									var index = $scope.dataIndex;

									if ($scope.chartType != 'gaugeChart') {

										$scope.forAllChartsAllFunctions(index,
												'');

									}

									$('.custPanel' + index + ' .icon-refresh-1')
											.unbind()
											.on(
													'click',
													function(ev, lobiPanel) {
														$(
																'#standWidget'
																		+ index)
																.html('');
														$('#errDiv' + index)
																.hide();
														$('#loader' + index)
																.show();
														var widgetData = homeService
																.callRefresh(
																		$sessionStorage.UserWidgetsInfo[index],
																		index);

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

									$(".panelHeaderTextPadding_" + index)
											.html(
													$sessionStorage.UserWidgetsInfo[index].name);

								}, 500);
					}

					// Drilldown Code

					$rootScope.drillDownData = function(index, key, value,
							layer) {

						console.log("====", index);
						if (!isNaN(index)) {
							console.log("if====", index)
							$('#drillDownDiv').empty();
							var myList = [];
							$scope.dataPreviousIndex = $scope.dataIndex;
							$scope.dataIndex = index;
							var dataSetMain = $scope.widgetDataArray[index];
							var filterDataSetMain = $scope.widgetdrillDownArray[index];

							var dimension = $sessionStorage.UserWidgetsInfo[index].chartInformation.x_axis;
							var groupby = $sessionStorage.UserWidgetsInfo[index].chartInformation.groupBy;

							$('#graphDrillData_' + $scope.dataPreviousIndex)
									.hide();
							$('#graphDrillData_' + index).show();
							// index
							var graphData = "<table id='graphDrillData_"
									+ index
									+ "' class='table table-striped tablesorter backColorWhite theadColor'></table>";
							$('#drillDownDiv').html(graphData);
							$scope.$digest();

							if (typeof key == 'string') {
								key = (key);
								dimension = getChangedData(dimension);

							} else if (typeof key == 'number') {
								key = key;
							}

							var columnIndex = buildDrillHtmlTable(
									'#graphDrillData_' + index, dataSetMain,
									// $scope.widgetdrillDownArray[index], no
									// separate filte data
									'#drillDownModel', index,
									'#sprintProgresAccordin1', dimension,
									groupby);

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
								if (layer != undefined) {

									$(
											'input:checkbox[name="'
													+ groupby.toLowerCase()
													+ '[]"]').filter(
											'[value="' + layer + '"]').prop(
											'checked', true);
								}

								$scope.filterForDrillDown(dimension
										.toLowerCase(), columnIndex[0],
										groupby, columnIndex[1]);

							}, 100);

							$timeout(function() {

								$('#drillDownModel').modal('show');

							}, 200);
						}
					}

					function buildDrillHtmlTable(tableId, drillDownWidgetData,
							popupId, widgetIndex, collapseId, headerName,
							groupby) {
						if ($.fn.dataTable.isDataTable(tableId)) {
							$(tableId).dataTable().fnDestroy();
						}

						var columnIndex = 0;
						var columnIndex1 = "";
						$("#table_header_status_" + widgetIndex).html('');
						$("#table_body_status_" + widgetIndex).html('');

						var keys = [];

						for ( var value in drillDownWidgetData) {
							keys = Object.keys(drillDownWidgetData[value]);
						}

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
								// if (changedvalue == null) {
								// changedvalue = '';
								// }

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

							}
							table_body_data = table_body_data + '</tr>';
						}

						jQuery("#table_body_status_" + widgetIndex).append(
								$compile(table_body_data)($scope));

						// keys
						for (var i = 0; i < keys.length; i++) {
							if (keys[i] != '') {
								var changedkey = getChangedData(keys[i]);

								var headerNameFormattedValue = keys[i].replace(
										"_", " ");
								var headerNameFormattedValue = headerNameFormattedValue
										.toLowerCase()
										.replace(/\b[a-z]/g, function(letter) {
											return letter.toUpperCase();
										});

								jQuery("#table_header_status_" + widgetIndex)
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
								if (groupby == undefined) {
									for (var k = 0; k < array_header.length; k++) {
										divData = divData
												+ '<div class="checkbox checkboxfilter checkbox-info"> '
												+ '<input ng-change="filterForDrillDown(\''
												+ checkBoxKey.toLowerCase()
												+ '\',\'' + i + '\',\''
												+ groupby + '\',\'' + i
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
								} else {
									for (var k = 0; k < array_header.length; k++) {
										divData = divData
												+ '<div class="checkbox checkboxfilter checkbox-info"> '
												+ '<input ng-change="filterForDrillDown(\''
												+ checkBoxKey.toLowerCase()
												+ '\',\''
												+ i
												+ '\')" ng-model="'
												+ checkBoxKey
												+ "_"
												+ widgetIndex
												+ '['
												+ k
												+ '].checked" type="checkbox"'
												+ 'name="'
												+ checkBoxKey.toLowerCase()
												+ '[]" value="'
												+ array_header[k].actual
												+ '" id="Id'
												+ array_header[k].changed
												+ '_'
												+ i
												+ '"> <label class="labelStyle"'
												+ ' for="Id'
												+ array_header[k].changed + '_'
												+ i + '">'
												+ array_header[k].actual
												+ '</label> </div>';

									}
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
																+ '"class="panel-collapse collapse"><div class="panel-body panelStyle" style="overflow:auto !important;">'
																+ divData
																+ '</div></div></div>')
														($scope));

								if (checkBoxKey.toLowerCase() == headerName
										.toLowerCase()) {
									columnIndex = i;
								}

								if (checkBoxKey.toLowerCase() == groupby
										.toLowerCase()) {
									columnIndex1 = i;
								}
							}
						}
						return [ columnIndex, columnIndex1 ];
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
							columnIndex, groupby, groupbycolumnindex) {

						var topic = '';
						var types = "";
						var resettypes = "";
						// build a regex filter string with an or(|) condition
						types = $(
								'input:checkbox[name="' + headerName
										+ '[]"]:checked').map(function() {

							return this.value;
						}).get().join('|');
						if (groupby != undefined && groupby != "") {

							types1 = $(
									'input:checkbox[name="' + groupby
											+ '[]"]:checked').map(function() {

								return this.value;
							}).get().join('|');

							types = types + '|' + types1;
						}

						if (types != '') {

							$("#" + headerName + "_" + $scope.dataIndex)
									.addClass("in");
							$('.' + headerName).css("background", "#b3cccc");

							sprintProgressTableObj.columns(columnIndex).search(
									"^(" + types + ")$", true, false, false)
									.draw();
							if (groupbycolumnindex != undefined
									&& groupbycolumnindex != "") {
								$("#" + headerName + "_" + $scope.dataIndex)
										.addClass("in");
								$('.' + groupby).css("background", "#b3cccc");
								sprintProgressTableObj.columns(
										groupbycolumnindex)
										.search("^(" + types + ")$", true,
												false, false).draw();
							}

						} else {
							$('.' + headerName).css("background", "");
							types = $(
									'input:checkbox[name="' + headerName
											+ '[]"]').map(function() {
								return this.value;
							}).get().join('|');

							sprintProgressTableObj.columns(columnIndex).search(
									"^(" + types + ")$", true, false, false)
									.draw();
							if (groupbycolumnindex != undefined
									&& groupbycolumnindex != "") {
								$('.' + groupby).css("background", "");
								sprintProgressTableObj.columns(
										groupbycolumnindex)
										.search("^(" + types + ")$", true,
												false, false).draw();
							}
						}

						$("#resetAll").click(
								function() {
									$("input:checkbox").prop('checked', false);

									$('.' + headerName).css("background", "");

									resettypes = $(
											'input:checkbox[name="'
													+ headerName + '[]"]').map(
											function() {
												return this.value;
											}).get().join('|');

									sprintProgressTableObj.columns(columnIndex)
											.search("^(" + resettypes + ")$",
													true, false, false).draw();
									types = "";

								});

					}

					// Drilldown End

					// Filter Code
					$scope.filterData = function(index) {

						var myList = [];
						$scope.dataPreviousIndex = $scope.dataIndex;
						$scope.dataIndex = index;
						var dimension = $sessionStorage.UserWidgetsInfo[index].chartInformation.x_axis;
						var group = $sessionStorage.UserWidgetsInfo[index].chartInformation.y_axis;
						var chartType = $sessionStorage.UserWidgetsInfo[index].chartInformation.chart_type;
						var xAggrFunc = $sessionStorage.UserWidgetsInfo[index].chartInformation.aggr_func;
						var yAggrFunc = $sessionStorage.UserWidgetsInfo[index].chartInformation.aggr_func_y;
						var groupBy = $sessionStorage.UserWidgetsInfo[index].chartInformation.groupBy;
						var gaugeGroup = $("#gColumn option:selected").val();
						var gAggrFunc = $(
								"input:radio[name='gAggrFunc']:checked").val();
						var gaugeMaxValue = $('#maxGuageValue').val();
						var gaugeChartType = $(
								"input:radio[name='gaugeChartType']:checked")
								.val();

						$scope.groupbymulti = commonService
								.getColorsArray($sessionStorage.UserWidgetsInfo[index].chartInformation.groupArray);

						var xLabel = dimension;
						var yLabel = group;
						if (xAggrFunc == 'count') {
							yLabel = 'Count';
							$scope.yAxis = 'Count';
						}
						var dataSetMain = $scope.widgetDataArray[index];

						if (chartType == 'stackedMultiChart'
								|| chartType == 'stackedMultiClustered'
								|| chartType == 'stackedLineMultiChart'
								|| chartType == 'stackedAreaMultiChart') {
							var arr = $scope.groupbymulti;
							arr.splice(0, 0, dimension)

							myList = homeService.filterJsonByKeys(dataSetMain,
									arr);
						} else {

							if (dimension != '' && xAggrFunc == 'count'
									&& groupBy != '') {

								myList = homeService.filterJsonByKeys(
										dataSetMain, [ dimension, groupBy ]);

							} else if (dimension != '' && xAggrFunc == 'count'
									&& group == '') {

								myList = homeService.filterJsonByKeys(
										dataSetMain, [ dimension ]);
							} else if (dimension != '' && group != ''
									&& groupBy != '') {

								myList = homeService.filterJsonByKeys(
										dataSetMain, [ dimension, group,
												groupBy ]);
							} else if (dimension != '' && group != '') {

								myList = homeService.filterJsonByKeys(
										dataSetMain, [ dimension, group ]);

							} else if (groupBy != '') {

								myList = homeService.filterJsonByKeys(
										dataSetMain, [ dimension, groupBy ]);

							}
						}

						$('#graphData_' + $scope.dataPreviousIndex + '_wrapper')
								.hide();
						$('#graphData_' + index + '_wrapper').show();
						if ($('#graphData_' + index).html() == ''
								|| $('#graphData_' + index).html() == undefined
								|| $sessionStorage.filterDatatable[index] == null) {
							var graphData = "<table id='graphData_"
									+ index
									+ "' class='grid table table-striped tablesorter backColorWhite graphData_filters'></table>";
							$('#filterDiv').append(graphData);
							$sessionStorage.filterDatatable[index] = homeService
									.buildHtmlTable(myList, '#graphData_'
											+ index);
						}

					}
					$("#homeContainer").on('click',
							'.grid thead th .filter-options', function(e) {
								showFilterOption(this);
							});

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

						var filteredData = homeService.filterJsonByKeys(
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

									var chart = homeService
											.callBuildGraph(
													jsonData1,
													$scope.dataIndex,
													$sessionStorage.UserWidgetsInfo[$scope.dataIndex].chartInformation,
													'#standWidget');

									charts[$scope.dataIndex] = chart;

									$scope.forAllChartsAllFunctions(index, '');

									// $('#filterModel').modal('hide');
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

					// Filter Code --Ends

					function buildCharts(data) {
						if (data["Defects"]) {
							dataSetMain = data["Defects"];
						} else if (data["issues"]) {
							dataSetMain = data["issues"];
						} else if (data["issues"]) {
							dataSetMain = data["allBuilds"];
						} else {
							dataSetMain = data;
						}
						$scope.dataSet = dataSetMain;

						var selectOptions = dataSetMain[0];

						var selectKeys = [];

						for ( var k in selectOptions) {

							if (k != "") {
								selectKeys.push({
									'key' : k,
									'value' : k
								});
							} else {
								selectKeys.push({
									"key" : "--Select--",
									"value" : ""
								});
							}
						}

						$scope.dataOptions = selectKeys;

					}

					$scope.changeChartType = function() {
						chartTypeOnload();
						// homeService.showOptionsForChartType();
						getColorArrayAndCountByhartType('onchange',
								$scope.dataSet, $scope.xAxis, $scope.groupBy);
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
							$scope.colorsArray = commonService
									.getColorsArray($scope.allWidgetInfo[$scope.dataIndex].chartInformation.colorsArray);
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

							var groupby = $("#groupBy option:selected").val();
							if (groupby == "? string: ?") {

								$("#groupBy option:eq(1)").attr('selected',
										'selected');
								groupbykey = $("#groupBy option:eq(1)").val();
								$("#groupBy option[value='? string: ?']")
										.hide();
							}

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
								var groupby = $(
										"#groupbymulti" + i
												+ " option:selected").val();
								if (groupby == "? undefined:undefined ?") {
									$("#groupbymulti" + i + " option:eq(1)")
											.attr('selected', 'selected');
									$(
											"#groupbymulti"
													+ i
													+ " option[value='? undefined:undefined ?']")
											.hide();

									groupby = $("#groupBy option:eq(1)").val();

								}
								array.push(groupby);
							}
							counter = array;
						}
						commonService.getColorsDiv(counter, $scope.colorsArray);
					}

					$('select[id="gColumn"]')
							.on(
									'change',
									function(e) {
										var gaugeGroup = $(
												"#gColumn option:selected")
												.val();
										var gAggrFunc = $(
												"input:radio[name='gAggrFunc']:checked")
												.val();
										$scope.gaugeAggrValue = homeService
												.showGaugeAggrValue(
														dataSetMain,
														gaugeGroup, gAggrFunc);
									});

					$('input:radio[name="gAggrFunc"]')
							.on(
									'click',
									function(e) {
										var gaugeGroup = $(
												"#gColumn option:selected")
												.val();
										var gAggrFunc = $(
												"input:radio[name='gAggrFunc']:checked")
												.val();
										$scope.gaugeAggrValue = homeService
												.showGaugeAggrValue(
														dataSetMain,
														gaugeGroup, gAggrFunc);
									});
					// })();

					$scope.changegroupbyAndXaxis = function(key) {
						$scope.xAxisLabel = $scope.xAxis;
						getColorArrayAndCountByhartType('onchange',
								$scope.dataSet, key, key);
					}

					$scope.onyaxischange = function() {
						$scope.yAxisLabel = $scope.yAxis;
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

					function piechartRender(chart, index) {

						var chartVal = "standWidget_#standWidget" + index;
						chart
								.on(
										'postRender',
										function(chart) {
											chart
													.selectAll('text.pie-slice')
													.text(
															function(d) {
																var percentage = dc.utils
																		.printSingleValue((d.endAngle - d.startAngle)
																				/ (2 * Math.PI)
																				* 100)
																		+ '%';
																var value = percentage;

																if ($sessionStorage.UserWidgetsInfo[index].chartInformation.valueOrPercentage == "percentage") {
																	$sessionStorage[chartVal] = value;
																	return $sessionStorage[chartVal];

																} else if ($sessionStorage.UserWidgetsInfo[index].chartInformation.valueOrPercentage == "Value") {
																	$sessionStorage[chartVal] = d.value;
																	return $sessionStorage[chartVal];

																} else {
																	$sessionStorage[chartVal] = d.value;
																	return $sessionStorage[chartVal];
																}

															});
										});
					}

					// Multigroup

					$scope.add = function() {
						if ($scope.items.length < 6) {
							$scope.items.push($scope.items.length);
							$scope.colorsArray = [ "#49b7e4", "#b4d042",
									"#ef7f28", "#2f4455", "#acc2c0", "#fdd962",
									"#65c7c8", "#c2af2f", "#006a9c", "#9ca6b2" ];
							$timeout(function() {
								colorsarraydesign($scope.colorsArray, '', '',
										'');
							}, 100);
							groupIndex++;
						}

					}

					$scope.del = function(i) {
						if (groupIndex !== 2) {
							$scope.items.splice(i, 1);
							groupIndex--;
							$scope.colorsArray = [ "#49b7e4", "#b4d042",
									"#ef7f28", "#2f4455", "#acc2c0", "#fdd962",
									"#65c7c8", "#c2af2f", "#006a9c", "#9ca6b2" ];

							$timeout(function() {
								colorsarraydesign($scope.colorsArray, '', '',
										'');
							}, 100);
						}
					}

					// $('.datatypesCheck').bootstrapToggle('off');

					// **************** key Events for Value templates
					// ******************//
					$("#titleFont").keyup(function() {
						$scope.drawValueTemplate();
					});
					$("#titleColor").keyup(function() {
						$scope.drawValueTemplate();
					});
					$("#valueFont").keyup(function() {
						$scope.drawValueTemplate();
					});
					$("#valueColor").keyup(function() {
						$scope.drawValueTemplate();
					});
					$("#templateBGColor").keyup(function() {
						$scope.drawValueTemplate();
					});

					$('div.valueTemplateIcons1').on('keyup',
							'.fontAwesomeIcon', function() {
								$scope.drawValueTemplate();
							});
					$('div.valueTemplateIcons1').on('keyup',
							'.fontAwesomeValueColor', function() {
								$scope.drawValueTemplate();
							});

					$scope.callColorClass = function(type) {
						$('.cp').colorpicker({
							customClass : 'colorpicker-2x',
							format : 'hex',
							sliders : {
								saturation : {
									maxLeft : 200,
									maxTop : 200
								},
								hue : {
									maxTop : 200
								},
								alpha : {
									maxTop : 200
								}
							},
							colorSelectors : {
								'red' : '#FF0000',
								'green' : '#00ff00',
								'yellow' : '#0000ff',
								'orange' : '#ed7d31',
								'default' : '#777777',
								'primary' : '#337ab7',
								'success' : '#5cb85c',
								'info' : '#5bc0de',
								'warning' : '#f0ad4e',
								'danger' : '#d9534f'
							}

						}).on(
								'changeColor',
								function(ev) {
									if (type != null && type != undefined
											&& type == "valuetemplate") {
										$scope.drawValueTemplate();
									}
								});
					}

					/**
					 * Below code is to draw custom widgets in standard menus.
					 * Below functions are taken from mydashboardcontroller.js
					 * 
					 */

					function getCustomEmptyWidget(index) {
						$sessionStorage["screen" + index + "Size"] = 'smallScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:300px;" id="custWidget'
								+ index + '"></div>';
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';
						if ($scope.allWidgetInfo[index].chartType == "gaugeChart") {
							if ($scope.allWidgetInfo[index].gaugeType === 'powerGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><div align="center" id="custWidget'
										+ index + '"></div>';
							} else if ($scope.allWidgetInfo[index].gaugeType === 'liquidGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="custWidget'
										+ index
										+ '" width="400" height="300"></svg>';
							}
						}
						myDashboardService.buildEmptyWidgetDOM(
								$scope.allWidgetInfo[index], index, noDataDiv,
								chartDiv)
						jQuery("#homeContainer").append(
								$compile(
										myDashboardService.buildEmptyWidgetDOM(
												$scope.allWidgetInfo[index],
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
												if ($scope.allWidgetInfo[index].chartInformation.chartType == 'gaugeChart') {
													if ($scope.allWidgetInfo[index].chartInformation.gaugeType === 'powerGauge'
															|| $scope.allWidgetInfo[index].chartInformation.gaugeType === 'liquidGauge') {
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
																		$scope.allWidgetInfo[index].chartInformation,
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
																			if ($scope.allWidgetInfo[index].custFilePath === '') {

																				widgetData = customwidgetService
																						.getChartData($scope.allWidgetInfo[index].sourceUrl);
																				getChartInfoFromURL(
																						widgetData,
																						index);

																			} else {
																				widgetData = customwidgetService
																						.getChartDataFromCSV(
																								"views/customFiles/"
																										+ $scope.allWidgetInfo[index].custFilePath,
																								$scope.allWidgetInfo[index].custFileRealPath,
																								$scope.allWidgetInfo[index].sheetName);

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
												} else if ($scope.allWidgetInfo[index].chartInformation.chartType == 'ganttChart') {
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
																	$scope.allWidgetInfo[index].chartInformation,
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
																	$scope.widgetDataArray[index],
																	'#custWidget'
																			+ index,
																	$scope.allWidgetInfo[index].chartInformation,
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

																		if ($scope.allWidgetInfo[index].custFilePath === '') {
																			var widgetData = customwidgetService
																					.getChartData($scope.allWidgetInfo[index].sourceUrl);
																			getChartInfoFromURL(
																					widgetData,
																					index);
																		} else {
																			var widgetData1 = customwidgetService
																					.getChartDataFromCSV(
																							"views/customFiles/"
																									+ $scope.allWidgetInfo[index].custFilePath,
																							$scope.allWidgetInfo[index].custFileRealPath,
																							$scope.allWidgetInfo[index].sheetName);
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

																					if ($scope.allWidgetInfo[index].xaxisDataType == 'Date'
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
																										$scope.allWidgetInfo[index].chartInformation);
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

																					if ($scope.allWidgetInfo[index].chartInformation.xaxisDataType == 'Date') {
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
																										$scope.allWidgetInfo[index].chartInformation);
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

																					if ($scope.allWidgetInfo[index].chartInformation.xaxisDataType == 'Date') {

																						var brushOnFlag = false;
																						var noYAxis = false;
																						var sliderHeight = '';
																						myDashboardService
																								.buildGraphs(
																										dataSet,
																										sliderChartId,
																										$scope.allWidgetInfo[index].chartInformation,
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

					$scope.deleteWidget = function(widId, index) {
						$scope.deleteWidgetID = widId;
						$scope.deleteWidgetIndex = index;
						charts.splice(index, 1);
						$('#deleteCustWidgetModal').modal('show');
					}

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

					$scope.saveCustomWidgetToDB = function() {
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
									customWidgetId : $scope.widgetInfo.customWidgetId,
									projectId : $sessionStorage.projectId,
									userId : $sessionStorage.userId,
									sourceUrl : $scope.widgetInfo.source_url,
									chartType : $scope.chartType,
									type : $scope.allWidgetInfo[index].type,
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
									custFileRealPath : $scope.widgetInfo.custFileRealPath,
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
									custFileRealPath : $scope.widgetInfo.custFileRealPath,
									sheetName : $scope.sheetName,
									colorsArray : $scope.colorsArray,
									showLabels : $scope.showLabels,
									legendPosition : $scope.legendPos,
									valueOrPercentage : $scope.valueOrPercentage.check,
									xAxisticklength : $scope.xAxisticklength,
									xaxisDataType : $scope.xdatatype,
									xaxisDateFormat : xdatetimeformat,
									groupArray : $scope.groupbymulti,
									trendLineOptions : trendLineoptions,
									customWidgetType : $scope.widgetInfo.customWidgetType,
									menuId : $scope.widgetInfo.menuid
								};

								var widgetResponse = customwidgetService
										.postCustomWidgetDetails(dataObj);
								widgetResponse
										.then(
												function(response) {

													if (response.data === 'success') {
														$scope.allWidgetInfo[$scope.dataIndex].chartInformation = homeService
																.updateSessionObject(dataObj);
														$scope.allWidgetInfo[$scope.dataIndex].widgetName = $scope.widgetTitle;
														$scope.allWidgetInfo[$scope.dataIndex].name = $scope.widgetTitle;
														$('#myDoodahModel')
																.modal('hide');
														$('#succWidgetModal')
																.modal('show');
														$(
																".panelHeaderTextPadding_"
																		+ $scope.dataIndex)
																.text(
																		$scope.widgetTitle);
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

									$('#errMessage_' + $scope.dataIndex)
											.empty();
									$('#errDiv' + $scope.dataIndex).hide();
								}, 500);

					}

					/**
					 * End
					 */
				});
