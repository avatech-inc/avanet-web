//importScripts("zlib.js");
//importScripts("png.js");

self.dems = {};

onmessage = function (e) {
    if (e.data === 'clear') {
        self.dems = {};
        return;
    }

    // console.log("URL: " + e.data.url);
    // PNG.load(e.data.url, function(png) {
    //     var pixels = png.decodePixels();
    //     console.log("PIXELS: " + pixels.length);
        
    //     self.dems[e.data.id] = pixels;// raster2dem(raster, e.data.zFactor);

    //     var shaded = render(
    //         self.dems[e.data.id],
    //         e.data.altitude, 
    //         e.data.azimuth, 
    //         e.data.shadows, 
    //         e.data.highlights); 

    //     postMessage({
    //         id: e.data.id,
    //         shades: shaded.buffer
    //     }, [shaded.buffer]);
    // });

    if (e.data.raster) {
        self.dems[e.data.id] = convert(new Uint32Array(e.data.raster));
    }


    var processed;

    if (e.data.processType == "sun") {
        processed = sunlight(
            self.dems[e.data.id],
            e.data.altitude,
            e.data.azimuth
        );
    }
    else {
        processed = render(
            self.dems[e.data.id],
            e.data.processType,
            e.data.altitude); 
    }

    postMessage({
        id: e.data.id,
        shades: processed.buffer
    }, [processed.buffer]);
};

function convert(data) {
    var r = [];
    for (var i=0; i< data.length; i++) {

        var _int = data[i];

        r.push([
            (0xFFFE0000 & _int) >> 17,
            (0x1FC00 & _int) >> 10,
            (0x1FF & _int)
        ]);
    }
    return r;
}

// function raster2dem(data, zFactor) {

//     var values = new Uint16Array(256 * 256);
//     var dem = new Float32Array(256 * 256 * 2);

//     var x, y, dx, dy, i, j;

//     for (x = 0; x < 256; x++) {
//         for (y = 0; y < 256; y++) {
//             i = x + y * 256;
//             j = i * 4;
//             values[i] = data[j] + data[j + 1] * 2 + data[j + 2] * 3;
//         }
//     }

//     for (x = 1; x < 255; x++) {
//         for (y = 1; y < 255; y++) {

//             i = y * 256 + x;

//             dx = ((values[i - 255] + 2 * values[i + 1]   + values[i + 257]) -
//                   (values[i - 257] + 2 * values[i - 1]   + values[i + 255])) / 8;
//             dy = ((values[i + 255] + 2 * values[i + 256] + values[i + 257]) -
//                   (values[i - 257] + 2 * values[i - 256] + values[i - 255])) / 8;

//             j = (y * 256 + x) * 2;

//             // slope
//             dem[j] = Math.atan(zFactor * Math.sqrt(dx * dx + dy * dy));

//             // aspect
//             dem[j + 1] = dx !== 0 ? Math.atan2(dy, -dx) : Math.PI / 2 * (dy > 0 ? 1 : -1);

//             //console.log(dem[j]);
//         }
//     }

//     return dem;
// }

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
        { color: "1739fb", val: 1000 },
        { color: "2bf8fb", val: 2000 },
        { color: "28f937", val: 2400 },
        { color: "fefa37", val: 2800 },
        { color: "fd912f", val: 3200 },
        { color: "910209", val: 3600 }
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


function render(data, processType, alt) {

    var new_pixels = new Uint8ClampedArray(256 * 256 * 4);

    // AVY FORECAST ROSE
    if (processType == "avy-rose") {

        // avy colors
        var avyColors = {
            // G: hexToRGB("50b848"),
            // Y: hexToRGB("fff200"),
            // O: hexToRGB("f7941e"),
            // R: hexToRGB("ff0000")
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

    for(var i=0; i< data.length; i++) {

        var new_elevation = data[i][0];
        var new_slope = data[i][1];
        var new_aspect = data[i][2];

        var newColor = [];

        // ELEVATION
        if (processType == "elevation") {

            if (new_elevation > 0 && new_elevation > 0) { //alt

                newColor = elevationColorMap[new_elevation];
                // var min = alt; var max = 3400;
                // var p = Math.round(((new_elevation - min) * 100) / (max - min));

                // newColor = blendRGBColors([0,0,255],[255,0,0], p);
                //newColor[3] = Math.pow(p,3); //soften edges
                //newColor[3] = 255;
            }
        }

        // SLOPE MAP
        if (processType == "slope") {

            if (new_slope > 0 && new_slope <= 80) {
                newColor = slopeColorMap[new_slope];
            }

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

    var a = azimuth;
    if (a >= 360) a = a - 360.0;
    a = a * Math.PI/180.0;

    var z = (90 - altitude) * Math.PI/180.0;

    var neutral = Math.cos(z);
    console.log("NETURAL: " + neutral);

    var sunColorMap = getColorMap([
        { color: "0000ff", val: 0 },
        { color: "ffff00", val: 30 },
        { color: "ff0000", val: 100 },
    ]);

    // var sunColorMap = getColorMap([
    //     { color: "0000ff", val: 0 },
    //     { color: "0000ff", val: 35 },
    //     { color: "ffff00", val: 54 },
    //     { color: "ff0000", val: 100 },
    // ]);

    for(var i=0; i< data.length; i++) {

        //elevation = data[i][0];
        slope = data[i][1] * (Math.PI/180);
        aspect = data[i][2] * (Math.PI/180);

        if (!slope || aspect > 360) continue;

        var hillshade = Math.cos(z) * Math.cos(slope) + Math.sin(z) * Math.sin(slope) * Math.cos(a - aspect);
        if (hillshade < 0) hillshade = 0;

        var newColor;

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