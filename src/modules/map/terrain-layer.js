// By Andrew Sohn
// (C) 2015 Avatech, Inc.

var AvatechTerrainLayer = function (options) {

    // get angular module dependencies
    var injector = angular.injector(["ng","terrain"]);
    var $q = injector.get("$q");
    var terrainVisualization = injector.get("terrainVisualization");

    options.underzoom = true;
    options.updateWhenIdle = true;
    options.maxNativeZoom = 13;

    // base terrain layer on leaflet GridLayer
    var terrainLayer = new L.GridLayer(options);

    terrainLayer.redrawQueue = [];
    terrainLayer.needsRedraw = false;
    terrainLayer.overlayType;

    terrainLayer.createTile = function(tilePoint, tileLoaded) {
        // create tile canvas element
        var tile = L.DomUtil.create('canvas', 'leaflet-tile always-show');

        // setup tile width and height according to the options
        var size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        // attach tileLoaded callback to element for easier access down the chain
        tile._tileLoaded = tileLoaded;

        tile._terrainLoaded = $q.defer();

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

    terrainLayer.updateTile = function(ctx, pixels) {
        // get tile size
        var tileSize = ctx.canvas.width;

        // clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // get new pixels from worker thread response
        var pixels = new Uint8ClampedArray(pixels);

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
    }

    terrainLayer.drawTile = function(canvas, tilePoint) {
        var context = canvas.getContext('2d');
        //context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        function redraw() {
            // if no terrain overlay specified, clear canvas
            if (!terrainLayer.overlayType) {
                context.clearRect (0, 0, canvas.width, canvas.height);
                return;
            }
            // get pixels
            var pixels;
            if (terrainLayer.overlayType == "hillshade") pixels = terrainVisualization.hillshade(canvas._terrainData)
            else pixels = terrainVisualization.render(canvas._terrainData, terrainLayer.overlayType, terrainLayer.customParams); 
            // draw canvas
            terrainLayer.updateTile(context, pixels.buffer);
        }
        
        // adjust zoom point for overzoom
        // overzoom
        if (tilePoint.z > this.options.maxNativeZoom) tilePoint.z = this.options.maxNativeZoom;
        // make zoom level 12 overzoomed from 11
        if (this.options.underzoom && parseInt(tilePoint.z) == 12) tilePoint.z = 11;

        // elevation tile URL
        var url = L.Util.template('https://tiles-{s}.avatech.com/{z}/{x}/{y}.png', L.extend(tilePoint, {
            // use multiple subdomains to parallelize requests
            //   cycle through using same implementation as Leaflet TileLayer.
            //   makes sure to return same subdomain each time a URL is fetched
            //   to prevent duplicate browser caching.
            s: function (argument) {
                var subdomains = "abc";
                return subdomains[Math.abs(tilePoint.x + tilePoint.y) % subdomains.length];
            }
        }));

        // get tile as raw Array Buffer so we can process PNG on our own 
        // to avoid bogus data from native browser alpha premultiplication
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
                canvas._terrainData = new Uint32Array(new Uint8ClampedArray(pixels).buffer);

                canvas._terrainLoaded.resolve();

                // fire tileLoaded callback
                if (canvas._tileLoaded) {
                    //console.log("loaded!");
                    canvas._tileLoaded(null, canvas);
                    // remove the function so it can't be called twice
                    canvas._tileLoaded = null;
                }

                redraw();
                terrainLayer.redrawQueue.push(redraw);

                pixels = null;
                png = null;
            }
            // error decoding PNG
            else if (canvas._tileLoaded) canvas._tileLoaded(null, canvas);
        };
        // if network error, fire loaded callback 
        xhr.onerror = function() {
            if (canvas._tileLoaded) canvas._tileLoaded(null, canvas);
        }
        xhr.send(null);
    }

    terrainLayer.redraw = function() {
        if (terrainLayer.needsRedraw) {
            terrainLayer.redrawQueue.forEach(function(redraw) { redraw(); });
        }
        terrainLayer.needsRedraw = false;
        L.Util.requestAnimFrame(terrainLayer.redraw);
    }
    terrainLayer.redraw();

    terrainLayer.setOverlayType = function(overlayType) {
        terrainLayer.options.updateWhenIdle = (!overlayType);
        //console.log("updateWhenIdle: " + terrainLayer.options.updateWhenIdle);
        terrainLayer.overlayType = overlayType;
        terrainLayer.needsRedraw = true;
    }
    terrainLayer.setCustomParams = function(customParams) {
        terrainLayer.customParams = customParams;
        terrainLayer.needsRedraw = true;
    }

    // ----- Terrain data querying ------

    function convertInt(_int) {
        return [
            (0xFFFE0000 & _int) >> 17, // elevation
            (0x1FC00 & _int) >> 10, // slope
            (0x1FF & _int) // aspect
        ];
    }

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

    terrainLayer.getTerrainData = function(lat, lng, index, original) {
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
        
        // promise
        var promise = $q.defer();

        var tile_id = tilePoint.x + ":" + tilePoint.y + ":" + parseInt(terrainLayer._map.getZoom());
        var tile = terrainLayer._tiles[tile_id]
        if (!tile) {
            //promise.resolve(null);
            return promise.promise;
        }

        var canvas = tile.el;

        // wait for tile to load
        canvas._terrainLoaded.promise.then(function() {
            // make sure terrain is loaded
            if (!canvas._terrainData) return;

            // make sure coords are with bounds
            if (pointInTile.x > 255) pointInTile.x = 255;
            if (pointInTile.y > 255) pointInTile.y = 255;
            if (pointInTile.x < 0) pointInTile.x = 0;
            if (pointInTile.y < 0) pointInTile.y = 0;

            // convert xy coord to 2d array index
            var arrayIndex = (pointInTile.y * 256 + pointInTile.x);

            // get terrain data
            var _terrainData = convertInt(canvas._terrainData[arrayIndex]);

            var terrainData = { 
                lat: lat,
                lng: lng,

                index: index,
                pointInTile: pointInTile,
                original: original,

                elevation: _terrainData[0],
                slope: _terrainData[1],
                aspect: _terrainData[2]
            };

            // if empty values, make null
            if (terrainData && terrainData.elevation == 127 && terrainData.slope == 127 && terrainData.aspect == 511) {
                terrainData.elevation = null;
                terrainData.slope = null;
                terrainData.aspect = null;
            }
            promise.resolve(terrainData);
        });
        return promise.promise;
    }

    // since 'getTerrainDataBulk' is using terrain tile worker threads, the data 
    // callback will only return after all tiles have loaded, so we don't have
    // to worry about checking if terrain tiles have been loaded before querying.
    terrainLayer.getTerrainDataBulk = function(points, callback) {
        //console.log("getTerrainDataBulk!");
        var promises = [];
        // call 'getTerrainData' for each point
        for (var i = 0; i < points.length; i++) {
            var promise = terrainLayer.getTerrainData(points[i].lat, points[i].lng, 
            i, // index
            points[i].original // original
            );
            promises.push(promise);
        }
        // keep track of recieved data in original order
        var receivedPoints = [];
        $q.all(promises).then(function(results) {
            //console.log("everything resolved!");
            for (var i = 0; i < results.length; i++) {
                var terrainData = results[i];
                receivedPoints[terrainData.index] = terrainData;
            }
            callback(receivedPoints);
        });
    }
    return terrainLayer;
};

module.exports = AvatechTerrainLayer;
