
var UTMGridLayer = L.CanvasLayer.extend({
    drawUTMGrid: function(_map, ctx, bounds, southernHemi) {
        var zoom = _map.getZoom();
        // tick spacing (in meters)
        var div = 100000;

        if (zoom < 6) return;         
        else if (zoom == 6)  div = 100000 * 2;
        else if (zoom == 7) div = 100000;
        else if (zoom == 8) div = 100000;
        else if (zoom == 9) div = 100000;
        else if (zoom == 10) div = 100000 / 2;
        else if (zoom == 11) div = 100000 / 4;
        else if (zoom == 12) div = 100000 / 10;
        else if (zoom == 13) div = 100000 / 20;
        else if (zoom == 14) div = 100000 / 40;
        else if (zoom == 15) div = 100000 / 50;
        else if (zoom == 16) div = 100000 / 100; // 1km
        else if (zoom == 17) div = 100000 / 400;

        var zoneSW = Math.floor((bounds._southWest.lng + 180.0) / 6) + 1;
        var zoneNE = Math.floor((bounds._northEast.lng + 180.0) / 6) + 1;

        var latTop = Math.min(84, bounds._northEast.lat);
        var latBottom = Math.max(-80, bounds._southWest.lat);

        var UTM_SW = new Array(2);
        LatLonToUTMXY(DegToRad(latBottom), DegToRad(bounds._southWest.lng), zoneSW, UTM_SW);
        var UTM_NE = new Array(2);
        LatLonToUTMXY(DegToRad(latTop), DegToRad(bounds._northEast.lng), zoneNE, UTM_NE);

        var utmTop    = (parseInt(UTM_NE[1] / div) * div) + div;
        var utmBottom = (parseInt(UTM_SW[1] / div) * div) - div;

        if (bounds._southWest.lat < 0 && bounds._northEast.lat >= 0) {
            if (southernHemi) utmTop = 10000000;
            else utmBottom = 0;
        }

        for (var zone = zoneSW; zone <= zoneNE; zone++) {
            // get lng of zone
            var zoneBoundaryLngLeft = ((zone - 1) * 6) - 180;
            var zoneBoundaryLngRight = (zone * 6) - 180;
            // get zone boundaries
            var zonePointNE = _map.latLngToContainerPoint(new L.LatLng(bounds._northEast.lat, zoneBoundaryLngLeft));
            var zonePointSE = _map.latLngToContainerPoint(new L.LatLng(bounds._southWest.lat, zoneBoundaryLngLeft));

            var zonePointSW = _map.latLngToContainerPoint(new L.LatLng(bounds._southWest.lat, zoneBoundaryLngRight));
            var zonePointNW = _map.latLngToContainerPoint(new L.LatLng(bounds._northEast.lat, zoneBoundaryLngRight));

            // clip canvas to boundaries of zone
            if (zoneNE != zoneSW) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(zonePointNE.x, zonePointNE.y);
                ctx.lineTo(zonePointSW.x, zonePointNE.y);
                ctx.lineTo(zonePointSW.x, zonePointSW.y);
                ctx.lineTo(zonePointNE.x, zonePointSW.y);
                ctx.closePath();
                ctx.clip();
            }

            // var UTM_left = new Array(2);
            // LatLonToUTMXY(DegToRad(bounds._southWest.lat), DegToRad(zoneBoundaryLngLeft), zone, UTM_left);
            // var UTM_right = new Array(2);
            // LatLonToUTMXY(DegToRad(bounds._northEast.lat), DegToRad(zoneBoundaryLngRight), zone, UTM_right);
            // var utmLeft = (parseInt(UTM_left[0] / div) * div) - (div * 2);
            // var utmRight = (parseInt(UTM_right[0] / div) * div) + (div * 2);

            // min and max easting as per https://www.maptools.com/tutorials/utm/details
            var utmLeft  = 100000;
            var utmRight = 900000;

            console.log("LEFT: " + utmLeft + "," + utmRight);

            // set line style
            ctx.strokeStyle = "rgba(0,0,0,.9)";
            ctx.lineWidth = .8;

            // horizontal lines
            for (var n = utmBottom; n <= utmTop; n += div) {
                var previousPoint = null;
                for (var e = utmLeft; e <= utmRight; e += div) {
                    ctx.beginPath();

                    // convert back to lat lng
                    var latlng = new Array(2);
                    UTMXYToLatLon(e, n, zone, southernHemi, latlng);

                    // get container point
                    var canvasPoint = _map.latLngToContainerPoint(new L.LatLng(RadToDeg(latlng[0]), RadToDeg(latlng[1])));

                    if (previousPoint) {
                        var previousPointLatLng = _map.containerPointToLatLng(previousPoint);
                        var canvasPointLatLng = _map.containerPointToLatLng(canvasPoint);

                        var gc = new arc.GreatCircle(
                            { x: canvasPointLatLng.lng, y: canvasPointLatLng.lat  },
                            { x: previousPointLatLng.lng, y: previousPointLatLng.lat });

                        var coords = gc.Arc(10).geometries[0].coords;
                        if (coords && coords.length) {
                            for (var c = 0; c < coords.length; c++) {
                                var mapPoint = _map.latLngToContainerPoint(new L.LatLng(coords[c][1], coords[c][0]));
                                ctx.lineTo(mapPoint.x, mapPoint.y);
                            }
                        }
                    }
                    else ctx.moveTo(canvasPoint.x, canvasPoint.y);

                    previousPoint = canvasPoint;
                    ctx.stroke();
                }
            }

            // vertical lines
            for (var e = utmLeft; e <= utmRight; e += div) {
                var previousPoint = null;
                for (var n = utmBottom; n <= utmTop; n += div) {
                    ctx.beginPath();

                    // convert back to lat lng
                    var latlng = new Array(2);
                    UTMXYToLatLon(e, n, zone, southernHemi, latlng);

                    // get container point
                    var canvasPoint = _map.latLngToContainerPoint(new L.LatLng(RadToDeg(latlng[0]), RadToDeg(latlng[1])));

                    if (previousPoint) {
                        var previousPointLatLng = _map.containerPointToLatLng(previousPoint);
                        var canvasPointLatLng = _map.containerPointToLatLng(canvasPoint);

                        var gc = new arc.GreatCircle(
                            { x: canvasPointLatLng.lng, y: canvasPointLatLng.lat  },
                            { x: previousPointLatLng.lng, y: previousPointLatLng.lat });

                        var coords = gc.Arc(5).geometries[0].coords;
                        if (coords && coords.length) {
                            for (var c = 0; c < coords.length; c++) {
                                var mapPoint = _map.latLngToContainerPoint(new L.LatLng(coords[c][1], coords[c][0]));
                                ctx.lineTo(mapPoint.x, mapPoint.y);
                            }
                        }
                    }
                    else ctx.moveTo(canvasPoint.x, canvasPoint.y);

                    previousPoint = canvasPoint;
                    ctx.stroke();
                }
            }

            // restore clipped zone
            if (zoneNE != zoneSW) ctx.restore();
        }
      },
      render: function() {
        var canvas = this.getCanvas();
        var ctx = canvas.getContext('2d');
        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // get map bounds
        var bounds = this._map.getBounds();

        // set line style
        ctx.strokeStyle = 'rgba(255, 60, 60, 0.9)';
        ctx.lineWidth = .8;

        ctx.beginPath();
        // draw UTM zones
        // every 6 degress longitude between -180 and 180
        for (var i = 0; i <= 60; i++) {
            var zoneBoundaryLng = (i * 6) - 180;

            if (zoneBoundaryLng < bounds._southWest.lng || zoneBoundaryLng > bounds._northEast.lng) continue;

            var latTop = bounds._northEast.lat;
            if (latTop > 84) latTop = 84;

            var latBottom = Math.max(-80, bounds._southWest.lat);
            //if (latBottom < -80) latBottom = -80;

            var pixelTop = this._map.latLngToContainerPoint(new L.LatLng(latTop, zoneBoundaryLng));
            var pixelBottom = this._map.latLngToContainerPoint(new L.LatLng(latBottom, zoneBoundaryLng));

            ctx.moveTo(pixelTop.x ,pixelTop.y);
            ctx.lineTo(pixelBottom.x, pixelBottom.y);
        }
        ctx.stroke();

        ctx.beginPath();
        // set line style
        ctx.strokeStyle = 'rgba(255, 60, 60, 0.4)';
        // latitude bands
        // every 8 degress latitude between -84 and 80
        //(-80<=lat&&lat<=84) ? "CDEFGHJKLMNPQRSTUVWXX".charAt(Math.floor((lat+80)/8)) : ""; 
        for (var i = 0; i < 21; i++) {
            var bandDegrees = 8;
            var bandBoundaryLat = (i * bandDegrees) - 80;

            // northernmost band is 12 degrees tall
            if (i == 20) bandBoundaryLat +=4;

            var lngLeft = bounds._southWest.lng;
            if (lngLeft < -180) lngLeft = -180;

            var lngRight = bounds._northEast.lng;
            if (lngRight > 180) lngRight = 180;

            var pixelLeft = this._map.latLngToContainerPoint(new L.LatLng(bandBoundaryLat, lngLeft));
            var pixelRight = this._map.latLngToContainerPoint(new L.LatLng(bandBoundaryLat, lngRight));
            
            ctx.moveTo(pixelLeft.x ,pixelLeft.y);
            ctx.lineTo(pixelRight.x, pixelRight.y);
        }
        ctx.stroke();

        // draw UTM grid
        if (bounds._southWest.lat < 0 && bounds._northEast.lat > 0) {
            this.drawUTMGrid(this._map, ctx, bounds, false);
            this.drawUTMGrid(this._map, ctx, bounds, true);
        }
        else if (bounds._southWest.lat < 0) {
            this.drawUTMGrid(this._map, ctx, bounds, true);
        }
        else if (bounds._southWest.lat >=0) {
            this.drawUTMGrid(this._map, ctx, bounds, false);
        }
        //this.redraw();
      }
    });

