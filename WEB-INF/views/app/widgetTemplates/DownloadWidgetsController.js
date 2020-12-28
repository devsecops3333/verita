mainApp
		.controller(
				'DownloadWidgetsController',
				function($http, $scope, $sessionStorage, $rootScope,
						indexService, customwidgetService, $compile,
						widgetService, $timeout, homeService, commonService,
						$state, $stateParams, myDashboardService) {

					$scope.responseArray = $sessionStorage.MyDashboardWidgetInfo;

					// $sessionStorage.downloadFormat
					$scope.downloadWidgetIdList = [];

					var UserWidgetsInfoNames = [];
					var menuAndWidgetNames = [];
					var menuAndIndexNames = [];

					/**
					 * Code Mydashboard widgets Start
					 * 
					 */

					if ($scope.responseArray.length == 0) {

						$('#message').show();
						$('#loaderMain').hide();
					} else {
						$('#message').hide();

						console.log("$scope.responseArray-==",
								$scope.responseArray);
						for (i = 0; i < $scope.responseArray.length; i++) {
							if ($scope.responseArray[i].widgetType === 'custom') {
								for (m = 0; m < $sessionStorage.selectedWidgetList.length; m++) {
									var widgetId = $sessionStorage.selectedWidgetList[m].key
											.split("_");
									var widget = widgetId[0];
									var menu = widgetId[1];
									if (menu == 'Mydashboard') {
										if ($scope.responseArray[i].customWidgetId == widget) {
											if ($scope.responseArray[i].custFilePath === '') {

												getMyDashboardEmptyWidget(i);
												var widgetData = customwidgetService
														.getChartData($scope.responseArray[i].sourceUrl);
												getChartInfoFromURL(widgetData,
														i);
											} else {
												getMyDashboardEmptyWidget(i);
												var widgetData1 = customwidgetService
														.getChartDataFromCSV("views/customFiles/"
																+ $scope.responseArray[i].custFilePath,$scope.responseArray[i].custFileRealPath);
												getChartInfoFromURL(
														widgetData1, i);

											}

											UserWidgetsInfoNames
													.push("myDashboardCustPanelPreview"
															+ i);

											// Menu and Widget names
											var menuName = "";
											for (k = 0; k < $sessionStorage.selectedmenuList.length; k++) {
												if (menu == $sessionStorage.selectedmenuList[k].value) {
													menuName = $sessionStorage.selectedmenuList[k].value;
													break;
												}
											}
											menuAndWidgetNames
													.push({
														'menuName' : menuName,
														'widgetName' : $sessionStorage.selectedWidgetList[m].value
													});

											// Index and Menu names
											menuAndIndexNames.push(menuName);

										}
									}
								}

							} else {

								for (m = 0; m < $sessionStorage.selectedWidgetList.length; m++) {
									var widgetId = $sessionStorage.selectedWidgetList[m].key
											.split("_");
									var widget = widgetId[0];
									var menu = widgetId[1];

									if (menu == 'Mydashboard') {

										if ($scope.responseArray[i].customWidgetId == widget) {

											if ($scope.downloadWidgetIdList
													.indexOf($scope.responseArray[i].widgetId) != -1) {

												getSWidgetTemplate(
														$scope.responseArray[i],
														i);
											} else {

												getSEmptyWidget(i);
												var widgetData = widgetService
														.getWidgetData($scope.responseArray[i].datacenterWidgetId);

												getPreviewStandardChartInfo(
														widgetData, i);
											}

											// Menu and Widget names
											var menuName = "";
											for (k = 0; k < $sessionStorage.selectedmenuList.length; k++) {
												if (menu == $sessionStorage.selectedmenuList[k].value) {
													menuName = $sessionStorage.selectedmenuList[k].value;
													break;
												}
											}
											menuAndWidgetNames
													.push({
														'menuName' : menuName,
														'widgetName' : $sessionStorage.selectedWidgetList[m].value
													});

											// Index and Menu names
											menuAndIndexNames.push(menuName);
										}
										if (i == 0) {
											$('#message').hide();
											$('#loaderMain').hide();
										}

									}

								}
							}

						}

						$sessionStorage.UserWidgetsInfoNames = UserWidgetsInfoNames;

						// Sort Menu names
						menuAndWidgetNames = menuAndWidgetNames.sort(function(
								a, b) {
							return a.menuName.localeCompare(b.menuName);
						});
						$sessionStorage.menuAndWidgetNames = menuAndWidgetNames;

						$sessionStorage.menuAndIndexNames = menuAndIndexNames;

					}

					function getMyDashboardEmptyWidget(index) {
						$sessionStorage["myscreen" + index + "Size"] = 'smallScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:300px;" id="custWidget'
								+ index + '"></div>';
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';
						if ($scope.responseArray[index].chartType == "gaugeChart") {
							if ($scope.responseArray[index].gaugeType === 'powerGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><div align="center" id="custWidget'
										+ index + '"></div>';
							} else if ($scope.responseArray[index].gaugeType === 'liquidGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="custWidget'
										+ index
										+ '" width="400" height="300"></svg>';
							}
						}
						myDashboardService.buildEmptyWidgetDOMPreview(
								$scope.responseArray[index], index, noDataDiv,
								chartDiv)
						jQuery("#previewcontainer")
								.append(
										$compile(
												myDashboardService
														.buildEmptyWidgetDOMPreview(
																$scope.responseArray[index],
																index,
																noDataDiv,
																chartDiv))(
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
												$('#loader' + index).hide();
												$scope.errormessage = "No Data Found";
												$('#errDiv' + index).show();
												$("#edit_" + index).addClass(
														"disabled");
												$("#filter_" + index).addClass(
														"disabled");
												$(
														".custPanel"
																+ index
																+ ' li a[data-title="Fullscreen"]')
														.removeAttr("data-func");
											} else {
												$scope.widgetDataArray[index] = dataSet;
												if ($scope.responseArray[index].chartType == 'gaugeChart') {
													if ($scope.responseArray[index].gaugeType === 'powerGauge'
															|| $scope.responseArray[index].gaugeType === 'liquidGauge') {
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
																		$scope.responseArray[index],
																		size);

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
																	$scope.responseArray[index]);

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
																	$scope.responseArray[index]);

													charts[index] = chart;
													chart.screenSize = 'smallScreen';

												}
											}

										},
										function(errorResponseIn) {
											$('#loader' + index).hide();
											$scope.errormessage = "No Data Found";
											$('#errDiv' + index).show();
											$("#edit_" + index).addClass(
													"disabled");
											$("#filter_" + index).addClass(
													"disabled");
											$(
													".custPanel"
															+ index
															+ ' li a[data-title="Fullscreen"]')
													.removeAttr("data-func");
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
						console.log("obj=-=-=-=-", obj);
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

							jQuery("#previewcontainer")
									.append(
											$compile(
													"<div class='col-md-6 col-xs-12 widgetDiv releaseReadinessMyDashStandPanelPreview"
															+ widgetData.customWidgetId
															+ "'><div ng-include src=\"'views/app/widgetTemplates/"
															+ widgetData.template
															+ ".html'\"  ng-init='burndowntitle = \""
															+ widgetData.widgetName
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

							UserWidgetsInfoNames
									.push('releaseReadinessMyDashStandPanelPreview'
											+ widgetData.customWidgetId);

						} else {

							jQuery("#previewcontainer")
									.append(
											$compile(
													"<div class='col-md-"
															+ widgetData.type
															+ " col-xs-12 mydashboardSamplePreview_"
															+ index
															+ " widgetDiv standPanel"
															+ widgetData.customWidgetId
															+ "' id="
															+ widgetData.customWidgetId
															+ "><div ng-include src=\"'views/app/widgetTemplates/"
															+ widgetData.template
															+ ".html'\"  ng-init='burndowntitle = \""
															+ widgetData.widgetName
															+ "\";widgetIndexTemp=\""
															+ index
															+ "\"; widgetNameTemp=\""
															+ widgetData.widgetName
															+ "\"; previewState=\"Mydashboard\"; customWidgetId = \""
															+ widgetData.customWidgetId
															+ "\";'  ng-if=\"'true'\"></div></div>")
													($scope));
							UserWidgetsInfoNames
									.push('mydashboardSamplePreview_' + index);
						}

					}

					function getSEmptyWidget(index) {

						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:300px;" id="standWidget'
								+ index + '"></div>';
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';

						if ($scope.responseArray[index].chartType == "gaugeChart") {
							if ($scope.responseArray[index].gaugeType === 'powerGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><div id="standWidget'
										+ index + '"></div>';
							} else if ($scope.responseArray[index].gaugeType === 'liquidGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="standWidget'
										+ index
										+ '" width="400" height="300"></div>';
							}
						}

						var sprintDiv = null;
						if ($scope.responseArray[index].toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						jQuery("#previewcontainer")
								.append(
										$compile(
												myDashboardService
														.buildSPreviewEmptyWidgetDOM(
																$scope.responseArray[index],
																index,
																noDataDiv,
																chartDiv,
																sprintDiv))(
												$scope));
						var userWidgetInfoObj = $scope.responseArray[index];
						UserWidgetsInfoNames
								.push("previewCustPanelStandWidgetP"
										+ userWidgetInfoObj.customWidgetId);

					}

					function getPreviewStandardChartInfo(widgetData, index) {
						widgetData
								.then(
										function(responseInn) {

											var respData = responseInn.data;
											var dataSet = respData.chartData;
											var errortext = respData.errormsg;

											if (errortext != "CONNECTION_TIMED_OUT") {
												if (respData == ""
														|| respData == undefined) {
													$('#loader' + index).hide();
													$scope.errormessage = "No Data Found";
													$('#errDiv' + index).show();
													$("#edit_" + index)
															.addClass(
																	"disabled");
													$("#filter_" + index)
															.addClass(
																	"disabled");
													$(
															".custPanel"
																	+ index
																	+ ' li a[data-title="Fullscreen"]')
															.removeAttr(
																	"data-func");
												} else if (respData == "401") {
													$scope.errormessage = "No Data Found Please reload to get the data";
													$('#loader' + index).hide();
													$('#errDiv' + index).show();
													$("#edit_" + index)
															.addClass(
																	"disabled");
													$("#filter_" + index)
															.addClass(
																	"disabled");
													$(
															".custPanel"
																	+ index
																	+ ' li a[data-title="Fullscreen"]')
															.removeAttr(
																	"data-func");

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

													// $scope.widgetDataArray[index]
													// = dataSet;
													// drillDownSet =
													// respData.drillDownData;
													// $scope.widgetdrillDownArray[index]
													// = drillDownSet;

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

														console
																.log("width--251"
																		+ width);
														var size = width / 2 + 100;

														myDashboardService
																.buildGaugeChart(
																		dataSet,
																		'standWidget'
																				+ index,
																		$scope.responseArray[index],
																		size);

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
														console
																.log(
																		"dataSet-----------",
																		dataSet);
														var chart = myDashboardService
																.buildGraphs(
																		dataSet,
																		'#standWidget'
																				+ index,
																		$scope.responseArray[index]);

													}
												}
											} else {
												$('#loader' + index).hide();
												$('#errDiv' + index).show();
												$scope.errormessage = "Connection Time out";
												$("#edit_" + index).addClass(
														"disabled");
												$("#add_" + index).addClass(
														"disabled");
												$("#filter_" + index).addClass(
														"disabled");
												$(
														".custPanel"
																+ index
																+ ' li a[data-title="Fullscreen"]')
														.removeAttr("data-func");

											}

										},
										function(errorResponseIn) {
											$scope.errormessage = "No Data Found";
											$('#loader' + index).hide();
											$('#errDiv' + index).show();
											$("#edit_" + index).addClass(
													"disabled");
											$("#filter_" + index).addClass(
													"disabled");
											$(
													".custPanel"
															+ index
															+ ' li a[data-title="Fullscreen"]')
													.removeAttr("data-func");
										});
					}

					/**
					 * End
					 */

					for (i = 0; i < $sessionStorage.UserWidgetsInfo.length; i++) {

						if ($scope.downloadWidgetIdList
								.indexOf($sessionStorage.UserWidgetsInfo[i].id) != -1) {

							// for (j = 0; j <
							// $sessionStorage.selectedmenuList.length; j++) {

							// if ($sessionStorage.UserWidgetsInfo[i].menuid ==
							// $sessionStorage.selectedmenuList[j].key) {

							for (m = 0; m < $sessionStorage.selectedWidgetList.length; m++) {
								var widgetId = $sessionStorage.selectedWidgetList[m].key
										.split("_");
								var widget = widgetId[0];
								var menu = widgetId[1];
								if ($sessionStorage.UserWidgetsInfo[i].menuid == menu) {
									if ($sessionStorage.UserWidgetsInfo[i].id == widget) {

										getWidgetTemplate(
												$sessionStorage.UserWidgetsInfo[i].template,
												$sessionStorage.UserWidgetsInfo[i].type,
												i);
										$rootScope['widget_Data_'
												+ $sessionStorage.UserWidgetsInfo[i].template] = $sessionStorage.UserWidgetsInfo[i];

										// Total widgets array
										var widgetNameRR = $sessionStorage.UserWidgetsInfo[i].template;
										if (widgetNameRR == "releaseReadyness") {
											UserWidgetsInfoNames
													.push("prviewWidgetDiv"
															+ $sessionStorage.UserWidgetsInfo[i].datacenter_widget_id);
										} else {
											UserWidgetsInfoNames
													.push("prviewSample_" + i);
										}

										// Menu and Widget names
										var menuName = "";
										for (k = 0; k < $sessionStorage.selectedmenuList.length; k++) {
											if (menu == $sessionStorage.selectedmenuList[k].key) {
												menuName = $sessionStorage.selectedmenuList[k].value;
												break;
											}
										}
										menuAndWidgetNames
												.push({
													'menuName' : menuName,
													'widgetName' : $sessionStorage.selectedWidgetList[m].value
												});

										// Index and Menu names
										menuAndIndexNames.push(menuName);
									}
								}

							}
							// }

						} else {

							// for (k = 0; k <
							// $sessionStorage.selectedmenuList.length; k++) {

							for (w = 0; w < $sessionStorage.selectedWidgetList.length; w++) {
								var widgetId = $sessionStorage.selectedWidgetList[w].key
										.split("_");
								var widget = widgetId[0];
								var menu = widgetId[1];
								if ($sessionStorage.UserWidgetsInfo[i].menuid == menu) {
									if ($sessionStorage.UserWidgetsInfo[i].id == widget) {

										getEmptyWidget(i);
										// Total widgets array
										UserWidgetsInfoNames
												.push("previewCustPanelP" + i);
										// Menu and Widget names
										var menuName = "";
										for (k = 0; k < $sessionStorage.selectedmenuList.length; k++) {
											if (menu == $sessionStorage.selectedmenuList[k].key) {
												menuName = $sessionStorage.selectedmenuList[k].value;
												break;
											}
										}
										menuAndWidgetNames
												.push({
													'menuName' : menuName,
													'widgetName' : $sessionStorage.selectedWidgetList[w].value
												});

										// Index and Menu names
										menuAndIndexNames.push(menuName);

										var widgetData = widgetService
												.getWidgetData($sessionStorage.UserWidgetsInfo[i].datacenter_widget_id);

										getStandardChartInfo(widgetData, i);
									}

								}

							}
							// }

						}

						$sessionStorage.UserWidgetsInfoNames = UserWidgetsInfoNames;

						// Sort Menu names
						menuAndWidgetNames = menuAndWidgetNames.sort(function(
								a, b) {
							return a.menuName.localeCompare(b.menuName);
						});
						$sessionStorage.menuAndWidgetNames = menuAndWidgetNames;

						$sessionStorage.menuAndIndexNames = menuAndIndexNames;

					}

					function getEmptyWidget(index) {

						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width:100%; height:315px;" id="prviewStandWidget'
								+ index + '"></div>';

						if ($sessionStorage.UserWidgetsInfo[index].chartInformation != null
								|| $sessionStorage.UserWidgetsInfo[index].chartInformation != undefined) {

							if ($sessionStorage.UserWidgetsInfo[index].chartInformation.chart_type == 'gaugeChart') {

								if ($sessionStorage.UserWidgetsInfo[index].chartInformation.gaugeType == 'powerGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><div id="prviewStandWidget'
											+ index + '"></div>';
								} else if ($sessionStorage.UserWidgetsInfo[index].chartInformation.gaugeType == 'liquidGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="prviewStandWidget'
											+ index
											+ '" width="400" height="300"></svg>';
								}
							}
						}

						var sprintDiv = null;
						if ($sessionStorage.UserWidgetsInfo[index].toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';

						jQuery("#previewcontainer")
								.append(
										$compile(
												homeService
														.buildEmptyWidgetDOMDownload(
																$sessionStorage.UserWidgetsInfo[index],
																index,
																noDataDiv,
																chartDiv,
																sprintDiv))(
												$scope));

					}

					function getWidgetTemplate(name, type, index) {
						$rootScope.dwid = $sessionStorage.UserWidgetsInfo[i].datacenter_widget_id
								+ "_" + index;

						if (type != null && type != undefined) {
							var classname = 'col-md-' + type
									+ ' col-xs-12 prviewSample_' + index
									+ ' widgetDiv';
						} else {
							var classname = 'col-md-12 col-xs-12 prviewSample_'
									+ index + 'widgetDiv ';
						}

						if (name == "releaseReadyness") {

							$scope.NormalGauge_id = name;
							$scope.EngGauge_id = name + "_Eng";
							$scope.AnGauge_id = name + "_An";

							jQuery("#previewcontainer")
									.append(
											$compile(
													"<div class='col-md-6 col-xs-12 prviewWidgetDiv"
															+ $sessionStorage.UserWidgetsInfo[i].datacenter_widget_id
															+ "'><div ng-include src=\"'views/app/widgetTemplates/"
															+ name
															+ ".html'\"  ng-init='burndowntitle = \""
															+ $sessionStorage.UserWidgetsInfo[i].name
															+ "\"; NormalGauge_id = \""
															+ $scope.NormalGauge_id
															+ "\"; EngGauge_id = \""
															+ $scope.EngGauge_id
															+ "\"; AnGauge_id = \""
															+ $scope.AnGauge_id
															+ "\"'  ng-if=\"'true'\"></div></div>")
													($scope));

						} else {

							jQuery("#previewcontainer")
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
															+ "\";widgetIndexTemp=\""
															+ index
															+ "\"; widgetNameTemp=\""
															+ $sessionStorage.UserWidgetsInfo[i].name
															+ "\"; previewState=\"home\"; customWidgetId = \""
															+ $sessionStorage.UserWidgetsInfo[i].datacenter_widget_id
															+ "\";' ng-if=\"'true'\"></div></div>")
													($scope));
						}

					}

					function getStandardChartInfo(widgetData, index) {

						widgetData
								.then(
										function(responseInn) {
											var respData = responseInn.data;
											var status = responseInn.status;
											var errortext = respData.errormsg;
											if (errortext != "CONNECTION_TIMED_OUT") {
												if (respData == ""
														|| respData == undefined) {
													$('#loader' + index).hide();
													$('#errDiv' + index).show();
													$scope.errormessage = "No Data Found";
													$("#edit_" + index)
															.addClass(
																	"disabled");
													$("#add_" + index)
															.addClass(
																	"disabled");
													$("#filter_" + index)
															.addClass(
																	"disabled");

													$(
															".custPanel"
																	+ index
																	+ ' li a[data-title="Fullscreen"]')
															.removeAttr(
																	"data-func");

												} else if (respData == "401") {
													$scope.errormessage = "No Data Found Please reload to get the data";
													$('#loader' + index).hide();
													$('#errDiv' + index).show();

													$("#edit_" + index)
															.addClass(
																	"disabled");
													$("#add_" + index)
															.addClass(
																	"disabled");
													$("#filter_" + index)
															.addClass(
																	"disabled");
													$(
															".custPanel"
																	+ index
																	+ ' li a[data-title="Fullscreen"]')
															.removeAttr(
																	"data-func");
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
																				'#errDiv'
																						+ index)
																				.hide();
																		var widgetData = homeService
																				.callRefresh(
																						$sessionStorage.UserWidgetsInfo[index],
																						index);

																		getStandardChartInfo(
																				widgetData,
																				index);

																	});

												} else {
													$("#edit_" + index)
															.removeClass(
																	"disabled");
													$("#add_" + index)
															.removeClass(
																	"disabled");

													$(
															".custPanel"
																	+ index
																	+ ' li a[data-title="Fullscreen"]')
															.attr("data-func",
																	"expand");

													var dataSet = respData.chartData;
													drillDownSet = respData.drillDownData;
													// $scope.widgetdrillDownArray[index]
													// = drillDownSet;
													// $scope.widgetDataArray[index]
													// = dataSet;
													if (dataSet == ""
															|| dataSet == []) {
														$('#loader' + index)
																.hide();
														$('#errDiv' + index)
																.show();
														$scope.errormessage = "No Data Found";
														$("#edit_" + index)
																.addClass(
																		"disabled");
														$("#add_" + index)
																.addClass(
																		"disabled");
														$("#filter_" + index)
																.addClass(
																		"disabled");
														$(
																".custPanel"
																		+ index
																		+ ' li a[data-title="Fullscreen"]')
																.removeAttr(
																		"data-func");
													} else {
														$("#edit_" + index)
																.removeClass(
																		"disabled");
														$("#add_" + index)
																.removeClass(
																		"disabled");
														$("#filter_" + index)
																.removeClass(
																		"disabled");

														$(
																'#prviewStandWidget'
																		+ index)
																.html('');

														$(
																"#sprintValue"
																		+ index)
																.text(
																		respData.sprintData);
														if ($sessionStorage.UserWidgetsInfo[index].chartInformation.chart_type === 'gaugeChart') {
															$(
																	'#prviewStandWidget'
																			+ index)
																	.show();
															$(
																	"#filter_"
																			+ index)
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
																			'prviewStandWidget'
																					+ index,
																			$sessionStorage.UserWidgetsInfo[index].chartInformation,
																			size);

														} else {
															$(
																	"#filter_"
																			+ index)
																	.removeClass(
																			"disabled");
															$(
																	'#prviewStandWidget'
																			+ index)
																	.show();
															$('#errDiv' + index)
																	.hide();
															$('#loader' + index)
																	.hide();

															var chart = homeService
																	.callBuildGraph(
																			dataSet,
																			'#prviewStandWidget'
																					+ index,
																			$sessionStorage.UserWidgetsInfo[index].chartInformation);

															// charts[index] =
															// chart;

														}
													}
												}
											} else {
												$('#loader' + index).hide();
												$('#errDiv' + index).show();
												$scope.errormessage = "Connection Time out";
												$("#edit_" + index).addClass(
														"disabled");
												$("#add_" + index).addClass(
														"disabled");
												$("#filter_" + index).addClass(
														"disabled");
												$(
														".custPanel"
																+ index
																+ ' li a[data-title="Fullscreen"]')
														.removeAttr("data-func");
											}
										},
										function(error) {
											$('#loader' + index).hide();
											$('#errDiv' + index).show();
											$scope.errormessage = "No Data Found";
											$("#edit_" + index).addClass(
													"disabled");
											$("#add_" + index).addClass(
													"disabled");
											$("#filter_" + index).addClass(
													"disabled");
											$(
													".custPanel"
															+ index
															+ ' li a[data-title="Fullscreen"]')
													.removeAttr("data-func");
										});
					}

				});
