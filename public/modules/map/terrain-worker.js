self.dems = {};

onmessage = function (e) {
    // clear data
    if (e.data === 'clear') {
        self.dems = {};
        return;
    }
    // terrain data at point
    else if (e.data.pointInTile) {
        var dem = self.dems[e.data.id];
        // make sure full tile is loaded
        if (!dem || dem.length != (256 * 256)) return;

        // make sure coords are with bounds
        if (e.data.pointInTile.x > 255) e.data.pointInTile.x = 255;
        if (e.data.pointInTile.y > 255) e.data.pointInTile.y = 255;
        if (e.data.pointInTile.x < 0) e.data.pointInTile.x = 0;
        if (e.data.pointInTile.y < 0) e.data.pointInTile.y = 0;

        // convert xy coord to 2d array index
        var arrayIndex = (e.data.pointInTile.y * 256 + e.data.pointInTile.x);
        // get terrain data
        var terrainData = dem[arrayIndex];
        if (!terrainData) return;

        // return to client
        postMessage({ 
            id: e.data.id,
            lat: e.data.lat,
            lng: e.data.lng,

            requestId: e.data.requestId,
            index: e.data.index,
            pointInTile: e.data.pointInTile,
            original: e.data.original,

            elevation: terrainData[0],
            slope: terrainData[1],
            aspect: terrainData[2],
        }); 
        return;
    }

    if (!e.data) return;

    if (e.data.raster) {
        var converted = convert(new Uint32Array(e.data.raster));
        self.dems[e.data.id] = converted;
        //self.dems[e.data.id] = raster2dem(e.data.raster, .051, converted, 40);
    }

    // if loadTerrainData only
    if (e.data.processType == "loadTerrainData") return postMessage({ id: e.data.id });

    // process pixels
    var processed;

    if (e.data.processType == "sun") {
        processed = sunlight(
            self.dems[e.data.id],
            e.data.altitude,
            e.data.azimuth
        );
    }
    else if (e.data.processType == "hillshade") {
        processed = hillshade(self.dems[e.data.id])
    }
    else {
        processed = render(self.dems[e.data.id], e.data.processType, e.data.customParams); 
        //processed = _hillshade(self.dems[e.data.id], 60, 0, .45, .45)
    }

    // send process pixels to client
    postMessage({
        id: e.data.id,
        pixels: processed.buffer,
    }
    // use Transferable for transfering pixels for better performance
    , [processed.buffer]);

};

function convert(data) {
    var r = [];
    for (var i=0; i< data.length; i++) {

        var _int = data[i];

        r.push([
            (0xFFFE0000 & _int) >> 17, // elevation
            (0x1FC00 & _int) >> 10, // slope
            (0x1FF & _int) // aspect
        ]);
    }
    return r;
}

function toBits(num, bitCount) {
  var bits = num.toString(2).split('').map(function(a) { return parseInt(a) });
  
  if (bits.length < bitCount) {
    var zeros = new Array(bitCount-bits.length+1).join('0').split('').map(parseFloat);
    bits = zeros.concat(bits);
  }
  
  return bits;
}
function bitsToInt(bits) {
  
  if (bits.length < 32) {
    var zeros = new Array(32-bits.length+1).join('0').split('').map(parseFloat);
    bits = zeros.concat(bits);
  }
  
  // convert to int
  return parseInt(bits.join(''), 2);
}
function intToRgba(_int) {
   return [
        _int & 0xFF,
        _int >> 8 & 0xFF,
        _int >> 16 & 0xFF,
        _int >> 24 & 0xFF,
    ];
}

