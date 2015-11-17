// By Andrew Sohn
// (C) 2015 Avatech, Inc.

var AvatechTerrainLayer = function (options) {
    options.underzoom = true;
    var terrainLayer = new L.GridLayer(options);

    terrainLayer.createTile = function(tilePoint, tileLoaded) {
        // create tile canvas element
        var tile = L.DomUtil.create('canvas', 'leaflet-tile always-show');

        // setup tile width and height according to the options
        var size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        // attach tileLoaded callback to element for easier access down the chain
        tile._tileLoaded = tileLoaded;
        // if tileLoaded not specified, call dummy function
        if (!tile._tileLoaded) tile._tileLoaded = function() { };
        // draw tile
        this.drawTile(tile, tilePoint);
        // return tile so Leaflet knows to expect tileLoaded callback later
        return tile;
    }

    terrainLayer.getTileSize = function () {
        var map = this._map,
            tileSize = L.GridLayer.prototype.getTileSize.call(this),
            zoom = this._tileZoom,
            zoomN = this.options.maxNativeZoom;

        // increase tile size for zoom level 12 (scale up from 11)
        if (options.underzoom && parseInt(zoom) == 12) tileSize = new L.Point(512, 512); // 128

        // increase tile size when overzooming (scalw down from 13)
        else tileSize = zoomN !== null && zoom > zoomN ?
            tileSize.divideBy(map.getZoomScale(zoomN, zoom)).round() : tileSize;

        return tileSize;
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

    terrainLayer.clearOldWorkers = function() {
        var zoom = parseInt(terrainLayer._map.getZoom());
        var workerKeys = Object.keys(terrainLayer.workers);

        // console.log("-----------------------------------")
        // console.log("ZOOM: " + zoom)


        // overzoom
        if (zoom > this.options.maxNativeZoom) zoom = this.options.maxNativeZoom;
        // make zoom level 12 underzoomed from 13
        if (this.options.underzoom && zoom == 12) zoom = 11; // 13

        angular.forEach(workerKeys,function(key) {
            // todo: also check if tile point is out of map bounds by certain amount
            var allowed = false;
            //if (key.indexOf("_" + (zoom - 1)) > key.length - 4) allowed = true;
            if (key.indexOf("_" + zoom) > key.length - 4) allowed = true;
            //else if (key.indexOf("_" + (zoom + 1)) > key.length - 4) allowed = true;

            // remove worker entirely
            if (!allowed) {
                var worker = terrainLayer.workers[key];
                if (worker) {
                    //console.log("terminating worker!")
                    if (worker.terminate) worker.terminate();
                    if (worker.dems) worker.converted = null;
                    terrainLayer.workers[key] = null;
                    delete terrainLayer.workers[key];
                }
            }
            //console.log(key + "; " + allowed);
        });
    }

    // clear old 'layers'
    var layerClearTimer;
    terrainLayer.on('load', function (e) {
        console.log("terrain loaded!");
        if (layerClearTimer) clearTimeout(layerClearTimer);
        layerClearTimer = setTimeout(function() { terrainLayer._pruneTiles2() }, 600);
        terrainLayer.clearOldWorkers();
    });

    terrainLayer.updateTile = function(e) {
        // process terrain data callback
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
            // delete reference to callback, no longer needed
            delete terrainLayer.callbacks[e.data.requestId];

            return;
        }

        // get canvas context for this tile
        var ctx = terrainLayer.contexts[e.data.id];

        // if no pixels have been returned, it means only data was loaded 
        // and no pixels processed (i.e. loadTerrainData as overlayType)
        // mark tile as loaded and return
        if (!e.data.pixels) {
            if (ctx.canvas._tileLoaded) ctx.canvas._tileLoaded(null, ctx.canvas);
            ctx.canvas._tileLoaded = null;
            return;
        }

        // get tile size
        var tileSize = ctx.canvas.width;

        // clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // get new pixels from worker thread response
        var pixels = new Uint8ClampedArray(e.data.pixels);

        // regular size tile
        if (tileSize == 256) {
            var imgData = ctx.createImageData(256, 256);
            imgData.data.set(pixels);
            ctx.putImageData(imgData, 0, 0);
        }
        // scale for overzoom and underzoom
        else {
            var temp_canvas = document.createElement('canvas');
            temp_canvas.width = temp_canvas.height = 256;
            var temp_context = temp_canvas.getContext('2d');

            var imgData = temp_context.createImageData(256, 256);
            imgData.data.set(pixels);
            temp_context.putImageData(imgData, 0, 0);

            ctx.drawImage(temp_canvas, 0, 0, 256, 256, 0, 0, tileSize, tileSize);
        }

        // fire tileLoaded callback
        if (ctx.canvas._tileLoaded) {
            ctx.canvas._tileLoaded(null, ctx.canvas);
            // remove the function so it can't be called twice
            ctx.canvas._tileLoaded = null;
        }
    }

    terrainLayer.PNG_cache = {};

    terrainLayer.drawTile = function(canvas, tilePoint) {
        var PNG_data;
        
        // overzoom
        if (tilePoint.z > this.options.maxNativeZoom) tilePoint.z = this.options.maxNativeZoom;
        // make zoom level 12 underzoomed from 13
        if (this.options.underzoom && parseInt(tilePoint.z) == 12) tilePoint.z = 11; // 13

        // create tile id for caching
        var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + parseInt(tilePoint.z);

        terrainLayer.contexts[tile_id] = canvas.getContext('2d');

        var firstLoad = false;
        function redraw() {
            // if no terrain overlay specified, clear canvas
            if (!terrainLayer.overlayType) {
                var context = canvas.getContext('2d');
                context.clearRect ( 0 , 0 , canvas.width, canvas.height );
                // returning here prevents loading terrain in the background
                // todo: maybe make this an option?
                //return;
            }

            // message to send to worker thread
            var message = { id: tile_id };
            // Transferable = big performance improvement when sending large objects like PNG data
            // https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast
            var transferable = [];

            if (!firstLoad) {
                message.raster = PNG_data;
                message.url = url;
                transferable.push(message.raster);
            }

            var overlayType = terrainLayer.overlayType;
            if (!overlayType) overlayType = "loadTerrainData";

            message.processType = overlayType;
            message.customParams = terrainLayer.customParams;

            // if no existing worker thread, create
            if (!terrainLayer.workers[tile_id]) {
                terrainLayer.workers[tile_id] = new Worker(window.terrainWorkerURL);
                terrainLayer.workers[tile_id].onmessage = terrainLayer.updateTile;
            }

            // post message to worker thread
            terrainLayer.workers[tile_id].postMessage(message, transferable);

            firstLoad = true;
        }
      
        // check if tile is in local cache
        //   storing and serving from this local cache is faster than using traditional browser cache,
        //   since the image data is cached after the PNG has been decoded (which is pretty slow).
        //   this is mainly to support quick loading between recently accessed areas and zoom levels.
        var cachedTile = terrainLayer.PNG_cache[tile_id];   
        if (cachedTile) {
            console.log("from cache!");
            PNG_data = new Uint8ClampedArray(cachedTile).buffer;;
            redraw();
            terrainLayer.redrawQueue.push(redraw);
        }
        else {
            // // overzoom
            // if (tilePoint.z > this.options.maxNativeZoom) {
            //     tilePoint.z = this.options.maxNativeZoom;
            // }
            // // make zoom level 12 underzoomed from 13
            // if (this.options.underzoom && parseInt(tilePoint.z) == 12) {
            //     tilePoint.z = 11;
            // }

            // elevation tile URL
            var url = L.Util.template('https://tiles-{s}.avatech.com/{z}/{x}/{y}.png', L.extend(tilePoint, {
                // use multiple subdomains to parallelize requests
                //   cycle through using same implementation as Leaflet TileLayer.
                //   makes sure to return same subdomain each time a URL is fetched
                //   to prevent duplicate browser caching.
                s: function (argument) {
                    var subdomains = "abc";
                    var index = Math.abs(tilePoint.x + tilePoint.y) % subdomains.length;
                    return subdomains[index];
                }
            }));

            // get tile as raw Array Buffer so we can process PNG on our own 
            //   to avoid bogus data from native browser alpha premultiplication
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
                    //terrainLayer.PNG_cache[tile_id] = pixels;
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
            xhr.send(null);
        }
    }

    var lastSync;
    terrainLayer.redraw = function() {
        if (terrainLayer.needsRedraw) {
            //console.log("Queue: " + terrainLayer.redrawQueue.length);
            terrainLayer.redrawQueue.forEach(function(redraw) { redraw(); });
        }
        terrainLayer.needsRedraw = false;
        L.Util.requestAnimFrame(terrainLayer.redraw);
    }
    terrainLayer.redraw();

    // ----- Terrain data querying ------

    function latLngToTilePoint(lat, lng, zoom) {
        lat *= (Math.PI/180);
        return {
            x: parseInt(Math.floor( (lng + 180) / 360 * (1<<zoom) )),
            y: parseInt(Math.floor( (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * (1<<zoom) )),
            z: zoom
        }
    }
    function tilePointToLatLng(x, y, zoom) {
        var n = Math.PI-2*Math.PI*y/Math.pow(2,zoom);
        return {
            lng: (x/Math.pow(2,zoom)*360-180),
            lat: (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))))
        }
    }

    var callbackCount = 0;
    terrainLayer.callbacks = {};
    terrainLayer.getTerrainData = function(lat, lng, callback, index, original) {
        // round down lat/lng for fewer lookups
        // 4 decimal places = 11.132 m percision
        // https://en.wikipedia.org/wiki/Decimal_degrees
        // lat = Math.round(lat * 1e4) / 1e4;
        // lng = Math.round(lng * 1e4) / 1e4;

        // adjust zoom level for overzoom
        var zoom = Math.min(terrainLayer.options.maxNativeZoom, terrainLayer._map.getZoom());
        if (terrainLayer.options.underzoom) { if (parseInt(zoom) == 12) zoom = 11; } // 13
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
        else if (terrainLayer.options.underzoom && parseInt(terrainLayer._map.getZoom()) == 12) {
            var zoomDifference = terrainLayer._map.getZoom() - 11;
            var zoomDivide = Math.pow(2, zoomDifference)

            pointInTile.x = Math.floor(pointInTile.x / zoomDivide);
            pointInTile.y = Math.floor(pointInTile.y / zoomDivide);
            // previous underzoom code
            // var zoomDifference = 1;
            // var zoomDivide = Math.pow(2, zoomDifference)

            // pointInTile.x = Math.floor(pointInTile.x * zoomDivide);
            // pointInTile.y = Math.floor(pointInTile.y * zoomDivide);
        }

        // make sure point is within 256x256 bounds
        if (pointInTile.x > 255) pointInTile.x = 255;
        if (pointInTile.y > 255) pointInTile.y = 255;
        if (pointInTile.x < 0) pointInTile.x = 0;
        if (pointInTile.y < 0) pointInTile.y = 0;

        // create unique request id to keep track of callbacks
        var requestId = lat + "_" + lng + "_" + callbackCount + new Date().getTime();
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

        callbackCount++;
    }

    // since 'getTerrainDataBulk' is using terrain tile worker threads, the data 
    // callback will only return after all tiles have loaded, so we don't have
    // to worry about checking if terrain tiles have been loaded before querying.
    terrainLayer.getTerrainDataBulk = function(points, callback) {
        // clear callbacks cache to prevent any old callbacks
        // from executing thereby tainting this new request
        terrainLayer.callbacks = {};
        // keep track of recieved data in original order
        var receivedPoints = [];
        // keep track of recieved count separately (since we can't use receivedPoints.length)
        var receivedPointsTotal = 0;
        // call 'getTerrainData' for each point
        for (var i = 0; i < points.length; i++) {
            terrainLayer.getTerrainData(points[i].lat, points[i].lng, function(terrainData) {
                receivedPoints[terrainData.index] = terrainData;
                receivedPointsTotal++;
                // when all points have been received, callback
                if (receivedPointsTotal == points.length) callback(receivedPoints);
            }, 
            i, // index
            points[i].original // original
            );
        }
    }

    return terrainLayer;
};