
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

        render: (data, overlayType, customParams, srcTag) => {
            let newPixels = new Uint8ClampedArray(256 * 256 * 4)
            let terrain
            let newElevation
            let newSlope
            let newAspect
            let newColor

            if (srcTag === 'pbf') {
                for (var y = 0; y < data.rows.length; y++) {
                    for (var x = 0; x < data.rows[y].cells.length; x++) {
                        newElevation = data.rows[y].cells[x].elev
                        newSlope = data.rows[y].cells[x].slope
                        newAspect = data.rows[y].cells[x].aspect

                        newColor = []

                        // if no data, return transparent
                        if (newElevation === 127
                            && newSlope === 127
                            && newAspect === 511
                        ) {
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

                        // if no alpha specified, default to fully opaque
                        if (newColor && newColor.length === 3) newColor[3] = 255

                        // set pixels
                        if (newColor && newColor.length === 4) {
                            var _i = (y * 256 + x) * 4
                            newPixels[_i] = newColor[0]
                            newPixels[_i + 1] = newColor[1]
                            newPixels[_i + 2] = newColor[2]
                            newPixels[_i + 3] = newColor[3]
                        }
                    }// end for each y
                } // end for each x
            } else if (srcTag === 'png') {
                for (var i = 0; i < data.length; i++) {
                    terrain = convertInt(data[i])

                    newElevation = terrain[0];
                    newSlope = terrain[1];
                    newAspect = terrain[2];

                    newColor = []

                    // if no data, return transparent
                    if (newElevation === 127
                        && newSlope === 127
                        && newAspect === 511
                    ) {
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
                            newColor = TerrainColors.colorMapsProcessed.elevation[newElevation]
                        }
                    }

                    // SLOPE
                    if (overlayType === 'slope') {
                        if (newSlope > 0 && newSlope <= 80) {
                            newColor = TerrainColors.colorMapsProcessed.slope[newSlope]
                        }
                    }

                    // ASPECT
                    if (overlayType === 'aspect') {
                        if (newAspect > 0 && newAspect <= 360) {
                            newColor = TerrainColors.colorMapsProcessed.aspect[newAspect]
                        }
                    }

                    // if no alpha specified, default to fully opaque
                    if (newColor && newColor.length === 3) newColor[3] = 255

                    // set pixels
                    if (newColor && newColor.length === 4) {
                        var _j = i * 4
                        newPixels[_j] = newColor[0]
                        newPixels[_j + 1] = newColor[1]
                        newPixels[_j + 2] = newColor[2]
                        newPixels[_j + 3] = newColor[3]
                    } // end for each x
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
