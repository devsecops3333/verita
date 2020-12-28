package verita.dashboard.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.hibernate.SessionFactory;
import org.json.JSONException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import verita.bean.DatacenterValueTemplateWidgetMap;
import verita.bean.DatacenterWidgetMap;
import verita.common.service.VeritaServiceFactory;
import verita.daointerface.CustomWidgetDao;
import verita.dashboard.dao.impl.CustomWidgetDaoImpl;
import verita.dashboard.dao.impl.DataCenterDaoImpl;
import verita.dashboard.dao.impl.DataCenterWidgetDaoImpl;
import verita.dashboard.dao.impl.ProjectDaoImpl;
import verita.dashboard.dao.impl.UserChartInfoDAOImpl;
import verita.dashboard.daoservice.DBConfigureService;
import verita.model.CustomWidgetModel;
import verita.model.DataCenterWidgetMap;
import verita.model.DomainProjectMap;
import verita.model.ProjectRoleMenuWidgetMap;
import verita.model.ProjectRoleUserMap;
import verita.model.UserChartInfo;

/**
 * @author e001272
 *
 */
@Service
public class DashboardService {

	static final Logger LOGGER = Logger.getLogger(DashboardService.class);

	@Autowired
	private DataCenterDaoImpl datacenterimpl;
	@Autowired
	private DataCenterWidgetDaoImpl datacenterwidgetImpl;
	@Autowired
	private DBConfigureService dbConfigService;
	@Autowired
	private ProjectDaoImpl projectDaoImpl;
	@Autowired
	private UserChartInfoDAOImpl userChartImpl;
	@Autowired
	private CustomWidgetDao customWidgetsDao;
	private SessionFactory secSessionFactory;
	private String url = null;

	@Autowired
	private CustomWidgetDaoImpl customWidgetDaoImpl;

	@Autowired
	private ADAuthenticationService adAuthenticationService;