function raster2dem(data, zFactor, converted, latitude) {

    var values = [];
    var _data = new Uint32Array(data);
    for (var i=0; i<  _data.length; i++) {
        var _int = _data[i];
        //var rgba = intToRgba(_int);

        // var red = (_int >> 16) & 0xFF;
        // var green = (_int >> 8) & 0xFF;
        // var blue = _int & 0xFF;

        var red = _int & 0xFF;
        var green = _int >> 8 & 0xFF;
        var blue = _int >> 16 & 0xFF;
        var alpha = _int >> 24 & 0xFF;

        var elevation = (red * 11) + (green * 11) + (blue * 12) + alpha;

        //console.log(elevation);

        //console.log("RGB: " + red + ", " + green + ", " + blue);

        // var thousands = red * 50;
        // var remainder = Math.round(green + blue);
        // var elevation = (thousands + remainder);
        //return thousands + remainder;
        //console.log("ELEV: " + (thousands + remainder));
        //values[i] = (0xFFFE0000 & _int) >> 17; // 24
        values[i] = elevation;

  //       var thousands = rgb[0] * 50;
  // var remainder = Math.round(rgb[1] + rgb[2]);
  
  // // do we know the difference?
  // //if (rgb[3] != 0) console.log(remainder + "; A: " + (rgb[3]))
  
  // return thousands + remainder;
    }
    //return;

    // var values = []; //new Uint16Array(256 * 256);
    // var _data = new Uint32Array(data);
    // for (var i=0; i < _data.length; i++) { //_data.length
    //     var elev = _data[i];
    //     //var rgba = intToRgba(elev);
    //     //data[j] + data[j + 1] * 2 + data[j + 2] * 3;

    //     //console.log(rgba);

    //     //elev = rgba[0] + rgba[1] * 2 + rgba[2] * 3;
    //     //console.log(elev);

    //     //elevationValues[i] = elev;// / 1000;
    //     //console.log(elev / 1000);
    //     // var _bits = toBits(elev);
    //     // var new_elevation = bitsToInt(_bits.slice(0,24));
    //     //console.log(rgba);
    //     values[i] = elev;
    //     //elevationValues[i] = 1000;
    // }
    //return;

    // var values = [];
    // var _data = new Uint8ClampedArray(data);
    // var count = 0;
    // var _bits = [];
    // for (var i=0; i< _data.length; i++) { //_data.length
    //     if (count < 3) _bits = toBits(_data[i], 8).concat(_bits);
    //     count++;
    //     if (count == 4) {
    //         var elev = bitsToInt(_bits) / 1;
    //         values.push(elev);
    //         count = 0;  
    //         _bits = [];
    //     }
    // }

    var r = [];
    for (var i = 0; i < values.length; i++) {

        // A B C
        // D E F
        // G H I

        var _a = values[i - 257];
        var _b = values[i - 256];
        var _c = values[i - 255];
        var _d = values[i - 1];
        // E (current cell)
        var _f = values[i + 1];
        var _g = values[i + 255];
        var _h = values[i + 256];
        var _i = values[i + 257];

        var dx = ((_c + 2 * _f + _i) - (_a + 2 * _d + _g)) / 8;
        var dy = ((_g + 2 * _h + _i) - (_a + 2 * _b + _c)) / 8;

        var slope = (180/Math.PI) * Math.atan(zFactor * Math.sqrt((dx * dx) + (dy * dy)));
        slope = Math.round(slope);

        var aspect = (180/Math.PI) * Math.atan2(dy, -dx);
        if (aspect < 0) aspect = 90 - aspect;
        else if (aspect > 90) aspect = 360 - aspect + 90;
        else aspect = 90 - aspect;
        aspect = Math.round(aspect);

        r[i] = [ 
            Math.round(values[i]), 
            slope, 
            aspect
        ];
    }
    return r;
}

