package verita.dashboard.dao.impl;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import verita.daointerface.MenuDashboardDao;
import verita.model.MenuDashboard;
import verita.model.MenuWidgetMap;
import verita.model.ProjectRoleMenuMap;
@Repository
public class MenuDashboardDaoImpl implements MenuDashboardDao{

	static final Logger LOGGER = Logger.getLogger(MenuDashboardDaoImpl.class);
	
	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;
	
	@Override
	public List<MenuDashboard> getMenuDetails(final long roleId,final long projectId) {
		List<MenuDashboard> menus = null;
		List<Long> menuMaps = null;

		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectRoleMenuMap.class).add(Restrictions.eq("roleId", roleId)).add(Restrictions.eq("projectId", projectId))
					.setProjection(Projections.distinct(Projections.property("menuID")))
					.addOrder(org.hibernate.criterion.Order.asc("menuID"));
			menuMaps = criteria.list();
			menus = new ArrayList<MenuDashboard>();
			for(Long menuid : menuMaps){
				Criteria criteria1 = session.createCriteria(MenuDashboard.class).add(Restrictions.eq("menuId", menuid));				
				MenuDashboard mm = (MenuDashboard) criteria1.uniqueResult();
				MenuDashboard menuDash = new MenuDashboard();
	
				menuDash.setMenuName(mm.getMenuName());
				menuDash.setMenuLink(mm.getMenuLink());	
				menuDash.setMenuId(mm.getMenuId());
				menuDash.setMenuIcon(mm.getMenuIcon());
				menuDash.setMenuSide(mm.getMenuSide());
				menuDash.setProjectId(mm.getProjectId());
				menuDash.setMenuOrder(mm.getMenuOrder());
				
					menus.add(menuDash);											
			}
			
			
			
		} catch(Exception e){
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			menus = new ArrayList<MenuDashboard>();
		}
		session.flush();
		session.close();
		return menus;
	}
	@Override
	public long getDefaultMenu(final long roleId,final long projectId) {
		long defaultMenuId = 0;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			Criteria criteria = session.createCriteria(ProjectRoleMenuMap.class)
								.add(Restrictions.eq("roleId", roleId)).add(Restrictions.eq("projectId", projectId))
								.setProjection(Projections.distinct(Projections.property("defaultMenuId")));
			Long defaultMenu = (Long) criteria.uniqueResult();
			if(defaultMenu != null){
				defaultMenuId = defaultMenu;
			}
			
		}catch(Exception e){
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			
		}
		session.flush();
		session.close();
		return defaultMenuId;
	}


	@Override
	public MenuDashboard getMenu(long menuId) {
		MenuDashboard menuDash = null;
		

		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try {
			
				Criteria criteria1 = session.createCriteria(MenuDashboard.class).add(Restrictions.eq("menuId", menuId));				
				MenuDashboard mm = (MenuDashboard) criteria1.uniqueResult();
				menuDash = new MenuDashboard();
	
				menuDash.setMenuName(mm.getMenuName());
				menuDash.setMenuLink(mm.getMenuLink());	
				menuDash.setMenuId(mm.getMenuId());
				menuDash.setMenuIcon(mm.getMenuIcon());
				menuDash.setMenuSide(mm.getMenuSide());
				menuDash.setProjectId(mm.getProjectId());
				menuDash.setMenuOrder(mm.getMenuOrder());
								
			
			
			
		} catch(Exception e){
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			
		}
		session.flush();
		session.close();
		return menuDash;

	}

}