	/**
	 * @param projectId
	 *            long
	 * @param userId
	 *            long
	 * @param fileDest
	 * @return JSONArray
	 * @throws IOException
	 * @throws JSONException
	 */
	@SuppressWarnings("unchecked")
	public JSONArray getRoleBasedWidgetDetails(final long projectId, final long userId, String fileDest)
			throws IOException, JSONException {
		LOGGER.debug("Start of getRoleBasedWidgetDetails method");
		JSONArray jsonArray = null;

		ProjectRoleUserMap projectRoleUserMap = datacenterimpl.getRoleByProjectIdAndUserId(projectId, userId);
		if (projectRoleUserMap == null) {
			jsonArray = new JSONArray();
			JSONObject object = new JSONObject();
			object.put("errorStatus", "Yes");
			object.put("errorMessage", "User Role not defined! Please contact Project Admin");
			jsonArray.add(object);
			return jsonArray;
		}
		// Integer projId = (int) (long) projectId;
		// org.json.JSONArray array =
		// customWidgetsDao.listCustomWidgets(Long.toString(userId), projId);

		List<ProjectRoleMenuWidgetMap> projectRoleWidgetMapList = datacenterimpl
				.getProjectRoleWidgetsByRoleId(projectRoleUserMap.getRoleId(), projectId);

		if (projectRoleWidgetMapList != null && projectRoleWidgetMapList.size() > 0) {
			jsonArray = new JSONArray();
			DomainProjectMap dpmap = projectDaoImpl.getDomainByPId(projectId);
			for (ProjectRoleMenuWidgetMap projectRoleWidgetMap : projectRoleWidgetMapList) {
				if (projectRoleWidgetMap.getWidgetId() > 0) {
					DataCenterWidgetMap dataCenterWidgetMap = datacenterimpl
							.getDataCenterWidgetMapByProjectRoleWidgetId(projectRoleWidgetMap.getWidgetId());
					JSONObject object = new JSONObject();
					if (dataCenterWidgetMap != null) {
						object.put("datacenter_widget_id", dataCenterWidgetMap.getId());
						object.put("datacenter_id", dataCenterWidgetMap.getDataCenterMaster().getId());
						object.put("datacenter_widget_param", dataCenterWidgetMap.getDatacenterWidgetParam());
						object.put("projectWidgetMap_id", dataCenterWidgetMap.getProjectWidgetMapId());
						object.put("prwmId", projectRoleWidgetMap.getId());
						object.put("id", projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getId());
						object.put("template",
								projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getWidgetTemplate());
						object.put("widget_order_number", projectRoleWidgetMap.getWidgetOrderNumber());
						object.put("prwm_id", projectRoleWidgetMap.getWidgetId());
						object.put("type", projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getType());
						object.put("domainName", dpmap.getDomain().getDomainName());
						object.put("toolName",
								projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getToolId());
						object.put("menuid", projectRoleWidgetMap.getProjectRoleMenuMap().getMenuID());
						object.put("menuName",
								projectRoleWidgetMap.getProjectRoleMenuMap().getMenuDashboard().getMenuName());

						if (dataCenterWidgetMap.getWidgetName() == null) {
							object.put("name",
									projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getWidgetName());
						} else {
							object.put("name", dataCenterWidgetMap.getWidgetName());
						}

						JSONObject chartObject = new JSONObject();

						// Common values
						chartObject.put("mainObject", dataCenterWidgetMap.getMainObject());
						chartObject.put("searchObject", dataCenterWidgetMap.getSearchObject());
						chartObject.put("widgetType", dataCenterWidgetMap.getWidgetType());
						chartObject.put("onlineCustomUrl", dataCenterWidgetMap.getOnlineCustomUrl());
						chartObject.put("onlineAuthenticationType", dataCenterWidgetMap.getOnlineAuthenticationType());
						chartObject.put("onlineRequestType", dataCenterWidgetMap.getOnlineRequestType());
						chartObject.put("offlineCustomUrl", dataCenterWidgetMap.getOfflineCustomUrl());
						chartObject.put("offlineAuthenticationType",
								dataCenterWidgetMap.getOfflineAuthenticationType());

						UserChartInfo userChartInfo = userChartImpl.getUserChartInfo(dataCenterWidgetMap.getId(),
								projectRoleUserMap.getProjUserMap().getUserMaster().getUserId());

						org.json.JSONObject graphProperties = null;
						org.json.JSONObject userTemplateMap = null;

						String widgetRoleType = "default";
						if (userChartInfo != null) {
							if (userChartInfo.getWidgetName() != null) {
								object.put("name", userChartInfo.getWidgetName());
							}
							graphProperties = new org.json.JSONObject(userChartInfo.getGraphProperties());
							userTemplateMap = new org.json.JSONObject(userChartInfo.getValueTemplateProperties());
							widgetRoleType = "user";
						} else {
							graphProperties = new org.json.JSONObject(dataCenterWidgetMap.getGraphProperties());
							userTemplateMap = new org.json.JSONObject(dataCenterWidgetMap.getValueTemplateProperties());
						}

						// **************** Graph Values ******************
						if (dataCenterWidgetMap.getWidgetType().equalsIgnoreCase("Graph")) {

							chartObject.put("chart_type", graphProperties.get("chartType"));
							chartObject.put("x_axis", graphProperties.get("xAxisName"));
							chartObject.put("x_axis_title", graphProperties.get("xLabel"));
							chartObject.put("y_axis", graphProperties.get("yAxisName"));
							chartObject.put("y_axis_title", graphProperties.get("yLabel"));
							chartObject.put("aggr_func", graphProperties.get("xaggrFun"));
							chartObject.put("aggr_func_y", graphProperties.get("yaggrFun"));
							chartObject.put("groupBy", graphProperties.get("groupby"));
							chartObject.put("groupArray", graphProperties.get("groupArray"));
							chartObject.put("rotateLabel", graphProperties.get("rotateLabel"));
							chartObject.put("chartSummary", graphProperties.get("chartSummary"));
							chartObject.put("colorsArray", graphProperties.get("colorsArray"));
							chartObject.put("showLabels", graphProperties.get("showLabels"));
							chartObject.put("legendPos", graphProperties.get("legendPosition"));
							chartObject.put("valueOrPercentage", graphProperties.get("valueOrPercentage"));
							chartObject.put("xAxisticklength", graphProperties.get("xAxisticklength"));
							chartObject.put("xAxisDataType", graphProperties.get("xColumndatatype"));
							chartObject.put("xaxisDateFormat", graphProperties.get("datetimeformat"));
							chartObject.put("right_y_axis", graphProperties.get("rightYAxis"));
							chartObject.put("right_y_axis_title", graphProperties.get("rightYAxisTitle"));
							chartObject.put("isStacked", graphProperties.get("isStacked"));
							// Gauge columns
							chartObject.put("gaugeType", graphProperties.get("gaugeType"));
							chartObject.put("gaugeColumn", graphProperties.get("gaugeColumn"));
							chartObject.put("aggrFunG", graphProperties.get("gaggrFun"));
							chartObject.put("gaugeMaxValue", graphProperties.get("gaugeMaxValue"));
						} else if (dataCenterWidgetMap.getWidgetType().equalsIgnoreCase("ValueTemplate")) {
							// *********** Value Template Values ************

							JSONObject valueTemplate = new JSONObject();

							valueTemplate.put("titleColor", userTemplateMap.get("titleColor"));
							valueTemplate.put("titleSize", userTemplateMap.get("titleSize"));
							valueTemplate.put("valueColor", userTemplateMap.get("valueColor"));
							valueTemplate.put("valueSize", userTemplateMap.get("valueSize"));
							if (userTemplateMap.has("backgroundColor")) {
								valueTemplate.put("backgroundColor", userTemplateMap.get("backgroundColor"));
							} else {
								valueTemplate.put("backgroundColor", "");
							}
							valueTemplate.put("imageType", userTemplateMap.get("imageType"));
							valueTemplate.put("iconsArray", userTemplateMap.get("iconsArray"));

							JSONArray objArray = new JSONArray();
							if (userTemplateMap.getString("imageType").equalsIgnoreCase("image_upload")) {
								String format = "png";
								File fi = null;
								if (userTemplateMap.getString("iconsArray").length() > 0) {
									String[] icons = userTemplateMap.getString("iconsArray").split(",");
									for (String icon : icons) {
										String imageData = null;
										if (widgetRoleType.equalsIgnoreCase("user")) {
											imageData = datacenterwidgetImpl.getWidgetIcons(dataCenterWidgetMap.getId(),
													icon,
													projectRoleUserMap.getProjUserMap().getUserMaster().getUserId());
										} else {
											imageData = datacenterwidgetImpl.getWidgetIcons(dataCenterWidgetMap.getId(),
													icon);
										}
										if (imageData != null) {
											objArray.add(imageData);
										} else {
											fi = new File(fileDest + File.separator + "arrow-up.png");
											byte[] fileContent = Files.readAllBytes(fi.toPath());
											objArray.add("data:image/" + format + ";base64,"
													+ Base64.encodeBase64String((byte[]) fileContent));
										}
									}
								} else {
									fi = new File(fileDest + File.separator + "arrow-up.png");
									byte[] fileContent = Files.readAllBytes(fi.toPath());
									valueTemplate.put("defaultImage", "data:image/" + format + ";base64,"
											+ Base64.encodeBase64String((byte[]) fileContent));
								}
							} else {
								valueTemplate.put("defaultImage", "fa fa-circle-o");
							}

							valueTemplate.put("iconsDataArray", objArray.toString());

							object.put("valueTempInformation", valueTemplate);
						}

						object.put("chartInformation", chartObject);

					} else {
						object.put("datacenter_widget_id", 0);
						object.put("id", projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getId());
						object.put("name",
								projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getWidgetName());
						object.put("template",
								projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getWidgetTemplate());
						object.put("menuid",
								projectRoleWidgetMap.getProjectRoleMenuMap().getMenuDashboard().getMenuName());
						object.put("menuid", projectRoleWidgetMap.getProjectRoleMenuMap().getMenuID());
						object.put("widget_order_number", projectRoleWidgetMap.getWidgetOrderNumber());
						object.put("prwmId", projectRoleWidgetMap.getId());
						object.put("prwm_id", projectRoleWidgetMap.getWidgetId());
						object.put("type", projectRoleWidgetMap.getProjectWidgetMap().getWidgetMaster().getType());
						object.put("domainName", dpmap.getDomain().getDomainName());
					}
					// object.put("customWidgetsData", array.toString());
					jsonArray.add(object);
				}

			}

		}
		LOGGER.debug("End of getRoleBasedWidgetDetails method");
		return jsonArray;
	}

