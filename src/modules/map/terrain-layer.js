
// By Andrew Sohn
// Modified by Peter Crosby, starting early Feb 16
// (C) 2015 Avatech, Inc.

import ProtoBuf from 'protobufjs'
import TerrainPbf from './terrain-config/terrain-pbf'
import TerrainSources from './terrain-config/terrain-sources'

const AvatechTerrainLayer = L.GridLayer.extend({
    initialize: function (options) {
        let injector = angular.injector(['ng', 'terrain'])

        this.$q = injector.get('$q')
        this.terrainVisualization = injector.get('terrainVisualization')

        options.underzoom = true
        options.updateWhenIdle = true
        options.maxNativeZoom = 13

        this.redrawQueue = []
        this.needsRedraw = false
        this.redraw.call(this)

        this.options = L.setOptions(this, options)
        // decode pbf
        var builder = ProtoBuf.loadProtoFile(TerrainPbf.protoModel)
        this.raster = builder.build(TerrainPbf.protoName)
    },

    createTile: function (tilePoint, tileLoaded) {
        // create tile canvas element
        let tile = L.DomUtil.create('canvas', 'leaflet-tile always-show')

        // setup tile width and height according to the options
        let size = this.getTileSize()

        tile.width = size.x
        tile.height = size.y

        // attach tileLoaded callback to element for easier access down the chain
        tile._tileLoaded = tileLoaded

        tile._terrainLoaded = this.$q.defer()

        // if tileLoaded not specified, call dummy function
        if (!tile._tileLoaded) tile._tileLoaded = () => {}

        // draw tile
        this.drawTile.call(this, tile, tilePoint)

        // return tile so Leaflet knows to expect tileLoaded callback later
        return tile
    },

    getTileSize: function () {
        let map = this._map
        let tileSize = L.GridLayer.prototype.getTileSize.call(this)
        let zoom = this._tileZoom
        let zoomN = this.options.maxNativeZoom
        // console.log(this.options)
        // // increase tile size for zoom level 12 (scale up from 11)
        // if ((Object.getPrototypeOf().$type.name === 'RasterESA')) {
        // if (Object.getPrototypeOf(this.raster)) {
        //     tileSize = new L.Point(512, 512); // 128
        // }
        // // increase tile size when overzooming (scalw down from 13)
        // } else {
        //     tileSize = (
        //         zoomN !== null &&
        //         zoom > zoomN
        //     ) ? tileSize.divideBy(map.getZoomScale(zoomN, zoom)).round() : tileSize
        // }
        if (parseInt(zoom, 10) === 12) {
            tileSize = new L.Point(512, 512); // 128
        }

        return tileSize
    },

    updateTile: function (ctx, pixels) {
        // get tile size
        let tileSize = ctx.canvas.width

        // clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // get new pixels from worker thread response
        let _pixels = new Uint8ClampedArray(pixels)

        // regular size tile
        if (tileSize === 256) {
            let imgData = ctx.createImageData(256, 256)

            imgData.data.set(_pixels)
            ctx.putImageData(imgData, 0, 0)

        // scale for overzoom and underzoom
        } else {
            let tempCanvas = document.createElement('canvas')

            tempCanvas.width = 256
            tempCanvas.height = 256

            let tempContext = tempCanvas.getContext('2d')
            let imgData = tempContext.createImageData(256, 256)

            imgData.data.set(_pixels)
            tempContext.putImageData(imgData, 0, 0)

            ctx.drawImage(tempCanvas, 0, 0, 256, 256, 0, 0, tileSize, tileSize)
        }
    },

    drawTile: function (canvas, tilePoint) {
        let context = canvas.getContext('2d')
        // context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        let redraw = (tag) => {
            // if no terrain overlay specified, clear canvas
            if (!this.overlayType) {
                context.clearRect(0, 0, canvas.width, canvas.height)
                return
            }

            // get pixels
            let pixels

            if (this.overlayType === 'hillshade') {
                pixels = this.terrainVisualization.hillshade(canvas._terrainData)
            } else {
                pixels = this.terrainVisualization.render(
                    canvas._terrainData,
                    this.overlayType,
                    this.customParams,
                    tag
                )
            }

            // if ((tag === 'png') && (tilePoint.z === 12)) {
            //     // var tileSize = new L.Point(512, 512); // 128
            //     canvas.width = 512
            //     canvas.height = 512
            //     context = canvas.getContext('2d')
            // }

            // draw canvas
            this.updateTile(context, pixels.buffer);
        }

        // adjust zoom point for overzoom
        // if (tilePoint.z > this.options.maxNativeZoom) {
        //     tilePoint.z = this.options.maxNativeZoom
        // }

        // make zoom level 12 overzoomed from 11
        if (parseInt(tilePoint.z, 10) === 12) {
            tilePoint.z = 11
        }

        let xhr = new XMLHttpRequest

        // first try to pull a pbf tile
        let pbfUrl = L.Util.template(TerrainSources.pbfV2, L.extend(tilePoint))
        xhr.open('GET', pbfUrl, true)
        xhr.responseType = 'arraybuffer'

        xhr.onreadystatechange = function () {
            var _z
            // if xhr is DONE and didn't succeed
            if (xhr.readyState === 4 && xhr.status !== 200) {
                // if xhr was looking for a pbf zxytile
                if (xhr.responseURL.indexOf('.pbf') > -1) {
                    var splits = xhr.responseURL.split('/')
                    // if (parseInt(splits[splits.length - 3], 10) === 12) {
                    //     _z = 11
                    // } else {
                    //     _z = splits[splits.length - 3]
                    // }
                    let pngUrl = L.Util.template(TerrainSources.pngV1, L.extend({
                        // console.log(tilePoint)
                        // make zoom level 12 overzoomed from 11
                        z: splits[splits.length - 3],
                        x: splits[splits.length - 2],
                        y: splits[splits.length - 1].split('_')[0],
                    }, {
                        s: () => {
                            let subdomains = 'abc'
                            var add = tilePoint.x + tilePoint.y
                            return subdomains[Math.abs(add) % subdomains.length]
                        }
                    }))
                    // then try to pull a png tile if pbf fails
                    xhr.open('GET', pngUrl, true)
                    xhr.send(null)
                }
            }
        }

        xhr.onload = () => {
            let data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer)
            let tile
            // if anything other than a 200 status code is recieved, fire loaded callback
            if (xhr.status !== 200) {
                return canvas._tileLoaded(null, canvas)
            }

            if (xhr.responseURL.indexOf('pbf') > -1) {
                tile = this.raster.decode(data)

                // if PBF was succesfully decoded
                if (tile) {
                    canvas._terrainData = tile;
                    canvas._terrainLoaded.resolve();

                    // fire tileLoaded callback
                    if (canvas._tileLoaded) {
                        canvas._tileLoaded(null, canvas)
                        // remove the function so it can't be called twice
                        canvas._tileLoaded = null
                    }

                    redraw('pbf')
                    this.redrawQueue.push(redraw.bind(this, 'pbf'))

                    tile = null
                // error decoding PBF
                } else if (canvas._tileLoaded) {
                    canvas._tileLoaded(null, canvas)
                }
            } else if (xhr.responseURL.indexOf('png') > -1) {
                tile = new PNG(data)

                // if PNG was succesfully decoded
                if (tile) {
                    let pixels = tile.decodePixels()

                    canvas._terrainData = new Uint32Array(new Uint8ClampedArray(pixels).buffer)
                    canvas._terrainLoaded.resolve()

                    // fire tileLoaded callback
                    if (canvas._tileLoaded) {
                        // console.log("loaded!")
                        canvas._tileLoaded(null, canvas)

                        // remove the function so it can't be called twice
                        canvas._tileLoaded = null
                    }

                    redraw('png')
                    this.redrawQueue.push(redraw.bind(this, 'png'))

                    pixels = null
                    tile = null
                // error decoding PNG
                } else if (canvas._tileLoaded) {
                    canvas._tileLoaded(null, canvas)
                }
            }
        }
        // if network error, fire loaded callback
        xhr.onerror = () => {
            if (canvas._tileLoaded) {
                canvas._tileLoaded(null, canvas)
            }
        }

        xhr.send(null)
    },

    redraw: function () {
        if (this.needsRedraw) {
            this.redrawQueue.forEach(redraw => redraw.call(this))
        }

        this.needsRedraw = false

        L.Util.requestAnimFrame(this.redraw.bind(this))
    },

    setOverlayType: function (overlayType) {
        this.options.updateWhenIdle = (!overlayType)

        // console.log("updateWhenIdle: " + terrainLayer.options.updateWhenIdle);

        this.overlayType = overlayType
        this.needsRedraw = true
    },

    setCustomParams: function (customParams) {
        this.customParams = customParams
        this.needsRedraw = true
    },

    _convertInt: function (_int) {
        return [
            (0xFFFE0000 & _int) >> 17, // elevation
            (0x1FC00 & _int) >> 10, // slope
            (0x1FF & _int) // aspect
        ]
    },

    _latLngToTilePoint: function (lat, lng, zoom) {
        let _lat = lat * (Math.PI / 180)


        return {
            x: parseInt(Math.floor((lng + 180) / 360 * (1 << zoom)), 10),
            y: parseInt(Math.floor((1 - Math.log(Math.tan(_lat) + 1 / Math.cos(_lat)) / Math.PI) / 2 * (1 << zoom)), 10),  // eslint-disable-line max-len
            z: zoom
        }
    },

    _tilePointToLatLng: function (x, y, zoom) {
        let n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom)
        return {
            lng: (x / Math.pow(2, zoom) * 360 - 180),
            lat: (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))))
        }
    },

    getTerrainData: function (lat, lng, index, original) {
        // round down lat/lng for fewer lookups
        // 4 decimal places = 11.132 m percision
        // https://en.wikipedia.org/wiki/Decimal_degrees
        // lat = Math.floor(lat)
        // lng = Math.floor(lng)

        // adjust zoom level for overzoom
        let zoom = Math.min(13, this._map.getZoom())
        // let zoom = this._map.getZoom()

        // if (this.options.underzoom) {
        //     if (parseInt(zoom, 10) === 12) {
        //         zoom = 11 // 13
        //     }
        // }

        // get xyz of clicked tile based on clicked lat/lng
        let tilePoint = this._latLngToTilePoint(lat, lng, zoom)

        // get nw lat/lng of tile
        let backToLatLng = this._tilePointToLatLng(tilePoint.x, tilePoint.y, zoom)

        // get nw container point of tile
        let nwContainerPoint = this._map.latLngToContainerPoint(backToLatLng)

        // get container point of original lat lng
        let containerPoint = this._map.latLngToContainerPoint(L.latLng(lat, lng))

        // subtract queried point from nw container point to get point within tile
        let pointInTile = {
            x: containerPoint.x - nwContainerPoint.x,
            y: containerPoint.y - nwContainerPoint.y
        }

        // adjust points for overzoom
        // if (this._map.getZoom() > this.options.maxNativeZoom) {
        //     let zoomDifference = this._map.getZoom() - this.options.maxNativeZoom
        //     let zoomDivide = Math.pow(2, zoomDifference)

        //     pointInTile.x = Math.floor(pointInTile.x / zoomDivide)
        //     pointInTile.y = Math.floor(pointInTile.y / zoomDivide)

        // // adjust points for underzoom
        // } else if (this.options.underzoom && parseInt(this._map.getZoom(), 10) === 12) {
        //     let zoomDifference = this._map.getZoom() - 11
        //     let zoomDivide = Math.pow(2, zoomDifference)

        //     pointInTile.x = Math.floor(pointInTile.x / zoomDivide)
        //     pointInTile.y = Math.floor(pointInTile.y / zoomDivide)

        //     // previous underzoom code
        //     // var zoomDifference = 1;
        //     // var zoomDivide = Math.pow(2, zoomDifference)
        //     // pointInTile.x = Math.floor(pointInTile.x * zoomDivide);
        //     // pointInTile.y = Math.floor(pointInTile.y * zoomDivide);
        // }
        pointInTile.x = Math.floor(pointInTile.x)
        pointInTile.y = Math.floor(pointInTile.y)


        // make sure point is within 256x256 bounds
        if (pointInTile.x > 255) pointInTile.x = 255
        if (pointInTile.y > 255) pointInTile.y = 255
        if (pointInTile.x < 0) pointInTile.x = 0
        if (pointInTile.y < 0) pointInTile.y = 0

        // promise
        let promise = this.$q.defer()

        let tileId = tilePoint.x + ':' + tilePoint.y + ':' + parseInt(this._map.getZoom(), 10)
        let tile = this._tiles[tileId]

        if (!tile) {
            // promise.resolve(null);
            return promise.promise
        }
        let canvas = tile.el

        // wait for tile to load
        canvas._terrainLoaded.promise.then(() => {
            // make sure terrain is loaded
            if (!canvas._terrainData) return

            // make sure coords are with bounds
            if (pointInTile.x > 255) pointInTile.x = 255
            if (pointInTile.y > 255) pointInTile.y = 255
            if (pointInTile.x < 0) pointInTile.x = 0
            if (pointInTile.y < 0) pointInTile.y = 0

            let esaData
            // GET TERRRAIN DATA
            if (Object.getPrototypeOf(canvas._terrainData).$type !== undefined) {
                if ((Object.getPrototypeOf(canvas._terrainData).$type.name === 'RasterESA')) {
                    // PBF
                    esaData = [
                        canvas._terrainData.rows[pointInTile.y].cells[pointInTile.x].elev,
                        canvas._terrainData.rows[pointInTile.y].cells[pointInTile.x].slope,
                        canvas._terrainData.rows[pointInTile.y].cells[pointInTile.x].aspect
                    ]
                }
            } else {
                // PNG
                // convert xy coord to 2d array index
                let arrayIndex = (pointInTile.y * 256 + pointInTile.x)
                esaData = this._convertInt(canvas._terrainData[arrayIndex])
            }

            let terrainData = {
                lat: lat,
                lng: lng,

                index: index,
                pointInTile: pointInTile,
                original: original,

                elevation: esaData[0],
                slope: esaData[1],
                aspect: esaData[2]
            }


            // if empty values, make null
            if (terrainData &&
                terrainData.elevation === 127 &&
                terrainData.slope === 127 &&
                terrainData.aspect === 511
            ) {
                terrainData.elevation = null
                terrainData.slope = null
                terrainData.aspect = null
            }
            promise.resolve(terrainData)
        })
        return promise.promise
    },

    // since 'getTerrainDataBulk' is using terrain tile worker threads, the data
    // callback will only return after all tiles have loaded, so we don't have
    // to worry about checking if terrain tiles have been loaded before querying.
    getTerrainDataBulk: function (points, callback) {
        // console.log("getTerrainDataBulk!");
        let promises = []

        // call 'getTerrainData' for each point
        for (let i = 0; i < points.length; i++) {
            let promise = this.getTerrainData(
                points[i].lat,
                points[i].lng,
                i, // index
                points[i].original // original
            )
            promises.push(promise)
        }

        // keep track of recieved data in original order
        let receivedPoints = []

        this.$q.all(promises).then(results => {
            // console.log("everything resolved!");

            for (let i = 0; i < results.length; i++) {
                let terrainData = results[i]
                receivedPoints[terrainData.index] = terrainData
            }
            callback(receivedPoints)
        })
    }
})

export default AvatechTerrainLayer
