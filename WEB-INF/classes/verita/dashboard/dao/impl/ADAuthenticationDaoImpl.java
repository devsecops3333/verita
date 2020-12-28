package verita.dashboard.dao.impl;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;

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

import verita.daointerface.ADAuthenticationDao;
import verita.model.VeritaSettingsMaster;
import verita.model.VeritaSubSetting;

@Repository
public class ADAuthenticationDaoImpl implements ADAuthenticationDao {
	static final Logger LOGGER = Logger.getLogger(ADAuthenticationDaoImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;

	@Override
	public List<VeritaSettingsMaster> getVeritaSettingList() {
		List<VeritaSettingsMaster> settingsMasters = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(VeritaSettingsMaster.class);
			settingsMasters = criteria.list();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.debug(stack);
			tx.rollback();
			settingsMasters = new ArrayList<VeritaSettingsMaster>();
		}
		session.flush();
		tx.commit();
		session.close();
		return settingsMasters;
	}

	@Override
	public List<VeritaSubSetting> getVeritaSubSettingList() {
		List<VeritaSubSetting> settingsMasters = null;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(VeritaSubSetting.class);
			settingsMasters = criteria.list();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.debug(stack);
			tx.rollback();
			settingsMasters = new ArrayList<VeritaSubSetting>();
		}
		session.flush();
		tx.commit();
		session.close();
		return settingsMasters;
	}

	@Override
	public boolean getAuthenticateUserbyLDAP(String userId, String password) {

		org.json.JSONObject authenticationSettings = getAuthenticationTypeSettings();
		Properties props = new Properties();
		String ldap_username = "";
		try {
			ldap_username = userId + authenticationSettings.get("LDAP_USERNAME_SUFFIX").toString();
			props = new Properties();
			props.put(Context.INITIAL_CONTEXT_FACTORY, authenticationSettings.get("LDAP_JNDI").toString());
			props.put(Context.PROVIDER_URL, authenticationSettings.get("LDAP_URL").toString());
			props.put(Context.SECURITY_PRINCIPAL, ldap_username);
			props.put(Context.SECURITY_CREDENTIALS, password);
		} catch (JSONException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		boolean user = false;
		NamingEnumeration<SearchResult> results = null;
		try {
			InitialDirContext context = new InitialDirContext(props);
			SearchControls ctrls = new SearchControls();
			ctrls.setReturningAttributes(new String[] { "givenName", "sn", "memberOf" });
			ctrls.setSearchScope(SearchControls.SUBTREE_SCOPE);
			results = context.search("OU=HYD,OU=StandardUsers,OU=CignitiUsers,DC=cignitiglobal,DC=com",
					"(& (userPrincipalName=" + ldap_username + ")(objectClass=user))", ctrls);

			System.out.println(userId + " is a valid user");
		} catch (Exception e) {
			System.out.println(userId + " not a valid user");
			user = false;
		}

		if (results != null)
			if (results.nextElement() != null)
				user = true;

		return user;
	}

	public String getDataSourceType() {
		String datasourceType = "";
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria widgetCriteria = session.createCriteria(VeritaSettingsMaster.class)
					.add(Restrictions.eq("settingsName", "DATA_SOURCE"));
			VeritaSettingsMaster adAuthentication = (VeritaSettingsMaster) widgetCriteria.uniqueResult();
			datasourceType = adAuthentication.getSettingsValue();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		return datasourceType;

	}

	public boolean getMemCache() {
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		boolean flag = false;
		try {
			Criteria widgetCriteria = session.createCriteria(VeritaSettingsMaster.class)
					.add(Restrictions.eq("settingsName", "CACHING_MECHANISM"));
			VeritaSettingsMaster adAuthentication = (VeritaSettingsMaster) widgetCriteria.uniqueResult();
			String type = adAuthentication.getSettingsValue();
			if ("MemCached".equalsIgnoreCase(type)) {
				flag = true;
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
		return flag;

	}

	public JSONObject getMemCacheSettings() {
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		JSONObject object = new JSONObject();
		try {
			Criteria widgetCriteria = session.createCriteria(VeritaSubSetting.class)
					.add(Restrictions.eq("subSettingsKey", "MemCached"));
			List<VeritaSubSetting> adAuthentication = (List<VeritaSubSetting>) widgetCriteria.list();
			for (int i = 0; i < adAuthentication.size(); i++) {
				VeritaSubSetting obj = adAuthentication.get(i);
				object.put(obj.getSubSettingsName(), obj.getSubSettingsValue());
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
		return object;
	}

	public String getAuthenticationType() {
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		String authenticationType = "";
		try {
			Criteria widgetCriteria = session.createCriteria(VeritaSettingsMaster.class)
					.add(Restrictions.eq("settingsName", "AUTHENTICATION_TYPE"));
			VeritaSettingsMaster adAuthentication = (VeritaSettingsMaster) widgetCriteria.uniqueResult();
			authenticationType = adAuthentication.getSettingsValue();
		} catch (Exception e) {
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
		}
		session.flush();
		tx.commit();
		session.close();
		return authenticationType;
	}

	public JSONObject getAuthenticationTypeSettings() {
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		JSONObject object = new JSONObject();
		try {
			Criteria widgetCriteria = session.createCriteria(VeritaSubSetting.class)
					.add(Restrictions.eq("subSettingsKey", "LDAP"));
			List<VeritaSubSetting> adAuthentication = (List<VeritaSubSetting>) widgetCriteria.list();
			for (int i = 0; i < adAuthentication.size(); i++) {
				VeritaSubSetting obj = adAuthentication.get(i);
				object.put(obj.getSubSettingsName(), obj.getSubSettingsValue());
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
		return object;
	}
}
