package verita.daointerface;

import java.util.List;

import verita.model.DataCenterWidgetMap;
import verita.model.ProjectRoleMenuWidgetMap;
import verita.model.ProjectRoleUserMap;

/**
 * @author e001272
 *
 */
public interface DataCenterDao {
	/**
	 * @return long
	 */
	long getCount();

	/**
	 * @param projectId
	 *            long
	 * @param userId
	 *            long
	 * @return ProjectRoleUserMap
	 */
	ProjectRoleUserMap getRoleByProjectIdAndUserId(long projectId, long userId);

	/**
	 * @param roleId
	 *            long
	 * @param projectId
	 *            long
	 * @return List<ProjectRoleMenuWidgetMap>
	 */
	List<ProjectRoleMenuWidgetMap> getProjectRoleWidgetsByRoleId(long roleId, long projectId);

	/**
	 * @param prwId
	 *            long
	 * @return DataCenterWidgetMap
	 */
	DataCenterWidgetMap getDataCenterWidgetMapByProjectRoleWidgetId(long prwId);

}
