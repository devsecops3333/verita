mainApp.service('customwidgetService', function($http) {
	var AJAX_CONSTANT = API_URI.CUSTOM_SVC_API;
	return {

		/**
		 * Creating New Widget From Doodah
		 */
		postCustomWidgetDetails : function(dataObj) {
			return $http({
				method : "POST",
				url : AJAX_CONSTANT.ADD_CUSTOM_WIDGET,
				data : dataObj
			});
		},
		/**
		 * getting Widgets in MyDashboard
		 */
		getCustomWidgets : function(userId, projectId) {
			return $http.get(AJAX_CONSTANT.GET_CUSTOMWIDGET_TO_MYDASHBOARD
					+ userId + "/" + projectId);
		},
		/**
		 * getting Widgets in MyDashboard
		 */
		getChartData : function(source_url) {
			console.log("source_url====", source_url);
			return $http.get(source_url);

		},
		/**
		 * Deleting Widgets From MYDashboard
		 */
		deleteCustomWidget : function(widgetId) {
			return $http.get(AJAX_CONSTANT.DELETE_CUSTOM_WIDGET + widgetId);
		},
		/**
		 * Getting JSON From CSV File
		 */

		getChartDataFromCSV : function(filePath, realPath, sheetName) {

			var dataObj = {
				custFilePath : filePath.split('customFiles/')[1],
				custFileRealPath : realPath,
				sheetName : sheetName,
			};

			return $http({
				method : "POST",
				url : "devops/rest/updateJsonFile",
				data : dataObj
			}).then(function() {
				// execute this code regardless of outcome
				console.log("filepath-===", dataObj);
				return $http.get(filePath);
			});
		},
		/**
		 * Saving DataSet as JSON File
		 */
		uploadCustomFile : function(dataObj1) {
			return $http({
				method : "POST",
				contentType : "application/json",
				url : AJAX_CONSTANT.UPLOAD_CUSTOM_FILE,
				data : dataObj1
			});
		},
		getToolsDetails : function(projectId) {
			return $http.get(AJAX_CONSTANT.GET_TOOL_DATA + projectId);

		},
		getDataCenterDetails : function(toolId) {
			return $http.get(AJAX_CONSTANT.GET_DATACENTER_DETAILS + toolId);

		},
		getCustomDataCenters : function(userId) {

			return $http.get(AJAX_CONSTANT.GET_CUSTOM_DATACENTER + userId);

		},

	}
});