//////////////////////////////

// function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
//     // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
//     var denominator, a, b, numerator1, numerator2, result = {
//         x: null,
//         y: null,
//         onLine1: false,
//         onLine2: false
//     };
//     denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
//     if (denominator == 0) {
//         return result;
//     }
//     a = line1StartY - line2StartY;
//     b = line1StartX - line2StartX;
//     numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
//     numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
//     a = numerator1 / denominator;
//     b = numerator2 / denominator;

//     // if we cast these lines infinitely in both directions, they intersect here:
//     result.x = line1StartX + (a * (line1EndX - line1StartX));
//     result.y = line1StartY + (a * (line1EndY - line1StartY));
// /*
//         // it is worth noting that this should be the same as:
//         x = line2StartX + (b * (line2EndX - line2StartX));
//         y = line2StartX + (b * (line2EndY - line2StartY));
//         */
//     // if line1 is a segment and line2 is infinite, they intersect if:
//     if (a > 0 && a < 1) {
//         result.onLine1 = true;
//     }
//     // if line2 is a segment and line1 is infinite, they intersect if:
//     if (b > 0 && b < 1) {
//         result.onLine2 = true;
//     }
//     // if line1 and line2 are segments, they intersect if both of the above are true
//     return result;
// };

/*
 * L.Grid displays a grid of lat/lng lines on the map.
 */

