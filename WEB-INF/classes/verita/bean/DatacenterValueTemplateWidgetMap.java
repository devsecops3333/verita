package verita.bean;

/**
 * @author e001272
 *
 */
public class DatacenterValueTemplateWidgetMap {

	private long id;
	private long datacenterId;
	private long projectWidgetMapId;
	private String widgetName;
	private String titleColor;
	private long titleSize;
	private String valueColor;
	private long valueSize;
	private String[] iconsArray;
	private String imageType;
	private String backgroundColor;
	private String userId;

	/**
	 * @return long
	 */
	public long getId() {
		return id;
	}

	/**
	 * @param id
	 *            long
	 */
	public void setId(final long id) {
		this.id = id;
	}

	/**
	 * @return long
	 */
	public long getDatacenterId() {
		return datacenterId;
	}

	/**
	 * @param datacenterId
	 *            long
	 */
	public void setDatacenterId(final long datacenterId) {
		this.datacenterId = datacenterId;
	}

	/**
	 * @return long
	 */
	public long getProjectWidgetMapId() {
		return projectWidgetMapId;
	}

	/**
	 * @param projectWidgetMapId
	 *            long
	 */
	public void setProjectWidgetMapId(final long projectWidgetMapId) {
		this.projectWidgetMapId = projectWidgetMapId;
	}

	public String getWidgetName() {
		return widgetName;
	}

	public void setWidgetName(String widgetName) {
		this.widgetName = widgetName;
	}

	public String getTitleColor() {
		return titleColor;
	}

	public void setTitleColor(String titleColor) {
		this.titleColor = titleColor;
	}

	public long getTitleSize() {
		return titleSize;
	}

	public void setTitleSize(long titleSize) {
		this.titleSize = titleSize;
	}

	public String getValueColor() {
		return valueColor;
	}

	public void setValueColor(String valueColor) {
		this.valueColor = valueColor;
	}

	public long getValueSize() {
		return valueSize;
	}

	public void setValueSize(long valueSize) {
		this.valueSize = valueSize;
	}

	public String[] getIconsArray() {
		return iconsArray;
	}

	public void setIconsArray(String[] iconsArray) {
		this.iconsArray = iconsArray;
	}

	public String getImageType() {
		return imageType;
	}

	public void setImageType(String imageType) {
		this.imageType = imageType;
	}

	public String getBackgroundColor() {
		return backgroundColor;
	}

	public void setBackgroundColor(String backgroundColor) {
		this.backgroundColor = backgroundColor;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

}
