
    L.TileLayer.Terrain = L.TileLayer.extend({
        options: {
            async: false
        },

        // redrawQueue[];
        // contexts = {};
        // zFactor = .12;
        // workers = {};
        // terrainDataCache = {};

        initialize: function (options) {
            L.setOptions(this, options);
        },

        redraw: function () {
            if (this._map) {
                this._reset({hard: true});
                this._update();
            }

            for (var i in this._tiles) {
                this._redrawTile(this._tiles[i]);
            }
            return this;
        },

        _redrawTile: function (tile) {
            this.drawTile(tile, tile._tilePoint, this._map._zoom);
        },

        _createTile: function () {
            var tile = L.DomUtil.create('canvas', 'leaflet-tile');
            tile.width = tile.height = this.options.tileSize;
            tile.onselectstart = tile.onmousemove = L.Util.falseFn;
            return tile;
        },

        _loadTile: function (tile, tilePoint) {
            tile._layer = this;
            tile._tilePoint = tilePoint;

            this._redrawTile(tile);

            if (!this.options.async) {
                this.tileDrawn(tile);
            }
        },

        drawTile: function (/*tile, tilePoint*/) {
            // override with rendering code
        },

        tileDrawn: function (tile) {
            this._tileOnLoad.call(tile);
        },
        _getTileSize: function () {
            var map = this._map,
                options = this.options,
                zoom = map.getZoom() + options.zoomOffset,
                zoomN = options.maxNativeZoom;

            // increase tile size when overscaling
            return zoomN !== null && zoom > zoomN ?
                    Math.round(options.tileSize / map.getZoomScale(zoomN, zoom)) : 
                    options.tileSize;
        }
    });


    L.tileLayer.terrain = function (options) {
        var terrainLayer =  new L.TileLayer.Terrain(options);

        terrainLayer.redrawQueue = [];
        terrainLayer.contexts = {};
        terrainLayer.zFactor = .12;
        terrainLayer.workers = {};
        terrainLayer.terrainDataCache = {};
        terrainLayer.needsRedraw = false;
        terrainLayer.overlayType;
        terrainLayer.sunDate;

        terrainLayer.updateTile = function(e) {
            if (e.data.terrainData) {
                var terrainData = {
                    elevation: e.data.terrainData[0],
                    slope: e.data.terrainData[1],
                    aspect: e.data.terrainData[2],
                    lat: e.data.lat,
                    lng: e.data.lng
                }
                //console.log(terrainData);
                // store in cache
                terrainLayer.terrainDataCache[e.data.lat + "_" + e.data.lng] = terrainData;
                return;
            }

            var ctx = terrainLayer.contexts[e.data.id];
            var tileSize = ctx.canvas.width;

            // regular tile
            if (tileSize == 256) {
                var imgData = ctx.createImageData(256, 256);
                imgData.data.set(new Uint8ClampedArray(e.data.pixels));
                ctx.putImageData(imgData, 0, 0);
            }
            // overzoom
            else {
                var temp_canvas = document.createElement('canvas');
                temp_canvas.width = temp_canvas.height = 256;
                var temp_context = temp_canvas.getContext('2d');
                var imgData = temp_context.createImageData(256, 256);
                imgData.data.set(new Uint8ClampedArray(e.data.pixels));
                temp_context.putImageData(imgData, 0, 0);

                var imageObject=new Image();
                imageObject.onload=function(){
                    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
                    ctx.drawImage(imageObject,0,0, 256, 256, 0, 0, tileSize, tileSize);
                }
                imageObject.src=temp_canvas.toDataURL();
            }
        }

        terrainLayer.drawTile = function(canvas, tilePoint, zoom) {

            var tileSize = terrainLayer._getTileSize();
            canvas.width = canvas.height = tileSize;

            var renderedZFactor;

            var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + zoom;

            var PNG_data;

             if (zoom > terrainLayer.options.maxNativeZoom) zoom = terrainLayer.options.maxNativeZoom;
            terrainLayer.contexts[tile_id] = canvas.getContext('2d');

            function redraw() {

                // if no terrain overlay specified, clear canvas
                if (!terrainLayer.overlayType) {
                    var context = canvas.getContext('2d');
                    context.clearRect ( 0 , 0 , canvas.width, canvas.height );
                    return;
                }

                var transferable = [];
                var data = { id: tile_id };

                if (renderedZFactor !== terrainLayer.zFactor) {
                    data.raster = PNG_data;
                    data.zFactor = terrainLayer.zFactor;
                    data.url = url;
                    transferable.push(data.raster);
                }
                data.processType = terrainLayer.overlayType;

                // sun location
                if (terrainLayer.overlayType == "sun" && terrainLayer.sunDate) {
                    var mapCenter = terrainLayer._map.getCenter();
                    var _date = new Date(terrainLayer.sunDate);
                    _date.setHours(_date.getHours() - 1 - 1); // adjust for 0-23, adjust to match CalTopo
                    var pos = SunCalc.getPosition(_date, mapCenter.lat, mapCenter.lng);
                    data.altitude = pos.altitude * (180 / Math.PI);
                    data.azimuth = pos.azimuth * (180 / Math.PI);
                }

                if (!terrainLayer.workers[tile_id]) {
                    terrainLayer.workers[tile_id] = new Worker('/modules/map/terrain-worker.js');
                    terrainLayer.workers[tile_id].onmessage = terrainLayer.updateTile;
                }

                terrainLayer.workers[tile_id].postMessage(data, transferable);

                renderedZFactor = terrainLayer.zFactor;
            }

           
            // invert for TMS
            //tilePoint.y = (1 << zoom) - tilePoint.y - 1; 
            var url = L.Util.template('https://s3.amazonaws.com/avatech-tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
           
            //var url = L.Util.template('/tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
            
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function() {
                if (xhr.status != 200) return;
                var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);

                var png = new PNG(data);
                if (png) {
                    var pixels = png.decodePixels();
                    PNG_data = new Uint8ClampedArray(pixels).buffer;

                    redraw();
                    terrainLayer.redrawQueue.push(redraw);
                }
            };
            return xhr.send(null);
        }

        terrainLayer.redraw = function() {
            if (terrainLayer.needsRedraw) terrainLayer.redrawTiles();
            terrainLayer.needsRedraw = false;
            window.requestAnimationFrame(terrainLayer.redraw);
        }
        terrainLayer.redraw();

        terrainLayer.redrawTiles = function () {
            terrainLayer.redrawQueue.forEach(function(redraw) { redraw(); });
        };

        // ----- terrain data querying ------

        function latLngToTilePoint(lat, lng, zoom) {
            lat *= (Math.PI/180);
            return {
                x: parseInt(Math.floor( (lng + 180) / 360 * (1<<zoom) )),
                y: parseInt(Math.floor( (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * (1<<zoom) ))
            }
        }
        function tilePointToLatLng(x, y, zoom) {
            var n = Math.PI-2*Math.PI*y/Math.pow(2,zoom);
            return {
                lng: (x/Math.pow(2,zoom)*360-180),
                lat: (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))))
            }
        }

        terrainLayer.initiateGetTerrainData = function(lat, lng) {
            console.log(lat + "," + lng);
            // round down lat/lng for fewer lookups
            // 5 decimal places = 1.1132 m percision
            // https://en.wikipedia.org/wiki/Decimal_degrees
            // lat = Math.round(lat * 1e5) / 1e5;
            // lng = Math.round(lng * 1e5) / 1e5;

            // adjust zoom level for overzoom
            var zoom = Math.min(terrainLayer.options.maxNativeZoom, terrainLayer._map.getZoom());
            // get xyz of clicked tile based on clicked lat/lng
            var tilePoint = latLngToTilePoint(lat, lng, zoom);
            // get nw lat/lng of tile
            var backToLatLng = tilePointToLatLng(tilePoint.x, tilePoint.y, zoom);
            // get nw container point of tile
            var nwContainerPoint = terrainLayer._map.latLngToContainerPoint(backToLatLng);
            // get container point of original lat lng
            var containerPoint = terrainLayer._map.latLngToContainerPoint(L.latLng(lat,lng));

            // subtract clicked queried point from nw container point to get point within tile
            var pointInTile = {
                x: containerPoint.x - nwContainerPoint.x,
                y: containerPoint.y - nwContainerPoint.y
            }
            // adjust points for overzoom
            if (terrainLayer._map.getZoom() > terrainLayer.options.maxNativeZoom) {
                var zoomDifference = terrainLayer._map.getZoom() - terrainLayer.options.maxNativeZoom;
                var zoomDivide = Math.pow(2, zoomDifference)

                pointInTile.x = Math.floor(pointInTile.x / zoomDivide);
                pointInTile.y = Math.floor(pointInTile.y / zoomDivide);
            }

            // send point to tile worker
            var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + terrainLayer._map.getZoom();
            var worker = terrainLayer.workers[tile_id];
            if (worker != null) worker.postMessage({ id: tile_id, pointInTile: pointInTile, lat: lat, lng: lng });
        }

        return terrainLayer;
    };