L.Grid = L.LayerGroup.extend({
    options: {
        xticks: 8,
        yticks: 5,

        // 'decimal' or one of the templates below
        coordStyle: 'MinDec',
        coordTemplates: {
            'MinDec': '{degAbs}&deg;&nbsp;{minDec}\'{dir}',
            'DMS': '{degAbs}{dir}{min}\'{sec}"'
        },

        // Path style for the grid lines
        lineStyle: {
            stroke: true,
            color: '#111',
            opacity: 0.5,
            weight: 1
        },
        
        // Redraw on move or moveend
        redraw: 'move'
    },

    initialize: function (options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);

    },

    onAdd: function (map) {
        this._map = map;

        var grid = this.redraw();
        this._map.on('viewreset '+ this.options.redraw, function () {
            grid.redraw();
        });

        this.eachLayer(map.addLayer, map);
    },
    
    onRemove: function (map) {
        // remove layer listeners and elements
        map.off('viewreset '+ this.options.redraw, this.map);
        this.eachLayer(this.removeLayer, this);
    },

    redraw: function () {
        // pad the bounds to make sure we draw the lines a little longer
        this._bounds = this._map.getBounds().pad(2); // 0.5

        var grid = [];
        var i;

        var latLines = this._latLines();
        for (i in latLines) {
            if (Math.abs(latLines[i]) > 90) {
                continue;
            }
            grid.push(this._horizontalLine(latLines[i]));
            grid.push(this._label('lat', latLines[i]));
        }

        var lngLines = this._lngLines();
        for (i in lngLines) {
            grid.push(this._verticalLine(lngLines[i]));
            grid.push(this._label('lng', lngLines[i]));
        }

        this.eachLayer(this.removeLayer, this);

        for (i in grid) {
            this.addLayer(grid[i]);
        }
        return this;
    },

    _latLines: function () {
        return this._lines(
            this._bounds.getSouth(),
            this._bounds.getNorth(),
            this.options.yticks * 2,
            this._containsEquator()
        );
    },
    _lngLines: function () {
        return this._lines(
            this._bounds.getWest(),
            this._bounds.getEast(),
            this.options.xticks * 2,
            this._containsIRM()
        );
    },

    _lines: function (low, high, ticks, containsZero) {
        var delta = low - high;
        var tick = this._round(delta / ticks, delta);

        if (containsZero) {
            low = Math.floor(low / tick) * tick;
        } else {
            low = this._snap(low, tick);
        }

        var lines = [];
        for (var i = -1; i <= ticks; i++) {
            lines.push(low - (i * tick));
        }
        return lines;
    },

    _containsEquator: function () {
        var bounds = this._map.getBounds();
        return bounds.getSouth() < 0 && bounds.getNorth() > 0;
    },

    _containsIRM: function () {
        var bounds = this._map.getBounds();
        return bounds.getWest() < 0 && bounds.getEast() > 0;
    },

    _verticalLine: function (lng) {
        return new L.Polyline([
            [this._bounds.getNorth(), lng],
            [this._bounds.getSouth(), lng]
        ], this.options.lineStyle);
    },
    _horizontalLine: function (lat) {
        return new L.Polyline([
            [lat, this._bounds.getWest()],
            [lat, this._bounds.getEast()]
        ], this.options.lineStyle);
    },

    _snap: function (num, gridSize) {
        return Math.floor(num / gridSize) * gridSize;
    },

    _round: function (num, delta) {
        var ret;

        delta = Math.abs(delta);
        if (delta >= 1) {
            if (Math.abs(num) > 1) {
                ret = Math.round(num);
            } else {
                ret = (num < 0) ? Math.floor(num) : Math.ceil(num);
            }
        } else {
            var dms = this._dec2dms(delta);
            if (dms.min >= 1) {
                ret = Math.ceil(dms.min) * 60;
            } else {
                ret = Math.ceil(dms.minDec * 60);
            }
        }

        return ret;
    },

    _label: function (axis, num) {
        var latlng;
        var bounds = this._map.getBounds().pad(-0.005);

        if (axis == 'lng') {
            latlng = L.latLng(bounds.getNorth(), num);
        } else {
            latlng = L.latLng(num, bounds.getWest());
        }

        return L.marker(latlng, {
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-grid-label',
                html: '<div class="' + axis + '">' + this.formatCoord(num, axis) + '</div>'
            })
        });
    },

    _dec2dms: function (num) {
        var deg = Math.floor(num);
        var min = ((num - deg) * 60);
        var sec = Math.floor((min - Math.floor(min)) * 60);
        return {
            deg: deg,
            degAbs: Math.abs(deg),
            min: Math.floor(min),
            minDec: min,
            sec: sec
        };
    },

    formatCoord: function (num, axis, style) {
        if (!style) {
            style = this.options.coordStyle;
        }
        if (style == 'decimal') {
            var digits;
            if (num >= 10) {
                digits = 2;
            } else if (num >= 1) {
                digits = 3;
            } else {
                digits = 4;
            }
            return num.toFixed(digits);
        } else {
            // Calculate some values to allow flexible templating
            var dms = this._dec2dms(num);

            var dir;
            if (dms.deg === 0) {
                dir = '&nbsp;';
            } else {
                if (axis == 'lat') {
                    dir = (dms.deg > 0 ? 'N' : 'S');
                } else {
                    dir = (dms.deg > 0 ? 'E' : 'W');
                }
            }

            return L.Util.template(
                this.options.coordTemplates[style],
                L.Util.extend(dms, {
                    dir: dir,
                    minDec: Math.round(dms.minDec, 2)
                })
            );
        }
    }

});

