package verita.dashboard.dao.impl;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import verita.daointerface.UserDao;
import verita.model.ProjectMaster;
import verita.model.ProjectRoleUserMap;
import verita.model.ProjectUserMap;
import verita.model.RoleMaster;
import verita.model.UserMaster;
import verita.service.rest.EncryptionService;

/**
 * @author e001272
 *
 */
@Repository
public class UserDaoImpl implements UserDao {

	static final Logger LOGGER = Logger.getLogger(UserDaoImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserDao#getUsers(java.lang.String,
	 * java.lang.String)
	 */
	@Override
	public UserMaster getUsers(final String username, final String password) {
		LOGGER.info("Start of getUsers method");
		UserMaster users = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			String pwd = new EncryptionService().encrypt(password, "verita");

			Criteria criteria = session.createCriteria(UserMaster.class).add(Restrictions.eq("userName", username))
					.add(Restrictions.eq("password", pwd));
			users = (UserMaster) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			users = null;
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getUsers method");
		return users;
	}

	public UserMaster getUsers(final String username) {
		LOGGER.info("Start of getUsers method");
		UserMaster users = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserMaster.class).add(Restrictions.eq("userName", username));
			users = (UserMaster) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			users = null;
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getUsers method");
		return users;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserDao#getUserById(long)
	 */
	@Override
	public UserMaster getUserById(final long uId) {
		LOGGER.info("Start of getUserById method");
		UserMaster user = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserMaster.class).add(Restrictions.eq("id", uId));
			user = (UserMaster) criteria.uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			user = new UserMaster();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getUserById method");
		return user;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserDao#getProjectUserRole(long, long)
	 */
	@Override
	public ProjectRoleUserMap getProjectUserRole(final long id, final long projectId) {
		LOGGER.info("Start of getProjectUserRole method");
		ProjectRoleUserMap role = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			role = (ProjectRoleUserMap) session.createCriteria(ProjectRoleUserMap.class)
					.add(Restrictions.eq("userId", id)).add(Restrictions.eq("projectId", projectId)).uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getProjectUserRole method");
		return role;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserDao#getProjectUserRole(long, long)
	 */
	@Override
	public ProjectUserMap getProjectUser(final long id, final long projectId) {
		LOGGER.info("Start of getProjectUserRole method");
		ProjectUserMap role = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			role = (ProjectUserMap) session.createCriteria(ProjectUserMap.class).add(Restrictions.eq("userId", id))
					.add(Restrictions.eq("projectId", projectId)).uniqueResult();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("End of getProjectUserRole method");
		return role;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserDao#getRoleById(long)
	 */
	@Override
	public RoleMaster getRoleById(final long id) {
		LOGGER.info("Start of getRoleById method");
		RoleMaster role = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			role = (RoleMaster) session.get(RoleMaster.class, id);
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		LOGGER.info("End of getRoleById method");
		return role;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserDao#getProjectMasterById(long)
	 */
	@Override
	public ProjectMaster getProjectMasterById(final long id) {
		LOGGER.info("Start of getProjectMasterById method");
		ProjectMaster pm = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			pm = (ProjectMaster) session.get(ProjectMaster.class, id);
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		LOGGER.info("Start of getProjectMasterById method");
		return pm;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.daointerface.UserDao#getProjects(long)
	 */
	@Override
	public List<ProjectUserMap> getProjects(final long id) {
		LOGGER.info("Start of getProjects method");
		List<ProjectUserMap> plist = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			List<ProjectUserMap> projects = getProjectsByUser(id);
			if (projects.size() > 0) {
				plist = new ArrayList<ProjectUserMap>();
				for (ProjectUserMap pumap : projects) {
					Criteria criteria = session.createCriteria(ProjectRoleUserMap.class)
							.add(Restrictions.eq("userId", pumap.getId()));
					List<ProjectRoleUserMap> prum = criteria.list();
					if (prum.size() > 0) {
						plist.add(pumap);
					}
				}
			}
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		LOGGER.info("Start of getProjects method");
		return plist;
	}

	public List<ProjectUserMap> getProjectsByUser(final long userId) {

		List<ProjectUserMap> pum = new ArrayList<ProjectUserMap>();
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {

			pum = (List<ProjectUserMap>) session.createCriteria(ProjectUserMap.class)
					.add(Restrictions.eq("userId", userId)).list();
		} catch (Exception e) {
			tx.rollback();
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
		}
		session.flush();
		tx.commit();
		session.close();
		return pum;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.admin.daointerface.UserDao#getLastLoginTime(long)
	 */
	@Override
	public String getLastLoginTime(final long userId) {
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		String lastLoginTime = null;
		try {
			UserMaster um = (UserMaster) session.get(UserMaster.class, userId);
			lastLoginTime = um.getLastname();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.debug(stack);
			tx.rollback();
		}
		return lastLoginTime;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see verita.admin.daointerface.UserDao#insertLoginTime(long)
	 */
	@Override
	public String insertLoginTime(final long userId) {
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {

			Date date = new Date();
			LOGGER.info("====693====" + date);
			UserMaster um = (UserMaster) session.get(UserMaster.class, userId);
			um.setLoginTime(new Date());
			um.setUserId(userId);
			session.update(um);
			session.flush();
			tx.commit();
			session.close();
			return "success";
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.debug(stack);
			tx.rollback();
			return "fail";
		}

	}
}
