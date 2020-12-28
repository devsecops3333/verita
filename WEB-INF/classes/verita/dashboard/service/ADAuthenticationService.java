package verita.dashboard.service;

import org.apache.log4j.Logger;
import org.hibernate.SessionFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import verita.dashboard.dao.impl.ADAuthenticationDaoImpl;

@Service
public class ADAuthenticationService {

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionfactory;

	@Autowired
	private ADAuthenticationDaoImpl adAuthenticationDaoImpl;

	static final Logger LOGGER = Logger.getLogger(ADAuthenticationService.class);

	public String getDataSourceType() throws JSONException {
		return adAuthenticationDaoImpl.getDataSourceType();
	}

	public boolean getMemCache() throws JSONException {
		return adAuthenticationDaoImpl.getMemCache();
	}

	public JSONObject getMemCacheSettings() throws JSONException {
		return adAuthenticationDaoImpl.getMemCacheSettings();
	}

	public String getAuthenticationType() throws JSONException {
		return adAuthenticationDaoImpl.getAuthenticationType();
	}

	public JSONObject getAuthenticationTypeSettings() throws JSONException {
		return adAuthenticationDaoImpl.getAuthenticationTypeSettings();
	}

	public boolean getAuthenticateUserbyLDAP(String userId, String password) throws JSONException {
		return adAuthenticationDaoImpl.getAuthenticateUserbyLDAP(userId, password);
	}
}
