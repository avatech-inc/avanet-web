window.terrainVisualization = {

    hillshade: function(dem) {

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

                var i = y * 256 + x;

                if (dem[i] == null) continue;

                var sl  = (dem[i][1] * (Math.PI / 180)) * 1.9;
                var asp = (dem[i][2] * (Math.PI / 180)) * 1.9;

                if (sl == null) continue;

                hillshade = cosZ * Math.cos(sl) + sinZ * Math.sin(sl) * Math.cos(a - asp);
                if (hillshade < 0) hillshade /= 2;
                alpha = neutral - hillshade;

                i = (y * 256 + x) * 4;

                // shadows
                if (neutral > hillshade) { 
                    px[i]     = 20;
                    px[i + 1] = 0;
                    px[i + 2] = 30;
                    px[i + 3] = Math.round(255 * alpha * shadows);

                } 
                // highlights
                else { 
                    alpha = Math.min(-alpha * cosZ * highlights / (1 - hillshade), highlights);
                    px[i]     = 255;
                    px[i + 1] = 255;
                    px[i + 2] = 230;
                    px[i + 3] = Math.round(255 * alpha);
                }
            }
        }
        return px;
    },

    render: function(data, overlayType, customParams) {

        function convertInt(_int) {
            return [
                (0xFFFE0000 & _int) >> 17, // elevation
                (0x1FC00 & _int) >> 10, // slope
                (0x1FF & _int) // aspect
            ];
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
            { color: "1739fb", val: 380 * 2 },
            { color: "00aeff", val: 380 * 3 },
            { color: "28f937", val: 380 * 4 },
            { color: "fefa37", val: 380 * 7 },
            { color: "e6000b", val: 380 * 13 },
            { color: "910209", val: 380 * 14 },
            { color: "6a450c", val: 380 * 15 },
            { color: "8b8b8b", val: 380 * 16 },
            { color: "ffffff", val: 8400 },
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

        // Bruce Tremper's scale

        var steepnessColorMap = getColorMap([
            { color: "00ff00", val: 0 },
            { color: "00ff00", val: 20 },
            { color: "ffff00", val: 30 },
            //{ color: "1b29e1", val: 34 },
            { color: "ff0000", val: 42 },
            { color: "ffff00", val: 70 },
        ]);

        // ------------------------------------------------------------------------

        var new_pixels = new Uint8ClampedArray(256 * 256 * 4);

        for (var i=0; i < data.length; i++) {
            var terrain = convertInt(data[i]);

            var new_elevation = terrain[0];
            var new_slope = terrain[1];
            var new_aspect = terrain[2];

            var newColor = [];

            // if no data, return transparent
            if (new_elevation==127 && new_slope==127 && new_aspect ==511) { newColor = [0,0,0,0]; continue; }

            // CUSTOM
            if (overlayType == "custom") {

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
            if (overlayType == "elevation") {
                if (new_elevation > 0 && new_elevation > 0)
                    newColor = elevationColorMap[new_elevation];
            }

            // SLOPE
            if (overlayType == "slope") {
                if (new_slope > 0 && new_slope <= 80)
                    newColor = slopeColorMap[new_slope];
            }

            // ASPECT
            if (overlayType == "aspect") {
                if (new_aspect > 0 && new_aspect <= 360)
                    newColor = aspectColorMap[new_aspect];
            }

            // MKS (aspect-slope)
            // http://blogs.esri.com/esri/arcgis/2008/05/23/aspect-slope-map/
            if (overlayType == "mks") {
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

            // ------------------------------------------------------

            // if no alpha specified, default to fully opaque
            if (newColor && newColor.length == 3) newColor[3] = 255;

            // set pixels
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
}