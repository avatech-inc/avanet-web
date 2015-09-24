
var UTMGridLayer = L.CanvasLayer.extend({
    drawUTMGrid: function(_map, ctx, bounds, southernHemi) {
        var zoom = _map.getZoom();
        // tick spacing (in meters)
        var div = 100000;

        if (zoom < 6) return;         
        else if (zoom == 6)  div = 100000 * 2;
        else if (zoom < 8) div = 100000;
        else if (zoom < 10) div = 100000 / 2;
        else if (zoom < 13) div = 100000 / 10;
        else if (zoom < 14) div = 100000 / 20;
        else if (zoom < 15) div = 100000 / 40;
        else if (zoom < 16) div = 100000 / 50;
        else if (zoom < 17) div = 100000 / 100; // 1km
        else if (zoom < 18) div = 100000 / 400;

        // set line style
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.9)';
        ctx.lineWidth = .8;

        var zoneSW = Math.floor((bounds._southWest.lng + 180.0) / 6) + 1;
        var zoneNE = Math.floor((bounds._northEast.lng + 180.0) / 6) + 1;

        var UTM_SW = new Array(2);
        LatLonToUTMXY(DegToRad(bounds._southWest.lat), DegToRad(bounds._southWest.lng), zoneSW, UTM_SW);
        var UTM_NE = new Array(2);
        LatLonToUTMXY(DegToRad(bounds._northEast.lat), DegToRad(bounds._northEast.lng), zoneNE, UTM_NE);

        var utmTop    = (parseInt(UTM_NE[1] / div) * div) + div;
        var utmBottom = (parseInt(UTM_SW[1] / div) * div) - div;

        if (bounds._southWest.lat < 0 && bounds._northEast.lat >= 0) {
            if (southernHemi) utmTop = 10000000;
            else utmBottom = 0;
        }
        console.log(zone + " UTM: " + utmBottom + "," + utmTop)

        for (var zone = zoneSW; zone <= zoneNE; zone++) {
            // get lng of zone
            var zoneBoundaryLngLeft = ((zone - 1) * 6) - 180;
            var zoneBoundaryLngRight = (zone * 6) - 180;
            // get zone boundaries
            var zonePointNE = _map.latLngToContainerPoint(new L.LatLng(bounds._northEast.lat, zoneBoundaryLngLeft));
            var zonePointSW = _map.latLngToContainerPoint(new L.LatLng(bounds._southWest.lat, zoneBoundaryLngRight));

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

            // multiple zones on screen
            var utmLeft = 0;
            var utmRight = 10000000;

            // only one zone on screen
            if (zone == zoneNE && zone == zoneSW) {
                utmLeft = (parseInt(UTM_SW[0] / div) * div) - div;
                utmRight = (parseInt(UTM_NE[0] / div) * div) + div;
            }
            //console.log(zone + ": left: " + utmLeft + ", " + utmRight);

            ctx.beginPath();
            // horizontal lines
            for (var n = utmBottom; n <= utmTop; n += div) {
                for (var e = utmLeft; e <= utmRight; e += div) {
                    // convert back to lat lng
                    var latlng = new Array(2);
                    UTMXYToLatLon(e, n, zone, southernHemi, latlng);

                    // get container point
                    var canvasPoint = _map.latLngToContainerPoint(
                        new L.LatLng(RadToDeg(latlng[0]), RadToDeg(latlng[1])));

                    if (e == utmLeft) ctx.moveTo(canvasPoint.x, canvasPoint.y);
                    else ctx.lineTo(canvasPoint.x, canvasPoint.y);
                }
            }
            // vertical lines
            for (var e = utmLeft; e <= utmRight; e += div) {
                for (var n = utmBottom; n <= utmTop; n += div) {
                    // convert back to lat lng
                    var latlng = new Array(2);
                    UTMXYToLatLon(e, n, zone, southernHemi, latlng);

                    // get container point
                    var canvasPoint = _map.latLngToContainerPoint(
                        new L.LatLng(RadToDeg(latlng[0]), RadToDeg(latlng[1])));

                    if (n == utmBottom) ctx.moveTo(canvasPoint.x, canvasPoint.y);
                    else ctx.lineTo(canvasPoint.x, canvasPoint.y);
                }
            }
            ctx.closePath();
            ctx.stroke();

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
        ctx.closePath();
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
        ctx.closePath();
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