package verita.dashboard.dao.impl;

import java.util.Properties;
import javax.sql.DataSource;
import org.apache.commons.dbcp.BasicDataSource;
import org.hibernate.SessionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.hibernate4.LocalSessionFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;



/**
 * @author e001272
 *
 */
@Configuration
@EnableTransactionManagement
@ComponentScan(excludeFilters = { @ComponentScan.Filter(Configuration.class) })
public class DBConfigure {

	/**
	 * @return DataSource
	 */
	@Bean(name = "dataSource")
	public DataSource getDataSource() {
		return new BasicDataSource();
	}

	/**
	 * @return SessionFactory
	 * @throws Exception Exception
	 */
	@Bean(name = "sessionFactory")
	public SessionFactory getSessionFactory() throws Exception {
		Properties properties = new Properties();
		properties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
		properties.put("hibernate.show_sql", "true");
		properties.put("current_session_context_class", "thread");
		properties.put("hibernate.hbm2ddl.auto", "update");
		LocalSessionFactoryBean factory = new LocalSessionFactoryBean();
		factory.setPackagesToScan(new String[] {"verita.model"});
		factory.setDataSource(getDataSource());
		factory.setHibernateProperties(properties);
		factory.afterPropertiesSet();
		return factory.getObject();
	}

}