L.grid = function (options) {
    return new L.Grid(options);
};




///////////////////////////////////////////////////////////////////////////////

var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

var Coord = function(lon,lat) {
    this.lon = lon;
    this.lat = lat;
    this.x = D2R * lon;
    this.y = D2R * lat;
};

Coord.prototype.view = function() {
    return String(this.lon).slice(0, 4) + ',' + String(this.lat).slice(0, 4);
};

Coord.prototype.antipode = function() {
    var anti_lat = -1 * this.lat;
    var anti_lon = (this.lon < 0) ? 180 + this.lon : (180 - this.lon) * -1;
    return new Coord(anti_lon, anti_lat);
};

var LineString = function() {
    this.coords = [];
    this.length = 0;
};

LineString.prototype.move_to = function(coord) {
    this.length++;
    this.coords.push(coord);
};

var Arc = function(properties) {
    this.properties = properties || {};
    this.geometries = [];
};

Arc.prototype.json = function() {
    if (this.geometries.length <= 0) {
        return {'geometry': { 'type': 'LineString', 'coordinates': null },
                'type': 'Feature', 'properties': this.properties
               };
    } else if (this.geometries.length == 1) {
        return {'geometry': { 'type': 'LineString', 'coordinates': this.geometries[0].coords },
                'type': 'Feature', 'properties': this.properties
               };
    } else {
        var multiline = [];
        for (var i = 0; i < this.geometries.length; i++) {
            multiline.push(this.geometries[i].coords);
        }
        return {'geometry': { 'type': 'MultiLineString', 'coordinates': multiline },
                'type': 'Feature', 'properties': this.properties
               };
    }
};

