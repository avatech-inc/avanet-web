// By Andrew Sohn
// (C) 2015 Avatech, Inc.

var AvatechTerrainLayer = function (options) {
    options.underzoom = true;
    var terrainLayer = new L.GridLayer(options);

    terrainLayer.createTile = function(tilePoint, tileLoaded) {
        var error;
        // create tile canvas
        var tile = L.DomUtil.create('canvas', 'leaflet-tile');

        // setup tile width and height according to the options
        var size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        tile._tileLoaded = tileLoaded;

        this.drawTile(tile, tilePoint);

        return tile;
    }

    terrainLayer.getTileSize = function () {
        var map = this._map,
            options = this.options,
            zoom = map.getZoom(),
            zoomN = options.maxNativeZoom;

        // decrease tile size when underzooming
        if (options.underzoom && parseInt(zoom) == 12) tileSize = 128;

        // increase tile size when overzooming
        else tileSize = zoomN !== null && zoom > zoomN ?
                Math.round(options.tileSize / map.getZoomScale(zoomN, zoom)) : 
                options.tileSize;

        return new L.Point(tileSize, tileSize);
    }

    terrainLayer.redrawQueue = [];
    terrainLayer.contexts = {};
    terrainLayer.workers = {};
    terrainLayer.needsRedraw = false;
    terrainLayer.overlayType;
    terrainLayer.sunDate;

    // clear existing _pruneTiles function to control clearing of layers on our own
    // otherwise, noticeable flash/lag when leaflet animates zoom
    terrainLayer._pruneTiles = function () { };

    // duplicate of original _pruneTiles function from Leaflet's GridLayer.js
    terrainLayer._pruneTiles2 = function () {
        var key, tile;
        // var zoom = this._map.getZoom();
        // if (zoom > this.options.maxZoom ||
        //     zoom < this.options.minZoom) { return this._removeAllTiles(); }

        for (key in this._tiles) {
            tile = this._tiles[key];
            tile.retain = tile.current;
        }
        for (key in this._tiles) {
            tile = this._tiles[key];
            if (tile.current && !tile.active) {
                var coords = tile.coords;
                if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
                    this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
                }
            }
        }
        var self = this;
        for (key in this._tiles) {
            if (!this._tiles[key].retain) {
                self._removeTile(key);
            }
        }
    };

    // clear old 'layers'
    var layerClearTimer;
    terrainLayer.on('load', function (e) {
        if (layerClearTimer) clearTimeout(layerClearTimer);
        layerClearTimer = setTimeout(function() {
            terrainLayer._pruneTiles2();
            terrainLayer._updateLevels();
        }, 1000);
    });

    terrainLayer.updateTile = function(e) {
        var ctx = terrainLayer.contexts[e.data.id];
        var tileSize = ctx.canvas.width;
        if (ctx.canvas._tileLoaded) ctx.canvas._tileLoaded(null, ctx.canvas);

        if (e.data.pointInTile) {
            var terrainData = e.data;
            // if empty values, make null
            if (terrainData.elevation == 127 && terrainData.slope == 127 && terrainData.aspect == 511) {
                terrainData.elevation = null;
                terrainData.slope = null;
                terrainData.aspect = null;
            }
            // retreive and call stored callback
            var callback = terrainLayer.callbacks[e.data.requestId];
            if (callback) callback(terrainData);

            return;
        }

        // if we've gotten this far and no pixels have been returned, it's an error and we should leave
        // otherwise, tile will be rendered blank
        if (!e.data.pixels) return;

        // regular size tile
        if (tileSize == 256) {
            var imgData = ctx.createImageData(256, 256);
            imgData.data.set(new Uint8ClampedArray(e.data.pixels));
            ctx.putImageData(imgData, 0, 0);
        }
        // scale for overzoom and underzoom
        else {
            var temp_canvas = document.createElement('canvas');
            temp_canvas.width = temp_canvas.height = 256;
            var temp_context = temp_canvas.getContext('2d');

            var imgData = temp_context.createImageData(256, 256);
            imgData.data.set(new Uint8ClampedArray(e.data.pixels));
            temp_context.putImageData(imgData, 0, 0);

            //ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
            ctx.drawImage(temp_canvas,0,0, 256, 256, 0, 0, tileSize, tileSize);

        }
    }

    terrainLayer.PNG_cache = {};

    terrainLayer.overlayType = "loadTerrainData";

    terrainLayer.drawTile = function(canvas, tilePoint) {
        var PNG_data;

        var latlng = tilePointToLatLng(tilePoint.x, tilePoint.y, tilePoint.z);

        if (tilePoint.z > terrainLayer.options.maxNativeZoom) tilePoint.z = terrainLayer.options.maxNativeZoom;
        // make zoom level 12 underzoomed from 13
        if (terrainLayer.options.underzoom && parseInt(tilePoint.z) == 12) tilePoint.z = 13;

        var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + parseInt(tilePoint.z);

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

            // if no existing worker thread, create
            if (!terrainLayer.workers[tile_id]) {
                terrainLayer.workers[tile_id] = new Worker('/modules/map/terrain-worker.js');
                terrainLayer.workers[tile_id].onmessage = terrainLayer.updateTile;
            }

            // post data to worker thread
            terrainLayer.workers[tile_id].postMessage(data, transferable);

            firstLoad = true;
        }
      
        // check if tile is in local cache
        //   storing and serving from this local cache is faster than using traditional browser cache,
        //   since the image data is cached after the PNG has been decoded (which is pretty slow).
        //   this is mainly to support quick loading between recently accessed areas and zoom levels
        var cachedTile = terrainLayer.PNG_cache[tile_id];   
        if (cachedTile) {
            PNG_data = new Uint8ClampedArray(cachedTile).buffer;;
            redraw();
            terrainLayer.redrawQueue.push(redraw);
        }
        else {
            // use multiple CloudFront distributions
            var subdomains = [
                "d3h4b9a1mm5h1z"
            ];
            var url = L.Util.template('https://{s}.cloudfront.net/{z}/{x}/{y}.png', L.extend(tilePoint, {
                //z: zoom,
                // cycle through subdomains (same implementation as Leaflet TileLayer)
                s: function (argument) {
                    var index = Math.abs(tilePoint.x + tilePoint.y) % subdomains.length;
                    return subdomains[index];
                }
            }));
            // get tile
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function() {
                // if anything other than a 200 status code is recieved, fire loaded callback
                if (xhr.status != 200) return canvas._tileLoaded(null, canvas);
                // get PNG data from response
                var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
                // decode PNG
                var png = new PNG(data);
                // if PNG was succesfully decoded
                if (png) {
                    var pixels = png.decodePixels();
                    terrainLayer.PNG_cache[tile_id] = pixels;
                    PNG_data = new Uint8ClampedArray(pixels).buffer;
                    redraw();
                    terrainLayer.redrawQueue.push(redraw);
                }
                // error decoding PNG
                else canvas._tileLoaded(null, canvas);
            };
            // if network error, fire loaded callback 
            xhr.onerror = function() {
                canvas._tileLoaded(null, canvas);
            }
            return xhr.send(null);
        }
    }

    var lastSync;
    terrainLayer.redraw = function() {
        if (terrainLayer.needsRedraw) {
            console.log("Queue: " + terrainLayer.redrawQueue.length);
            terrainLayer.redrawQueue.forEach(function(redraw) { redraw(); });
        }
        terrainLayer.needsRedraw = false;
        //window.requestAnimationFrame(terrainLayer.redraw);
        //if (lastSync) cancelTimeout(lastSync);
        //lastSync = setTimeout(function(){
        L.Util.requestAnimFrame(terrainLayer.redraw);
        //}, 1);
    }
    terrainLayer.redraw();

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
    terrainLayer.getTerrainData = function(lat, lng, callback, index, original) {
        // round down lat/lng for fewer lookups
        // 5 decimal places = 1.1132 m percision
        // https://en.wikipedia.org/wiki/Decimal_degrees
        // lat = Math.round(lat * 1e5) / 1e5;
        // lng = Math.round(lng * 1e5) / 1e5;

        // adjust zoom level for overzoom
        var zoom = Math.min(terrainLayer.options.maxNativeZoom, terrainLayer._map.getZoom());
        if (terrainLayer.options.underzoom) { if (parseInt(zoom) == 12) zoom = 13; }
        // get xyz of clicked tile based on clicked lat/lng
        var tilePoint = latLngToTilePoint(lat, lng, zoom);
        // get nw lat/lng of tile
        var backToLatLng = tilePointToLatLng(tilePoint.x, tilePoint.y, zoom);
        // get nw container point of tile
        var nwContainerPoint = terrainLayer._map.latLngToContainerPoint(backToLatLng);
        // get container point of original lat lng
        var containerPoint = terrainLayer._map.latLngToContainerPoint(L.latLng(lat,lng));

        // subtract queried point from nw container point to get point within tile
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
        if (terrainLayer.options.underzoom && parseInt(terrainLayer._map.getZoom()) == 12) {
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
        var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + parseInt(zoom);

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