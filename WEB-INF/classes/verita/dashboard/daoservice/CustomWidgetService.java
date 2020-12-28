package verita.dashboard.daoservice;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;

import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import verita.bean.CustomWidget;
import verita.bean.UploadedFile;
import verita.daointerface.CustomWidgetDao;
import verita.model.CustomWidgetModel;
import verita.service.rest.GenericClient;

/**
 * @author e001272
 *
 */
@Service
public class CustomWidgetService {

	static final Logger LOGGER = Logger.getLogger(CustomWidgetService.class);

	@Autowired
	private CustomWidgetDao customWidgetsDao;

	@Autowired
	private ServletContext context;

	public org.json.JSONObject setWidgetDataToJSONFormat(final CustomWidget dwmBean) throws JSONException {
		org.json.JSONObject jsonObject = new org.json.JSONObject();
		jsonObject.put("chartType", dwmBean.getChartType());
		if (dwmBean.getxAxis() != null) {
			jsonObject.put("xAxisName", dwmBean.getxAxis());
		} else {
			jsonObject.put("xAxisName", "");
		}
		if (dwmBean.getyAxis() != null) {
			jsonObject.put("yAxisName", dwmBean.getyAxis());
		} else {
			jsonObject.put("yAxisName", "");
		}
		if (dwmBean.getChartSummary() != null) {
			jsonObject.put("chartSummary", dwmBean.getChartSummary());
		} else {
			jsonObject.put("chartSummary", "");
		}
		if (dwmBean.getxAxisTitle() != null) {
			jsonObject.put("xLabel", dwmBean.getxAxisTitle());
		} else {
			jsonObject.put("xLabel", "");
		}
		if (dwmBean.getyAxisTitle() != null) {
			jsonObject.put("yLabel", dwmBean.getyAxisTitle());
		} else {
			jsonObject.put("yLabel", "");
		}
		if (dwmBean.getLegendPosition() != null) {
			jsonObject.put("legendPosition", dwmBean.getLegendPosition());
		} else {
			jsonObject.put("legendPosition", "Top Left");
		}
		if (dwmBean.getAggrFunc() != null) {
			jsonObject.put("xaggrFun", dwmBean.getAggrFunc());
		} else {
			jsonObject.put("xaggrFun", "None");
		}
		if (dwmBean.getAggrFuncY() != null) {
			jsonObject.put("yaggrFun", dwmBean.getAggrFuncY());
		} else {
			jsonObject.put("yaggrFun", "");
		}
		jsonObject.put("colorsArray", Arrays.toString(dwmBean.getColorsArray()));
		jsonObject.put("groupArray", Arrays.toString(dwmBean.getGroupArray()));
		jsonObject.put("rotateLabel", dwmBean.isRotateLabel());
		jsonObject.put("showLabels", dwmBean.isShowLabels());
		if (dwmBean.getgroupBy() != null) {
			jsonObject.put("groupby", dwmBean.getgroupBy());
		} else {
			jsonObject.put("groupby", "");
		}
		if (dwmBean.getValueOrPercentage() != null) {
			jsonObject.put("valueOrPercentage", dwmBean.getValueOrPercentage());
		} else {
			jsonObject.put("valueOrPercentage", "value");
		}
		jsonObject.put("xAxisticklength", dwmBean.getxAxisticklength());
		if (dwmBean.getXaxisDataType() != null) {
			jsonObject.put("xColumndatatype", dwmBean.getXaxisDataType());
		} else {
			jsonObject.put("xColumndatatype", "");
		}
		if (dwmBean.getXaxisDateFormat() != null) {
			jsonObject.put("datetimeformat", dwmBean.getXaxisDateFormat());
		} else {
			jsonObject.put("datetimeformat", "");
		}
		if (dwmBean.getRightYAxis() != null) {
			jsonObject.put("rightYAxis", dwmBean.getRightYAxis());
		} else {
			jsonObject.put("rightYAxis", "");
		}
		if (dwmBean.getRightYAxisTitle() != null) {
			jsonObject.put("rightYAxisTitle", dwmBean.getRightYAxisTitle());
		} else {
			jsonObject.put("rightYAxisTitle", "");
		}
		if (dwmBean.getIsStacked() != null) {
			jsonObject.put("isStacked", dwmBean.getIsStacked());
		} else {
			jsonObject.put("isStacked", Boolean.parseBoolean("false"));
		}

		// Gauge chart columns
		if (dwmBean.getAggrFunG() != null) {
			jsonObject.put("gaggrFun", dwmBean.getAggrFunG());
		} else {
			jsonObject.put("gaggrFun", "");
		}

		if (dwmBean.getGaugeType() != null) {
			jsonObject.put("gaugeType", dwmBean.getGaugeType());
		} else {
			jsonObject.put("gaugeType", "");
		}

		if (dwmBean.getGaugeColumn() != null) {
			jsonObject.put("gaugeColumn", dwmBean.getGaugeColumn());
		} else {
			jsonObject.put("gaugeColumn", "");
		}

		if (dwmBean.getGaugeMaxValue() != null) {
			jsonObject.put("gaugeMaxValue", dwmBean.getGaugeMaxValue());
		} else {
			jsonObject.put("gaugeMaxValue", "");
		}

		return jsonObject;

	}

