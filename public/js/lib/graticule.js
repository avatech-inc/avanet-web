var UTMGridLayer = L.CanvasLayer.extend({

    // based on min and max easting as per https://www.maptools.com/tutorials/utm/details
    utmLeft: 100000,
    utmRight: 900000,

    getZonePixelBounds: function(zone, band) {
        if (band > 19) band = 19;
        var latBand = "CDEFGHJKLMNPQRSTUVWX".charAt(band);

        var lngLeft = ((zone - 1) * 6) - 180;
        var lngRight = (zone * 6) - 180;

        var latBottom = ((band + 1) * 8) - 88;
        var latTop = ((band + 1) * 8) - 80;

        // band X is 12 degrees
        if (latBand == "X") latTop = 84;

        // exceptions

        // Norway 31V & 32V
        if (latBand == "V") {
            if (zone == 31) lngRight = 3;
            else if (zone == 32) lngLeft = 3;
        } 
        // Svalbard
        else if (latBand == "X") {
            // "removed" zones
            if (zone == 32 || zone == 34 || zone == 36) {
                return null;
            }
            else if (zone == 31) {
                lngLeft = 0; lngRight = 9;
            }
            else if (zone == 33) {
                lngLeft = 9; lngRight = 21;
            }
            else if (zone == 35) {
                lngLeft = 21; lngRight = 33;
            }
            else if (zone == 37) {
                lngLeft = 33; lngRight = 42;
            }
        }

        return {
            NE: this._map.latLngToContainerPoint(new L.LatLng(latTop, lngRight)),
            SE: this._map.latLngToContainerPoint(new L.LatLng(latBottom, lngRight)),
            SW: this._map.latLngToContainerPoint(new L.LatLng(latBottom, lngLeft)),
            NW: this._map.latLngToContainerPoint(new L.LatLng(latTop, lngLeft))
        }
    },
    drawGridLines: function(zone, bounds, southernHemi, _x_min, _x_max, _y_min, _y_max, horizontal, arcPoints) {
        // draw lines
        for (var _x = _x_min; _x <= _x_max; _x += this.div) {
            // set line style
            this.ctx.strokeStyle = 'rgba(63,168,208,.9)';
            this.ctx.lineWidth = 1;

            // draw lines
            var previousPoint = null;
            for (var _y = _y_min; _y <= _y_max; _y += this.div) {
                // start arc path
                this.ctx.beginPath();

                // utm easting and northing
                var e = horizontal ? _y : _x;
                var n = horizontal ? _x : _y;

                // convert back to lat lng
                var latlng = UTMXYToLatLon(e, n, zone, southernHemi);

                // get container point
                var canvasPoint = this._map.latLngToContainerPoint(new L.LatLng(RadToDeg(latlng.lat), RadToDeg(latlng.lng)));

                if (!previousPoint) this.ctx.moveTo(canvasPoint.x, canvasPoint.y);
                else {
                    // if entirely out of zone bounds, ignore
                    if (previousPoint.x > bounds.NE.x && canvasPoint.x > bounds.NE.x ||
                        previousPoint.x < bounds.NW.x && canvasPoint.x < bounds.NW.x) {
                        continue;
                    }

                    var firstPointLatLng = this._map.containerPointToLatLng(previousPoint);
                    var lastPointLatLng = this._map.containerPointToLatLng(canvasPoint);

                    var gc = new arc.GreatCircle(
                        { x: lastPointLatLng.lng, y: lastPointLatLng.lat  },
                        { x: firstPointLatLng.lng, y: firstPointLatLng.lat });

                    // start arc path
                    this.ctx.beginPath();

                    // draw arc as series of lines
                    var coords = gc.Arc(arcPoints).geometries[0].coords;
                    if (coords && coords.length) {
                        for (var c = 0; c < coords.length; c++) {
                            var mapPoint = this._map.latLngToContainerPoint(new L.LatLng(coords[c][1], coords[c][0]));
                            this.ctx.lineTo(mapPoint.x, mapPoint.y);
                        }
                    }

                }
                previousPoint = canvasPoint;

                // draw line
                this.ctx.stroke();
            }
        }
    },
    drawLabel: function(x, y, meters, easting) {
        var _text = meters.toString();
        // pad with leading 0 for northing
        if (!easting && _text.length == 6) _text = "0" + _text;

        var leftText = _text.substr(0, easting ? 1 : 2);
        var middleText = _text.substr(easting ? 1 : 2, 2);
        var rightText = _text.substr(easting ? 3 : 4, 3);

        this.ctx.font = '11px "roboto condensed"';
        var leftTextWidth = this.ctx.measureText(leftText).width + 1;
        this.ctx.strokeText(leftText, x, y);
        this.ctx.fillText(leftText, x, y);

        this.ctx.font = '14px "roboto condensed"';
        var middleTextWidth = this.ctx.measureText(middleText).width + 1;
        this.ctx.strokeText(middleText, x + leftTextWidth, y + 2);
        this.ctx.fillText(middleText, x + leftTextWidth, y + 2);

        this.ctx.font = '11px "roboto condensed"';
        var rightTextWidth = this.ctx.measureText(rightText).width + 1;
        this.ctx.strokeText(rightText,x + leftTextWidth + middleTextWidth, y);
        this.ctx.fillText(rightText, x + leftTextWidth + middleTextWidth, y);
        
        // var direction = easting ? "E" : "N";
        // this.ctx.font = 'italic 10px "roboto condensed"';
        // this.ctx.strokeText("m" + direction, x + leftTextWidth + middleTextWidth + rightTextWidth, y);
        // this.ctx.fillText("m" + direction, x + leftTextWidth + middleTextWidth + rightTextWidth, y);
    },
    drawGridLabels: function(zone, bounds, southernHemi, _x_min, _x_max, _y_min, _y_max, horizontal, arcPoints) {
        for (var _x = _x_min; _x <= _x_max; _x += this.div) {

            this.ctx.fillStyle='rgba(17,143,189,.9)'; // text color
            this.ctx.strokeStyle='rgba(255,255,255,.8)'; // text stroke color
            this.ctx.lineWidth = 3;

            // northing
            if (horizontal) {
                var _UTM_SW = LatLonToUTMXY(DegToRad(this.latBottom), DegToRad(this._map.getBounds()._southWest.lng));
                var _latlng = UTMXYToLatLon(_UTM_SW.x, _x, zone, southernHemi);
               
                var _canvasPoint = this._map.latLngToContainerPoint(new L.LatLng(RadToDeg(_latlng.lat), RadToDeg(_latlng.lng)));
                
                // is outside map bounds?
                var outside = (_canvasPoint.y - 36 < 0 || // '-36' prevents collision with top easting labels
                    // hide equator label
                    _x >= 9999999 || 
                    _x <= 0);

                if (!outside) this.drawLabel(4, _canvasPoint.y - 6, _x, false);
            }
            // easting
            else  {
                var _UTM_NE = LatLonToUTMXY(DegToRad(this.latTop), DegToRad(this._map.getBounds()._northEast.lng));
                var _latlng = UTMXYToLatLon(_x, _UTM_NE.y, zone, southernHemi);

                var _canvasPoint = this._map.latLngToContainerPoint(new L.LatLng(RadToDeg(_latlng.lat), RadToDeg(_latlng.lng)));
                
                // is outside zone and map bounds?
                var rightPoint = _canvasPoint.x + this.ctx.measureText(_x).width + 10;
                var outside = (_canvasPoint.x < bounds.NW.x ||
                    _canvasPoint.x > bounds.NE.x ||
                    _canvasPoint.x < 6 || // make sure tick mark is visible before labeling
                    rightPoint > bounds.NE.x);

                if (!outside) this.drawLabel(_canvasPoint.x + 4, 12, _x, true);
            }
        }
    },
    drawLabels: function() {
        this.forEachZoneBand(function(_this, zone, bounds, southernHemi, utmTop, utmBottom) {
            // draw easting labels for each zone
            _this.drawGridLabels(zone, bounds, southernHemi, _this.utmLeft, _this.utmRight, utmBottom, utmTop, false, 4);

            // draw northing labels only for left-most zone
            if (zone == _this.zoneLeft)  {
                _this.drawGridLabels(zone, bounds, southernHemi, utmBottom, utmTop, _this.utmLeft, _this.utmRight, true, 10);
            }
        });
    },
    drawUTMGrid: function() {
        this.forEachZoneBand(function(_this, zone, bounds, southernHemi, utmTop, utmBottom) {
            // clip canvas to boundaries of zone
            _this.ctx.save();
            _this.ctx.beginPath();
            _this.ctx.moveTo(bounds.NE.x, bounds.NE.y);
            _this.ctx.lineTo(bounds.SW.x, bounds.NE.y);
            _this.ctx.lineTo(bounds.SW.x, bounds.SW.y);
            _this.ctx.lineTo(bounds.NE.x, bounds.SW.y);
            _this.ctx.closePath();
            _this.ctx.clip();

            // draw utm grid lines
            _this.drawGridLines(zone, bounds, southernHemi, utmBottom, utmTop, _this.utmLeft, _this.utmRight, true, 10); // northing
            _this.drawGridLines(zone, bounds, southernHemi, _this.utmLeft, _this.utmRight, utmBottom, utmTop, false, 4); // easting

            // restore clipped zone bounds
            _this.ctx.restore();
        });
    },
    forEachZoneBand: function(func) {
        for (var zone = this.zoneLeft; zone <= this.zoneRight; zone++) {
            for (var band = this.bandBottom; band <= this.bandTop; band++) {
                // ignore padding
                if (zone < 1 || zone > 60) return;

                var bounds = this.getZonePixelBounds(zone, band);
                // if no bounds (non-existant band, i.e. 32X), continue
                if (!bounds) continue;

                _utmTop = this.utmTop;
                _utmBottom = this.utmBottom;

                // hemisphere based on lat band
                var southernHemi = (band < 10);

                // if both hemispheres are in view, adjust utm top/bottom
                if (this.bothHemispheres) {
                    if (southernHemi) _utmTop = 10000000;
                    else _utmBottom = 0;
                }

                func(this, zone, bounds, southernHemi, _utmTop, _utmBottom);
            }
        }
    },
    drawZoneBorders: function() {
        this.ctx.strokeStyle = 'rgba(255, 60, 60, .9)';
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();
        this.forEachZoneBand(function(_this, zone, bounds) {
            _this.ctx.moveTo(bounds.NE.x, bounds.NE.y);
            _this.ctx.lineTo(bounds.SW.x, bounds.NE.y);
            _this.ctx.lineTo(bounds.SW.x, bounds.SW.y);
            _this.ctx.lineTo(bounds.NE.x, bounds.SW.y);
            _this.ctx.closePath();
        });
        this.ctx.stroke();
    },
    drawEquator: function() {
        var pixelLeft = this._map.latLngToContainerPoint(new L.LatLng(0, this.lngLeft));
        var pixelRight = this._map.latLngToContainerPoint(new L.LatLng(0, this.lngRight));

        this.ctx.strokeStyle = 'rgba(63,168,208,.4)';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(pixelLeft.x ,pixelLeft.y);
        this.ctx.lineTo(pixelRight.x, pixelRight.y);
        this.ctx.stroke();
    },
    render: function() {
        var canvas = this.getCanvas();
        this.ctx = canvas.getContext('2d');

        // clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // get map bounds
        var mapBounds = this._map.getBounds();

        // lat/lng bounds of utm grid
        this.latTop = Math.min(84, mapBounds._northEast.lat);
        this.latBottom = Math.max(-80, mapBounds._southWest.lat);
        this.lngLeft = Math.max(-180, mapBounds._southWest.lng);
        this.lngRight = Math.min(180, mapBounds._northEast.lng);

        var zoom = this._map.getZoom();
        // tick spacing (in meters)
        this.div = 100000;
        
        if (zoom < 6) this.div = null;
        else if (zoom == 6) this.div = 100000 * 2;
        else if (zoom == 7) this.div = 100000;
        else if (zoom == 8) this.div = 100000;
        else if (zoom == 9) this.div = 100000;
        else if (zoom == 10) this.div = 100000 / 2;
        else if (zoom == 11) this.div = 100000 / 4;
        else if (zoom == 12) this.div = 100000 / 10;
        else if (zoom == 13) this.div = 100000 / 20;
        else if (zoom == 14) this.div = 100000 / 40;
        else if (zoom == 15) this.div = 100000 / 50;
        else if (zoom == 16) this.div = 100000 / 100; // 1km
        else if (zoom == 17) this.div = 100000 / 400;
            
        // calcualte top and bottom utm
        var UTM_NE  = LatLonToUTMXY(DegToRad(this.latTop), DegToRad(this._map.getBounds()._northEast.lng));
        var UTM_SW =  LatLonToUTMXY(DegToRad(this.latBottom), DegToRad(this._map.getBounds()._southWest.lng));
       
        this.utmTop    = (parseInt(UTM_NE.y / this.div) * this.div) + this.div;
        this.utmBottom = (parseInt(UTM_SW.y / this.div) * this.div) - this.div;

        // get utm zone and lat band bounds

        // pad zones by 1 on each side to account for exception irregularities
        this.zoneLeft = Math.floor((this.lngLeft + 180.0) / 6) + 1 - 1;
        this.zoneRight = Math.floor((this.lngRight + 180.0) / 6) + 1 + 1;

        this.bandTop = Math.floor((this.latTop+80)/8);
        this.bandBottom = Math.floor((this.latBottom+80)/8);

        this.bothHemispheres = (this.latBottom < 0 && this.latTop >= 0);

        // if both hemispheres are on the same map, draw equator
        if (this.bothHemispheres) this.drawEquator();

        if (this.div) this.drawUTMGrid();

        this.drawZoneBorders();

        if (this.div) this.drawLabels();

        //this.redraw();
      }
});



//////////////////////////////////////////////////////////////////////////////////////////////////



var LatLngGridLayer = L.LayerGroup.extend({
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
        map.off('viewreset '+ this.options.redraw, this._map);
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