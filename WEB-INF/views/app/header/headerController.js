mainApp
		.controller(
				'headerController',
				function($scope, $location, $sessionStorage, $state,
						$rootScope, loginService, $interval, widgetService,
						customwidgetService, $stateParams, $timeout, $compile,
						$uibModal) {

					if ($stateParams.dashboardName == 99999
							&& $sessionStorage.currentMenuId) {
						$stateParams.dashboardName = $sessionStorage.currentMenuId;
					}

					$('.bodyback').removeClass('modal-open');
					$('.modal-backdrop').hide();

					if ($sessionStorage.username == undefined) {
						$state.go('landing');
					}

					$scope.username = $sessionStorage.username;
					$scope.fullusername = $sessionStorage.username;
					$scope.firstName = $sessionStorage.firstName

					/*
					 * validating user whether login or not. if not login then
					 * goes to landing page
					 */

					$scope.validation = function() {

						if ($sessionStorage.username == undefined
								&& $sessionStorage.UserWidgetsInfo == undefined) {
							$state.go('landing');
						} else {
							$scope.setOptionsToHeader();
						}
					}

					/*
					 * if the login user is valid, then setting required
					 * options(domain,projects,themes,landing theme etc..) to
					 * the header
					 */
					$scope.setOptionsToHeader = function() {

						$('.bodyback').removeClass('modal-open');
						$('.modal-backdrop').hide();

						$scope.username = $sessionStorage.username;
						$scope.fullusername = $sessionStorage.username;
						if ($sessionStorage.username
								&& $sessionStorage.username.toString().length > 5) {
							$scope.username = $sessionStorage.username
									.toString().substring(0, 4)
									+ '..';
						}
						$scope.buName = $sessionStorage.buName;
						$scope.selectedProj = String($sessionStorage.projectId);
						$scope.projects = $sessionStorage.projectsList;
						$scope.domainName = $sessionStorage.domainName;
						$scope.loginTime = $sessionStorage.loginTime;
						$scope.themeName = $sessionStorage.landTheme;

						$rootScope.menus = $sessionStorage.menuList;
						var leftSideMenu = [];
						var rightSideMenu = [];

						for (m in $rootScope.menus) {
							var menus = $rootScope.menus[m];

							if ($sessionStorage.projectId == menus.projectId) {
								if (menus.menuSide == 'left') {
									var leftObj = {
										'menuName' : menus.menuName,
										'menuId' : menus.menuId,
										'menuLink' : menus.menuLink,
										'menuIcon' : menus.menuIcon,
										'menuOrder' : menus.menuOrder
									}
									leftSideMenu.push(leftObj);
								} else {
									var rightObj = {
										'menuName' : menus.menuName,
										'menuId' : menus.menuId,
										'menuLink' : menus.menuLink,
										'menuIcon' : menus.menuIcon,
										'menuOrder' : menus.menuOrder
									}
									rightSideMenu.push(rightObj);
								}
							}

						}

						if (rightSideMenu.length == 0) {

							$("#wrapper.active").css({
								"padding-left" : "8.33333333%",
								"padding-right" : "0%",
							})
						} else if (leftSideMenu.length == 0) {
							console.log("else--");
							$("#wrapper.active").css({
								"padding-right" : "8.33333333%",
								"padding-left" : "0%",
							})
						} else {
							$("#wrapper.active").css({
								"padding-right" : "8.33333333%",
								"padding-left" : "8.33333333%",
							})
						}

						$rootScope.leftMenu = leftSideMenu;
						$rootScope.rightMenu = rightSideMenu;
						$rootScope.leftMenu.sort(function(a, b) {
							return parseFloat(a.menuOrder)
									- parseFloat(b.menuOrder);
						});
						$rootScope.rightMenu.sort(function(a, b) {
							return parseFloat(a.menuOrder)
									- parseFloat(b.menuOrder);
						});
						$timeout(function() {
							if ($('.menu_active').length == 0) {
								$("#sidebar li:nth-child(2)").addClass(
										"menu_active");
							}
						});

						if ($sessionStorage.landTheme === 'black') {
							$rootScope.stylePath = 'style_blacktheme.css';
						} else if ($sessionStorage.landTheme === 'white') {
							$rootScope.stylePath = 'style_whitetheme.css';
						} else {
							$rootScope.stylePath = 'style.css';
						}

						var plist = {};
						$scope.pumList = {};
						for ( var key in $scope.projects) {
							var pid = $scope.projects[key].id;
							var pname = $scope.projects[key].name;

							plist[pid] = pname;
							$scope.pumList[pid] = $scope.projects[key];
						}

						for ( var key in $scope.menus) {
							var mname = $scope.menus[key].menuName;
						}

						$scope.plist = plist;

						$rootScope.widgetList = [];
						$scope.showWidget = '';
						$scope.userImg = '';
						$sessionStorage.randomNumberForProfileImg = parseInt(
								(Math.random() * 10000), 10);

						$scope.username = $scope.username.substr(0, 1)
								.toUpperCase()
								+ $scope.username.substr(1);
						if ($sessionStorage.userData === 'No') {
							$scope.userImg = 'devops/rest/uimg/'
									+ $sessionStorage.userId + '?t='
									+ $sessionStorage.randomNumberForProfileImg;
						} else {
							$scope.userImg = 'devops/rest/uimg/'
									+ $sessionStorage.userId + '?t='
									+ $sessionStorage.randomNumberForProfileImg;
						}

						$scope.activeMenu = '';
						/*$scope.isActiveMenu = function(route) {
							return route === $location.path();
						};*/
					}

					/* calling validation method when page loading */
					$scope.validation();

					/* used to get profile pic */
					$scope
							.$watch(
									function() {
										return $sessionStorage.randomNumberForProfileImg
									},
									function(newValue, oldValue) {
										if (newValue !== oldValue) {
											$scope.userImg = 'devops/rest/uimg/'
													+ $sessionStorage.userId
													+ '?t='
													+ $sessionStorage.randomNumberForProfileImg;
										}
									});

					/* used to logout from the account */
					$scope.logout = function() {
						$sessionStorage.$reset();
						$state.go('landing');
					}

					/*
					 * used to get the project details based on the project
					 * selection
					 */
					$scope.projChange = function() {

						$scope.dpid = $scope.selectedProj;
						$sessionStorage.dpObj = $scope.pumList[$scope.selectedProj];
						$sessionStorage.pumid = $scope.pumList[$scope.selectedProj].pumid;
						$sessionStorage.projectName = $scope.pumList[$scope.selectedProj].name;
						$sessionStorage.projectId = $scope.pumList[$scope.selectedProj].id;
						$sessionStorage.landPage = $scope.pumList[$scope.selectedProj].landPage;
						$sessionStorage.landTheme = $scope.pumList[$scope.selectedProj].landTheme;
						for ( var menu in $sessionStorage.menuList) {
							if ($sessionStorage.menuList[menu].projectId == $scope.selectedProj) {
								$stateParams.dashboardName = $sessionStorage.menuList[menu].defaultMenu;
								$sessionStorage.currentMenuId = $sessionStorage.menuList[menu].defaultMenu;
							}
						}
						if ($state.current.name == 'home'
								|| $state.current.name == 'reports'
								|| $state.current.name == 'over'
								|| $state.current.name == 'profile') {
							var loginRes = loginService.postLogin(
									$scope.selectedProj,
									$scope.pumList[$scope.selectedProj].pumid);

							loginRes
									.then(
											function(payload) {
												$('#errorProject')
														.modal('hide');
												if (payload.data === ""
														|| payload.data.length === 0) {
													$rootScope.projectImg = 'devops/rest/pimg/'
															+ $scope.selectedProj;

													$sessionStorage.userData = "No";
													//													
													$state.go('home');
													$rootScope
															.reLoadCurrentState();
												} else if (payload.data[0].errorStatus == "Yes") {
													$scope.errorMessage = payload.data[0].errorMessage;
													$('#errorProject').modal(
															'show');

													$scope.domainName = payload.data[0].domainName;
												} else {
													$('#errorProject').modal(
															'hide');

													$sessionStorage.domainName = payload.data[0].domainName;
													$scope.domainName = $sessionStorage.domainName;
													console
															.log(
																	"domain func: ",
																	$sessionStorage.domainName);
													if (payload.data === ""
															|| payload.data.length === 0) {
														$rootScope.projectImg = 'devops/rest/pimg/'
																+ $scope.selectedProj;

														$sessionStorage.userData = "No";
														//													
														$state.go('home');
													} else {
														$sessionStorage.userData = "Yes";
														$scope.message = "";
														$sessionStorage.UserWidgetsInfo = payload.data;
														$sessionStorage.domainName = payload.data[0].domainName;
														$scope.domainName = $sessionStorage.domainName;
														$rootScope.projectImg = 'devops/rest/pimg/'
																+ $scope.selectedProj;

														//														

													}

													$rootScope
															.reLoadCurrentState();
												}
											},
											function(errorPayload) {

												$scope.message = "Internal Server Error";
											});
						} else if ($state.current.name == 'Mydashboard') {
							console.log("loginres-==267-=--=", loginRes);
							$rootScope.reLoadCurrentState();
							var loginRes = loginService.postLogin(
									$scope.selectedProj,
									$scope.pumList[$scope.selectedProj].pumid);
							loginRes
									.then(function(payload) {
										$sessionStorage.userData = "Yes";
										$scope.message = "";
										$sessionStorage.UserWidgetsInfo = payload.data;
										$sessionStorage.domainName = payload.data[0].domainName;
										$scope.domainName = $sessionStorage.domainName;
										$rootScope.projectImg = 'devops/rest/pimg/'
												+ $scope.selectedProj;
									});
						}

					}

					/* update theme */
					$scope.updateCSS = function() {

						$rootScope.stylePath = $scope.selectedStyle + '.css';
					}

					$scope.goFullScreen = function() {

						var docElement, request;

						docElement = document.documentElement;
						request = docElement.requestFullScreen
								|| docElement.webkitRequestFullScreen
								|| docElement.mozRequestFullScreen
								|| docElement.cancelFullScreen
								|| docElement.webkitCancelFullScreen
								|| docElement.mozCancelFullScreen;

						if (typeof request != "undefined" && request) {
							request.call(docElement);
						}
					}

					$scope.updateLeftMenu = function() {

						var left = $(".menu").css("left");
						var main = $("#main").css("margin-left");

						if (left === '0px') {
							$(".menu").css({
								"left" : "-220px"
							});
							$("#main").css({
								"margin-left" : "0px"
							});
						} else {
							$(".menu").css({
								"left" : "0px"
							});
							$("#main").css({
								"margin-left" : "220px"
							});
						}

					}

					/* used to get the theme based on the theme selection */
					$scope.themeChange = function() {

						$sessionStorage.landTheme = $scope.themeName;

						if ($sessionStorage.landTheme === 'black') {
							$rootScope.stylePath = 'style_blacktheme.css';
						} else if ($sessionStorage.landTheme === 'white') {
							$rootScope.stylePath = 'style_whitetheme.css';
						} else {
							$rootScope.stylePath = 'style.css';
						}

					}

					/* load the page by using current state */
					$rootScope.reLoadCurrentState = function() {
						$rootScope.slideOnclick();
						$state.transitionTo($state.current, $stateParams, {
							reload : true,
							inherit : false,
							notify : true
						});
					}

					$rootScope.startSlideShow = function(size, parentSelector) {
						if (!($state.current.name == 'Mydashboard' || $state.current.name == 'home')) {
							return;
						}
						$scope.goFullScreen();

						$timeout(
								function() {
									$scope.myInterval = 3000;
									$scope.noWrapSlides = false;
									$scope.active = 1;
									$scope.items = [];

									$scope.animationsEnabled = true;
									$scope.showModal = function(size,
											parentSelector) {
										var parentElem = parentSelector ? angular
												.element($document[0]
														.querySelector('.modal-demo '
																+ parentSelector))
												: undefined;
										// var mScope = $scope.$new(true);
										var modalInstance = $uibModal
												.open({
													animation : $scope.animationsEnabled,
													ariaLabelledBy : 'modal-title',
													ariaDescribedBy : 'modal-body',
													templateUrl : 'myModalContent.html',
													controller : 'ModalInstanceCtrl',
													windowClass : 'myModalContent',
													size : 'lg',
													appendTo : parentElem,
													resolve : {
														items : function() {
															return $scope.items;
														}
													}
												});

										modalInstance.result
												.then(
														function(selectedItem) {
															$scope.selected = selectedItem;
														},
														function() {
															if (document.cancelFullScreen) {
																document
																		.cancelFullScreen();
															} else if (document.mozCancelFullScreen) {
																document
																		.mozCancelFullScreen();
															} else if (document.webkitCancelFullScreen) {
																document
																		.webkitCancelFullScreen();
															} else if (document.exitFullscreen) {
																document
																		.exitFullscreen();
															} else {
																var wscript = new ActiveXObject(
																		"WScript.Shell");
																if (wscript !== null) {
																	wscript
																			.SendKeys("{F11}");
																}
															}

															console
																	.log('Modal dismissed at: '
																			+ new Date());
														});
									}();
								}, 700);
					}

					$rootScope.showDefultMenu = function() {

						$rootScope.slideOnclick();

						for ( var menu in $sessionStorage.menuList) {
							if ($sessionStorage.menuList[menu].projectId == $sessionStorage.projectId) {
								$stateParams.dashboardName = $sessionStorage.menuList[menu].defaultMenu;
								$sessionStorage.currentMenuLink = $sessionStorage.menuList[menu].defaultMenuName;
							}
						}
						$sessionStorage.currentMenuId = $stateParams.dashboardName;
						$state.get('home').data.displayName = $sessionStorage.currentMenuLink;

						$state.transitionTo('home', {
							dashboardName : $stateParams.dashboardName
						}, {
							reload : true,
							inherit : false,
							notify : true
						});

					}

					$rootScope.showDownloadOptions = function() {

						$scope.boardType = false;
						$scope.widgets = false;
						$scope.formatsHome = false;
						// if ($state.current.name == "home") {
						/**/

						$("#downloadmodal").modal('show');

						$("#mdbWidgetOrder li").remove();

						$scope.getWidgets();

					}

					$rootScope.getWidgets = function() {

						// var dashboardId =
						// document.getElementById("boardType").value;

						var menus = [];
						var selectedmenus = [];
						for (m in $rootScope.menus) {
							var menuObj = $rootScope.menus[m];

							if ($sessionStorage.projectId == menuObj.projectId) {

								if (menuObj != "") {
									if (menuObj.menuName != 'Doodah') {
										menus.push({
											'key' : menuObj.menuId,
											'value' : menuObj.menuName
										});
										selectedmenus.push({
											'key' : menuObj.menuId,
											'value' : menuObj.menuName
										});
									} else {
										menus.push({
											"key" : "--Select--",
											"value" : ""
										});
									}
								}
							}

						}

						console.log('selectedmenus: ', selectedmenus);
						$('#widgets').multiselect('destroy');
						$scope.widgetOptions = [];
						$scope.selectedmenuOptions = selectedmenus;
						var widgetArray = [];
						for (i = 0; i < $sessionStorage.UserWidgetsInfo.length; i++) {
							for ( var menuSel in menus) {
								var item = menus[menuSel];

								if ($sessionStorage.UserWidgetsInfo[i].menuid == item.key) {
									if ($sessionStorage.UserWidgetsInfo[i].id != 0) {
										widgetArray
												.push({
													'key' : $sessionStorage.UserWidgetsInfo[i].name,
													'value' : $sessionStorage.UserWidgetsInfo[i].id
															+ '_' + item.key,
													'menuid' : item.key
												});
									}

									if (item.value == 'Mydashboard') {
										for (m = 0; m < $sessionStorage.MyDashboardWidgetInfo.length; m++) {
											widgetArray
													.push({
														'key' : $sessionStorage.MyDashboardWidgetInfo[m].widgetName,
														'value' : $sessionStorage.MyDashboardWidgetInfo[m].customWidgetId
																+ '_'
																+ item.value,
														'menuid' : item.key
													});
										}

									}
								}
							}

						}

						console.log("--==--=472-==--=", widgetArray);
						$scope.widgetOptions = widgetArray;

						$timeout(function() {
							// $('#widgets').multiselect('rebuild');
							// $('#widgets').multiselect('refresh');
							$('#widgets').multiselect({
								buttonWidth : '400px',
								includeSelectAllOption : true,
								enableCollapsibleOptGroups : true,
								enableClickableOptGroups : true
							});
						}, 100);

					}

					$rootScope.getSelectedWidgetsForExport = function() {

						console.log('this - ', this);
						var selectedWids = [];

						$.each($("#widgets option"), function() {

							if ($(this).is(':selected')) {

								var menuNameObj = $(this).val().split("_");
								var widgetObj = menuNameObj[0];
								var menuObj = menuNameObj[1];
								if (menuObj != 'Mydashboard') {
									menuName = $scope
											.getMenuName(menuNameObj[1])
								} else {
									menuName = menuObj;
								}
								selectedWids.push({
									'key' : $(this).val(),
									'value' : $(this).text() + "-" + menuName
								});

							} else {
								var unSelectedOption = $(this).val();

								for (s = 0; s < selectedWids.length; s++) {
									if (selectedWids[s] == unSelectedOption) {
										selectedWids.splice(s);
									}
								}
							}

							$scope.selectWids = selectedWids;

						});

					}

					$scope.getMenuName = function(menuId) {
						for (m in $rootScope.menus) {
							var menus = $rootScope.menus[m];
							if (menus.menuName != 'Doodah'
									&& menus.menuName != 'Mydashboard') {
								if (menus.menuId == menuId) {
									return menus.menuName;
								}
							}
						}
					}

					$rootScope.preview = function() {
						$sessionStorage.selectedmenuList = '';
						$sessionStorage.selectedWidgetList = '';
						$("#previewWidgetDiv").html('');
						var selectedmenus = [];
						var selectedWidgets = [];
						var radioValue = $(
								"input[name='downloadFormat']:checked").val();
						$.each($("#boardType option:selected"), function() {

							selectedmenus.push({
								'key' : $(this).val(),
								'value' : $(this).text()
							});
						});

						$.each($("#widgets option:selected"), function() {

							selectedWidgets.push({
								'key' : $(this).val(),
								'value' : $(this).text()
							});
						});
						if (selectedWidgets.length == 0
								|| selectedWidgets == undefined) {
							$("#erroredittext").html('');
							$("#erroredittext").append("Please Select Widget");
						} else if (radioValue == undefined || radioValue == '') {
							$("#erroredittext").html('');
							$("#erroredittext").append(
									"Please Choose Download Format");
						} else {
							$("#erroredittext").html('');

							$sessionStorage.selectedmenuList = selectedmenus;
							$sessionStorage.selectedWidgetList = selectedWidgets;
							$sessionStorage.downloadFormat = radioValue;
							console.log("width-====", $(window).width());
							$("#previewmodal").css('width', $(window).width());
							// $("#previewmodal").css('height',$(window).height());
							$("#previewmodal").modal('show');
							$("#downloadmodal").modal('hide');
							jQuery("#previewWidgetDiv")
									.append(
											$compile(
													"<div class='"
															+ "download'><div ng-include src=\"'views/app/widgetTemplates/"
															+ "downloadWidgets.html'\""
															+ "ng-if=\"'true'\"></div></div>")
													($scope));
						}

					}
					$rootScope.closePreview = function() {
						$("#previewmodal").modal('hide');
						$("#downloadmodal").modal('show');
					}
					$rootScope.selectedMenu = function(menuId, menuLink) {

						$rootScope.slideOnclick();

						console.log('menuId,menuLink: ', menuId, menuLink);
						if ($state.current != 'home') {
							$state.current = 'home';
						}

						if (menuLink == 'Mydashboard' || menuLink == 'reports') {
							// console.log("menuLink=====",menuLink+"==id===",menuId);
							$state.current = menuLink;
							$state.transitionTo($state.current, {
								dashboardName : menuId
							}, {
								reload : true,
								inherit : false,
								notify : true
							});
						} else {
							$sessionStorage.currentMenuLink = menuLink;
							$state.get('home').data.displayName = menuLink;
							$state.transitionTo($state.current, {
								dashboardName : menuId
							}, {
								displayName : menuLink
							}, {
								reload : true,
								inherit : false,
								notify : true
							});
						}

						$sessionStorage.currentMenuId = menuId;
						$sessionStorage.currentMenuLink = menuLink;

					}

					// PPT Generation
					$rootScope.downloadPPTFile = function() {

						var finalPromises = {};
						var finalPromisesWidhtHeightMap = {};

						if (JSZip.version == undefined) {
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.src = "views/lib/common/jszip.v0.8.0.js";
							document.body.appendChild(script);
						}

						if ($sessionStorage.downloadFormat == "PPT") {

							getScreenshotObjectsDataForDashboard(0,
									finalPromises, finalPromisesWidhtHeightMap);

						} else {
							alert("PDF Download is not present");
						}

					}
					function getScreenshotObjectsDataForDashboard(i,
							finalPromises, finalPromisesWidhtHeightMap) {
						var classname = $sessionStorage.UserWidgetsInfoNames[i];
						console.log("i value : ", i);
						if (i >= $sessionStorage.UserWidgetsInfoNames.length) {
							if (Object.keys(finalPromises).length == $sessionStorage.UserWidgetsInfoNames.length) {
								getSceenshotsDataForDashboard(finalPromises,
										"Dashboard",
										finalPromisesWidhtHeightMap);
							}
						} else {
							var height = 300;
							var width = 500;

							if ($('.' + classname).width()) {
								width = $('.' + classname).width();
							}
							if ($('.' + classname).height()) {
								height = $('.' + classname).height();
							}

							document.getElementsByClassName(classname)[0]
									.scrollIntoView();

							html2canvas($("." + classname), {
								onrendered : function(canvas) {
									// return canvas;
								},
								width : width,
								height : height,
								background : '#fff',
								useCORS : true,
								allowTaint : true,
								letterRendering : true
							// logging : true
							}).then(
									function(data) {
										// Put all canvases
										// in final map
										finalPromises[i] = data;

										// Convert
										// pixels to
										// inches
										var widthInches = (width / 96);
										if (widthInches > 10) {
											widthInches = 9.6;
										}
										var heightInches = (height / 96);
										if (heightInches > 5) {
											heightInches = 4.8;
										}
										finalPromisesWidhtHeightMap[i
												+ "_width"] = widthInches;
										finalPromisesWidhtHeightMap[i
												+ "_height"] = heightInches;

										getScreenshotObjectsDataForDashboard(
												i + 1, finalPromises,
												finalPromisesWidhtHeightMap);

									});
						}

					}

					// For todays date;
					function getDateForSheet() {
						var newDate = new Date();
						var dateObj = ((newDate.getDate() < 10) ? "0" : "")
								+ newDate.getDate() + "-"
								+ (((newDate.getMonth() + 1) < 10) ? "0" : "")
								+ (newDate.getMonth() + 1) + "-"
								+ newDate.getFullYear();
						var timeObj = ((newDate.getHours() < 10) ? "0" : "")
								+ newDate.getHours() + "-"
								+ ((newDate.getMinutes() < 10) ? "0" : "")
								+ newDate.getMinutes() + "-"
								+ ((newDate.getSeconds() < 10) ? "0" : "")
								+ newDate.getSeconds();
						return dateObj + " " + timeObj;
					}

					function getSceenshotsData(classname, lengthObj,
							finalPromisesMap, index, headerName,
							finalPromisesWidhtHeightMap) {

						var height = 300;
						var width = 500;

						if ($('.' + classname).width()) {
							width = $('.' + classname).width();
						}
						if ($('.' + classname).height()) {
							height = $('.' + classname).height();
						}
						// Convert pixels to inches
						var widthInches = (width / 96);
						if (widthInches > 10) {
							widthInches = 9.6;
						}
						var heightInches = (height / 96);
						if (heightInches > 5) {
							heightInches = 4.8;
						}
						finalPromisesWidhtHeightMap[index + "_width"] = widthInches;
						finalPromisesWidhtHeightMap[index + "_height"] = heightInches;

						$timeout(
								function() {
									html2canvas($("." + classname), {
										onrendered : function(canvas) {

											return canvas;
										},
										width : width,
										height : height,
										background : '#fff',
										useCORS : true,
										allowTaint : true,
										letterRendering : true
									})
											.then(
													function(dataObj) {
														finalPromisesMap[index] = dataObj;

														if (Object
																.keys(finalPromisesMap).length == lengthObj) {
															getSceenshotsDataForDashboard(
																	finalPromisesMap,
																	headerName,
																	finalPromisesWidhtHeightMap);
														}
													});
								}, 1000);
					}

					function getSceenshotsDataForDashboard(finalPromisesMap,
							headerName, finalPromisesWidhtHeightMap) {

						var pptx = new PptxGenJS();

						// 1st slide for
						// knowing the
						// details
						pptx.masters.TITLE_SLIDE.objects[0].text.text = "Exported By : "
								+ $scope.username;
						pptx.masters.TITLE_SLIDE.objects[1].text.text = "Date & Time : "
								+ new Date();
						var startingSlide = pptx
								.addNewSlide(pptx.masters.TITLE_SLIDE);

						// 2nd slide with
						// Menu and
						// Widget details
						// for Home page
						// details
						pptx.masters.MASTER_SLIDE.objects[2].text.text = "Widgets List";
						// if (headerName != "My Dashboard") {
						var secondSlide = pptx
								.addNewSlide(pptx.masters.MASTER_SLIDE);
						var xPosMenu = 0.65;
						var yPosMenu = 0.56;
						var xPosWidget = 1.17;
						var yPosWidget = 0.89;
						var completedMenuName = "";
						for (var i = 0; i < $sessionStorage.menuAndWidgetNames.length; i++) {
							if (completedMenuName != $sessionStorage.menuAndWidgetNames[i].menuName) {
								secondSlide
										.addText(
												$sessionStorage.menuAndWidgetNames[i].menuName,
												{
													x : xPosMenu,
													y : yPosMenu,
													w : 4,
													h : 0.3,
													color : '004B87',
													font_size : 12,
													bullet : {
														code : '2605'
													}

												});
								completedMenuName = $sessionStorage.menuAndWidgetNames[i].menuName;
								yPosWidget = yPosMenu + 0.19;
							}

							secondSlide
									.addText(
											$sessionStorage.menuAndWidgetNames[i].widgetName,
											{
												x : xPosWidget,
												y : yPosWidget,
												w : 3.5,
												h : 0.3,
												color : '363636',
												font_size : 10,
												bullet : true
											});
							yPosWidget = yPosWidget + 0.19;
							yPosMenu = yPosWidget;
						}
						// }

						// All slides
						$
								.map(
										finalPromisesMap,
										function(item, index) {
											// if (headerName != "My Dashboard")
											// {
											// pptx.masters.MASTER_SLIDE.objects[2].text.text
											// = headerName
											// + " --> "
											// +
											// $sessionStorage.menuAndIndexNames[index];
											pptx.masters.MASTER_SLIDE.objects[2].text.text = $sessionStorage.menuAndIndexNames[index];
											// } else {
											// pptx.masters.MASTER_SLIDE.objects[2].text.text
											// = headerName;
											// }
											var slide = pptx
													.addNewSlide(pptx.masters.MASTER_SLIDE);
											var left = (10 - finalPromisesWidhtHeightMap[index
													+ "_width"]) / 2;

											var top = (5.6 - finalPromisesWidhtHeightMap[index
													+ "_height"]) / 2;

											if (top < 0.5) {
												top = 0.5;
											}
											// Add
											// Blur
											// rectangle
											slide
													.addShape(
															pptx.shapes.RECTANGLE,
															{
																x : left - 0.05,
																y : top - 0.03,
																w : finalPromisesWidhtHeightMap[index
																		+ "_width"] + 0.1,
																h : finalPromisesWidhtHeightMap[index
																		+ "_height"] + 0.1,
																fill : 'FFFFFF',
																shadow : {
																	type : 'outer',
																	color : '696969',
																	blur : 15,
																	angle : 0,
																	offset : 2
																}
															});

											slide
													.addImage({
														x : left,
														y : top,
														w : finalPromisesWidhtHeightMap[index
																+ "_width"],
														h : finalPromisesWidhtHeightMap[index
																+ "_height"],
														data : item.toDataURL()
													});
										});
						var lastSlide = pptx
								.addNewSlide(pptx.masters.THANKS_SLIDE);

						var fileName = "Sample_" + getDateForSheet();

						pptx.save(fileName);
					}

					$('.profile_a').click(function() {

						$timeout(function() {
							$rootScope.slideOnclick();
						}, 100);
					})
				})
		.controller(
				'ModalInstanceCtrl',
				function($scope, $uibModalInstance, items, myDashboardService,
						$sessionStorage, widgetService, customwidgetService,
						$filter, $compile, homeService, $rootScope, $timeout,
						$state) {
					$scope.items = items;
					var menuId = $sessionStorage.currentMenuId;
					var menuLink = $sessionStorage.currentMenuLink;
					var widgetsInfoForMenu = $scope.slides = ($state.current.name == 'Mydashboard') ? $sessionStorage.MyDashboardWidgetInfo
							: $filter('filter')(
									$sessionStorage.UserWidgetsInfo, {
										menuid : menuId
									});

					$scope.widgetIdList = [ 30, 10, 21, 22, 23, 29, 35, 36, 37,
							38 ];
					var charts = [];
					$scope.pauseresume = false;
					$scope.autoplaySpeed = 5000;
					console.log("paused");
					var callback = function() {
						console.log("resumed");
						$scope.pauseresume = true;
					}
					function getEmptyWidget(index) {

						$sessionStorage["screen" + index + "Size"] = 'fullScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width: calc(100% - 40px); min-height:315px; height:100%; position: absolute;" id="standWidget'
								+ index + '"></div>';

						if (widgetsInfoForMenu[index].chartInformation != null
								|| widgetsInfoForMenu[index].chartInformation != undefined) {

							if (widgetsInfoForMenu[index].chartInformation.chart_type == 'gaugeChart') {

								if (widgetsInfoForMenu[index].chartInformation.gaugeType == 'powerGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><div id="standWidget'
											+ index + '"></div>';
								} else if (widgetsInfoForMenu[index].chartInformation.gaugeType == 'liquidGauge') {
									chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="standWidget'
											+ index
											+ '" width="400" height="300"></svg>';
								}
							}
						}

						var sprintDiv = null;
						if (widgetsInfoForMenu[index].toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';
						if (widgetsInfoForMenu[index].template == "") {
							return;
						}
						var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
								+ "." + widgetsInfoForMenu[index].template;
						// widgetsInfoForMenu[index].type = "12";
						jQuery(widgetDOMClass).append(
								$compile(
										homeService.buildEmptyWidgetDOM(
												widgetsInfoForMenu[index],
												index, noDataDiv, chartDiv,
												sprintDiv, "12"))($scope));
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
						$rootScope.dwid = widgetsInfoForMenu[index].datacenter_widget_id
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

						if (name == "releaseReadyness") {

							$scope.NormalGauge_id = name;
							$scope.EngGauge_id = name + "_Eng";
							$scope.AnGauge_id = name + "_An";
							var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
									+ "." + widgetsInfoForMenu[index].template;
							jQuery(widgetDOMClass)
									.append(
											$compile(
													"<div class='col-md-12 col-xs-12 widgetDiv"
															+ widgetsInfoForMenu[index].datacenter_widget_id
															+ "'><div ng-include src=\"'views/app/widgetTemplates/"
															+ name
															+ ".html'\"  ng-init='burndowntitle = \""
															+ widgetsInfoForMenu[index].name
															+ "\";  widgetIndexTemp=\""
															+ index
															+ "\"; widgetNameTemp=\""
															+ widgetsInfoForMenu[index].name
															+ "\"; customWidgetId = \""
															+ widgetsInfoForMenu[index].datacenter_widget_id
															+ "\";' NormalGauge_id = \""
															+ $scope.NormalGauge_id
															+ "\"; EngGauge_id = \""
															+ $scope.EngGauge_id
															+ "\"; AnGauge_id = \""
															+ $scope.AnGauge_id
															+ "\"'  ng-if=\"'true'\"></div></div>")
													($scope));
						} else {
							var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
									+ "." + widgetsInfoForMenu[index].template;
							jQuery(widgetDOMClass)
									.append(
											$compile(
													"<div class='"
															+ classname
															+ "' id='"
															+ widgetsInfoForMenu[index].datacenter_widget_id
															+ "'><div ng-include src=\"'views/app/widgetTemplates/"
															+ name
															+ ".html'\" ng-init='burndowntitle = \""
															+ widgetsInfoForMenu[index].name
															+ "\"; widgetIndexTemp=\""
															+ index
															+ "\"; widgetNameTemp=\""
															+ widgetsInfoForMenu[index].name
															+ "\"; customWidgetId = \""
															+ widgetsInfoForMenu[index].datacenter_widget_id
															+ "\";' ng-if=\"'true'\"></div></div>")
													($scope));
						}
						callback();
					}
					function getStandardChartInfo(widgetData, index, callback) {
						widgetData
								.then(
										function(responseInn) {
											callback();
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

													$("#standWidget" + index)
															.html('');

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
																						widgetsInfoForMenu[index],
																						index);

																		getStandardChartInfo(
																				widgetData,
																				index);

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

													var dataSet = respData.chartData;
													// drillDownSet =
													// respData.drillDownData;
													// $scope.widgetdrillDownArray[index]
													// = drillDownSet;
													// $scope.widgetDataArray[index]
													// = dataSet;

													$("#sprintValue" + index)
															.text(
																	respData.sprintData);

													if (widgetsInfoForMenu[index].chartInformation.chart_type === 'gaugeChart') {
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
																		widgetsInfoForMenu[index].chartInformation,
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
																							widgetsInfoForMenu[index],
																							index);

																			getStandardChartInfo(
																					widgetData,
																					index);

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
																											"min-height" : "315px",
																											"height" : "70%"
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

														var chart = homeService
																.callBuildGraph(
																		dataSet,
																		index,
																		widgetsInfoForMenu[index].chartInformation);

														charts[index] = chart;
														chart.screenSize = 'fullScreen';

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
																			var widgetData = widgetService
																					.getWidgetData(widgetsInfoForMenu[index].datacenter_widget_id);
																			getStandardChartInfo(
																					widgetData,
																					index);
																			if (flag == true)
																				$(
																						'#filterDiv')
																						.empty();

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
																						var screenSize = $sessionStorage["myscreen"
																								+ index
																								+ "Size"];
																						charts[index].screenSize = screenSize;

																						charts[index]
																								.width(
																										width - 40)
																								.height(
																										height);

																						if (charts[index].chartType == 'pieChart') {
																							charts[index]
																									.radius(radius);
																							charts[index]
																									.innerRadius(innerRadius);
																							charts[index]
																									.render();
																						}

																						if (charts[index].chartType === "stackedChart"
																								|| charts[index].chartType === "stackedMultiChart"
																								|| charts[index].chartType === "stackedMultiClustered"
																								|| charts[index].chartType === "pieChart") {

																							var legendX = 10, legendY = 10;
																							if (widgetsInfoForMenu[index].chartInformation.legendPos === 'Top Left') {
																								legendX = 40;
																								legendY = 25;
																							} else if (widgetsInfoForMenu[index].chartInformation.legendPos === 'Bottom Left') {
																								legendX = 10;
																								legendY = height - 40;
																							}

																							charts[index]
																									.legend(dc
																											.legend()
																											.x(
																													legendX)
																											.y(
																													legendY)
																											.itemHeight(
																													10)
																											.gap(
																													5)
																											.horizontal(
																													true)
																											.legendWidth(
																													400)
																											.itemWidth(
																													100)
																											.autoItemWidth(
																													true));
																						}

																						if (charts[index].chartType != 'pieChart') {
																							charts[index]
																									.rescale();
																							charts[index]
																									.redraw();
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
																						var elmnt = document
																								.getElementById("panelId"
																										+ index);
																						var width = elmnt.offsetWidth - 100;
																						var height = elmnt.offsetHeight - 100;
																						var radius = (width + height) * 0.12;
																						var innerRadius = (width + height) * 0.04;
																						charts[index].screenSize = 'fullScreen';
																						$sessionStorage["myscreen"
																								+ index
																								+ "Size"] = 'fullScreen';
																						charts[index]
																								.width(
																										width - 100)
																								.height(
																										height);
																						if (charts[index].chartType == 'pieChart') {
																							charts[index]
																									.radius(radius);
																							charts[index]
																									.innerRadius(innerRadius);
																							charts[index]
																									.render();
																						}

																						if (charts[index].chartType != 'pieChart') {
																							charts[index]
																									.rescale();
																							charts[index]
																									.redraw();
																						}

																						if (charts[index].chartType === "stackedChart"
																								|| charts[index].chartType === "stackedMultiChart"
																								|| charts[index].chartType === "stackedMultiClustered"
																								|| charts[index].chartType === "pieChart") {
																							var legendX = 10, legendY = 10;
																							if (widgetsInfoForMenu[index].chartInformation.legendPos === 'Top Left') {
																								legendX = 40;
																								legendY = 10;
																							} else if (widgetsInfoForMenu[index].chartInformation.legendPos === 'Bottom Left') {
																								legendX = 10;
																								legendY = height - 40;
																							}

																							console
																									.log(widgetsInfoForMenu[index].chartInformation);

																							charts[index]
																									.legend(dc
																											.legend()
																											.x(
																													legendX)
																											.y(
																													legendY)
																											.itemHeight(
																													10)
																											.gap(
																													5)
																											.horizontal(
																													true)
																											.legendWidth(
																													480)
																											.itemWidth(
																													100)
																											.autoItemWidth(
																													true));
																						}

																						if (widgetsInfoForMenu[index].chartInformation.xAxisDataType == 'Date') {
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
																											"min-height" : "315px",
																											"height" : "70%"
																										});
																						$(
																								'.custPanel'
																										+ index)
																								.removeClass(
																										"maxpanel");
																						var elmnt = document
																								.getElementById("panelId"
																										+ index);
																						var width = elmnt.offsetWidth;
																						var height = elmnt.offsetHeight;
																						var radius = (width + height) * 0.12;
																						var innerRadius = (width + height) * 0.04;
																						charts[index].screenSize = 'fullScreen';
																						$sessionStorage["myscreen"
																								+ index
																								+ "Size"] = 'fullScreen';
																						charts[index]
																								.width(
																										width - 50)
																								.height(
																										height);
																						if (charts[index].chartType == 'pieChart') {
																							charts[index]
																									.radius(radius);
																							charts[index]
																									.innerRadius(innerRadius);
																							charts[index]
																									.render();
																						}

																						if (charts[index].chartType != 'pieChart') {
																							charts[index]
																									.rescale();
																							charts[index]
																									.redraw();
																						}
																						if (charts[index].chartType === "stackedChart"
																								|| charts[index].chartType === "stackedMultiChart"
																								|| charts[index].chartType === "stackedMultiClustered"
																								|| charts[index].chartType === "pieChart") {

																							var legendX = 10, legendY = 10;
																							if (widgetsInfoForMenu[index].chartInformation.legendPos === 'Top Left') {
																								legendX = 40;
																								legendY = 25;
																							} else if (widgetsInfoForMenu[index].chartInformation.legendPos === 'Bottom Left') {
																								legendX = 10;
																								legendY = height - 40;
																							}
																							charts[index]
																									.legend(dc
																											.legend()
																											.x(
																													legendX)
																											.y(
																													legendY)
																											.itemHeight(
																													10)
																											.gap(
																													5)
																											.horizontal(
																													true)
																											.legendWidth(
																													480)
																											.itemWidth(
																													100)
																											.autoItemWidth(
																													true));
																						}

																					},
																					500);

																		});
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
											callback();
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
					function getMyDashboardStandardChartInfo(widgetData, index,
							callback) {
						widgetData
								.then(
										function(responseInn) {
											callback();
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
																		if (widgetsInfoForMenu[index].custFilePath !== '') {
																			$(
																					'#loader'
																							+ index)
																					.hide();
																		}
																		var widgetData = widgetService
																				.getWidgetData(widgetsInfoForMenu[index].datacenterWidgetId);
																		getMyDashboardStandardChartInfo(
																				widgetData,
																				index);

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

													// $scope.widgetDataArray[index]
													// = dataSet;
													// drillDownSet =
													// respData.drillDownData;
													// $scope.widgetdrillDownArray[index]
													// = drillDownSet;

													$("#sprintValue" + index)
															.text(
																	respData.sprintData);
													if (widgetsInfoForMenu[index].chartType == 'gaugeChart') {
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
																		widgetsInfoForMenu[index],
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
																			if (widgetsInfoForMenu[index].custFilePath !== '') {
																				$(
																						'#loader'
																								+ index)
																						.hide();
																			}
																			var widgetData = widgetService
																					.getWidgetData(widgetsInfoForMenu[index].datacenterWidgetId);
																			getMyDashboardStandardChartInfo(
																					widgetData,
																					index);
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
														// widgetsInfoForMenu[index].type
														// = "12";
														var chart = myDashboardService
																.buildGraphs(
																		dataSet,
																		'#standWidget'
																				+ index,
																		widgetsInfoForMenu[index],
																		index);

														charts[index] = chart;
														chart.screenSize = 'fullScreen';

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
																			var widgetData = widgetService
																					.getWidgetData(widgetsInfoForMenu[index].datacenterWidgetId);
																			getMyDashboardStandardChartInfo(
																					widgetData,
																					index);
																			if (filterflag == true)
																				$(
																						'#filterDiv')
																						.empty();

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
																						var screenSize = $sessionStorage["myscreen"
																								+ index
																								+ "Size"];
																						charts[index].screenSize = screenSize;

																						charts[index]
																								.width(
																										width - 40)
																								.height(
																										height);

																						if (charts[index].chartType == 'pieChart') {
																							charts[index]
																									.radius(radius);
																							charts[index]
																									.innerRadius(innerRadius);
																							charts[index]
																									.render();

																						}

																						if (charts[index].chartType === "stackedChart"
																								|| charts[index].chartType === "stackedMultiChart"
																								|| charts[index].chartType === "stackedMultiClustered"
																								|| charts[index].chartType === "pieChart") {

																							var legendX = 10, legendY = 10;
																							if (widgetsInfoForMenu[index].legendPosition === 'Top Left') {
																								legendX = 40;
																								legendY = 25;
																							} else if (widgetsInfoForMenu[index].legendPosition === 'Bottom Left') {
																								legendX = 10;
																								legendY = height - 40;
																							}

																							charts[index]
																									.legend(dc
																											.legend()
																											.x(
																													legendX)
																											.y(
																													legendY)
																											.itemHeight(
																													10)
																											.gap(
																													5)
																											.horizontal(
																													true)
																											.legendWidth(
																													400)
																											.itemWidth(
																													100)
																											.autoItemWidth(
																													true));
																						}

																						if (charts[index].chartType != 'pieChart') {
																							charts[index]
																									.rescale();
																							charts[index]
																									.redraw();
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
																						var elmnt = document
																								.getElementById("panelId"
																										+ index);
																						var width = elmnt.offsetWidth - 100;
																						var height = elmnt.offsetHeight - 100;
																						var radius = (width + height) * 0.12;
																						var innerRadius = (width + height) * 0.04;
																						charts[index].screenSize = 'fullScreen';
																						$sessionStorage["myscreen"
																								+ index
																								+ "Size"] = 'fullScreen';
																						charts[index]
																								.width(
																										width - 100)
																								.height(
																										height);
																						if (charts[index].chartType == 'pieChart') {
																							charts[index]
																									.radius(radius);
																							charts[index]
																									.innerRadius(innerRadius);
																							charts[index]
																									.render();
																						}

																						if (charts[index].chartType != 'pieChart') {
																							charts[index]
																									.rescale();
																							charts[index]
																									.redraw();
																						}

																						if (charts[index].chartType === "stackedChart"
																								|| charts[index].chartType === "stackedMultiChart"
																								|| charts[index].chartType === "stackedMultiClustered"
																								|| charts[index].chartType === "pieChart") {
																							var legendX = 10, legendY = 10;
																							if (widgetsInfoForMenu[index].legendPosition === 'Top Left') {
																								legendX = 40;
																								legendY = 10;
																							} else if (widgetsInfoForMenu[index].legendPosition === 'Bottom Left') {
																								legendX = 10;
																								legendY = height - 40;
																							}
																							charts[index]
																									.legend(dc
																											.legend()
																											.x(
																													legendX)
																											.y(
																													legendY)
																											.itemHeight(
																													10)
																											.gap(
																													5)
																											.horizontal(
																													true)
																											.legendWidth(
																													480)
																											.itemWidth(
																													100)
																											.autoItemWidth(
																													true));
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
																						var elmnt = document
																								.getElementById("panelId"
																										+ index);
																						var width = elmnt.offsetWidth;
																						var height = elmnt.offsetHeight;
																						var radius = (width + height) * 0.12;
																						var innerRadius = (width + height) * 0.04;
																						charts[index].screenSize = 'fullScreen';
																						$sessionStorage["myscreen"
																								+ index
																								+ "Size"] = 'fullScreen';
																						charts[index]
																								.width(
																										width - 50)
																								.height(
																										height);
																						if (charts[index].chartType == 'pieChart') {
																							charts[index]
																									.radius(radius);
																							charts[index]
																									.innerRadius(innerRadius);
																							charts[index]
																									.render();
																						}

																						if (charts[index].chartType != 'pieChart') {
																							charts[index]
																									.rescale();
																							charts[index]
																									.redraw();
																						}
																						if (charts[index].chartType === "stackedChart"
																								|| charts[index].chartType === "stackedMultiChart"
																								|| charts[index].chartType === "stackedMultiClustered"
																								|| charts[index].chartType === "pieChart") {

																							var legendX = 10, legendY = 10;
																							if (widgetsInfoForMenu[index].legendPosition === 'Top Left') {
																								legendX = 40;
																								legendY = 25;
																							} else if (widgetsInfoForMenu[index].legendPosition === 'Bottom Left') {
																								legendX = 10;
																								legendY = height - 40;
																							}
																							charts[index]
																									.legend(dc
																											.legend()
																											.x(
																													legendX)
																											.y(
																													legendY)
																											.itemHeight(
																													10)
																											.gap(
																													5)
																											.horizontal(
																													true)
																											.legendWidth(
																													480)
																											.itemWidth(
																													100)
																											.autoItemWidth(
																													true));
																						}

																					},
																					500);

																		});
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
											callback();
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
					function getChartInfoFromURL(widgetData, index, callback) {

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
												// $scope.widgetDataArray[index]
												// = dataSet;
												if (widgetsInfoForMenu[index].chartType == 'gaugeChart') {
													if (widgetsInfoForMenu[index].gaugeType === 'powerGauge'
															|| widgetsInfoForMenu[index].gaugeType === 'liquidGauge') {
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
																		widgetsInfoForMenu[index],
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
																			if (widgetsInfoForMenu[index].custFilePath === '') {

																				widgetData = customwidgetService
																						.getChartData(widgetsInfoForMenu[index].sourceUrl);
																				getChartInfoFromURL(
																						widgetData,
																						index);

																			} else {
																				widgetData = customwidgetService
																						.getChartDataFromCSV(
																								"views/customFiles/"
																										+ widgetsInfoForMenu[index].custFilePath,
																								widgetsInfoForMenu[index].custFileRealPath);

																			}

																			getChartInfoFromURL(
																					widgetData,
																					index);
																			$(
																					'#loader'
																							+ index)
																					.hide();
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
												} else if (widgetsInfoForMenu[index].chartType == 'ganttChart') {
													// if gantt chart:

													$('#custWidget' + index)
															.show();

													$('#loader' + index).hide();
													$('#errDiv' + index).hide();
													// widgetsInfoForMenu[index].type
													// = "12";
													myDashboardService
															.buildGraphs(
																	dataSet,
																	'#custWidget'
																			+ index,
																	widgetsInfoForMenu[index],
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
													// widgetsInfoForMenu[index].type
													// = "12";
													var chart = myDashboardService
															.buildGraphs(
																	dataSet,
																	'#custWidget'
																			+ index,
																	widgetsInfoForMenu[index],
																	index);

													charts[index] = chart;
													chart.screenSize = 'fullScreen';

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

																		if (widgetsInfoForMenu[index].custFilePath === '') {
																			var widgetData = customwidgetService
																					.getChartData(widgetsInfoForMenu[index].sourceUrl);
																			getChartInfoFromURL(
																					widgetData,
																					index);
																		} else {
																			var widgetData1 = customwidgetService
																					.getChartDataFromCSV(
																							"views/customFiles/"
																									+ widgetsInfoForMenu[index].custFilePath,
																							widgetsInfoForMenu[index].custFileRealPath);
																			getChartInfoFromURL(
																					widgetData1,
																					index);
																		}

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
																					var screenSize = $sessionStorage["myscreen"
																							+ index
																							+ "Size"];
																					charts[index].screenSize = screenSize;

																					charts[index]
																							.width(
																									width - 40)
																							.height(
																									height);

																					if (charts[index].chartType == 'pieChart') {
																						charts[index]
																								.radius(radius);
																						charts[index]
																								.innerRadius(innerRadius);
																						charts[index]
																								.render();
																					}

																					if (charts[index].chartType === "stackedChart"
																							|| charts[index].chartType === "stackedMultiChart"
																							|| charts[index].chartType === "stackedMultiClustered"
																							|| charts[index].chartType === "pieChart") {

																						var legendX = 10, legendY = 10;
																						if (widgetsInfoForMenu[index].legendPosition === 'Top Left') {
																							legendX = 40;
																							legendY = 25;
																						} else if (widgetsInfoForMenu[index].legendPosition === 'Bottom Left') {
																							legendX = 10;
																							legendY = height - 40;
																						}

																						charts[index]
																								.legend(dc
																										.legend()
																										.x(
																												legendX)
																										.y(
																												legendY)
																										.itemHeight(
																												10)
																										.gap(
																												5)
																										.horizontal(
																												true)
																										.legendWidth(
																												400)
																										.itemWidth(
																												100)
																										.autoItemWidth(
																												true));
																					}

																					if (charts[index].chartType != 'pieChart') {
																						charts[index]
																								.rescale();
																						charts[index]
																								.redraw();
																					}

																					if (widgetsInfoForMenu[index].xaxisDataType == 'Date'
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
																										widgetsInfoForMenu[index]);
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
																					charts[index].screenSize = 'fullScreen';
																					$sessionStorage["myscreen"
																							+ index
																							+ "Size"] = 'fullScreen';
																					var elmnt = document
																							.getElementById("panelId"
																									+ index);
																					var width = elmnt.offsetWidth - 100;
																					var height = elmnt.offsetHeight - 200;
																					var radius = (width + height) * 0.12;
																					var innerRadius = (width + height) * 0.04;

																					charts[index]
																							.width(
																									width)
																							.height(
																									height);
																					if (charts[index].chartType == 'pieChart') {
																						charts[index]
																								.radius(radius);
																						charts[index]
																								.innerRadius(innerRadius);
																						charts[index]
																								.render();
																					}

																					if (charts[index].chartType != 'pieChart') {
																						charts[index]
																								.rescale();
																						charts[index]
																								.redraw();
																					}

																					if (charts[index].chartType === "stackedChart"
																							|| charts[index].chartType === "stackedMultiChart"
																							|| charts[index].chartType === "stackedMultiClustered"
																							|| charts[index].chartType === "pieChart") {

																						var legendX = 10, legendY = 10;
																						if (widgetsInfoForMenu[index].legendPosition === 'Top Left') {
																							legendX = 40;
																							legendY = 10;
																						} else if (widgetsInfoForMenu[index].legendPosition === 'Bottom Left') {
																							legendX = 10;
																							legendY = height - 40;
																						}
																						charts[index]
																								.legend(dc
																										.legend()
																										.x(
																												legendX)
																										.y(
																												legendY)
																										.itemHeight(
																												10)
																										.gap(
																												5)
																										.horizontal(
																												true)
																										.legendWidth(
																												480)
																										.itemWidth(
																												100)
																										.autoItemWidth(
																												true));
																					}

																					if (widgetsInfoForMenu[index].xaxisDataType == 'Date') {
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
																										widgetsInfoForMenu[index]);
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

																					var elmnt = document
																							.getElementById("panelId"
																									+ index);
																					var width = elmnt.offsetWidth;
																					var height = elmnt.offsetHeight;

																					var radius = (width + height) * 0.12;
																					var innerRadius = (width + height) * 0.04;

																					charts[index].screenSize = 'fullScreen';
																					$sessionStorage["myscreen"
																							+ index
																							+ "Size"] = 'fullScreen';
																					charts[index]
																							.width(
																									width - 50)
																							.height(
																									height);

																					if (charts[index].chartType == 'pieChart') {
																						charts[index]
																								.radius(radius);
																						charts[index]
																								.innerRadius(innerRadius);
																						charts[index]
																								.render();
																					}

																					if (charts[index].chartType != 'pieChart') {
																						charts[index]
																								.rescale();
																						charts[index]
																								.redraw();
																					}

																					if (charts[index].chartType === "stackedChart"
																							|| charts[index].chartType === "stackedMultiChart"
																							|| charts[index].chartType === "stackedMultiClustered"
																							|| charts[index].chartType === "pieChart") {

																						var legendX = 10, legendY = 10;
																						if (widgetsInfoForMenu[index].legendPosition === 'Top Left') {
																							legendX = 40;
																							legendY = 25;
																						} else if (widgetsInfoForMenu[index].legendPosition === 'Bottom Left') {
																							legendX = 10;
																							legendY = height - 40;
																						}
																						charts[index]
																								.legend(dc
																										.legend()
																										.x(
																												legendX)
																										.y(
																												legendY)
																										.itemHeight(
																												10)
																										.gap(
																												5)
																										.horizontal(
																												true)
																										.legendWidth(
																												480)
																										.itemWidth(
																												100)
																										.autoItemWidth(
																												true));
																					}

																					if (widgetsInfoForMenu[index].xaxisDataType == 'Date') {

																						var brushOnFlag = false;
																						var noYAxis = false;
																						var sliderHeight = '';
																						// widgetsInfoForMenu[index].type
																						// =
																						// "12";
																						myDashboardService
																								.buildGraphs(
																										dataSet,
																										sliderChartId,
																										widgetsInfoForMenu[index],
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
											callback();
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
					function getSWidgetTemplate(widgetData, index, callback) {
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
							var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
									+ "." + widgetsInfoForMenu[index].template;
							// widgetsInfoForMenu[index].type = "12";
							jQuery(widgetDOMClass)
									.append(
											$compile(
													"<div class='col-md-12 col-xs-12 widgetDiv standPanel"
															+ widgetData.customWidgetId
															+ "'><div ng-include src=\"'views/app/widgetTemplates/"
															+ widgetData.template
															+ ".html'\"  ng-init='burndowntitle = \""
															+ widgetData.widgetName
															+ "\"; widgetIndexTemp=\""
															+ index
															+ "\"; widgetNameTemp=\""
															+ $sessionStorage.UserWidgetsInfo[index].name
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

						} else {
							var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
									+ "." + widgetsInfoForMenu[index].template;
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
															+ $sessionStorage.UserWidgetsInfo[index].name
															+ "\"; customWidgetId = \""
															+ widgetData.customWidgetId
															+ "\";'  ng-if=\"'true'\"></div></div>")
													($scope));
						}
						callback();
					}
					function getSEmptyWidget(index) {

						$sessionStorage["myscreen" + index + "Size"] = 'fullScreen';
						var chartDiv = '<div class="row graphWell bTop" align="center"><div style="width: calc(100% - 40px); min-height:300px; height:100%; position: absolute;" id="standWidget'
								+ index + '"></div>';
						var noDataDiv = '<div class="col-md-12 widgetDiv"  align="center" id="errDiv'
								+ index
								+ '" style="display:none;"><h4><span class="label label-warning">{{errormessage}}</span></h4></div>';

						if (widgetsInfoForMenu[index].chartType == "gaugeChart") {
							if (widgetsInfoForMenu[index].gaugeType === 'powerGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><div id="standWidget'
										+ index + '"></div>';
							} else if (widgetsInfoForMenu[index].gaugeType === 'liquidGauge') {
								chartDiv = '<div class="row graphWell bTop" align="center"><svg class="mTop" id="standWidget'
										+ index
										+ '" width="400" height="300"></div>';
							}
						}

						var sprintDiv = null;
						if (widgetsInfoForMenu[index].toolName == 'JIRA') {
							var sprintDiv = '<div id="featureWidgetDesc"><span><B class="weight-light">Sprint Name : </B></span><span class="weight-light"><B id="sprintValue'
									+ index + '">' + '</B></span></div>';
						} else {
							sprintDiv = '<div></div';
						}
						var widgetDOMClass = ".slideShowContainer .slide-item .carouselChartDiv"
								+ "." + widgetsInfoForMenu[index].template;
						jQuery(widgetDOMClass)
								.append(
										$compile(
												myDashboardService
														.buildSEmptyWidgetDOM(
																widgetsInfoForMenu[index],
																index,
																noDataDiv,
																chartDiv,
																sprintDiv, "12"))
												($scope));
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
								for (i = 0; i < widgetsInfoForMenu.length; i++) {
									if ($state.current.name == 'Mydashboard') {
										if (widgetsInfoForMenu[i].widgetType === 'custom') {
											if (widgetsInfoForMenu[i].custFilePath === '') {
												getEmptyWidget(i);
												// var widgetData =
												// customwidgetService
												// .getChartData(widgetsInfoForMenu[i].sourceUrl);
												// getChartInfoFromURL(widgetData,
												// i);
											} else {
												getEmptyWidget(i);
												// var widgetData1 =
												// customwidgetService
												// .getChartDataFromCSV("views/customFiles/"
												// +
												// widgetsInfoForMenu[i].custFilePath);
												// getChartInfoFromURL(
												// widgetData1, i);
											}
										} else {
											if ($scope.widgetIdList
													.indexOf(widgetsInfoForMenu[i].widgetId) != -1) {
												getSWidgetTemplate(
														widgetsInfoForMenu[i],
														i);
											} else {

												getSEmptyWidget(i);
												// var widgetId =
												// ($state.current.name ==
												// 'Mydashboard') ?
												// widgetsInfoForMenu[i].datacenterWidgetId
												// :
												// widgetsInfoForMenu[i].datacenter_widget_id;
												// var widgetData =
												// widgetService
												// .getWidgetData(widgetId);

												// getMyDashboardStandardChartInfo(
												// widgetData, i);
											}
										}
									} else if ($state.current.name == 'home') {
										if ($scope.widgetIdList
												.indexOf(widgetsInfoForMenu[i].id) != -1) {
											getWidgetTemplate(
													widgetsInfoForMenu[i].template,
													"12", i);
											// $rootScope['widget_Data_'
											// + widgetsInfoForMenu[i].template]
											// = widgetsInfoForMenu[i];
										} else {
											getEmptyWidget(i);
											// var widgetData = widgetService
											// .getWidgetData(widgetsInfoForMenu[i].datacenter_widget_id);

											// getStandardChartInfo(widgetData,
											// i);

										}
									}
								}
							}, 2000);

					$scope.ok = function() {
						$uibModalInstance.close($scope.selected.item);
					};

					$scope.cancel = function() {
						$uibModalInstance.dismiss('cancel');
					};

					$scope.onCarouselInit = function() {
						console.log("init");
					};
					$scope.onCarouselBeforeChange = function(index) {
						console.log("onCarouselBeforeChange: " + index);
						console.log("paused");
						$scope.pauseresume = false;
					};

					$scope.onCarouselAfterChange = function(index) {
						console.log("onCarouselAfterChange: " + index);
						if ($state.current.name == 'Mydashboard') {
							if (widgetsInfoForMenu[index].widgetType === 'custom') {
								if (widgetsInfoForMenu[index].custFilePath === '') {
									// getEmptyWidget(index);
									var widgetData = customwidgetService
											.getChartData(widgetsInfoForMenu[index].sourceUrl);
									getChartInfoFromURL(widgetData, index,
											callback);
								} else {
									// getEmptyWidget(index);
									var widgetData1 = customwidgetService
											.getChartDataFromCSV(
													"views/customFiles/"
															+ widgetsInfoForMenu[index].custFilePath,
													widgetsInfoForMenu[index].custFileRealPath);
									getChartInfoFromURL(widgetData1, index,
											callback);
								}
							} else {
								if ($scope.widgetIdList
										.indexOf(widgetsInfoForMenu[index].widgetId) != -1) {
									getSWidgetTemplate(
											widgetsInfoForMenu[index], index,
											callback);
								} else {

									// getSEmptyWidget(index);
									var widgetId = ($state.current.name == 'Mydashboard') ? widgetsInfoForMenu[index].datacenterWidgetId
											: widgetsInfoForMenu[index].datacenter_widget_id;
									var widgetData = widgetService
											.getWidgetData(widgetId);

									getMyDashboardStandardChartInfo(widgetData,
											index, callback);
								}
							}
						} else if ($state.current.name == 'home') {
							if ($scope.widgetIdList
									.indexOf(widgetsInfoForMenu[index].id) != -1) {
								getWidgetTemplate(
										widgetsInfoForMenu[index].template,
										"12", index, callback);
								// $rootScope['widget_Data_'
								// + widgetsInfoForMenu[index].template] =
								// widgetsInfoForMenu[index];
							} else {
								// getEmptyWidget(index);
								var widgetData = widgetService
										.getWidgetData(widgetsInfoForMenu[index].datacenter_widget_id);

								getStandardChartInfo(widgetData, index,
										callback);

							}
						}
					};

					$scope.$on("$destroy", function() {
						console.log("ModalInstanceCtrl Destroyed ");
					});
				});