function _hillshade(dem, altitude, azimuth, shadows, highlights) {

    var px = new Uint8ClampedArray(256 * 256 * 4),

        a = - azimuth - Math.PI / 2,
        z = Math.PI / 2 - altitude,

        cosZ = Math.cos(z),
        sinZ = Math.sin(z),
        neutral = cosZ,

        x, y, i, hillshade, alpha;


    for (x = 0; x < 256; x++) {
        for (y = 0; y < 256; y++) {

            // pad dem borders
            // var i = ((y === 0 ? 1 : y === 255 ? 254 : y) * 256 +
            //      (x === 0 ? 1 : x === 255 ? 254 : x)) * 1;
            var i = y * 256 + x;

            if (dem[i] == null) continue;

            var sl  = dem[i][1]; // slope
            var asp = dem[i][2]; // aspect

            if (sl == null) continue;
            var newColor = slopeColorMap[sl];

            // if (asp == null) continue;
            // var newColor = aspectColorMap[asp];

            if (!newColor) continue;
            i = i * 4;

            px[i] = newColor[0];
            px[i + 1] = newColor[1];
            px[i + 2] = newColor[2];
            px[i + 3] = 255;

            // if (!sl) continue;

            // hillshade = cosZ * Math.cos(sl) + sinZ * Math.sin(sl) * Math.cos(a - asp);

            // if (hillshade < 0) {
            //     hillshade /= 2;
            // }

            // alpha = neutral - hillshade;

            // i = (y * 256 + x) * 4;

            // if (neutral > hillshade) { // shadows
            //     px[i]     = 20;
            //     px[i + 1] = 0;
            //     px[i + 2] = 30;
            //     px[i + 3] = Math.round(255 * alpha * shadows);

            // } else { // highlights
            //     alpha = Math.min(-alpha * cosZ * highlights / (1 - hillshade), highlights);
            //     px[i]     = 255;
            //     px[i + 1] = 255;
            //     px[i + 2] = 230;
            //     px[i + 3] = Math.round(255 * alpha);
            // }
        }
    }

    return px;
}

function hillshade(dem) {

    var altitude = 70 * (Math.PI / 180);
    var azimuth = 0 * (Math.PI / 180);
    var shadows = .7; // .45
    var highlights = .2; // .45

    var px = new Uint8ClampedArray(256 * 256 * 4),

        a = - azimuth - Math.PI / 2,
        z = Math.PI / 2 - altitude,

        cosZ = Math.cos(z),
        sinZ = Math.sin(z),
        neutral = cosZ,

        x, y, i, hillshade, alpha;


    for (x = 0; x < 256; x++) {
        for (y = 0; y < 256; y++) {

            // pad dem borders
            // var i = ((y === 0 ? 1 : y === 255 ? 254 : y) * 256 +
            //      (x === 0 ? 1 : x === 255 ? 254 : x)) * 1;
            var i = y * 256 + x;

            if (dem[i] == null) continue;

            var sl  = (dem[i][1] * (Math.PI / 180)) * 1.9;
            var asp = (dem[i][2] * (Math.PI / 180)) * 1.9;

            if (sl == null) continue;

            hillshade = cosZ * Math.cos(sl) + sinZ * Math.sin(sl) * Math.cos(a - asp);

            if (hillshade < 0) hillshade /= 2;

            alpha = neutral - hillshade;

            i = (y * 256 + x) * 4;

            if (neutral > hillshade) { // shadows
                px[i]     = 20;
                px[i + 1] = 0;
                px[i + 2] = 30;
                px[i + 3] = Math.round(255 * alpha * shadows);

            } else { // highlights
                alpha = Math.min(-alpha * cosZ * highlights / (1 - hillshade), highlights);
                px[i]     = 255;
                px[i + 1] = 255;
                px[i + 2] = 230;
                px[i + 3] = Math.round(255 * alpha);
            }

            //console.log(neutral + " / " + hillshade + " / " + px[i + 3]);
        }
    }

    return px;
}

