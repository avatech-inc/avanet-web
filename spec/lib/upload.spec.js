
/* global describe:true, it:true, expect:true */

import {
    readBinaryFile,
    readTextFile,
    readSerial,
    generateHash,
    hashFilenames
} from '../../src/modules/sp-profile-upload/upload'

describe('readBinaryFile', () => {
    it('reads a blob to a byte array', done => {
        let fileBlob = new Blob(['hello'], { type: 'application/octet-stream' })

        readBinaryFile(fileBlob, value => {
            expect(value.byteLength).toBe(5)

            done()
        })
    })
})

describe('readTextFile', () => {
    it('reads a blob to a string', done => {
        let fileBlob = new Blob(['hello'], { type: 'text/plain' })

        readTextFile(fileBlob, value => {
            expect(value).toBe('hello')

            done()
        })
    })
})

describe('readSerial', () => {
    it('reads a serial from a file', done => {
        let fileBlob = new Blob(['SP215500100479 \r\n'], { type: 'text/plain' })

        readSerial(fileBlob, serial => {
            expect(serial).toBe('SP215500100479')

            done()
        })
    })
})

describe('generateHash', () => {
    it('returns an md5 hash of a filename and device serial', () => {
        let hash = generateHash('P0000007', 'SP215500100479')

        expect(hash).toBe('92ee1a933bbab2f5d3e626f1c45a911d')  // md5('SP215500100479' + '7')
    })
})

describe('hashFilenames', () => {
    it('returns an object of hashes -> files for a file list', () => {
        let files = [
            { name: 'P0000007' },
            { name: 'P0000008' },
            { name: 'P0000009' },
            { name: 'P0000010' },
            { name: 'P0000011' }
        ]

        let hashes = hashFilenames(files, 'SP215500100479')

        expect(Object.keys(hashes)).toEqual([
            '92ee1a933bbab2f5d3e626f1c45a911d',
            '8f3969f02c949252369cfca7b96a2171',
            '605715a92436c8455ff5f26577d68b38',
            'd76eb19b4284a9f7d3dc73b6ccfe80e5',
            'f0f2d46c56032da0249a67209515ef76'
        ])
    })
})
