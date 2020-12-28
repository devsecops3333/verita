package verita.daointerface;

import java.util.List;

import verita.model.MenuDashboard;
import verita.model.MenuWidgetMap;

public interface MenuDashboardDao {

	/**
	 * @param roleId long
	 * @param projectId long
	 * @return List
	 */
	List<MenuDashboard> getMenuDetails(final long roleId,final long projectId);
	
	/**
	 * @param menuId long
	 * @return List
	 */
	MenuDashboard getMenu(final long menuId);
		
	/**
	 * @param roleId long
	 * @param projectId long
	 */
	long getDefaultMenu(final long roleId,final long projectId);
	
}
