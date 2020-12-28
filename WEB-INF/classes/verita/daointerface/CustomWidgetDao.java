package verita.daointerface;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import verita.model.CustomWidgetModel;

/**
 * @author e001272
 *
 */
public interface CustomWidgetDao {

	/**
	 * @param customWidgetModel
	 *            CustomWidgetModel
	 * @return String
	 */
	String addCustomWidget(CustomWidgetModel customWidgetModel);

	/**
	 * @param userId
	 *            String
	 * @param projectId
	 *            int
	 * @return JSONArray
	 */
	JSONArray listCustomWidgets(String userId, int projectId);

	/**
	 * @param customWidgetid
	 *            int
	 * @return CustomWidgetModel
	 */
	CustomWidgetModel getCustomWidget(int customWidgetid);

	/**
	 * @param customWidgetId
	 *            int
	 * @return int
	 */
	int deleteCustomWidget(int customWidgetId);

	/**
	 * @param projectId
	 *            long
	 * @return JSONObject
	 */
	JSONObject getCustomToolsData(long projectId);

	/**
	 * @param userid
	 *            String
	 * @param projectid
	 *            int
	 * @return long
	 */
	long getCustomWCount(String userid, int projectid);

	CustomWidgetModel getCustomDataCenterWidget(int id);

	String editCustomWidget(CustomWidgetModel customWidgetModel);

}