	/**
	 * @param datacenterWidgetId
	 *            long
	 * @param runType
	 *            String
	 * @return String
	 * @throws JSONException
	 */
	public String getWidgetData(final long datacenterWidgetId, final String serviceType) throws JSONException {
		LOGGER.debug("Start of getWidgetData method");

		DataCenterWidgetMap datacenterWidget = datacenterwidgetImpl.getDatacenterWidget(datacenterWidgetId);

		LOGGER.debug("End of getWidgetData method");
		// Need memCache flag
		boolean memCache = adAuthenticationService.getMemCache();
		org.json.JSONObject memCacheSettings = null;
		if (memCache) {
			memCacheSettings = adAuthenticationService.getMemCacheSettings();
		}
		return new VeritaServiceFactory().getService(datacenterWidget, serviceType, memCache, memCacheSettings);
	}

	/**
	 * @return String
	 */
	public String getUrl() {
		return url;
	}

	public org.json.JSONObject setWidgetDataToJSONFormat(final DatacenterWidgetMap dwmBean) throws JSONException {
		org.json.JSONObject jsonObject = new org.json.JSONObject();
		if (dwmBean.getChartType() != null) {
			jsonObject.put("chartType", dwmBean.getChartType());
		} else {
			jsonObject.put("chartType", "");
		}

		if (dwmBean.getxAxis() != null) {
			jsonObject.put("xAxisName", dwmBean.getxAxis());
		} else {
			jsonObject.put("xAxisName", "");
		}

		if (dwmBean.getyAxis() != null) {
			jsonObject.put("yAxisName", dwmBean.getyAxis());
		} else {
			jsonObject.put("yAxisName", "");
		}

		if (dwmBean.getChartSummary() != null) {
			jsonObject.put("chartSummary", dwmBean.getChartSummary());
		} else {
			jsonObject.put("chartSummary", "");
		}

		if (dwmBean.getxAxisTitle() != null) {
			jsonObject.put("xLabel", dwmBean.getxAxisTitle());
		} else {
			jsonObject.put("xLabel", "");
		}
		if (dwmBean.getyAxisTitle() != null) {
			jsonObject.put("yLabel", dwmBean.getyAxisTitle());
		} else {
			jsonObject.put("yLabel", "");
		}

		if (dwmBean.getLegendPosition() != null) {
			jsonObject.put("legendPosition", dwmBean.getLegendPosition());
		} else {
			jsonObject.put("legendPosition", "Top Left");
		}

		if (dwmBean.getAggrFunc() != null) {
			jsonObject.put("xaggrFun", dwmBean.getAggrFunc());
		} else {
			jsonObject.put("xaggrFun", "None");
		}

		if (dwmBean.getAggrFuncY() != null) {
			jsonObject.put("yaggrFun", dwmBean.getAggrFuncY());
		} else {
			jsonObject.put("yaggrFun", "");
		}

		if (dwmBean.getColorsArray() != null) {
			jsonObject.put("colorsArray", Arrays.toString(dwmBean.getColorsArray()));
		} else {
			jsonObject.put("colorsArray", "");
		}

		if (dwmBean.getGroupArray() != null) {
			jsonObject.put("groupArray", Arrays.toString(dwmBean.getGroupArray()));
		} else {
			jsonObject.put("groupArray", "");
		}

		jsonObject.put("rotateLabel", dwmBean.isRotateLabel());
		jsonObject.put("showLabels", dwmBean.isShowLabels());

		if (dwmBean.getgroupBy() != null) {
			jsonObject.put("groupby", dwmBean.getgroupBy());
		} else {
			jsonObject.put("groupby", "");
		}

		if (dwmBean.getValueOrPercentage() != null) {
			jsonObject.put("valueOrPercentage", dwmBean.getValueOrPercentage());
		} else {
			jsonObject.put("valueOrPercentage", "value");
		}

		if (dwmBean.getxAxisticklength() != null) {
			jsonObject.put("xAxisticklength", dwmBean.getxAxisticklength());
		} else {
			jsonObject.put("xAxisticklength", "");
		}

		if (dwmBean.getxDataType() != null) {
			jsonObject.put("xColumndatatype", dwmBean.getxDataType());
		} else {
			jsonObject.put("xColumndatatype", "");
		}

		if (dwmBean.getxDateFormat() != null) {
			jsonObject.put("datetimeformat", dwmBean.getxDateFormat());
		} else {
			jsonObject.put("datetimeformat", "");
		}

		if (dwmBean.getRightYAxis() != null) {
			jsonObject.put("rightYAxis", dwmBean.getRightYAxis());
		} else {
			jsonObject.put("rightYAxis", "");
		}

		if (dwmBean.getrightYAxisTitle() != null) {
			jsonObject.put("rightYAxisTitle", dwmBean.getrightYAxisTitle());
		} else {
			jsonObject.put("rightYAxisTitle", "");
		}

		if (dwmBean.getIsStacked() != null) {
			jsonObject.put("isStacked", dwmBean.getIsStacked());
		} else {
			jsonObject.put("isStacked", Boolean.parseBoolean("false"));
		}

		// Gauge chart columns
		if (dwmBean.getAggrFunG() != null) {
			jsonObject.put("gaggrFun", dwmBean.getAggrFunG());
		} else {
			jsonObject.put("gaggrFun", "");
		}

		if (dwmBean.getGaugeType() != null) {
			jsonObject.put("gaugeType", dwmBean.getGaugeType());
		} else {
			jsonObject.put("gaugeType", "");
		}

		if (dwmBean.getGaugeColumn() != null) {
			jsonObject.put("gaugeColumn", dwmBean.getGaugeColumn());
		} else {
			jsonObject.put("gaugeColumn", "");
		}

		if (dwmBean.getGaugeMaxValue() != null) {
			jsonObject.put("gaugeMaxValue", dwmBean.getGaugeMaxValue());
		} else {
			jsonObject.put("gaugeMaxValue", "");
		}
		return jsonObject;

	}

