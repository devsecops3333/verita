package verita.daointerface;

import verita.model.UserChartInfo;

public interface UserChartInfoDAO {

	
	/**
	 * 
	 * @param userChartInfo UserChartInfo
	 * @return String
	 */
	String saveEditedChartInfoByUser(UserChartInfo userChartInfo);
	
	/**
	 * 
	 * @param dataCenterWidgetId long
	 * @param userId long
	 * @return UserChartInfo
	 */
	UserChartInfo getUserChartInfo(long dataCenterWidgetId,long userId);
	
	/**
	 * 
	 * @param dataCenterWidgetId long
	 * @param userId long
	 * @param toolProjectName String
	 * @return UserChartInfo
	 */
	UserChartInfo getEditedUserChartInfo(final long dataCenterWidgetId,final long userId,final String toolProjectName);
	
}
