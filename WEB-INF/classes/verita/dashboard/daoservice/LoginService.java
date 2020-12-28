package verita.dashboard.daoservice;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;
import org.json.JSONException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import verita.dashboard.dao.impl.MenuDashboardDaoImpl;
import verita.dashboard.dao.impl.ProjectDaoImpl;
import verita.dashboard.dao.impl.UserDaoImpl;
import verita.dashboard.service.ADAuthenticationService;
import verita.model.CustomWidgetModel;
import verita.model.DomainProjectMap;
import verita.model.MenuDashboard;
import verita.model.ProjectMaster;
import verita.model.ProjectRoleMenuMap;
import verita.model.ProjectRoleMenuWidgetMap;
import verita.model.ProjectRoleUserMap;
import verita.model.ProjectUserMap;
import verita.model.RoleMaster;
import verita.model.UserMaster;
import verita.service.rest.EncryptionService;

/**
 * @author e001272
 *
 */
@Service
public class LoginService {

	static final Logger LOGGER = Logger.getLogger(LoginService.class);

	@Autowired
	private UserDaoImpl userimpl;

	@Autowired
	private ProjectDaoImpl projectDaoImpl;

	@Autowired
	private MenuDashboardDaoImpl menuImpl;

	@Autowired
	private ADAuthenticationService adAuthenticationService;

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;

	/**
	 * @param username
	 *            String
	 * @param password
	 *            String
	 * @return JSONObject
	 * @throws JSONException
	 */
	@SuppressWarnings("unchecked")
	public JSONObject getUserDetails(final String username, final String password) throws JSONException {
		LOGGER.info("Start of getUserDetails method");

		JSONObject object = new JSONObject();
		UserMaster users = null;
		String authenticationType = adAuthenticationService.getAuthenticationType();
		if (authenticationType.equalsIgnoreCase("LDAP")) {
			boolean validUser = adAuthenticationService.getAuthenticateUserbyLDAP(username, password);
			if (!validUser) {
				object.put("errorStatus", "Yes");
				object.put("errorMessage", "Not a valid user! Please contact Project Admin");
				return object;
			}
			users = userimpl.getUsers(username);
		} else {
			users = userimpl.getUsers(username, password);
		}

		int dpFlag = 0;

		if (users != null) {
			userimpl.insertLoginTime(users.getUserId());
			if (users.getLoginTime() == null) {
				object.put("loginTime", new Date().toString());
			} else {
				object.put("loginTime", users.getLoginTime().toString());
			}
			JSONArray projectsarray = new JSONArray();
			JSONArray menusarray = new JSONArray();
			object.put("firstName", users.getFirstname());
			object.put("userOf", users.getUserOf());
			object.put("uid", users.getUserId());
			// List<MenuDashboard> menusList =
			// menuImpl.getMenuDetails(users.getUserId());
			List<ProjectUserMap> project = userimpl.getProjects(users.getUserId());

			// if (!project.isEmpty() && project != null &&
			// !menusList.isEmpty()) {
			if (!project.isEmpty() && project != null) {

				for (ProjectUserMap mapObj : project) {
					/*
					 * if (mapObj.getProjectId() ==
					 * mapObj.getDefaultProjectId()) { object.put("pumid",
					 * mapObj.getId()); }
					 */
					ProjectMaster pm = mapObj.getProjectMaster();
					JSONObject projectobject = new JSONObject();
					projectobject.put("id", pm.getId());
					projectobject.put("pumid", mapObj.getId());
					projectobject.put("name", pm.getProjectName());
					projectobject.put("dPId", mapObj.getDefaultProjectId());
					projectobject.put("landPage", mapObj.getLandingPage());
					projectobject.put("landTheme", mapObj.getLandingTheme());
					if (mapObj.getDefaultProjectId() == pm.getId()) {
						dpFlag = 1;
					}
					if (!projectsarray.contains(projectobject)) {
						projectsarray.add(projectobject);
					}

					DomainProjectMap dpmap = projectDaoImpl.getDomainByPId(pm.getId());
					ProjectUserMap pumap = userimpl.getProjectUser(users.getUserId(), pm.getId());
					if (pumap != null) {
						ProjectRoleUserMap prumap = userimpl.getProjectUserRole(pumap.getId(), pm.getId());
						if (prumap != null) {
							List<MenuDashboard> menusList = menuImpl
									.getMenuDetails(prumap.getRoleMaster().getProjectRoleMapId(), pm.getId());
							object.put("domainName", dpmap.getDomain().getDomainName());
							object.put("projects", projectsarray);

							object.put("dataSourceType", adAuthenticationService.getDataSourceType());
							object.put("memCache", adAuthenticationService.getMemCache());

							if (menusList != null && !menusList.isEmpty()) {
								long defaultMeuId = menuImpl
										.getDefaultMenu(prumap.getRoleMaster().getProjectRoleMapId(), pm.getId());
								for (MenuDashboard md : menusList) {

									// JSONObject jObject = new JSONObject();
									Map<String, String> jObject = new LinkedHashMap<String, String>();
									jObject.put("menuId", Long.toString(md.getMenuId()));
									jObject.put("menuName", md.getMenuName());
									jObject.put("menuLink", md.getMenuLink());
									jObject.put("menuIcon", md.getMenuIcon());
									jObject.put("menuSide", md.getMenuSide());
									jObject.put("projectId", Long.toString(md.getProjectId()));
									jObject.put("defaultprojectId", Long.toString(mapObj.getDefaultProjectId()));
									jObject.put("menuOrder", Long.toString(md.getMenuOrder()));
									MenuDashboard menu = menuImpl.getMenu(defaultMeuId);
									jObject.put("defaultMenuName", menu.getMenuName());
									jObject.put("defaultMenu", Long.toString(defaultMeuId));
									menusarray.add(jObject);
								}

								object.put("Menus", menusarray);
							} /*
								 * else{ object.put("errorStatus", "Yes");
								 * object.put("errorMessage",
								 * "User Role/Boards not defined! Please contact Project Admin"
								 * ); }
								 */
						} else {
							object.put("errorStatus", "Yes");
							object.put("errorMessage", "User Role/Boards not defined! Please contact Project Admin");
						}

					} else {
						object.put("errorStatus", "Yes");
						object.put("errorMessage", "User Role/Boards not defined! Please contact Project Admin");
					}
				}
				if (dpFlag == 0) {
					object.put("errorStatus", "Yes");
					object.put("errorMessage", "User Role not defined! Please contact Project Admin");
				}

				LOGGER.info("====93===" + projectsarray);

			} else {
				object.put("errorStatus", "Yes");
				object.put("errorMessage", "User Role/Boards not defined! Please contact Project Admin");
			}

			return object;
		}
		LOGGER.info("End of getUserDetails method");
		return null;
	}

