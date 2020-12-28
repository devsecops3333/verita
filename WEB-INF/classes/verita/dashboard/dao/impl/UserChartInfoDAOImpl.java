package verita.dashboard.dao.impl;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import verita.daointerface.UserChartInfoDAO;
import verita.model.UserChartInfo;

@Repository
public class UserChartInfoDAOImpl implements UserChartInfoDAO {

	static final Logger LOGGER = Logger.getLogger(UserChartInfoDAOImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionfactory;

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * verita.daointerface.UserChartInfoDAO#saveEditedChartInfoByUser(verita.
	 * model.UserChartInfo)
	 */
	@Override
	public String saveEditedChartInfoByUser(UserChartInfo userChartInfo) {
		try {
			Session session = sessionfactory.openSession();
			Transaction tx = session.beginTransaction();

			Criteria criteria = session.createCriteria(UserChartInfo.class)
					.add(Restrictions.eq("userId", userChartInfo.getUserId()))
					.add(Restrictions.eq("dataCenterWidgetMapId", userChartInfo.getDataCenterWidgetMapId()));
			UserChartInfo ucInfo = (UserChartInfo) criteria.uniqueResult();
			if (ucInfo == null) {
				session.save(userChartInfo);
			} else {
				// ucInfo = userChartInfo;
				ucInfo.setId(ucInfo.getId());
				ucInfo.setDataCenterWidgetMapId(userChartInfo.getDataCenterWidgetMapId());
				ucInfo.setDatacenterId(userChartInfo.getDatacenterId());
				ucInfo.setProjectWidgetMapId(userChartInfo.getProjectWidgetMapId());
				ucInfo.setUserId(userChartInfo.getUserId());
				ucInfo.setWidgetName(userChartInfo.getWidgetName());
				ucInfo.setGraphProperties(userChartInfo.getGraphProperties());
				ucInfo.setValueTemplateProperties(userChartInfo.getValueTemplateProperties());

				session.update(ucInfo);
			}
			tx.commit();
			session.flush();
			session.close();

			return "success";
		} catch (Exception e) {
			e.printStackTrace();
			return "fail";
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserChartInfoDAO#getUserChartInfo(long)
	 */

	@Override
	public UserChartInfo getUserChartInfo(final long dataCenterWidgetId, final long userId) {
		UserChartInfo chartInfo = null;
		Session session = sessionfactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserChartInfo.class)
					.add(Restrictions.eq("dataCenterWidgetMapId", dataCenterWidgetId))
					.add(Restrictions.eq("userId", String.valueOf(userId)));
			chartInfo = (UserChartInfo) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();

		return chartInfo;
	}

	@Override
	public UserChartInfo getEditedUserChartInfo(final long dataCenterWidgetId, final long userId,
			final String toolProjectName) {
		UserChartInfo chartInfo = null;
		Session session = sessionfactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserChartInfo.class)
					.add(Restrictions.eq("dataCenterWidgetMapId", dataCenterWidgetId))
					.add(Restrictions.eq("userId", String.valueOf(userId)));
			chartInfo = (UserChartInfo) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();

		return chartInfo;
	}

}
