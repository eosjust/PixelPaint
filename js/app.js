//  ____  _          _   ____       _       _
// |  _ \(_)_  _____| | |  _ \ __ _(_)_ __ | |_
// | |_) | \ \/ / _ \ | | |_) / _` | | '_ \| __|
// |  __/| |>  <  __/ | |  __/ (_| | | | | | |_
// |_|   |_/_/\_\___|_| |_|   \__,_|_|_| |_|\__|
//
// version | 0.2
// --------+-------------------------------------
//  author | robert mermet
// --------+-------------------------------------
//    demo | robertmermet.com/projects/pixelpaint
// --------+-------------------------------------
//   git@github.com:robertmermet/pixelpaint.git
//

window.addEventListener('load', function load() {

	window.removeEventListener('load', load, false);

	const cache = {
		menu	: document.getElementById('menu').childNodes,
		anchor  : document.getElementById('anchorTable').getElementsByTagName('div'),
		modal	: document.getElementById('modal'),
		modals	: document.getElementById('modal').childNodes,
		toolbar	: document.getElementById('tools'),
		tools	: document.getElementById('tools').getElementsByTagName('div'),
		color	: document.getElementById('color'),
		panel	: document.getElementById('colorPanel'),
		colors	: document.getElementById('colorPanel').getElementsByTagName('td'),
		canvas	: document.getElementById('canvas')
	};

	// app outline

	var app = {
		menu	: {},
		modal	: {},
		data	: {},
		tools	: {},
		canvas	: {}
	};

	// file settings

	app.file = {
		name		: 'untitled',
		width		: 16,
		height		: 16,
		pixelSize	: 32,
		data		: null
	};

	// app state

	app.state = {
		mouseDown	: false,
		menuOver	: false,
		menuDown	: false,
		toolOver	: false,
		panelOver	: false,
		pixelSize	: null,
		color		: 'rgb(0, 120, 248)',
		colorCache	: null,
		tool		: 'draw',
		grid		: false,
		undo		: {
			array : [],
			index : 0
		}
	};


	/////////
	// app //
	/////////


	app.mouseDown = function() {

		app.state.mouseDown = true;

		if (!app.state.menuOver)
			app.menu.close();

		if (!app.state.panelOver)
			cache.panel.className = '';
	};


	app.mouseUp = function() {

		app.state.mouseDown = false;
	};


	app.keydown = function(e) {

		switch (e.keyCode) {
			case 66: // b
				app.state.tool = 'draw';
				break;
			case 69: // e
				app.state.tool = 'erase';
				break;
			case 83: // e
				app.state.tool = 'smudge';
				break;
			case 71: // g
				app.state.tool = 'fill';
				break;
			case 73: // i
				app.state.tool = 'eyedrop';
				break;
		}

		for (var i = 0; i < cache.tools.length; i++)
			cache.tools[i].className = '';

		document.getElementById(app.state.tool).className = 'selected';
	};

	// window resize

	app.resize = function() {

		app.canvas.offset(cache.canvas.offsetWidth, cache.canvas.offsetHeight);
	};

	// update data

	app.data.update = function() {

		var data = [];

		for (var i = 0; i < app.file.height; i++) {

			var row = [];

			for (var j = 0; j < app.file.width; j++) {

				var pixelColor = app.canvas.ctx.getImageData((j * app.file.pixelSize) + 1, (i * app.file.pixelSize) + 1, 1, 1).data;
				row.push('rgba(' + pixelColor[0] + ', ' + pixelColor[1] + ', ' + pixelColor[2] + ', ' + pixelColor[3] + ')');
			}

			data.push(row);
		}

		app.file.data = data;
	};

	// load & print data

	app.data.load = function() {

		var pixelSize = app.file.pixelSize,
			i, j;

		app.canvas.clear();

		if (app.file.data) {

			for (i = 0; i < app.file.height; i++) {

				for (j = 0; j < app.file.width; j++) {

					app.canvas.ctx.fillStyle = app.file.data[i][j];

					if (app.state.grid)
						app.canvas.ctx.fillRect((j * pixelSize) + 1, (i * pixelSize) + 1, pixelSize, pixelSize);
					else
						app.canvas.ctx.fillRect((j * pixelSize), (i * pixelSize), pixelSize, pixelSize);
				}
			}

			if (app.state.grid)
				app.canvas.grid();
		}
	};


	//////////
	// menu //
	//////////


	app.menu.select = function() {

		for (var i = 0; i < cache.menu.length; i++) {

			if (cache.menu[i] == this) {

				if (this.className === 'selected') {

					this.className = '';
					app.state.menuDown = false;

				} else {

					this.className = 'selected';
					app.state.menuDown = true;
				}

			} else {

				cache.menu[i].className = '';
			}
		}
	};


	app.menu.hover = function() {

		app.state.menuOver = true;

		if (app.state.menuDown === true) {

			for (var i = 0; i < cache.menu.length; i++)
				cache.menu[i].className = '';

			this.className = 'selected';
		}
	};


	app.menu.mouseLeave = function() {

		app.state.menuOver = false;
	};

	// close all menus

	app.menu.close = function() {

		for (var i = 0; i < cache.menu.length; i++)
			cache.menu[i].className = '';

		app.state.menuDown = false;
	};

	// create new file

	app.menu.new = function() {

		var inputs = document.getElementById('newFile').getElementsByTagName('input');

		// update form

		for (var i = 0; i < inputs.length; i++) {

			var id = (inputs[i].id).replace('canvas-', '');
			inputs[i].value = app.file[id];
		}

		// open modal

		app.modal.open('newFile');
	};

	// open json

	app.menu.open = function() {

		// open modal

		app.modal.open('openFile');
	};

	// save json

	app.menu.save = function() {

		// update form

		document.getElementById('save-file-name').setAttribute('value', app.file.name);

		// open modal

		app.modal.open('saveFile');
	};

	// export png

	app.menu.export = function() {

		// update form

		document.getElementById('export-file-name').setAttribute('value', app.file.name);

		// open modal

		app.modal.open('exportFile');
	};

	// undo

	app.menu.undo = function() {

		if (app.state.undo.index > 0) {

			app.state.undo.index--;
			app.file.data = app.state.undo.array[app.state.undo.index];
			app.file.width = app.file.data[0].length;
			app.file.height = app.file.data.length;
			app.canvas.create();
			app.data.load();
		}
	};

	// redo

	app.menu.redo = function() {

		if (app.state.undo.index < 4 && app.state.undo.index + 1 < app.state.undo.array.length) {

			app.state.undo.index++;
			app.file.data = app.state.undo.array[app.state.undo.index];
			app.file.width = app.file.data[0].length;
			app.file.height = app.file.data.length;
			app.canvas.create();
			app.data.load();
		}
	};

	// canvas size

	app.menu.canvasSize = function() {

		var inputs = document.getElementById('canvasSize').getElementsByTagName('input');

		// update form

		for (var i = 0; i < inputs.length; i++) {

			var id = (inputs[i].id).replace('canvasSize-', '');
			inputs[i].value = app.file[id];
		}

		// open modal

		app.modal.open('canvasSize');
	};

	// change anchor point for canvas size

	app.menu.anchorSelect = function() {

		for (var i = 0; i < cache.anchor.length; i++)
			cache.anchor[i].className = '';

		this.className = 'selected';
	};

	// rotate canvas 180°

	app.menu.rotateOneEighty = function() {

		app.data.update();
		app.canvas.flipCanvasHorizontal();
		app.canvas.flipCanvasVertical();
		app.canvas.undoArrayUpdate();
		app.data.load();
	};

	// rotate canvas 90° clockwise

	app.menu.rotateNinetyClockwise = function() {

		app.data.update();
		app.canvas.rotateNinetyClockwise();
		app.canvas.undoArrayUpdate();
		app.canvas.create();
		app.data.load();
	};

	// rotate canvas 90° counter clockwise

	app.menu.rotateNinetyCounterClockwise = function() {

		app.data.update();
		app.canvas.rotateNinetyCounterClockwise();
		app.canvas.undoArrayUpdate();
		app.canvas.create();
		app.data.load();
	};

	// flip canvas horizontal

	app.menu.flipCanvasHorizontal = function() {

		app.data.update();
		app.canvas.flipCanvasHorizontal();
		app.canvas.undoArrayUpdate();
		app.data.load();
	};

	// flip canvas vertical

	app.menu.flipCanvasVertical = function() {

		app.data.update();
		app.canvas.flipCanvasVertical();
		app.canvas.undoArrayUpdate();
		app.data.load();
	};

	// view canvas grid

	app.menu.grid = function() {

		var checkbox = this.getElementsByTagName('span')[0];

		if (app.state.grid) {

			app.state.grid = false;
			checkbox.className = 'hidden';
			app.state.pixelSize += 2;
			app.data.load();

		} else {

			app.state.grid = true;
			checkbox.className = 'check';
			app.state.pixelSize -= 2;
			app.canvas.grid();
		}
	};

	// view tools

	app.menu.tools = function() {

		var checkbox = this.getElementsByTagName('span')[0];

		if (cache.toolbar.className === '') {

			cache.toolbar.className = checkbox.className = 'hidden';

		} else {

			cache.toolbar.className = '';
			checkbox.className = 'check';
		}

		app.canvas.offset(cache.canvas.offsetWidth, cache.canvas.offsetHeight);
	};

	// view canvas

	app.menu.canvas = function() {

		var checkbox = this.getElementsByTagName('span')[0];

		if (cache.canvas.className === '') {

			cache.canvas.className = checkbox.className = 'hidden';

		} else {

			cache.canvas.className = '';
			checkbox.className = 'check';
			app.canvas.offset(cache.canvas.offsetWidth, cache.canvas.offsetHeight);
		}
	};

	// about

	app.menu.about = function() {

		app.modal.open('about');
	};


	///////////
	// modal //
	///////////


	app.modal.open = function(section) {

		app.modal.hideAll();
		document.getElementById(section).className = '';
		cache.modal.className = '';
	};


	app.modal.close = function() {

		cache.modal.className = 'hidden';
		app.modal.hideAll();
	};

	// hide all modal sections

	app.modal.hideAll = function() {

		for (var i = 0; i < cache.modals.length; i++) {

			if (cache.modals[i].nodeType !== 3 && cache.modals[i].id !== 'closeModal')
				cache.modals[i].className = 'hidden';
		}
	};

	// make new file

	app.modal.newFile = function() {

		var name = document.getElementById('canvas-name').value,
			width = document.getElementById('canvas-width').value,
			height = document.getElementById('canvas-height').value,
			pixelSize = document.getElementById('canvas-pixelSize').value;

		app.file.name = name;
		app.file.width = (width > 2) ? width : 2;
		app.file.height = (height > 2) ? height : 2;
		app.file.pixelSize = (pixelSize > 1) ? pixelSize : 1;
		app.file.data = null;
		app.state.undo = {
			array : [],
			index : 0
		};

		app.canvas.create();
		app.modal.close();
	};

	// open file

	app.modal.openFile = function() {

		var file = document.getElementById('open-file').files[0],
			reader  = new FileReader();

		if (file)
			reader.readAsText(file);

		reader.onload = function() {

			var data = JSON.parse(reader.result);

			if (data.hasOwnProperty('name') &&
				data.hasOwnProperty('width') &&
				data.hasOwnProperty('height') &&
				data.hasOwnProperty('pixelSize') &&
				data.hasOwnProperty('data')) {

				app.file = data;
				app.canvas.create();
				app.data.load();
				app.modal.close();
			}
		};
	};

	// save file

	app.modal.saveFile = function() {

		var fileName = document.getElementById('save-file-name').value,
			download = document.createElement('a');

		app.file.name = fileName;

		var file = encodeURIComponent(JSON.stringify(app.file));

		download.setAttribute('href', 'data:text/plain;charset=utf-8,' + file);
		download.setAttribute('download', app.file.name + '.json');
		download.click();
		app.modal.close();
	};

	// export file

	app.modal.exportFile = function() {

		var fileName = document.getElementById('export-file-name').value,
			download = document.createElement('a'),
			canvas = cache.canvas.getElementsByTagName('canvas')[0],
			file = canvas.toDataURL('image/png');

		app.file.name = fileName;
		download.setAttribute('href', file);
		download.setAttribute('download', app.file.name + '.png');
		download.click();
		app.modal.close();
	};

	// update canvas size

	app.modal.canvasSize = function() {

		app.data.update();

		var width = document.getElementById('canvasSize-width').value,
			height = document.getElementById('canvasSize-height').value,
			pixelSize = document.getElementById('canvasSize-pixelSize').value,
			anchor = document.getElementById('anchorTable').getElementsByClassName('selected')[0],
			posX = anchor.dataset.posx,
			posY = anchor.dataset.posy,
			data = app.file.data,
			canvasWidth = data[0].length,
			canvasHeight = data.length;

		switch (posX) {

			case 'left':

				if (width > canvasWidth) {

					for (var i = 0; i < canvasHeight; i++) {

						for (var j = 0; j < width - canvasWidth; j++)
							data[i].push('rgba(0, 0, 0, 0)');
					}

				} else {

					for (var i = 0; i < canvasHeight; i++)
						data[i].splice(width, canvasWidth - width);
				}

				break;

			case 'center':

				if (width > canvasWidth) {

					var colLeft = Math.ceil((width - canvasWidth) / 2),
						colRight = Math.floor((width - canvasWidth) / 2);

					for (var i = 0; i < canvasHeight; i++) {

						for (var j = 0; j < colLeft; j++)
							data[i].push('rgba(0, 0, 0, 0)');

						for (var j = 0; j < colRight; j++)
							data[i].unshift('rgba(0, 0, 0, 0)');
					}

				} else {

					var colLeft = Math.ceil((canvasWidth - width) / 2),
						colRight = Math.floor((canvasWidth - width) / 2);

					for (var i = 0; i < canvasHeight; i++) {

						data[i].splice(0, colRight);
						data[i].splice(width, colLeft);
					}
				}

				break;

			case 'right':

				if (width > canvasWidth) {

					for (var i = 0; i < canvasHeight; i++) {

						for (var j = 0; j < width - canvasWidth; j++)
							data[i].unshift('rgba(0, 0, 0, 0)');
					}

				} else {

					for (var i = 0; i < canvasHeight; i++)
						data[i].splice(0, canvasWidth - width);
				}

				break;
		}

		canvasWidth = data[0].length;
		canvasHeight = data.length;

		switch (posY) {

			case 'top':

				if (height > canvasHeight) {

					var canvasRow = [];

					for (var i = 0; i < width; i++)
						canvasRow.push('rgba(0, 0, 0, 0)');

					for (var i = 0; i < height - canvasHeight; i++)
						data.push(canvasRow);

				} else {

					data.splice(height, canvasHeight - height);
				}

				break;

			case 'middle':

				if (height > canvasHeight) {

					var rowTop = Math.ceil((height - canvasHeight) / 2),
						rowBottom = Math.floor((height - canvasHeight) / 2),
						canvasRow = [];

					for (var i = 0; i < width; i++)
						canvasRow.push('rgba(0, 0, 0, 0)');

					for (var i = 0; i < rowTop; i++)
						data.push(canvasRow);

					for (var i = 0; i < rowBottom; i++)
						data.unshift(canvasRow);

				} else {

					var rowTop = Math.ceil((canvasHeight - height) / 2),
						rowBottom = Math.floor((canvasHeight - height) / 2);

					data.splice(0, rowBottom);
					data.splice(height, rowTop);
				}

				break;

			case 'bottom':

				if (height > canvasHeight) {

					var canvasRow = [];

					for (var i = 0; i < width; i++)
						canvasRow.push('rgba(0, 0, 0, 0)');

					for (var i = 0; i < height - canvasHeight; i++)
						data.unshift(canvasRow);

				} else {

					data.splice(0, canvasHeight - height);
				}

				break;
		}

		app.file.data = data;
		app.file.width = data[0].length;
		app.file.height = data.length;
		app.file.pixelSize = (pixelSize > 1) ? pixelSize : 1;

		app.canvas.undoArrayUpdate();
		app.canvas.create();
		app.data.load();
		app.modal.close();
	};

	// text inputs

	app.modal.txtInput = function() {

		if (this.value === '')
			this.value = 'untitled';
	};

	// number inputs

	app.modal.numInput = function() {

		var minNum = parseInt(this.getAttribute('min'));

		if (this.value < minNum)
			this.value = minNum;
	};


	///////////
	// tools //
	///////////


	app.tools.select = function() {

		var selectedId = this.getAttribute('id');

		if (selectedId !== 'color') {

			app.state.tool = selectedId;

			for (var i = 0; i < cache.tools.length; i++)
				cache.tools[i].className = '';

			this.className = 'selected';

		} else {

			app.tools.colorPanel();
		}
	};

	// mouse enter color panel

	app.tools.panelHover = function() {

		app.state.panelOver = true;
	};

	// mouse leave color panel

	app.tools.panelMouseLeave = function() {

		app.state.panelOver = false;
	};

	// open/close color panel

	app.tools.colorPanel = function() {

		if (cache.panel.className === 'selected')
			cache.panel.className = '';
		else
			cache.panel.className = 'selected';
	};

	// select color

	app.tools.colorSelect = function() {

		app.state.color = getComputedStyle(this, null).getPropertyValue('background-color');
		app.tools.changeColor(app.state.color);
	};

	// change color

	app.tools.changeColor = function(color) {

		if (color)
			cache.color.style.backgroundColor = color;
		else
			cache.color.style.backgroundColor = 'transparent';

		app.state.color = color;
	};

	// draw

	app.tools.draw = function(x, y, color) {

		if (app.state.color || color) {

			app.tools.erase(x, y);
			app.canvas.ctx.fillStyle = color ? color : app.state.color;
			app.canvas.ctx.fillRect(x, y, app.state.pixelSize, app.state.pixelSize);
		}
	};

	// erase

	app.tools.erase = function(x, y) {

		app.canvas.ctx.clearRect(x, y, app.state.pixelSize, app.state.pixelSize);
	};

	// smudge

	app.tools.smudge = function(x, y) {

		if (app.state.colorCache)
			app.tools.draw(x, y, app.state.colorCache);
		else
			app.tools.erase(x, y);
	};

	// fill

	app.tools.fill = function(x, y) {

		app.data.update();

		var selectedColor = app.state.colorCache ? app.state.colorCache : 'rgba(0, 0, 0, 0)';

		for (var row in app.file.data) {

			for (var pixel in app.file.data[row]) {

				if (app.file.data[row][pixel] === selectedColor)
					app.file.data[row][pixel] = app.state.color;
			}
		}

		app.data.load();
	};

	// eyedrop

	app.tools.eyedrop = function(x, y) {

		if (app.state.colorCache)
			app.tools.changeColor(app.state.colorCache);
	};


	////////////
	// canvas //
	////////////


	app.canvas.create = function() {

		cache.canvas.className = 'hidden';

		// create canvas

		var canvas = document.createElement('canvas');
		app.canvas.ctx = canvas.getContext('2d');
		canvas.width = app.file.width * app.file.pixelSize;
		canvas.height = app.file.height * app.file.pixelSize;

		// resize body

		document.body.style.minWidth = 44 + (8 * 2) + canvas.width + 'px';
		document.body.style.minHeight = 30 + (8 * 2) + canvas.height + 'px';

		// add canvas

		cache.canvas.innerHTML = '';
		app.canvas.offset(canvas.width, canvas.height);
		cache.canvas.appendChild(canvas);
		cache.canvas.className = '';

		// update document title

		document.title = 'Pixel Paint - "' + app.file.name + '"';

		// update data

		app.state.pixelSize = app.state.grid ? app.file.pixelSize - 2 : app.file.pixelSize;

		if (app.file.data === null)
			app.data.update();

		// create default undo-array

		if (app.state.undo.array.length === 0)
			app.state.undo.array = [app.file.data];

		// draw grid

		if (app.state.grid)
			app.canvas.grid();

		// mouse down canvas event

		canvas.onmousedown = function(event) {

			app.canvas.update(event.clientX, event.clientY, true);
		};

		// mouse move canvas event

		canvas.onmousemove = function(event) {

			if (app.state.mouseDown)
				app.canvas.update(event.clientX, event.clientY, false);
		};

		// mouse up canvas event

		canvas.onmouseup = function(event) {

			// update data

			app.data.update();

			// update undo state

			if (app.state.tool !== 'eyedrop')
				app.canvas.undoArrayUpdate();
		};
	};

	// update canvas

	app.canvas.update = function(x, y, clickEvent) {

        var cols = Math.floor((x + window.pageXOffset - cache.canvas.offsetLeft) / app.file.pixelSize),
            rows = Math.floor((y + window.pageYOffset - cache.canvas.offsetTop) / app.file.pixelSize),
            pixelX = cols * app.file.pixelSize,
            pixelY = rows * app.file.pixelSize;

        if (clickEvent) {

			if (app.file.data[rows][cols] !== 'rgba(0, 0, 0, 0)')
				app.state.colorCache = app.file.data[rows][cols];
			else
				app.state.colorCache = null;
        }

		if (app.state.grid) {

			pixelX++;
			pixelY++;
		}

		app.tools[app.state.tool](pixelX, pixelY);
	};

	// clear canvas

	app.canvas.clear = function() {

		var canvasWidth = app.file.pixelSize * app.file.width,
			canvasHeight = app.file.pixelSize * app.file.height;

		app.canvas.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	};

	// rotate canvas 90° clockwise

	app.canvas.rotateNinetyClockwise = function() {

		var data = [];

		for (var i = 0; i < app.file.width; i++) {

			data[i] = [];

			for (var j = 0; j < app.file.height; j++)
				data[i][j] = app.file.data[(app.file.height - (j + 1))][i];
		}

		app.file.width = data[0].length;
		app.file.height = data.length;
		app.file.data = data;
	};

	// rotate canvas 90° counter clockwise

	app.canvas.rotateNinetyCounterClockwise = function() {

		var data = [];

		for (var i = 0; i < app.file.width; i++) {

			data[i] = [];

			for (var j = 0; j < app.file.height; j++)
				data[i][j] = app.file.data[j][(app.file.width - (i + 1))];
		}

		app.file.width = data[0].length;
		app.file.height = data.length;
		app.file.data = data;
	};

	// flip canvas horizontal

	app.canvas.flipCanvasHorizontal = function() {

		for (var i = 0; i < app.file.width; i++)
			app.file.data[i].reverse();
	};

	// flip canvas vertical

	app.canvas.flipCanvasVertical = function() {

		app.file.data.reverse();
	};

	// draw grid

	app.canvas.grid = function() {

		app.canvas.ctx.fillStyle = 'rgb(126, 227, 211)';

		var width = app.file.width * app.file.pixelSize,
			height = app.file.height * app.file.pixelSize;

		for (var i = 0; i < app.file.height + 1; i++) {

			app.canvas.ctx.fillRect(0, i * app.file.pixelSize - 1, width, 2);

			for (var j = 0; j < app.file.width + 1; j++)
				app.canvas.ctx.fillRect(j * app.file.pixelSize - 1, 0, 2, width);
		}
	};

	// gen canvas offest

	app.canvas.offset = function(canvasWidth, canvasHeight) {

		var offsetMin = 8,
			offsetWidth = (cache.toolbar.className === 'hidden') ? 0 : 22;

		// width offset

		if (window.innerWidth > canvasWidth + (offsetWidth * 2 + offsetMin)) {

			cache.canvas.style.left = '50%';
			cache.canvas.style.marginLeft = offsetWidth - (canvasWidth / 2) + 'px';

		} else {

			cache.canvas.style.left = 0;
			cache.canvas.style.marginLeft = (offsetWidth * 2 + offsetMin) + 'px';
		}

		// height offset

		if (window.innerHeight > canvasHeight + 32) {

			cache.canvas.style.top = '50%';
			cache.canvas.style.marginTop = 12 - (canvasHeight / 2) + 'px';

		} else {

			cache.canvas.style.top = 0;
			cache.canvas.style.marginTop = 32 + 'px';
		}
	};

	// add data to undo array

	app.canvas.undoArrayUpdate = function() {

		if (app.state.undo.index < 4) {

			app.state.undo.index++;
			app.state.undo.array.splice(app.state.undo.index, 1, app.file.data);
			app.state.undo.array.splice(app.state.undo.index + 1);

		} else {

			app.state.undo.array.shift();
			app.state.undo.array.push(app.file.data);
		}
	};


	//////////////
	// init app //
	//////////////


	(app.init = function() {

		document.onmousedown = app.mouseDown;
		document.onmouseup = app.mouseUp;
		document.onkeydown = app.keydown;
		window.onresize = app.resize;

		// menu selection

		for (var i = 0; i < cache.menu.length; i++) {

			if (cache.menu[i].nodeType !== 3) {

				cache.menu[i].onmouseup = app.menu.select;
				cache.menu[i].onmouseenter = app.menu.hover;
				cache.menu[i].onmouseleave = app.menu.mouseLeave;

				// drop down menu selection

				var menuItems = cache.menu[i].getElementsByTagName('li');

				for (var j = 0; j < menuItems.length; j++) {

					var id = menuItems[j].dataset.value;
					menuItems[j].onmouseup = app.menu[id];
				}
			}
		}

		for (var i = 0; i < cache.anchor.length; i++)
			cache.anchor[i].onmouseup = app.menu.anchorSelect;

		// modal

		document.getElementById('closeModal').onmouseup = app.modal.close;
		document.getElementById('newSubmit').onmouseup = app.modal.newFile;
		document.getElementById('openSubmit').onmouseup = app.modal.openFile;
		document.getElementById('saveSubmit').onmouseup = app.modal.saveFile;
		document.getElementById('exportSubmit').onmouseup = app.modal.exportFile;
		document.getElementById('canvasSizeSubmit').onmouseup = app.modal.canvasSize;

		// modal cancel btn

		var cancelBtn = cache.modal.getElementsByClassName('cancel');

		for (var i = 0; i < cancelBtn.length; i++)
			cancelBtn[i].onmouseup = app.modal.close;

		// modal input

		var input = cache.modal.getElementsByTagName('input');

		for (var i = 0; i < input.length; i++) {

			var className = input[i].className;

			input[i].onchange = app.modal[className];
			input[i].onblur = app.modal[className];
		}

		// tool selection

		for (var i = 0; i < cache.tools.length; i++)
			cache.tools[i].onmouseup = app.tools.select;

		// color selection

		for (var i = 0; i < cache.colors.length; i++)
			cache.colors[i].onmouseup = app.tools.colorSelect;

		cache.color.onmouseenter = app.tools.panelHover;
		cache.color.onmouseleave = app.tools.panelMouseLeave;

		app.tools.changeColor(app.state.color);
		app.canvas.create();

	}());

}, true);
