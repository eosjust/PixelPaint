window.addEventListener('load', function load(){
	window.removeEventListener('load', load, false);

	var canvas = document.getElementById("canvas");
	var preview = document.getElementById("preview");
	var menu = document.getElementById("menu");
	var tools = document.getElementById("tools");
	var palette = document.getElementById("palette");

	var canvasWidth = 16;
	var canvasHeight = 16;
	var canvasPixelSize = 32;

	var previewTiles = 8;

	//////////////////////////////////////////
	// menu
	//////////////////////////////////////////

	menuItems = menu.children;

	for(var i = 0; i < menuItems.length; i++){
		menuItems[i].addEventListener("click", function(){
			if(menu.className == "selected"){
				menu.className = "";
			}else{
				menu.className = "selected";
			}
		}, false);
	}

	menu.addEventListener("mouseleave", function(){
		menu.className = "";
	}, false);

	// menu -> pop up
	var popUp = document.getElementById("popUp");
	var popUpWindow = document.getElementById("popUpWindow");
	var popUpContent = document.getElementById("popUpContent");
	var popUpClose = document.getElementById("popUpClose");

	popUpClose.addEventListener("click", function(){
		popUp.style.display = "none";
	}, false);

	// menu -> file
	var fileNew = document.getElementById("fileNew");
	
	// menu -> file -> new
	var newSubmit = document.createElement('input');
	newSubmit.id = "popUpSubmit";
	newSubmit.type = "submit";
	newSubmit.value = "New";

	fileNew.addEventListener("click", function(){
		popUp.style.display = "block";
		var popUpNew = "<h2>New</h2> \
						<span><strong>Canvas</strong></span><br /> \
						<span>Width</span> <input id='newWidth' type='text' value='" + canvasWidth + "' /><br /> \
						<span>Height</span> <input id='newHeight' type='text' value='" + canvasHeight + "' /><br /> \
						<span>Pixel Size</span> <input id='newPixelSize' type='text' value='" + canvasPixelSize + "' /><br /><br /> \
						<span><strong>Preview</strong></span><br /> \
						<span>Tiles</span> <input id='newPreviewTiles' type='text' value='" + previewTiles + "' /><br /><br />";
		popUpContent.innerHTML = popUpNew;
		popUpWindow.style.marginTop = -100 + "px";
		popUpContent.appendChild(newSubmit);
	}, false);

	newSubmit.addEventListener("click", function(){
		// remove canvas & preview
		canvas.innerHTML = '';
		preview.innerHTML = '';
		// get values from form
		var newWidth = document.getElementById('newWidth');
		var newHeight = document.getElementById('newHeight');
		var newPixelSize = document.getElementById('newPixelSize');
		var newPreviewTiles = document.getElementById('newPreviewTiles');
		canvasWidth = newWidth.value;
		canvasHeight = newHeight.value;
		canvasPixelSize = newPixelSize.value;
		previewTiles = newPreviewTiles.value;
		// generate new canvas & preview
		genCanvas();
		genPreview();
		popUp.style.display = "none";
	}, false);

	// menu -> window
	var windowTools = document.getElementById("windowTools");
	var windowToolsCheck = windowTools.getElementsByTagName('span');
	var windowCanvas = document.getElementById("windowCanvas");
	var windowCanvasCheck = windowCanvas.getElementsByTagName('span');
	var windowPreview = document.getElementById("windowPreview");
	var windowPreviewsCheck = windowPreview.getElementsByTagName('span');
	var left = document.getElementById("left");
	var right = document.getElementById("right");

	// menu -> window -> tools
	windowTools.addEventListener("click", function(){
		var toolsWrapper = document.getElementById("toolsWrapper");
		if(toolsWrapper.style.display == "none"){
			toolsWrapper.style.display = "block";
			windowToolsCheck[0].style.visibility = "visible";
		}else{
			toolsWrapper.style.display = "none";
			windowToolsCheck[0].style.visibility = "hidden";
		}
	}, false);

	// menu -> window -> canvas
	windowCanvas.addEventListener("click", function(){
		var canvasWrapper = document.getElementById("canvasWrapper");
		if(canvasWrapper.style.display == "none"){
			canvasWrapper.style.display = "block";
			windowCanvasCheck[0].style.visibility = "visible";
			right.style.width = "45%";
			right.style.right = "5%";
		}else{
			canvasWrapper.style.display = "none";
			windowCanvasCheck[0].style.visibility = "hidden";
			right.style.width = "100%";
			right.style.right = "0%";
		}
	}, false);

	// menu -> window -> preview
	windowPreview.addEventListener("click", function(){
		var previewWrapper = document.getElementById("previewWrapper");
		if(previewWrapper.style.display == "none"){
			previewWrapper.style.display = "block";
			windowPreviewsCheck[0].style.visibility = "visible";
			left.style.width = "45%";
			left.style.left = "5%";
		}else{
			previewWrapper.style.display = "none";
			windowPreviewsCheck[0].style.visibility = "hidden";
			left.style.width = "100%";
			left.style.left = "0";
		}
	}, false);

	// menu -> help
	var helpAbout = document.getElementById("helpAbout");

	helpAbout.addEventListener("click", function(){
		popUp.style.display = "block";
		var popUpHelp = "<h2>About</h2> \
						<strong>Download >></strong> <a href='https://github.com/robertmermet/nesPaint' target='_blank'>https://github.com/robertmermet/nesPaint</a>";
		popUpContent.innerHTML = popUpHelp;
	}, false);

	//////////////////////////////////////////
	// canvas
	//////////////////////////////////////////

	// setup canvas
	function genCanvas(){
		var tbody = document.createElement('tbody');
		for(var i = 0; i < canvasHeight; i++){
			var tr = document.createElement('tr');
			for(var j = 0; j < canvasWidth; j++){
				var td = document.createElement('td');
				var pixel = document.createElement('div');
				pixel.addEventListener("mousedown", clickApplyColor, false);
				pixel.addEventListener("mouseover", hoverApplyColor, false);
				tr.appendChild(td);
				td.appendChild(pixel);
			}
			tbody.appendChild(tr);
		}
		canvas.appendChild(tbody);
		// assign pixel size
		var pixels = canvas.getElementsByTagName('div');
		for(i = 0; i < pixels.length; i++){
			pixels[i].style.width = canvasPixelSize + "px";
			pixels[i].style.height = canvasPixelSize + "px";
		}
		// offset canvas
		var canvasWrapper = document.getElementById("canvasWrapper");
		canvasWrapper.style.marginLeft = -(canvasWidth * canvasPixelSize) / 2 + "px";
		canvasWrapper.style.marginTop = -(canvasHeight * canvasPixelSize) / 2 + "px";
	}

	// remove canvas
	function rmCanvas(){
		var tbody = canvas.getElementsByTagName('tbody');
		canvas.removeChild(tbody[0]);
	}

	// is mouse down
	var isDown;
	document.addEventListener("mousedown", mDown, false);
	document.addEventListener("mouseup", mUp, false);
	function mDown(){ isDown = true; }
	function mUp(){ isDown = false; }

	// draw events
	// mouse down
	function clickApplyColor(){
		if(color != null){
			switch(tool){
				case "pencil":
					applyPencil(this);
					break;
				case "eraser":
					applyEraser(this);
					break;
				case "smudge":
					applySmudge(this);
					break;
				case "fill":
					applyFill(this);
					break;
				case "eyedrop":
					applyEyeDrop(this);
					break;
				default:
					applyPencil(this);
			}
			updatePreview();
		}
	}
	// mouse over
	function hoverApplyColor(){
		if(isDown == true && color != null){
			switch(tool){
				case "fill":
					break;
				case "eyedrop":
					break;
				default:
					this.className = color;
			}		
			updatePreview();
		}
	}

	//////////////////////////////////////////
	// preview
	//////////////////////////////////////////

	// setup preview
	function genPreview(){
		var previewWidth = canvasWidth;
		var previewHeight = canvasHeight;
		var previewPixelSize = Math.round(canvasPixelSize / previewTiles);
		for(var i = 0; i < (previewTiles * previewTiles); i++){
			var table = document.createElement('table')
			for(var j = 0; j < previewHeight; j++){
				var tr = document.createElement('tr');
				for(var g = 0; g < previewWidth; g++){
					var td = document.createElement('td');
					td.style.width = previewPixelSize + "px";
					td.style.height = previewPixelSize + "px";
					tr.appendChild(td);
				}
				table.appendChild(tr);
			}
			preview.appendChild(table);
		}
		// set preview size 
		preview.style.width = previewTiles * previewWidth * previewPixelSize + "px";
		preview.style.height = previewTiles * previewHeight * previewPixelSize + "px";

		// set preview offset
		var previewWrapper = document.getElementById("previewWrapper");

		previewWrapper.style.marginRight = previewTiles * -((previewWidth * previewPixelSize) / 2) + "px";
		previewWrapper.style.marginTop = previewTiles * -((previewHeight * previewPixelSize) / 2) + "px";
	}

	// update preview
	function updatePreview(){
		var canvasPixels = canvas.getElementsByTagName('div');
		var previewTiles = preview.getElementsByTagName('table');
		
		for(var i = 0; i < previewTiles.length; i++){
			var tileTds = previewTiles[i].getElementsByTagName('td');
			for(var j = 0; j < tileTds.length; j++){
				tileTds[j].className = canvasPixels[j].className;
			}
		}
	}

	//////////////////////////////////////////
	// tool selector
	//////////////////////////////////////////

	var toolMenu = document.getElementById("tools");
	var tools = toolMenu.getElementsByTagName('div');

	var tool = "pencil";  // make pencil default
	document.getElementById('pencil').className = "selected";

	for (var i = 0; i < (tools.length - 1); i++){
		tools[i].addEventListener("click", selectTool, false);
	}

	function selectTool(){
		for (var i = 0; i < (tools.length - 1); i++){
			if(tools[i] != this){
				tools[i].className = "";
			}else{
				this.className = "selected";
			}
		}
		tool = this.id;
	}

	function applyPencil(object){
		color = currentColor;
		object.className = color;
	};

	function applyEraser(object){
		color = ' ';
		object.className = color;
	}

	function applySmudge(object){
		color = object.className;
	}

	function applyFill(object){
		console.log('hit');
		color = currentColor;
		var fillColor = object.className;
		console.log('fillColor ' + fillColor);
		var canvasDiv = canvas.getElementsByTagName('div');

		for(var i = 0; i < canvasDiv.length; i++){
			if(canvasDiv[i].className == fillColor){
				canvasDiv[i].className = color;
			}
		}
	}
	function applyEyeDrop(object){
		colorPreview.className = currentColor = object.className;
	}

	//////////////////////////////////////////
	// color selector
	//////////////////////////////////////////

	var colorPalette = document.getElementById("colorPalette");
	var colorPreview = document.getElementById("currentColor");
	var colors = colorPalette.getElementsByTagName('td');
	var color, currentColor;

	colorPreview.addEventListener("click", function(){
		if(colorPalette.style.display == "none") {
			colorPalette.style.display = "block";
		} else {
			colorPalette.style.display = "none";
		}
	}, false);

	for (var i = 0; i < colors.length; i++){
		colors[i].addEventListener("click", selectColor, false);
	}

	function selectColor(){
		color = this.className;
		currentColor = color;
		colorPreview.className = color;
		colorPalette.style.display = "none";
	}

	colorPalette.style.display = "none";
	colorPreview.className = color = currentColor = "c12";

	genCanvas();
	genPreview();

}, true);