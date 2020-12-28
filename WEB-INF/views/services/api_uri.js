var API_URI = {
	LOGIN_API : {
		GET_LOGIN : 'devops/rest/login/',
		POST_LOGIN : 'devops/rest/logincheck/',
		GET_PROFILE : 'devops/rest/getProfiles/',
		UPDATE_PASSWORD : 'devops/rest/rstpwd/',
		UPDATE_THEME : 'devops/rest/updateDefaultTheme/',
		UPDATE_WIDGET_ORDER : 'devops/rest/updtWO/',
		UPDATE_DEFAULT_SETTING : 'devops/rest/updateDefaultSet/',
		UPDATE_PERSONAL_DETAILS : 'devops/rest/updatePersonalDetails',
	},
	WIDGET_SVC_API : {
		GET_WIDGET_DATA : 'devops/rest/dashboard/',
		GET_GANTTCHART_DATA : 'views/customFiles/',
		EDIT_STANDARD_WIDGET : 'devops/rest/editWidget',
		EDIT_VALUE_TEMPLETE_WIDGET : 'devops/rest/editValueTemplateWidget',
		EDIT_CUSTOM_WIDGET : 'devops/rest/editCustomWidget',
	},
	CUSTOM_SVC_API : {
		ADD_CUSTOM_WIDGET : 'devops/rest/addCustomWidget',
		GET_CUSTOMWIDGET_TO_MYDASHBOARD : 'devops/rest/getCustomWidgets/',
		DELETE_CUSTOM_WIDGET : 'devops/myDashboard/deleteMyWidget/',
		UPLOAD_CUSTOM_FILE : 'devops/rest/upload',
		GET_TOOL_DATA : 'devops/rest/customToolsDetails/',
		GET_DATACENTER_DETAILS : 'devops/rest/customDataCenterDetails/',
		GET_CUSTOM_DATACENTER : 'devops/rest/getCustomDataCenters/',
	},
	MESSAGES :{
		CONTACT_PROJECT_ADMIN : 'Please Contact Project Admin',
		NO_DATA_FOUND : 'No Data Found',
		NO_DATA_FOUND_RELOAD : 'No Data Found Please reload to get the data',
		NO_GRAPH_PROPERTIES : "Please Configure Graph Properties"
	}

};