function blendRGBColors(c0, c1, p) {
    return [Math.round(Math.round(c1[0] - c0[0]) * (p / 100)) + c0[0],
            Math.round(Math.round(c1[1] - c0[1]) * (p / 100)) + c0[1],
            Math.round(Math.round(c1[2] - c0[2]) * (p / 100)) + c0[2]
        ];
}
function blendHexColors(c0, c1, p) {
    c0 = hexToRGB(c0);
    c1 = hexToRGB(c1);
    return blendRGBColors(c0, c1, p);
}
function hexToRGB(hex) {
    return [
        parseInt(hex.substring(0,2),16),
        parseInt(hex.substring(2,4),16),
        parseInt(hex.substring(4,6),16)
    ];
}

function getPercent(min, max, val) {
    return Math.floor(((val - min) * 100) / (max - min));
}

function getColorMap(steps){
    var colorMap = [];
    //var maxValue = steps[steps-1].val;
    //var increment = parseInt(maxValue / steps.length);

    for (var s = 0; s < steps.length; s++) {
        if (s == steps.length - 1) break;
        var min = steps[s].val;
        var max = steps[s+1].val;

        var minColor = steps[s].color;
        var maxColor = steps[s+1].color;

        for (var i = min; i <= max; i++)
            colorMap[i] = blendHexColors(minColor,maxColor, getPercent(min, max, i));
    }
    return colorMap;
}


    var elevationColorMap = getColorMap([
        { color: "fd4bfb", val: 0 },
        { color: "b04bfd", val: 500 },
        { color: "1739fb", val: 1000 },
        { color: "00aeff", val: 1500 },
        { color: "2bf8fb", val: 2000 },
        { color: "28f937", val: 2500 },
        { color: "fefa37", val: 3000 },
        { color: "e6000b", val: 3500 },
        { color: "fd912f", val: 4000 },
        { color: "910209", val: 4500 },
        { color: "6a450c", val: 5000 },
        { color: "8b8b8b", val: 5800 },
        { color: "ffffff", val: 7000 }
        // if we ever build tiles for elevations higher than 7000m, this needs to be changed
    ]);

    var slopeColorMap = getColorMap([
        { color: "ffffff", val: 0 },
        { color: "00f61c", val: 6 },
        { color: "02fbd2", val: 11 },
        { color: "01c6f6", val: 17 },
        { color: "3765f9", val: 22 },
        { color: "9615f8", val: 27 },
        { color: "eb02d0", val: 31 },
        { color: "fb1978", val: 35 },
        { color: "ff5c17", val: 39 },
        { color: "f9c304", val: 42 },
        { color: "fefe2b", val: 45 },
        { color: "000000", val: 80 },
    ]);

    var aspectColorMap = getColorMap([
        { color: "c0fc33", val: 0 },
        { color: "3bc93d", val: 22 },
        { color: "3cca99", val: 67 },
        { color: "1b29e1", val: 112 },
        { color: "7e3ac8", val: 157 },
        { color: "fb0b1a", val: 202 },
        { color: "fc9325", val: 247 },
        { color: "fefc37", val: 292 },
        { color: "c0fc33", val: 338 },
        { color: "c0fc33", val: 360 },
    ]);

    // Bruce Tremper
    
    var steepnessColorMap = getColorMap([
        { color: "00ff00", val: 0 },
        { color: "00ff00", val: 20 },
        { color: "ffff00", val: 30 },
        //{ color: "1b29e1", val: 34 },
        { color: "ff0000", val: 42 },
        { color: "ffff00", val: 70 },
    ]);
    // if (new_slope > 20 && new_slope <= 30) {
    //     newColor = [0,255,0,255]; // green
    // }
    // else if (new_slope > 30 && new_slope <= 34) {
    //     newColor = [255,255,0,255]; // yellow
    // }
    // else if (new_slope > 34 && new_slope <= 45) {
    //     newColor = [255,0,0,255]; // red
    // }
    // else if (new_slope > 45) {
    //     newColor = [255,255,0,255]; // yellow
    // }


