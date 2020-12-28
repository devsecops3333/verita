package verita.dashboard.daoservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import verita.dashboard.dao.impl.ProjectDaoImpl;
import verita.model.ProjectMaster;

/**
 * @author e001272
 *
 */
@Service
public class ProjectService {

	@Autowired
	private ProjectDaoImpl projectDaoImpl;
	/**
	 * @param id long
	 * @return ProjectMaster
	 */
	public ProjectMaster getProjectById(final long id) {
		return projectDaoImpl.getProjectById(id);
	}

}
