"use strict";
/// <reference path="../../definitions/blueimp-md5.d.ts" />
var md5 = require('blueimp-md5');
/**
 * Reads a binary file as array buffer.
 *
 * @param  {Blob}     file - File to read.
 * @param  {Function} callback - Called once file is read.
 */
exports.readBinaryFile = function (file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) { return callback(reader.result); };
    reader.readAsArrayBuffer(file);
};
/**
 * Reads a text file as text.
 *
 * @param  {Blob}     file - File to read.
 * @param  {Function} callback - Called once file is read.
 */
exports.readTextFile = function (file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) { return callback(reader.result); };
    reader.readAsText(file);
};
/**
 * Reads the device serial from a file.
 *
 * @param  {Blob}     file - File to read serial from.
 * @param  {Function} callback - Called once the serial is read.
 */
exports.readSerial = function (serial, callback) {
    exports.readTextFile(serial, function (content) {
        var deviceSerial = content.replace(/(\r\n|\n|\r)/gm, '').trim();
        callback(deviceSerial);
    });
};
/**
 * Generates a hash from a filename and serial.
 *
 * @param  {string} filename - The filename to hash.
 * @param  {string} deviceSerial - The serial to hash the filename with.
 * @returns {string} The md5 hash.
 */
exports.generateHash = function (filename, deviceSerial) {
    var fileNumber = parseInt(filename.substr(1), 10);
    return md5(deviceSerial + (fileNumber + ''));
};
/**
 * Return a mapping of hashes -> files for a FileList.
 *
 * @param  {FileList} files - The files to generate hashes for.
 * @param  {string} deviceSerial - The serial to hash the filenames with.
 * @return {FileHashMap} An object of hashes -> files.
 */
exports.hashFilenames = function (files, deviceSerial) {
    var fileHashes = {};
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.name.length === 8 &&
            file.name.toLowerCase().indexOf('p') === 0) {
            var hash = exports.generateHash(file.name, deviceSerial);
            fileHashes[hash] = file;
        }
    }
    return fileHashes;
};
/**
 * Bulk upload binary data to an endpoint with an auth token header.
 *
 * @param  {ArrayBuffer} bulkBinary - Binary data to upload.
 * @param  {string} endpoint - The URL endpoint to upload to.
 * @param  {string} token - The auth token header value to set.
 * @param  {Function} callback - Called when the data finishes uploading.
 * @param  {Function} error - Called if the API returns an error.
 */
exports.uploadBulk = function (bulkBinary, endpoint, token, callback, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                callback(data);
            }
            else {
                var data = JSON.parse(xhr.responseText);
                error(data);
            }
        }
    };
    xhr.open('POST', endpoint, true);
    xhr.setRequestHeader('Auth-Token', token);
    xhr.send(bulkBinary);
};
/**
 * Upload files passed by a mapping of hashes -> files, but only for hashes found
 * in the newHashes array. Files are uploaded to endpoint with an auth token header.
 *
 * @param  {FileHashMap} hashes - An object of hashes -> files.
 * @param  {Array<string>} newHashes - Array of hashes to upload.
 * @param  {string} endpoint - The URL endpoint to upload to.
 * @param  {string} token - The auth token header value to set.
 * @param  {Function} progress - Funciton to call as upload progresses.
 * @param  {Function} callback - Called when the data finishes uploading.
 */
exports.uploadFiles = function (hashes, newHashes, endpoint, token, progress, callback) {
    var binaries = [];
    var delimiter = new ArrayBuffer(255);
    var view = new DataView(delimiter);
    for (var i = 0; i < 255; i++) {
        view.setInt8(i, 1);
    }
    var uploadCallback = function (data) {
        callback(data.hashes);
    };
    var errorCallback = function (data) {
        throw data.message;
    };
    var readCallback = function (binary) {
        binaries.push(delimiter);
        binaries.push(binary);
        progress(((binaries.length / 2) / newHashes.length * 100).toFixed(0));
        if ((binaries.length / 2) === newHashes.length) {
            binaries.push(delimiter);
            var bulkBlob = new Blob(binaries);
            exports.readBinaryFile(bulkBlob, function (bulkBinary) { return exports.uploadBulk(bulkBinary, endpoint, token, uploadCallback, errorCallback); });
        }
    };
    for (var _i = 0, newHashes_1 = newHashes; _i < newHashes_1.length; _i++) {
        var hash = newHashes_1[_i];
        exports.readBinaryFile(hashes[hash], readCallback);
    }
};