	/**
	 * @param customWidgets
	 *            CustomWidget
	 * @return String
	 * @throws JSONException
	 */
	public String customWidgetDetails(final CustomWidget customWidgets) throws JSONException {
		LOGGER.info("Start of customwidgetdetails method");
		CustomWidgetModel customWidgetModel = new CustomWidgetModel();

		if (customWidgets.getCustomWidgetId() != 0) {
			customWidgetModel.setCustomWidgetId(customWidgets.getCustomWidgetId());
		}
		customWidgetModel.setProjectId(customWidgets.getProjectId());
		customWidgetModel.setUserid(customWidgets.getUserId());
		customWidgetModel.setSourceUrl(customWidgets.getSourceUrl());
		customWidgetModel.setWidgetName(customWidgets.getWidgetName());
		customWidgetModel.setType(customWidgets.getType());
		customWidgetModel.setCustFilePath(customWidgets.getCustFilePath());
		customWidgetModel.setWidgetId(customWidgets.getWidgetId());
		customWidgetModel.setWidgetType(customWidgets.getWidgetType());
		customWidgetModel.setDatacenterId(customWidgets.getDatacenterId());
		customWidgetModel.setDatacenterWidgetId(customWidgets.getDatacenterWidgetId());
		customWidgetModel.setTemplate(customWidgets.getTemplate());
		customWidgetModel.setCustFileRealPath(customWidgets.getCustFileRealPath());
		customWidgetModel.setSheetName(customWidgets.getSheetName());
		customWidgetModel.setCustomWidgetOrderNo(
				(int) customWidgetsDao.getCustomWCount(customWidgets.getUserId(), customWidgets.getProjectId()));
		customWidgetModel.setCustomWidgetType(customWidgets.getCustomWidgetType());
		if (customWidgets.getMenuId() != null) {
			customWidgetModel.setMenuId(customWidgets.getMenuId());
		} else {
			// Adding from Standard boards to My Dashboard board
			customWidgetModel.setMenuId(0);
		}

		customWidgetModel.setGraphProperties(setWidgetDataToJSONFormat(customWidgets).toString());

		String custResp = customWidgetsDao.addCustomWidget(customWidgetModel);
		LOGGER.info("End of customwidgetdetails method");
		return custResp;
	}

	public String getMaxColors(String[] Allcolors) {
		String colorsArray = null;
		String strArray[] = new String[10];
		if (Allcolors.length >= 9) {
			for (int i = 0; i < Allcolors.length; i++) {
				if (i <= 9) {
					strArray[i] = Allcolors[i];
				}
			}
			colorsArray = Arrays.toString(strArray);
		} else {
			colorsArray = Arrays.toString(Allcolors);
		}
		return colorsArray;
	}

