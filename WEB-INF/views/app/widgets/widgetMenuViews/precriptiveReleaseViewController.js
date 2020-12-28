mainApp.controller('precriptiveReleaseViewController', function($scope, $sessionStorage,
		$rootScope, $http) {

	$('.fancybox').fancybox();
	
	$('#presRRLoadImg_id').show();

	$('.prescriptive').hide();
	
	$('.dontNav').click(function() {
		
        return false; // cancel the event
    });
	
	$http.get("http://172.16.30.227:90/cgt-dop-admin/devops/rest/prescriptiveAnalysis").then(function(response) {
		
		var data = response.data;
		var tr;
		var table = $('<table>').addClass('table data_table_class table-striped');
		
		
		tr = $('<tr/>');
		tr.append("<th align='center' width='20%'>" + "Fix Priority" + "</th>");
		tr.append("<th align='center' width='20%'>" + "Application Name"  + "</th>");
		tr.append("<th align='center' width='20%'>" + "Defect Id"  + "</th>");
		tr.append("<th align='center' width='20%'>" + "Severity"  + "</th>");
		tr.append("<th align='center' width='20%'>" + "TC Blocked"  + "</th>");
		table.append(tr);
		var priority = 0;
		for (var i = 0; i < data.length; i++) {

			var result = getChildTable(data[i].tCBlockedList);
			
			tr = $('<tr/>');
			tr.append("<td align='center' width='20%'>" + ++priority + "</td>");	      
			tr.append("<td align='center' width='20%'>" + data[i].applicationName + "</td>");
			tr.append("<td align='center' width='20%'>" + data[i].defectId + "</td>");
			tr.append("<td align='center' width='20%'>" + data[i].severity + "</td>");
			tr.append("<td align='center' width='20%'><a class='fancybox dontNav' style='color: #0000FF; text-decoration: underline;' href='#inline" + i + "' target='_blank'>" + data[i].count + "</a>" +					
				"<div id='inline" + i + "' style='display: none;'> " + result + "</div>" + "</td>");
			table.append(tr);
		}
		$('</table>');
		$('.prescriptive').append(table);
		
		$('#presRRLoadImg_id').hide();

		$('.prescriptive').show();
		

		function getChildTable(data)
		{			
			var tableData = "";
			var rowHead = '';
			$.each(data, function( index1, value1 ) {
				tableData += '<tr>';
				rowHead = '';
				$.each(value1, function( index, value ) {
					rowHead += '<th>' + index.substr(0,1).toUpperCase() + index.substr(1); + '</th>';
					tableData += '<td>' + value + '</td>';
				});
				tableData += '</tr>';
			});			
			var result = "<b class='panelHeaderTextPadding fontColor'>TC Blocked</b><table class='table data_table_class table-striped qctable'>";	
			result += '<tr>' + rowHead + '</tr>';
			result += tableData;
			result += '</table>';
			return result;
		}

	});

});