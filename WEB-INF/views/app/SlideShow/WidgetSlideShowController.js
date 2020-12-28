mainApp
		.controller(
				'WidgetSlideShowController',
				function($scope, $uibModal, myDashboardService,
						$sessionStorage, widgetService, commonService,
						customwidgetService, $filter, $compile, homeService,
						$rootScope, $timeout, $state) {

					$("#slideWidgetOrder").sortable();

					var menuId = $sessionStorage.currentMenuId;
					var menuLink = $sessionStorage.currentMenuLink;
					$rootScope.getSlideWidgets = function(id) {

						$("#slideshowmodal").modal('show');
						$scope.timer = '';
						$scope.slidewidgets = false;
						$scope.timer = 3;
						$('#slidewidgets').multiselect('destroy');
						$("#slideTime").val('');
						$("#slideWidgetOrder li").remove();
						$("#slideTime").css({
							"border-color" : "white"
						});

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
													'menuid' : item.key,
													'menuName' : item.value
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
														'menuid' : item.key,
														'menuName' : item.value
													});
										}

									}
								}
							}

						}

						$scope.widgetOptions = widgetArray;

						$timeout(function() {
							$('#slidewidgets').multiselect({
								buttonWidth : '400px',
								includeSelectAllOption : true,
								enableCollapsibleOptGroups : true,
								enableClickableOptGroups : true
							});
						}, 100);

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

					$rootScope.getSelectedWidgets = function() {
						console.log('this - ', this);
						var selectedWids = [];

						$.each($("#slidewidgets option"), function() {

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

					$rootScope.previewSlideShow = function() {

						$sessionStorage.selectedmenuList = '';
						$sessionStorage.selectedWidgetList = '';
						// $("#slideshowmodal").html('');
						// $scope.timer = '';
						$scope.timer = $("input[id='slideTime']").val() * 1000;

						var selectedmenus = [];
						var selectedWidgets = [];

						$.each($("#slidewidgets option:selected"), function() {

							selectedWidgets.push({
								'key' : $(this).val(),
								'value' : $(this).text()
							});
						});

						if (selectedWidgets.length == 0
								|| selectedWidgets == undefined) {
							$("#errortext").empty();
							$("#errortext").append("Please Select Widget");
						} else if ($scope.timer === 0) {
							$("#errortext").empty();
							$("#errortext").append("Please Set Timer");
							$("#slideTime").css({
								"border-color" : "red"
							});
						} else {

							$("#errortext").html('');

							$sessionStorage.selectedslidemenuList = selectedmenus;
							$sessionStorage.selectedslideWidgetList = selectedWidgets;
							var optionTexts = [];
							$("#slideWidgetOrder li").each(function() {
								optionTexts.push({
									'name' : $(this).text(),
									'value' : $(this).attr("data-value"),
									'newOrderId' : $(this).index() + 1
								})
							});
							$sessionStorage.orderedwids = optionTexts;

							$("#slideshowmodal")
									.css('width', $(window).width());
							$("#slideshowmodal").modal('hide');
							$rootScope.startSlideShow();
							$compile(
									"<div class='"
											+ "download'><div ng-include src=\"'views/app/SlideShow/"
											+ "slideShowModalContent.html'\""
											+ "ng-if=\"'true'\"></div></div>")(
									$scope)
							// $("#slideshowmodal").modal('show');

						}

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

									$scope.animationsEnabled = true;
									$scope.showModal = function(size,
											parentSelector) {
										var parentElem = parentSelector ? angular
												.element($document[0]
														.querySelector('.modal-demo '
																+ parentSelector))
												: undefined;

										var modalInstance = $uibModal
												.open({
													animation : $scope.animationsEnabled,
													ariaLabelledBy : 'modal-title',
													ariaDescribedBy : 'modal-body',
													templateUrl : 'views/app/SlideShow/slideShowModalContent.html',
													controller : 'SlideShowModalInstanceController',
													//controllerAs : '$scope',
													windowClass : 'slideShowModalContent',
													size : '',
													appendTo : parentElem,
													resolve : {
														items : function() {
															return $scope.timer;
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

				});
