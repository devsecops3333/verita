package verita.dashboard.daoservice;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import verita.dashboard.dao.impl.MenuWidgetMapImpl;
import verita.model.MenuWidgetMap;

@Service
public class MenuWidgetMapService {
	
	static final Logger LOGGER = Logger.getLogger(MenuWidgetMapService.class);
	@Autowired
	private MenuWidgetMapImpl widgetMapImpl;

	/**
	 * 
	 * @param widgetId long
	 * @return List
	 */
	public List<MenuWidgetMap> getMenuWidgetMapDetails(final long widgetId){
		return widgetMapImpl.getMenuWidgets(widgetId);
	}
	
	/**
	 * 
	 * @param menuId long
	 * @return List
	 */
	public List<MenuWidgetMap> getMenuMapDetails(final long menuId){
		return widgetMapImpl.getMenuMapDetails(menuId);
	}
	
	/**
	 * 
	 * @param widgetId long
	 * @return MenuWidgetMap
	 */
	public MenuWidgetMap getMenuWidgetMap(final long widgetId){
		return widgetMapImpl.getMenuWidgetMap(widgetId);
	}
	
}
