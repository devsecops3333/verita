package verita.dashboard.controller;

import org.apache.log4j.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * @author e001272
 *
 */
@EnableWebMvc
@Configuration
@ComponentScan({ "verita.dashboard.*" })
public class ApplicationConfigurerAdapter extends WebMvcConfigurerAdapter {

	static final Logger LOGGER = Logger.getLogger(ApplicationConfigurerAdapter.class);

    private static final String VIEW_DIR_HTML = "/WEB-INF/views/";
    private static final String VIEW_EXTN_HTML = ".html";


    /**
     * @return ViewResolver
     */
    @Bean
    public ViewResolver htmlViewResolver() {
    	LOGGER.info("start of html view resolver method");
        InternalResourceViewResolver viewResolver = new ApplicationInternalResourceViewResolver();
        viewResolver.setPrefix(VIEW_DIR_HTML);
        viewResolver.setSuffix(VIEW_EXTN_HTML);
        viewResolver.setOrder(0);
        LOGGER.info("end of html view resolver method");
        return viewResolver;
    }
}
