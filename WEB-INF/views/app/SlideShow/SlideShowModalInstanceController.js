mainApp
		.controller(
				'SlideShowModalInstanceController',
				function($scope, $uibModalInstance, items, myDashboardService,
						$sessionStorage, widgetService, customwidgetService,
						$filter, $compile, homeService, $rootScope, $timeout,
						$state, $interval, commonService) {

					$scope.timer = items;
					$scope.paused = false;
					$scope.autoplay = false;
					$scope.autoplaySpeed = $scope.timer;

					var callback = function() {
						if ($scope.paused == false) {
							$scope.autoplay = true;
						}
					}
					var tempwidgetInfo = [];
					var tempMydashboardWidgetInfo = [];

					for (m = 0; m < $sessionStorage.orderedwids.length; m++) {
						var widgetId = $sessionStorage.orderedwids[m].value
								.split("_");
						var widget = widgetId[0];
						var menu = widgetId[1];

						for (u = 0; u < $sessionStorage.UserWidgetsInfo.length; u++) {
							if ($sessionStorage.UserWidgetsInfo[u].menuid == menu) {
								if ($sessionStorage.UserWidgetsInfo[u].id == widget) {
									$sessionStorage.UserWidgetsInfo[u].orderId = $sessionStorage.orderedwids[m].newOrderId;
									tempwidgetInfo
											.push($sessionStorage.UserWidgetsInfo[u]);

								}
							}
						}

						if (menu == "Mydashboard") {
							for (w = 0; w < $sessionStorage.MyDashboardWidgetInfo.length; w++) {
								if ($sessionStorage.MyDashboardWidgetInfo[w].customWidgetId == widget) {
									$sessionStorage.MyDashboardWidgetInfo[w].orderId = $sessionStorage.orderedwids[m].newOrderId;
									tempMydashboardWidgetInfo
											.push($sessionStorage.MyDashboardWidgetInfo[w]);
								}

							}

						}

					}

					var widgetsInfoForMenu = tempwidgetInfo;
					var myDashboardWidgetsInfoForMenu = tempMydashboardWidgetInfo;
					var tempinfo = widgetsInfoForMenu
							.concat(myDashboardWidgetsInfoForMenu);
					var mydbindex = widgetsInfoForMenu.length;

					// $scope.slides = widgetsInfoForMenu;
					tempinfo = tempinfo.map(function(item, index, arr) {
						// console.log("item======",item);
						item.slideorder = "slideorder" + item.orderId;
						return item;
					});
					$scope.slides = tempinfo;

					$scope.slides.sort(function(a, b) {
						return parseFloat(a.orderId) - parseFloat(b.orderId);
					});

					$scope.selected = {
						item : $scope.slides[0]
					};

					$scope.widgetIdList = [];
					var charts = [];

					function getMyEmptyWidget(index) {

						$sessionStorage["screen" + index + "Size"] = 'fullScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style= "width: calc(100%-40px); min-height:315px; height:100%; position: absolute;" id="slide_custWidget'
								+ index + '"></div>';

						if ($scope.slides[index].chartInformation != null
								|| $scope.slides[index].chartInformation != undefined) {

							if ($scope.slides[index].chartInformation.chart_type == 'gaugeChart') {

								if ($scope.slides[index].chartInformation.gaugeType == 'po	werGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><div id="slide_custWidget'
											+ index + '"></div>';
								} else if ($scope.slides[index].chartInformation.gaugeType == 'liquidGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="slide_custWidget'
											+ index
											+ '" width="400" height="300"></svg>';
								}
							}
						}

						var sprintDiv = null;
						if ($scope.slides[index].toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';
						if ($scope.slides[index].template == "") {
							// return;
						}
						var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
								+ "." + $scope.slides[index].slideorder;
						// widgetsInfoForMenu[index].type = "12";

						jQuery(widgetDOMClass).append(
								$compile(
										myDashboardService
												.buildSEmptyWidgetDOM(
														$scope.slides[index],
														index, noDataDiv,
														chartDiv, sprintDiv,
														"12"))($scope));

						// homeService.buildEmptyWidgetDOM(
						// $scope.slides[index], index,
						// noDataDiv, chartDiv, sprintDiv,
						// "12"))($scope));
						//								
						$('.custPanel' + index).lobiPanel({
							// Options go here
							sortable : false,
							editTitle : false,
							close : false,
							reload : false,
							minimize : false,
							expand : false,
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

					function getEmptyWidget(index, state, id) {
						
						$sessionStorage["screen" + index + "Size"] = 'fullScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width: 97%; min-height:315px; height:100%; position: absolute;padding-left:1%;" id="'
								+ id + index + '"></div>';

						if ($scope.slides[index].chartInformation != null
								|| $scope.slides[index].chartInformation != undefined) {

							if ($scope.slides[index].chartInformation.chart_type == 'gaugeChart') {

								if ($scope.slides[index].chartInformation.gaugeType == 'powerGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><div id="'
											+ id + +index + '"></div>';
								} else if ($scope.slides[index].chartInformation.gaugeType == 'liquidGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="'
											+ id
											+ index
											+ '" width="400" height="300"></svg>';
								}
							}
						}

						var sprintDiv = null;
						if ($scope.slides[index].toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';

						// if ($scope.slides[index].template == "") {
						// return;
						// }
						var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
								+ "." + $scope.slides[index].slideorder;
						// widgetsInfoForMenu[index].type = "12";

						if (state == "home") {
							console.log("coming here---192====");
							jQuery(widgetDOMClass).append(
									$compile(
											homeService.buildEmptyWidgetDOM(
													$scope.slides[index],
													index, noDataDiv, chartDiv,
													sprintDiv, "12","slide"))($scope));
						} else {
							jQuery(widgetDOMClass)
									.append(
											$compile(
													myDashboardService
															.buildSEmptyWidgetDOM(
																	$scope.slides[index],
																	index,
																	noDataDiv,
																	chartDiv,
																	sprintDiv,
																	"12"))(
													$scope));
						}

						$('.custPanel' + index).lobiPanel({
							// Options go here
							sortable : false,
							editTitle : false,
							close : false,
							reload : false,
							minimize : false,
							expand : false,
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
					function getWidgetTemplate(name, type, index) {
						$rootScope.dwid = $scope.slides[index].datacenter_widget_id
								+ "_" + index;

						if (type != null && type != undefined) {
							type = "12";
							var classname = 'col-md-' + type
									+ ' col-xs-12 sample_' + index
									+ ' widgetDiv';
						} else {
							var classname = 'col-md-12 col-xs-12 sample_'
									+ index + 'widgetDiv ';
						}

						var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
								+ "." + $scope.slides[index].slideorder;
						jQuery(widgetDOMClass)
								.append(
										$compile(
												"<div class='"
														+ classname
														+ "' id='"
														+ $scope.slides[index].datacenter_widget_id
														+ "'><div ng-include src=\"'views/app/widgetTemplates/"
														+ name
														+ ".html'\" ng-init='burndowntitle = \""
														+ $scope.slides[index].name
														+ "\"; widgetIndexTemp=\""
														+ index
														+ "\"; widgetNameTemp=\""
														+ $scope.slides[index].name
														+ "\"; customWidgetId = \""
														+ $scope.slides[index].datacenter_widget_id
														+ "\";' ng-if=\"'true'\"></div></div>")
												($scope));

					}
					function getStandardChartInfo(widgetData, index, callback) {
						widgetData
								.then(
										function(responseInn) {
											callback();
											var respData = responseInn.data;
											var status = responseInn.status;
											var errortext = respData.errormsg;
											var memCahceNoObjError = respData.error;

											if (errortext != "CONNECTION_TIMED_OUT") {
												if (respData == ""
														|| respData == undefined) {

													$scope.toShowErrorMessage(
															index,
															"No Data Found");

												} else if (errortext == "No Offline URL") {
													$scope
															.toShowErrorMessage(
																	index,
																	"Please Contact Project Admin");
												} else if (memCahceNoObjError == "Please provide valid id.") {
													$scope.toShowErrorMessage(
															index,
															"No Data Found");
												} else if (respData == "401") {

													$scope
															.toShowErrorMessage(
																	index,
																	"No Data Found Please reload to get the data");

												} else {

													var dataSet = respData.chartData;

													$("#sprintValue" + index)
															.text(
																	respData.sprintData);

													if ($scope.slides[index].chartInformation.chart_type === 'gaugeChart') {
														$(
																'#home_standWidget'
																		+ index)
																.show();

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
																		'home_standWidget'
																				+ index,
																		$scope.slides[index].chartInformation,
																		size);

													} else {
														$('#loader' + index)
																.hide();
														$('#errDiv' + index)
																.hide();
														$(
																'#home_standWidget'
																		+ index)
																.show();

														var widgetTypeFromDB = $scope.slides[index].chartInformation.widgetType;
														if (widgetTypeFromDB != null
																&& widgetTypeFromDB != undefined) {
															if (widgetTypeFromDB == "Table") {
																var graphData = "<table id='tableData_"
																		+ index
																		+ "' class='grid table table-striped tablesorter genericTableBorder'></table>";
																$(
																		'#home_standWidget'
																				+ index)
																		.empty();
																$(
																		'#home_standWidget'
																				+ index)
																		.append(
																				graphData);
																$(
																		'#tableData_'
																				+ index)
																		.html(
																				'');

																if ($scope.slides[index] != null
																		&& $scope.slides[index] != undefined) {
																	commonService
																			.buildGenericHtmlTable(
																					dataSet,
																					'#tableData_'
																							+ index);
																} else {
																	$scope
																			.toShowErrorMessage(
																					index,
																					"No Data Found");
																}
															} else if (widgetTypeFromDB == "ValueTemplate") {
																var widgetName = $scope.slides[index].name;

																$(
																		'#home_standWidget'
																				+ index)
																		.empty();
																if (dataSet != null
																		&& dataSet != undefined) {

																	commonService
																			.setDataForValueTemplates(
																					index,
																					dataSet,
																					widgetName,
																					$scope.slides[index].valueTempInformation,
																					'#home_standWidget'
																							+ index);
																} else {
																	$scope
																			.toShowErrorMessage(
																					index,
																					"No Data Found");
																}
															} else {
																var chart = homeService
																		.callBuildGraph(
																				dataSet,
																				index,
																				$scope.slides[index].chartInformation,
																				'#home_standWidget');

															}

														} else {
															var chart = homeService
																	.callBuildGraph(
																			dataSet,
																			index,
																			$scope.slides[index].chartInformation,
																			'#home_standWidget');

														}

													}
												}
											} else {

												$scope.toShowErrorMessage(
														index,
														"Connection Time out");

											}
										}, function(error) {
											callback();

											$scope.toShowErrorMessage(index,
													"No Data Found");

										});
					}
					function getMyDashboardStandardChartInfo(widgetData, index,
							callback) {
						widgetData
								.then(
										function(responseInn) {
											callback();
											var respData = responseInn.data;
											var dataSet = respData.chartData;
											var errortext = respData.errormsg;
											var memCahceNoObjError = respData.error;
											if (errortext != "CONNECTION_TIMED_OUT") {
												if (respData == ""
														|| respData == undefined) {

													$scope.toShowErrorMessage(
															index,
															"No Data Found")

												} else if (errortext == "No Offline URL") {
													$scope
															.toShowErrorMessage(
																	index,
																	"Please Configure Offline Url");
												} else if (respData == "401") {

													$scope
															.toShowErrorMessage(
																	index,
																	"No Data Found Please reload to get the data")

												} else {

													$("#sprintValue" + index)
															.text(
																	respData.sprintData);
													if ($scope.slides[index].chartType == 'gaugeChart') {
														$("#filter_" + index)
																.addClass(
																		"disabled");

														$('#loader' + index)
																.hide();
														$('#errDiv' + index)
																.hide();
														$(
																'#home_standWidget'
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
																		'home_standWidget'
																				+ index,
																		$scope.slides[index],
																		size);

													} else {
														$('#loader' + index)
																.hide();
														$('#errDiv' + index)
																.hide();
														$(
																'#slide_standWidget'
																		+ index)
																.show();

														var widgetTypeFromDB = $scope.slides[index].customWidgetType;
														if (widgetTypeFromDB != null
																&& widgetTypeFromDB != undefined
																&& widgetTypeFromDB == "Table") {

															var graphData = "<table id='tableData_"
																	+ index
																	+ "' class='grid table table-striped tablesorter genericTableBorder'></table>";
															$(
																	'#slide_standWidget'
																			+ index)
																	.empty();
															$(
																	'#slide_standWidget'
																			+ index)
																	.append(
																			graphData);
															$(
																	'#tableData_'
																			+ index)
																	.html('');

															if (dataSet != null
																	&& dataSet != undefined) {
																commonService
																		.buildGenericHtmlTable(
																				dataSet,
																				'#tableData_'
																						+ index);
															} else {
																$scope
																		.toShowErrorMessage(
																				index,
																				"No Data Found");
															}

														} else {
															var chart = myDashboardService
																	.buildGraphs(
																			dataSet,
																			'#slide_standWidget'
																					+ index,
																			$scope.slides[index],
																			index);

														}

													}
												}
											} else {
												$scope.toShowErrorMessage(
														index,
														"Connection Time out");

											}

										}, function(errorResponseIn) {
											callback();
											$scope.toShowErrorMessage(index,
													"No Data Found");

										});
					}
					function getChartInfoFromURL(widgetData, index) {

						widgetData
								.then(
										function(responseInn) {
											callback();
											if (responseInn.data.Defects) {
												dataSet = responseInn.data.Defects;
											} else if (responseInn.data.issues) {
												dataSet = responseInn.data.issues;
											} else {
												dataSet = responseInn.data;
											}
											if (dataSet == ""
													|| dataSet == undefined) {

												$scope.toShowErrorMessage(
														index, "No Data Found");

											} else {
												// $scope.widgetDataArray[index]
												// = dataSet;
												if ($scope.slides[index].chartType == 'gaugeChart') {
													$('#loader' + index).hide();
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
																	$scope.slides[index],
																	size);

												} else {

													$('#custWidget' + index)
															.show();

													$('#loader' + index).hide();
													$('#errDiv' + index).hide();

													// widgetsInfoForMenu[index].type
													// = "12";
													var chart = myDashboardService
															.buildGraphs(
																	dataSet,
																	'#slide_custWidget'
																			+ index,
																	$scope.slides[index],
																	index);

												}
											}

										}, function(errorResponseIn) {
											callback();
											$scope.toShowErrorMessage(index,
													"No Data Found");

										});
					}

					$scope.toShowErrorMessage = function(index, errorText) {

						$('#loader' + index).hide();
						$('#errDiv' + index).show();
						$scope.errormessage = errorText;
						$('#errDiv' + index).empty();
						$('#errDiv' + index).append(errorText);

						$("#home_standWidget" + index).html('');

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

						var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
								+ "." + $scope.slides[index].slideorder;
						jQuery(widgetDOMClass)
								.append(
										$compile(
												"<div class='col-md-"
														+ "12"
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
					function getSlideEmptyWidget(index) {

						$sessionStorage["myscreen" + index + "Size"] = 'fullScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:98%; min-height:300px; height:100%; position: absolute;" id="slide_standWidget'
								+ index + '"></div>';
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';

						if ($scope.slides[index].chartType == "gaugeChart") {
							if ($scope.slides[index].gaugeType === 'powerGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><div id="slide_standWidget'
										+ index + '"></div>';
							} else if ($scope.slides[index].gaugeType === 'liquidGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="slide_standWidget'
										+ index
										+ '" width="400" height="300"></div>';
							}
						}

						var sprintDiv = null;
						if ($scope.slides[index].toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
								+ "." + $scope.slides[index].slideorder;

						jQuery(widgetDOMClass).append(
								$compile(
										myDashboardService
												.buildSEmptyWidgetDOM(
														$scope.slides[index],
														index, noDataDiv,
														chartDiv, sprintDiv,
														"12"))($scope));
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

					$timeout(
							function() {
								for (i = 0; i < $scope.slides.length; i++) {

									if ($scope.slides[i].customWidgetId != undefined) {
										if ($scope.slides[i].widgetType === 'custom') {
											if ($scope.slides[i].custFilePath === '') {
												getEmptyWidget(i,
														"myDashboard",
														"slide_custWidget");
											} else {
												getEmptyWidget(i,
														"myDashboard",
														"slide_custWidget");
											}

										} else {
											if ($scope.widgetIdList
													.indexOf($scope.slides[i].widgetId) != -1) {

												getSWidgetTemplate(
														$scope.slides[i], i);

											} else {
												console.log("===1235====");
												getEmptyWidget(i,
														"myDashboard",
														"slide_standWidget");

											}
										}

									} else {

										if ($scope.widgetIdList
												.indexOf($scope.slides[i].id) != -1) {
											getWidgetTemplate(
													$scope.slides[i].template,
													"12", i);
										} else {
											getEmptyWidget(i, "home",
													"home_standWidget");

										}
									}

								}

							}, 1000);

					$scope.ok = function() {
						$uibModalInstance.close($scope.selected.item);
					};

					$scope.cancel = function() {

						$scope.autoPlay = false;

						$uibModalInstance.dismiss('cancel');

					};

					var fullscreenElement = document.fullscreenElement
							|| document.mozFullScreenElement
							|| document.webkitFullscreenElement;
					var fullscreenEnabled = document.fullscreenEnabled
							|| document.mozFullScreenEnabled
							|| document.webkitFullscreenEnabled;

					$(fullscreenElement)
							.bind(
									'webkitfullscreenchange mozfullscreenchange fullscreenchange',
									function(e) {

										var state = document.fullScreen
												|| document.mozFullScreen
												|| document.webkitIsFullScreen;
										var event = state ? 'FullscreenOn'
												: 'FullscreenOff';
										// Now do something interesting
										if (event == 'FullscreenOff') {
											$scope.cancel();
										}

									});

					$scope.onCarouselInit = function() {
						console.log("***** onCarouselInit *****");
						
						if ($scope.slides.length == 1) {							
							loadWidgetsData(0);
						}
					};
					$scope.onCarouselBeforeChange = function() {
						console.log("***** onCarouselBeforeChange *****");						
						$scope.autoplay = false;
					};

					$scope.onCarouselAfterChange = function(i) {
						console.log("***** onCarouselAfterChange *****");
						//if ($scope.slides.length == (i+1))
						  if (i == 0)
							
							{
							$('#loader' + ($scope.slides.length-1)).show();
							$('#home_standWidget' + ($scope.slides.length-1))
									.hide();
							}else{
								$('#loader' + (i-1)).show();
								$('#home_standWidget' + (i-1))
										.hide();
							}
						
						loadWidgetsData(i);
					};

					var loadWidgetsData = function(i) {
						$timeout(
								function() {

									if ($scope.slides[i].customWidgetId != undefined) {
										if ($scope.slides[i].widgetType === 'custom') {
											if ($scope.slides[i].custFilePath === '') {
												var widgetData = customwidgetService
														.getChartData($scope.slides[i].sourceUrl);
												getChartInfoFromURL(widgetData,
														i, callback);
											} else {

												var widgetData1 = customwidgetService
														.getChartDataFromCSV(
																"views/customFiles/"
																		+ $scope.slides[i].custFilePath,
																$scope.slides[i].custFileRealPath);
												getChartInfoFromURL(
														widgetData1, i,
														callback);
											}

										} else {
											if ($scope.widgetIdList
													.indexOf($scope.slides[i].widgetId) != -1) {
												getSWidgetTemplate(
														$scope.slides[i], i);

											} else {
												var widgetId = $scope.slides[i].datacenterWidgetId;
												var widgetData = widgetService
														.getWidgetDataByType(
																widgetId,
																$sessionStorage.dataSourceTypeFromDB);

												getMyDashboardStandardChartInfo(
														widgetData, i, callback);

											}
										}

									} else {

										if ($scope.widgetIdList
												.indexOf($scope.slides[i].id) != -1) {
											console.log(" 1350");
											getWidgetTemplate(
													$scope.slides[i].template,
													"12", i);
										} else {
											console.log("========1355");
											console.log(" i---", i);
											
											var widgetData = widgetService
													.getWidgetDataByType(
															$scope.slides[i].datacenter_widget_id,
															$sessionStorage.dataSourceTypeFromDB);

											getStandardChartInfo(widgetData, i,
													callback);

										}
									}
								}, 2000);
					}

				});
