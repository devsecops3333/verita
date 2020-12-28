package verita.daointerface;

import java.util.List;

import verita.model.MenuWidgetMap;

public interface MenuWidgetMapDao {
	 /** 
	 * @param widgetId long
	 * @return List
	 */
	List<MenuWidgetMap> getMenuWidgets(long widgetId);
	/** 
	 * @param widgetId long
	 * @return MenuWidgetMap
	 */
	MenuWidgetMap getMenuWidgetMap(long widgetId);
	/** 
	 * @param menuId long
	 * @return MenuWidgetMap
	 */
	List<MenuWidgetMap> getMenuMapDetails(long menuId);
}
