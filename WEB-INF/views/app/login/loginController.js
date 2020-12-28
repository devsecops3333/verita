mainApp
		.controller(
				'LoginController',
				function($scope, $sessionStorage, $state, $rootScope,
						loginService, customwidgetService) {

					this.username = "";
					this.password = "";
					$(".maxpanel").remove();

					/*
					 * $scope variable scope is page and $sessionStorage is
					 * across application.
					 */
					$scope.projectName = "";
					$scope.projectsList;
					$sessionStorage.projectName = "";

					// To authenticate user
					this.authenticate = function() {

						if (this.username === '' || this.password === '') {
							$scope.message = "Please Enter User Name/Password";
						} else {
							$sessionStorage.username = this.username;
							var authRes = loginService.getLogin(this.username,
									this.password);
							authRes
									.then(
											function(authResponse) {
												if (authResponse.data !== '') {
													if (authResponse.data.errorStatus === "Yes") {
														$scope.message = authResponse.data.errorMessage;
													} else {
														$scope
																.setUserDetails(authResponse);
														$scope.postLogin();
													}
												} else {
													$scope.message = "Invalid User Name/Password";
												}

											},
											function(errorAuthResponse) {

												$scope.message = "Internal Server Error";
											});

						}
					}

					// For setting user details in session storage
					$scope.setUserDetails = function(authResponse) {
						$("#loginLoadImg").show();
						
						$scope.projectsList = authResponse.data.projects;
						$scope.menusList = authResponse.data.Menus;
						$sessionStorage.userId = authResponse.data.uid;
						$sessionStorage.firstName = authResponse.data.firstName;
						$sessionStorage.userOf = authResponse.data.userOf;
						$sessionStorage.projectsList = $scope.projectsList;
						$sessionStorage.domainName = authResponse.data.domainName;
						$sessionStorage.loginTime = authResponse.data.loginTime;
						$sessionStorage.menuList = $scope.menusList;

						$sessionStorage.dataSourceTypeFromDB = authResponse.data.dataSourceType;

						if ($sessionStorage.dataSourceTypeFromDB == null
								|| $sessionStorage.dataSourceTypeFromDB == undefined
								|| $sessionStorage.dataSourceTypeFromDB == "") {
							$sessionStorage.dataSourceTypeFromDB = "Online";
						}

						$sessionStorage.memCache = authResponse.data.memCache;

						for ( var key in $scope.projectsList) {
							
							if ($scope.projectsList[key].id === $scope.projectsList[key].dPId) {
								$sessionStorage.menuList = $scope.menusList;
								
								$sessionStorage.dpObj = $scope.projectsList[key];
								$sessionStorage.pumid = $scope.projectsList[key].pumid;
								$sessionStorage.projectName = $scope.projectsList[key].name;
								$sessionStorage.projectId = $scope.projectsList[key].id;
								$sessionStorage.defaultprojectId = $scope.projectsList[key].dPId;
							
								// $sessionStorage.landPage =
								// $scope.projectsList[key].landPage;
								$sessionStorage.landPage = 'dashboard';
								$sessionStorage.landTheme = $scope.projectsList[key].landTheme;

							}
						}

						/**
						 * Below code is included on 20/10/2017 for downloading
						 * widgets of mydashboard
						 */
						var widgetResponse = customwidgetService
								.getCustomWidgets($sessionStorage.userId,
										$sessionStorage.projectId);

						widgetResponse
								.then(function(response) {

									$sessionStorage.MyDashboardWidgetInfo = response.data;
									$sessionStorage.MyDashboardWidgetInfo = $sessionStorage.MyDashboardWidgetInfo
											.sort(function(a, b) {
												return parseFloat(a.customWidgetOrderNo)
														- parseFloat(b.customWidgetOrderNo);
											});
								});

						/**
						 * End
						 */

						if ($sessionStorage.menuList != undefined
								&& $sessionStorage.menuList.length > 0) {
							for ( var menu in $sessionStorage.menuList) {
								
								if ($sessionStorage.menuList[menu].projectId == $sessionStorage.defaultprojectId) {

									$sessionStorage.currentMenuId = $sessionStorage.menuList[menu].defaultMenu;
									$sessionStorage.currentMenuLink = $sessionStorage.menuList[menu].defaultMenuName;
									$state.get('home').data.displayName = $sessionStorage.currentMenuLink;									
									// $state.get('home').data.displayName =
									// $sessionStorage.menuList[menu].defaultMenuName;
								}

							}

						} else {
							$sessionStorage.currentMenuId = '99999';
						}
					}

					$scope.postLogin = function() {
						var loginRes = loginService.postLogin(
								$sessionStorage.projectId,
								$sessionStorage.pumid);
						

						loginRes
								.then(
										function(payload) {
											
											if (payload.data === ""
													|| payload.data.length === 0) {

												$sessionStorage.userData = "Yes";
												$scope.message = "";
												$sessionStorage.UserWidgetsInfo = payload.data;
												$scope.setLandingPage();
											} else if (payload.data[0].errorStatus === "Yes") {
												$scope.message = payload.data[0].errorMessage;
											} else {
												$sessionStorage.userData = "Yes";
												$scope.message = "";
												$sessionStorage.UserWidgetsInfo = payload.data;
												console
														.log(
																"$sessionStorage.UserWidgetsInfo--151--",
																$sessionStorage.UserWidgetsInfo);

												$scope.setLandingPage();
											}
										},
										function(errorPayload) {

											$scope.message = "Internal Server Error";
										});
					}

					// Setting up landing page after logged in.
					$scope.setLandingPage = function() {
						$(".bodyback").css({
							"background" : "#EDDFDF",
							"padding" : '0px'
						});

						switch ($sessionStorage.landPage) {

						case "Mydashboard":

							$('#loginModal').modal('hide');
							$state.go('Mydashboard');
							break;
						case "dashboard":

							$('#loginModal').modal('hide');
							$state.go('home');
							break;
						default:
							break;
						}

					}

				});