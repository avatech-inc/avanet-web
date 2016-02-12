
// <reference path="../../definitions/blueimp-md5.d.ts" />
import md5 = require('blueimp-md5')

interface Response {
    hash: string
}

const readBinaryFile = (
    file: Blob,
    callback: Function
) => {
    let reader = new FileReader()
    reader.onload = e => callback(reader.result)
    reader.readAsArrayBuffer(file)
}

const readTextFile = (
    file: Blob,
    callback: Function
) => {
    let reader = new FileReader()
    reader.onload = e => callback(reader.result)
    reader.readAsText(file)
}

export const readSerial = (
    serial: Blob,
    callback: Function
) => {
    readTextFile(serial, (content: string) => {
        let deviceSerial = content.replace(/(\r\n|\n|\r)/gm, '').trim()

        callback(deviceSerial)
    })
}

const generateHash = (
    filename: string,
    deviceSerial: string
) => {
    let fileNumber: number = parseInt(filename.substr(1), 10)

    return md5(deviceSerial + (fileNumber + ''))
}

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

const uploadFile = (
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
