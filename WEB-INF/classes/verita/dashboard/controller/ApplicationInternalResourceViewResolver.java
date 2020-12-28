package verita.dashboard.controller;

import java.io.InputStream;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.web.servlet.view.AbstractUrlBasedView;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * @author e001272
 *
 */
public class ApplicationInternalResourceViewResolver  extends InternalResourceViewResolver {

	static final Logger LOGGER = Logger.getLogger(ApplicationInternalResourceViewResolver.class);

    /* (non-Javadoc)
     * @see org.springframework.web.servlet.view.InternalResourceViewResolver#buildView(java.lang.String)
     */
	@Override
    protected AbstractUrlBasedView buildView(final String viewName) throws Exception {
    	LOGGER.info("start of build view method");
        String url = getPrefix() + viewName + getSuffix();
        InputStream stream = getServletContext().getResourceAsStream(url);
        if (stream == null) {
            return new NonExistentView();
        } else {
            stream.close();
        }
        LOGGER.info("end of build view method");
        return super.buildView(viewName);
    }


    /**
     * @author e001272
     *
     */
    private static class NonExistentView extends AbstractUrlBasedView {

        /* (non-Javadoc)
         * @see org.springframework.web.servlet.view.AbstractUrlBasedView#isUrlRequired()
         */
    	@Override
        protected boolean isUrlRequired() {
            return false;
        }

        /* (non-Javadoc)
         * @see org.springframework.web.servlet.view.AbstractUrlBasedView#checkResource(java.util.Locale)
         */
    	@Override
        public boolean checkResource(final Locale locale) throws Exception {
            return false;
        }

        /* (non-Javadoc)
         * @see org.springframework.web.servlet.view.AbstractView#renderMergedOutputModel(java.util.Map,
         *  javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
         */
    	@Override
        protected void renderMergedOutputModel(final Map<String, Object> model, final HttpServletRequest request,
                final HttpServletResponse response) throws Exception {
        }
    }
}
