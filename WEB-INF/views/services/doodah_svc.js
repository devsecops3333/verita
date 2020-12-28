mainApp.service('doodahService', function($rootScope, $http, $sessionStorage,
		$timeout) {
	return {

		/**
		 * Method for calculating value for a gauge chart.
		 */
		showGaugeAggrValue : function(dataSet, gaugeGroup, gAggrFunc) {

			if (gaugeGroup == "") {
				$("#errorMsg").text("Please select a column");
				return false;
			} else {
				$("#errorMsg").text("");
			}

			var ndx = crossfilter(dataSet);

			var all = ndx.groupAll();
			var allCount = all.value();

			var netTotal = ndx.groupAll().reduceSum(function(d) {
				return d[gaugeGroup];
			});
			var allSum = netTotal.value();

			var allAvg = allSum / allCount;

			if (gAggrFunc == 'sum') {
				$('#selAggr').show();
				$('#selAggrVal').show();
				$('#selAggr').text('Sum:	');
				$('#selAggrVal').text(allSum);
				return allSum;
			} else if (gAggrFunc == 'count') {
				$('#selAggr').show();
				$('#selAggrVal').show();
				$('#selAggr').text('Count:	');
				$('#selAggrVal').text(allCount);
				return allCount;
			} else if (gAggrFunc == 'avg') {
				$('#selAggr').show();
				$('#selAggrVal').show();
				$('#selAggr').text('Avg:	');
				$('#selAggrVal').text(allAvg);
				return allAvg;
			}

		},
		/**
		 * End
		 */

		tableToJson : function(table) {

			var myRows = [];
			var headersText = [];
			var $headers = $(table + " th");

			var $rows = $(table + " tbody tr").each(
					function(index, ele) {
						if ($(ele).is(":visible")) {
							$cells = $(this).find("td");
							var temp = {}
							$cells.each(function(cellIndex) {
								if (headersText[cellIndex] === undefined) {
									var text = $($headers[cellIndex])
											.contents().filter(function() {
												return this.nodeType == 3;
											}).text();
									headersText[cellIndex] = text;
								}
								temp[headersText[cellIndex]] = $(this).text();
							});
							myRows.push(temp);
						}
					});
			return myRows;
		},

		filterJsonByKeys : function(data, keys) {
			var newData = [];
			for (var i = 0; i < data.length; i++) {
				var temp = {};
				for (var colIndex = 0; colIndex < keys.length; colIndex++) {
					var cellValue = data[i][keys[colIndex]];
					if (cellValue == null) {
						cellValue = "";
					}
					temp[keys[colIndex]] = cellValue;
				}
				newData.push(temp);
			}
			return newData;
		},

		getJSONByKeyAndVals : function(obj, key, vals) {
			var objects = [];
			for ( var i in obj) {
				if (!obj.hasOwnProperty(i))
					continue;
				if (typeof obj[i] == 'object') {
					objects = objects.concat(this.getJSONByKeyAndVals(obj[i],
							key, vals));
				} else if (i == key && (vals.indexOf(obj[i]) >= 0) || i == key
						&& vals == '') { //
					objects.push(obj);
				} else if ((vals.indexOf(obj[i]) >= 0) && key == '') {
					if (objects.lastIndexOf(obj) == -1) {
						objects.push(obj);
					}
				}
			}
			return objects;
		},

		/**
		 * For Google Sheets
		 */

		listSheets : function() {

			var sheetURL = $('#sheetURL').val();
			console.log('sheetURL: ' + sheetURL);
			// sheetName = $('#sheetName').val();
			var matches = sheetURL.match(/([0-9a-zA-Z_\-]+)/g);
			sheetId = matches[6];

			var sheetNames = [];
			$('#sheetName').empty();
			$('#sheetName').append(
					'<option value="">Select a Sheet... </option>');
			var options = '';

			gapi.client.sheets.spreadsheets.get({
				spreadsheetId : sheetId
			}).then(
					function(response) {

						var sheets = response.result.sheets;
						for (sheet in sheets) {
							sheetNames.push(sheets[sheet].properties.title);
							options += '<option value="'
									+ sheets[sheet].properties.title + '">'
									+ sheets[sheet].properties.title
									+ '</option>';

						}
						$('#sheetName').append(options);
					}, function(response) {
						console.log('Error: ' + response.result.error.message);
					});

		}
	/**
	 * End
	 */

	}
});
