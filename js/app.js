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
		modal	: document.getElementById('modal'),
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
		canvas : {
			name		: 'untitled',
			width		: 16,
			height		: 16,
			pixelSize	: 32
		},
		data : null
	};

	// app state

	app.state = {
		mouseDown	: false,
		menuOver	: false,
		menuDown	: false,
        toolOver	: false,
		pixelSize   : null,
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

		if (app.state.menuOver === false)
			app.menu.close();

		// TODO
		/*
        if (cache.panel.className === 'selected') {

            // cache.panel.className = '';
        }
		*/
	};


	app.mouseUp = function() {

		app.state.mouseDown = false;
	};

	// window resize

	app.resize = function() {

		app.canvas.offset(cache.canvas.offsetWidth, cache.canvas.offsetHeight);
	};

	// update data

	app.data.update = function() {

		var pixelSize = app.file.canvas.pixelSize,
			data = [];

		for (var i = 0; i < app.file.canvas.height; i++) {

			var row = [];

			for (var j = 0; j < app.file.canvas.width; j++) {

				var pixelColor = app.canvas.ctx.getImageData((j * pixelSize) + 1, (i * pixelSize) + 1, 1, 1).data;
				row.push('rgba(' + pixelColor[0] + ', ' + pixelColor[1] + ', ' + pixelColor[2] + ', ' + pixelColor[3] + ')');
			}

			data.push(row);
		}

		app.file.data = data;
	};

	// load & print data

	app.data.load = function() {

		var pixelSize = app.file.canvas.pixelSize,
			i, j;

		app.canvas.clear();

		if (app.file.data) {

			for (i = 0; i < app.file.canvas.height; i++) {

				for (j = 0; j < app.file.canvas.width; j++) {

					app.canvas.ctx.fillStyle = app.file.data[i][j];

					if (app.state.grid)
						app.canvas.ctx.fillRect((j * pixelSize) + 1, (i * pixelSize) + 1, app.state.pixelSize, app.state.pixelSize);
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


	app.menu.close = function () {

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
			inputs[i].setAttribute('value', app.file.canvas[id]);
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

		document.getElementById('save-file-name').setAttribute('value', app.file.canvas.name);

		// open modal

		app.modal.open('saveFile');
	};

	// export png

	app.menu.export = function() {

		// update form

		document.getElementById('export-file-name').setAttribute('value', app.file.canvas.name);

		// open modal

		app.modal.open('exportFile');
	};

	// undo

	app.menu.undo = function() {

		if (app.state.undo.index > 0) {

			app.state.undo.index--;
			app.file.data = app.state.undo.array[app.state.undo.index];
			app.data.load();
		}
	};

	// redo

	app.menu.redo = function() {

		if (app.state.undo.index < 4 && app.state.undo.index + 1 < app.state.undo.array.length) {

			app.state.undo.index++;
			app.file.data = app.state.undo.array[app.state.undo.index];
			app.data.load();
		}
	};

	// change pixel size

	app.menu.pixelSize = function() {

		// update form

		var form = document.getElementById('pixelSize-pixelSize');
		form.setAttribute('value', app.file.canvas.pixelSize);

		// open modal

		app.modal.open('pixelSize');
	};

	// flip canvas horizontal

	app.menu.flipCanvasHorizontal = function() {

		app.canvas.flipCanvasHorizontal();
	}

	// flip canvas vertical

	app.menu.flipCanvasVertical = function() {

		app.canvas.flipCanvasVertical();
	}

	// view canvas grid

	app.menu.grid = function() {

		var checkbox = this.getElementsByTagName('span')[0];

		if (app.state.grid === false) {

			app.state.grid = true;
			checkbox.className = '';
			app.state.pixelSize -= 2;
			app.canvas.grid();

		} else {

			app.state.grid = false;
			checkbox.className = 'hidden';
			app.state.pixelSize += 2;
			app.data.load();
		}
	};

	// view tools

	app.menu.tools = function() {

		var checkbox = this.getElementsByTagName('span')[0];

		if (cache.toolbar.className === '')
			cache.toolbar.className = checkbox.className = 'hidden';
		else
			cache.toolbar.className = checkbox.className = '';

		app.canvas.offset(cache.canvas.offsetWidth, cache.canvas.offsetHeight);
	};

	// view canvas

	app.menu.canvas = function() {

		var checkbox = this.getElementsByTagName('span')[0];

		if (cache.canvas.className === '') {

			cache.canvas.className = checkbox.className = 'hidden';

		} else {

			cache.canvas.className = checkbox.className = '';
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

		document.getElementById('newFile').className = 'hidden';
		document.getElementById('openFile').className = 'hidden';
		document.getElementById('saveFile').className = 'hidden';
		document.getElementById('exportFile').className = 'hidden';
		document.getElementById('pixelSize').className = 'hidden';
		document.getElementById('about').className = 'hidden';
	};

	// make new file

	app.modal.newFile = function() {

		var name = document.getElementById('canvas-name').value,
			width = document.getElementById('canvas-width').value,
			height = document.getElementById('canvas-height').value,
			pixelSize = document.getElementById('canvas-pixelSize').value;

		app.file.canvas.name = name;
		app.file.canvas.width = (width > 2) ? width : 2;
		app.file.canvas.height = (height > 2) ? height : 2;
		app.file.canvas.pixelSize = (pixelSize > 1) ? pixelSize : 1;
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

			if (data.hasOwnProperty('canvas') && data.hasOwnProperty('data')) {

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

		app.file.canvas.name = fileName;

		var file = encodeURIComponent(JSON.stringify(app.file));

		download.setAttribute('href', 'data:text/plain;charset=utf-8,' + file);
		download.setAttribute('download', app.file.canvas.name + '.json');
		download.click();
		app.modal.close();
	};

	// export file

	app.modal.exportFile = function() {

		var fileName = document.getElementById('export-file-name').value,
			download = document.createElement('a'),
			canvas = cache.canvas.getElementsByTagName('canvas')[0],
			file = canvas.toDataURL('image/png');

		app.file.canvas.name = fileName;
		download.setAttribute('href', file);
		download.setAttribute('download', app.file.canvas.name + '.png');
		download.click();
		app.modal.close();
	};

	// update pixel size

	app.modal.pixelSize = function() {

		var pixelSize = document.getElementById('pixelSize-pixelSize').value;

		app.file.canvas.pixelSize = (pixelSize > 1) ? pixelSize : 1;
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

		// create canvas

		var canvas = document.createElement('canvas');
		app.canvas.ctx = canvas.getContext('2d');
		canvas.width = app.file.canvas.width * app.file.canvas.pixelSize;
		canvas.height = app.file.canvas.height * app.file.canvas.pixelSize;

		// add canvas

		cache.canvas.innerHTML = '';
		app.canvas.offset(canvas.width, canvas.height);
		cache.canvas.appendChild(canvas);

		// update data

		app.state.pixelSize = app.state.grid ? app.file.canvas.pixelSize - 2 : app.file.canvas.pixelSize;

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

			if (app.state.tool !== 'eyedrop') {

				if (app.state.undo.index < 4) {

					app.state.undo.index++;
					app.state.undo.array.splice(app.state.undo.index, 1, app.file.data);
					app.state.undo.array.splice(app.state.undo.index + 1);

				} else {

					app.state.undo.array.shift();
					app.state.undo.array.push(app.file.data);
				}
			}
		}
	};

	// update canvas

	app.canvas.update = function(x, y, clickEvent) {

		x -= cache.canvas.offsetLeft;
		y -= cache.canvas.offsetTop;

        var pixelSize = app.file.canvas.pixelSize,
            cols = Math.floor(x / pixelSize),
            rows = Math.floor(y / pixelSize),
            pixelX = cols * pixelSize,
            pixelY = rows * pixelSize;

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

		var canvasWidth = app.file.canvas.pixelSize * app.file.canvas.width,
			canvasHeight = app.file.canvas.pixelSize * app.file.canvas.height;

		app.canvas.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	};

	// flip canvas horizontal

	app.canvas.flipCanvasHorizontal = function() {

		app.data.update();

		for (var i = 0; i < app.file.canvas.width; i++)
			app.file.data[i].reverse();

		if (app.state.undo.index < 4) {

			app.state.undo.index++;
			app.state.undo.array.splice(app.state.undo.index, 1, app.file.data);
			app.state.undo.array.splice(app.state.undo.index + 1);

		} else {

			app.state.undo.array.shift();
			app.state.undo.array.push(app.file.data);
		}

		app.data.load();
	};

	// flip canvas vertical

	app.canvas.flipCanvasVertical = function() {

		app.data.update();
		app.file.data.reverse();

		if (app.state.undo.index < 4) {

			app.state.undo.index++;
			app.state.undo.array.splice(app.state.undo.index, 1, app.file.data);
			app.state.undo.array.splice(app.state.undo.index + 1);

		} else {

			app.state.undo.array.shift();
			app.state.undo.array.push(app.file.data);
		}

		app.data.load();
	};

	// draw grid

	app.canvas.grid = function() {

		app.canvas.ctx.fillStyle = 'rgb(126, 227, 211)';

		var pixelSize = app.file.canvas.pixelSize,
			width = app.file.canvas.width * pixelSize,
			height = app.file.canvas.height * pixelSize;

		for (var i = 0; i < app.file.canvas.height + 1; i++) {

			app.canvas.ctx.fillRect(0, i * pixelSize - 1, width, 2);

			for (var j = 0; j < app.file.canvas.width + 1; j++)
				app.canvas.ctx.fillRect(j * pixelSize - 1, 0, 2, width);
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


	//////////////
	// init app //
	//////////////


	(app.init = function() {

		document.onmousedown = app.mouseDown;
		document.onmouseup = app.mouseUp;

		window.onresize = app.resize;

		// menu selection

		for (var i = 0; i < cache.menu.length; i++) {

			if (cache.menu[i].nodeType != 3) {

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

		// modal

		document.getElementById('closeModal').onmouseup = app.modal.close;
		document.getElementById('newSubmit').onmouseup = app.modal.newFile;
		document.getElementById('openSubmit').onmouseup = app.modal.openFile;
		document.getElementById('saveSubmit').onmouseup = app.modal.saveFile;
		document.getElementById('exportSubmit').onmouseup = app.modal.exportFile;
		document.getElementById('pixelSizeSubmit').onmouseup = app.modal.pixelSize;

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
			cache.tools[i].onmousedown = app.tools.select;

		// color selection

		for (var i = 0; i < cache.colors.length; i++)
			cache.colors[i].onmousedown = app.tools.colorSelect;

		app.tools.changeColor(app.state.color);
		app.canvas.create();

	}());

}, true);
