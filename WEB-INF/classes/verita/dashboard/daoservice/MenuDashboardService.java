package verita.dashboard.daoservice;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import verita.dashboard.dao.impl.MenuDashboardDaoImpl;
import verita.model.MenuDashboard;

public class MenuDashboardService {
	
	static final Logger LOGGER = Logger.getLogger(MenuDashboardService.class);
	@Autowired
	private MenuDashboardDaoImpl menuImpl;

	public List<MenuDashboard> getMenus(long roleId,long projectId){		
		return menuImpl.getMenuDetails(roleId,projectId);
	}
	
}
