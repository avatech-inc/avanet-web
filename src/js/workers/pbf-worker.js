
var proto = 'syntax = "proto2";' +
'message Row {' +
'  repeated int32 cells = 1 [packed=true];' +
'}' +
'message RasterESA {' +
'  repeated Row rows = 1;' +
'}'

importScripts('bytebuffer.js', 'protobuf.js')

var PbfDecoder = ProtoBuf.loadProto(proto, 'RasterESA.proto').build('RasterESA')

self.addEventListener('message', function (e) {
    let buffer = PbfDecoder.decode(e.data.data)

    self.postMessage({ key: e.data.key, buffer: buffer })
}, false);
