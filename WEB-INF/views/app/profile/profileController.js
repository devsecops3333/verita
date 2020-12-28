mainApp
		.controller(
				'ProfileController',
				function($scope, $state, $sessionStorage, $location,
						loginService, $rootScope, $timeout,
						customwidgetService, $compile, $stateParams) {

					$scope.username = "";
					$scope.email = "";
					$scope.message = "";
					$scope.emailMessage = "";
					$scope.pwd = "";
					$scope.cpwd = "";
					$scope.landingType = $sessionStorage.landPage;
					$scope.MyDashboardWidgetInfo = '';

					console.log("userOf===", $sessionStorage.userOf);

					$scope.userOf = $sessionStorage.userOf;

					if ($scope.userOf === "LDAP") {
						$("#changePasBtn").prop("disabled", true);
					} else {
						$("#changePasBtn").prop("disabled", false);
					}

					var widgetRes = customwidgetService.getCustomWidgets(
							$sessionStorage.userId, $sessionStorage.projectId);
					widgetRes
							.then(
									function(response) {

										$sessionStorage.MyDashboardWidgetInfo = response.data;
										$sessionStorage.MyDashboardWidgetInfo
												.sort(function(a, b) {
													return parseFloat(a.customWidgetOrderNo)
															- parseFloat(b.customWidgetOrderNo);
												});
										$scope.MyDashboardWidgetInfo = $sessionStorage.MyDashboardWidgetInfo;

										if ($scope.MyDashboardWidgetInfo.length > 0) {
											$("#mdwHeader").show();
											$("#saveMdwOrder").show();
											$("#myDashboardDiv").show();
										} else {
											$("#mdwHeader").hide();
											$("#saveMdwOrder").hide();
											$("#myDashboardDiv").hide();
										}

									}, function(errorResponse) {
									});

					// $scope.selectedTheme = $sessionStorage.landTheme;
					$scope.projects = $sessionStorage.projectsList;

					$('i').tooltip({
						disabled : true,
						close : function(event, ui) {
							$(this).tooltip('disable');
						}
					});

					$('i').on('click', function() {
						$(this).tooltip('enable').tooltip('open');
					});

					// code for clearing error message for password
					$scope.clearMsg = function() {
						$scope.pwdMessage = '';
						$scope.cpwdMessage = '';
						$("#pwd").val('');
						$("#cpwd").val('');
					}

					$("#changePassModal").on('hidden.bs.modal', function() {
						// $scope.pwdMessage = '';
						// $scope.cpwdMessage = '';
						$('#pwdMsg').hide();
						$('#cpwdMsg').hide();
						$("#pwd").val('');
						$("#cpwd").val('');
					});

					// code for getting selected projects

					var plist = {};
					$scope.pumList = {};
					for ( var key in $scope.projects) {
						var pid = $scope.projects[key].id;
						var pname = $scope.projects[key].name;

						if ($scope.projects[key].id === $scope.projects[key].dPId) {
							$scope.dpid = $scope.projects[key].dPId;
							$scope.selectedProj = $scope.dpid;
						}

						plist[pid] = pname;
						$scope.pumList[pid] = $scope.projects[key];
					}

					$scope.plist = plist;
					var dpid = $scope.dpid;

					$scope.selectedProj = String(dpid);

					// code for displaying data after edit

					$("#personalEdit").click(function() {

						if ($scope.userOf === "LDAP") {
							$("#userEmail").prop("disabled", true);
						} else {
							$("#userEmail").prop("disabled", false);
						}

						$('#personalEdit').hide();
						$('#savePersonalEdit').show();
						$('#browseImg').show();
					});

					$("#defaultEdit").click(function() {
						$("input[type=radio]").attr('disabled', false);
						$('#selectProject').prop('disabled', false);
						$('#selectLandingTheme').prop('disabled', false);
						$('#selectboard').prop('disabled', false);
						$('#defaultEdit').hide();
						$('#saveDefaultEdit').show();
					});

					// code for saving data into DB
					$scope.updateDefaultSettings = function() {
						if ($sessionStorage.projectId == $scope.selectedItem) {
							projectId = $scope.selectedItem;
						} else {
							projectId = $sessionStorage.projectId;
						}

						var updateDefaultSet = loginService
								.updateDefaultSettings($sessionStorage.userId,
										$scope.selectedItem, $scope.landingType,
										$scope.selectedTheme,
										$scope.defaultBoard);
						updateDefaultSet
								.then(function(resp) {

									if (resp.data == "Success") {

										$sessionStorage.landPage = $scope.landingType;

										$sessionStorage.landTheme = $scope.selectedTheme;
										$sessionStorage.currentMenuId = $scope.defaultBoard;

										$("#displayText").empty();
										$('#displayText')
												.append(
														"<strong class='sGreen'>Success !  </strong>Data updated successfully.");

										$('#defaultEdit').show();
										$('#saveDefaultEdit').hide();

										$("input[type=radio]").attr('disabled',
												true);
										$('#selectProject').prop('disabled',
												true);
										$('#selectboard')
												.prop('disabled', true);
										$('#selectLandingTheme').prop(
												'disabled', true);

										$("#defaultUpdateModal").modal("show");
									} else {
										$("#displayText").empty();
										$('#displayText').append(
												"Unable to update data.");
										$("#defaultUpdateModal").modal("show");
									}

								});

					}

					// to edit image

					$("#image").change(function() {
						$("#imageId").hide();
					});

					$scope.readURL = function(input) {
						if (input.files && input.files[0]) {
							var reader = new FileReader();

							reader.onload = function(e) {
								$scope.profileImg = $('#profileImg').attr(
										'src', e.target.result);

							}

							reader.readAsDataURL(input.files[0]);
						}
					}

					$("#image").change(function() {
						$scope.readURL(this);
					});

					/*
					 * if ($scope.profileImg == undefined) $scope.profileImg =
					 * 'devops/rest/uimg/' + $sessionStorage.userId;
					 */

					$scope.updatePersonalDetails = function() {

						var file = $("input[id='image']")[0].files[0];
						var imgFile;
						var fd = new FormData();
						var objData = {
							'userId' : $sessionStorage.userId,
							'email' : $scope.email,
						};

						if (file == undefined) {
							fd.append('file', 'na');
							fd.append("data", JSON.stringify(objData));
						}

						else {
							if (Math.round(file.size / 1024) <= 1000) {
								imgFile = file;
								$("#text").hide();
								$("#imageId").hide();
								fd.append('file', imgFile);
								fd.append("data", JSON.stringify(objData));
							}

							else {
								$("#text").hide();
								$("#imageId").html(
										'Image size should be less than 1 MB');
								$("#imageId").show();
							}
						}

						var result = $scope.validate();
						if (result === true) {

							var updatePersonalDet = loginService
									.updatePersonalDetails(fd);

							updatePersonalDet
									.success(function(data) {
										if (data == "success") {
											$("#displayText").empty();
											$('#displayText')
													.append(
															"<strong class='sGreen'>Success !  </strong>Data updated successfully.");

											$('#personalEdit').show();
											$('#savePersonalEdit').hide();
											$('#browseImg').hide();

											$('#userEmail').prop('disabled',
													true);

											$("#defaultUpdateModal").modal(
													"show");
											$scope.message = '';
											$sessionStorage.randomNumberForProfileImg = parseInt(
													(Math.random() * 10000), 10);
										} else {
											$("#displayText").empty();
											$('#displayText').append(
													"Unable to update data.");
											$("#defaultUpdateModal").modal(
													"show");
										}
									});
						}

					}

					// password validation

					$scope.validatePwd = function(password, confirmPassword) {
						var flag = true;

						var passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;

						if (confirmPassword == undefined
								|| confirmPassword == '') {
							$scope.cpwdMessage = "Confirm password is mandatory.";
							flag = false;
						}

						if (password == undefined || password == '') {
							$scope.pwdMessage = "Password is mandatory.";
							flag = false;
						}

						if (confirmPassword.length != 0 && password.length != 0) {

							$scope.cpwdMessage = '';

							if (confirmPassword.length === password.length
									&& password.match(passwordPattern)
									&& confirmPassword.match(passwordPattern)) {

								if (confirmPassword === password) {
									$scope.cpwdMessage = '';
								} else {
									$scope.pwdMessage = "Invalid password. Please check information tooltip";
									flag = false;
								}

							} else {
								$scope.pwdMessage = "Invalid password. Please check information tooltip";
								flag = false;
							}

						}

						return flag;
					}

					$scope.updatePwd = function() {
						var paswrd = $scope.pwd;
						var cnfrmpaswrd = $scope.cpwd;

						var result = $scope.validatePwd(paswrd, cnfrmpaswrd);

						// if (angular.equals(paswrd, cnfrmpaswrd) === true) {
						if (result === true) {
							var updteres = loginService.updatepwd(paswrd,
									$sessionStorage.userId);
							updteres.then(function(resp) {
								$('#changePassModal').modal('hide');
								$('#successModal').modal('show');
							}, function(errorPayload) {

							});
						}
						// }
					}

					var profileDetails = loginService.getProfile(
							$sessionStorage.userId, $sessionStorage.projectId,
							$sessionStorage.pumid);

					profileDetails
							.then(function(profileData) {
								$scope.username = profileData.data.user_name
										.substr(0, 1).toUpperCase()
										+ profileData.data.user_name.substr(1);
								$scope.user_role = profileData.data.user_role;
								$scope.user_role_id = profileData.data.user_role_id;

								$scope.email = profileData.data.user_email;
								$scope.projects = $sessionStorage.projectsList;

								if ($scope.user_role == undefined)
									$scope.UserWidgetsInfo = '';

								if ($scope.UserWidgetsInfo.length < 2) {
									$("#saveDBWidgetOrder").hide();
									$("#dashboardDiv").hide();
								}

								for ( var obj in $scope.projects) {
									if ($scope.projects[obj].id === $scope.projects[obj].dPId) {

										$scope.selectedItem = $scope.projects[obj].id
												+ "";
										$scope.selectedTheme = $scope.projects[obj].landTheme;

									}
								}
							});

					// $sessionStorage.randomNumberForProfileImg =
					// parseInt((Math.random() * 10000), 10);

					$scope.userImg = 'devops/rest/uimg/'
							+ $sessionStorage.userId + '?t='
							+ $sessionStorage.randomNumberForProfileImg;

					$scope.updateProject = function() {

						var updateDPrjResp = loginService.updateUDPrj(
								$sessionStorage.userId, $scope.selectedItem);
						updateDPrjResp.then(function(resp) {
						});

					}

					$scope.logout = function() {
						$('#successModal').modal('hide');
						$('.modal-backdrop').css({
							'display' : 'none'
						});
						$sessionStorage.$reset();
						$state.go('landing');
					}

					$scope.dwUpdateOrder = function() {

						var widgetsList = [];

						var widgetsNewOrder = [];
						for ( var menu in $sessionStorage.menuList) {
							var optionTexts = [];

							if ($sessionStorage.menuList[menu].menuName !== "Mydashboard"
									&& $sessionStorage.menuList[menu].menuName !== "Doodah") {

								$(
										"#dbWidgetOrder_"
												+ $sessionStorage.menuList[menu].menuId
												+ " li").each(function() {

									widgetsList.push({
										'prwmId' : $(this).attr("data-prwmId"),
										'newOrderId' : $(this).index() + 1
									})
									optionTexts.push({
										'prwmId' : $(this).attr("data-prwmId"),
										'widName' : $(this).text(),
										'widgetId' : $(this).attr("data-wId"),
										'dbOrderId' : $(this).attr("data-oId"),
										'newOrderId' : $(this).index() + 1
									});
								});

							}

							if (optionTexts.length != 0) {
								widgetsNewOrder
										.push({
											'menuId' : $sessionStorage.menuList[menu].menuId,
											'menuWidgetsList' : optionTexts
										});
							}

						}

						var updateWOResp = loginService.updateWOInDB(
								$sessionStorage.projectId, $scope.user_role_id,
								widgetsNewOrder, "standard");

						updateWOResp
								.then(function(resp) {
									if (resp.data === "success") {
										for (var i = 0; i < $sessionStorage.UserWidgetsInfo.length; i++) {
											for (var j = 0; j < widgetsList.length; j++) {
												if (widgetsList[j].prwmId == $sessionStorage.UserWidgetsInfo[i].prwmId) {
													$sessionStorage.UserWidgetsInfo[i].widget_order_number = widgetsList[j].newOrderId;
												}
											}
										}
										$timeout(
												function() {
													$scope.message = "Order Changed Successfully!";
													$('#ordersModal').modal(
															'show');
												}, 100);
									} else {
										$scope.message = "Order Not Changed Successfully!";
										$('#ordersModal').modal('show');
									}
								});
					}

					$scope.mdwUpdateOrder = function() {
						var optionTexts = [];
						$("#mdbWidgetOrder li").each(function() {
							optionTexts.push({
								'name' : $(this).text(),
								'widId' : $(this).attr("data-wId"),
								'dbOrderId' : $(this).attr("data-wId"),
								'cwId' : $(this).attr("data-cwId"),
								'newOrderId' : $(this).index() + 1
							})
						});

						var updateWOResp = loginService.updateWOInDB(
								$sessionStorage.projectId, $scope.user_role_id,
								optionTexts, "custom");
						updateWOResp
								.then(function(resp) {

									if (resp.data === "success") {

										for (var i = 0; i < $sessionStorage.MyDashboardWidgetInfo.length; i++) {
											for (var j = 0; j < optionTexts.length; j++) {
												if (optionTexts[j].cwId == $sessionStorage.MyDashboardWidgetInfo[i].customWidgetId) {
													$sessionStorage.MyDashboardWidgetInfo[i].customWidgetOrderNo = optionTexts[j].newOrderId;
												}
											}
										}

										$scope.message = "Order Changed Successfully!";
										$('#ordersModal').modal('show');
									} else {
										$scope.message = "Order Not Changed Successfully!";
										$('#ordersModal').modal('show');
									}
								});
					}

					$(document)
							.ready(
									function() {

										var panels = $('.user-infos');
										var panelsButton = $('.dropdown-user');
										panels.hide();

										// Click dropdown
										panelsButton
												.click(function() {
													// get data-for attribute
													var dataFor = $(this).attr(
															'data-for');
													var idFor = $(dataFor);

													// current button
													var currentButton = $(this);
													idFor
															.slideToggle(
																	400,
																	function() {
																		// Completed
																		// slidetoggle
																		if (idFor
																				.is(':visible')) {
																			currentButton
																					.html('<i class="glyphicon glyphicon-chevron-up text-muted"></i>');
																		} else {
																			currentButton
																					.html('<i class="glyphicon glyphicon-chevron-down text-muted"></i>');
																		}
																	})
												});

										$('[data-toggle="tooltip"]').tooltip();

										$("#dbWidgetOrder").sortable();
										$("#mdbWidgetOrder").sortable();

									});
					
					$scope.getDefaultProjectflag = function(){
						
						var selectedProjId = $('#selectProject').find(":selected").val();
						$scope.boards = [];
						for ( var menu in $sessionStorage.menuList) {
							if (selectedProjId == $sessionStorage.menuList[menu].projectId) {	
								$scope.defaultBoard = $sessionStorage.menuList[menu].defaultMenu;
								$scope.boards
								.push({
									"id" : $sessionStorage.menuList[menu].menuId,
									"boardName" : $sessionStorage.menuList[menu].menuName
								});
							}
						}
					}

					$scope.validate = function() {
						var emailId = $scope.email;
						var emailPattern = /^[a-zA-Z](([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						var flag = true;
						if (emailId == "") {
							$scope.emailMessage = "Please Enter EmailId";
							flag = false;
						}

						else if (!emailId.match(emailPattern)) {
							$scope.emailMessage = "Please Enter Valid Email Address";
							flag = false;
						}

						else if (emailId.match(emailPattern)) {
							$scope.emailMessage = "";
							flag = true;
						}
						return flag;

					}

					// dashboard reorder settings

					jQuery(".panel_color_def")
							.append(
									$compile(
											'<div class="panel-heading" style=""><ul class="nav nav-tabs nav-default"></ul></div><div class="panel-body" style="overflow: auto !important"><div class="tab-content div-body"></div></div>')
											($scope));

					var menuWidgetsObj = [];
					var arrayPush = [];

					$scope.UserWidgetsInfo = $sessionStorage.UserWidgetsInfo.concat($sessionStorage.MyDashboardWidgetInfo);
					
					console.log("$scope.UserWidgetsInfo-------------602----------",$scope.UserWidgetsInfo);

					$scope.boards = [];

					for ( var menu in $sessionStorage.menuList) {

						if ($sessionStorage.menuList[menu].menuName != undefined
								&& $sessionStorage.menuList[menu].menuName !== "Mydashboard"
								&& $sessionStorage.menuList[menu].menuName !== "Doodah") {

							if ($sessionStorage.defaultprojectId == $sessionStorage.menuList[menu].projectId) {
								jQuery(".nav-default")
										.append(
												$compile(
														'<li id="'
																+ $sessionStorage.menuList[menu].menuId
																+ '"><a data-target="#menu_'
																+ $sessionStorage.menuList[menu].menuId
																+ '" data-toggle="tab">'
																+ $sessionStorage.menuList[menu].menuName
																+ '</a></li>')(
														$scope));

								$scope.boards
										.push({
											"id" : $sessionStorage.menuList[menu].menuId,
											"boardName" : $sessionStorage.menuList[menu].menuName
										});

							}
						}
					}

					$scope.defaultId = 0;
					for ( var menu in $sessionStorage.menuList) {
						var widgetsList = '';

						for ( var key in $scope.UserWidgetsInfo) {
							
							if ($scope.UserWidgetsInfo[key].customWidgetId != undefined) {
							if ($scope.UserWidgetsInfo[key].menuid == $sessionStorage.menuList[menu].menuId) {
								
									widgetsList += ' <li class="dropbtn ng-binding ng-scope" ng-if="opt.id != 0" data-prwmid="'
										+ $scope.UserWidgetsInfo[key].prwmId
										+ '" data-wid="'
										+ $scope.UserWidgetsInfo[key].prwmId
										+ '" data-oid="'
										+ $scope.UserWidgetsInfo[key].widget_order_number
										+ '"><i class="fa fa-arrows mRight"></i>'
										+ $scope.UserWidgetsInfo[key].widgetName
										+ '</li>';
								}
							}else{
								if ($scope.UserWidgetsInfo[key].menuid == $sessionStorage.menuList[menu].menuId) {
									widgetsList += ' <li class="dropbtn ng-binding ng-scope" ng-if="opt.id != 0" data-prwmid="'
										+ $scope.UserWidgetsInfo[key].prwmId
										+ '" data-wid="'
										+ $scope.UserWidgetsInfo[key].prwmId
										+ '" data-oid="'
										+ $scope.UserWidgetsInfo[key].widget_order_number
										+ '"><i class="fa fa-arrows mRight"></i>'
										+ $scope.UserWidgetsInfo[key].name
										+ '</li>';
								}
							}
								

								$scope.defaultId = $sessionStorage.menuList[menu].defaultMenu;

							
						}

						jQuery(".div-body")
								.append(
										$compile(
												'<div class="tab-pane fade" id="menu_'
														+ $sessionStorage.menuList[menu].menuId
														+ '"><ol class="dbWidgetOrder" id="dbWidgetOrder_'
														+ $sessionStorage.menuList[menu].menuId
														+ '" ng-model="items" class="lists">'
														+ widgetsList
														+ '</ol></div>')
												($scope));

					}

					$timeout(function() {
						$scope.defaultBoard = $scope.defaultId;
						$(".dbWidgetOrder").sortable();

					}, 100);

					$("ul.nav-default li").first().addClass('active');
					var id = $("ul.nav-default li").attr("id");
					$("#menu_" + id).addClass("in active");

					$timeout(function() {
						$("#rightsidebar li").removeClass('menu_active');
						$("#sidebar li").removeClass('menu_active');
					}, 100);
					// remove active class in sidebar

				});