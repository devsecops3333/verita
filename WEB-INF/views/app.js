var mainApp = angular.module("mainApp",
		[ 'ui.router', 'ngStorage', 'ui.bootstrap',
				'angularUtils.directives.uiBreadcrumbs', 'ui.carousel' ]);

mainApp
		.config(function($stateProvider, $urlRouterProvider) {

			$urlRouterProvider.otherwise('/');

			$stateProvider
					.state('home', {
						url : '/home',
						views : {
							'@' : {
								templateUrl : 'views/layouts/base.tmpl.html'
							},
							'main@home' : {
								templateUrl : 'views/app/home/home.html',
								controller : 'HomeController',
								controllerAs : 'home'
							},
							'side@home' : {
								templateUrl : 'views/app/sidebar/sidebar.html',
								controller : 'sidebarController',
								controllerAs : 'side'
							}
						},
						data : {
							displayName : 'Dashboard'
						},
						params : {
							dashboardName : '99999'
						}
					})
					.state('over', {
						url : '/over',
						views : {
							'@' : {
								templateUrl : 'views/layouts/base.tmpl.html'
							},
							'main@over' : {
								templateUrl : 'views/app/home/overview.html'
							},
							'side@over' : {
								templateUrl : 'views/app/sidebar/sidebar.html',
								controller : 'sidebarController',
								controllerAs : 'side'
							}
						},
						data : {
							displayName : 'Environment Details'
						}
					})
					.state(
							'reports',
							{
								url : '/reports',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@reports' : {
										templateUrl : 'views/app/home/customReports.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@reports' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'Doodah'
								},
								params : {
									dashboardName : 'reports'
								}
							})
					.state(
							'Mydashboard',
							{
								url : '/Mydashboard',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@Mydashboard' : {
										templateUrl : 'views/app/home/myDashboard.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@Mydashboard' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'My Dashboard'
								},
								params : {
									dashboardName : 'Mydashboard'
								}
							})
					.state(
							'workload',
							{
								url : '/workload',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@workload' : {
										templateUrl : 'views/app/home/workLoadAnalysis.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@workload' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'Work Load'
								}
							})

					.state(
							'jenkinsTest',
							{
								url : '/jenkinsTest',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@jenkinsTest' : {
										templateUrl : 'views/app/home/jenkinsLiveResults.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@jenkinsTest' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'jenkins Delivery Pipeline'
								}
							})

					.state(
							'liveresults',
							{
								url : '/liveresults',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@liveresults' : {
										templateUrl : 'views/app/home/liveResults.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@liveresults' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'Live Results'
								}
							})
					.state(
							'home.diagnoseRelease',
							{
								url : 'diagnoseRelease',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@home.diagnoseRelease' : {
										templateUrl : 'views/app/widgets/widgetMenuViews/diagnoseReleaseView.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@home.diagnoseRelease' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'RR Diagnose'
								}
							})
					.state(
							'myDashboard.diagnoseRelease',
							{
								url : 'diagnoseRelease',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@home.diagnoseRelease' : {
										templateUrl : 'views/app/widgets/widgetMenuViews/diagnoseReleaseView.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@home.diagnoseRelease' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'RR Diagnose'
								}
							})

					.state(
							'home.prescrptiveRelease',
							{
								url : 'prescrptiveRelease',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@home.prescrptiveRelease' : {
										templateUrl : 'views/app/widgets/widgetMenuViews/precriptiveReleaseView.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@home.prescrptiveRelease' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'RR Prescribe'
								}
							})
					.state(
							'myDashboard.prescrptiveRelease',
							{
								url : 'prescrptiveRelease',
								views : {
									'@' : {
										templateUrl : 'views/layouts/base.tmpl.html'
									},
									'main@home.prescrptiveRelease' : {
										templateUrl : 'views/app/widgets/widgetMenuViews/precriptiveReleaseView.html',
									/*
									 * controller : 'HomeController',
									 * controllerAs : 'home'
									 */
									},
									'side@home.prescrptiveRelease' : {
										templateUrl : 'views/app/sidebar/sidebar.html',
										controller : 'sidebarController',
										controllerAs : 'side'
									}
								},
								data : {
									displayName : 'RR Prescribe'
								}
							}).state('profile', {
						url : '/profile',
						views : {
							'@' : {
								templateUrl : 'views/layouts/base.tmpl.html'
							},
							'main@profile' : {
								templateUrl : 'views/app/profile/profile.html'
							},
							'side@profile' : {
								templateUrl : 'views/app/sidebar/sidebar.html',
								controller : 'sidebarController',
								controllerAs : 'side'
							}
						},
						data : {
							displayName : 'Profile Details'
						}
					}).state('uploads', {
						url : '/fileUpload',
						views : {
							'@' : {
								templateUrl : 'views/layouts/base.tmpl.html'
							},
							'main@uploads' : {
								templateUrl : 'views/app/home/fileUpload.html',
							},
							'side@uploads' : {
								templateUrl : 'views/app/sidebar/sidebar.html',
								controller : 'sidebarController',
								controllerAs : 'side'
							}
						},
						data : {
							displayName : 'Data Center'
						}
					}).state('login', {
						url : '/login',
						views : {
							'@' : {
								templateUrl : 'views/app/login/login.html'
							}
						},
						controller : 'LoginController',
					}).state('landing', {
						url : '/',
						views : {
							'@' : {
								templateUrl : 'views/app/land/landing.html',
							}
						},
						controller : 'landController',
					});
		});
