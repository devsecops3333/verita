mainApp
		.service(
				'commonService',
				function($rootScope, $http, $compile, $sessionStorage,
						$timeout, widgetService) {

					return {
						/**
						 * Methods for displaying colors
						 */
						getColorsArray : function(cArray) {

							if (cArray == undefined || cArray == null) {
								return [];
							}
							if (typeof cArray == 'object') {
								return cArray;
							} else {
								var joinedMinusBrackets = cArray.substring(1,
										cArray.length - 1);
								return joinedMinusBrackets.split(", ");
							}
						},

						getColorsCount : function(dataSet, key) {

							var ndx = crossfilter(dataSet);

							var groupByDim = ndx.dimension(function(d) {
								return d[key];
							});
							var groupByGroup = groupByDim.group();
							var groups = groupByGroup.top(Infinity);
							return groups;
						},

						getColorsDiv : function(counter, colorsArray) {

							$("#TextBoxesGroup").html('');
							for (var j = 0, i = 0; i < counter.length; i++, j++) {
								if (j >= colorsArray.length) {
									j = 0;
								}
								var newTextBoxDiv = $(
										document.createElement('div')).attr(
										"id", 'TextBoxDiv' + i).attr("class",
										'col-sm-12 mt10');
								var colorLabel = counter[i];

								if (typeof colorLabel !== "object"
										|| typeof colorLabel !== undefined) {
									colorLabel = colorLabel;
								} else {
									colorLabel = "";
								}
								newTextBoxDiv
										.after()
										.html(
												'<div class="col-sm-4 mTopMini">'
														+ '<label class="control-label colorWhite">'
														+ colorLabel
														+ ' Color</label>'
														+ '</div><div class="col-sm-7">'
														+ '<div class="cp input-group colorpicker-component" id="cPicker'
														+ i
														+ '">'
														+ '<input type="text" value="'
														+ colorsArray[j]
														+ '" '
														+ 'class="form-control" id="color'
														+ i
														+ '" /> '
														+ '<span class="input-group-addon"><i></i></span>'
														+ '</div></div>');

								newTextBoxDiv.appendTo("#TextBoxesGroup");

								// counter++;
								this.callColorClass();
							}
						},
						callColorClass : function() {
							$('.cp').colorpicker({
								customClass : 'colorpicker-2x',
								format : 'hex',
								sliders : {
									saturation : {
										maxLeft : 200,
										maxTop : 200
									},
									hue : {
										maxTop : 200
									},
									alpha : {
										maxTop : 200
									}
								},
								colorSelectors : {
									'red' : '#FF0000',
									'green' : '#00ff00',
									'yellow' : '#0000ff',
									'orange' : '#ed7d31',
									'default' : '#777777',
									'primary' : '#337ab7',
									'success' : '#5cb85c',
									'info' : '#5bc0de',
									'warning' : '#f0ad4e',
									'danger' : '#d9534f'
								}

							});
						},
						// ------------------- Generic HTML Table
						// ---------------------------//
						buildGenericHtmlTable : function(myList, container) {
							var dataobject = null;
							if ($.fn.dataTable.isDataTable(container)) {
								$(container).dataTable().fnDestroy();
							}
							$(container).html('');
							if (myList != null && myList != undefined) {
								var columns = this.addGenericColumnHeaders(
										myList, container);
								for (var i = 0; i < myList.length; i++) {
									var row$ = $('<tr/>');
									for (var colIndex = 0; colIndex < columns.length; colIndex++) {
										var cellValue = myList[i][columns[colIndex]];
										if (cellValue == null) {
											cellValue = "";
										}
										row$.append($(
												'<td data-val="' + colIndex
														+ '_' + cellValue
														+ '"/>')
												.html(cellValue));
									}
									$(container).append(row$);
									if (myList.length - 1 == i) {

										if ($.fn.dataTable
												.isDataTable(container)) {
											$(container).dataTable()
													.fnDestroy();
										}
										if (!$.fn.dataTable
												.isDataTable(container)) {
											dataobject = $(container)
													.DataTable(
															{
																"aLengthMenu" : [
																		[
																				5,
																				15,
																				50,
																				-1 ],
																		[
																				5,
																				15,
																				50,
																				"All" ] ],
																"iDisplayLength" : 5,
																"ordering" : false
															});
											return dataobject;
										}

									}
								}
							}
						},
						addGenericColumnHeaders : function(myList, container) {
							var columnSet = [];
							var headerTr$ = $('<tr/>');
							var tHead$ = $('<thead/>');

							if (myList != null && myList != undefined
									&& myList.length > 0) {
								var rowHash = myList[0];
								if (rowHash.hasOwnProperty('xAxisTitle')) {
									headerTr$
											.append($(
													'<th class="genericTableStyle"></th>')
													.prepend("xAxisTitle"));
									columnSet.push("xAxisTitle");
								}

								for ( var key in rowHash) {
									if (key != "xAxisTitle") {
										if ($.inArray(key, columnSet) == -1) {
											columnSet.push(key);
											headerTr$
													.append($(
															'<th class="genericTableStyle"></th>')
															.prepend(key));
										}
									}
								}
							}
							$(tHead$).append(headerTr$);
							$(container).append(tHead$);

							return columnSet;
						},
						// Value template Structure Design
						callValueTemplateStructure : function(dataObj, index,
								options) {
							var keysLength = dataObj.length;
							if (keysLength != null && keysLength != undefined
									&& keysLength > 0) {
								switch (keysLength) {

								case 1:
									return this.call1ValueTemplateStructure(
											index, options);
									break;
								case 2:
									return this.call2ValueTemplateStructure(
											index, options);
									break;
								case 3:
									return this.call3ValueTemplateStructure(
											index, options);
									break;
								case 4:
									return this.call4ValueTemplateStructure(
											index, options);
									break;
								case 5:
									return this.call5ValueTemplateStructure(
											index, options);
									break;
								case 6:
									return this.call6ValueTemplateStructure(
											index, options);
									break;
								default:
									return this.call6ValueTemplateStructure(
											index, options);
									break;
								}
							}
						},
						// Set data for Value template Structure Design
						buildValueTemplateStructure : function(dataObj, index) {
							var keysLength = dataObj.length;
							if (keysLength != null && keysLength != undefined
									&& keysLength > 0) {
								this.buildDataForValueTemplate(dataObj, index);
							}

						},
						buildDataForValueTemplate : function(data, index) {
							var count = 1;
							for (var count = 1; count <= data.length; count++) {
								var dataObj = data[count - 1];
								var header = dataObj[Object.keys(dataObj)[0]];
								var value = dataObj[Object.keys(dataObj)[1]];

								$('.heading' + count + 'ForWidget' + index)
										.empty();
								$('.heading' + count + 'ForWidget' + index)
										.html(header);

								$('.value' + count + 'ForWidget' + index)
										.empty();
								$('.value' + count + 'ForWidget' + index).html(
										value);
							}
						},
						// 1-Value Template Build
						call1ValueTemplateStructure : function(index, options) {
							var divObj = '<div id="value1template'
									+ index
									+ '" class="mtForValue1"><div class="row graphWell bTop" align="center">'
									+ this.createDivFor1ValueTemplate(index, 1,
											options) + '</div>' + '</div>'
									+ '</div></div>';

							return divObj;
						},
						getImageObj : function(options, number, imageSizeClass,
								fontAwesomeClass) {
							var image = "image" + number;
							var colorName = "color" + number;
							var iconDivObj = "";
							if (options.imageType == "font_awesome") {
								iconDivObj = '<i class="' + options[image]
										+ ' ' + fontAwesomeClass
										+ ' scoreGreencolor" style="color: '
										+ options[colorName] + '";></i>';
							} else {
								iconDivObj = '<img src="' + options[image]
										+ '" class="' + imageSizeClass
										+ ' scoreGreencolor"/>';
							}
							return iconDivObj;
						},
						createDivFor1ValueTemplate : function(index, number,
								options) {
							var iconDivObj = this.getImageObj(options, number,
									"iconSize1", "iconSizeFont1");

							var divElement = '<div class="col-md-10 divPadding" align="center">'
									+ '<div class="col-md-12 deviceDiv1 hvr-glow atom_dashboard_div" style="background-color:'
									+ options.backgroundColor
									+ ';">'
									+ '<div class="col-md-3">'
									+ iconDivObj
									+ '</div>'
									+ '<div class="col-md-9 valueDiv1">'
									+ '<span style="color: '
									+ options.titleColor
									+ ';font-size: '
									+ options.titleSize
									+ 'px;" class="heading'
									+ number
									+ 'ForWidget'
									+ index
									+ '"></span>'
									+ '<h2 class="value'
									+ number
									+ 'ForWidget'
									+ index
									+ '" style="color: '
									+ options.valueColor
									+ ';font-size: '
									+ options.valueSize
									+ 'px;"></h2>'
									+ '</div>' + '</div>' + '</div>';

							return divElement;
						},

						call2ValueTemplateStructure : function(index, options) {
							var divObj = '<div id="value2template'
									+ index
									+ '"><div class="row graphWell bTop" align="center"><div class="col-md-12"><div class="col-md-2"></div>'
									+ this.createDivFor2ValueTemplate(index, 1,
											options)
									+ '<div class="col-md-2"></div></div><div class="col-md-12">'
									+ '<div class="col-md-2"></div>'
									+ this.createDivFor2ValueTemplate(index, 2,
											options)
									+ '<div class="col-md-2"></div></div></div>'
									+ '</div></div>';

							return divObj;
						},
						createDivFor2ValueTemplate : function(index, number,
								options) {
							var iconDivObj = this.getImageObj(options, number,
									"iconSize2", "iconSizeFont2");

							var divElement = '<div class="col-md-8 divPadding" align="center">'
									+ '<div class="col-md-12 deviceDiv2 hvr-glow atom_dashboard_div" style="background-color:'
									+ options.backgroundColor
									+ ';">'
									+ '<div class=" col-md-3">'
									+ iconDivObj
									+ '</div>'
									+ '<div class="col-md-9 valueDiv2">'
									+ '<span style="color: '
									+ options.titleColor
									+ ';font-size: '
									+ options.titleSize
									+ 'px;" class="heading'
									+ number
									+ 'ForWidget'
									+ index
									+ '"></span>'
									+ '<h4 class="value2Color value'
									+ number
									+ 'ForWidget'
									+ index
									+ '" style="color: '
									+ options.valueColor
									+ ';font-size: '
									+ options.valueSize
									+ 'px;"></h4>'
									+ '</div>' + '</div>' + '</div>';

							return divElement;
						},
						// 3-Value Template Build
						call3ValueTemplateStructure : function(index, options) {
							var divObj = '<div id="value3template'
									+ index
									+ '"><div class="row graphWell bTop" align="center"><div class="col-md-12"><div class="col-md-2"></div>'
									+ this.createDivFor3ValueTemplate(index, 1,
											options)
									+ '<div class="col-md-2"></div></div><div class="col-md-12">'
									+ '<div class="col-md-2"></div>'
									+ this.createDivFor3ValueTemplate(index, 2,
											options)
									+ '<div class="col-md-2"></div></div><div class="col-md-12">'
									+ '<div class="col-md-2"></div>'
									+ this.createDivFor3ValueTemplate(index, 3,
											options)
									+ '<div class="col-md-2"></div></div></div>'
									+ '</div></div>';

							return divObj;
						},
						createDivFor3ValueTemplate : function(index, number,
								options) {
							var iconDivObj = this.getImageObj(options, number,
									"iconSize3", "iconSizeFont3");
							var divElement = '<div class="col-md-8 divPadding" align="center">'
									+ '<div class="col-md-12 deviceDiv3 hvr-glow atom_dashboard_div" style="background-color:'
									+ options.backgroundColor
									+ ';">'
									+ '<div class=" col-md-3">'
									+ iconDivObj
									+ '</div>'
									+ '<div class="col-md-9 valueDiv3">'
									+ '<span style="color: '
									+ options.titleColor
									+ ';font-size: '
									+ options.titleSize
									+ 'px;" class="heading'
									+ number
									+ 'ForWidget'
									+ index
									+ '"></span>'
									+ '<h4 class="value3Color value'
									+ number
									+ 'ForWidget'
									+ index
									+ '" style="color: '
									+ options.valueColor
									+ ';font-size: '
									+ options.valueSize
									+ 'px;"></h4>'
									+ '</div>' + '</div>' + '</div>';

							return divElement;
						},

						// 4-Value Template Build
						call4ValueTemplateStructure : function(index, options) {

							var divObj = '<div id="value6template'
									+ index
									+ '"><div class="row graphWell bTop" align="center">'
									+ this.createDivFor4ValueTemplate(index, 1,
											options)
									+ this.createDivFor4ValueTemplate(index, 2,
											options)
									+ this.createDivFor4ValueTemplate(index, 3,
											options)
									+ this.createDivFor4ValueTemplate(index, 4,
											options) + '</div>' + '</div>'
									+ '</div></div>';

							return divObj;
						},
						createDivFor4ValueTemplate : function(index, number,
								options) {

							var iconDivObj = this.getImageObj(options, number,
									"iconSize4", "iconSizeFont4");

							var divElement = '<div class="col-md-6 divPadding" align="center">'
									+ '<div class="col-md-12 deviceDiv4 hvr-glow atom_dashboard_div" style="background-color:'
									+ options.backgroundColor
									+ ';">'
									+ '<div class="col-md-3">'
									+ iconDivObj
									+ '</div>'
									+ '<div class="col-md-9 valueDiv4">'
									+ '<span style="color: '
									+ options.titleColor
									+ ';font-size: '
									+ options.titleSize
									+ 'px;" class="heading'
									+ number
									+ 'ForWidget'
									+ index
									+ '"></span>'
									+ '<h4 class="value4Color value'
									+ number
									+ 'ForWidget'
									+ index
									+ '" style="color: '
									+ options.valueColor
									+ ';font-size: '
									+ options.valueSize
									+ 'px;"></h4>'
									+ '</div>' + '</div>' + '</div>';

							return divElement;
						},

						// 5-Value Template Build
						call5ValueTemplateStructure : function(index, options) {
							var divObj = '<div id="value6template'
									+ index
									+ '"><div class="row graphWell bTop" align="center">'
									+ this.createDivFor5ValueTemplate(index, 1,
											options)
									+ this.createDivFor5ValueTemplate(index, 2,
											options)
									+ this.createDivFor5ValueTemplate(index, 3,
											options)
									+ this.createDivFor5ValueTemplate(index, 4,
											options)
									+ this.createDivFor5ValueTemplate(index, 5,
											options) + '</div>' + '</div>'
									+ '</div></div>';

							return divObj;
						},
						createDivFor5ValueTemplate : function(index, number,
								options) {
							var divCount = "col-md-6";
							if (number == 5) {
								divCount = "col-md-12";
							}
							var iconDivObj = this.getImageObj(options, number,
									"iconSize6", "iconSizeFont6");
							var divElement = '<div class="'
									+ divCount
									+ ' divPadding" align="center">'
									+ '<div class="col-md-12 deviceDiv5 hvr-glow atom_dashboard_div" style="background-color:'
									+ options.backgroundColor + ';">'
									+ '<div class="col-md-3">' + iconDivObj
									+ '</div>'
									+ '<div class="col-md-9 valueDiv6">'
									+ '<span style="color: '
									+ options.titleColor + ';font-size: '
									+ options.titleSize + 'px;" class="heading'
									+ number + 'ForWidget' + index
									+ '"></span>' + '<h4 class="value' + number
									+ 'ForWidget' + index + '" style="color: '
									+ options.valueColor + ';font-size: '
									+ options.valueSize + 'px;"></h4>'
									+ '</div>' + '</div>' + '</div>';

							return divElement;
						},
						// 6-Value Template Build
						call6ValueTemplateStructure : function(index, options) {

							var divObj = '<div id="value6template'
									+ index
									+ '"><div class="row graphWell bTop" align="center">'
									+ this.createDivFor6ValueTemplate(index, 1,
											options)
									+ this.createDivFor6ValueTemplate(index, 2,
											options)
									+ this.createDivFor6ValueTemplate(index, 3,
											options)
									+ this.createDivFor6ValueTemplate(index, 4,
											options)
									+ this.createDivFor6ValueTemplate(index, 5,
											options)
									+ this.createDivFor6ValueTemplate(index, 6,
											options) + '</div>' + '</div>'
									+ '</div></div>';

							return divObj;
						},
						createDivFor6ValueTemplate : function(index, number,
								options) {

							var iconDivObj = this.getImageObj(options, number,
									"iconSize6", "iconSizeFont6");

							var divElement = '<div class="col-md-6 divPadding" align="center">'
									+ '<div class="col-md-12 deviceDiv5 hvr-glow atom_dashboard_div" style="background-color:'
									+ options.backgroundColor
									+ ';">'
									+ '<div class="col-md-3">'
									+ iconDivObj
									+ '</div>'
									+ '<div class="col-md-9 valueDiv6">'
									+ '<span style="color: '
									+ options.titleColor
									+ ';font-size: '
									+ options.titleSize
									+ 'px;" class="heading'
									+ number
									+ 'ForWidget'
									+ index
									+ '"></span>'
									+ '<h4 class="value'
									+ number
									+ 'ForWidget'
									+ index
									+ '" style="color: '
									+ options.valueColor
									+ ';font-size: '
									+ options.valueSize
									+ 'px;"></h4>'
									+ '</div>' + '</div>' + '</div>';

							return divElement;
						},
						setDataForValueTemplates : function(index, dataObj,
								widgetName, valueTempInformation, panelId) {
							$(panelId).empty();
							// var dataObj = dataSet[0];
							var keysLength = dataObj.length;
							var imageType = valueTempInformation.imageType;
							var options = {
								templateId : index,
								widgetName : widgetName,
								titleColor : valueTempInformation.titleColor,
								titleSize : valueTempInformation.titleSize,
								valueColor : valueTempInformation.valueColor,
								valueSize : valueTempInformation.valueSize,
								imageType : imageType,
								backgroundColor : valueTempInformation.backgroundColor
							};
							var iconsArrayObj = valueTempInformation.iconsArray;
							if (keysLength != null && keysLength != undefined
									&& keysLength > 0) {
								for (var i = 1; i <= keysLength; i++) {
									if (iconsArrayObj != null
											&& iconsArrayObj != undefined
											&& iconsArrayObj != '') {

										if (typeof iconsArrayObj == "string") {
											iconsArrayObj = iconsArrayObj
													.split(",");
										}
										if (iconsArrayObj[i - 1] == undefined
												|| iconsArrayObj[i - 1] == "defaultImage") {
											options["image" + i] = valueTempInformation.defaultImage;
										} else {
											// If font awesome icons
											if (imageType == "font_awesome") {
												if (iconsArrayObj[i - 1]
														.includes(":")) {
													var iconAndColorArray = iconsArrayObj[i - 1]
															.split(":");
													options["image" + i] = iconAndColorArray[0];
													options["color" + i] = iconAndColorArray[1];
												} else {
													options["image" + i] = iconsArrayObj[i - 1];
												}

											} else {
												// Images
												var iconsDataArray = valueTempInformation.iconsDataArray;
												if (typeof iconsDataArray == "string") {
													iconsDataArray = JSON
															.parse(iconsDataArray);
												}
												options["image" + i] = iconsDataArray[i - 1];
											}

										}
									} else {
										options["image" + i] = valueTempInformation.defaultImage;
									}
								}

							}
							var valueTemp = this.callValueTemplateStructure(
									dataObj, index, options);
							$(panelId).append(valueTemp);
							this.buildValueTemplateStructure(dataObj, index);
						}
					/**
					 * End
					 */

					}

				});