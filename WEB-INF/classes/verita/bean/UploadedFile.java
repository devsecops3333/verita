package verita.bean;

/**
 * @author e001272
 *
 */
public class UploadedFile {


	private String name;
	private String data;
	private long userId;
	private String dcName;

	/**
	 * @return String
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name String
	 */
	public void setName(final String name) {
		this.name = name;
	}

	/**
	 * @return String
	 */
	public String getData() {
		return data;
	}

	/**
	 * @param data String
	 */
	public void setData(final String data) {
		this.data = data;
	}

	/**
	 * @return long
	 */
	public long getUserId() {
		return userId;
	}

	/**
	 * @param userId long
	 */
	public void setUserId(final long userId) {
		this.userId = userId;
	}
	/**
	 * @return String
	 */
	public String getDcName() {
		return dcName;
	}
	/**
	 * @param dcName String
	 */
	public void setDcName(final String dcName) {
		this.dcName = dcName;
	}


}
