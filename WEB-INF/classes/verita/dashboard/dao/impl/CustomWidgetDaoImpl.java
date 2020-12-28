package verita.dashboard.dao.impl;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import verita.daointerface.CustomWidgetDao;
import verita.model.CustomWidgetModel;
import verita.model.ProjectToolMap;

/**
 * @author e001272
 *
 */
@Repository("customWidgetsDao")
public class CustomWidgetDaoImpl implements CustomWidgetDao {

	static final Logger LOGGER = Logger.getLogger(CustomWidgetDaoImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;

	/*
	 * (non-Javadoc)
	 *
	 * @see verita.daointerface.CustomWidgetDao#addCustomWidget(verita.model.
	 * CustomWidgetModel)
	 */
	@Override
	public String addCustomWidget(final CustomWidgetModel customWidget) {
		try {
			Session session = sessionFactory.openSession();
			session.beginTransaction();
			CustomWidgetModel model = null;
			if (customWidget.getCustomWidgetId() != 0) {
				session.update(customWidget);
				session.getTransaction().commit();
				session.close();
				return "success";
			} else {
				model = (CustomWidgetModel) session.createCriteria(CustomWidgetModel.class)
						.add(Restrictions.eq("userid", customWidget.getUserid()))
						.add(Restrictions.eq("projectId", customWidget.getProjectId()))
						.add(Restrictions.eq("widgetName", customWidget.getWidgetName())).uniqueResult();
				if (model == null) {
					session.saveOrUpdate(customWidget);
					session.getTransaction().commit();
					session.close();
					return "success";
				} else {
					Integer custWidId = model.getCustomWidgetId();
					return custWidId.toString();
				}
			}
			// return "fail";
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			return "fail";
		}

	}

	/*
	 * (non-Javadoc)
	 *
	 * @see
	 * verita.daointerface.CustomWidgetDao#listCustomWidgets(java.lang.String,
	 * int)
	 */
	@Override
	public JSONArray listCustomWidgets(final String userId, final int projectId) {
		LOGGER.info("Start of listCustomWidgets method");
		List<CustomWidgetModel> customWidgetModels = new ArrayList<CustomWidgetModel>();
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		JSONArray array = new JSONArray();
		try {

			customWidgetModels = (List<CustomWidgetModel>) session.createCriteria(CustomWidgetModel.class)
					.add(Restrictions.eq("userid", userId)).add(Restrictions.eq("projectId", projectId)).list();
			for (CustomWidgetModel widget : customWidgetModels) {
				array.put(setDataForCustomWidget(widget));
			}
		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of liscustomwidgets method");
		return array;
	}

	public JSONObject setDataForCustomWidget(CustomWidgetModel widget) throws JSONException {
		JSONObject obj = new JSONObject();
		obj.put("customWidgetId", widget.getCustomWidgetId());
		obj.put("projectId", widget.getProjectId());
		obj.put("widgetName", widget.getWidgetName());
		obj.put("userid", widget.getUserid());
		obj.put("sourceUrl", widget.getSourceUrl());
		obj.put("type", widget.getType());
		obj.put("custFilePath", widget.getCustFilePath());
		obj.put("custFileRealPath", widget.getCustFileRealPath());
		obj.put("sheetName", widget.getSheetName());
		obj.put("widgetType", widget.getWidgetType());
		obj.put("widgetId", widget.getWidgetId());
		obj.put("datacenterId", widget.getDatacenterId());
		obj.put("datacenterWidgetId", widget.getDatacenterWidgetId());
		obj.put("template", widget.getTemplate());
		obj.put("customWidgetType", widget.getCustomWidgetType());
		obj.put("customWidgetOrderNo", widget.getCustomWidgetOrderNo());
		obj.put("menuid", widget.getMenuId());
		if (widget.getCustomWidgetType() == null || widget.getCustomWidgetType().isEmpty()
				|| widget.getCustomWidgetType().equalsIgnoreCase("Graph")) {
			JSONObject graphProperties = new JSONObject(widget.getGraphProperties());
			JSONObject chartObj = new JSONObject();
			chartObj = setWidgetDataToJSONFormat(graphProperties);
			obj.put("chartInformation", chartObj);
		}		
		return obj;
	}

	public org.json.JSONObject setWidgetDataToJSONFormat(final JSONObject graphProperties)
			throws JSONException {
		JSONObject chartObject = new JSONObject();
		if (graphProperties.has("chartType")) {
			chartObject.put("chart_type", graphProperties.get("chartType"));
		} else {
			chartObject.put("chart_type", "");
		}
		if (graphProperties.has("xAxisName")) {
			chartObject.put("x_axis", graphProperties.get("xAxisName"));
		} else {
			chartObject.put("x_axis", "");
		}
		if (graphProperties.has("yAxisName")) {
			chartObject.put("y_axis", graphProperties.get("yAxisName"));
		} else {
			chartObject.put("y_axis", "");
		}
		if (graphProperties.has("chartSummary")) {
			chartObject.put("chartSummary", graphProperties.get("chartSummary"));
		} else {
			chartObject.put("chartSummary", "");
		}
		if (graphProperties.has("xLabel")) {
			chartObject.put("x_axis_title", graphProperties.get("xLabel"));
		} else {
			chartObject.put("x_axis_title", "");
		}

		if (graphProperties.has("yLabel")) {
			chartObject.put("y_axis_title", graphProperties.get("yLabel"));
		} else {
			chartObject.put("y_axis_title", "");
		}

		if (graphProperties.has("legendPosition")) {
			chartObject.put("legendPos", graphProperties.get("legendPosition"));
		} else {
			chartObject.put("legendPos", "Top Left");
		}

		if (graphProperties.has("xaggrFun")) {
			chartObject.put("aggr_func", graphProperties.get("xaggrFun"));
		} else {
			chartObject.put("aggr_func", "None");
		}

		if (graphProperties.has("yaggrFun")) {
			chartObject.put("aggr_func_y", graphProperties.get("yaggrFun"));
		} else {
			chartObject.put("aggr_func_y", "");
		}

		if (graphProperties.has("colorsArray")) {
			chartObject.put("colorsArray", graphProperties.get("colorsArray"));
		} else {
			chartObject.put("colorsArray", "");
		}

		if (graphProperties.has("groupArray")) {
			chartObject.put("groupArray", graphProperties.get("groupArray"));
		} else {
			chartObject.put("groupArray", "");
		}

		if (graphProperties.has("rotateLabel")) {
			chartObject.put("rotateLabel", graphProperties.getBoolean("rotateLabel"));
		} else {
			chartObject.put("rotateLabel", new Boolean(false));
		}

		if (graphProperties.has("showLabels")) {
			chartObject.put("showLabels", graphProperties.getBoolean("showLabels"));
		} else {
			chartObject.put("showLabels", new Boolean(false));
		}

		if (graphProperties.has("groupby")) {
			chartObject.put("groupBy", graphProperties.get("groupby"));
		} else {
			chartObject.put("groupBy", "");
		}

		if (graphProperties.has("valueOrPercentage")) {
			chartObject.put("valueOrPercentage", graphProperties.get("valueOrPercentage"));
		} else {
			chartObject.put("valueOrPercentage", "value");
		}

		if (graphProperties.has("xAxisticklength")) {
			chartObject.put("xAxisticklength", graphProperties.get("xAxisticklength"));
		} else {
			chartObject.put("xAxisticklength", 10);
		}

		if (graphProperties.has("xColumndatatype")) {
			chartObject.put("xAxisDataType", graphProperties.get("xColumndatatype"));
		} else {
			chartObject.put("xAxisDataType", "");
		}

		if (graphProperties.has("datetimeformat")) {
			chartObject.put("xaxisDateFormat", graphProperties.get("datetimeformat"));
		} else {
			chartObject.put("xaxisDateFormat", "");
		}

		if (graphProperties.has("rightYAxis")) {
			chartObject.put("right_y_axis", graphProperties.get("rightYAxis"));
		} else {
			chartObject.put("right_y_axis", "");
		}

		if (graphProperties.has("rightYAxisTitle")) {
			chartObject.put("right_y_axis_title", graphProperties.get("rightYAxisTitle"));
		} else {
			chartObject.put("right_y_axis_title", "");
		}

		if (graphProperties.has("isStacked")) {
			chartObject.put("isStacked", graphProperties.get("isStacked"));
		} else {
			chartObject.put("isStacked", Boolean.parseBoolean("false"));
		}

		// Gauge chart columns
		if (graphProperties.has("gaggrFun")) {
			chartObject.put("aggrFunG", graphProperties.get("gaggrFun"));
		} else {
			chartObject.put("aggrFunG", "");
		}

		if (graphProperties.has("gaugeType")) {
			chartObject.put("gaugeType", graphProperties.get("gaugeType"));
		} else {
			chartObject.put("gaugeType", "");
		}

		if (graphProperties.has("gaugeColumn")) {
			chartObject.put("gaugeColumn", graphProperties.get("gaugeColumn"));
		} else {
			chartObject.put("gaugeColumn", "");
		}

		if (graphProperties.has("gaugeMaxValue")) {
			chartObject.put("gaugeMaxValue", graphProperties.get("gaugeMaxValue"));
		} else {
			chartObject.put("gaugeMaxValue", "");
		}

		return chartObject;

	}

	/*
	 * (non-Javadoc)
	 *
	 * @see verita.daointerface.CustomWidgetDao#getCustomWidget(int)
	 */
	@Override
	public CustomWidgetModel getCustomWidget(final int customWidgetId) {
		Session session = sessionFactory.openSession();
		return (CustomWidgetModel) session.get(CustomWidgetModel.class, customWidgetId);
	}

	/*
	 * (non-Javadoc)
	 *
	 * @see verita.daointerface.CustomWidgetDao#deleteCustomWidget(int)
	 */
	@Override
	public int deleteCustomWidget(final int customWidgetId) {
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(CustomWidgetModel.class)
					.add(Restrictions.eq("customWidgetId", customWidgetId));
			List<CustomWidgetModel> customWidgetModels = (List<CustomWidgetModel>) criteria.list();

			if (customWidgetModels.size() > 0) {
				for (CustomWidgetModel customWidgetModel : customWidgetModels) {
					session.delete(customWidgetModel);
				}
			}
			res = 1;
		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			res = 0;
		}
		session.flush();
		tx.commit();
		session.close();
		return res;
	}

	/*
	 * (non-Javadoc)
	 *
	 * @see verita.daointerface.CustomWidgetDao#getCustomToolsData(long)
	 */
	@Override
	public JSONObject getCustomToolsData(final long projectId) {
		LOGGER.info("Start of getCustomToolData method");

		List<ProjectToolMap> projectToolMap = getProjectToolMapList(projectId);

		JSONObject jb = new JSONObject();
		for (ProjectToolMap proToolMap : projectToolMap) {
			try {
				jb.put(proToolMap.getTool().getToolName(), proToolMap.getId());
			} catch (JSONException e) {
				StringWriter stack = new StringWriter();
				e.printStackTrace(new PrintWriter(stack));
				LOGGER.error(stack);
			}

		}

		LOGGER.info(jb);
		LOGGER.info("End of getCustomToolData method");
		return jb;
	}

	public List<ProjectToolMap> getProjectToolMapList(final long projectId) {
		List<ProjectToolMap> projectToolMap = new ArrayList<ProjectToolMap>();
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectToolMap.class)
					.add(Restrictions.eq("projectId", projectId));
			projectToolMap = (List<ProjectToolMap>) criteria.list();

		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();
		session.close();
		return projectToolMap;
	}

