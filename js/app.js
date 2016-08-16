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
//    site | robertmermet.com/projects/pixelPaint
// --------+-------------------------------------
//   git@github.com:robertmermet/pixelPaint.git
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
		color		: 'rgb(0, 88, 248)',
		colorCache	: null,
		tool		: 'draw',
		undo		: {
			array : [],
			index : 4,
		}
	};


	/////////
	// app //
	/////////


	app.mouseDown = function() {

		app.state.mouseDown = true;

		if (app.state.menuOver === false) {

            app.menu.close();
		}

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

				var pixelColor = app.canvas.ctx.getImageData((j * pixelSize), (i * pixelSize), 1, 1).data;

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
					app.canvas.ctx.fillRect((j * pixelSize), (i * pixelSize), pixelSize, pixelSize);
				}
			}
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

			for (var i = 0; i < cache.menu.length; i++) {

				cache.menu[i].className = '';
			}

			this.className = 'selected';
		}
	};


	app.menu.mouseLeave = function() {

		app.state.menuOver = false;
	};


	app.menu.close = function () {

		for (var i = 0; i < cache.menu.length; i++) {

			cache.menu[i].className = '';
		}

		app.state.menuDown = false;
	};

	// create new canvas

	app.menu.new = function() {

		var inputs = document.getElementById('newCanvas').getElementsByTagName('input');

		// update form

		for (var i = 0; i < inputs.length; i++) {

			var id = (inputs[i].id).replace('canvas-', '');
			inputs[i].setAttribute('value', app.file.canvas[id]);
		}

		// open modal

		app.modal.open('newCanvas');
	};

	// export png

	app.menu.export = function() {

		var download = document.createElement('a'),
			canvas = cache.canvas.getElementsByTagName('canvas')[0];

		download.href = canvas.toDataURL('image/png');
		download.download = app.file.canvas.name + '.png';
		download.click();
	};

	// undo

	app.menu.undo = function() {
		app.state.undo.index = (app.state.undo.index - 1) >= 0 ? app.state.undo.index - 1 : 0;
		app.file.data = app.state.undo.array[app.state.undo.index];
		app.data.load();
	};

	// redo

	app.menu.redo = function() {

		if (app.state.undo.index < 4) {

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

	// view canvas grid

    app.menu.grid = function() {

    };

	// view tools

    app.menu.tools = function() {

		var checkbox = this.getElementsByTagName('span')[0];

        if (cache.toolbar.className === '') {

            cache.toolbar.className = checkbox.className = 'hidden';

        } else {

            cache.toolbar.className = checkbox.className = '';
        }

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

		document.getElementById('newCanvas').className = 'hidden';
		document.getElementById('pixelSize').className = 'hidden';
		document.getElementById('about').className = 'hidden';
	};

	// make new canvas

	app.modal.newCanvas = function() {

		var name = document.getElementById('canvas-name').value,
			width = document.getElementById('canvas-width').value,
			height = document.getElementById('canvas-height').value,
			pixelSize = document.getElementById('canvas-pixelSize').value;

		app.file.canvas.name = name;
		app.file.canvas.width = (width > 2) ? width : 2;
		app.file.canvas.height = (height > 2) ? height : 2;
		app.file.canvas.pixelSize = (pixelSize > 1) ? pixelSize : 1;

		app.canvas.create();
		app.modal.close();
	};

	// update pixel size

	app.modal.pixelSize = function() {

		var pixelSize = document.getElementById('pixelSize-pixelSize').value;

		app.data.update();

		app.file.canvas.pixelSize = (pixelSize > 1) ? pixelSize : 1;

		app.canvas.create();
		app.data.load();
		app.modal.close();
	};


	///////////
	// tools //
	///////////


	app.tools.select = function() {

		var selectedId = this.getAttribute('id');

		if (selectedId !== 'color') {

			app.state.tool = selectedId;

			for (var i = 0; i < cache.tools.length; i++) {

				cache.tools[i].className = '';
			}

			this.className = 'selected';

		} else {

			app.tools.colorPanel();
		}
	};


	app.tools.colorPanel = function() {

		if (cache.panel.className === 'selected') {

			cache.panel.className = '';

		} else {

			cache.panel.className = 'selected';
		}
	};


	app.tools.colorSelect = function() {

		app.state.color = getComputedStyle(this, null).getPropertyValue('background-color');
		app.tools.changeColor(app.state.color);
	};


	app.tools.changeColor = function(color) {

		if (color) {

			cache.color.style.backgroundColor = color;

		} else {

			cache.color.style.backgroundColor = 'transparent';
		}

		app.state.color = color;
	};


	app.tools.draw = function(x, y, color) {

		if (app.state.color || color) {

			app.tools.erase(x, y);
			app.canvas.ctx.fillStyle = color ? color : app.state.color;
			app.canvas.ctx.fillRect(x, y, app.file.canvas.pixelSize, app.file.canvas.pixelSize);
		}
	};


	app.tools.erase = function(x, y) {

		app.canvas.ctx.clearRect(x, y, app.file.canvas.pixelSize, app.file.canvas.pixelSize);
	};


	app.tools.smudge = function(x, y) {

		if (app.state.colorCache) {

			app.tools.draw(x, y, app.state.colorCache);

		} else {

			app.tools.erase(x, y);
		}
	};


	app.tools.fill = function(x, y) {

		var selectedColor = app.state.colorCache ? app.state.colorCache : 'rgba(0, 0, 0, 0)';

		for (var row in app.file.data) {

			for (var pixel in app.file.data[row]) {

				if (app.file.data[row][pixel] === selectedColor)
					app.file.data[row][pixel] = app.state.color;
			}
		}

		app.data.load();
	};


	app.tools.eyedrop = function(x, y) {

		if (app.state.colorCache) {

			app.tools.changeColor(app.state.colorCache);
		}
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

		if (app.file.data === null)
			app.data.update();

		// undo array default

		if (app.state.undo.array.length === 0) {

			for (var i = 0; i < 5; i++) {

				app.state.undo.array[i] = app.file.data;
			}
		}

		// mouse down canvas event

		canvas.onmousedown = function(event) {

			app.canvas.update(event.clientX, event.clientY, true);
		};

		// mouse move canvas event

		canvas.onmousemove = function(event) {

			if (app.state.mouseDown) {

				app.canvas.update(event.clientX, event.clientY, false);
			}
		};

		// mouse up canvas event

		canvas.onmouseup = function(event) {

			// update undo state
			/*
			app.state.undo.array.push(app.file.data);
			app.state.undo.array.shift();

			switch (app.state.undo.index) {
				case 4:
					break;
				default:
					app.state.undo.index++;
			}
			*/
		}
	};


	app.canvas.update = function(x, y, clickEvent) {

		x -= cache.canvas.offsetLeft;
		y -= cache.canvas.offsetTop;

		if (clickEvent) {

			var rgb = app.canvas.ctx.getImageData(x, y, 1, 1).data;

			if (rgb[3]) {

				app.state.colorCache = 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 255)';

			} else {

				app.state.colorCache = null;
			}
		}

		var pizelSize = app.file.canvas.pixelSize,
			pixelX = Math.floor(x / pizelSize) * pizelSize,
			pixelY = Math.floor(y / pizelSize) * pizelSize;

		app.tools[app.state.tool](pixelX, pixelY);
		// app.data.update();
	};


	app.canvas.clear = function() {

		var canvasWidth = app.file.canvas.pixelSize * app.file.canvas.width,
			canvasHeight = app.file.canvas.pixelSize * app.file.canvas.height;

		app.canvas.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	};


	app.canvas.offset = function(canvasWidth, canvasHeight) {

		var offsetMin = 8;
		var offsetWidth = (cache.toolbar.className === 'hidden') ? 0 : 22;

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
		document.getElementById('newSubmit').onmouseup = app.modal.newCanvas;
		document.getElementById('newCancel').onmouseup = app.modal.close;
		document.getElementById('pixelSizeSubmit').onmouseup = app.modal.pixelSize;
		document.getElementById('pixelSizeCancel').onmouseup = app.modal.close;

		// tool selection

		for (var i = 0; i < cache.tools.length; i++) {

			cache.tools[i].onmousedown = app.tools.select;
		}

		// color selection

		for (var i = 0; i < cache.colors.length; i++) {

			cache.colors[i].onmousedown = app.tools.colorSelect;
		}

		app.tools.changeColor(app.state.color);

		app.canvas.create();
	}());

}, true);
