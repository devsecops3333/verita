package verita.dashboard.dao.impl;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import verita.daointerface.DataCenterWidgetDao;
import verita.model.DataCenterWidgetMap;
import verita.model.UserTemplateWidgetIcons;
import verita.model.WidgetIcons;

/**
 * @author e001272
 *
 */
@Repository
public class DataCenterWidgetDaoImpl implements DataCenterWidgetDao {

	static final Logger LOGGER = Logger.getLogger(DataCenterWidgetDaoImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionfactory;

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.DataCenterWidgetDao#getDatacenterWidget(long)
	 */
	@Override
	public DataCenterWidgetMap getDatacenterWidget(final long datacenterwidgetid) {
		LOGGER.info("Start of getDataCenterWidget method");
		DataCenterWidgetMap datacenterwidget = null;
		Session session = sessionfactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(DataCenterWidgetMap.class)
					.add(Restrictions.eq("id", datacenterwidgetid));
			datacenterwidget = (DataCenterWidgetMap) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getDataCenterWidget method");
		return datacenterwidget;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * verita.daointerface.DataCenterWidgetDao#editDatacenterWidget(verita.model
	 * .DataCenterWidgetMap)
	 */
	@Override
	public String editDatacenterWidget(final DataCenterWidgetMap dcwModel) {
		try {
			Session session = sessionfactory.openSession();
			session.beginTransaction();
			session.update(dcwModel);
			session.getTransaction().commit();
			session.close();
			return "success";
		} catch (Exception e) {
			e.printStackTrace();
			return "fail";
		}
	}

	public String getIconNames(String[] iconsArray) throws JSONException {
		StringBuilder iconsList = new StringBuilder();
		int i = 0;
		for (String icon : iconsArray) {
			if (i > 0) {
				iconsList.append(",");
			}
			iconsList.append(icon);
			i++;
		}
		return iconsList.toString();
	}

	public void deleteWidgetIcons(long dataCenterWidgetMapId, String userId) {

		Session session = sessionfactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserTemplateWidgetIcons.class)
					.add(Restrictions.eq("userId", userId))
					.add(Restrictions.eq("datacenterWidgetMapId", dataCenterWidgetMapId));
			List<UserTemplateWidgetIcons> widgets = (List<UserTemplateWidgetIcons>) criteria.list();

			if (widgets.size() > 0) {
				for (UserTemplateWidgetIcons widget : widgets) {
					session.delete(widget);
				}
			}
		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();

	}

	public String saveIconsToWidgetIconsTable(String[] iconsArray, long id, String userId) throws JSONException {
		StringBuilder iconsList = new StringBuilder();
		int i = 0;
		JSONObject obj = null;
		for (String icon : iconsArray) {
			obj = new JSONObject();

			if (i > 0 && iconsList.length() > 0) {
				iconsList.append(",");
			}
			int iend = icon.indexOf(",");
			if (iend > 0) {
				String dataFormatObj = icon.substring(0, iend);
				String[] array = dataFormatObj.split(";");
				String format = array[0].split("/")[1];
				if (format.equalsIgnoreCase("jpeg")) {
					format = "jpg";
				}

				String iconName = "image_" + (i + 1) + "." + format;
				iconsList.append(iconName);
				obj.put("image_name", iconName);

				// Change string to Byte Array
				obj.put("image", Base64.decodeBase64(icon.substring(iend + 1)));
				// Edit or Insert icons
				editWidgetIcons(obj, id, userId);
			}

			i++;
		}

		return iconsList.toString();

	}

	private void editWidgetIcons(JSONObject obj, long dataCenterWidgetMapId, String userId) {

		Session session = sessionfactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserTemplateWidgetIcons.class)
					.add(Restrictions.eq("userId", userId))
					.add(Restrictions.eq("datacenterWidgetMapId", dataCenterWidgetMapId))
					.add(Restrictions.eq("imageName", obj.getString("image_name")));
			UserTemplateWidgetIcons widgets = (UserTemplateWidgetIcons) criteria.uniqueResult();

			if (widgets != null) {
				widgets.setImage((byte[]) obj.get("image"));
				session.update(widgets);
			} else {
				UserTemplateWidgetIcons widgetIcons = new UserTemplateWidgetIcons();
				widgetIcons.setDatacenterWidgetMapId(dataCenterWidgetMapId);
				widgetIcons.setUserId(userId);
				widgetIcons.setImageName((String) obj.get("image_name"));
				widgetIcons.setImage((byte[]) obj.get("image"));
				session.save(widgetIcons);
			}

		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();

	}

	public String getWidgetIcons(long dataCenterWidgetMapId, String imageName) {
		Session session = sessionfactory.openSession();
		Transaction tx = session.beginTransaction();
		String imageData = null;
		try {
			Criteria criteria = session.createCriteria(WidgetIcons.class)
					.add(Restrictions.eq("datacenterWidgetMapId", dataCenterWidgetMapId))
					.add(Restrictions.eq("imageName", imageName));
			WidgetIcons widgets = (WidgetIcons) criteria.uniqueResult();

			if (widgets != null) {
				String format = imageName.split("\\.")[1];
				imageData = "data:image/" + format + ";base64,"
						+ Base64.encodeBase64String((byte[]) widgets.getImage());
			}

		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();
		return imageData;
	}

	public String getWidgetIcons(long dataCenterWidgetMapId, String imageName, long userId) {
		Session session = sessionfactory.openSession();
		Transaction tx = session.beginTransaction();
		String imageData = null;
		try {
			Criteria criteria = session.createCriteria(UserTemplateWidgetIcons.class)
					.add(Restrictions.eq("datacenterWidgetMapId", dataCenterWidgetMapId))
					.add(Restrictions.eq("imageName", imageName))
					.add(Restrictions.eq("userId", String.valueOf(userId)));
			UserTemplateWidgetIcons widgets = (UserTemplateWidgetIcons) criteria.uniqueResult();

			if (widgets != null) {
				String format = imageName.split("\\.")[1];
				imageData = "data:image/" + format + ";base64,"
						+ Base64.encodeBase64String((byte[]) widgets.getImage());
			}

		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();
		return imageData;
	}
}