	/**
	 * @param uId
	 *            long
	 * @return UserMaster
	 */
	public UserMaster getUserById(final long uId) {
		return userimpl.getUserById(uId);
	}

	/**
	 * @param userId
	 *            long
	 * @param projectId
	 *            long
	 * @param upmId
	 *            long
	 * @return String
	 */
	@SuppressWarnings("unchecked")
	public String getProfile(final long userId, final long projectId, final long upmId) {
		LOGGER.info("Start of getProfile method");
		ProjectRoleUserMap projectRoleUserMap = null;
		UserMaster user = null;
		RoleMaster roleMaster = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			user = (UserMaster) session.get(UserMaster.class, userId);
			projectRoleUserMap = userimpl.getProjectUserRole(upmId, projectId);

			if (projectRoleUserMap != null) {
				roleMaster = userimpl.getRoleById(projectRoleUserMap.getRoleMaster().getRoleId());
			}
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);

		}
		session.flush();
		tx.commit();
		session.close();
		JSONObject result = new JSONObject();
		result.put("user_name", user.getUserName());
		result.put("user_email", user.getEmail());
		if (roleMaster != null) {
			result.put("user_role", roleMaster.getRoleName());
			result.put("user_role_id", roleMaster.getId());
		}

		if (projectRoleUserMap != null) {
			result.put("prmId", projectRoleUserMap.getRoleId());
		}

		LOGGER.info("End of getProfile method");
		return result.toString();
	}

	/**
	 * @param userId
	 *            String
	 * @param dProjectId
	 *            String
	 * @return int
	 */
	public int updateUserDeafultProject(final String userId, final String dProjectId) {
		LOGGER.info("Start of updateUserDeafultProject method");

		int res = updateDefaultProject(userId, dProjectId);
		if (res > 0) {
			LOGGER.info("End of updateUserDeafultProject method");
			return res;
		} else {
			return res;
		}
	}

	/**
	 * @param userId
	 *            String
	 * @param dProjectId
	 *            String
	 * @param themeName
	 *            String
	 * @return int
	 */
	public int updateUserDeafultTheme(final String userId, final String dProjectId, final String themeName) {
		LOGGER.info("Start of updateUserDeafultProject method");
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectUserMap.class)
					.add(Restrictions.eq("userId", Long.valueOf(userId)))
					.add(Restrictions.eq("defaultProjectId", Long.valueOf(dProjectId)));
			List<ProjectUserMap> widgets = (List<ProjectUserMap>) criteria.list();

			if (widgets.size() > 0) {
				for (ProjectUserMap widget : widgets) {
					widget.setLandingTheme(themeName);
					session.update(widget);
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

		if (res > 0) {
			LOGGER.info("End of updateUserDeafultTheme method");
			return res;
		} else {
			return res;
		}
	}

	/**
	 * @param userPwd
	 *            String
	 * @param userId
	 *            String
	 * @return boolean
	 * @throws Exception
	 *             Exception
	 */
	public boolean updtepswrd(final String userPwd, final String userId) throws Exception {
		LOGGER.info("Start of updtepswrd method");

		String pwd = new EncryptionService().encrypt(userPwd, "verita");
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserMaster.class)
					.add(Restrictions.eq("userId", Long.valueOf(userId)));
			UserMaster user = (UserMaster) criteria.uniqueResult();

			if (user != null) {
				user.setPassword(pwd);
				session.update(user);
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
		if (res > 0) {
			LOGGER.info("End of updtepswrd method");
			return true;
		} else {
			return false;
		}
	}

	/**
	 * @param projectId
	 *            String
	 * @param roleId
	 *            String
	 * @param jsonArray
	 *            JSONArray
	 * @param widType
	 *            String
	 * @return String
	 * @throws JSONException
	 *             Exception
	 */
	public String updteWidgetOrder(final String projectId, final String roleId, final org.json.JSONArray jsonArray,
			final String widType) throws JSONException {
		LOGGER.info("Start of updteWidgetOrder method");
		try {
			org.json.JSONArray woArray = null;
			if (widType.equals("standard")) {
				woArray = (org.json.JSONArray) jsonArray;
			} else {
				woArray = (org.json.JSONArray) jsonArray.get(0);
			}

			for (int i = 0; i < woArray.length(); i++) {
				try {
					Session session = sessionFactory.openSession();
					org.hibernate.Transaction tx = session.beginTransaction();
					if (widType.equals("standard")) {
						String prwid = ((org.json.JSONObject) woArray.get(i)).get("prwmId").toString();
						String neworderId = ((org.json.JSONObject) woArray.get(i)).get("newOrderId").toString();

						ProjectRoleMenuWidgetMap prwMap = (ProjectRoleMenuWidgetMap) session.get(ProjectRoleMenuWidgetMap.class,
								new Long(Integer.parseInt(prwid)));

						final long newOrderIdNo = Long.parseLong(neworderId);
						prwMap.setWidgetOrderNumber(newOrderIdNo);
						session.update(prwMap);
						tx.commit();
						session.close();
					} else {
						String customWidgetName = (String) ((org.json.JSONObject) woArray.get(i)).get("name");
						int newId = (int) ((org.json.JSONObject) woArray.get(i)).get("newOrderId");
						int res = updateMyDashboardWidgetsOrder(customWidgetName, newId);

					}
				} catch (Exception e) {
					StringWriter stack = new StringWriter();
					e.printStackTrace(new PrintWriter(stack));
					LOGGER.error(stack);
				}
			}
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			return "fail";
		}
		LOGGER.info("Start of updteWidgetOrder method");
		return "success";
	}

	public int updateMyDashboardWidgetsOrder(String customWidgetName, int widgetOrder) {
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(CustomWidgetModel.class)
					.add(Restrictions.eq("widgetName", customWidgetName));
			List<CustomWidgetModel> widgets = (List<CustomWidgetModel>) criteria.list();

			if (widgets.size() > 0) {
				for (CustomWidgetModel widget : widgets) {
					widget.setCustomWidgetOrderNo(widgetOrder);
					session.update(widget);
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

	// Default Settings
	/**
	 * @param userId
	 *            String
	 * @param dProjectId
	 *            String
	 * @param themeName
	 *            String
	 * @param landPage
	 *            String
	 * @return String
	 */
	public String updateDefaultSettings(final String userId, final String dProjectId, final String landPage,
			final String themeName, final String defaultBoard) {
		LOGGER.info("Start of updateUserDeafultProject method");
		int res = updateDefaultProject(userId, dProjectId);
		int res1 = updateDefaultProject(userId, dProjectId, landPage, themeName);

		String status = updateDefaultProject(dProjectId, userId, defaultBoard);
		if (res > 0 || res1 > 0 || status.equalsIgnoreCase("sucess")) {
			LOGGER.info("End of updateDeafultSettings method");
			return "Success";
		} else {
			return "Failure";
		}

	}

	public int updateDefaultProject(final String userId, final String projectid, final String landPage,
			final String themeName) {
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectUserMap.class)
					.add(Restrictions.eq("userId", Long.valueOf(userId)))
					.add(Restrictions.eq("projectId", Long.valueOf(projectid)));
			List<ProjectUserMap> widgets = (List<ProjectUserMap>) criteria.list();

			if (widgets.size() > 0) {
				for (ProjectUserMap widget : widgets) {
					widget.setLandingPage(landPage);
					widget.setLandingTheme(themeName);
					session.update(widget);
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

	public int updateDefaultProject(final String userId, final String projectid) {
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectUserMap.class)
					.add(Restrictions.eq("userId", Long.valueOf(userId)));
			List<ProjectUserMap> widgets = (List<ProjectUserMap>) criteria.list();

			if (widgets.size() > 0) {
				for (ProjectUserMap widget : widgets) {
					widget.setDefaultProjectId(Long.valueOf(projectid));
					session.update(widget);
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

	// Personal Details
	/**
	 * @param obj
	 *            org.json.JSONObject
	 * @param image
	 *            byte[]
	 * @return string
	 * @throws JSONException
	 *             json
	 */
	public String updatePersonalDetail(final org.json.JSONObject obj, final byte[] image) throws JSONException {
		LOGGER.info("Start of updatePersonalDetail method");
		Object userid = obj.get("userId");
		String userId = userid.toString();
		String emailId = (String) obj.get("email");
		int res = 0;
		if (image != null) {
			res = updateUserEmailImage(userId, emailId, image);
		} else {
			res = updateUserEmail(userId, emailId);
		}
		if (res > 0) {
			LOGGER.info("End of updatePersonalDetail method");
			return "success";
		} else {
			return "failure";
		}
	}

	public int updateUserEmailImage(final String userId, final String email, final byte[] image) {
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserMaster.class)
					.add(Restrictions.eq("userId", Long.valueOf(userId)));
			UserMaster user = (UserMaster) criteria.uniqueResult();

			if (user != null) {
				user.setEmail(email);
				user.setUserImage(image);
				session.update(user);
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
		return res;
	}

	public int updateUserEmail(final String userId, final String email) {
		int res = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(UserMaster.class)
					.add(Restrictions.eq("userId", Long.valueOf(userId)));
			UserMaster user = (UserMaster) criteria.uniqueResult();

			if (user != null) {
				user.setEmail(email);
				session.update(user);
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

	public String updateDefaultProject(String projectId, String userId, String defaultMenu) {
		try {

			Session session = sessionFactory.openSession();
			Transaction transaction = session.beginTransaction();

			ProjectUserMap projectUserMap = new ProjectUserMap();

			Criteria criteria = session.createCriteria(ProjectUserMap.class)
					.add(Restrictions.eq("projectId", Long.parseLong(projectId)))
					.add(Restrictions.eq("userId", Long.parseLong(userId)));
			projectUserMap = (ProjectUserMap) criteria.uniqueResult();

			ProjectRoleUserMap projectRoleUserMap = new ProjectRoleUserMap();

			Criteria criteria1 = session.createCriteria(ProjectRoleUserMap.class)
					.add(Restrictions.eq("projectId", Long.parseLong(projectId)))
					.add(Restrictions.eq("userId", projectUserMap.getId()));
			projectRoleUserMap = (ProjectRoleUserMap) criteria1.uniqueResult();

			List<ProjectRoleMenuMap> map = new ArrayList<ProjectRoleMenuMap>();

			Criteria prwcriteria = session.createCriteria(ProjectRoleMenuMap.class)
					.add(Restrictions.eq("projectId", Long.parseLong(projectId)))
					.add(Restrictions.eq("roleId", projectRoleUserMap.getRoleId()));
			map = prwcriteria.list();

			for (ProjectRoleMenuMap projectRoleWidgetMap : map) {
				projectRoleWidgetMap.setDefaultMenuId(Long.parseLong(defaultMenu));
				session.update(projectRoleWidgetMap);
			}
			session.flush();
			transaction.commit();
			session.close();

			return "success";
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			return "Unable to update defaultProject";
		}
	}
}
