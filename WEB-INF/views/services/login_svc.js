mainApp.service('loginService', function($http) {
	var AJAX_CONSTANT = API_URI.LOGIN_API;
	return {
		/**
		 * Validating User Credentials
		 */
		getLogin : function(userName, passWord) {
			return $http.get(AJAX_CONSTANT.GET_LOGIN + userName + "/"
					+ passWord + "");
		},
		/**
		 * Getting User Role and Widgets Details
		 */
		postLogin : function(projectId, userId) {

			return $http({
				method : "GET",
				url : AJAX_CONSTANT.POST_LOGIN + userId + "/" + projectId
			});

		},
		/**
		 * Getting User Profile Details
		 */
		getProfile : function(userId, projectId, upmId) {
			return $http.get(AJAX_CONSTANT.GET_PROFILE + userId + "/"
					+ projectId + "/" + upmId);
		},
		/**
		 * Updating USer Password
		 */
		updatepwd : function(userpwd, userId) {
			return $http.get(AJAX_CONSTANT.UPDATE_PASSWORD + userpwd + "/"
					+ userId + "");
		},
		/**
		 * Switching the Theme
		 */
		updateTheme : function(userId, projectId, themeName) {
			return $http.get(AJAX_CONSTANT.UPDATE_THEME + userId + "/"
					+ projectId + "/" + themeName);
		},
		/**
		 * Changing Widget Order
		 */
		updateWOInDB : function(projectId, roleId, widOrdArr, woType) {

			var obj = {
				'wType' : woType,
				'data' : widOrdArr
			}
			return $http.get(AJAX_CONSTANT.UPDATE_WIDGET_ORDER + projectId
					+ "/" + roleId + "/" + JSON.stringify(obj));
		},

		// update after clicking on save

		updateDefaultSettings : function(projectId, userId, pageName,
				themeName, defaultBoard) {
			return $http.get(AJAX_CONSTANT.UPDATE_DEFAULT_SETTING + projectId
					+ "/" + userId + "/" + pageName + "/" + themeName + "/"
					+ defaultBoard);
		},

		// update personal details to DB

		updatePersonalDetails : function(fd) {

			return $http.post(AJAX_CONSTANT.UPDATE_PERSONAL_DETAILS, fd, {
				transformRequest : angular.identity,
				headers : {
					'Content-Type' : undefined
				}
			});

		}
	}

});
