
importScripts('zlib.js')
importScripts('png.js')

self.addEventListener('message', function (e) {
    var image = new PNG(e.data.data)
    var pixels = image.decodePixels()
    var buffer = new Uint32Array(new Uint8ClampedArray(pixels).buffer)

    self.postMessage({ key: e.data.key, buffer: buffer })
}, false);
