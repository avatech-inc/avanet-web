
const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const dataURItoBlob = dataURI => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString

    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1])
    } else {
        byteString = unescape(dataURI.split(',')[1])
    }

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length)

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ia], { type: mimeString })
}

const isNorU = val => (val === null || val === undefined)

const SnowpitExport = [
    '$q',
    'snowpitConstants',
    '$compile',
    '$rootScope',
    'Global',

    (
        $q,
        snowpitConstants,
        $compile,
        $rootScope,
        Global
    ) => {
        let getGrainType = icssg => {
            for (let i = 0; i < snowpitConstants.grainTypes.length; i++) {
                for (let j = 0; j < snowpitConstants.grainTypes[i].types.length; j++) {
                    if (snowpitConstants.grainTypes[i].types[j].icssg === icssg) {
                        return snowpitConstants.grainTypes[i].types[j]
                    }
                }
            }
        }

        let formatters = {
            format: str => {
                if (isNorU(str) || str === '') {
                    return '--'
                }

                return str
            },

            formatOrg: org => {
                if (isNorU(org) || org === '' || !org.name) {
                    return '--'
                }

                return org.name
            },

            formatCm: str => {
                if (isNorU(str)) {
                    return '--'
                }

                return str + ' cm'
            },

            formatCmOrIn: str => {
                if (isNorU(str) || isNaN(str)) {
                    return '--'
                }

                if (Global.user.settings.elevation === 1) {
                    return numberWithCommas(Math.round(parseFloat(str) * 0.393701)) + ' in'
                }

                return numberWithCommas(Math.round(parseFloat(str))) + ' cm'
            },

            formatDistance: str => formatters.formatElevation(str),

            formatKmOrMiles: str => {
                if (isNorU(str) || isNaN(str)) return '--'

                let km = parseFloat(str)

                if (Global.user.settings.elevation === 1) {
                    return (km * 0.621371).toFixed(3) + ' mi'
                }

                return km.toFixed(3) + ' km'
            },

            formatMetersOrFeet: str => formatters.formatElevation(str),

            formatElevation: str => {
                if (isNorU(str) || isNaN(str)) {
                    return '--'
                }

                if (Global.user.settings.elevation === 1) {
                    return numberWithCommas(Math.round(parseFloat(str) * 3.28084)) + ' ft'
                }

                return numberWithCommas(Math.round(parseFloat(str))) + ' m'
            },

            formatTemp: str => {
                let temp = parseFloat(str)

                if (isNorU(str) || isNaN(temp)) return '--'

                if (Global.user.settings.tempUnits === 0) {
                    return temp.toFixed(1) + '°C'
                }

                let newTemp = (temp * 1.8 + 32).toFixed(1)

                return (Math.round(newTemp * 1) / 1).toFixed(0) + '°F'
            },

            formatSlope: str => {
                if (isNorU(str) || isNaN(str)) return '--'

                return parseFloat(str).toFixed(0) + '°'
            },

            formatDirection: str => {
                if (isNorU(str)) return '--'

                let direction = parseFloat(str)
                let _str = str

                if (isNaN(direction)) return '--'

                if ((direction > 354.38 && direction <= 360) ||
                    (direction >= 0 && direction < 5.62)) _str = 'N'
                else if (direction > 5.63 && direction < 16.87) _str = 'NbE'
                else if (direction > 16.88 && direction < 28.12) _str = 'NNE'
                else if (direction > 28.13 && direction < 39.37) _str = 'NEbN'
                else if (direction > 39.38 && direction < 50.62) _str = 'NE'
                else if (direction > 50.63 && direction < 61.87) _str = 'NEbE'
                else if (direction > 61.88 && direction < 73.12) _str = 'ENE'
                else if (direction > 73.13 && direction < 84.37) _str = 'EbN'
                else if (direction > 84.38 && direction < 95.62) _str = 'E'
                else if (direction > 95.63 && direction < 106.87) _str = 'EbS'
                else if (direction > 106.88 && direction < 118.12) _str = 'ESE'
                else if (direction > 118.13 && direction < 129.37) _str = 'SEbE'
                else if (direction > 129.38 && direction < 140.62) _str = 'SE'
                else if (direction > 140.63 && direction < 151.87) _str = 'SEbS'
                else if (direction > 151.88 && direction < 163.12) _str = 'SSE'
                else if (direction > 163.13 && direction < 174.37) _str = 'SbE'
                else if (direction > 174.38 && direction < 185.62) _str = 'S'
                else if (direction > 185.63 && direction < 196.87) _str = 'SbW'
                else if (direction > 196.88 && direction < 208.12) _str = 'SSW'
                else if (direction > 208.13 && direction < 219.37) _str = 'SWbS'
                else if (direction > 219.38 && direction < 230.62) _str = 'SW'
                else if (direction > 230.63 && direction < 241.87) _str = 'SWbW'
                else if (direction > 241.88 && direction < 253.12) _str = 'WSW'
                else if (direction > 253.13 && direction < 264.37) _str = 'WbS'
                else if (direction > 264.38 && direction < 275.62) _str = 'W'
                else if (direction > 275.63 && direction < 286.87) _str = 'WbN'
                else if (direction > 286.88 && direction < 298.12) _str = 'WNW'
                else if (direction > 298.13 && direction < 309.37) _str = 'NWbW'
                else if (direction > 309.38 && direction < 320.62) _str = 'NW'
                else if (direction > 320.63 && direction < 331.87) _str = 'NWbN'
                else if (direction > 331.88 && direction < 343.12) _str = 'NNW'
                else if (direction > 343.13 && direction < 354.37) _str = 'NbW'

                direction = direction.toFixed(0)

                return direction + '° ' + _str
            },

            formatWindSpeed: str => {
                if (isNorU(str) || isNaN(str)) return '--'

                let speed = parseFloat(str)

                // imperial = mi/h
                if (Global.user.settings.elevation === 1) {
                    return (speed * 2.23694).toFixed(2) + ' mi/h'
                }

                // metric = m/s
                return str + ' m/s'
            },

            formatPrecip: str => {
                if (isNorU(str)) return '--'

                if (str === 'NO') return 'No Precipitation'

                if (str === 'RA1') return 'Rain - Very Light'
                if (str === 'RA2') return 'Rain - Light'
                if (str === 'RA3') return 'Rain - Moderate'
                if (str === 'RA4') return 'Rain - Heavy'

                if (str === 'SN1') return 'Snow - Very Light'
                if (str === 'SN2') return 'Snow - Light'
                if (str === 'SN3') return 'Snow - Moderate'
                if (str === 'SN4') return 'Snow - Heavy'
                if (str === 'SN5') return 'Snow - Very Heavy'

                if (str === 'RS') return 'Rain & Snow'
                if (str === 'GR') return 'Graupel & Hail'
                if (str === 'ZR') return 'Freezing Rain'

                return '--'
            },

            formatSky: str => {
                if (isNorU(str) || str === '') return '--'
                if (str === 'CLR') return 'Clear'
                if (str === 'FEW') return 'Few'
                if (str === 'SCT') return 'Scattered'
                if (str === 'BKN') return 'Broken'
                if (str === 'OVC') return 'Overcast'
                if (str === 'X') return 'Obscured'

                return '--'
            },

            /* eslint-disable max-len */
            getSkyIcon: symbol => {
                if (symbol === 'BKN') return 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwRDc0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDg0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBDMTBENTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBENjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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'
                else if (symbol === 'CLR') return 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OERBMzZEQkU0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OERBMzZEQkY0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRCQzQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4REEzNkRCRDQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0zMjIzPUZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYBGSEhKiUqMyAgM0YzKjNGRkY4OEZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRv/AABEIAHEAcAMBIgACEQEDEQH/xAByAAEAAwEBAQEAAAAAAAAAAAAABQYHBAMCAQEBAAAAAAAAAAAAAAAAAAAAABAAAQMBBAULAwUBAAAAAAAAAQACAwQRIRIFMUFRIgbwYXGRobHB0TJCE4FSkuFiIzMUghEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AtiIiAviSRsTS55DWjWVH5lm0WXtsO9IRus89gVLnq6rNZMN7vtY3QOW0oLHWcTRR2tpxjP3G5vmexQM2fVkptx4eZtylqPhcEB1S6/7W+J8lNQ5NRwiwRh3O/e7/AAQUU11VM635Hk8xPggrqqF1vyPB5yfFaSyJkfoaBZdcEfEyT1tBtuvCCgQZ9WQutL8Y2P0dlhVhouJIZzhmHxO26W9er63LvmyajmFhjDedm73eKg67hgjepXW/sd4HzQW1rg8Ymm0HWF+rOIKuqyuTDe2zSx2g8toV0y3NoswbYN2QDeZ5bQgk0REBROcZo2gjwj+14OAbP3fTtUlNK2FjpH+lotKzeWSXMqm3S6R1jRs2DoH6oPuioZszlIab/U97uWtXygy6KhZhjF/udrKZdQMoIhG2zF7nbTy0LtQEREBERAREQcVfl0VczDIL/a7WFQ62hmyyUBxv9THt5alpK4sxoGV8RjdZi9rth5aUHjlOZNr4rTYJG3Pb49BUms5o55Mrq960YThkG0a/MLRWuDgHC8G8IK1xRVlkbadvv3ndA0dvcubhihxF1U8XDdZ06z4dajc/mM1Y/Yyxg+n6kq6ZbTf5aaOPWBa7pN5QdqIiAiIgIiICIiAiIgp/E9EGubUt9267p1FSPDdYZ6f4neqK7/k6PJdmdwfNRyDW0Y/xv7rVU+H6kw1bW+2TdI7urzQctaf9FY+27FJh7bFpDRhAGxZrVWw1jy+6yQk/latKBxC0a0H6iIgIiICIiAiIgIiIPiVgkY5hFocCLOlZvl7jBVx2i8PA7bFpL3YWl2wWrNaPFNVsIF7ng9tqD3zyMx1slus4usK90E4qKeOUe5o69faq5xVTG2OcC6zA49o8V78MVgfG6mdpZvN6Dp6j3oLMiIgIiICIiAiIgIiII/N5RFRyk62lv5XeKpeRxOkrI8PtOI9AU5xRVhsbacaXHE7oGjrPcv3hekwsdUuF7t1vQNPb3IJ6spW1kLoX6HDTsOorPoJZMsqrSN6N1jhtGvrGhaUoLPcp/wBjPmj/ALWDR9w2dOzqQS1LUx1cYliNrTysPOvdZ5lebSZc8gjFGfUzxHOr5TVUdUwSRG0Hs6UHuiIgIiICIiAvCqqY6SMyymxo5WDnSpqo6VhklNgHb0Kh5pm0mYvAAwxj0s8TzoPgmTN6zZjd+Lf0HatCghbBG2NnpaLAonJMr/wx43j+V/q5hs81NICIiCv5vkTaoGWABsukjU7yPI7VU4Kmoy2U4CWOFzmnxC0xclZQQ1rcMrbTqcNI6CgiqLiOCYYZ/wCN232ny5XqcjmZKLY3Bw2tNvcqbVcMTsJMBD26gbj5dqiXUlXSu9D2Hmt7wg0xFmrcwq4N35Ht12EnxR2YVc+78j3a7AT4INGlmjhGKRwaNpNigK7iWKLdpx8jvu0N8yquyjq6t1ga97trre8qYo+GJXm2oIY37W3nyHaghp6mozKUYyXuNzWjwCtmUZE2lAlnAdLpA1N8zyG1S1JQQUbbIWgc+s/VdSAiIgIiICIiAiIg4Kj1pT+tEQd6IiAiIgIiIP/Z'
                else if (symbol === 'FEW') return 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwQ0Y0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDA0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRDMDQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBDRTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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'
                else if (symbol === 'X') return 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OERBMzZEQkE0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OERBMzZEQkI0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRCODQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4REEzNkRCOTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAICAgICAgICAgIDAgICAwQD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'
                else if (symbol === 'OVC') return 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwRTBCQjA0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwRTBCQjE0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBFMEJBRTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBFMEJBRjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAYEBAQFBAYFBQYJBgUGCQsI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'
                else if (symbol === 'SCT') return 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwRDM0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDQ0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBDMTBEMTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBEMjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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'

                return ''
            },
            /* eslint-enable max-len */

            formatWind: (speed, direction) => {
                let str = ''

                if (speed === 'C') str = 'Calm'
                else if (speed === 'L') str = 'Light'
                else if (speed === 'M') str = 'Moderate'
                else if (speed === 'S') str = 'Strong'
                else if (speed === 'X') str = 'Extreme'

                if (direction !== null) {
                    str += ', ' + formatters.formatDirection(direction)
                }

                if (str === '') {
                    return '--'
                }

                return str
            },

            formatBlowingSnow: (speed, direction) => {
                let str = ''

                if (speed === 'None') str = 'None'
                else if (speed === 'Prev') str = 'Previous'
                else if (speed === 'L') str = 'Light'
                else if (speed === 'M') str = 'Moderate'
                else if (speed === 'I') str = 'Intense'
                else if (speed === 'U') str = 'Unkown'

                if (direction !== null) {
                    str += ', ' + formatters.formatDirection(direction)
                }

                if (str === '') return '--'

                return str
            },

            formatLatLng: point => {
                if (!point) return '--'

                let s = ''

                if (
                    (point.lat !== null && point.lat !== undefined) &&
                    (point.lng !== null && point.lat !== undefined)
                ) {
                    s += point.lat.toFixed(5) + ', '
                    s += point.lng.toFixed(5)
                } else if (point.length === 2) {
                    s += point[1].toFixed(5) + ', '
                    s += point[0].toFixed(5)
                } else {
                    s = '--'
                }

                return s
            },

            formatLatLngAsUTM: (point, html) => {
                if (!point) return '--'

                let s = ''
                let lat
                let lng

                if (point.lat !== null && point.lng !== null) {
                    lat = point.lat
                    lng = point.lng
                } else if (point.length === 2) {
                    lat = point[1]
                    lng = point[0]
                } else {
                    return '--'
                }

                // get utm
                let utm = UTM.latLonToUTMXY(UTM.degToRad(lat), UTM.degToRad(lng))
                let e = utm.x.toFixed(0)
                let n = utm.y.toFixed(0)

                if (n.length === 6) n = '0' + n

                let _e = e
                let _n = n

                if (html) {
                    _e = e.substr(0, 1)
                    _e += '<span>' + e.substr(1, 2) + '</span>'
                    _e += e.substr(3, 3)

                    _n = n.substr(0, 2)
                    _n += '<span>' + n.substr(2, 2) + '</span>'
                    _n += n.substr(4, 3)
                }

                // format
                s += utm.zone + utm.band + ' '
                s += _e + ' '
                s += _n

                return s
            },

            formatDate: (date, time) => {
                let str = ''

                if (date) str += moment(date).format('YYYY-MM-DD')

                // todo: user setting 24 hour/ 12 hour clock
                if (time) str += ' ' + moment(time).format('h:mm a')

                if (str === '') str = '--'

                return str
            },

            formatDuration: minutes => {
                let str = '--'

                if (minutes >= 60) {
                    let hours = minutes / 60
                    let mins = parseInt(minutes % 60, 10)

                    str = Math.floor(hours) + ' hr'

                    if (mins > 0) str += ' ' + mins + ' min'
                } else {
                    str = Math.floor(minutes) + ' min'
                }

                return str
            },

            formatGrainType: icssg => {
                let grainType = getGrainType(icssg)

                if (grainType) {
                    return icssg + ' - ' + grainType.desc
                }

                return '--'
            }
        }

        let pdfOrJPEG = (profile, _settings, PDForJPEG, save) => {
            let columns = [
                { width: 150 },
                { width: 27 },
                { width: 353 },
                { width: 240 }
            ]

            // canvas options
            let profileHeight = 708

            if (PDForJPEG === 'JPEG') {
                profileHeight = 608
            }

            let canvasOptions = {
                scale: 4,
                borderColor: '#000',
                labelColor: '#000',
                commentLineColor: '#000',
                background: '#fff',
                dashedLineColor: '#aaa',
                print: true,
                showDepth: true,
                showDensity: true
            }

            let settings = {
                selectedLayer: null,
                dragging: null,
                hoverDragLayer: null,
                view: null,
                depthDescending: true,
                tempMode: false,
                tempUnits: Global.user.settings.tempUnits === 0 ? 'C' : 'F'
            }

            if (_settings) {
                if (_settings.view !== undefined) {
                    settings.view = _settings.view
                }

                if (_settings.depthDescending !== undefined) {
                    settings.depthDescending = _settings.depthDescending
                }
            }

            // compile canvas
            // todo: a cleaner event-based way? maybe two-way binding?
            // $watch the param? "newScope.loaded = function..."
            let canvasHtml = ('<canvas profile-editor="profile" settings="settings"' +
                'options="canvasOptionsPrint" columns="columnsPrint"' +
                'width="1540" height="' + profileHeight + '"></canvas>')

            let newScope = $rootScope.$new()

            newScope.profile = profile
            newScope.settings = settings
            newScope.canvasOptionsPrint = canvasOptions
            newScope.columnsPrint = columns

            let canvas = $compile(angular.element(canvasHtml))(newScope)[0]

            // timeout is used to allow the canvas time to render
            // todo: a cleaner event-based way?
            setTimeout(() => {
                // canvas for JPEG output
                let _canvas = document.createElement('canvas')
                _canvas.setAttribute('id', 'exported')
                let scale = 2

                _canvas.width = 760 * scale
                _canvas.height = 930 * scale
                _canvas.style.display = 'none'

                let context = _canvas.getContext('2d')

                document.body.appendChild(_canvas)

                context.fillStyle = '#fff'
                context.fillRect(0, 0, _canvas.width, _canvas.height)
                context.fillStyle = '#000'

                context.translate(-30 * scale, -18 * scale)
                context.scale(scale, scale)

                // All units are in the set measurement for the document
                // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
                let doc = new jsPDF('p', 'mm', 'letter')  // eslint-disable-line new-cap

                let docWidth = 216
                let margin = 15
                let marginTop = 13
                let fullWidth = docWidth - margin

                let topLine = 12.6 + marginTop + 5
                let upperLine = 33.3 + 6
                let lowerLine = 73.7 + 6

                // draw logo
                let logoWidth = 64
                let logoHeight = 16
                let isLogoLoaded = $q.defer()

                let render = {
                    drawImage: (img, x, y, w, h) => {
                        if (img.tagName && img.tagName === 'CANVAS') {
                            let _img = img.toDataURL('image/jpeg', 1)
                            doc.addImage(_img, 'JPEG', x, y, w, h)
                        } else {
                            doc.addImage(img, 'JPEG', x, y, w, h)
                        }

                        let _x = x * 3.779527559
                        let _y = y * 3.779527559
                        let _w = w * 3.779527559
                        let _h = h * 3.779527559

                        _x = parseInt(_x, 10) + 0.5
                        _y = parseInt(_y, 10) + 0.5
                        _w = parseInt(_w, 10) + 0.5
                        _h = parseInt(_h, 10) + 0.5

                        if (img.tagName && img.tagName === 'CANVAS') {
                            context.drawImage(img, _x, _y, _w, _h);
                        } else {
                            let image = new Image()

                            image.src = img
                            image.onload = () => context.drawImage(image, _x, _y, _w, _h)
                        }
                    },

                    drawLine: (x1, y1, x2, y2) => {
                        doc.line(x1, y1, x2, y2);

                        let _x1 = x1 * 3.779527559
                        let _y1 = y1 * 3.779527559
                        let _x2 = x2 * 3.779527559
                        let _y2 = y2 * 3.779527559
                        _x1 = parseInt(_x1, 10) + 0.5
                        _y1 = parseInt(_y1, 10) + 0.5
                        _x2 = parseInt(_x2, 10) + 0.5
                        _y2 = parseInt(_y2, 10) + 0.5

                        context.beginPath();
                        context.moveTo(x1, y1);
                        context.lineTo(x2, y2);
                        context.stroke();
                    },

                    setLineWidth: width => {
                        doc.setLineWidth(width)

                        let _width = width * 3.779527559
                        _width = parseInt(_width, 10) + 0.5

                        context.lineWidth = _width
                    },

                    setFont: (name, size, type) => {
                        let _type = type

                        if (!_type) _type = 'normal'

                        doc.setFont(name)
                        doc.setFontSize(size)
                        doc.setFontType(_type)

                        context.font = _type + ' ' + size + 'pt ' + name
                    },

                    setLineColor: (r, g, b) => {
                        doc.setDrawColor(r, g, b)

                        context.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)'
                    },

                    // setDrawColor: function(r, g, b) {
                    //     doc.setDrawColor(r, g, b);

                    //     context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
                    // },

                    setTextColor: (r, g, b) => {
                        doc.setTextColor(r, g, b)

                        context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)'
                    },

                    drawText: (x, y, text, width) => {
                        if (width) {
                            let lines = doc.splitTextToSize(text, width, {})
                            doc.text(x, y, lines)

                            let _x = x * 3.779527559
                            let _y = y * 3.779527559
                            _x = parseInt(_x, 10) + 0.5
                            _y = parseInt(_y, 10) + 0.5

                            let lineHeight = doc.internal.getLineHeight()
                            lineHeight *= 1.333333 // lineHeight is in pt, convert to px

                            for (let i = 0; i < lines.length; i++) {
                                let newY = _y + (lineHeight * i)
                                context.fillText(lines[i], _x, newY)
                            }
                        } else {
                            doc.text(x, y, text)

                            let _x = x * 3.779527559
                            let _y = y * 3.779527559
                            _x = parseInt(_x, 10) + 0.5
                            _y = parseInt(_y, 10) + 0.5

                            context.fillText(text, _x, _y)
                        }
                    },

                    addPage: () => {
                        doc.addPage()
                    }
                }

                let drawParam = (label, val, x, y, labelWidth) => {
                    render.setFont('helvetica', 10.5, 'normal')
                    render.setTextColor(110, 110, 110)
                    render.drawText(x, y, label)
                    render.setTextColor(0, 0, 0)
                    render.drawText(x + labelWidth, y, val)
                }

                let drawSkySymbol = (symbol, x, y) => {
                    if (!symbol | symbol === '') return

                    let imgData = formatters.getSkyIcon(symbol)

                    if (imgData !== '') {
                        render.drawImage(imgData, x, y, 4, 4)
                    }
                }

                if (profile.organization && profile.organization.logoUrl) {
                    let logo = new Image()

                    logo.crossOrigin = ' Anonymous'
                    logo.src = profile.organization.logoUrl + '?sdgdsgsdg'

                    logo.onload = () => {
                        let photoWidthMM = logo.width * 0.264583333
                        let photoHeightMM = logo.height * 0.264583333

                        let scale = Math.min(logoWidth / photoWidthMM, logoHeight / photoHeightMM)
                        let _photoWidth = photoWidthMM * scale
                        let _photoHeight = photoHeightMM * scale

                        // draw to canvas
                        let photoCanvas = document.createElement('canvas')

                        photoCanvas.height = (_photoHeight * 3.779527559) * 2
                        photoCanvas.width = (_photoWidth * 3.779527559) * 2
                        photoCanvas.style.display = 'none'

                        document.body.appendChild(photoCanvas)

                        let photoContext = photoCanvas.getContext('2d')
                        photoContext.drawImage(logo, 0, 0, photoCanvas.width, photoCanvas.height)

                        // var imgData = photoCanvas.toDataURL("image/jpeg",1);

                        render.drawImage(photoCanvas,
                            // logo x, y
                            docWidth - margin - (_photoWidth),
                            0 + marginTop - (_photoHeight - 9.8),
                            // 0 + marginTop + ((logoHeight - _photoHeight) / 2),
                            // logo width, height
                            _photoWidth, _photoHeight
                        )
                        isLogoLoaded.resolve()
                    }
                } else {
                    isLogoLoaded.resolve()
                }

                /* eslint-disable max-len */
                // 'Snow Profile' title
                // var imgData = 'data:image/jpeg;base64,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';
                let imgData = 'data:image/jpeg;base64,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';
                /* eslint-enable max-len */

                // var imageScale = .03;
                // render.drawImage(imgData, margin - .5, marginTop + 2.36,
                // 300 * imageScale, 244 * imageScale);

                let imageScale = 0.075

                render.drawImage(
                    imgData,
                    margin - 0.5,
                    marginTop + 2.36,
                    1014 * imageScale,
                    100 * imageScale
                )

                // var titleCanvas=document.createElement("canvas");
                // titleCanvas.width = 600;
                // titleCanvas.height = 70;
                // titleCanvas.style.display = 'none'
                // document.body.appendChild(titleCanvas);
                // var ctx=titleCanvas.getContext("2d");
                // ctx.fillStyle = "#fff";
                // ctx.fillRect(0,0,titleCanvas.width,titleCanvas.height);

                // ctx.fillStyle = "#000";

                // ctx.font="700 68px 'Roboto Condensed'";
                // ctx.fillText("Avanet",0,60);

                // ctx.font="100 68px 'Roboto Condensed'";
                // ctx.fillStyle = "#000";
                // ctx.fillText("Snow Profile",206,60);

                // setTimeout(function() {
                //     render.drawImage(titleCanvas, margin + 9.24, marginTop + 1.7,
                // (titleCanvas.width / 2) * 0.264583333, (titleCanvas.height / 2) * 0.264583333);
                // },60);

                // gray line beneath title
                render.setLineColor(130, 130, 130)
                render.setLineWidth(0.6)
                render.drawLine(margin, topLine - 5.8, fullWidth, topLine - 5.8) // horizontal line

                // graph
                let posY = 93
                let graphScale = 0.122
                let height = (canvas.height / 2) * graphScale
                let width = (canvas.width / 2) * graphScale

                render.drawImage(canvas, margin, posY, width, height)

                /* eslint-disable max-len */
                drawParam('Organization:', formatters.formatOrg(profile.organization), margin, topLine + 2, 24)
                drawParam('Location:', formatters.format(profile.locationName), margin, topLine + 9.1, 18)
                drawParam('Lat/Lng:', formatters.formatLatLng(profile.location), margin, topLine + 16.1, 18)
                drawParam('Date:', formatters.formatDate(profile.date, profile.time), margin + 80, topLine + 9.1, 19)
                drawParam('Observer:', formatters.format(profile.user.fullName), margin + 80, topLine + 16.1, 19)
                drawParam('Snowpit depth:', formatters.formatCm(profile.depth), margin + 144, topLine + 9.1, 30)
                drawParam('Snowpack depth:', formatters.formatCm(profile.snowpackHeight), margin + 144, topLine + 16.1, 30)
                drawParam('Elevation:', formatters.formatElevation(profile.elevation), margin, upperLine + 12 + 8.5, 18)
                drawParam('Slope:', formatters.formatSlope(profile.slope), margin, upperLine + 12 + 15.5, 18)
                drawParam('Aspect:', formatters.formatDirection(profile.aspect), margin, upperLine + 12 + 22.5, 18)
                drawParam('Air temp.:', formatters.formatTemp(profile.airTemp), margin, upperLine + 12 + 29.5, 18)
                drawParam('Sky:', formatters.formatSky(profile.sky), margin, upperLine + 12 + 36.5, 18)
                drawSkySymbol(profile.sky, margin + 10.5, upperLine + 12 + 33.2)
                drawParam('Wind:', formatters.formatWind(profile.windSpeed, profile.windDirection), margin + 45, upperLine + 12 + 8.5, 27)
                drawParam('Blowing snow:', formatters.formatBlowingSnow(profile.blowingSnow, profile.blowingSnowDirection), margin + 45, upperLine + 12 + 15.5, 27)
                drawParam('Precipitation:', formatters.formatPrecip(profile.precipType), margin + 45, upperLine + 12 + 22.5, 27)
                drawParam('Foot Pen. (PF):', formatters.formatCm(profile.PF), margin + 45, upperLine + 12 + 29.5, 27)
                drawParam('Ski Pen. (PS):', formatters.formatCm(profile.PS), margin + 45, upperLine + 12 + 36.5, 27)
                /* eslint-enable max-len */

                // horizontal line top
                render.setLineColor(130, 130, 130)
                render.setLineWidth(0.24)
                render.drawLine(margin, upperLine + marginTop, fullWidth, upperLine + marginTop)

                // vertical line 1
                render.drawLine(54.9, upperLine + marginTop, 54.9, lowerLine + marginTop)

                // vertical line 2
                render.drawLine(127, upperLine + marginTop, 127, lowerLine + marginTop)

                if (profile.notes) {
                    render.setFont('helvetica', 8)
                    render.drawText(130.5, upperLine + 18, profile.notes, 70)
                }

                 // horizontal line bottom
                render.drawLine(margin, lowerLine + marginTop, fullWidth, lowerLine + marginTop)

                // footer
                let footerY = 272

                if (PDForJPEG === 'JPEG') footerY -= (100 * 0.264583333)

                render.setTextColor(110, 110, 110)
                render.setFont('helvetica', 6, 'normal')
                render.drawText(docWidth - margin - 21.9, footerY, 'Powered by AVATECH')
                render.drawText(margin, footerY, profile._id.toUpperCase())

                $q.all([isLogoLoaded.promise]).then(() => {
                    if (PDForJPEG === 'PDF') {
                        if (save) {
                            doc.save('profile.pdf')
                        }
                    } else if (PDForJPEG === 'JPEG') {
                        setTimeout(() => {
                            _canvas.toBlob(blob => {
                                // saveAs doesn't exist anywhere?
                                if (save) {
                                    saveAs(blob, 'profile.jpg')  // eslint-disable-line no-undef
                                }
                            }, 'image/jpeg', 1)

                            // remove canvas elements from DOM
                            if (save) {
                                setTimeout(() => {
                                    if (_canvas) document.body.removeChild(_canvas)
                                }, 1000)
                            }
                        }, 300)
                    }
                })
            }, 300)
        }

        return {
            formatters: formatters,
            CSV: profile => {
                let text = ('depth top (cm),height (cm),hardness top,' +
                    'hardness bottom,grain type primary,grain type secondary\n')

                angular.forEach(profile.layers, layer => {
                    text += profile.depth - layer.depth - layer.height + ','
                    text += layer.height + ','
                    text += layer.hardness + ','
                    text += layer.hardness2 + ','

                    if (layer.grainType) text += layer.grainType + ','
                    if (layer.grainType2) text += layer.grainType2 + ''

                    text += '\n'
                })

                let data = 'data:text/csv;base64,' + btoa(unescape(encodeURIComponent(text)))
                let link = document.createElement('a')

                angular.element(link)
                    .attr('href', data)
                    .attr('download', 'profile.csv')

                link.click()
            },
            PDF: (profile, _settings) => {
                pdfOrJPEG(profile, _settings, 'PDF', true)
            },

            JPEG: (profile, _settings) => {
                pdfOrJPEG(profile, _settings, 'JPEG', true)
            },

            UPLOAD: (profile, _settings) => {
                pdfOrJPEG(profile, _settings, 'JPEG', false)
            },

            PDForJPEG: pdfOrJPEG
        }
    }
]

export default SnowpitExport
