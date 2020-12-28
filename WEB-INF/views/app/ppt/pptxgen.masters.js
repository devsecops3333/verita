/*\
|*|  :: pptxgen.masters.js ::
|*|
|*|  JavaScript framework that produces PowerPoint (pptx) presentations
|*|  https://github.com/gitbrent/PptxGenJS
|*|
|*|  This framework is released under the MIT Public License (MIT)
|*|
|*|  PptxGenJS (C) 2015-2017 Brent Ely -- https://github.com/gitbrent
|*|
|*|  Permission is hereby granted, free of charge, to any person obtaining a copy
|*|  of this software and associated documentation files (the "Software"), to deal
|*|  in the Software without restriction, including without limitation the rights
|*|  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
|*|  copies of the Software, and to permit persons to whom the Software is
|*|  furnished to do so, subject to the following conditions:
|*|
|*|  The above copyright notice and this permission notice shall be included in all
|*|  copies or substantial portions of the Software.
|*|
|*|  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
|*|  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
|*|  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
|*|  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
|*|  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
|*|  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
|*|  SOFTWARE.
\*/

/*
 INSTRUCTIONS:
 =============
 - Use the pre-defined Master Slides below as examples to get started
 - Add your own objects with your selected name to be able to use them in method calls
 EX: `var slide1 = pptx.addNewSlide( pptx.masters.THANKS_SLIDE );`

 NOTES:
 ======
 - DO NOT change the `gObjPptxMasters` variable name below or the library wont be able to see your slides
 - This file can be named anything as long as its included in your html file before PptxGenJS.js
 EX:
 <script type="text/javascript" src="../dist/pptxgen.masters.js"></script>
 <script type="text/javascript" src="../dist/pptxgen.js"></script>
 */

