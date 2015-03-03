//  _   _ ______  _____   _____      _       _ 
// | \ | |  ____|/ ____| |  __ \    (_)     | |
// |  \| | |__  | (___   | |__) |_ _ _ _ __ | |
// | . ` |  __|  \___ \  |  ___/ _` | | '_ \| __|
// | |\  | |____ ____) | | |  | (_| | | | | | |
// |_| \_|______|_____/  |_|   \__,_|_|_| |_|\__|
//  
//  version | 0.01
// ---------+-----------------------------------
//   author | robert mermet
// ---------+-----------------------------------
//     site | robertmermet.com/projects/nesPaint
// ---------+-----------------------------------
//   git@github.com:robertmermet/nesPaint.git

$(document).ready(function() {

    var canvas   = $('#canvas'),
        preview  = $('#preview'),
        menu     = $('#menu'),
        tools    = $('#tools'),
        palette  = $('#palette'),
        pixels;

    var settings = {
        title: 'untitled',
        canvas: {
            columns: 16,
            rows: 16,
            pixelSize: 32
        },
        preview: {
            columns: 8,
            rows: 8,
            pixelSize: 4
        }
    };

    var status = {
        isMouseDown: false,
        isMenuOver: false,
        isMenuDown: false,
        isPaletteOver: false,
        isPaletteDown: false
    }

    $(this).on('mousedown', function() {

        status.isMouseDown = true;

        if (status.isMenuOver === false) {

            $('#menu .selected').removeClass('selected');
            status.isMenuDown = false;
        }

        if (status.isPaletteOver === false) {

            $('#colorPalette').css('display', 'none');
            status.isPaletteDown = false;
        }
    });

    $(this).on('mouseup', function() {

        status.isMouseDown = false;
    });

    // draggable
    $('#toolsWrapper').draggable({ handle: 'p' });  // to do - remove
    
    $('#canvasWrapper').draggable({ handle: 'p' });  // to do - remove

    $('#previewWrapper').draggable({ handle: 'p' });  // to do - remove

    //////////
    // menu //  
    //////////

    var menuItem = $('#menu').find('li');
    
    menuItem.on('click', function() {

        if ($(this).hasClass('selected')) {

            $(this).removeClass('selected');
            status.isMenuDown = false;

        } else {

            $(this).addClass('selected');
            status.isMenuDown = true;
        }
    });

    menuItem.on('mouseover', function() {

        status.isMenuOver = true;

        if (status.isMenuDown === true) {

            $('#menu .selected').removeClass('selected');
            $(this).addClass('selected');
        }
    });

    menu.on('mouseleave', function() {

        status.isMenuOver = false;
    });

    // menu > file > new
    var popUp        = $('#popUp'),
        popUpContent = $('#popUpContent');

    $('#popUpClose').on('click', function() {
        popUp.css('display', 'none');
    });

    $('#fileNew').on('click', function() {

        popUp.css('display', 'block');

        popUpContent.html('<h2>New Project</h2><br />\
            <span><strong>Canvas</strong></span><br />\
            <span>Columns</span> <input id="canvasColumns" type="text" value="' + settings.canvas.columns + '" /><br />\
            <span>Rows</span> <input id="canvasRows" type="text" value="' + settings.canvas.rows + '" /><br />\
            <span>Pixel Size</span> <input id="canvasPixelSize" type="text" value="' + settings.canvas.pixelSize + '" /> px<br /><br />\
            <span><strong>Preview</strong></span><br />\
            <span>Columns</span> <input id="previewColumns" type="text" value="' + settings.preview.columns + '" /><br />\
            <span>Rows</span> <input id="previewRows" type="text" value="' + settings.preview.rows + '" /><br />\
            <span>Pixel Size</span> <input id="previewPixelSize" type="text" value="' + settings.preview.pixelSize + '" /> px<br /><br />\
            <span id="popUpSubmit" class="btn">Create</span>');

        $('#popUpWindow').css('marginTop', '-100px');

        popUp.on('click', '#popUpSubmit', function() {

            // remove canvas & preview
            canvas.html('');
            preview.html('');

            // get values from form
            settings.canvas.columns    = $('#canvasColumns').val();
            settings.canvas.rows       = $('#canvasRows').val();
            settings.canvas.pixelSize  = $('#canvasPixelSize').val();

            settings.preview.columns   = $('#previewColumns').val();
            settings.preview.rows      = $('#previewRows').val();
            settings.preview.pixelSize = $('#previewPixelSize').val();

            // generate new canvas & preview
            genCanvas();
            genPreview();
            selectTool('pencil');

            popUp.css('display', 'none');
        });
    });

    // menu > file > open 
    $('#fileOpen').on('click', function() {
    
        alert('coming soon');
    });

    // menu > file > save
    $('#fileSave').on('click', function() {
    
        alert('coming soon');

        /*
        var obj = {a: 123, b: "4 5 6"};
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

        $('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#container');
    *   */
    });

    // menu > file > export
    $('#fileExport').on('click', function() {
        
        alert('coming soon');
    });

    // menu > file > exit
    $('#fileExit').on('click', function() {
        window.top.close();
    });


    // menu > view > canvas grid 
    $('#viewCanvasGrid').on('click', function() {

        if (canvas.hasClass('grid')) {

            canvas.removeClass('grid');

            $(this).find('span').addClass('hidden');
        
        } else {

            canvas.addClass('grid');
        
            $(this).find('span').removeClass('hidden');
        }

    });

    // menu > view > sprite sheet grid
    $('#viewSpriteSheetGrid').on('click', function() {

        if (preview.hasClass('grid')) {

            preview.removeClass('grid');

            $(this).find('span').addClass('hidden');
        
        } else {

            preview.addClass('grid');
        
            $(this).find('span').removeClass('hidden');
        }
    });

    // menu > window > tools
    $('#windowTools').on('click', function() {

        var toolsWrapper = $('#toolsWrapper');

        if (toolsWrapper.css('display') === 'none') {

            toolsWrapper.css('display', 'block');

            $(this).find('span').css('visibility', 'visible');

        } else {

            toolsWrapper.css('display', 'none');

            $(this).find('span').css('visibility', 'hidden');
        }
    });

    // menu > window > canvas
    $("#windowCanvas").on('click', function() {

        var canvasWrapper = $('#canvasWrapper');

        if (canvasWrapper.css('display') === 'none') {

            canvasWrapper.css('display', 'block');

            $(this).find('span').css('visibility', 'visible');

        } else {

            canvasWrapper.css('display', 'none');

            $(this).find('span').css('visibility', 'hidden');
        }
    });

    // menu > window > preview
    $("#windowPreview").on('click', function() {

        var previewWrapper = $('#previewWrapper');

        if (previewWrapper.css('display') === 'none') {

            previewWrapper.css('display', 'block');

            $(this).find('span').css('visibility', 'visible');

        } else {

            previewWrapper.css('display', 'none');

            $(this).find('span').css('visibility', 'hidden');
        }
    });

    // menu > help > documentation
    $("#helpDocumentation").on("click", function() {

        popUpContent.html('<h2>NES Paint</h2>\
            <p>Documentation</p><br />\
            <p>Coming Soon</p>');

        popUp.css('display','block');
    });


    // menu > help > about
    $("#helpAbout").on("click", function() {

        popUpContent.html('<h2>NES Paint</h2>\
            <p>Version 0.09</p><br />\
            <strong>Download >></strong>\
            <a href="https://github.com/robertmermet/nesPaint" target="_blank">https://github.com/robertmermet/nesPaint</a>');

        popUp.css('display', 'block');
    });

    ////////////
    // canvas //
    ////////////

    // gen canvas
    function genCanvas() {

        // canvas width & height
        var canvasWidth = settings.canvas.columns * settings.canvas.pixelSize,
            canvasHeight = settings.canvas.rows * settings.canvas.pixelSize;

        canvas.css({
            width: canvasWidth + 'px', 
            height: canvasHeight + 'px'
        });

        // canvas offset
        $('#canvasWrapper').css({
            marginLeft: (-canvasWidth / 2) + 'px',
            marginTop: (-canvasHeight / 2) + 'px'
        });

        // draw canvas
        for (var j = 0; j < settings.canvas.rows; j++) {

            for (var i = 0; i < settings.canvas.columns; i++) {

                canvas.append('<div class="blank"\
                    data-num="' + i + ':' + j + '"\
                    style="position: absolute;\
                    width: ' + settings.canvas.pixelSize + 'px;\
                    height: ' + settings.canvas.pixelSize + 'px;\
                    left: ' + (i * settings.canvas.pixelSize) + 'px;\
                    top: ' + (j * settings.canvas.pixelSize) + 'px;"></div>')
            }
        }

        pixels = canvas.find('div');
    }

    /////////////
    // preview //
    /////////////

    // gen preview
    function genPreview() {

        // preview width & height
        var previewWidth = settings.canvas.columns * settings.preview.columns * settings.preview.pixelSize,
            previewHeight = settings.canvas.rows * settings.preview.rows * settings.preview.pixelSize;

        preview.css({
            width: previewWidth + 'px',
            height: previewHeight + 'px'
        });

        // preveiw offset
        $('#previewWrapper').css({
            marginLeft: (-previewWidth / 2) + 'px',
            marginTop: (-previewHeight / 2) + 'px'
        });

        // preview tile
        var previewTileWidth = settings.canvas.columns * settings.preview.pixelSize,
            previewTileHeight = settings.canvas.rows * settings.preview.pixelSize;

        for (var j = 0; j < settings.preview.rows; j++) {

            for (var i = 0; i < settings.preview.columns; i++) {

                var tile = $('<div class="selected"\
                    style="position: absolute;\
                    width:' + previewTileWidth + 'px;\
                    height:' + previewTileHeight + 'px;\
                    left:' + (previewTileWidth * i) + 'px;\
                    top:' + (previewTileHeight * j) + 'px;"></div>');
                
                for (var y = 0; y < settings.canvas.rows; y++) {

                    for (var x = 0; x < settings.canvas.columns; x++) {
                        
                        tile.append('<div class="blank"\
                            data-num="' + x + ':' + y + '"\
                            style="position: absolute;\
                            width: ' + settings.preview.pixelSize + 'px;\
                            height: ' + settings.preview.pixelSize + 'px;\
                            left: ' + (x * settings.preview.pixelSize) + 'px;\
                            top: ' + (y * settings.preview.pixelSize) + 'px;"></div>');
                    }
                }
                preview.append(tile);
            }
        }

        // select preview tile
        preview.children('div').on('click', function() {

            preview.find('.selected').removeClass('selected');

            $(this).addClass('selected');

            $(this).children('div').each(function(i) {

                $('#canvas').children('div').eq(i).attr('class', $(this).attr('class'));
            });
        });
    }

    // update preview
    function updatePreview(pixel) {

        preview.find('.selected').find('div[data-num="' + $(pixel).attr('data-num') + '"]').attr('class', $(pixel).attr('class'));
    }

    ///////////
    // tools //
    ///////////

    $('.tool').on('click', function() {

        selectTool($(this).attr('id'));
    });

    function selectTool(tool) {

        $('#tools').find('.selected').removeClass('selected');
        
        $('#' + tool).addClass('selected');

        pixels.unbind('mousedown');
        pixels.unbind('mouseover');

        switch (tool) {
            
            case 'pencil':

                pixels.on('mousedown', function() {

                    color = currentColor;

                    $(this).attr('class', color);

                    updatePreview(this);
                });

                pixels.on('mouseover', function() {
                    if (status.isMouseDown == true) {   
                        $(this).attr('class', color);

                        updatePreview(this);
                    }
                });

                break;

            case 'eraser':

                pixels.on('mousedown', function() {

                    color = 'blank';
                    $(this).attr('class', color);
                    updatePreview(this);
                });

                pixels.on('mouseover', function() {

                    if (status.isMouseDown === true) {

                        $(this).attr('class', color);
                        updatePreview(this);
                    }
                    });

                break;

            case 'smudge':

                pixels.on('mousedown', function() {

                    color = $(this).attr('class');

                    if (color === undefined) {

                        color = 'blank';
                    }

                    updatePreview(this);
                });

                pixels.on('mouseover', function() {

                    if (status.isMouseDown === true) {

                        $(this).attr('class', color);
                        updatePreview(this);
                    }
                });

                break;

            case 'fill':

                pixels.on('mousedown', function() {

                    var fillColor = $(this).attr('class');

                    $('#canvas').find('.' + fillColor).attr('class', currentColor);
                    $('#preview').find('.selected').find('.' + fillColor).attr('class', currentColor);
                });

                break;

            case 'eyedrop':

                pixels.on('mousedown', function() {

                    if ($(this).attr('class') !== 'blank') {

                        color = $(this).attr('class');
                        currentColor = color;
                        colorPreview.attr('class', color);
                    }
                });

                break;
        }

    }

    ////////////////////
    // color selector //
    ////////////////////

    var colorPalette = $('#colorPalette'),
        colorPreview = $('#currentColor'),
        color,
        currentColor;

    colorPreview.on('click', function() {

        if (status.isPaletteDown === false) {

            colorPalette.css('display', 'block');
            status.isPaletteDown = true;

        } else {

            colorPalette.css('display', 'none');
            status.isPaletteDown = false;
        }
    });

    // mouseover color palette
    colorPalette.on('mouseover', function() {
        status.isPaletteOver = true;
    });

    colorPalette.on('mouseleave', function() {
        status.isPaletteOver = false;
    });

    // mouseover color preview
    colorPreview.on('mouseover', function() {
        status.isPaletteOver = true;
    });

    colorPreview.on('mouseleave', function() {
        status.isPaletteOver = false;
    });

    // color select event
    $('#colorPalette').find('td').on('click', selectColor);

    function selectColor() {

        color = $(this).attr('class');
        currentColor = color;
        colorPreview.attr('class', color);
        colorPalette.css('display', 'none');
        status.isPaletteDown = false;
    }

    colorPreview.attr('class', 'c12');
    color = currentColor = 'c12';

    genCanvas();
    genPreview();
    selectTool('pencil');
});