	public org.json.JSONObject setValueTemplatesWidgetDataToJSONFormat(DatacenterValueTemplateWidgetMap dwmBean)
			throws JSONException {
		org.json.JSONObject jsonObject = new org.json.JSONObject();

		String iconsArray = "";

		if (dwmBean.getTitleColor() != null && !dwmBean.getTitleColor().isEmpty()) {
			jsonObject.put("titleColor", dwmBean.getTitleColor());
		} else {
			jsonObject.put("titleColor", "");
		}

		jsonObject.put("titleSize", 12);
		if (dwmBean.getTitleSize() > 0) {
			jsonObject.put("titleSize", dwmBean.getTitleSize());
		}

		if (dwmBean.getValueColor() != null && !dwmBean.getValueColor().isEmpty()) {
			jsonObject.put("valueColor", dwmBean.getValueColor());
		} else {
			jsonObject.put("valueColor", "");
		}

		jsonObject.put("valueSize", 24);
		if (dwmBean.getValueSize() > 0) {
			jsonObject.put("valueSize", dwmBean.getValueSize());
		}

		if (dwmBean.getBackgroundColor() != null && !dwmBean.getBackgroundColor().isEmpty()) {
			jsonObject.put("backgroundColor", dwmBean.getBackgroundColor());
		} else {
			jsonObject.put("backgroundColor", "");
		}

		if (dwmBean.getImageType() != null && !dwmBean.getImageType().isEmpty()) {
			jsonObject.put("imageType", dwmBean.getImageType());

			if (dwmBean.getImageType().equalsIgnoreCase("image_upload")) {
				iconsArray = datacenterwidgetImpl.saveIconsToWidgetIconsTable(dwmBean.getIconsArray(), dwmBean.getId(),
						dwmBean.getUserId());
			} else {
				datacenterwidgetImpl.deleteWidgetIcons(dwmBean.getId(), dwmBean.getUserId());
				iconsArray = datacenterwidgetImpl.getIconNames(dwmBean.getIconsArray());
			}
		} else {
			jsonObject.put("imageType", "font_awesome");
		}

		jsonObject.put("iconsArray", iconsArray);
		return jsonObject;

	}

