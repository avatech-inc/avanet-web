/// <reference path="../../definitions/blueimp-md5.d.ts" />
import md5 from 'blueimp-md5'

/**
 * JSON API response from server.
 */
interface Response {
    hash: string
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
        let file = files.item(i)

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
 * Upload binary data to an endpoint with an auth token header. shortCircuit
 * is a function that checks if the upload has been aborted.
 *
 * @param  {binary} binary - Binary data to upload.
 * @param  {string} endpoint - The URL endpoint to upload to.
 * @param  {string} token - The auth token header value to set.
 * @param  {Function} shortCircuit - Function that returns a boolean to stop process.
 * @param  {Function} callback - Called when the data finishes uploading.
 */
export const uploadFile = (
    binary,
    endpoint: string,
    token: string,
    shortCircuit: Function,
    callback: Function
) => {
    if (shortCircuit()) return

    let xhr = new XMLHttpRequest()

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText)

                callback(data)
            }
        }
    }

    xhr.open('POST', endpoint, true)
    xhr.setRequestHeader('Auth-Token', token)
    xhr.send(binary)
}

/**
 * Upload files passed by a mapping of hashes -> files, but only for hashes found
 * in the newHashes array. Files are uploaded to endpoint with an auth token header.
 * shortCircuit is a functio nthat checks if the upload has been aborted.
 *
 * @param  {Object} hashes - An object of hashes -> files.
 * @param  {Array<string>} newHashes - Array of hashes to upload.
 * @param  {string} endpoint - The URL endpoint to upload to.
 * @param  {string} token - The auth token header value to set.
 * @param  {Function} shortCircuit - Function that returns a boolean to stop process.
 * @param  {Function} progress - Funciton to call as upload progresses.
 * @param  {Function} callback - Called when the data finishes uploading.
 */
export const uploadFiles = (
    hashes: Object,
    newHashes: Array<string>,
    endpoint: string,
    token: string,
    shortCircuit: Function,
    progress: Function,
    callback: Function
) => {
    if (shortCircuit()) return

    let uploaded = []
    let uploadCount = 0

    let uploadCallback = (data: Response) => {
        if (data.hash) {
            if (uploaded.indexOf(data.hash) === -1) {
                uploaded.push(data.hash)
            }
        }

        uploadCount++

        progress((uploadCount / newHashes.length * 100).toFixed(0))

        if (uploadCount === newHashes.length) {
            callback(uploaded)
        }
    }

    let readCallback = binary => uploadFile(binary, endpoint, token, shortCircuit, uploadCallback)

    for (let hash of newHashes) {
        readBinaryFile(hashes[hash], readCallback)
    }
}