function render(data, processType, customParams) {

    var new_pixels = new Uint8ClampedArray(256 * 256 * 4);

    // AVY FORECAST ROSE
    if (processType == "avy-rose") {

        // avy colors
        var avyColors = {
            G: "50b848",
            Y: "fff200",
            O: "f7941e",
            R: "ff0000"
        }

        var forecast = [
            { elevMin: 0, elevMax: 8000,
              N: 'G', NE: 'G', E: 'Y', SE: 'Y', S: 'Y',  SW: 'Y', W: 'Y', NW: 'G'
            },
            { elevMin: 8001, elevMax: 9500,
              N: 'G', NE: 'G', E: 'O', SE: 'O', S: 'O',  SW: 'O', W: 'O', NW: 'G'
            },
            { elevMin: 9501, elevMax: 14000,
              N: 'G', NE: 'G', E: 'O', SE: 'O', S: 'R',  SW: 'R', W: 'O', NW: 'G'
            }
        ];

        for (var l = 0; l < forecast.length; l++) {
            var f = forecast[l];
            f.colorMap = getColorMap([
                { color: avyColors[f.N], val: 0 },
                { color: avyColors[f.NE], val: 22 },
                { color: avyColors[f.E], val: 67 },
                { color: avyColors[f.SE], val: 112 },
                { color: avyColors[f.S], val: 157 },
                { color: avyColors[f.SW], val: 202 },
                { color: avyColors[f.W], val: 247 },
                { color: avyColors[f.NW], val: 292 },
                { color: avyColors[f.N], val: 338 },
                { color: avyColors[f.N], val: 360 },
            ]);
        }
    }

    for (var i=0; i < data.length; i++) {

        var new_elevation = data[i][0];
        var new_slope = data[i][1];
        var new_aspect = data[i][2];

        var newColor = [];

        // if no data, return transparent
        if (new_elevation==127 && new_slope==127 && new_aspect ==511) { newColor = [0,0,0,0]; continue; }


        // CUSTOM
        if (processType == "custom") {

            var showAspect = false;
            if (customParams.aspect_low == 0 && customParams.aspect_high == 359) 
                showAspect = true;
            else {
                if (customParams.aspect_low > customParams.aspect_high) {
                    if (new_aspect >= customParams.aspect_low ||
                        new_aspect <= customParams.aspect_high ) showAspect = true;
                }
                else if (new_aspect >= customParams.aspect_low &&
                        new_aspect <= customParams.aspect_high ) showAspect = true;
            }

            var showElevation = (new_elevation >= customParams.elev_low && new_elevation <= customParams.elev_high);

            var showSlope = (new_slope >= customParams.slope_low && new_slope <= customParams.slope_high);

            if (showAspect && showElevation && showSlope) newColor = hexToRGB(customParams.color);
        }

        // ELEVATION
        if (processType == "elevation") {

            // contour lines
            // if (new_elevation % 100 < 22) newColor = [255,0,0];
            // newColor[3] = Math.round((22 - (new_elevation % 100)) * 12.75);
            // if (newColor.length > 0 && new_slope < 9) newColor[3] = 0;

            if (new_elevation > 0 && new_elevation > 0) {
                newColor = elevationColorMap[new_elevation];
            }
        }

        // SLOPE MAP
        if (processType == "slope") {

            // if (new_slope > 20 && new_slope <= 80) {
            //     newColor = steepnessColorMap[new_slope];
            // }

            
            if (new_slope > 0 && new_slope <= 80) {
                //if (new_aspect > 0 && new_aspect < 90)
                newColor = slopeColorMap[new_slope];
            }




            // if (new_slope > 20 && new_slope <= 30) {
            //     newColor = [0,255,0,255]; // green
            // }
            // else if (new_slope > 30 && new_slope <= 34) {
            //     newColor = [255,255,0,255]; // yellow
            // }
            // else if (new_slope > 34 && new_slope <= 45) {
            //     newColor = [255,0,0,255]; // red
            // }
            // else if (new_slope > 45) {
            //     newColor = [255,255,0,255]; // yellow
            // }

        }

        // AVY ROSE MAP
        if (processType == "avy-rose") {

            if (new_aspect >= 0 && new_aspect <= 360 && new_elevation > 0) {
            //if (false) {

                var a = new_aspect;
                if (a == 0) a = 360;
                var elevFeet = new_elevation * 3.28084;

                for (var l = 0; l < forecast.length; l++) {
                    var f = forecast[l];
                    if (elevFeet > f.elevMin && elevFeet < f.elevMax) 
                        newColor = f.colorMap[a];
                    else continue;
                }

                //var min = 1300; var max = 4000;
                //var min = 0; var max = 90;
                // var min = 0; var max = 360;
                //var p = Math.round(((new_slope - min) * 100) / (max - min));

                //var newColor = blendRGBColors([0,0,255],[255,0,0], p);

                // if (new_aspect >= 0 && new_aspect < 90) {
                //     newColor = [255,0,0];
                // }
                // else if (new_aspect > 90 && new_aspect < 180) {
                //     newColor = [0,255,0];
                // }
                // else if (new_aspect > 180 && new_aspect < 270) {
                //     newColor = [0,0,255];
                // }
                // else if (new_aspect > 270 && new_aspect < 360) {
                //     newColor = [255,255,0];
                // }
            }    
        }


        // ASPECT MAP
        if (processType == "aspect") {

            if (new_aspect > 0 && new_aspect <= 360) {
                newColor = aspectColorMap[new_aspect];
            }

            // lower opacity for flatest slopes
            // var opacity = 255;
            // if (new_slope < 5) {
            //     opacity = (new_slope * 20) * 255;
            // }
            // newColor[3] = opacity;

        }


        // MKS (aspect-slope)
        // http://blogs.esri.com/esri/arcgis/2008/05/23/aspect-slope-map/
        if (processType == "mks") {

            // if (new_slope > 0 && new_slope <= 80) {
            //     newColor = slopeColorMap[new_slope];
            // }
            var num = 0;

            if (new_slope >= 40) num = 40;
            else if (new_slope >= 20) num = 30;
            else if (new_slope >= 5) num = 20;
            else if (new_slope >= 0) num = 10;

            if (new_aspect >= 0 && new_aspect <= 22.5) num+= 1;
            else if (new_aspect > 22.5 && new_aspect <= 67.5) num+= 2;
            else if (new_aspect > 67.5 && new_aspect <= 112.5) num+= 3;
            else if (new_aspect > 112.5 && new_aspect <= 157.5) num+= 4;
            else if (new_aspect > 157.5 && new_aspect <= 202.5) num+= 5;
            else if (new_aspect > 202.5 && new_aspect <= 247.5) num+= 6;
            else if (new_aspect > 247.5 && new_aspect <= 292.5) num+= 7;
            else if (new_aspect > 292.5 && new_aspect <= 337.5) num+= 8;
            else if (new_aspect > 337.5 && new_aspect <= 360) num+= 1;

            // var classNum = 0;
            // if (num <= 20) classNum = 1;
            // else if (num == 21) classNum = 2;
            // else if (num == 22) classNum = 3;
            // else if (num == 23) classNum = 4;
            // else if (num == 24) classNum = 5;
            // else if (num == 25) classNum = 6;
            // else if (num == 26) classNum = 7;
            // else if (num == 27) classNum = 8;
            // else if (num == 28) classNum = 9;
            // else if (num == 31) classNum = 10;
            // else if (num == 32) classNum = 11;
            // else if (num == 33) classNum = 12;
            // else if (num == 34) classNum = 13;
            // else if (num == 35) classNum = 14;
            // else if (num == 36) classNum = 15;
            // else if (num == 37) classNum = 16;
            // else if (num == 38) classNum = 17;
            // else if (num == 41) classNum = 18;
            // else if (num == 42) classNum = 19;
            // else if (num == 43) classNum = 20;
            // else if (num == 44) classNum = 21;
            // else if (num == 45) classNum = 22;
            // else if (num == 46) classNum = 23;
            // else if (num == 47) classNum = 24;
            // else if (num == 48) classNum = 25;

            if (num == 19) newColor = [153, 153, 153];
            if (num == 21) newColor = [147, 166, 89];
            if (num == 22) newColor = [102, 153, 102];
            if (num == 23) newColor = [102, 153, 136];
            if (num == 24) newColor = [89, 89, 166];
            if (num == 25) newColor = [128, 108, 147];
            if (num == 26) newColor = [166, 89, 89];
            if (num == 27) newColor = [166, 134, 89];
            if (num == 28) newColor = [166, 166, 89];
            if (num == 31) newColor = [172, 217, 38];
            if (num == 32) newColor = [77, 179, 77];
            if (num == 33) newColor = [73, 182, 146];
            if (num == 34) newColor = [51, 51, 204];
            if (num == 35) newColor = [128, 89, 166];
            if (num == 36) newColor = [217, 38, 38];
            if (num == 37) newColor = [217, 142, 38];
            if (num == 38) newColor = [217, 217, 38];
            if (num == 41) newColor = [191, 255, 0];
            if (num == 42) newColor = [51, 204, 51];
            if (num == 43) newColor = [51, 204, 153];
            if (num == 44) newColor = [26, 26, 230];
            if (num == 45) newColor = [128, 51, 204];
            if (num == 46) newColor = [255, 0, 0];
            if (num == 47) newColor = [255, 149, 0];
            if (num == 48) newColor = [255, 255, 0];

        }

        // -------------

        if (newColor && newColor.length == 3) newColor[3] = 255;

        if (newColor && newColor.length == 4) {
            var _i = i * 4;
            new_pixels[_i]   = newColor[0];
            new_pixels[_i+1] = newColor[1];
            new_pixels[_i+2] = newColor[2];
            new_pixels[_i+3] = newColor[3];
        }
    }
    return new_pixels;
}