	/**
	 * @param dwmBean
	 *            DatacenterWidgetMap
	 * @return String
	 * @throws JSONException
	 */
	public String editDWMDetails(final DatacenterWidgetMap dwmBean) throws JSONException {

		UserChartInfo dwmModel = new UserChartInfo();
		dwmModel.setDataCenterWidgetMapId(dwmBean.getId());
		dwmModel.setDatacenterId(dwmBean.getDatacenterId());
		dwmModel.setProjectWidgetMapId(dwmBean.getProjectWidgetMapId());
		dwmModel.setWidgetName(dwmBean.getWidgetName());
		dwmModel.setUserId(dwmBean.getUserId());

		dwmModel.setGraphProperties(setWidgetDataToJSONFormat(dwmBean).toString());
		dwmModel.setValueTemplateProperties(
				setValueTemplatesWidgetDataToJSONFormat(new DatacenterValueTemplateWidgetMap()).toString());

		String editResp = userChartImpl.saveEditedChartInfoByUser(dwmModel);

		return editResp;
	}

	/**
	 * @param dwmBean
	 *            DatacenterWidgetMap
	 * @param fileDest
	 * @return String
	 * @throws JSONException
	 */
	public String editValueTemplateDetails(final DatacenterValueTemplateWidgetMap dwmBean) throws JSONException {

		UserChartInfo dwmModel = new UserChartInfo();
		dwmModel.setDataCenterWidgetMapId(dwmBean.getId());
		dwmModel.setDatacenterId(dwmBean.getDatacenterId());
		dwmModel.setProjectWidgetMapId(dwmBean.getProjectWidgetMapId());
		dwmModel.setWidgetName(dwmBean.getWidgetName());
		dwmModel.setUserId(dwmBean.getUserId());
		dwmModel.setGraphProperties(setWidgetDataToJSONFormat(new DatacenterWidgetMap()).toString());
		dwmModel.setValueTemplateProperties(setValueTemplatesWidgetDataToJSONFormat(dwmBean).toString());

		String editResp = userChartImpl.saveEditedChartInfoByUser(dwmModel);
		return editResp;
	}

