package verita.rest.uri.constants;

/**
 * @author e001272
 *
 */
public final class DevOpsRestURIConstants {

	public static final String GETLOGIN = "devops/rest/login/{name}/{pwd}";
	public static final String POSTLOGIN = "devops/rest/logincheck/{userId}/{projectId}";
	public static final String GETUSERIMG = "devops/rest/uimg/{id}";
	public static final String GETPROJECTIMG = "devops/rest/pimg/{id}";

	/* QC(ALM) */
	public static final String PRESCRIPTIVEANALYSIS = "devops/rest/prescriptiveAnalysis";

	public static final String ADDCUSTOMWIDGET = "devops/rest/addCustomWidget";
	public static final String UPLOADCUSTOMFILE = "devops/rest/upload";
	public static final String GET_CUSTOMWIDGET = "devops/rest/getCustomWidgets/{user_id}/{project_id}";
	public static final String DELETE_CUSTOM_WIDGET = "devops/myDashboard/deleteMyWidget/{widgetId}";

	public static final String EDITWIDGET = "devops/rest/editWidget";
	public static final String EDIT_VALUE_TEMPLATE_WIDGET = "devops/rest/editValueTemplateWidget";
	public static final String EDITCUSTOMWID = "devops/rest/editCustomWidget";
	public static final String DASHBOARD = "devops/rest/dashboard/{datacenter_widget_id}";
	public static final String MYDASHBOARD = "devops/rest/mydashboard/{userid}";
	public static final String CUSTOMURLDATA = "devops/rest/customURL/{restUserName}/{restPassword}/{url}";
	public static final String DASHBOARDWITHTYPE = "devops/rest/dashboard/{datacenter_widget_id}/{type}";

	public static final String GET_PROFILE = "devops/rest/getProfiles/{user_id}/{projectId}/{upmId}";
	public static final String UPDATE_PWD = "devops/rest/rstpwd/{user_pwd}/{user_id}";
	public static final String UPDATE_WIDGETS_ORDER = "devops/rest/updtWO/{projectId}/{role_id}/{widgetOUBean}";
	public static final String UPDATE_DEFAULT_THEME = "devops/rest/updateDefaultTheme/{user_id}/{dProejctId}/{themeName}";

	// to save data to db
	public static final String UPDATE_DEFAULT_SETTINGS = "devops/rest/updateDefaultSet/{projectId}/{user_id}/{pageName}/{themeName}/{defaultBoard}";
	public static final String UPDATE_PERSONAL_DETAILS = "devops/rest/updatePersonalDetails";

	public static final String GET_TOOLDETAILS_CUSTOM = "devops/rest/customToolsDetails/{projectId}";
	public static final String GET_DATACENTERDETAILS_CUSTOM = "devops/rest/customDataCenterDetails/{toolId}";
	public static final String GET_CUSTOM_DATACENTERS = "devops/rest/getCustomDataCenters/{userId}";
	public static final String DELETE_CUSTOM_DATACENTERS = "devops/rest/deleteCustomDataCenters/{dcId}";
	
	public static final String UPDATE_JSON_FILE_FROM_LIVE = "devops/rest/updateJsonFile";
	

	/**
	 * Constructor.
	 */
	private DevOpsRestURIConstants() {
	}

}
