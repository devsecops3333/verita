mainApp
		.controller(
				'sidebarController',
				function($rootScope, $scope, $state, $sessionStorage,
						$location, $stateParams, $timeout) {

					/*
					 * $scope.isActiveMenu = function(route) { return route ===
					 * $location.path(); };
					 */
					var displayName = $state.get('home').data.displayName;
					console.log("displayName ", displayName);
					if (displayName != 'Mydashboard'
							&& displayName != 'reports') {
					
						if ($stateParams.dashboardName == 99999
								&& $sessionStorage.currentMenuId) {
							$stateParams.dashboardName = $sessionStorage.currentMenuId;
						}
					} else {
						$stateParams.dashboardName = displayName;
					}

					var state = $sessionStorage.currentMenuLink;

					$state.get('home').data.displayName = $sessionStorage.currentMenuLink;
					// $state.get('home').data.displayName =
					// $sessionStorage.currentMenuLink;

					$rootScope.slideOnclick = function() {

						$(document)
								.ready(
										function() {

											$(document)
													.on(
															'click',
															'#rightsidebar-wrapper .toggler',
															function() {

																$("#wrapper")
																		.removeClass(
																				"wrapper-toggle");

																$(
																		"#sidebar-wrapper")
																		.removeClass(
																				"sidebar-wrapper-toggle");
																$(
																		"#rightsidebar-wrapper")
																		.removeClass(
																				"rightsidebar-wrapper-toggle");

																$(
																		"#rightsidebar-wrapper")
																		.toggleClass(
																				"activeright");

																// if
																// ($('.activeright'))
																// {
																// console.log('toggling
																// activeright');
																// $("#rightsidebar-wrapper").toggleClass("activeright");
																// } else {
																// console.log('adding
																// activeright');
																// $("#rightsidebar-wrapper").addClass("activeright");
																// }

																console
																		.log(
																				"$rootScope.leftSideMenu--",
																				$rootScope.leftMenu);
																if ($rootScope.leftMenu == 0) {

																	if ($(
																			"#rightsidebar-wrapper")
																			.hasClass(
																					"activeright")) {
																		$(
																				"#wrapper.active")
																				.css(
																						{
																							"padding-left" : "0%",
																							"padding-right" : "0%",
																						});

																	} else {
																		$(
																				"#wrapper.active")
																				.css(
																						{
																							"padding-left" : "0%",
																							"padding-right" : "8.33333333%",
																						});

																	}
																} else {

																	if ($(
																			"#rightsidebar-wrapper")
																			.hasClass(
																					"activeright")) {
																		if ($(
																				"#sidebar-wrapper")
																				.hasClass(
																						"activeleft")) {

																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "0%",
																								"padding-right" : "0%",
																							});
																		} else {

																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "8.33333%",
																								"padding-right" : "0%",
																							});

																		}

																	} else {
																		if ($(
																				"#sidebar-wrapper")
																				.hasClass(
																						"activeleft")) {

																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "0%",
																								"padding-right" : "8.33333333%",
																							});

																		} else {
																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "8.33333%",
																								"padding-right" : "8.33333%",
																							});
																		}
																	}

																}

															});

											$(document)
													.on(
															'click',
															'#sidebar-wrapper .toggler',
															function() {

																$(
																		"#sidebar-wrapper")
																		.toggleClass(
																				"activeleft");

																if ($rootScope.rightMenu == 0) {

																	if ($(
																			"#sidebar-wrapper")
																			.hasClass(
																					"activeleft")) {
																		$(
																				"#wrapper.active")
																				.css(
																						{
																							"padding-left" : "0%",
																							"padding-right" : "0%",
																						});
																	} else {
																		$(
																				"#wrapper.active")
																				.css(
																						{
																							"padding-left" : "8.33333333%",
																							"padding-right" : "0%",
																						});
																	}

																} else {

																	if ($(
																			"#sidebar-wrapper")
																			.hasClass(
																					"activeleft")) {
																		if ($(
																				"#rightsidebar-wrapper")
																				.hasClass(
																						"activeright")) {

																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "0%",
																								"padding-right" : "0%",
																							});

																		} else {
																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "0%",
																								"padding-right" : "8.33333333%",
																							});
																		}

																	} else {
																		if ($(
																				"#rightsidebar-wrapper")
																				.hasClass(
																						"activeright")) {
																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "8.33333%",
																								"padding-right" : "0%",
																							});

																		} else {
																			$(
																					"#wrapper.active")
																					.css(
																							{
																								"padding-left" : "8.33333%",
																								"padding-right" : "8.33333%",
																							});
																		}
																	}

																}
																$(
																		"#sidebar-wrapper")
																		.removeClass(
																				"sidebar-wrapper-toggle");
																$("#wrapper")
																		.removeClass(
																				"wrapper-toggle");

																$(
																		"#rightsidebar-wrapper")
																		.removeClass(
																				"rightsidebar-wrapper-toggle");
															});
										});
					}

					$scope.isActiveMenu = function(route, menuLink) {
						
						if (menuLink == '/Mydashboard'
							|| menuLink == '/reports') {
							
							return (menuLink === $location.path());
							
						}else{
							if ($location.path() == '/Mydashboard'
								|| $location.path() == '/reports') {
								$stateParams.dashboardName = '';
							
							}
							
							return (route == '/' + $stateParams.dashboardName);
						}
						
						
						
					};

					$scope.leftFeatures = false;

					if ($sessionStorage.username === 'cigniticio') {
					} else if ($sessionStorage.username === 'cignitiperf') {
						$scope.leftFeatures = true;
					} else if ($sessionStorage.username === 'cignitiscrum') {
						$scope.user = 'Moshe';
					}

					$rootScope.projectImg = 'devops/rest/pimg/'
							+ $sessionStorage.projectId;

				});