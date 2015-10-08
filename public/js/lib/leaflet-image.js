(function(e){if("function"==typeof bootstrap)bootstrap("leafletimage",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeLeafletImage=e}else"undefined"!=typeof window?window.leafletImage=e():global.leafletImage=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var queue = require('./queue');

module.exports = function leafletImage(map, callback) {

    var dimensions = map.getSize(),
        layerQueue = new queue(1);

    var multiplier = window.devicePixelRatio;

    var canvas = document.createElement('canvas');
    canvas.width = dimensions.x * multiplier;
    canvas.height = dimensions.y * multiplier;
    var ctx = canvas.getContext('2d');

    // layers are drawn in the same order as they are composed in the DOM:
    // tiles, paths, and then markers

    // 1. base map
    map.eachLayer(function(l) {
        if (l instanceof L.TileLayer && !l.overlayType)
            layerQueue.defer(handleTileLayer, l);
    });
    // 2. terrain overlay
    map.eachLayer(function(l) {
        if (l.overlayType)
            layerQueue.defer(handleTileLayer, l);
    });
    // 3. graticule overlay
    // todo: this needs to be revisited if we ever add additional L.CanvasLayer layers
    map.eachLayer(function(l) {
        if (l instanceof L.CanvasLayer)
            layerQueue.defer(handleCanvasLayer, l._canvas);
        //   if (l._heat) {
        //     layerQueue.defer(handlePathRoot, l._canvas);
        // }
    });

    // SVG paths
    var overlayPane = map.getPanes().overlayPane;
    if (overlayPane) {
        layerQueue.defer(handlePathRoot, overlayPane.childNodes[0]);
    }


    // else if (map._panes && map._panes.overlayPane.firstChild) {
    //     layerQueue.defer(handlePathRoot, map._panes.overlayPane.firstChild);
    // }

    // makers
    //map.eachLayer(drawMarkerLayer);

    layerQueue.awaitAll(layersDone);

    // function drawMarkerLayer(l) {
    //     if (l instanceof L.Marker && l.options.icon instanceof L.Icon) {
    //         layerQueue.defer(handleMarkerLayer, l);
    //     }
    // }

    function done() {
        callback(null, canvas);
    }

    function layersDone(err, layers) {
        if (err) throw err;
        layers.forEach(function(layer) {
            if (layer && layer.canvas) {
                ctx.drawImage(layer.canvas, 0, 0);
            }
        });
        done();
    }

    function latLngToTilePoint(lat, lng, zoom) {
        lat *= (Math.PI/180);
        return {
            x: parseInt(Math.floor( (lng + 180) / 360 * (1<<zoom) )),
            y: parseInt(Math.floor( (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * (1<<zoom) ))
        }
    }

    function getPos(tile) {
        var parentPos = map._container.getBoundingClientRect(),
        childrenPos = tile.el.getBoundingClientRect(),
        relativePos = {};

        relativePos.top = childrenPos.top - parentPos.top,
        relativePos.right = childrenPos.right - parentPos.right,
        relativePos.bottom = childrenPos.bottom - parentPos.bottom,
        relativePos.left = childrenPos.left - parentPos.left;

        return relativePos;
    }

    function handleTileLayer(layer, callback) {
        var canvas = document.createElement('canvas');

        var layerOpacity = parseFloat(layer.options.opacity);

        canvas.width = dimensions.x * multiplier;
        canvas.height = dimensions.y * multiplier;

        var ctx = canvas.getContext('2d'),
            bounds = map.getPixelBounds(),
            origin = map.getPixelOrigin(),
            zoom = map.getZoom();

        if (zoom > layer.options.maxZoom ||
            zoom < layer.options.minZoom ||
            // mapbox.tileLayer
            (layer.options.format && !layer.options.tiles)) {
            return callback();
        }

        var tileSize, tileSizeBase;
        // get size of tile
        if (layer._tiles && Object.keys(layer._tiles).length > 0) {
            //tileSize = layer._tiles[Object.keys(layer._tiles)[0]].clientHeight;
            tileSize = layer._tiles[Object.keys(layer._tiles)[0]].el.getBoundingClientRect().width;
            tileSizeBase = layer._tiles[Object.keys(layer._tiles)[0]].el.clientHeight;
        }
        // if no tiles available, don't continue
        else return;


        var tiles = [], tileQueue = new queue(1);

        var mapBounds = map.getBounds();
        var tileBounds_NE = latLngToTilePoint(mapBounds._northEast.lat, mapBounds._northEast.lng, map.getZoom());
        var tileBounds_SW = latLngToTilePoint(mapBounds._southWest.lat, mapBounds._southWest.lng, map.getZoom());

        tileBounds_NE.x -= 5;
        tileBounds_NE.y += 5;
        tileBounds_SW.x += 5;
        tileBounds_SW.y -= 5;

        tileBounds_NE.x *= (256 / tileSizeBase);
        tileBounds_NE.y *= (256 / tileSizeBase);
        tileBounds_SW.x *= (256 / tileSizeBase);
        tileBounds_SW.y *= (256 / tileSizeBase);

        tileBounds_NE.x = Math.round(tileBounds_NE.x);
        tileBounds_NE.y = Math.round(tileBounds_NE.y);
        tileBounds_SW.x = Math.round(tileBounds_SW.x);
        tileBounds_SW.y = Math.round(tileBounds_SW.y);

        var tileBounds = L.bounds(
            L.point(tileBounds_SW.x, tileBounds_NE.y),
            L.point(tileBounds_NE.x, tileBounds_SW.y)
        );
        for (var j = tileBounds.min.y; j <= tileBounds.max.y; j++) {
            for (var i = tileBounds.min.x; i <= tileBounds.max.x; i++) {
                tiles.push(new L.Point(i, j));
            }
        }

        tiles.forEach(function(tilePoint) {
            if (tilePoint.y >= 0) {
                //var tile = layer._tiles[tilePoint.x + ':' + tilePoint.y];
                var tile = layer._tiles[tilePoint.x + ':' + tilePoint.y + ":" + layer._tileZoom];
                // if tile isn't found, ignore
                if (!tile) return;

                var tilePos = getPos(tile);
                tilePos = { x: tilePos.left, y: tilePos.top }
                //tileQueue.defer(canvasTile, tile, tilePos, tileSize, layerOpacity);
                tileQueue.defer(canvasTile, tile.el, tilePos, tileSize, layerOpacity);
            }
        });

        tileQueue.awaitAll(tileQueueFinish);

        function canvasTile(tile, tilePos, tileSize, layerOpacity, callback) {
            callback(null, {
                img: tile,
                pos: tilePos,
                size: tileSize,
                opacity: layerOpacity
            });
        }

        function tileQueueFinish(err, data) {
            data.forEach(drawTile);
            callback(null, { canvas: canvas });
        }
        function drawTile(d) {
            if (d.opacity != null) ctx.globalAlpha = d.opacity;
            ctx.drawImage(d.img, 
                Math.floor(d.pos.x * multiplier), // x
                Math.floor(d.pos.y * multiplier), // y
                d.size * multiplier, // width
                d.size * multiplier  // height
            );
            if (d.opacity != null) ctx.globalAlpha = 1;
        }
    }

    function handlePathRoot(root, callback) {
        console.log("ROOT:");
        console.log(root);

        var bounds = map.getPixelBounds(),
            origin = map.getPixelOrigin(),
            pos = L.DomUtil.getPosition(root).subtract(bounds.min).add(origin),
            can = root,
            canvasMultiplier = multiplier;


        // if SVG, convert to canvas
        if (root.constructor.toString().indexOf("SVGSVGElement") != -1) {
            var width = parseInt(root.getAttribute('width') * 2);
            var height = parseInt(root.getAttribute('height') * 2);
            // get SVG string
            var SVGstring = new XMLSerializer().serializeToString(root);
            // viewBox attribute maintains scale
            SVGstring = "<svg viewBox='" + root.getAttribute("viewBox") + "'>" + SVGstring.substr(SVGstring.indexOf(">") + 1);

            // draw SVG to canvas
            var _canvas = document.createElement('canvas');
            _canvas.width = width;
            _canvas.height = height; 
            canvg(_canvas, SVGstring, { ignoreMouse: true, ignoreAnimation: true });//, scaleWidth: width, scaleHeight: height }) 

            can = _canvas;
            canvasMultiplier = 1;
        }

        // draw canvas
        var canvas = document.createElement('canvas');
        canvas.width = dimensions.x * multiplier;
        canvas.height = dimensions.y * multiplier;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(can, pos.x * multiplier, pos.y * multiplier, can.width * canvasMultiplier, can.height * canvasMultiplier);
        callback(null, { canvas: canvas });
    }

    function handleCanvasLayer(root, callback) {
        var canvas = document.createElement('canvas');
        canvas.width = dimensions.x * multiplier;
        canvas.height = dimensions.y * multiplier;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(root, 0, 0, root.width, root.height);
        callback(null, { canvas: canvas });
    }

    // function handleMarkerLayer(marker, callback) {
    //     var canvas = document.createElement('canvas'),
    //         ctx = canvas.getContext('2d'),
    //         pixelBounds = map.getPixelBounds(),
    //         minPoint = new L.Point(pixelBounds.min.x, pixelBounds.min.y),
    //         pixelPoint = map.project(marker.getLatLng()),
    //         isBase64 = /^data\:/.test(marker._icon.src),
    //         url = isBase64 ? marker._icon.src : addCacheString(marker._icon.src),
    //         im = new Image(),
    //         options = marker.options.icon.options,
    //         size = options.iconSize,
    //         pos = pixelPoint.subtract(minPoint),
    //         anchor = L.point(options.iconAnchor || size && size.divideBy(2, true));

    //     if (size instanceof L.Point) size = [size.x, size.y];

    //     var x = pos.x - size[0] + anchor.x,
    //         y = pos.y - anchor.y;

    //     canvas.width = dimensions.x;
    //     canvas.height = dimensions.y;
    //     im.crossOrigin = '';

    //     im.onload = function() {
    //         ctx.drawImage(this, x, y, size[0], size[1]);
    //         callback(null, {
    //             canvas: canvas
    //         });
    //     };

    //     im.src = url;

    //     if (isBase64) im.onload();
    // }

    function addCacheString(url) {
        return url + ((url.match(/\?/)) ? '&' : '?') + 'cache=' + (+new Date());
    }
};

},{"./queue":2}],2:[function(require,module,exports){
(function() {
  if (typeof module === "undefined") self.queue = queue;
  else module.exports = queue;
  queue.version = "1.0.4";

  var slice = [].slice;

  function queue(parallelism) {
    var q,
        tasks = [],
        started = 0, // number of tasks that have been started (and perhaps finished)
        active = 0, // number of tasks currently being executed (started but not finished)
        remaining = 0, // number of tasks not yet finished
        popping, // inside a synchronous task callback?
        error = null,
        await = noop,
        all;

    if (!parallelism) parallelism = Infinity;

    function pop() {
      while (popping = started < tasks.length && active < parallelism) {
        var i = started++,
            t = tasks[i],
            a = slice.call(t, 1);
        a.push(callback(i));
        ++active;
        t[0].apply(null, a);
      }
    }

    function callback(i) {
      return function(e, r) {
        --active;
        if (error != null) return;
        if (e != null) {
          error = e; // ignore new tasks and squelch active callbacks
          started = remaining = NaN; // stop queued tasks from starting
          notify();
        } else {
          tasks[i] = r;
          if (--remaining) popping || pop();
          else notify();
        }
      };
    }

    function notify() {
      if (error != null) await(error);
      else if (all) await(error, tasks);
      else await.apply(null, [error].concat(tasks));
    }

    return q = {
      defer: function() {
        if (!error) {
          tasks.push(arguments);
          ++remaining;
          pop();
        }
        return q;
      },
      await: function(f) {
        await = f;
        all = false;
        if (!remaining) notify();
        return q;
      },
      awaitAll: function(f) {
        await = f;
        all = true;
        if (!remaining) notify();
        return q;
      }
    };
  }

  function noop() {}
})();

},{}]},{},[1])
(1)
});