	/*
	 * (non-Javadoc)
	 *
	 * @see verita.daointerface.CustomWidgetDao#getCustomWCount(long, long)
	 */
	@Override
	public long getCustomWCount(final String userid, final int projectid) {
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		long widgetOrderNumber = 0;
		try {
			Criteria maxCriteria = session.createCriteria(CustomWidgetModel.class)
					.add(Restrictions.eq("userid", userid)).add(Restrictions.eq("projectId", projectid))
					.setProjection(Projections.rowCount());
			widgetOrderNumber = (long) maxCriteria.uniqueResult();
			if (widgetOrderNumber != 0) {
				return widgetOrderNumber;
			}
			session.flush();
			tx.commit();
		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		return widgetOrderNumber;
	}

	@Override
	public CustomWidgetModel getCustomDataCenterWidget(final int id) {
		LOGGER.debug("Start of getCustomDataCenterWidget method");
		CustomWidgetModel customWidgetModel = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(CustomWidgetModel.class).add(Restrictions.eq("id", id));
			customWidgetModel = (CustomWidgetModel) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.debug("End of getDataCenterWidget method");
		return customWidgetModel;
	}

	@Override
	public String editCustomWidget(final CustomWidgetModel customWidgetModel) {
		try {
			Session session = sessionFactory.openSession();
			session.beginTransaction();
			session.update(customWidgetModel);
			session.getTransaction().commit();
			session.close();
			return "success";
		} catch (Exception e) {
			e.printStackTrace();
			return "fail";
		}
	}

}