	/**
	 * @param restURL
	 *            String
	 * @param restUserName
	 *            String
	 * @param restPassword
	 *            String
	 * @return String
	 * @throws Exception
	 */
	public String customURLData(final String restURL, final String restUserName, final String restPassword,
			final String url) throws Exception {
		LOGGER.info("Start of customUrlData method");
		GenericClient genericClient = new GenericClient();
		String resultString = restURL.replaceAll(" ", "%20");
		genericClient.setURL(resultString);
		// genericClient.setURL("http://172.16.3.42:8080/jenkins/job/Demo_Deploy%20Project/api/json?"
		// + "tree=allBuilds[duration,number,timestamp,result]");

		if (restUserName.equalsIgnoreCase("NA") || restPassword.equalsIgnoreCase("NA")) {
			// Add statement here
			LOGGER.info("Do Nothing");
		} else {
			genericClient.setUserName(restUserName);
			genericClient.setPassword(restPassword);
		}
		genericClient.setAuthType("Basic ");
		genericClient.setmType("application/json");
		LOGGER.info("End of customUrlData method");
		String response = null;
		/*
		 * if (restURL.contains("qcbin")) { response =
		 * genericClient.getQCResponse(url); } else {
		 */
		response = genericClient.getResponse();
		// }

		return response;
	}

	/**
	 * @param upFile
	 *            UploadedFile
	 * @return File
	 */
	public File convert(final UploadedFile upFile) {

		String fullPath = context.getRealPath("/WEB-INF/views/customFiles");

		File customFile = new File(fullPath + "\\" + upFile.getName() + System.currentTimeMillis() + ".json");
		try {
			customFile.createNewFile();
			PrintWriter out = new PrintWriter(customFile);
			out.print(upFile.getData());
			out.flush();
			out.close();
		} catch (FileNotFoundException e) {

			e.printStackTrace();
		} catch (IOException e) {

			e.printStackTrace();
		}
		return customFile;
	}

	/**
	 * @param oBytes
	 *            byte[]
	 * @return byte[]
	 */
	public byte[] toPrimitives(final byte[] oBytes) {
		LOGGER.info("Start of toPrimitives method");
		byte[] bytes = new byte[oBytes.length];

		for (int i = 0; i < oBytes.length; i++) {
			bytes[i] = oBytes[i];
		}
		LOGGER.info("End of toPrimitives method");
		return bytes;
	}

	/**
	 * @param projectId
	 *            long
	 * @return JSONObject
	 */
	public JSONObject getCustomToolsData(final long projectId) {
		return customWidgetsDao.getCustomToolsData(projectId);
	}

	public String updateJsonFileFromLive(String custFileRealPath, String custFilePath, String sheetName) {
		// TODO Auto-generated method stub
		File realFilePath = new File(custFileRealPath);
		String extension = getFileExtension(realFilePath);

		String updatedJson = "";

		switch (extension) {
		case "xlsx":
			updatedJson = getJsonFromXlsxFile(realFilePath, sheetName);
			break;

		case "xls":
			updatedJson = getJsonFromXlsFile(realFilePath, sheetName);
			break;

		case "csv":
			updatedJson = getJsonFromCsvFile(realFilePath);
			break;
		}

		return updateJsonFile(updatedJson, custFilePath);
	}

	private String getJsonFromXlsxFile(File realFilePath, String sheetName) {
		// TODO Auto-generated method stub
		try {
			FileInputStream fileInputStream = new FileInputStream(realFilePath);

			// Create Workbook instance holding .xls file
			XSSFWorkbook workbook = new XSSFWorkbook(fileInputStream);

			// Get the first worksheet
			XSSFSheet sheet = workbook.getSheet(sheetName);

			// Iterate through each rows
			Iterator<Row> rowIterator = sheet.iterator();

			org.json.JSONArray updatedJson = new org.json.JSONArray();

			org.json.JSONArray headerColumns = new org.json.JSONArray();

			org.json.JSONObject rowsJson = null;

			int rowCount = 0;
			while (rowIterator.hasNext()) {
				// Get Each Row
				Row row = rowIterator.next();

				// Iterating through Each column of Each Row
				Iterator<Cell> cellIterator = row.cellIterator();

				if (rowCount == 0) {

					while (cellIterator.hasNext()) {

						Cell cell = cellIterator.next();

						headerColumns.put(getCellValue(cell));
					}
				} else {

					rowsJson = new org.json.JSONObject();
					int cellCount = 0;
					while (cellIterator.hasNext()) {

						Cell cell = cellIterator.next();

						rowsJson.put(headerColumns.getString(cellCount), getCellValue(cell));

						cellCount++;
					}

					updatedJson.put(rowsJson);
				}

				rowCount++;

			}

			return updatedJson.toString();
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}

	}

