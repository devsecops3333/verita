package verita.dashboard.daoservice;

import org.apache.log4j.Logger;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.springframework.stereotype.Service;

import verita.model.DataCenterWidgetMap;
import verita.service.rest.EncryptionService;

/**
 * @author e001272
 *
 */
@Service
public class DBConfigureService {

	static final Logger LOGGER = Logger.getLogger(DBConfigureService.class);

	/**
	 * @param datacenterWidget
	 *            DataCenterWidgetMap
	 * @param context
	 *            AnnotationConfigApplicationContext
	 * @return SessionFactory
	 */
	private SessionFactory sessionfactory = null;
	private SessionFactory atomsessionfactory = null;

	public SessionFactory getSessionFactory(final DataCenterWidgetMap datacenterWidget) {

		if (sessionfactory != null) {
			return sessionfactory;
		} else {
			sessionfactory = createSessionFactory(datacenterWidget);
			return sessionfactory;
		}

	}

	public SessionFactory getAtomSessionFactory(final DataCenterWidgetMap datacenterWidget) {

		if (atomsessionfactory != null) {
			return atomsessionfactory;
		} else {
			atomsessionfactory = createSessionFactory(datacenterWidget);
			return atomsessionfactory;
		}

	}

	public SessionFactory createSessionFactory(DataCenterWidgetMap datacenterWidget) {
		String comString = datacenterWidget.getDataCenterMaster().getInstanceAuthn();
		SessionFactory sf = null;
		if (comString != null && comString.contains("UserName")) {
			try {
				String[] userpwd = comString.split(",");
				String[] user = userpwd[0].split(":");
				String[] password = userpwd[1].split(":");
				String decPwd = new EncryptionService().decrypt(password[1], "verita");
				Configuration configuration = new Configuration();
				configuration.setProperty("hibernate.connection.driver_class", "com.mysql.jdbc.Driver");
				configuration.setProperty("hibernate.connection.url",
						datacenterWidget.getDataCenterMaster().getInstanceUrl());
				configuration.setProperty("hibernate.connection.username", user[1]);
				configuration.setProperty("hibernate.connection.password", decPwd);
				configuration.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
				// if
				// (datacenterWidget.getDataCenterMaster().getInstanceUrl().contains("verita_atombank"))
				// {
				// System.out.println("in atom bank schema=============");
				// configuration.addPackage("verita.model").addAnnotatedClass(AtomTestCasesDetails.class)
				// .addAnnotatedClass(AtomTestScriptDetails.class)
				// .addAnnotatedClass(AtomTestStepsDetails.class)
				// .addAnnotatedClass(AtomTestSummaryDetails.class).addAnnotatedClass(BatchSummary.class)
				// .addAnnotatedClass(MortgageSummary.class).addAnnotatedClass(MortgageTestCases.class)
				// .addAnnotatedClass(MortgageTestSteps.class).addAnnotatedClass(Release.class)
				// .addAnnotatedClass(TestCase.class).addAnnotatedClass(TestScript.class)
				// .addAnnotatedClass(TestStep.class);
				// }
				// if
				// (datacenterWidget.getDataCenterMaster().getInstanceUrl().contains("automation"))
				// {
				// System.out.println("in automation --------------");
				// configuration.addPackage("verita.model").addAnnotatedClass(TestCasesDetails.class)
				// .addAnnotatedClass(TestExecCoverageDetails.class)
				// .addAnnotatedClass(TestExecEnvDetails.class).addAnnotatedClass(TestStepsDetails.class)
				// .addAnnotatedClass(TestsuitDetails.class).addAnnotatedClass(TestCase.class)
				// .addAnnotatedClass(TestScript.class).addAnnotatedClass(TestStep.class);
				// }

				StandardServiceRegistryBuilder builder = new StandardServiceRegistryBuilder()
						.applySettings(configuration.getProperties());
				sf = configuration.buildSessionFactory(builder.build());
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return sf;
	}
}