var GreatCircle = function(start,end,properties) {
    if (!start || start.x === undefined || start.y === undefined) {
        throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
    }
    if (!end || end.x === undefined || end.y === undefined) {
        throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
    }
    this.start = new Coord(start.x,start.y);
    this.end = new Coord(end.x,end.y);
    this.properties = properties || {};

    var w = this.start.x - this.end.x;
    var h = this.start.y - this.end.y;
    var z = Math.pow(Math.sin(h / 2.0), 2) +
                Math.cos(this.start.y) *
                   Math.cos(this.end.y) *
                     Math.pow(Math.sin(w / 2.0), 2);
    this.g = 2.0 * Math.asin(Math.sqrt(z));

    if (this.g == Math.PI) {
        throw new Error('it appears ' + start.view() + ' and ' + end.view() + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");
    } else if (isNaN(this.g)) {
        throw new Error('could not calculate great circle between ' + start + ' and ' + end);
    }
};

/*
 * http://williams.best.vwh.net/avform.htm#Intermediate
 */
GreatCircle.prototype.interpolate = function(f) {
    var A = Math.sin((1 - f) * this.g) / Math.sin(this.g);
    var B = Math.sin(f * this.g) / Math.sin(this.g);
    var x = A * Math.cos(this.start.y) * Math.cos(this.start.x) + B * Math.cos(this.end.y) * Math.cos(this.end.x);
    var y = A * Math.cos(this.start.y) * Math.sin(this.start.x) + B * Math.cos(this.end.y) * Math.sin(this.end.x);
    var z = A * Math.sin(this.start.y) + B * Math.sin(this.end.y);
    var lat = R2D * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    var lon = R2D * Math.atan2(y, x);
    return [lon, lat];
};



/*
 * Generate points along the great circle
 */
GreatCircle.prototype.Arc = function(npoints,options) {
    var first_pass = [];
    if (!npoints || npoints <= 2) {
        first_pass.push([this.start.lon, this.start.lat]);
        first_pass.push([this.end.lon, this.end.lat]);
    } else {
        var delta = 1.0 / (npoints - 1);
        for (var i = 0; i < npoints; ++i) {
            var step = delta * i;
            var pair = this.interpolate(step);
            first_pass.push(pair);
        }
    }
    /* partial port of dateline handling from:
      gdal/ogr/ogrgeometryfactory.cpp
      TODO - does not handle all wrapping scenarios yet
    */
    var bHasBigDiff = false;
    var dfMaxSmallDiffLong = 0;
    // from http://www.gdal.org/ogr2ogr.html
    // -datelineoffset:
    // (starting with GDAL 1.10) offset from dateline in degrees (default long. = +/- 10deg, geometries within 170deg to -170deg will be splited)
    var dfDateLineOffset = options && options.offset ? options.offset : 10;
    var dfLeftBorderX = 180 - dfDateLineOffset;
    var dfRightBorderX = -180 + dfDateLineOffset;
    var dfDiffSpace = 360 - dfDateLineOffset;

    // https://github.com/OSGeo/gdal/blob/7bfb9c452a59aac958bff0c8386b891edf8154ca/gdal/ogr/ogrgeometryfactory.cpp#L2342
    for (var j = 1; j < first_pass.length; ++j) {
        var dfPrevX = first_pass[j-1][0];
        var dfX = first_pass[j][0];
        var dfDiffLong = Math.abs(dfX - dfPrevX);
        if (dfDiffLong > dfDiffSpace &&
            ((dfX > dfLeftBorderX && dfPrevX < dfRightBorderX) || (dfPrevX > dfLeftBorderX && dfX < dfRightBorderX))) {
            bHasBigDiff = true;
        } else if (dfDiffLong > dfMaxSmallDiffLong) {
            dfMaxSmallDiffLong = dfDiffLong;
        }
    }

    var poMulti = [];
    if (bHasBigDiff && dfMaxSmallDiffLong < dfDateLineOffset) {
        var poNewLS = [];
        poMulti.push(poNewLS);
        for (var k = 0; k < first_pass.length; ++k) {
            var dfX0 = parseFloat(first_pass[k][0]);
            if (k > 0 &&  Math.abs(dfX0 - first_pass[k-1][0]) > dfDiffSpace) {
                var dfX1 = parseFloat(first_pass[k-1][0]);
                var dfY1 = parseFloat(first_pass[k-1][1]);
                var dfX2 = parseFloat(first_pass[k][0]);
                var dfY2 = parseFloat(first_pass[k][1]);
                if (dfX1 > -180 && dfX1 < dfRightBorderX && dfX2 == 180 &&
                    k+1 < first_pass.length &&
                   first_pass[k-1][0] > -180 && first_pass[k-1][0] < dfRightBorderX)
                {
                     poNewLS.push([-180, first_pass[k][1]]);
                     k++;
                     poNewLS.push([first_pass[k][0], first_pass[k][1]]);
                     continue;
                } else if (dfX1 > dfLeftBorderX && dfX1 < 180 && dfX2 == -180 &&
                     k+1 < first_pass.length &&
                     first_pass[k-1][0] > dfLeftBorderX && first_pass[k-1][0] < 180)
                {
                     poNewLS.push([180, first_pass[k][1]]);
                     k++;
                     poNewLS.push([first_pass[k][0], first_pass[k][1]]);
                     continue;
                }

                if (dfX1 < dfRightBorderX && dfX2 > dfLeftBorderX)
                {
                    // swap dfX1, dfX2
                    var tmpX = dfX1;
                    dfX1 = dfX2;
                    dfX2 = tmpX;
                    // swap dfY1, dfY2
                    var tmpY = dfY1;
                    dfY1 = dfY2;
                    dfY2 = tmpY;
                }
                if (dfX1 > dfLeftBorderX && dfX2 < dfRightBorderX) {
                    dfX2 += 360;
                }

                if (dfX1 <= 180 && dfX2 >= 180 && dfX1 < dfX2)
                {
                    var dfRatio = (180 - dfX1) / (dfX2 - dfX1);
                    var dfY = dfRatio * dfY2 + (1 - dfRatio) * dfY1;
                    poNewLS.push([first_pass[k-1][0] > dfLeftBorderX ? 180 : -180, dfY]);
                    poNewLS = [];
                    poNewLS.push([first_pass[k-1][0] > dfLeftBorderX ? -180 : 180, dfY]);
                    poMulti.push(poNewLS);
                }
                else
                {
                    poNewLS = [];
                    poMulti.push(poNewLS);
                }
                poNewLS.push([dfX0, first_pass[k][1]]);
            } else {
                poNewLS.push([first_pass[k][0], first_pass[k][1]]);
            }
        }
    } else {
        // add normally
        var poNewLS0 = [];
        poMulti.push(poNewLS0);
        for (var l = 0; l < first_pass.length; ++l) {
            poNewLS0.push([first_pass[l][0],first_pass[l][1]]);
        }
    }

    var arc = new Arc(this.properties);
    for (var m = 0; m < poMulti.length; ++m) {
        var line = new LineString();
        arc.geometries.push(line);
        var points = poMulti[m];
        for (var j0 = 0; j0 < points.length; ++j0) {
            line.move_to(points[j0]);
        }
    }
    return arc;
};

if (typeof window === 'undefined') {
  // nodejs
  module.exports.Coord = Coord;
  module.exports.Arc = Arc;
  module.exports.GreatCircle = GreatCircle;

} else {
  // browser
  var arc = {};
  arc.Coord = Coord;
  arc.Arc = Arc;
  arc.GreatCircle = GreatCircle;
}