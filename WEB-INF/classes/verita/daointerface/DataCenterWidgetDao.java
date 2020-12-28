package verita.daointerface;

import verita.model.DataCenterWidgetMap;

/**
 * @author e001272
 *
 */
public interface DataCenterWidgetDao {

	/**
	 * @param datacenterwidgetid
	 *            long
	 * @return DataCenterWidgetMap
	 */
	DataCenterWidgetMap getDatacenterWidget(long datacenterwidgetid);

	/**
	 * @param dcwModel
	 *            DataCenterWidgetMap
	 * @return String
	 */
	String editDatacenterWidget(DataCenterWidgetMap dcwModel);

}