	private String getJsonFromXlsFile(File realFilePath, String sheetName) {
		// TODO Auto-generated method stub
		try {
			FileInputStream fileInputStream = new FileInputStream(realFilePath);

			// Create Workbook instance holding .xls file
			HSSFWorkbook workbook = new HSSFWorkbook(fileInputStream);

			// Get the first worksheet
			HSSFSheet sheet = workbook.getSheet(sheetName);

			// Iterate through each rows
			Iterator<Row> rowIterator = sheet.iterator();

			org.json.JSONArray updatedJson = new org.json.JSONArray();

			org.json.JSONArray headerColumns = new org.json.JSONArray();

			org.json.JSONObject rowsJson = null;

			int rowCount = 0;
			while (rowIterator.hasNext()) {
				// Get Each Row
				Row row = rowIterator.next();

				// Iterating through Each column of Each Row
				Iterator<Cell> cellIterator = row.cellIterator();

				if (rowCount == 0) {

					while (cellIterator.hasNext()) {

						Cell cell = cellIterator.next();

						headerColumns.put(getCellValue(cell));
					}
				} else {

					rowsJson = new org.json.JSONObject();
					int cellCount = 0;
					while (cellIterator.hasNext()) {

						Cell cell = cellIterator.next();

						rowsJson.put(headerColumns.getString(cellCount), getCellValue(cell));

						cellCount++;
					}

					updatedJson.put(rowsJson);
				}

				rowCount++;

			}

			return updatedJson.toString();
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}

	}

	private String getCellValue(Cell cell) {
		String value = "";
		switch (cell.getCellType()) {
		case Cell.CELL_TYPE_NUMERIC:
			// System.out.print(cell.getNumericCellValue() +
			// "\t");
			value = String.valueOf(cell.getNumericCellValue());
			break;
		case Cell.CELL_TYPE_STRING:
			// System.out.print(cell.getStringCellValue() +
			// "\t");
			value = String.valueOf(cell.getStringCellValue());

			break;
		case Cell.CELL_TYPE_BOOLEAN:
			// System.out.print(cell.getBooleanCellValue() +
			// "\t");
			value = String.valueOf(cell.getBooleanCellValue());
			break;

		case Cell.CELL_TYPE_BLANK:
			// System.out.print("NONE" + "\t");
			value = String.valueOf("NONE");

			break;
		}
		return value;

	}

	private String getJsonFromCsvFile(File realFilePath) {

		try {
			CsvSchema bootstrap = CsvSchema.emptySchema().withHeader();
			CsvMapper csvMapper = new CsvMapper();
			MappingIterator<Map<?, ?>> mappingIterator = csvMapper.reader(Map.class).with(bootstrap)
					.readValues(realFilePath);
			List<Map<?, ?>> data = mappingIterator.readAll();

			return new ObjectMapper().writeValueAsString(data);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return e.getMessage();
		}

	}

	private static String getFileExtension(File file) {
		String fileName = file.getName();
		if (fileName.lastIndexOf(".") != -1 && fileName.lastIndexOf(".") != 0)
			return fileName.substring(fileName.lastIndexOf(".") + 1);
		else
			return "";
	}

	private String updateJsonFile(String updatedJson, String customFilePath) {

		String fullPath = context.getRealPath("/WEB-INF/views/customFiles");

		File customFile = new File(fullPath + "\\" + customFilePath);
		try {
			// customFile.createNewFile();
			PrintWriter out = new PrintWriter(customFile);
			out.print(updatedJson);
			out.flush();
			out.close();

		} catch (IOException e) {

			e.printStackTrace();
		}
		return "File Updated Successfully";

	}

}
