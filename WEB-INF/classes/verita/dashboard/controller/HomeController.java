package verita.dashboard.controller;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import verita.bean.CustomWidget;
import verita.bean.DatacenterValueTemplateWidgetMap;
import verita.bean.DatacenterWidgetMap;
import verita.bean.UploadedFile;
import verita.daointerface.CustomWidgetDao;
import verita.dashboard.daoservice.CustomWidgetService;
import verita.dashboard.daoservice.LoginService;
import verita.dashboard.daoservice.ProjectService;
import verita.dashboard.service.DashboardService;
import verita.rest.uri.constants.DevOpsRestURIConstants;

/**
 * @author E001285
 *
 */
@Controller
@Scope("prototype")
public class HomeController {
	static final Logger LOGGER = Logger.getLogger(HomeController.class);

	@Autowired
	private LoginService loginservice;
	@Autowired
	private ProjectService projectService;
	@Autowired
	private DashboardService dashboardservice;
	@Autowired
	private CustomWidgetDao customWidgetsDao;
	@Autowired
	private CustomWidgetService customWidgetService;

	/**
	 * @return String
	 */
	@RequestMapping("/")
	public String index() {

		return "index";
	}

	/**
	 * @param name
	 *            String
	 * @param pwd
	 *            String
	 * @return String
	 * @throws JSONException
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.GETLOGIN, method = RequestMethod.GET)
	public @ResponseBody String getLogin(@PathVariable("name") final String name, @PathVariable("pwd") final String pwd)
			throws JSONException {
		LOGGER.info("start of getlogin method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		JSONObject object = loginservice.getUserDetails(name, pwd);
		if (object != null) {
			return object.toString();
		}
		LOGGER.info("end of getlogin method");
		return null;
	}

	/**
	 * @param userId
	 *            String
	 * @param projectId
	 *            String
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.POSTLOGIN, method = RequestMethod.GET)
	@ResponseBody
	public String postLogin(@PathVariable("userId") final String userId,
			@PathVariable("projectId") final String projectId, HttpServletRequest request) throws Exception {
		LOGGER.info("start of postlogin method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		String fileDest = request.getServletContext().getRealPath("/WEB-INF/views/assets/images");
		JSONArray array = dashboardservice.getRoleBasedWidgetDetails(Long.valueOf(projectId), Long.valueOf(userId),
				fileDest);
		if (array != null) {
			return array.toString();
		}
		LOGGER.info("end of postlogin method");
		return null;
	}

	/**
	 * @param datacenterWidgetId
	 *            long
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.DASHBOARD, method = RequestMethod.GET)
	@ResponseBody
	public String getDashboardWidgetData(@PathVariable("datacenter_widget_id") final long datacenterWidgetId)
			throws Exception {
		LOGGER.info("start of getdashboardwidgetdata method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		LOGGER.info("end of getdashboardwidgetdata method");
		String dataObj = dashboardservice.getWidgetData(datacenterWidgetId, null);
		System.out.println("dataObj " + dataObj);
		return dataObj;
	}

	/**
	 * @param datacenterWidgetId
	 *            long
	 * @param type
	 *            String
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.DASHBOARDWITHTYPE, method = RequestMethod.GET)
	@ResponseBody
	public String getDashboardWidgetData(@PathVariable("datacenter_widget_id") final long datacenterWidgetId,
			@PathVariable("type") final String serviceType) throws Exception {
		LOGGER.info("start of getdashboardwidgetdata method with type as parameter");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		LOGGER.info("end of getdashboardwidgetdata method with type as parameter");
		return dashboardservice.getWidgetData(datacenterWidgetId, serviceType);
	}

	/**
	 * @param userid
	 *            long
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.MYDASHBOARD, method = RequestMethod.GET)
	@ResponseBody
	public String getUserwidgets(@PathVariable("userid") final long userid) throws Exception {
		LOGGER.info("start of getuserwidgets method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		LOGGER.info("end of getuserwidgets method");
		return null;
	}

	/**
	 * @param dwmBean
	 *            DatacenterWidgetMap
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.EDITWIDGET, method = RequestMethod.POST, headers = {
			"Content-type=application/json" })
	@ResponseBody
	public String editWidget(@RequestBody final DatacenterWidgetMap dwmBean) throws Exception {

		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");

		return new ObjectMapper().writeValueAsString(dashboardservice.editDWMDetails(dwmBean));
	}

	/**
	 * @param dwmBean
	 *            DatacenterValueTemplateWidgetMap
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.EDIT_VALUE_TEMPLATE_WIDGET, method = RequestMethod.POST, headers = {
			"Content-type=application/json" })
	@ResponseBody
	public String editValueTemplateWidget(@RequestBody final DatacenterValueTemplateWidgetMap dwmBean)
			throws Exception {
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		return new ObjectMapper().writeValueAsString(dashboardservice.editValueTemplateDetails(dwmBean));
	}

	/**
	 * @param dwmBean
	 *            DatacenterWidgetMap
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.EDITCUSTOMWID, method = RequestMethod.POST, headers = {
			"Content-type=application/json" })
	@ResponseBody
	public String editCustomWidget(@RequestBody final DatacenterWidgetMap dwmBean) throws Exception {

		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");

		return new ObjectMapper().writeValueAsString(dashboardservice.editTemplateDetails(dwmBean));
	}

	/**
	 * @param restURL
	 *            String
	 * @param restUserName
	 *            String
	 * @param restPassword
	 *            String
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.CUSTOMURLDATA, method = RequestMethod.GET)
	@ResponseBody
	public String getCustomURLData(@RequestParam("restURL") final String restURL,
			@PathVariable("restUserName") final String restUserName,
			@PathVariable("restPassword") final String restPassword, @PathVariable("url") final String url)
					throws Exception {
		LOGGER.info("start of getcustomURLData method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		LOGGER.info("end of getcustomURLData method");
		String finalResponse = customWidgetService.customURLData(restURL, restUserName, restPassword, url);
		LOGGER.info("response-------" + finalResponse);
		return finalResponse;
	}

	/**
	 * @param userId
	 *            String
	 * @param projectId
	 *            int
	 * @return String
	 * @throws JsonGenerationException
	 *             Exception
	 * @throws JsonMappingException
	 *             Exception
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.GET_CUSTOMWIDGET, method = RequestMethod.GET)
	public @ResponseBody String getCustomWidgets(@PathVariable("user_id") final String userId,
			@PathVariable("project_id") final int projectId)
					throws JsonGenerationException, JsonMappingException, Exception {
		LOGGER.info("start of getCustomWidgets method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		org.json.JSONArray array = customWidgetsDao.listCustomWidgets(userId, projectId);
		if (array != null) {
			return array.toString();
		}
		LOGGER.info("end of getCustomWidgets method");
		return null;
	}

	/**
	 * @param widgetid
	 *            int
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.DELETE_CUSTOM_WIDGET, method = RequestMethod.GET)
	public @ResponseBody String deleteMyWidget(@PathVariable("widgetId") final int widgetid) throws Exception {
		LOGGER.info("start of deleteMyWidget method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		int result = customWidgetsDao.deleteCustomWidget(widgetid);
		String mapAsJson = new ObjectMapper().writeValueAsString(result);
		LOGGER.info("end of deleteMyWidget method");
		return mapAsJson;
	}

	/**
	 * @param customWidgets
	 *            CustomWidget
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.ADDCUSTOMWIDGET, method = RequestMethod.POST, headers = {
			"Content-type=application/json" })
	@ResponseBody
	public String addCustomWidgets(@RequestBody final CustomWidget customWidgets) throws Exception {
		LOGGER.info("start of addCustomWidget method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		LOGGER.info("end of addCustomWidget method");
		return new ObjectMapper().writeValueAsString(customWidgetService.customWidgetDetails(customWidgets));
	}

	/**
	 * @param upFile
	 *            UploadedFile
	 * @return String
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.UPLOADCUSTOMFILE, method = RequestMethod.POST, headers = {
			"Content-type=application/json" })
	public @ResponseBody String upload(@RequestBody final UploadedFile upFile) {
		LOGGER.info("start of upload method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		File savedFile = customWidgetService.convert(upFile);
		String mapAsJson = null;
		try {
			mapAsJson = new ObjectMapper().writeValueAsString(savedFile.getName());
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		LOGGER.info("end of upload method");
		return mapAsJson;

	}

	/**
	 * @param userId
	 *            String
	 * @param projectId
	 *            String
	 * @param upmId
	 *            String
	 * @return String
	 * @throws JsonGenerationException
	 *             Exception
	 * @throws JsonMappingException
	 *             Exception
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.GET_PROFILE, method = RequestMethod.GET)
	@ResponseBody
	public String getProfiles(@PathVariable("user_id") final String userId,
			@PathVariable("projectId") final String projectId, @PathVariable("upmId") final String upmId)
					throws JsonGenerationException, JsonMappingException, Exception {
		LOGGER.info("start of getProfiles method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		LOGGER.info("end of getProfiles method");
		return loginservice.getProfile(Integer.parseInt(userId), Integer.parseInt(projectId), Integer.parseInt(upmId));

	}

	/**
	 * @param userId
	 *            String
	 * @param dProejctId
	 *            String
	 * @param themeName
	 *            String
	 * @return String
	 * @throws JsonGenerationException
	 *             Exception
	 * @throws JsonMappingException
	 *             Exception
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.UPDATE_DEFAULT_THEME, method = RequestMethod.GET)
	@ResponseBody
	public String updateTheme(@PathVariable("user_id") final String userId,
			@PathVariable("dProejctId") final String dProejctId, @PathVariable("themeName") final String themeName)
					throws JsonGenerationException, JsonMappingException, Exception {
		LOGGER.info("start of updateTheme method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		int response = loginservice.updateUserDeafultTheme(userId, dProejctId, themeName);
		LOGGER.info("end of updateTheme method");
		return new ObjectMapper().writeValueAsString(response);

	}

	/**
	 * @param userPwd
	 *            String
	 * @param userId
	 *            String
	 * @return String
	 * @throws JsonGenerationException
	 *             Exception
	 * @throws JsonMappingException
	 *             Exception
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.UPDATE_PWD, method = RequestMethod.GET)
	@ResponseBody
	public String rstpwd(@PathVariable("user_pwd") final String userPwd, @PathVariable("user_id") final String userId)
			throws JsonGenerationException, JsonMappingException, Exception {
		LOGGER.info("start of rstpwd method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		Object obj = loginservice.updtepswrd(userPwd, userId);
		LOGGER.info("end of rstpwd method");
		return new ObjectMapper().writeValueAsString(obj);

	}

	/**
	 * @param projectId
	 *            String
	 * @param roleId
	 *            String
	 * @param widgetOUBean
	 *            String
	 * @return String
	 * @throws JsonGenerationException
	 *             Exception
	 * @throws JsonMappingException
	 *             Exception
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.UPDATE_WIDGETS_ORDER, method = RequestMethod.GET)
	@ResponseBody
	public String updateWidgetOrder(@PathVariable("projectId") final String projectId,
			@PathVariable("role_id") final String roleId, @PathVariable("widgetOUBean") final String widgetOUBean)
					throws JsonGenerationException, JsonMappingException, Exception {
		LOGGER.info("start of updateWidgetOrder method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		String resp = null;

		String widgetType = (String) (new org.json.JSONObject(widgetOUBean).get("wType"));
		if (widgetType.equals("standard")) {
			org.json.JSONArray obj = new org.json.JSONObject(widgetOUBean).getJSONArray("data");
			for (int i = 0; i < obj.length(); i++) {
				org.json.JSONArray menuWidgetsList = obj.getJSONObject(i).getJSONArray("menuWidgetsList");
				resp = loginservice.updteWidgetOrder(projectId, roleId, menuWidgetsList, widgetType);
				System.out.println(menuWidgetsList);
				System.out.println(resp);
			}

		} else {
			org.json.JSONObject obj = new org.json.JSONObject(widgetOUBean);
			org.json.JSONArray array = new org.json.JSONArray();
			array.put(obj.get("data"));
			resp = loginservice.updteWidgetOrder(projectId, roleId, array, widgetType);

		}

		LOGGER.info("end of updateWidgetOrder method");
		return new ObjectMapper().writeValueAsString(resp);
	}

	/**
	 * @param userId
	 *            long
	 * @param response
	 *            HttpServletResponse
	 * @param request
	 *            HttpServletRequest
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.GETUSERIMG, method = RequestMethod.GET)
	public void showImageForUser(@PathVariable("id") final long userId, final HttpServletResponse response,
			final HttpServletRequest request) {
		LOGGER.info("start of showImageForUser method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		byte[] pb = loginservice.getUserById(userId).getUserImage();
		if (pb != null) {
			response.setContentType("image/jpeg, image/jpg, image/png, image/gif");
			try {
				response.getOutputStream().write(customWidgetService.toPrimitives(pb));
				response.getOutputStream().close();
			} catch (IOException e) {
				StringWriter stack = new StringWriter();
				e.printStackTrace(new PrintWriter(stack));
				LOGGER.error(stack);
			}
		}
		LOGGER.info("end of showImageForUser method");
	}

	/**
	 * @param projectId
	 *            long
	 * @param response
	 *            HttpServletResponse
	 * @param request
	 *            HttpServletRequest
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.GETPROJECTIMG, method = RequestMethod.GET)
	public void showImageForProject(@PathVariable("id") final long projectId, final HttpServletResponse response,
			final HttpServletRequest request) {
		LOGGER.info("start of showImageForProject method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		byte[] pb = projectService.getProjectById(projectId).getProjectImage();
		if (pb != null) {
			response.setContentType("image/jpeg, image/jpg, image/png, image/gif");
			try {
				response.getOutputStream().write(customWidgetService.toPrimitives(pb));
				response.getOutputStream().close();
			} catch (IOException e) {
				StringWriter stack = new StringWriter();
				e.printStackTrace(new PrintWriter(stack));
				LOGGER.error(stack);
			}
		}
		LOGGER.info("end of showImageForProject method");
	}

	/**
	 * @param projectId
	 *            long
	 * @return String
	 * @throws Exception
	 *             Exception
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.GET_TOOLDETAILS_CUSTOM, method = RequestMethod.GET)
	public @ResponseBody String getCustomToolData(@PathVariable("projectId") final long projectId) throws Exception {
		LOGGER.info("start of getCustomToolData method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		org.json.JSONObject jj = customWidgetService.getCustomToolsData(projectId);
		LOGGER.info(jj + " ggggggg");
		LOGGER.info("end of getCustomToolData method");
		return jj.toString();
	}

	// Default Settings

	/**
	 * @param projectId
	 *            String
	 * @param userId
	 *            String
	 * @param pageName
	 *            String
	 * @param themeName
	 *            String
	 * @return String
	 * @throws JsonGenerationException
	 *             json
	 * @throws JsonMappingException
	 *             json
	 * @throws Exception
	 *             all
	 */
	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.UPDATE_DEFAULT_SETTINGS, method = RequestMethod.GET)
	@ResponseBody
	public String updateDefaultSet(@PathVariable("projectId") final String projectId,
			@PathVariable("user_id") final String userId, @PathVariable("pageName") final String pageName,
			@PathVariable("themeName") final String themeName, @PathVariable("defaultBoard") final String defaultBoard)
					throws JsonGenerationException, JsonMappingException, Exception {
		LOGGER.info("start of updateDefaultSettings method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		Object obj = loginservice.updateDefaultSettings(projectId, userId, pageName, themeName, defaultBoard);
		LOGGER.info("end of updateDefaultSet method");
		return new ObjectMapper().writeValueAsString(obj);
	}

	/**
	 * @param file
	 *            object
	 * @param userData
	 *            String
	 * @return String
	 * @throws IOException
	 *             i/o
	 * @throws JSONException
	 *             json
	 */
	@CrossOrigin

	@RequestMapping(value = DevOpsRestURIConstants.UPDATE_PERSONAL_DETAILS, method = RequestMethod.POST)
	public @ResponseBody String updatePersonalDet(@RequestParam("file") final Object file,
			@RequestParam("data") final String userData) throws JSONException, IOException {
		LOGGER.info("start of upload method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		org.json.JSONObject obj = new org.json.JSONObject(userData);
		String res = null;
		if (file.toString().equalsIgnoreCase("na")) {
			res = loginservice.updatePersonalDetail(obj, null);
		} else {
			MultipartFile fileData = (MultipartFile) file;
			res = loginservice.updatePersonalDetail(obj, fileData.getBytes());
		}

		return new ObjectMapper().writeValueAsString(res);

	}

	@CrossOrigin
	@RequestMapping(value = DevOpsRestURIConstants.UPDATE_JSON_FILE_FROM_LIVE, method = RequestMethod.POST, headers = {
			"Content-type=application/json" })
	@ResponseBody
	public String updateJsonFileFromLive(@RequestBody final CustomWidget customWidgets) throws Exception {
		LOGGER.info("start of addCustomWidget method");
		HttpHeaders header = new HttpHeaders();
		header.add("Access-Control-Allow-Origin", "*");
		LOGGER.info("end of addCustomWidget method");
		customWidgetService.updateJsonFileFromLive(customWidgets.getCustFileRealPath(), customWidgets.getCustFilePath(),
				customWidgets.getSheetName());
		return null;
	}

}
