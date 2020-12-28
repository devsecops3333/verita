mainApp
		.service(
				'ganttService',
				function($rootScope, $http, $sessionStorage, $timeout) {
					return {
						buildganttWidget : function(data, options) {
							console.log("options--", options);
							console.log("in gantt chart options.chartId--",
									options.chartId);

							var chartSize = getChartSize(options.chartId, '');
							// var width = chartSize[0];

							console.log(options.height)
							var width = options.width;
							var height = options.height;

							$(options.chartId).html('');

							var svg = d3.selectAll(options.chartId)
							// .selectAll("svg")
							.append("svg").attr("width", width).attr("height",
									height).attr("class", "svg");

							var dateFormat = d3.time.format(options.dataFormat);

							var timeScale = d3.time
									.scale()
									.domain(
											[
													d3
															.min(
																	data,
																	function(d) {
																		return dateFormat
																				.parse(d[options.groupBy1]);
																	}),
													d3
															.max(
																	data,
																	function(d) {
																		return dateFormat
																				.parse(d[options.groupBy2]);
																	}) ])
									.range([ 0, width - 150 ]);

							var categories = new Array();

							for (var i = 0; i < data.length; i++) {
								categories.push(data[i][options.yAxis]);
							}

							var catsUnfiltered = categories; // for vert
							// labels
							categories = this.checkUnique(categories);

							this.makeGant(data, catsUnfiltered, categories,
									svg, dateFormat, timeScale, width, height,
									options);

							var title = svg.append("text").text(
									options.chartSummary).attr("x", width / 2)
									.attr("y", 13)
									.attr("text-anchor", "middle").attr(
											"font-size", 18).style(
											"font-weight", "bold").style(
											"text-decoration", "underline");

							svg.selectAll("g.tick text").attr('dx', '-25')
									.attr('dy', '3').attr('transform',
											"rotate(-65)");

							if (options.clickevent) {
								svg.selectAll('.item').on(
										'click',
										function(d) {
											$rootScope.drillDownChart(d3
													.select(this).data());

										});
							}

							return true;
						},

						makeGant : function(data, catsUnfiltered, categories,
								svg, dateFormat, timeScale, pageWidth,
								pageHeight, options) {

							var barHeight = 20;
							var gap = barHeight + 4;
							var topPadding = 50;
							var sidePadding = 75;

							var colorScale = d3.scale.ordinal().range(
									options.colorsArray);

							this.makeGrid(svg, timeScale, options.xTickFormat,
									options.xTickType, sidePadding, topPadding,
									pageWidth, pageHeight);
							this.drawRects(data, categories, svg, dateFormat,
									timeScale, gap, topPadding, sidePadding,
									barHeight, colorScale, pageWidth,
									pageHeight, options);
							this.vertLabels(svg, catsUnfiltered, categories,
									gap, topPadding, sidePadding, barHeight,
									colorScale);

						},
						makeGrid : function(svg, timeScale, xTickFormat,
								xTickType, sidePadding, topPadding, pageWidth,
								pageHeight) {

							var xAxis = d3.svg.axis().scale(timeScale).orient(
									'bottom')

							.ticks(d3.time[xTickType], 1).tickSize(
									-pageHeight + topPadding + 20, 0, 0)
									.tickFormat(d3.time.format(xTickFormat));

							var grid = svg.append('g').attr('class', 'grid')
									.attr(
											'transform',
											'translate(' + sidePadding + ', '
													+ (pageHeight - 50) + ')')
									.call(xAxis).selectAll("text").style(
											"text-anchor", "middle").attr(
											"fill", "#000").attr("stroke",
											"none").attr("font-size", 10).attr(
											"dy", "1em");
						},

						drawRects : function(data, categories, svg, dateFormat,
								timeScale, gap, topPadding, sidePadding,
								barHeight, colorScale, pageWidth, pageHeight,
								options) {
							var bigRects = svg
									.append("g")
									.selectAll("rect")
									.data(data)
									.enter()
									.append("rect")
									.attr("x", 0)
									.attr("y", function(d, i) {
										return i * gap + topPadding - 2;
									})
									.attr("width", function(d) {
										return pageWidth - sidePadding / 2;
									})
									.attr("height", gap)
									.attr("stroke", "none")

									.attr(
											"fill",
											function(d) {
												for (var i = 0; i < categories.length; i++) {
													if (d[options.yAxis] == categories[i]) {
														return d3
																.rgb(colorScale(i));
													}
												}
											}).attr("opacity", 0.2);

							var rectangles = svg.append('g').selectAll("rect")
									.data(data).enter();

							var innerRects = rectangles
									.append("rect")
									.attr("rx", 3)
									.attr("ry", 3)
									.attr(
											"x",
											function(d) {
												return timeScale(dateFormat
														.parse(d[options.groupBy1]))
														+ sidePadding;
											})
									.attr("y", function(d, i) {
										return i * gap + topPadding;

									})
									.attr(
											"width",
											function(d) {
												return (timeScale(dateFormat
														.parse(d[options.groupBy2])) - timeScale(dateFormat
														.parse(d[options.groupBy1])));
											})
									.attr("height", barHeight)
									.attr("stroke", "none")
									.attr("class", "item")
									.attr(
											"fill",
											function(d) {
												for (var i = 0; i < categories.length; i++) {
													if (d[options.yAxis] == categories[i]) {
														return d3
																.rgb(colorScale(i));
													}
												}
											})

							var rectText = rectangles
									.append("text")
									.text(function(d) {
										return d[options.xAxis];
									})
									.attr(
											"x",
											function(d) {
												return (timeScale(dateFormat
														.parse(d[options.groupBy2])) - timeScale(dateFormat
														.parse(d[options.groupBy1])))
														/ 2
														+ timeScale(dateFormat
																.parse(d[options.groupBy1]))
														+ sidePadding;
											}).attr("y", function(d, i) {
										return i * gap + 14 + topPadding;
									}).attr("font-size", 11).attr(
											"text-anchor", "middle").attr(
											"text-height", barHeight).attr(
											"fill", "#000");

							rectText
									.on(
											'mouseover',
											function(e) {
												// console.log(this.x.animVal.getItem(this));
												var tag = "";

												if (d3.select(this).data()[0].details != undefined) {
													tag = "Start: "
															+ d3.select(this)
																	.data()[0][options.groupBy1]
															+ "<br/>"
															+ "End: "
															+ d3.select(this)
																	.data()[0][options.groupBy2]
															+ "<br/>"
															+ "Details: "
															+ d3.select(this)
																	.data()[0].details;
												} else {
													tag = "Start: "
															+ d3.select(this)
																	.data()[0][options.groupBy1]
															+ "<br/>"
															+ "Ends: "
															+ d3.select(this)
																	.data()[0][options.groupBy2];
												}
												var output = document
														.getElementById("tag");

												var x = this.x.animVal
														.getItem(this)
														+ "px";
												var y = this.y.animVal
														.getItem(this)
														+ 25 + "px";

												output.innerHTML = tag;
												output.style.top = y;
												output.style.left = x;
												output.style.display = "block";

											})
									.on(
											'mouseout',
											function() {
												var output = document
														.getElementById("tag");
												output.style.display = "none";

											})
									.on(
											'click',
											function(d) {

												if (options.clickevent) {
													$rootScope
															.drillDownChart(d3
																	.select(
																			this)
																	.data());
												}
											});

							innerRects
									.on(
											'mouseover',
											function(e) {
												// console.log(this);
												var tag = "";

												if (d3.select(this).data()[0].details != undefined) {
													tag = "Start: "
															+ d3.select(this)
																	.data()[0][options.groupBy1]
															+ "<br/>"
															+ "End: "
															+ d3.select(this)
																	.data()[0][options.groupBy2]
															+ "<br/>"
															+ "Details: "
															+ d3.select(this)
																	.data()[0].details;
												} else {
													tag = "Start: "
															+ d3.select(this)
																	.data()[0][options.groupBy1]
															+ "<br/>"
															+ "End: "
															+ d3.select(this)
																	.data()[0][options.groupBy2]
												}
												var output = document
														.getElementById("tag");

												var x = (this.x.animVal.value + this.width.animVal.value / 2)
														+ "px";
												var y = this.y.animVal.value
														+ 25 + "px";

												output.innerHTML = tag;
												output.style.top = y;
												output.style.left = x;
												output.style.display = "block";
											}).on(
											'mouseout',
											function() {
												var output = document
														.getElementById("tag");
												output.style.display = "none";

											});

						},
						vertLabels : function(svg, catsUnfiltered, categories,
								gap, topPadding, sidePadding, barHeight,
								colorScale) {
							var numOccurances = new Array();
							var prevGap = 0;

							for (var i = 0; i < categories.length; i++) {
								numOccurances[i] = [
										categories[i],
										this.getCount(categories[i],
												catsUnfiltered) ];
							}

							var axisText = svg
									.append("g")
									// without doing
									// this,
									// impossible to
									// put grid
									// lines behind
									// text
									.selectAll("text")
									.data(numOccurances)
									.enter()
									.append("text")
									.text(function(d) {
										return d[0];
									})
									.attr("x", 10)
									.attr(
											"y",
											function(d, i) {
												if (i > 0) {
													for (var j = 0; j < i; j++) {
														prevGap += numOccurances[i - 1][1];
														// console.log(prevGap);
														return d[1] * gap / 2
																+ prevGap * gap
																+ topPadding;
													}
												} else {
													return d[1] * gap / 2
															+ topPadding;
												}
											})
									.attr("font-size", 11)
									.attr("text-anchor", "start")
									.attr("text-height", 14)
									.attr(
											"fill",
											function(d) {
												for (var i = 0; i < categories.length; i++) {
													if (d[0] == categories[i]) {
														// console.log("true!");
														return d3.rgb(
																colorScale(i))
																.darker();
													}
												}
											});

						},

						// from this stackexchange question:
						// http://stackoverflow.com/questions/1890203/unique-for-arrays-in-javascript
						checkUnique : function(arr) {
							var hash = {}, result = [];
							for (var i = 0, l = arr.length; i < l; ++i) {
								if (!hash.hasOwnProperty(arr[i])) { // it
									// works
									// with
									// objects!
									// in
									// FF,
									// at
									// least
									hash[arr[i]] = true;
									result.push(arr[i]);
								}
							}
							return result;
						},

						// from this stackexchange question:
						// http://stackoverflow.com/questions/14227981/count-how-many-strings-in-an-array-have-duplicates-in-the-same-array
						getCounts : function(arr) {
							var i = arr.length, // var to loop over
							obj = {}; // obj to store results
							while (i)
								obj[arr[--i]] = (obj[arr[i]] || 0) + 1; // count
							// occurrences
							return obj;
						},

						// get specific from everything
						getCount : function(word, arr) {
							return this.getCounts(arr)[word] || 0;
						},

					}
					function getChartSize(chartId, sliderHeight) {

						var elmnt = document.getElementById(chartId.substr(1));
						var width = elmnt.offsetWidth;
						var height = elmnt.offsetHeight;

						if (sliderHeight && sliderHeight != '') {
							width = width - 60;
							height = sliderHeight;
						}

						return [ width, height ];

					}
				});
