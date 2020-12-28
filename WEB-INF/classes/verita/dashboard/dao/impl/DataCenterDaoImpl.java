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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import verita.daointerface.DataCenterDao;
import verita.model.DataCenterWidgetMap;
import verita.model.DomainProjectMap;
import verita.model.ProjectRoleMenuMap;
import verita.model.ProjectRoleMenuWidgetMap;
import verita.model.ProjectRoleUserMap;

/**
 * @author e001272
 *
 */
@Repository
public class DataCenterDaoImpl implements DataCenterDao {

	static final Logger LOGGER = Logger.getLogger(DataCenterDaoImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.DataCenterDao#getCount()
	 */
	@Override
	public long getCount() {
		return 0;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.DataCenterDao#getRoleByProjectIdAndUserId(long,
	 * long)
	 */
	@Override
	public ProjectRoleUserMap getRoleByProjectIdAndUserId(final long projectId, final long userId) {
		LOGGER.info("start of getRoleByProjecrIdandUserId method");
		ProjectRoleUserMap projectRoleUserMap = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectRoleUserMap.class)
					.add(Restrictions.eq("projectId", projectId)).add(Restrictions.eq("userId", userId));
			projectRoleUserMap = (ProjectRoleUserMap) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("end of getRoleByProjecrIdandUserId method");
		return projectRoleUserMap;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * verita.daointerface.DataCenterDao#getProjectRoleWidgetsByRoleId(long,
	 * long)
	 */
	@SuppressWarnings({ "unchecked", "null" })
	@Override
	public List<ProjectRoleMenuWidgetMap> getProjectRoleWidgetsByRoleId(final long roleId, final long projectId) {
		LOGGER.info("Start of getProjectWidgetsByRoleId method");
		List<ProjectRoleMenuWidgetMap> projectRoleWidgetMapList = null;
		List<ProjectRoleMenuMap> idList = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectRoleMenuMap.class)
					.add(Restrictions.eq("projectId", projectId)).add(Restrictions.eq("roleId", roleId))
					.setProjection(Projections.projectionList().add(Projections.property("id")));

			idList = criteria.list();
			if (idList != null && !idList.isEmpty()) {
				Criteria criteria1 = session.createCriteria(ProjectRoleMenuWidgetMap.class)
						.add(Restrictions.in("projectRoleMenuId", idList.toArray()));
				projectRoleWidgetMapList = criteria1.list();
			}

		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			projectRoleWidgetMapList = new ArrayList<ProjectRoleMenuWidgetMap>();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getProjectWidgetsByRoleId method");
		return projectRoleWidgetMapList;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.DataCenterDao#
	 * getDataCenterWidgetMapByProjectRoleWidgetId(long)
	 */
	@Override
	public DataCenterWidgetMap getDataCenterWidgetMapByProjectRoleWidgetId(final long prwId) {
		LOGGER.info("Start of getDataCenterWidgetMapByProjectRoleWidgetId method");
		DataCenterWidgetMap dataCenterWidgetMap = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(DataCenterWidgetMap.class)
					.add(Restrictions.eq("projectWidgetMapId", prwId));
			dataCenterWidgetMap = (DataCenterWidgetMap) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("Start of getDataCenterWidgetMapByProjectRoleWidgetId method");
		return dataCenterWidgetMap;
	}

	/**
	 * @param projectId
	 *            long
	 * @return DomainProjectMap
	 */
	public DomainProjectMap getDomainId(final long projectId) {
		DomainProjectMap domainProjectMap = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(DomainProjectMap.class)
					.add(Restrictions.eq("projectId", projectId));
			domainProjectMap = (DomainProjectMap) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("Start of getDomainId method");
		return domainProjectMap;
	}

}
