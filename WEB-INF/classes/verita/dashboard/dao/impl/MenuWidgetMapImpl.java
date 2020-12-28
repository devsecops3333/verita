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
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;


import verita.daointerface.MenuWidgetMapDao;
import verita.model.MenuWidgetMap;

@Repository
public class MenuWidgetMapImpl implements MenuWidgetMapDao{
	static final Logger LOGGER = Logger.getLogger(MenuDashboardDaoImpl.class);

	@Autowired
	@Qualifier(value = "sessionFactory")
	private SessionFactory sessionFactory;
	@Override
	public List<MenuWidgetMap> getMenuWidgets(long widgetId) {
		List<MenuWidgetMap> menuWidgetMap;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try{
			Criteria criteria = session.createCriteria(MenuWidgetMap.class).add(Restrictions.eq("widgetId", widgetId));
			menuWidgetMap = criteria.list();
		}catch(Exception e){
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			return new ArrayList<MenuWidgetMap>();
		}
		return menuWidgetMap;
	}
	
	@Override
	public MenuWidgetMap getMenuWidgetMap(long widgetId) {
		MenuWidgetMap menuWidgetMap;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try{
			Criteria criteria = session.createCriteria(MenuWidgetMap.class).add(Restrictions.eq("widgetId", widgetId));
			menuWidgetMap = (MenuWidgetMap) criteria.uniqueResult();
		}catch(Exception e){
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			return new MenuWidgetMap();
		}
		return menuWidgetMap;
	}
	
	@Override
	public List<MenuWidgetMap> getMenuMapDetails(long menuId) {
		List<MenuWidgetMap> menuWidgetMap;
		Session session = sessionFactory.openSession();
		Transaction tx = session.beginTransaction();
		try{
			Criteria criteria = session.createCriteria(MenuWidgetMap.class).add(Restrictions.eq("menuId", menuId));
			menuWidgetMap = criteria.list();
		}catch(Exception e){
			StringWriter stack = new StringWriter();
			e.printStackTrace(new PrintWriter(stack));
			LOGGER.error(stack);
			tx.rollback();
			return new ArrayList<MenuWidgetMap>();
		}
		return menuWidgetMap;
	}

}
