
const SnowpitConstants = () => {
    let begin = 0.08
    let end = 0.999
    let inc = (1 - ((1 - end) + begin)) / 15

    return {
        /* eslint-disable quote-props */
        hardness: {
            'F': { width: begin, index: 1 },
            'F+': { width: begin + (1 * inc), index: 2 },
            '4F-': { width: begin + (2 * inc), index: 3 },
            '4F': { width: begin + (3 * inc), index: 4 },
            '4F+': { width: begin + (4 * inc), index: 5 },
            '1F-': { width: begin + (5 * inc), index: 6 },
            '1F': { width: begin + (6 * inc), index: 7 },
            '1F+': { width: begin + (7 * inc), index: 8 },
            'P-': { width: begin + (8 * inc), index: 9 },
            'P': { width: begin + (9 * inc), index: 10 },
            'P+': { width: begin + (10 * inc), index: 11 },
            'K-': { width: begin + (11 * inc), index: 12 },
            'K': { width: begin + (12 * inc), index: 13 },
            'K+': { width: begin + (13 * inc), index: 14 },
            'I-': { width: begin + (14 * inc), index: 15 },
            'I': { width: end, index: 16 }
        },
        /* eslint-enable quote-props */

        grainSizes: [
            '',
            '.1',
            '.3',
            '.5',
            '1',
            '1.5',
            '2',
            '2.5',
            '3',
            '3.5',
            '4',
            '4.5',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '15',
            '20',
            '30',
            '40',
            '50',
            '50+'
        ],

        /* eslint-disable max-len */
        grainTypes: [
            { symbol: 'a', legacyCode: 'a', code: 'PP', desc: 'Precipitation Particles', types: [
                { icssg: 'PP', code: 'a', symbol: 'a', desc: 'Precipitation particles' },
                { icssg: 'PPco', code: 'j', symbol: 'j', desc: 'Columns' },
                { icssg: 'PPnd', code: 'k', symbol: 'k', desc: 'Needles' },
                { icssg: 'PPpl', code: 'p1', symbol: 'l', desc: 'Plates' },
                { icssg: 'PPsd', code: 'm', symbol: 'm', desc: 'Stellars, Dendrites' },
                { icssg: 'PPir', code: 'n', symbol: 'n', desc: 'Irregular crystals' },
                { icssg: 'PPgp', code: 'o', symbol: 'o', desc: 'Graupel' },
                { icssg: 'PPhl', code: 'p', symbol: 'p', desc: 'Hail' },
                { icssg: 'PPip', code: 'q', symbol: 'q', desc: 'Ice pellets' },
                { icssg: 'PPrm', code: 'r', symbol: 'r', desc: 'Rime' }
            ] },
            { symbol: 'u', legacyCode: 'u', code: 'DF', desc: 'Decomposing & Fragmented PP', types: [
                { icssg: 'DF', code: 'u1', symbol: 'u', desc: 'Decomposing & Fragmented PP' },
                { icssg: 'DFdc', code: 'u2', symbol: 'u', desc: 'Partly decomposed PP' },
                { icssg: 'DFbk', code: 'v', symbol: 'v', desc: 'Wind-broken PP' }
            ] },
            { symbol: 'd', legacyCode: 'd', code: 'RG', desc: 'Rounded Grains', types: [
                { icssg: 'RG', code: 'x', symbol: 'x', desc: 'Rounded grains' },
                { icssg: 'RGsr', code: 'w', symbol: 'w', desc: 'Small rounded particles' },
                { icssg: 'RGlr', code: 'd', symbol: 'd', desc: 'Large rounded particles' },
                { icssg: 'RGwp', code: 'y', symbol: 'y', desc: 'Wind packed' },
                { icssg: 'RGxf', code: 'z', symbol: 'z', desc: 'Faceted rounded particles' }
            ] },
            { symbol: 'e', legacyCode: 'e', code: 'FC', desc: 'Faceted Crystals', types: [
                { icssg: 'FC', code: 'A1', symbol: 'A', desc: 'Faceted Crystals' },
                { icssg: 'FCso', code: 'A2', symbol: 'A', desc: 'Solid faceted particles' },
                { icssg: 'FCsf', code: 'B', symbol: 'B', desc: 'Near-surface faceted particles' },
                { icssg: 'FCxr', code: 'C', symbol: 'C', desc: 'Rounding faceted particles' }
            ] },
            { symbol: 'D', legacyCode: 'D', code: 'DH', desc: 'Depth Hoar', types: [
                { icssg: 'DH', code: 'D1', symbol: 'D', desc: 'Depth hoar' },
                { icssg: 'DHcp', code: 'D2', symbol: 'D', desc: 'Hollow cups' },
                { icssg: 'DHpr', code: 'E', symbol: 'E', desc: 'Hollow prisms' },
                { icssg: 'DHch', code: 'F', symbol: 'F', desc: 'Chains of depth hoar' },
                { icssg: 'DHla', code: 'D3', symbol: 'G', desc: 'Large striated crystals' },
                { icssg: 'DHxr', code: 'H', symbol: 'H', desc: 'Rounding depth hoar' }
            ] },
            { symbol: 'I', legacyCode: 'I', code: 'SH', desc: 'Surface Hoar', types: [
                { icssg: 'SH', code: 'I1', symbol: 'I', desc: 'Surface hoar' },
                { icssg: 'SHsu', code: 'I2', symbol: 'I', desc: 'Surface hoar cystals' },
                { icssg: 'SHcv', code: 'J', symbol: 'J', desc: 'Cavity or crevasse hoar' },
                { icssg: 'SHxr', code: 'K', symbol: 'K', desc: 'Rounding surface hoar' }
            ] },
            { symbol: 'h', legacyCode: 'h', code: 'MF', desc: 'Melt Forms', types: [
                { icssg: 'MF', code: 'h', symbol: 'h', desc: 'Melt forms' },
                { icssg: 'MFcl', code: 'L', symbol: 'L', desc: 'Clustered rounded grains' },
                { icssg: 'MFpc', code: 'M', symbol: 'M', desc: 'Rounded polycrystals' },
                { icssg: 'MFsl', code: 'N', symbol: 'N', desc: 'Slush' },
                { icssg: 'MFcr', code: 'O', symbol: 'Oh', desc: 'Melt-freeze crust', style: {
                    'font-size': '54%',
                    position: 'relative',
                    bottom: '2px',
                    left: '1px'
                }, scale: 0.53, offsetTop: -3 },
            ] },
            { symbol: 'P', legacyCode: 'i', code: 'IF', desc: 'Ice Formations', types: [
                { icssg: 'IF', code: 'P1', symbol: 'P', desc: 'Ice formations' },
                { icssg: 'IFil', code: 'P2', symbol: 'P', desc: 'Ice layer' },
                { icssg: 'IFic', code: 'Q', symbol: 'Q', desc: 'Ice column' },
                { icssg: 'IFbi', code: 'R', symbol: 'R', desc: 'Basal ice' },
                { icssg: 'IFrc', code: 'S', symbol: 'S', desc: 'Rain crust' },
                { icssg: 'IFsc', code: 'T', symbol: 'T', desc: 'Sun crust' }
            ] },
            { symbol: 's', legacyCode: 's', code: 'MM', desc: 'Machine Made Snow', types: [
                { icssg: 'MM', code: 's1', symbol: 's', desc: 'Machine Made Snow' },
                { icssg: 'MMrp', code: 's', symbol: 's', desc: 'Round polycrystalline particles' },
                { icssg: 'MMci', code: 't', symbol: 't', desc: 'Crushed ice particles' }
            ] }
        ]
        /* eslint-enable max-len */
    }
}

export default SnowpitConstants