// Pre-Encoded (base64) images (if any)
var checkGreen = 'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAjcAAAI3AGf6F88AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAANVQTFRF////JLaSIJ+AIKqKKa2FKLCIJq+IJa6HJa6JJa6IJa6IJa2IJa6IJa6IJa6IJa6IJa6IJa6IJq6IKK+JKK+KKrCLLrGNL7KOMrOPNrSRN7WSPLeVQrmYRLmZSrycTr2eUb6gUb+gWsKlY8Wqbsmwb8mwdcy0d8y1e863g9G7hdK8htK9i9TAjNTAjtXBktfEntvKoNzLquDRruHTtePWt+TYv+fcx+rhyOvh0e7m1e/o2fHq4PTu5PXx5vbx7Pj18fr49fv59/z7+Pz7+f38/P79/f7+dNHCUgAAABF0Uk5TAAcIGBktSYSXmMHI2uPy8/XVqDFbAAABB0lEQVQ4y42T13qDMAyFZUKMbebp3mmbrnTvlY60TXn/R+oFGAyYzz1Xx/wylmWJqBLjUkVpGinJGXXliwSVEuG3sBdkaCgLPJMPQnQUDmo+jGFRPKz2WzkQl//wQvQoLPII0KuAiMjP+gMyn4iEFU1eAQCCiCU2fpCfFBVjxG18f35VOk7Swndmt9pKUl2++fG4qL2iqMPXpi8r1SKitDDne/rT8vPbRh2d6oC7n6PCLNx/bsEM0Edc5DdLAHD9tWueF9VJjmdP68DZ77iRkDKuuT19Hx3mx82MpVmo1Yfv+WXrSrxZ6slpiyes77FKif88t7Nh3C3nbFp327sHxz167uHtH/8/eds7gGsUQbkAAAAASUVORK5CYII=';
var starlabsLogoSml = 'data:image/png;base64,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';
var cignitiTechnologiesImage = 'data:image/jpeg;base64,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';
// Master Slide/Templates
var gObjPptxMasters = {
	TITLE_SLIDE : {
		title : 'Corporate Presentation Title Slide',
		bkgd : {
			path : 'views/assets/images/ppt_background1.jpg'
		},
		objects : [ {
			'text' : {
				text : '',
				options : {
					x : 5.33,
					y : 2.4,
					w : 4.58,
					h : 0.5,
					font_face : 'Arial',
					color : '363636',
					font_size : 20,
					valign : 'm',
					margin : 0
				}
			}
		}, {
			'text' : {
				text : '',
				options : {
					x : 4.92,
					y : 5.33,
					w : 5.5,
					h : 0.3,
					font_face : 'Arial',
					bold : true,
					color : '363636',
					font_size : 10,
					valign : 'm',
					margin : 0
				}
			}
		} ]
	},
	MASTER_SLIDE : {
		title : 'Cigniti',
		bkgd : 'FFFFFF',
		// margin : [ 0.5, 0.25, 1.0, 0.25 ],
		objects : [
				{
					'line' : {
						x : 0,
						y : 0.4,
						w : 10,
						h : 0,
						line : '004B87',
						line_size : 1
					}
				},
				{
					'rect' : {
						x : 0.0,
						y : 0,
						w : '100%',
						h : 0.4,
						fill : 'FFFFFF'
					}
				},
				{
					'text' : {
						text : '',
						options : {
							x : 0.01,
							y : 0,
							w : 4,
							h : 0.4,
							color : '004B87',
							font_size : 13
						}
					}
				},
				{
					'image' : {
						x : 8.78,
						y : 0.01,
						w : 1.17,
						h : 0.36,
						data : cignitiTechnologiesImage
					}
				},
				{
					'rect' : {
						x : 0,
						y : 5.47,
						w : 10,
						h : 0.16,
						fill : '004B87'
					}
				},
				{
					'text' : {
						text : 'www.cigniti.com | Distribution is Restricted. Copyright @ 2017 - 18. Cigniti Technologies',
						options : {
							x : 0.15,
							y : 5.46,
							w : 6,
							h : 0.18,
							// align : 'c',
							valign : 'm',
							color : 'FFFFFF',
							font_size : 8
						}
					}
				} ],
		slideNumber : {
			x : 9.5,
			y : 5.39,
			h : 0.17,
			align : 'c',
			valign : 't',
			color : 'FFFFFF',
			fontFace : 'Arial',
			fontSize : 9
		}
	},
	THANKS_SLIDE : {
		title : 'Cigniti',
		bkgd : {
			path : 'views/assets/images/ppt_background1.jpg'
		},
		objects : [
		// {
		// 'line' : {
		// x : 0,
		// y : 0.4,
		// w : 10,
		// h : 0,
		// line : '004B87',
		// line_size : 1
		// }
		// },
		// {
		// 'rect' : {
		// x : 0.0,
		// y : 0,
		// w : '100%',
		// h : 0.4,
		// fill : 'FFFFFF'
		// }
		// },
		// {
		// 'image' : {
		// x : 8.78,
		// y : 0.01,
		// w : 1.17,
		// h : 0.36,
		// data : cignitiTechnologiesImage
		// }
		// },
		{
			'image' : {
				x : 3.58,
				y : 2,
				w : 3.2,
				h : 1.8,
				path : 'views/assets/images/QA.png'
			}
		}
		// ,
		// {
		// 'rect' : {
		// x : 0,
		// y : 5.47,
		// w : 10,
		// h : 0.16,
		// fill : '004B87'
		// }
		// },
		//
		// {
		// 'text' : {
		// text : 'www.cigniti.com | Distribution is Restricted. Copyright @
		// 2017 - 18. Cigniti Technologies',
		// options : {
		// x : 0.15,
		// y : 5.46,
		// w : 6,
		// h : 0.18,
		// valign : 'm',
		// color : 'FFFFFF',
		// font_size : 8
		// }
		// }
		// }
		]
	// ,
	// slideNumber : {
	// x : 9.5,
	// y : 5.39,
	// h : 0.17,
	// align : 'c',
	// valign : 't',
	// color : 'FFFFFF',
	// fontFace : 'Arial',
	// fontSize : 9
	// }

	},
	MARGIN_TEST : {
		title : 'TableToSlides Margin Test Slide',
		bkgd : 'F1F1F1',
		margin : [ 0.75, 0.6, 1.0, 0.6 ],
		objects : [ {
			'rect' : {
				x : 0,
				y : 5.13,
				w : '100%',
				h : 0.5,
				fill : '1abc9c'
			}
		}, {
			'text' : {
				text : 'TableToSlides Margin Test Slide',
				options : {
					x : 0,
					y : 5.13,
					w : '100%',
					h : 0.5,
					color : 'FFFFFF',
					font_size : 12,
					align : 'c',
					valign : 'm'
				}
			}
		} ]
	},
	LEGACY_TEST_ONLY : {
		title : '**DO NOT COPY** - these keys are *DEPRECATED* and used only for regression testing!',
		bkgd : {
			src : 'images/starlabs_bkgd.jpg'
		},
		isNumbered : true,
		shapes : [ {
			type : 'rectangle',
			x : 0.0,
			y : 4.4,
			w : '100%',
			h : 2.0,
			fill : 'ffffff'
		}, {
			type : 'text',
			text : '(DEPRECATED TEST ONLY)',
			x : 0.0,
			y : 0.25,
			w : '100%',
			h : 1,
			font_face : 'Arial',
			color : 'FF1133',
			font_size : 24,
			align : 'c'
		} ],
		images : [ {
			x : 4.6,
			y : 4.5,
			w : 4,
			h : 1.8,
			data : starlabsLogoSml
		} ]
	}
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = gObjPptxMasters;
}