// doesn't account for mountains blocking the sun!!!
function sunlight(data, altitude, azimuth) {

    var new_pixels = new Uint8ClampedArray(256 * 256 * 4);

    if (azimuth >= 360) azimuth = azimuth - 360.0;
    azimuth = azimuth * Math.PI/180.0;

    var z = (90 - altitude) * Math.PI/180.0;

    //var neutral = Math.cos(z);

    var sunColorMap = getColorMap([
        { color: "0000ff", val: 0 },
        { color: "ffff00", val: 30 },
        { color: "ff0000", val: 100 },
    ]);

    for(var i=0; i< data.length; i++) {

        var elevation = data[i][0];
        var slope = data[i][1];
        var aspect = data[i][2];

        var newColor;

        // if no data, return transparent
        if (elevation == 127 && slope == 127 && aspect == 511) { newColor = [0,0,0,0]; continue; }

        // convert degrees to radians
        slope = slope * (Math.PI/180);
        aspect = aspect * (Math.PI/180);

        var hillshade = Math.cos(z) * Math.cos(slope) + Math.sin(z) * Math.sin(slope) * Math.cos(azimuth - aspect);
        if (hillshade < 0) hillshade = 0;

        var min = 0; var max = 1;
        var p = Math.round(((hillshade - min) * 100) / (max - min));
        newColor = sunColorMap[p];

        // if (hillshade < neutral) newColor = [255,255,0]
        // else newColor = [0,0,255]

        var _i = i * 4;
        if (newColor) {
            new_pixels[_i]     = newColor[0];
            new_pixels[_i + 1] = newColor[1];
            new_pixels[_i + 2] = newColor[2];
            new_pixels[_i + 3] = 255;
        }
    }

    return new_pixels;
}