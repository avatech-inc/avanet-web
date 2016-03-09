
const blendRGBColors = (c0, c1, p) => [
    Math.round(Math.round(c1[0] - c0[0]) * (p / 100)) + c0[0],
    Math.round(Math.round(c1[1] - c0[1]) * (p / 100)) + c0[1],
    Math.round(Math.round(c1[2] - c0[2]) * (p / 100)) + c0[2]
]

const hexToRGB = hex => {
    let bigint = parseInt(hex, 16)
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        (bigint & 255)
    ]
}

const blendHexColors = (c0, c1, p) => blendRGBColors(
    hexToRGB(c0),
    hexToRGB(c1),
    p
)

const getPercent = (min, max, val) => Math.floor(((val - min) * 100) / (max - min))

const getColorArray = steps => {
    let colorMap = []
    for (var s = 0; s < steps.length; s++) {
        if (s === steps.length - 1) break

        let min = steps[s].val
        let max = steps[s + 1].val

        let minColor = steps[s].color
        let maxColor = steps[s + 1].color

        for (let i = min; i <= max; i++) {
            colorMap[i] = blendHexColors(minColor, maxColor, getPercent(min, max, i))
        }
    }
    return colorMap
}

const Terrain = () => {
    let convertInt = _int => [
        (0xFFFE0000 & _int) >> 17, // elevation
        (0x1FC00 & _int) >> 10, // slope
        (0x1FF & _int) // aspect
    ]

    const TerrainColors = {
        colorMaps: {
            elevation: [
                { color: 'ffffff', val: 0 },
                { color: 'ffffff', val: 380 * 2 },
                { color: 'ffffff', val: 380 * 3 },
                { color: 'ffffff', val: 380 * 4 },
                { color: 'ffffff', val: 380 * 7 },
                { color: 'ffffff', val: 380 * 13 },
                { color: 'ffffff', val: 380 * 14 },
                { color: 'ffffff', val: 380 * 15 },
                { color: 'ffffff', val: 380 * 16 },
                { color: 'ffffff', val: 8400 }
            ],
            slope: [
                { color: 'ffffff', val: 0 },
                { color: 'ffffff', val: 6 },
                { color: 'ffffff', val: 11 },
                { color: 'ffffff', val: 17 },
                { color: 'ffffff', val: 22 },
                { color: 'ffffff', val: 27 },
                { color: 'ffffff', val: 31 },
                { color: 'ffffff', val: 35 },
                { color: 'ffffff', val: 39 },
                { color: 'ffffff', val: 42 },
                { color: 'ffffff', val: 45 },
                { color: 'ffffff', val: 80 }
            ],
            aspect: [
                { color: 'ffffff', val: 0 },
                { color: 'ffffff', val: 22 },
                { color: 'ffffff', val: 67 },
                { color: 'ffffff', val: 112 },
                { color: 'ffffff', val: 157 },
                { color: 'ffffff', val: 202 },
                { color: 'ffffff', val: 247 },
                { color: 'ffffff', val: 292 },
                { color: 'ffffff', val: 338 },
                { color: 'ffffff', val: 360 }
            ]
        },
        hillshade: dem => {
            let altitude = 70 * (Math.PI / 180)
            let azimuth = 0 * (Math.PI / 180)
            let shadows = 0.7 // .45
            let highlights = 0.2 // .45

            let px = new Uint8ClampedArray(256 * 256 * 4)
            let a = - azimuth - Math.PI / 2
            let z = Math.PI / 2 - altitude
            let cosZ = Math.cos(z)
            let sinZ = Math.sin(z)
            let neutral = cosZ
            let x
            let y
            let i
            let hillshade
            let alpha

            for (x = 0; x < 256; x++) {
                for (y = 0; y < 256; y++) {
                    let i = y * 256 + x

                    if (dem[i] === null) continue

                    let sl = (dem[i][1] * (Math.PI / 180)) * 1.9
                    let asp = (dem[i][2] * (Math.PI / 180)) * 1.9

                    if (sl === null) continue

                    hillshade = cosZ * Math.cos(sl) + sinZ * Math.sin(sl) * Math.cos(a - asp)
                    if (hillshade < 0) hillshade /= 2
                    alpha = neutral - hillshade

                    i = (y * 256 + x) * 4

                    // shadows
                    if (neutral > hillshade) {
                        px[i] = 20
                        px[i + 1] = 0;
                        px[i + 2] = 30;
                        px[i + 3] = Math.round(255 * alpha * shadows);

                    // highlights
                    } else {
                        alpha = Math.min(-alpha * cosZ * highlights / (1 - hillshade), highlights)
                        px[i] = 255
                        px[i + 1] = 255
                        px[i + 2] = 230
                        px[i + 3] = Math.round(255 * alpha)
                    }
                }
            }

            return px
        },

        render: (data, overlayType, customParams) => {
            let newPixels = new Uint8ClampedArray(256 * 256 * 4)

            for (var i = 0; i < data.length; i++) {
                let terrain = convertInt(data[i])

                let newElevation = terrain[0]
                let newSlope = terrain[1]
                let newAspect = terrain[2]

                let newColor = []

                // if no data, return transparent
                if (newElevation === 127 && newSlope === 127 && newAspect === 511) {
                    newColor = [0, 0, 0, 0]
                    continue
                }

                // CUSTOM
                if (overlayType === 'custom') {
                    let showAspect = false

                    if (customParams.aspect_low === 0 && customParams.aspect_high === 359) {
                        showAspect = true
                    } else {
                        if (customParams.aspect_low > customParams.aspect_high) {
                            if (
                                newAspect >= customParams.aspect_low ||
                                newAspect <= customParams.aspect_high
                            ) {
                                showAspect = true
                            }
                        } else if (
                            newAspect >= customParams.aspect_low &&
                            newAspect <= customParams.aspect_high
                        ) {
                            showAspect = true
                        }
                    }

                    let showElevation = (
                        newElevation >= customParams.elev_low &&
                        newElevation <= customParams.elev_high
                    )

                    let showSlope = (
                        newSlope >= customParams.slope_low &&
                        newSlope <= customParams.slope_high
                    )

                    if (
                        showAspect &&
                        showElevation &&
                        showSlope
                    ) {
                        newColor = hexToRGB(customParams.color)
                    }
                }

                // ELEVATION
                if (overlayType === 'elevation') {
                    if (newElevation > 0 && newElevation > 0) {
                        // newColor = getColor(colorMapsProcessed.elevation, newElevation);
                        newColor = TerrainColors.colorMapsProcessed.elevation[newElevation]
                    }
                }

                // SLOPE
                if (overlayType === 'slope') {
                    if (newSlope > 0 && newSlope <= 80) {
                        // newColor = getColor(colorMapsProcessed.slope, newSlope);
                        newColor = TerrainColors.colorMapsProcessed.slope[newSlope]
                    }
                }

                // ASPECT
                if (overlayType === 'aspect') {
                    if (newAspect > 0 && newAspect <= 360) {
                        // newColor = getColor(colorMapsProcessed.aspect, newAspect);
                        newColor = TerrainColors.colorMapsProcessed.aspect[newAspect]
                    }
                }

                // MKS (aspect-slope)
                // http://blogs.esri.com/esri/arcgis/2008/05/23/aspect-slope-map/
                // if (overlayType === 'mks') {
                //     let num = 0

                //     if (newSlope >= 40) num = 40
                //     else if (newSlope >= 20) num = 30
                //     else if (newSlope >= 5) num = 20
                //     else if (newSlope >= 0) num = 10

                //     if (newAspect >= 0 && newAspect <= 22.5) num += 1
                //     else if (newAspect > 22.5 && newAspect <= 67.5) num += 2
                //     else if (newAspect > 67.5 && newAspect <= 112.5) num += 3
                //     else if (newAspect > 112.5 && newAspect <= 157.5) num += 4
                //     else if (newAspect > 157.5 && newAspect <= 202.5) num += 5
                //     else if (newAspect > 202.5 && newAspect <= 247.5) num += 6
                //     else if (newAspect > 247.5 && newAspect <= 292.5) num += 7
                //     else if (newAspect > 292.5 && newAspect <= 337.5) num += 8
                //     else if (newAspect > 337.5 && newAspect <= 360) num += 1

                //     if (num === 19) newColor = [153, 153, 153]
                //     if (num === 21) newColor = [147, 166, 89]
                //     if (num === 22) newColor = [102, 153, 102]
                //     if (num === 23) newColor = [102, 153, 136]
                //     if (num === 24) newColor = [89, 89, 166]
                //     if (num === 25) newColor = [128, 108, 147]
                //     if (num === 26) newColor = [166, 89, 89]
                //     if (num === 27) newColor = [166, 134, 89]
                //     if (num === 28) newColor = [166, 166, 89]
                //     if (num === 31) newColor = [172, 217, 38]
                //     if (num === 32) newColor = [77, 179, 77]
                //     if (num === 33) newColor = [73, 182, 146]
                //     if (num === 34) newColor = [51, 51, 204]
                //     if (num === 35) newColor = [128, 89, 166]
                //     if (num === 36) newColor = [217, 38, 38]
                //     if (num === 37) newColor = [217, 142, 38]
                //     if (num === 38) newColor = [217, 217, 38]
                //     if (num === 41) newColor = [191, 255, 0]
                //     if (num === 42) newColor = [51, 204, 51]
                //     if (num === 43) newColor = [51, 204, 153]
                //     if (num === 44) newColor = [26, 26, 230]
                //     if (num === 45) newColor = [128, 51, 204]
                //     if (num === 46) newColor = [255, 0, 0]
                //     if (num === 47) newColor = [255, 149, 0]
                //     if (num === 48) newColor = [255, 255, 0]
                // }

                // ------------------------------------------------------

                // if no alpha specified, default to fully opaque
                if (newColor && newColor.length === 3) newColor[3] = 255

                // set pixels
                if (newColor && newColor.length === 4) {
                    var _i = i * 4
                    newPixels[_i] = newColor[0]
                    newPixels[_i + 1] = newColor[1]
                    newPixels[_i + 2] = newColor[2]
                    newPixels[_i + 3] = newColor[3]
                }
            }
            return newPixels
        }
    }

    TerrainColors.colorMapsProcessed = {
        elevation: getColorArray(TerrainColors.colorMaps.elevation),
        slope: getColorArray(TerrainColors.colorMaps.slope),
        aspect: getColorArray(TerrainColors.colorMaps.aspect),
    }

    fetch(window.apiBaseUrl + 'getTerrainColors')
        .then(res => res.json())
        .then(json => {
            angular.forEach(json, (colorMap, key) => {
                TerrainColors.colorMaps[key] = colorMap
                TerrainColors.colorMapsProcessed[key] = getColorArray(colorMap)
            })
        })

    return TerrainColors
}

export default Terrain
