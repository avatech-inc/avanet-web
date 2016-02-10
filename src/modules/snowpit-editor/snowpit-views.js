
const SnowpitViews = [
    '$q',
    'snowpitConstants',

    ($q, snowpitConstants) => {
        // helper functions
        let averageGrainSize = (num1, num2) => {
            let n1 = num1
            let n2 = num2

            if (!isNaN(n1)) n1 = parseFloat(n1)
            if (!isNaN(n2)) n2 = parseFloat(n2)
            if (n1 && n2) return (n1 + n2) / 2
            else if (n1 && !n2) return n1
            else if (n2 && !n1) return n2
        }

        let hasGrainTypeCategory = (layer, cats) => {
            if (layer.grainType) {
                if (cats.indexOf(layer.grainType.category) > -1) {
                    return true
                }
            }

            if (layer.grainType2) {
                if (cats.indexOf(layer.grainType2.category) > -1) {
                    return true
                }
            }

            return false
        }

        // calculate
        let calculatePersistentGrains = profile => {
            angular.forEach(profile.layers, (layer, index) => {
                if (!layer.views) {
                    layer.views = {}
                }

                layer.views.pgrains = { layer: [] }

                // RULE 1: Persistent grain types (faceted crystals, depth hoar, surface hoar)
                if (hasGrainTypeCategory(layer, ['D', 'e', 'I'])) {
                    layer.views.pgrains.layer.push({ })
                }
            })
        }

        let calculateFlags = profile => {
            // A: Average grain size > 1mm
            // B: Layer hardness < 1F
            // C: Grain type is facets, depth hoar or surface hoar
            // D: Interface grain size difference > 0.15mm
            // E: Interface hardness difference > 1 step
            // F: Interface is 20-85cm deep
            angular.forEach(profile.layers, (layer, index) => {
                if (!layer.views) {
                    layer.views = {}
                }

                layer.views.flags = { layer: [], interface: [] }

                let nextLayer = profile.layers[index + 1]
                let depth = profile.depth - layer.depth
                let grainSize = averageGrainSize(layer.grainSize, layer.grainSize2)

                // RULE 1: average of grain sizes > 1mm
                if (grainSize > 1) {
                    layer.views.flags.layer.push({ rule: 'A' })
                }

                // RULE 2: Hardness < 1F
                let hardness = snowpitConstants.hardness[layer.hardness].index

                if (layer.hardness2) {
                    hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2
                }

                if (hardness < 7) {
                    layer.views.flags.layer.push({ rule: 'B' })
                }

                // RULE 3: Grain type (faceted crystals, depth hoar, surface hoar)
                if (hasGrainTypeCategory(layer, ['D', 'e', 'I'])) {
                    layer.views.flags.layer.push({ rule: 'C' })
                }

                // RULE 4: INTERFACE: grain size diff > 0.5mm
                if (nextLayer) {
                    let nextGrainSize = averageGrainSize(nextLayer.grainSize, nextLayer.grainSize2)

                    let dif = Math.abs(nextGrainSize - grainSize)

                    if (dif > 0.5) {
                        layer.views.flags.interface.push({ rule: 'D' })
                    }
                }

                // RULE 5: INTERFACE: hardness difference > 1 step
                if (layer.hardness2) {
                    hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2
                }

                if (nextLayer) {
                    let nextHardness = snowpitConstants.hardness[nextLayer.hardness].index
                    if (nextHardness.hardness2) {
                        nextHardness = (
                            nextHardness +
                            snowpitConstants.hardness[nextLayer.hardness2].index
                        ) / 2
                    }

                    let dif = Math.abs(nextHardness - hardness)

                    if (dif > 3) {
                        layer.views.flags.interface.push({ rule: 'E' })
                    }
                }

                // RULE 6: INTERFACE: 20-85cm deep
                let depthDown = profile.depth - layer.depth

                if (depthDown >= 20 && depthDown <= 85) {
                    layer.views.flags.interface.push({ rule: 'F' })
                }
            })
        }

        let calculateLemons = profile => {
            // A: Layer depth ≤ 1m
            // B: Layer height ≤ 10 cm
            // C: Grain type is facets or surface hoar
            // D: Interface hardness difference ≥ 1 step
            // E: Interface grain size difference ≥ 1 mm

            angular.forEach(profile.layers, (layer, index) => {
                if (!layer.views) {
                    layer.views = {}
                }

                layer.views.lemons = { layer: [], interface: [] }

                let nextLayer = profile.layers[index + 1]
                let depth = profile.depth - layer.depth

                // RULE 1: layer depth ≤ 1m from surface
                if ((profile.depth - layer.depth) < 100) {
                    layer.views.lemons.layer.push({ rule: 'A' })
                }

                // RULE 2: Weak layer thickness ≤ 10 cm
                if (layer.height <= 10) {
                    layer.views.lemons.layer.push({ rule: 'B' })
                }

                // RULE 3: Persistent grain types (faceted crystals, depth hoar, surface hoar)
                if (hasGrainTypeCategory(layer, ['D', 'e', 'I'])) {
                    layer.views.lemons.layer.push({ rule: 'C' })
                }

                // RULE 4: INTERFACE: hardness difference ≥ 1 step
                let hardness = snowpitConstants.hardness[layer.hardness].index

                if (layer.hardness2) {
                    hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2
                }

                if (nextLayer) {
                    let nextHardness = snowpitConstants.hardness[nextLayer.hardness].index

                    if (nextHardness.hardness2) {
                        nextHardness = (
                            nextHardness +
                            snowpitConstants.hardness[nextLayer.hardness2].index
                        ) / 2
                    }

                    let dif = Math.abs(nextHardness - hardness)

                    if (dif >= 3) {
                        layer.views.lemons.interface.push({ rule: 'D' })
                    }
                }

                // RULE 5: INTERFACE: grain size difference ≥ 1 mm
                let grainSize = averageGrainSize(layer.grainSize, layer.grainSize2)

                if (nextLayer) {
                    let nextGrainSize = averageGrainSize(nextLayer.grainSize, nextLayer.grainSize2)
                    let dif = Math.abs(nextGrainSize - grainSize)

                    if (dif > 1) {
                        layer.views.lemons.interface.push({ rule: 'E' })
                    }
                }
            })
        }

        let calculateICSSG = profile => {
            angular.forEach(profile.layers, (layer, index) => {
                if (!layer.views) {
                    layer.views = {}
                }

                layer.views.icssg = { layer: [] }

                if (!layer.grainType) return

                /* eslint-disable max-len */
                if (layer.grainType.category === 'a') layer.views.icssg.layer.push({ color: '#00FF00' })
                else if (layer.grainType.category === 's') layer.views.icssg.layer.push({ color: '#FFD700' })
                else if (layer.grainType.category === 'u') layer.views.icssg.layer.push({ color: '#228B22' })
                else if (layer.grainType.category === 'd') layer.views.icssg.layer.push({ color: '#FFB6C1' })
                else if (layer.grainType.category === 'e') layer.views.icssg.layer.push({ color: '#ADD8E6' })
                else if (layer.grainType.category === 'D') layer.views.icssg.layer.push({ color: '#0000FF' })
                else if (layer.grainType.category === 'I') layer.views.icssg.layer.push({ color: '#FF00FF' })
                else if (layer.grainType.category === 'h' && layer.grainType.code === 'O') layer.views.icssg.layer.push({ color: '#BBBBBB' }); // should be black bars ||||||||
                else if (layer.grainType.category === 'h') layer.views.icssg.layer.push({ color: '#FF0000' })
                else if (hasGrainTypeCategory(layer, ['i'])) layer.views.icssg.layer.push({ color: '#00FFFF' })
                /* eslint-enable max-len */
            })
        }

        return [
            { name: 'Default', id: null },
            { name: 'Flags', id: 'flags', func: calculateFlags },
            { name: 'Lemons', id: 'lemons', func: calculateLemons },
            { name: 'Persistent Grains', id: 'pgrains', func: calculatePersistentGrains },
            { name: 'ICSSG Grain Coloring', id: 'icssg', func: calculateICSSG }
        ];
    }
]

export default SnowpitViews
