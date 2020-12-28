package verita.daointerface;

import java.util.List;

import verita.model.ProjectMaster;
import verita.model.ProjectRoleUserMap;
import verita.model.ProjectUserMap;
import verita.model.RoleMaster;
import verita.model.UserMaster;

/**
 * @author e001272
 *
 */
public interface UserDao {

	/**
	 * @param username String
	 * @param password String
	 * @return UserMaster
	 */
	UserMaster getUsers(String username, String password);
	/**
	 * @param id long
	 * @param projectId long
	 * @return ProjectRoleUserMap
	 */
	ProjectRoleUserMap getProjectUserRole(long id, long projectId);
	/**
	 * @param id long
	 * @param projectId long
	 * @return ProjectUserMap
	 */
	ProjectUserMap getProjectUser(final long id, final long projectId);
	/**
	 * @param id long
	 * @return List<ProjectUserMap>
	 */
	List<ProjectUserMap> getProjects(long id);
	/**
	 * @param id long
	 * @return RoleMaster
	 */
	RoleMaster getRoleById(long id);
	/**
	 * @param id long
	 * @return ProjectMaster
	 */
	ProjectMaster getProjectMasterById(long id);
	/**
	 * @param uId long
	 * @return UserMaster
	 */
	UserMaster getUserById(long uId);

	/**
	 * @param userId long
	 * @return String
	 */
	String getLastLoginTime(long userId);

	/**
	 * @param userId long
	 * @return String
	 */
	String insertLoginTime(long userId);
}
