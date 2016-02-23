/// <reference path="../../definitions/blueimp-md5.d.ts" />
import md5 = require('blueimp-md5')

/**
 * JSON API responses from server.
 */
interface BulkResponse {
    hashes: Array<string>
}

interface ErrorResponse {
    message: string
}

/**
 * Reads a binary file as array buffer.
 *
 * @param  {Blob}     file - File to read.
 * @param  {Function} callback - Called once file is read.
 */
export const readBinaryFile = (
    file: Blob,
    callback: Function
) => {
    let reader = new FileReader()
    reader.onload = e => callback(reader.result)
    reader.readAsArrayBuffer(file)
}

/**
 * Reads a text file as text.
 *
 * @param  {Blob}     file - File to read.
 * @param  {Function} callback - Called once file is read.
 */
export const readTextFile = (
    file: Blob,
    callback: Function
) => {
    let reader = new FileReader()
    reader.onload = e => callback(reader.result)
    reader.readAsText(file)
}

/**
 * Reads the device serial from a file.
 *
 * @param  {Blob}     file - File to read serial from.
 * @param  {Function} callback - Called once the serial is read.
 */
export const readSerial = (
    serial: Blob,
    callback: Function
) => {
    readTextFile(serial, (content: string) => {
        let deviceSerial = content.replace(/(\r\n|\n|\r)/gm, '').trim()

        callback(deviceSerial)
    })
}

/**
 * Generates a hash from a filename and serial.
 *
 * @param  {string} filename - The filename to hash.
 * @param  {string} deviceSerial - The serial to hash the filename with.
 * @returns {string} The md5 hash.
 */
export const generateHash = (
    filename: string,
    deviceSerial: string
) => {
    let fileNumber: number = parseInt(filename.substr(1), 10)

    return md5(deviceSerial + (fileNumber + ''))
}

/**
 * Return a mapping of hashes -> files for a FileList.
 *
 * @param  {FileList} files - The files to generate hashes for.
 * @param  {string} deviceSerial - The serial to hash the filenames with.
 * @return {object} An object of hashes -> files.
 */
export const hashFilenames = (
    files: FileList,
    deviceSerial: string
) => {
    let fileHashes = {}

    for (let i = 0; i < files.length; i++) {
        let file = files[i]

        if (
            file.name.length === 8 &&
            file.name.toLowerCase().indexOf('p') === 0
        ) {
            let hash = generateHash(file.name, deviceSerial)

            fileHashes[hash] = file
        }
    }

    return fileHashes
}

/**
 * Bulk upload binary data to an endpoint with an auth token header.
 *
 * @param  {ArrayBuffer} bulkBinary - Binary data to upload.
 * @param  {string} endpoint - The URL endpoint to upload to.
 * @param  {string} token - The auth token header value to set.
 * @param  {Function} callback - Called when the data finishes uploading.
 * @param  {Function} error - Called if the API returns an error.
 */
export const uploadBulk = (
    bulkBinary: ArrayBuffer,
    endpoint: string,
    token: string,
    callback: Function,
    error: Function
) => {
    let xhr = new XMLHttpRequest()

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText)

                callback(data)
            } else {
                let data = JSON.parse(xhr.responseText)

                error(data)
            }
        }
    }

    xhr.open('POST', endpoint, true)
    xhr.setRequestHeader('Auth-Token', token)
    xhr.send(bulkBinary)
}

/**
 * Upload files passed by a mapping of hashes -> files, but only for hashes found
 * in the newHashes array. Files are uploaded to endpoint with an auth token header.
 *
 * @param  {Object} hashes - An object of hashes -> files.
 * @param  {Array<string>} newHashes - Array of hashes to upload.
 * @param  {string} endpoint - The URL endpoint to upload to.
 * @param  {string} token - The auth token header value to set.
 * @param  {Function} progress - Funciton to call as upload progresses.
 * @param  {Function} callback - Called when the data finishes uploading.
 */
export const uploadFiles = (
    hashes: Object,
    newHashes: Array<string>,
    endpoint: string,
    token: string,
    progress: Function,
    callback: Function
) => {
    let binaries = []
    let delimiter = new ArrayBuffer(255)
    let view = new DataView(delimiter)

    for (var i = 0; i < 255; i++) {
        view.setInt8(i, 1)
    }

    let uploadCallback = (data: BulkResponse) => {
        callback(data.hashes)
    }

    let errorCallback = (data: ErrorResponse) => {
        throw data.message
    }

    let readCallback = binary => {
        binaries.push(delimiter)
        binaries.push(binary)

        progress(((binaries.length / 2) / newHashes.length * 100).toFixed(0))

        if ((binaries.length / 2) === newHashes.length) {
            binaries.push(delimiter)

            let bulkBlob = new Blob(binaries)

            readBinaryFile(bulkBlob, bulkBinary => uploadBulk(
                bulkBinary,
                endpoint,
                token,
                uploadCallback,
                errorCallback
            ))
        }
    }

    for (let hash of newHashes) {
        readBinaryFile(hashes[hash], readCallback)
    }
}