	/**
	 * @param dwmBean
	 *            DatacenterWidgetMap
	 * @return String
	 * @throws JSONException
	 */
	public String editTemplateDetails(final DatacenterWidgetMap dwmBean) throws JSONException {

		String editResp = null;

		if (!StringUtils.isEmpty(dwmBean.getCustomWidgetId())) {

			CustomWidgetModel customWidgetModel = customWidgetDaoImpl
					.getCustomDataCenterWidget(Integer.valueOf(dwmBean.getCustomWidgetId()));

			LOGGER.info("dwmBean.getCustomWidgetName()-------" + dwmBean.getCustomWidgetName());
			customWidgetModel.setWidgetName(dwmBean.getCustomWidgetName());
			org.json.JSONObject obj = new org.json.JSONObject(customWidgetModel.getGraphProperties());
			obj.put("colorsArray", Arrays.toString(dwmBean.getColorsArray()));
			customWidgetModel.setGraphProperties(obj.toString());
			editResp = customWidgetDaoImpl.editCustomWidget(customWidgetModel);
		} else {
			DataCenterWidgetMap dwmModel = datacenterwidgetImpl.getDatacenterWidget(dwmBean.getId());
			org.json.JSONObject obj = new org.json.JSONObject(dwmModel.getGraphProperties());
			obj.put("colorsArray", Arrays.toString(dwmBean.getColorsArray()));
			dwmModel.setGraphProperties(obj.toString());
			// dwmModel.setColorsArray(Arrays.toString(dwmBean.getColorsArray()));
			editResp = datacenterwidgetImpl.editDatacenterWidget(dwmModel);
		}

		return editResp;
	}

}
