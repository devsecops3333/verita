package verita.daointerface;

import verita.model.DomainProjectMap;
import verita.model.ProjectMaster;

/**
 * @author e001272
 *
 */
public interface ProjectDao {

	/**
	 * @param id long
	 * @return ProjectMaster
	 */
	ProjectMaster getProjectById(long id);
	/**
	 * @param pid long
	 * @return DomainProjectMap
	 */
	DomainProjectMap getDomainByPId(long pid);
}
