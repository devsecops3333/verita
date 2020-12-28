mainApp
		.controller(
				'CustomWidgetController',
				function($scope, $sessionStorage, $state, customwidgetService,
						$http, widgetService, $timeout, doodahService,
						commonService) {

					$scope.valueOrPercentage = {
						check : "Value"
					};
					$scope.xdatatype = "String";
					$scope.maxValue = {
						value : 100
					};

					var completeData = null;

					$scope.items = [];
					$scope.newitem = '';
					var groupIndex = 2;

					$scope.atmDashBtnFlag = false;
					$scope.filePath = "No File Choosen";
					$scope.toolName = '';
					$scope.sourceType = 'standard';
					$scope.customType = 'rest';
					$scope.loadLabel = '';
					$('#panel').hide();
					$scope.dcmessage = "";
					$scope.sourceURL = '';
					$scope.sourceURL_UserName = '';
					$scope.sourceURL_Password = '';
					$scope.chartType = 'lineChart';
					$scope.gaugeType = 'powerGauge';
					$scope.aggregation = '';
					$scope.yAggregation = 'sum';
					$scope.gAggregation = 'sum';
					$scope.xAxis = '';
					$scope.xAxisLabel = '';
					$scope.yAxis = '';
					$scope.yAxisLabel = '';
					$scope.groupBy = '';
					$scope.groupBy1 = '';
					$scope.groupBy2 = '';
					$scope.widgetName = '';
					$scope.gaugeColumn = '';
					$scope.rLable = false;
					$scope.showLabels = false;
					$scope.legendPos = 'Top Left';
					var dataSetMain, chart;
					var gaugeConfig, gauge1, powerGauge;
					var dataSetOriginal;
					var dataSetChanged = false;
					var workbook;
					var options = '';

					$scope.colorVar = '#49b7e4';
					$("#color1").val($scope.colorVar);
					$scope.chartSummary = '';
					$scope.custFileRealPath = '';
					$scope.sheetName = '';

					// slider
					$scope.dateformat = false;
					$scope.dateandtimeformat = false;

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

					// gaugeSetup();

					/*--- Get Uploaded Files List---*/

					customwidgetService.getCustomDataCenters(
							$sessionStorage.userId).then(function(response) {

						$scope.dcjson = response.data.details;

					});

					/*-----------Manoj Changes-----*/
					getToolData($sessionStorage.projectId);

					function getToolData(projectId) {

						var widgetRes = customwidgetService
								.getToolsDetails(projectId);
						widgetRes.then(function(data) {
							$scope.toollist = data.data;
						}, function(errorResponse) {

						});

					}

					$scope.updateTool = function(toolId) {

						var widgetRes = customwidgetService
								.getDataCenterDetails(toolId);

						widgetRes
								.then(
										function(data) {
											if ($.isEmptyObject(data.data)) {
												$scope.dcmessage = '';
												$scope.dcmessage = "Data Center is not Configured. Please Contact Project Admin";
												$scope.sourceURL = '';
												$scope.user_id = '';
												$scope.Pass_hid = '';
											} else {
												$scope.dcmessage = '';
												$scope.sourceURL = data.data.url;
												$scope.user_id = data.data.user_id;
												$scope.Pass_hid = data.data.pass;
											}
										}, function(errorResponse) {

										});

					}

					$scope.getResponseTool = function() {

						var sourceURL = $scope.sourceURL;
						var sourceURL_userId = $scope.user_id;
						var sourceURL_pass = $scope.Pass_hid;
						var sourceURL_addPArams = $scope.addparam;
						sourceURL = sourceURL + sourceURL_addPArams;
						var api_url = 'devops/rest/customURL/'
								+ sourceURL_userId + '/' + sourceURL_pass + '/'
								+ $scope.sourceURL + '?restURL=' + sourceURL;
						console.log("api_url----------", api_url);
						$http({
							method : 'GET',
							url : api_url
						}).then(function(response) {

							if (response.data == '') {
								buildCharts('', '');
							} else {
								buildCharts('', response.data);
							}
						}, function(response) {
							if (response != '') {
								buildCharts('', '');
							}
						});
					}

					$scope.resetDataFields = function() {
						$scope.sourceURL = "";
						$scope.user_id = "";
						$scope.Pass_hid = "";
						$scope.addparam = "";
						$scope.toolName = "";
						$scope.sourceURL_UserName = "";
						$scope.sourceURL_Password = "";
						$scope.customType = "";
						$('#xColumn').css("borderColor", "#cccccc");
						$('#yColumn').css("borderColor", "#cccccc");
					}

					$('select[id="xColumn"]').on('change', function() {
						$('#xColumn').css("borderColor", "");
					});

					$('select[id="yColumn"]').on('change', function() {
						$('#yColumn').css("borderColor", "");
					});

					/*-----------Manoj Changes-----*/

					$scope.loadData = function() {
						if ($scope.sourceURL_UserName === ''
								|| $scope.sourceURL_Password === '') {
							var api_url = 'devops/rest/customURL/NA/NA?restURL='
									+ encodeURIComponent($scope.sourceURL);
						} else {
							var api_url = 'devops/rest/customURL/'
									+ $scope.sourceURL_UserName + '/'
									+ $scope.sourceURL_Password + '?restURL='
									+ encodeURIComponent($scope.sourceURL);
						}

						$scope.filePath = "";

						$http({
							method : 'GET',
							url : api_url
						}).then(function(response) {
							if (response == '') {
								buildCharts('', '');
							} else {
								buildCharts('', response.data);
							}
						}, function(response) {
							if (response != '') {
								buildCharts('', '');
							}
						});

					}

					$scope.changeLegendPos = function() {
						var elmnt = document.getElementById("dchart");
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

						chart.legend(dc.legend().x(legendX).y(legendY)
								.itemHeight(10).gap(5).horizontal(true)
								.autoItemWidth(true));
						chart.render();

					}

					$scope.onyaxischange = function() {
						// $scope.yAxisLabel="";
						$scope.yAxisLabel = $scope.yAxis;
					}
					$scope.onxaxischange = function() {
						// $scope.xAxisLabel="";
						$scope.xAxisLabel = $scope.xAxis;
					}

					$scope.filterData = function() {

						var myList = [];

						var dimension = $("#xColumn option:selected").val();
						var group = $("#yColumn option:selected").val();
						var chartType = $("#chartType option:selected").val();
						var xAggrFunc = $(
								"input:radio[name='xAggrFunc']:checked").val();

						var yAggrFunc = $(
								"input:radio[name='yAggrFunc']:checked").val();

						var groupBy = $("#groupBy option:selected").val();

						var groupBy1 = $("#groupBy1 option:selected").val();
						var groupBy2 = $("#groupBy2 option:selected").val();

						var gaugeGroup = $("#gColumn option:selected").val();
						var gAggrFunc = $(
								"input:radio[name='gAggrFunc']:checked").val();
						var gaugeMaxValue = $('#maxGuageValue').val();

						var gaugeChartType = $(
								"input:radio[name='gaugeChartType']:checked")
								.val();

						var xLabel = dimension;
						var yLabel = group;
						if (xAggrFunc == 'count') {
							yLabel = 'Count';
							$scope.yAxisLabel = 'Count';
						}
						$scope.colorsArray = [];
						for (i = 1; i < counter; i++) {
							$scope.colorsArray.push($('#color' + i).val());
						}

						if (dimension != '' && xAggrFunc == 'count'
								&& groupBy != '') {
							myList = doodahService.filterJsonByKeys(
									dataSetMain, [ dimension, groupBy ]);
						} else if (dimension != '' && xAggrFunc == 'count'
								&& group == '') {
							myList = doodahService.filterJsonByKeys(
									dataSetMain, [ dimension ]);
						} else if (dimension != '' && group != ''
								&& groupBy != '') {
							myList = doodahService.filterJsonByKeys(
									dataSetMain, [ dimension, group, groupBy ]);
						} else if (dimension != '' && groupBy1 != ''
								&& groupBy2 != '') {
							myList = doodahService.filterJsonByKeys(
									dataSetMain, [ dimension, groupBy1,
											groupBy2 ]);
						} else if (dimension != '' && group != '') {
							myList = doodahService.filterJsonByKeys(
									dataSetMain, [ dimension, group ]);
						} else if (groupBy != '') {
							myList = doodahService.filterJsonByKeys(
									dataSetMain, [ dimension, groupBy ]);
						}
						if ($('#graphData').html() == ''
								|| $('#graphData').html() == undefined) {
							var graphData = "<table id='graphData' class='grid table table-striped tablesorter backColorWhite'></table>";
							$('#filterDiv').append(graphData);
							buildHtmlTable(myList, '#graphData');
						}

					}

					function buildCharts(error, data) {

						if (data == undefined || data == ''
								|| data["total"] == 0) {
							$scope.loadLabel = 'check the REST details entered';
							$('#xColumn').empty();
							$('#xColumn')
									.append(
											'<option value="">Select X-Axis... </option>');

							$('#yColumn').empty();
							$('#yColumn')
									.append(
											'<option value="">Select Y-Axis... </option>');

							$('#groupBy').empty();
							$('#groupBy')
									.append(
											'<option value="">Select group by... </option>');

							$('#groupBy1').empty();
							$('#groupBy1')
									.append(
											'<option value="">Select group by... </option>');
							$('#groupBy2').empty();
							$('#groupBy2')
									.append(
											'<option value="">Select group by... </option>');

							$('#gColumn').empty();
							$('#gColumn')
									.append(
											'<option value="">Select a column... </option>');
							$('#task').empty();
							$('#taskType').empty();
							$('#startDate').empty();
							$('#endDate').empty();

							$('#task')
									.append(
											'<option value="">Select Task... </option>');
							$('#taskType')
									.append(
											'<option value="">Select Task Type... </option>');
							$('#startDate')
									.append(
											'<option value="">Select Start Date... </option>');
							$('#endDate')
									.append(
											'<option value="">Select End Date... </option>');
							// throw new Error(error);
						} else {
							$scope.jsonData = JSON.stringify(data);
							$scope.loadLabel = 'loaded';
							if (data["Defects"]) {
								dataSetMain = data["Defects"];
							} else if (data["issues"]) {
								dataSetMain = data["issues"];
							} else if (data["issues"]) {
								dataSetMain = data["allBuilds"];
							} else if (data["sprints"]) {
								dataSetMain = data["allBuilds"];
							} else if (data["allBuilds"]) {
								dataSetMain = data["allBuilds"];
							} else if (data["entities"]) {
								dataSetMain = data["entities"];
							} else {
								dataSetMain = data;
							}

							completeData = dataSetMain;

							var objData = dataSetMain[0];

							$('#xColumn').empty();
							$('#xColumn')
									.append(
											'<option value="">Select X-Axis... </option>');

							$('#yColumn').empty();
							$('#yColumn')
									.append(
											'<option value="">Select Y-Axis... </option>');

							$('#groupBy').empty();
							$('#groupBy')
									.append(
											'<option value="">Select group by... </option>');

							$('#groupbymulti1').empty();
							$('#groupbymulti1')
									.append(
											'<option value="">Select group by... </option>');
							$('#groupbymulti2').empty();
							$('#groupbymulti2')
									.append(
											'<option value="">Select group by... </option>');
							$('#groupBy2').empty();
							$('#groupBy2')
									.append(
											'<option value="">Select group by... </option>');

							$('#gColumn').empty();
							$('#gColumn')
									.append(
											'<option value="">Select a column... </option>');

							$('#task').empty();
							$('#taskType').empty();
							$('#startDate').empty();
							$('#endDate').empty();

							$('#task')
									.append(
											'<option value="">Select Task... </option>');
							$('#taskType')
									.append(
											'<option value="">Select Task Type... </option>');
							$('#startDate')
									.append(
											'<option value="">Select Start Date... </option>');
							$('#endDate')
									.append(
											'<option value="">Select End Date... </option>');

							var sortObjData = [];
							Object.keys(objData).sort().forEach(function(v, i) {
								sortObjData[v] = objData[v];
							});

							$scope.sortObjData = sortObjData;
							var objData = sortObjData;
							options = '';
							for ( var p in objData) {

								if (objData.hasOwnProperty(p) && p != "") {
									options += '<option value="' + p + '">' + p
											+ '</option>';
								}
							}
							$('#xColumn').append(options);
							$('#yColumn').append(options);
							$('#groupBy').append(options);
							$('#groupbymulti1').append(options);
							$('#groupbymulti2').append(options);
							$('#groupBy2').append(options);
							$('#gColumn').append(options);
							// gautt chart
							$('#task').append(options);
							$('#taskType').append(options);
							$('#startDate').append(options);
							$('#endDate').append(options);
						}
					}

					$scope.errortext = false;
					$scope.drawChart = function(type) {

						var validate = validateChart();
						$('#panel').show();
						if (validate == false) {
							$("#addBtn").addClass("disabled");
							$scope.showChartGauge = false;
							$scope.showChart = false;
							$scope.errortext = true;
						} else {
							$("#addBtn").removeClass("disabled");
							if (type == '') {
								dataSetChanged = false;
								$('#graphData').html('');
								if (dataSetOriginal) {
									dataSetMain = dataSetOriginal;
								}
							}

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

								console.log(groupIndex);

								if (groupIndex === 0) {
									$scope.showChart = false;
									$scope.errortext = true;
									$('#errortext').html('');
									$('#errortext')
											.append(
													"Please Add Group by for plotting chart");
									modalshow = false;

								} else {

									for (var i = 1; i <= groupIndex; i++) {
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
								trendLineoptions = [ $scope.groupBymultiTrend,
										$scope.groupBymulticolorTrend ];
							}

							if (modalshow == true) {
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

								$scope.showChart = true;
								$scope.errortext = false;

								var options = {

									chartType : $scope.chartType,
									chartId : '#dchart',
									chartSummary : $scope.chartSummary,
									custFileRealPath : $scope.custFileRealPath,
									sheetName : $scope.sheetName,
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

									// gautt chart

									colorsArray : $scope.colorsArray,
									valueOrPercentage : $scope.valueOrPercentage.check,
									xaxisticklength : $scope.xAxisticklength,

									showLabels : $scope.showLabels,
									xaxisDataType : $scope.xdatatype,
									dataFormat : dataFormat,
									legendPos : $scope.legendPos,
									trendLineOptions : trendLineoptions,
									brushOnFlag : false,
									noYAxis : false,
									sliderHeight : '',

								}
								if ($scope.xAxisLabel == '') {
									$scope.xAxisLabel = $scope.xAxis;
								}
								if ($scope.yAxisLabel == '') {
									$scope.yAxisLabel = $scope.yAxis;
								}

								if ($scope.aggregation == 'count') {
									$scope.yAxisLabel = 'Count';
								}

								var elmnt = document.getElementById('panel');
								var width = elmnt.offsetWidth;
								var height = elmnt.offsetHeight;

								var screenSize = width / 2 + 200;

								if ($scope.chartType == 'gaugeChart') {

									$scope.showChartGauge = true;
									$scope.showChart = false;
									var chartId = '';
									if ($scope.gaugeType == "powerGauge") {
										chartId = 'power-gauge';
										$("#fillgauge").hide();
										$("#power-gauge").show();

									} else {
										chartId = 'fillgauge';
										$("#fillgauge").show();
										$("#power-gauge").hide();
									}
									var options = {
										chartId : chartId,
										chartSummary : $scope.chartSummary,
										custFileRealPath : $scope.custFileRealPath,
										sheetName : $scope.sheetName,
										chartSummaryPositionX : 600,
										chartSummaryPositionY : 10,
										gaugeGroup : $scope.gaugeColumn,
										gAggrFunc : $scope.gAggregation,
										gaugeMaxValue : $scope.maxValue.value,
										ChartType : $scope.gaugeType,
										gaugeValue : $scope.gaugeAggrValue,
										colorsArray : $scope.colorsArray,
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

									$timeout(function() {
										chart = widgetService.buildGraphGauge(
												dataSetMain, options);
									}, 1000);

								} else {
									// $scope.showChart = true;
									$scope.jsonData = JSON
											.stringify(dataSetMain);
									if (chartType == 'pieChart') {
										$scope.legendPos = 'Bottom Left';
									} else {
										$scope.legendPos = 'Top Left';
									}

									$timeout(function() {
										chart = widgetService.buildGraph(
												dataSetMain, options);
										// rotateLabelAndShowValue($scope.rLable,
										// $scope.showLabels)
									}, 1000);
								}
							}
						}
					}

					$scope.saveTODB = function(custFilePath) {

						console.log("$scope.sheetName", $scope.sheetName);
						var validate = validateChart();
						
						if (validate == true) {
							var menuId = $("#menus").val();
							
							if ($scope.chartType !== 'gaugeChart') {
								$scope.gaugeType = '';
								$scope.gAggregation = '';
							}
							var restURL = '';
							if (custFilePath == '') {
								restURL = 'devops/rest/customURL/'
										+ $scope.sourceURL_UserName + '/'
										+ $scope.sourceURL_Password
										+ '?restURL=' + $scope.sourceURL;
							}
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
								customWidgetId : 0,
								projectId : $sessionStorage.projectId,
								userId : $sessionStorage.userId,
								sourceUrl : restURL,
								chartType : $scope.chartType,
								xAxis : xAxis,
								xAxisTitle : $scope.xAxisLabel,
								yAxis : yAxis,
								yAxisTitle : $scope.yAxisLabel,
								aggrFunc : $scope.aggregation,
								aggrFuncY : $scope.yAggregation,
								widgetName : $scope.widgetName,
								groupBy : $scope.groupBy,
								custFilePath : custFilePath,
								gaugeType : $scope.gaugeType,
								gaugeColumn : $scope.gaugeColumn,
								aggrFunG : $scope.gAggregation,
								gaugeMaxValue : $scope.maxValue.value,
								widgetType : 'custom',
								widgetId : 0,
								datacenterId : 0,
								datacenterWidgetId : 0,
								template : '',
								rotateLabel : $scope.rLable,
								chartSummary : $scope.chartSummary,
								custFileRealPath : $scope.custFileRealPath,
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
								customWidgetType : 'Graph',
								menuId : menuId
							};

							console.log("dataObj", dataObj);

							var widgetResponse = customwidgetService.postCustomWidgetDetails(dataObj);

							widgetResponse
									.then(
											function(data) {
												if (data.data === 'success') {
													$('#successWidgetModal')
															.modal('show');
													$scope.chartType = 'lineChart';
													$scope.aggregation = '';
													$scope.yAggregation = 'sum';
													$scope.yAxisLabel = '';
													$scope.xAxisLabel = '';
													$scope.csverror = false;
													$scope.filePath = '';
													$('#xColumn').empty();
													$scope.sourceURL = '';
													$scope.sourceURL_UserName = '';
													$scope.sourceURL_Password = '';
													$scope.dataSet = null;
													completeData = null;
													$scope.showChart = false;
													$scope.showChartGauge = false;
													$("#selAggr").hide();
													$("#selAggrVal").hide();
													$("#selAggrVal").val('');
													dataSetMain = null;
													// $('#dchart').empty();
													// $('#gChart').empty();
													$scope.xAxis = '';
													$scope.yAxis = '';

													$('#xColumn')
															.append(
																	'<option value="">Select X-Axis... </option>');
													$('#yColumn').empty();
													$('#yColumn')
															.append(
																	'<option value="">Select Y-Axis... </option>');
													$('#sheets').empty();
													$('#sheets')
															.append(
																	'<option value="">Select Sheets... </option>');

													$('#gColumn')
															.append(
																	'<option value="">Select column... </option>');
													$('#gColumn').empty();
													$('#groupBy')
															.append(
																	'<option value="">Select groupby.. </option>');
													$('#groupBy1').empty();
													$('#groupBy1')
															.append(
																	'<option value="">Select groupby1.. </option>');
													$('#groupBy2').empty();
													$('#groupBy2')
															.append(
																	'<option value="">Select groupby2.. </option>');
													$('#groupBy').empty();

													$("#TextBoxesGroup").html(
															'');
													if (groupIndex != 2) {

														for (var i = groupIndex; i >= 2; i--) {

															groupIndex--;
															$scope.items
																	.splice(i,
																			1);
															$scope.colorsArray = [
																	"#49b7e4",
																	"#b4d042",
																	"#ef7f28",
																	"#2f4455",
																	"#acc2c0",
																	"#fdd962",
																	"#65c7c8",
																	"#c2af2f",
																	"#006a9c",
																	"#9ca6b2" ];

															colorsarraydesign(
																	$scope.colorsArray,
																	'', '', '');
														}
													}

													groupIndex = 2;
													$('#trndline').prop(
															'checked', false);
													$scope.trendLineShow = false;

													for (var i = counter; i > 1; i--) {
														$("#TextBoxDiv" + i)
																.remove();
													}
													$('#color1').val('#49b7e4');
													$('#cPicker1').colorpicker(
															'setValue',
															'#49b7e4');
													$scope.groupBy = '';
													$scope.groupBy1 = '';
													$scope.groupBy2 = '';
													$scope.widgetName = '';
													$scope.gAggregation = '';
													$scope.gaugeColumn = '';
													$scope.gaugeType = '';
													$scope.rLable = false;
													$scope.showLabels = false;
													$scope.jsonData = null;
													$scope.filePath = "No File Choosen";
													$scope.chartSummary = '';
													$scope.custFileRealPath = '';
													$scope.sheetName = '';
													$scope.colorsArray = [];
													$scope.legendPos = "Top Left"
													$('#yColumn').prop(
															'disabled', false);
													$('#myWidgetModal').modal(
															'hide');
													$('#panel').hide();
												} else {
													$scope.msg = 'exists';
												}

											},
											function(errorPayload) {

												$scope.message = "Internal Server Error";
											});
						}
					}

					$scope.myWidgetModalShow = function() {

						var validate = validateChart();

						if (validate == true) {
							//$('#menus').multiselect('destroy');
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

									for (var i = 1; i <= groupIndex; i++) {
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
										}
									}
								}
							}
							$scope.allMenus = '';
							$scope.allMenus = $sessionStorage.menuList;				
							
							var menuList = [];
							for (m in $scope.allMenus) {
								var menus = $scope.allMenus[m];
								
								if(menus.projectId == $sessionStorage.projectId){
									var menuObj = {
											'menuName' : menus.menuName,
											'menuId' : menus.menuId										
										}
									menuList.push(menuObj);	
								}								
							}
							$scope.menusList = menuList;
							
							if (modalshow == true) {
								$scope.msg = '';
								$scope.widgetName = '';
								$('#myWidgetModal').modal('show');
							}
							
							/*$timeout(function() {
								$('#menus').multiselect({
									buttonWidth : '400px',
									includeSelectAllOption : true,
									enableCollapsibleOptGroups : true,
									enableClickableOptGroups : true
								});
							}, 100);*/
						}

					}

					$scope.add2Dashboard = function() {

						if ($scope.widgetName !== '') {
							if ($scope.chartType === "stackedChart"
									|| $scope.chartType === "stackedSingleClustered") {
							} else {
								$scope.groupBy = '';
							}

							if ($scope.filePath !== ''
									|| $scope.filePath !== 'No File Choosen') {
								var dataObj1 = {
									name : $scope.filePath,
									data : $scope.jsonData
								};

								customwidgetService.uploadCustomFile(dataObj1)
										.then(function(data1) {
											$scope.saveTODB(data1.data);
										});
							} else {
								$scope.saveTODB('');
							}
						} else {
							$scope.msg = 'errormsg';
						}
					}

					$('input:radio[name="ipsrcType"]')
							.on(
									'click',
									function() {
										$scope.csverror = false;
										$scope.filePath = '';
										$('#xColumn').empty();
										$scope.sourceURL = '';
										$scope.sourceURL_UserName = '';
										$scope.sourceURL_Password = '';
										// $scope.xAxis = '';
										// $scope.yAxis = '';
										$scope.loadLabel = '';
										$scope.xAxisLabel = '';
										$scope.yAxisLabel = '';
										$scope.chartSummary = '';
										$scope.custFileRealPath = '';
										$scope.sheetName = '';
										$scope.dataSet = null;
										completeData = null;
										dataSetMain = null;
										$scope.showChart = false;
										$scope.showChartGauge = false;
										$("#selAggr").hide();
										$("#selAggrVal").hide();
										$("#selAggrVal").val('');

										// $('#dchart').empty();
										// $('#gChart').empty();
										$scope.xAxis = '';
										$('#xColumn').empty();
										$('#xColumn')
												.append(
														'<option value="0">Select X-Axis... </option>');

										$('#yColumn').empty();
										$('#yColumn')
												.append(
														'<option value="0">Select Y-Axis... </option>');
										$('#sheets').empty();
										$('#sheets')
												.append(
														'<option value="0">Select Sheets... </option>');

										$('#gColumn')
												.append(
														'<option value="0">Select column... </option>');
										$('#gColumn').empty();
										$('#groupBy')
												.append(
														'<option value="0">Select groupby.. </option>');
										$('#groupBy1').empty();
										$('#groupBy1')
												.append(
														'<option value="0">Select groupby1.. </option>');
										$('#groupBy2').empty();
										$('#groupBy2')
												.append(
														'<option value="0">Select groupby2.. </option>');
										$('#groupBy').empty();
										$("#TextBoxesGroup").html('');
										if (groupIndex != 2) {

											for (var i = groupIndex; i >= 2; i--) {

												groupIndex--;
												$scope.items.splice(i, 1);
												$scope.colorsArray = [
														"#49b7e4", "#b4d042",
														"#ef7f28", "#2f4455",
														"#acc2c0", "#fdd962",
														"#65c7c8", "#c2af2f",
														"#006a9c", "#9ca6b2" ];

												colorsarraydesign(
														$scope.colorsArray, '',
														'', '');
											}
										}

										groupIndex = 2;
										$('#trndline').prop('checked', false);
										$scope.trendLineShow = false;
										$(".add-more").attr('disabled', true);
									});

					$('input:radio[name="standard"]')
							.on(
									'click',
									function() {
										$scope.filePath = '';
										$scope.loadLabel = '';
										$('#xColumn').empty();
										$('#xColumn')
												.append(
														'<option value="">Select X-Axis... </option>');
										$('#yColumn').empty();
										$('#yColumn')
												.append(
														'<option value="">Select Y-Axis... </option>');
										$('#sheets').empty();
										$('#sheets')
												.append(
														'<option value="">Select Sheets... </option>');
									});

					$('input[id="csv_file"]').on('change', function(e) {

						var file = $("#csv_file")[0].files[0];
						$scope.csvName = file;
						$scope.fullFile = new FormData();
						$scope.fullFile.append('file', file);

						upload(e);
					});

					$('input[id="csv_file"]').on('click', function() {
						this.value = null;
					});

					$('input[id="excel_file"]').on('change', function(e) {

						uploadExcel(e);
					});

					$('input[id="excel_file"]').on('click', function() {
						this.value = null;
					});

					$('select[id="sheets"]').on('change', function(e) {
						getSheetData(e);
					});

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
										$scope.gaugeAggrValue = doodahService
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
										$scope.gaugeAggrValue = doodahService
												.showGaugeAggrValue(
														dataSetMain,
														gaugeGroup, gAggrFunc);
									});

					function getSheetData(e) {
						var selSheet = $("#sheets option:selected").val();
						var XL_row_object = XLSX.utils
								.sheet_to_row_object_array(workbook.Sheets[selSheet]);

						buildCharts('', XL_row_object);
					}

					function browserSupportFileUpload() {
						var isCompatible = false;
						if (window.File && window.FileReader && window.FileList
								&& window.Blob) {
							isCompatible = true;
						}
						return isCompatible;
					}

					function uploadExcel(evt) {

						if (!browserSupportFileUpload()) {
							alert('The File APIs are not fully supported in this browser!');
						} else {
							var data = null;
							var file = evt.target.files[0];
							$scope.xAxisLabel = '';
							$scope.yAxisLabel = '';
							$scope.filePath = file.name;
							$scope.sourceURL = '';
							$scope.$digest();
							var reader = new FileReader();
							reader.readAsBinaryString(file);
							reader.onload = function(event) {
								data = event.target.result;
								try {
									$scope.csverror = false;
									$('#csverror').html('');

									workbook = XLSX.read(data, {
										type : 'binary'
									});
									var sheets = [];
									workbook.SheetNames.forEach(function(
											sheetName) {
										sheets.push(sheetName);
									});

									if (sheets.length > 0) {

										$('#sheets').empty();
										$('#sheets')
												.append(
														'<option value="">Select a sheet... </option>');
										var options = '';
										for ( var s in sheets) {
											if (sheets.hasOwnProperty(s)) {
												options += '<option value="'
														+ sheets[s] + '">'
														+ sheets[s]
														+ '</option>';
											}
										}
										$('#sheets').append(options);
									}
								} catch (e) {
									$('#sheets').empty();
									$('#sheets')
											.append(
													'<option value="">Select a sheet... </option>');
									$('#xColumn').empty();
									$('#xColumn')
											.append(
													'<option value="">Select X-Axis... </option>');
									$('#yColumn').empty();
									$('#yColumn')
											.append(
													'<option value="">Select Y-Axis... </option>');
									$scope.csverror = true;
									$('#csverror').html('');
									$('#csverror')
											.append(
													"Please upload appropriate Excel file");
									$scope.$digest();
								}
							};
							reader.onerror = function() {

							};
						}
					}

					// Method that reads and processes the selected file
					function upload(evt) {
						if (!browserSupportFileUpload()) {
							alert('The File APIs are not fully supported in this browser!');
						} else {
							var data = null;
							var file = evt.target.files[0];
							$scope.filePath = file.name;
							$scope.sourceURL = '';
							$scope.xAxisLabel = '';
							$scope.yAxisLabel = '';
							$scope.$digest();
							var reader = new FileReader();
							reader.readAsText(file);
							reader.onload = function(event) {
								var csvData = event.target.result;
								try {
									$scope.csverror = false;
									$('#csverror').html('');
									data = $.csv.toObjects(csvData);
									if (data && data.length > 0) {
										buildCharts('', data);

									}
								} catch (e) {
									$('#xColumn').empty();
									$('#xColumn')
											.append(
													'<option value="">Select X-Axis... </option>');
									$('#yColumn').empty();
									$('#yColumn')
											.append(
													'<option value="">Select Y-Axis... </option>');
									$scope.csverror = true;
									$('#csverror').html('');
									$('#csverror')
											.append(
													"Please upload appropriate CSV file");
									$scope.$digest();
								}

							};
							reader.onerror = function() {

							};
						}
					}

					$scope.showValueLabels = function() {
						if ($scope.showLabels) {
							chart.renderLabel(true);
						} else {
							chart.renderLabel(false);
						}
						$scope.showRotateLabels();
					}

					$scope.showRotateLabels = function() {
						if ($('input:checkbox[name="rotateLabels"]').is(
								':checked')) {
							chart.render();
							chart.renderlet(function(chart) {
								// rotate x-axis labels
								chart.selectAll("g.x text").attr('dx', '-30')
										.attr('dy', '0').attr('transform',
												"rotate(-55)");
							});

						} else {
							chart.render();
							chart.renderlet(function(chart) {
								// rotate x-axis labels
								chart.selectAll("g.x text").attr('dx', '0')
										.attr('dy', '10').attr('transform',
												"rotate(0)");
							});
						}
					}

					// /========================= Filters code:
					// ===================================

					$("#doodahId").on('click', '.grid thead th', function(e) {
						showFilterOption(this);
					});

					var arrayMap = [];

					function showFilterOption(tdObject) {
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

						var $rows = $(tdObject).parents("table").find(
								"tbody tr");

						var headLabel = $(tdObject).contents().filter(
								function() {
									return this.nodeType == 3;
								}).text();

						var uniques = [];
						$rows
								.each(function(ind, ele) {
									var currentTd = $(ele).children()[$(
											tdObject).attr("index")];

									if ($.inArray(currentTd.innerHTML, uniques) === -1) {
										uniques.push(currentTd.innerHTML);

										var div = document.createElement("div");
										div.classList.add("grid-item");

										var str = $(ele).is(":visible") ? 'checked'
												: '';

										if ($(ele).is(":hidden")) {
											allSelected = false;
										}

										div.innerHTML = '<input type="checkbox" name="'
												+ headLabel
												+ '" value="'
												+ currentTd.innerHTML
												+ '" '
												+ str
												+ '>'
												+ currentTd.innerHTML;
										filterGrid.append(div);

									}
									arrayMap[index] = ele;
									index++;

								});

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
									// rotateLabelAndShowValue($scope.rLable,
									// $scope.showLabels)
									var selectedKey = '';
									var selectedValues = [];
									filterGrid
											.find(".grid-item")
											.each(
													function(ind, ele) {
														cellValue = $(ele)
																.find("input")
																.val();
														cellName = $(ele).find(
																"input").attr(
																"name");

														if ($(ele)
																.find("input")
																.is(":checked")) {
															selectedValues
																	.push(cellValue);
															selectedKey = cellName;
															var tr = $(
																	"#graphData")
																	.find(
																			"[data-val='"
																					+ $(
																							tdObject)
																							.attr(
																									"index")
																					+ '_'
																					+ cellValue
																					+ "']")
																	.parent();
															tr.show();
														} else {
															var tr = $(
																	"#graphData")
																	.find(
																			"[data-val='"
																					+ $(
																							tdObject)
																							.attr(
																									"index")
																					+ '_'
																					+ cellValue
																					+ "']")
																	.parent();
															tr.hide();
														}

													});

									if (!dataSetChanged) {
										dataSetOriginal = dataSetMain;
										dataSetChanged = true;
										$scope.dataSetFiltered = doodahService
												.getJSONByKeyAndVals(
														dataSetOriginal,
														selectedKey,
														selectedValues);
									} else {
										$scope.dataSetFiltered = doodahService
												.getJSONByKeyAndVals(
														dataSetOriginal,
														selectedKey,
														selectedValues);

									}

									filterGrid.hide();
									var jsonData = doodahService
											.tableToJson('#graphData');
									dataSetMain = jsonData;
									$scope.drawChart('byFilter');

									if ($('input:checkbox[name="rotateLabels"]')
											.is(':checked')) {
										chart.selectAll("g.x text").attr('dx',
												'-30').attr('dy', '0').attr(
												'transform', "rotate(-55)");
									} else {
										chart.selectAll("g.x text").attr('dx',
												'0').attr('dy', '10').attr(
												'transform', "rotate(0)");
									}
									$('#filterModel').modal('hide');
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

					function buildHtmlTable(myList, container) {
						$(container).html('');
						var columns = addAllColumnHeaders(myList, container);

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
						}
					}
					function addAllColumnHeaders(myList, container) {
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
													'<th index="'
															+ j
															+ '"><i class="fa fa-filter" aria-hidden="true"></i></th>')
													.append(
															$('<div class="filter" align="left" style="display: none;"></div>'))
													.prepend(key));
									j++;
								}
							}
						}
						$(tHead$).append(headerTr$);
						$(container).append(tHead$);

						return columnSet;
					}

					$(window).resize(function() {
						chart.redraw();
					});

					function validateChart() {

						if ($scope.sourceType == 'standard') {
							if ($scope.addparam == '') {
								$('#errortext').html('');
								$('#errortext').append(
										"Please provide Additional Params");
								flag = false;
							}
						}
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
								// $('#xColumn').css("borderColor", "red");
								$('#errortext').html('');
								$('#errortext').append("Please select X-Axis");
								flag = false;
							} else if ($scope.aggregation == ''
									&& $scope.yAxis == '') {
								// $('#yColumn').css("borderColor", "red");
								$('#errortext').html('');
								$('#errortext').append("Please select Y-Axis");
								flag = false;
							}

							if (flag == true)
								if ($scope.yAxis != '') {

									for ( var key in completeData) {
										var item = completeData[key][$scope.yAxis];

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

						} else if ($scope.chartType == 'stackedChart'
								|| $scope.chartType == 'stackedSingleClustered') {

							if ($scope.xAxis == '') {
								$('#errortext').html('');
								$('#errortext').append("Please select X-Axis");
								flag = false;
							} else if ($scope.aggregation != 'count'
									&& $scope.yAxis == '') {
								$('#errortext').html('');
								$('#errortext').append("Please select Y-Axis");
								flag = false;
							} else if ($scope.groupBy === '') {
								$('#errortext').html('');
								$('#errortext').append("Please select groupBy");
								flag = false;
							}

							if (flag == true) {

								if ($scope.yAxis != '') {
									for ( var key in completeData) {
										var item = completeData[key][$scope.yAxis];

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
							if ($scope.gaugeColumn == '') {
								$('#errortext').html('');
								$('#errortext').append(
										"Please Select Gauge Column");
								flag = false;
							} else if ($scope.maxValue.value == '') {
								$('#errortext').html('');
								$('#errortext').append("Please give Max Value");
								flag = false;
							} else if (isNaN($scope.gaugeAggrValue)
									|| $scope.gaugeAggrValue == '') {

								$('#errortext').html('');
								$('#errortext')
										.append(
												"Cannot Plot Chart with selected Aggregation");
								flag = false;
							}
						}

						if ($scope.chartType == 'ganttChart') {
							flag = true;
							return flag;
						}
						console.log("flag---", flag);
						return flag;
					}

					$scope.toGetColors = function(key) {
						$scope.xAxisLabel = $scope.xAxis;

						$(".add-more").attr('disabled', false);

						getColorArrayAndCountByhartType('onchange',
								completeData, key, key);
					}

					$scope.onyaxischange = function() {
						$scope.yAxisLabel = $scope.yAxis;
					}

					$scope.changeChartType = function() {

						if ($scope.chartType == "stackedMultiChart"
								|| $scope.chartType == "stackedMultiClustered"
								|| $scope.chartType == "stackedLineMultiChart"
								|| $scope.chartType == "stackedAreaMultiChart") {
							$(".group1").show();
						} else {
							$(".group1").hide();
						}

						$("#addBtn").addClass("disabled");
						chartTypeOnload();
						getColorArrayAndCountByhartType('onchange',
								completeData, $scope.xAxis, $scope.groupBy);
						$scope.trendlineOnchange();
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
							$scope.colorsArray = getColorsArray(widgetInfo.colorsArray);
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

						} else if ($scope.chartType == "stackedChart"
								|| $scope.chartType == "stackedSingleClustered") {

							var uniquedata = commonService.getColorsCount(data,
									groupbykey);

							var array = [];
							for ( var key in uniquedata) {
								array.push(uniquedata[key].key);
							}
							counter = array.sort();

						} else if ($scope.chartType == "stackedMultiChart"
								|| $scope.chartType == "stackedMultiClustered"
								|| $scope.chartType == "stackedLineMultiChart"
								|| $scope.chartType == "stackedAreaMultiChart") {

							console.log(" groupIndex--", groupIndex);

							var array = [];
							for (var i = 1; i <= groupIndex; i++) {
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

					$scope.googleSheets = function() {

						var sheetId;
						var CLIENT_ID = '830611348665-ijnvs5kovpvukkuta26uq7oo2sff6qnr.apps.googleusercontent.com';
						var DISCOVERY_DOCS = [ "https://sheets.googleapis.com/$discovery/rest?version=v4" ];
						var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
						var authorizeButton = document
								.getElementById('authorize-button');
						var signoutButton = document
								.getElementById('signout-button');

						$("#handleButton").click(function() {
							handleClientLoad();
						});

						$("#getSheetData")
								.click(
										function() {
											var sheetName = $(
													"#sheetName option:selected")
													.val();
											$scope.sheetName = sheetName;
											$scope.sheetId = sheetId;
											getGoogleSheetData(sheetId,
													sheetName);
										});

						function handleClientLoad() {
							gapi.load('client:auth2', initClient);
						}

						function initClient() {

							gapi.client
									.init({
										discoveryDocs : DISCOVERY_DOCS,
										clientId : CLIENT_ID,
										scope : SCOPES
									})
									.then(
											function() {

												gapi.auth2.getAuthInstance().isSignedIn
														.listen(updateSigninStatus);
												updateSigninStatus(gapi.auth2
														.getAuthInstance().isSignedIn
														.get());
												authorizeButton.onclick = handleAuthClick;
												signoutButton.onclick = handleSignoutClick;
											});
						}

						function updateSigninStatus(isSignedIn) {
							if (isSignedIn) {
								authorizeButton.style.display = 'none';
								signoutButton.style.display = 'block';
								doodahService.listSheets();
							} else {
								authorizeButton.style.display = 'block';
								signoutButton.style.display = 'none';
							}
						}
						function handleAuthClick(event) {
							gapi.auth2.getAuthInstance().signIn();
						}
						function handleSignoutClick(event) {
							var auth2 = gapi.auth2.getAuthInstance();
							auth2.signOut().then(function() {
								auth2.disconnect();
								authorizeButton.style.display = 'block';
								signoutButton.style.display = 'none';
							});
						}

						function getGoogleSheetData(sheetId, sheetName) {

							var sheetURL = $('#sheetURL').val();
							var matches = sheetURL.match(/([0-9a-zA-Z_\-]+)/g);
							sheetId = matches[6];

							gapi.client.sheets.spreadsheets.values
									.get({
										spreadsheetId : sheetId,
										range : sheetName,
									})
									.then(
											function(response) {
												var range = response.result;
												if (range.values.length > 0) {
													var keys = range.values[0];
													range.values.shift();
													var jsonData = [];
													for (i = 0; i < range.values.length; i++) {
														var row = range.values[i];
														var output = (i + 1)
																+ '. ';
														var dataItem = {};
														for (j = 0; j < row.length; j++) {
															output += keys[j]
																	+ ': '
																	+ row[j]
																	+ ', ';
															dataItem[keys[j]] = row[j];
														}
														jsonData.push(dataItem);
													}
												} else {
												}
												buildCharts('', jsonData);
												$scope.jsonData = JSON
														.stringify(jsonData);
											}, function(response) {
											});
						}

						$('#popupBoxClose').click(function() {
							unloadPopupBox();
						});

						function unloadPopupBox() {
							$('#popup_box').fadeOut("Slow");
						}
						function loadPopupBox() {
							$('#popup_box').fadeIn("Slow");
						}

					}

					// Multiple Groups for stacked charts

					$scope.add = function() {

						if (completeData != null) {
							console.log(" $scope.items", $scope.items);
							if ($scope.items.length + 2 < 6) {
								$scope.items.push($scope.items.length + 2);

								console.log(" $scope.items.length",
										$scope.items.length);

								console.log(" $scope.items if ", $scope.items);

								$timeout(
										function() {
											$(
													'#groupbymulti'
															+ ($scope.items.length + 2))
													.empty();
											$(
													'#groupbymulti'
															+ ($scope.items.length + 2))
													.append(options);
										}, 100);

								$scope.colorsArray = [ "#49b7e4", "#b4d042",
										"#ef7f28", "#2f4455", "#acc2c0",
										"#fdd962", "#65c7c8", "#c2af2f",
										"#006a9c", "#9ca6b2" ];
								$timeout(function() {

									colorsarraydesign($scope.colorsArray, '',
											'', '');

								}, 100);
								groupIndex++;
							}
						}
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

					$scope.trendlineOnchange = function() {

						console.log("checked-------"
								+ $("#trndline").is(':checked'));

						if ($("#trndline").is(':checked'))
							$scope.trendLineShow = true; // checked
						else
							$scope.trendLineShow = false;
					}

					$scope.trendlineOnchange();

					$scope.trendLineByIndex = function(index, value) {

						console.log("index", index);
						console.log("value", value);

					}

				});
