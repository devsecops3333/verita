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

import verita.daointerface.ProjectDao;
import verita.model.DomainProjectMap;
import verita.model.ProjectMaster;

/**
 * @author e001272
 *
 */
@Repository
public class ProjectDaoImpl implements ProjectDao {

	static final Logger LOGGER = Logger.getLogger(ProjectDaoImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;

	/* (non-Javadoc)
	 * @see verita.daointerface.ProjectDao#getProjectById(long)
	 */
	@Override
	public ProjectMaster getProjectById(final long id) {
		LOGGER.info("Start of getProjectById method");
		ProjectMaster project = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			project = (ProjectMaster) session.get(ProjectMaster.class, id);
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getProjectById method");
		return project;
	}

	/* (non-Javadoc)
	 * @see verita.daointerface.ProjectDao#getDomainByPId(long)
	 */
	@Override
	public DomainProjectMap getDomainByPId(final long pid) {
		LOGGER.info("Start of getDomainById method");
		DomainProjectMap domain = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(DomainProjectMap.class).add(Restrictions.eq("projectId", pid));
			domain = (DomainProjectMap) criteria.uniqueResult();
		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getDomainById method");
		return domain;
	}

}
