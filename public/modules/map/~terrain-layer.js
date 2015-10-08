  L.TileLayer.Terrain = L.TileLayer.extend({
        options: {
            async: false
        },

        initialize: function (options) {
            L.setOptions(this, options);
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

        tileDrawn: function (tile) {
            this._tileOnLoad.call(tile);
        },
        _getTileSize: function () {
            var map = this._map,
                options = this.options,
                zoom = map.getZoom() + options.zoomOffset,
                zoomN = options.maxNativeZoom;

            // increase tile size when overzooming
            if (options.underzoom) { if (zoom == 12) return 128; }
            return zoomN !== null && zoom > zoomN ?
                    Math.round(options.tileSize / map.getZoomScale(zoomN, zoom)) : 
                    options.tileSize;
        }
    });


    L.tileLayer.terrain = function (options) {
        options.underzoom = true;

        var terrainLayer =  new L.TileLayer.Terrain(options);

        terrainLayer.redrawQueue = [];
        terrainLayer.contexts = {};
        terrainLayer.workers = {};
        terrainLayer.terrainDataCache = {};
        terrainLayer.needsRedraw = false;
        terrainLayer.overlayType;
        terrainLayer.sunDate;

        terrainLayer.updateTile = function(e) {
            if (e.data.pointInTile) {
                var terrainData = e.data;

                // if empty values, make null
                if (terrainData.elevation == 127 && terrainData.slope == 127 && terrainData.aspect == 511) {
                    terrainData.elevation = null;
                    terrainData.slope = null;
                    terrainData.aspect = null;
                }

                // store in cache
                terrainLayer.terrainDataCache[e.data.lat + "_" + e.data.lng] = terrainData;

                // retreive and call stored callback
                var callback = terrainLayer.callbacks[e.data.requestId];
                if (callback) callback(terrainData);

                return;
            }

            // if we've gotten this far and no pixels have been return, it's an error and we should leave
            // otherwise, tile will be rendered blank
            if (!e.data.pixels) return;

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

        terrainLayer.PNG_cache = {};

        terrainLayer.overlayType = "loadTerrainData";

        terrainLayer.drawTile = function(canvas, tilePoint, zoom) {

            var tileSize = terrainLayer._getTileSize();
            canvas.width = canvas.height = tileSize;

            var PNG_data;

            var latlng = tilePointToLatLng(tilePoint.x, tilePoint.y, zoom);

            if (zoom > terrainLayer.options.maxNativeZoom) zoom = terrainLayer.options.maxNativeZoom;
            //make zoom level 12 underzoomed from 13
            if (terrainLayer.options.underzoom) { if (zoom == 12) zoom = 13; }


            //tilePoint = latLngToTilePoint(latlng.lat, latlng.lng, zoom);
            var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + zoom;
            //var tile_id = getTileId(latlng.lat, latlng.lng, zoom);
            //console.log(tile_id);

            terrainLayer.contexts[tile_id] = canvas.getContext('2d');

            var firstLoad = false;
            function redraw() {

                // if no terrain overlay specified, clear canvas
                if (!terrainLayer.overlayType) {
                    var context = canvas.getContext('2d');
                    context.clearRect ( 0 , 0 , canvas.width, canvas.height );
                    return;
                }

                var transferable = [];
                var data = { id: tile_id };

                if (!firstLoad) {
                    data.raster = PNG_data;
                    data.url = url;
                    transferable.push(data.raster);
                }
                data.processType = terrainLayer.overlayType;
                data.customParams = terrainLayer.customParams;

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

                firstLoad = true;
            }
              
            var cachedTile = terrainLayer.PNG_cache[tile_id];
            if (cachedTile) {
                console.log("CACHED TILE FOUND!");
                PNG_data = new Uint8ClampedArray(cachedTile).buffer;;
                redraw();
                terrainLayer.redrawQueue.push(redraw);
            }
            else {
                var url = L.Util.template('https://s3.amazonaws.com/avatech-tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
                //var url = L.Util.template('http://10.1.10.165:8080/austriaTEST-tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
                //var url = L.Util.template('http://10.1.10.165:8080/united_states-tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
                //var url = L.Util.template('/tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
                //var url = L.Util.template('http://10.1.10.192:8080/united_states_dev-tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
                
                //var url = L.Util.template('https://a.tiles.mapbox.com/v3/aj.sf-dem/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
                //var url = L.Util.template('/tiles3/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));

                // var demImg = new Image();
                // var demCtx;
                // demImg.onload = function() {
                //     var c = document.createElement('canvas');
                //     c.width = c.height = 256;
                //     demCtx = c.getContext('2d');
                //     demCtx.drawImage(demImg, 0, 0);

                //     var pixels = demCtx.getImageData(0, 0, 256, 256).data;//.buffer
                //     terrainLayer.PNG_cache[tile_id] = pixels;
                //     PNG_data = pixels.buffer;

                //     //--------

                //     redraw();
                //     terrainLayer.redrawQueue.push(redraw);
                // };

                // demImg.crossOrigin = '*';
                // demImg.src = url;

                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = function() {
                    if (xhr.status != 200) return;
                    var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);

                    var png = new PNG(data);
                    if (png) {
                        var pixels = png.decodePixels();
                        terrainLayer.PNG_cache[tile_id] = pixels;
                        PNG_data = new Uint8ClampedArray(pixels).buffer;

                        redraw();
                        terrainLayer.redrawQueue.push(redraw);
                    }
                };
                return xhr.send(null);
            }
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

        terrainLayer.callbacks = {};

        // function getTileId(lat, lng, zoom) {
        //     var zoom = Math.min(terrainLayer.options.maxNativeZoom, terrainLayer._map.getZoom());
        //     if (terrainLayer.options.underzoom) { if (zoom == 12) zoom = 13; }
        //     var tilePoint = latLngToTilePoint(lat, lng, zoom);
        //     return tilePoint.x + "_" + tilePoint.y + "_" + zoom;
        // }

        terrainLayer.getTerrainData = function(lat, lng, callback, index, original) {
            // round down lat/lng for fewer lookups
            // 5 decimal places = 1.1132 m percision
            // https://en.wikipedia.org/wiki/Decimal_degrees
            // lat = Math.round(lat * 1e5) / 1e5;
            // lng = Math.round(lng * 1e5) / 1e5;

            // if its in the cache, return it
            // var terrainData = terrainLayer.terrainDataCache[lat + "_" + lng];
            // if (terrainData) {
            //     terrainData.index = index;
            //     return callback(terrainData);
            // }

            // adjust zoom level for overzoom
            var zoom = Math.min(terrainLayer.options.maxNativeZoom, terrainLayer._map.getZoom());
            if (terrainLayer.options.underzoom) { if (zoom == 12) zoom = 13; }
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
            // adjust points for underzoom
            if (terrainLayer.options.underzoom && terrainLayer._map.getZoom() == 12) {
                var zoomDifference = 1;
                var zoomDivide = Math.pow(2, zoomDifference)

                pointInTile.x = Math.floor(pointInTile.x * zoomDivide);
                pointInTile.y = Math.floor(pointInTile.y * zoomDivide);
            }
            // make sure point is within 256x256 bounds
            if (pointInTile.x > 255) pointInTile.x = 255;
            if (pointInTile.y > 255) pointInTile.y = 255;
            if (pointInTile.x < 0) pointInTile.x = 0;
            if (pointInTile.y < 0) pointInTile.y = 0;

            // create unique request id
            var requestId = lat + "_" + lng + "_" + new Date().getTime();
            if (index != null) requestId += "_" + index;

            // store callback so we can reference when message is received from worker thread
            if (callback) terrainLayer.callbacks[requestId] = callback;

            // send point to tile worker
            var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + zoom;

            var worker = terrainLayer.workers[tile_id];
            if (worker != null) worker.postMessage({ id: tile_id, requestId: requestId, 
                lat: lat, lng: lng, pointInTile: pointInTile, index: index, original: original });

            // if no worker exists, return empty terrain data
            else if (callback) callback({ elevation: null, slope: null, aspect: null, 
                lat: lat, lng: lng, pointInTile: pointInTile, index: index, original: original });
        }

        var callbackTimer;
        var callbackCalled;
        terrainLayer.getTerrainDataBulk = function(points, callback) {
            // clear callbacks cache
            terrainLayer.callbacks = {};

            console.log("POINTS: " + points.length);

            callbackCalled = false;
            var d = new Date().getTime();
            if (callbackTimer) clearTimeout(callbackTimer);
            var receivedPoints = [];
            for (var i = 0; i < points.length; i++) {
                terrainLayer.getTerrainData(points[i].lat, points[i].lng, function(terrainData) {
                    // place in array based on original index to ensure same order
                    receivedPoints[terrainData.index] = terrainData;

                    // when all points have been received
                    if (receivedPoints.length >= points.length) {
                        // if callback called once, prevent calling again
                        if (callbackCalled) return;
                        callbackCalled = true;

                        console.log("TIME: " + (new Date().getTime() - d));

                        callbackTimer = setTimeout(function(){ 
                            callback(receivedPoints);
                        }, 10);
                    }

                    // todo: put in timeout timer?

                }, 
                i, // index
                points[i].original // original
                );
            }
        }

        return terrainLayer;
    };