$(document).ready(function()
{
	// menu items

	var canvas   = $('#canvas');
	var preview  = $('#preview');
	var menu     = $('#menu');
	var tools    = $('#tools');
	var palette  = $('#palette');
	var pixels;

	// canvas & preview default parameters

	var canvasColumns = 16;
	var canvasRows = 16;
	var canvasPixelSize = 32;

	var previewColumns = 8;
	var previewRows = 8;
	var previewPixelSize = 4;

	// is mousedown

	var isDown = false;
	var isMenuOver = false;
	var isMenuDown = false;
	var isPaletteOver = false;
	var isPaletteDown = false;

	$(this).on('mousedown', function()
	{
		isDown = true;

		if(isMenuOver == false)
		{
			$('#menu .selected').removeClass('selected');
			isMenuDown = false;
		}

		if(isPaletteOver == false)
		{
			$('#colorPalette').css('display', 'none');
			isPaletteDown = false;
		}
	});

	$(this).on('mouseup', function()
	{
		isDown = false;
	});

	// draggable

	$('#toolsWrapper').draggable({ handle: 'p' });
	
	$('#canvasWrapper').draggable({ handle: 'p' });

	$('#previewWrapper').draggable({ handle: 'p' });

	//////////////////////////////////////////
	// menu
	//////////////////////////////////////////

	var menuItem = $('#menu > li');
	
	menuItem.on('click', function()
	{
		if( $(this).hasClass('selected') )
		{
			$(this).removeClass('selected');
			isMenuDown = false;
		}
		else
		{
			$(this).addClass('selected');
			isMenuDown = true;
		}
	});

	menuItem.on('mouseover', function()
	{
		isMenuOver = true;

		if(isMenuDown == true)
		{
			$('#menu .selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});

	menu.on('mouseleave', function()
	{
		isMenuOver = false;
	});

	// menu > file > new

	var fileNew      = $('#fileNew');
	var popUp        = $('#popUp');
	var popUpWindow  = $('#popUpWindow');
	var popUpContent = $('#popUpContent');
	var popUpClose   = $('#popUpClose');

	popUpClose.on('click', function()
	{
		popUp.css('display', 'none');
	});

	var newSubmit = $('<input id="popUpSubmit" type="submit" value="New" />');

	fileNew.on('click', function()
	{
		popUp.css('display', 'block');

		var popUpNew = '<h2>New</h2>\
			<span><strong>Canvas</strong></span><br />\
			<span>Columns</span> <input id="canvasColumns" type="text" value="' + canvasColumns + '" /><br />\
			<span>Rows</span> <input id="canvasRows" type="text" value="' + canvasRows + '" /><br />\
			<span>Pixel Size</span> <input id="canvasPixelSize" type="text" value="' + canvasPixelSize + '" /> px<br /><br />\
			<span><strong>Preview</strong></span><br />\
			<span>Columns</span> <input id="previewColumns" type="text" value="' + previewColumns + '" /><br />\
			<span>Rows</span> <input id="previewRows" type="text" value="' + previewRows + '" /><br />\
			<span>Pixel Size</span> <input id="previewPixelSize" type="text" value="' + previewPixelSize + '" /> px<br /><br />';

		popUpContent.html(popUpNew);

		popUpWindow.css('marginTop', '-100px');

		popUpContent.append (newSubmit);

		newSubmit.on("click", function()
		{
			// remove canvas & preview

			canvas.html('');
			preview.html('');

			// get values from form

			canvasColumns    = $('#canvasColumns').val();
			canvasRows       = $('#canvasRows').val();
			canvasPixelSize  = $('#canvasPixelSize').val();

			previewColumns   = $('#previewColumns').val();
			previewRows      = $('#previewRows').val();
			previewPixelSize = $('#previewPixelSize').val();

			// generate new canvas & preview

			genCanvas();
			genPreview();
			pencil();

			popUp.css('display', 'none');
		});
	});

	// menu > window

	var windowTools         = $('#windowTools');
	var windowToolsCheck    = windowTools.find('span');
	var windowCanvas        = $("#windowCanvas");
	var windowCanvasCheck   = windowCanvas.find('span');
	var windowPreview       = $("#windowPreview");
	var windowPreviewsCheck = windowPreview.find('span');

	// menu > window > tools

	windowTools.on('click', function()
	{
		var toolsWrapper = $('#toolsWrapper');

		if(toolsWrapper.css('display') == 'none')
		{
			toolsWrapper.css('display', 'block');
			windowToolsCheck.css('visibility', 'visible');
		}
		else
		{
			toolsWrapper.css('display', 'none');
			windowToolsCheck.css('visibility', 'hidden');
		}
	});

	// menu > window > canvas

	windowCanvas.on('click', function()
	{
		var canvasWrapper = $('#canvasWrapper');

		if(canvasWrapper.css('display') == 'none')
		{
			canvasWrapper.css('display', 'block');
			windowCanvasCheck.css('visibility', 'visible');
		}
		else
		{
			canvasWrapper.css('display', 'none')
			windowCanvasCheck.css('visibility', 'hidden');
		}
	});

	// menu > window > preview

	windowPreview.on('click', function()
	{
		var previewWrapper = $('#previewWrapper');

		if(previewWrapper.css('display') == 'none')
		{
			previewWrapper.css('display', 'block');
			windowPreviewsCheck.css('visibility', 'visible');
		}
		else
		{
			previewWrapper.css('display', 'none');
			windowPreviewsCheck.css('visibility', 'hidden');
		}
	});

	// menu > help

	var helpAbout = $("#helpAbout");

	helpAbout.on("click", function()
	{
		popUp.css('display','block');

		var popUpHelp = '<h2>About</h2>\
			<strong>Download >></strong> <a href="https://github.com/robertmermet/nesPaint" target="_blank">https://github.com/robertmermet/nesPaint</a>';

		popUpContent.html(popUpHelp);
	});

	//////////////////////////////////////////
	// canvas
	//////////////////////////////////////////

	// gen canvas

	function genCanvas()
	{
		// canvas width & height

		var canvasWidth = canvasColumns * canvasPixelSize;
		var canvasHeight = canvasRows * canvasPixelSize;

		canvas.css({
			width: canvasWidth + 'px', 
			height: canvasHeight + 'px'
		});

		// canvas offset

		var canvasMarginLeft = -canvasWidth / 2;
		var canvasMarginTop = -canvasHeight / 2;

		$('#canvasWrapper').css({
			marginLeft: canvasMarginLeft + 'px',
			marginTop: canvasMarginTop + 'px'
		});

		// draw canvas

		for(var j = 0; j < canvasRows; j++)
		{
			for(var i = 0; i < canvasColumns; i++)
			{
				var pixelLeft = i * canvasPixelSize;
				var pixelTop = j * canvasPixelSize;

				var pixel = $('<div class="blank" data-num="' + i + ':' + j + '" style="position: absolute; width: ' + canvasPixelSize + 'px; height: ' + canvasPixelSize + 'px; left: ' + pixelLeft + 'px; top: ' + pixelTop + 'px;"></div>');

				canvas.append(pixel);
			}
		}

		pixels = canvas.find('div');
	}

	//////////////////////////////////////////
	// preview
	//////////////////////////////////////////

	// gen preview

	function genPreview()
	{
		// preview width & height

		var previewWidth = canvasColumns * previewColumns * previewPixelSize;
		var previewHeight = canvasRows * previewRows * previewPixelSize;

		preview.css({
			width: previewWidth + 'px',
			height: previewHeight + 'px'
		});

		// preveiw offset

		var previewMarginLeft = -previewWidth / 2;
		var previewMarginTop = -previewHeight / 2;

		$('#previewWrapper').css({
			marginLeft: previewMarginLeft + 'px',
			marginTop: previewMarginTop + 'px'
		});

		// preview tile

		var previewTileWidth = canvasColumns * previewPixelSize;
		var previewTileHeight = canvasRows * previewPixelSize;

		for(var j = 0; j < previewRows; j++)
		{
			for(var i = 0; i < previewColumns; i++)
			{
				var tileTop = previewTileHeight * j; 
				var tileLeft = previewTileWidth * i;

				var tile = $('<div class="selected" style="position: absolute; width:' + previewTileWidth + 'px; height:' + previewTileHeight + 'px; left:' + tileLeft + 'px; top:' + tileTop + 'px;"></div>');
				
				for(var y = 0; y < canvasRows; y++)
				{
					for(var x = 0; x < canvasColumns; x++)
					{
						var pixelTop = y * previewPixelSize;
						var pixelLeft = x * previewPixelSize;

						var pixel = $('<div class="blank" data-num="' + x + ':' + y + '" style="position: absolute; width: ' + previewPixelSize + 'px; height: ' + previewPixelSize + 'px; left: ' + pixelLeft + 'px; top: ' + pixelTop + 'px;"></div>');

						tile.append(pixel);
					}
				}
				preview.append(tile);
			}
		}

		// select preview tile

		preview.find('> div').on('click', function()
		{
			preview.find('> div').removeClass('selected');

			$(this).addClass('selected');

			$(this).find('> div').each(function(i)
			{
				$('#canvas > div:eq(' + i + ')').attr('class', $(this).attr('class') );
			});
		});
	}

	// update preview

	function updatePreview(pixel)
	{
		preview.find('.selected div[data-num="' +  $(pixel).attr('data-num') + '"]').attr('class', $(pixel).attr('class'));
	}

	//////////////////////////////////////////
	// tools
	//////////////////////////////////////////

	$('#pencil').on('click', pencil);

	$('#eraser').on('click', eraser);
	
	$('#smudge').on('click', smudge);
	
	$('#fill').on('click', fill);
	
	$('#eyedrop').on('click', eyedrop);

	function pencil()
	{
		$('.tool.selected').removeClass('selected');
		$('#pencil').addClass('selected');

		pixels.unbind('mousedown');
		pixels.unbind('mouseover');

		pixels.on('mousedown', function()
		{
			color = currentColor;

			$(this).attr('class', color);

			updatePreview(this);
		});

		pixels.on('mouseover', function()
		{
			if(isDown == true)
			{	
				$(this).attr('class', color);

				updatePreview(this);
			}
		});
	}

	function eraser()
	{
		$('.tool.selected').removeClass('selected');
		$('#eraser').addClass('selected');

		pixels.unbind('mousedown');
		pixels.unbind('mouseover');

		pixels.on('mousedown', function()
		{
			color = 'blank';

			$(this).attr('class', color);

			updatePreview(this);
		});

		pixels.on('mouseover', function()
		{
			if(isDown == true)
			{
				$(this).attr('class', color);

				updatePreview(this);
			}
		});
	}

	function smudge()
	{
		$('.tool.selected').removeClass('selected');
		$('#smudge').addClass('selected');

		pixels.unbind('mousedown');
		pixels.unbind('mouseover');

		pixels.on('mousedown', function()
		{
			color = $(this).attr('class');

			if(color == undefined)
			{
				color = 'blank';
			}

			updatePreview(this);
		});

		pixels.on('mouseover', function()
		{
			if(isDown == true)
			{
				$(this).attr('class', color);

				updatePreview(this);
			}
		});
	}

	function fill()
	{
		$('.tool.selected').removeClass('selected');
		$('#fill').addClass('selected');

		pixels.unbind('mousedown');
		pixels.unbind('mouseover');

		pixels.on('mousedown', function()
		{
			var fillColor = $(this).attr('class');

			$('#canvas .' + fillColor + ', #preview .selected .' + fillColor).attr('class', currentColor);
		});
	}

	function eyedrop()
	{
		$('.tool.selected').removeClass('selected');
		$('#eyedrop').addClass('selected');

		pixels.unbind('mousedown');
		pixels.unbind('mouseover');

		pixels.on('mousedown', function()
		{
			if($(this).attr('class') != 'blank')
			{
				color = $(this).attr('class');

				currentColor = color;
			
				colorPreview.attr('class', color);
			}
		});
	}

	//////////////////////////////////////////
	// color selector
	//////////////////////////////////////////

	var colorPalette = $('#colorPalette');
	var colorPreview = $('#currentColor');
	var colors       = $('#colorPalette td');
	var color, currentColor;

	colorPreview.on('click', function()
	{
		if(isPaletteDown == false)
		{
			colorPalette.css('display', 'block');
			isPaletteDown = true;
		}
		else
		{
			colorPalette.css('display', 'none');
			isPaletteDown = false;
		}
	});

	// mouseover color palette

	colorPalette.on('mouseover', function()
	{
		isPaletteOver = true;
	});

	colorPalette.on('mouseleave', function()
	{
		isPaletteOver = false;
	});

	// mouseover color preview

	colorPreview.on('mouseover', function()
	{
		isPaletteOver = true;
	});

	colorPreview.on('mouseleave', function()
	{
		isPaletteOver = false;
	});

	// color select event

	colors.on('click', selectColor);

	function selectColor()
	{
		color = $(this).attr('class');
		currentColor = color;
		colorPreview.attr('class', color);
		colorPalette.css('display', 'none');
		isPaletteDown = false;
	}

	colorPreview.attr('class', 'c12');
	color = currentColor = 'c12';

	genCanvas();
	genPreview();
	pencil();
});