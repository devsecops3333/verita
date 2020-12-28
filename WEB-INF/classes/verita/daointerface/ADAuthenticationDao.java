package verita.daointerface;

import java.util.List;

import verita.model.VeritaSettingsMaster;
import verita.model.VeritaSubSetting;

public interface ADAuthenticationDao {

	public List<VeritaSettingsMaster> getVeritaSettingList();

	public List<VeritaSubSetting> getVeritaSubSettingList();

	public boolean getAuthenticateUserbyLDAP(String userId, String password);


}
