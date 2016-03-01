
const hexToRGB = hex => [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16)
]

const blendRGBColors = (c0, c1, p) => [
    Math.round(Math.round(c1[0] - c0[0]) * (p / 100)) + c0[0],
    Math.round(Math.round(c1[1] - c0[1]) * (p / 100)) + c0[1],
    Math.round(Math.round(c1[2] - c0[2]) * (p / 100)) + c0[2]
]

const blendHexColors = (c0, c1, p) => blendRGBColors(
    hexToRGB(c0),
    hexToRGB(c1),
    p
)

const getPercent = (min, max, val) => Math.floor(
    ((val - min) * 100) / (max - min)
)

const getColorMap = steps => {
    let colorMap = []

    // var maxValue = steps[steps-1].val;
    // var increment = parseInt(maxValue / steps.length);

    for (let s = 0; s < steps.length; s++) {
        if (s === steps.length - 1) break

        let min = steps[s].val
        let max = steps[s + 1].val

        let minColor = steps[s].color
        let maxColor = steps[s + 1].color

        for (let i = min; i <= max; i++) {
            colorMap[i] = blendHexColors(
                minColor,
                maxColor,
                getPercent(min, max, i)
            )
        }
    }

    return colorMap
}

const LinearGraph = [
    '$q',
    '$parse',

    (
        $q,
        $parse
    ) => ({
        restrict: 'A',
        scope: false,
        link: (scope, element, attrs) => {
            let labels
            let colorMap
            let labelValues

            let a = $q.defer()
            let b = $q.defer()
            let c = $q.defer()

            let canvas = element[0]
            let context = canvas.getContext('2d')

            // scale for retina
            if (window.devicePixelRatio > 1) {
                context.scale(window.devicePixelRatio, window.devicePixelRatio)
                canvas.height *= window.devicePixelRatio
                canvas.width *= window.devicePixelRatio
            }

            let graphHeight = canvas.height
            let graphWidth = canvas.width

            let render = () => {
                // clear canvas
                context.clearRect(0, 0, canvas.width, canvas.height)

                // draw colors
                let min = attrs.min ? parseInt(attrs.min, 10) : 0
                let max = parseInt(attrs.max, 10)
                let width = canvas.width

                context.lineWidth = 1

                for (let i = 0; i < width; i++) {
                    let slope = (((i / width) * (max - min)) + min)
                    let color = colorMap[parseInt(slope, 10)]

                    // blend between stops
                    if (slope % 1 > 0) {
                        let previousColor = colorMap[parseInt(slope - 1, 10)]
                        let percent = (slope - parseInt(slope, 10)) * 100
                        color = blendRGBColors(previousColor, color, percent)
                    }

                    // draw
                    context.strokeStyle = 'rgb(' + color.join() + ')'
                    context.beginPath()
                    context.moveTo(i, 0)
                    context.lineTo(i, 28 * window.devicePixelRatio)
                    context.stroke()
                }

                // draw labels

                context.fillStyle = 'black'
                context.font = (19 * window.devicePixelRatio) + 'px sans-serif'

                angular.forEach(labels, (label, i) => {
                    let _label = label

                    let x = ((label - min) / (max - min)) * width

                    if (attrs.labelSuffix) {
                        _label += attrs.labelSuffix
                    }

                    if (labelValues) {
                        _label = labelValues[i]
                    }

                    let measured = context.measureText(_label)

                    context.fillText(
                        _label,
                        x - (measured.width / 2), 50 * window.devicePixelRatio
                    )
                })
            }

            attrs.$observe('legend', () => {
                if (!colorMap) {
                    a.resolve()
                } else {
                    colorMap = getColorMap($parse(attrs.legend)(scope))
                    render()
                }
            })

            attrs.$observe('labelValues', () => b.resolve())
            attrs.$observe('labels', () => c.resolve())

            $q.all([
                a.promise,
                b.promise,
                c.promise
            ]).then(() => {
                colorMap = getColorMap($parse(attrs.legend)(scope))
                labels = $parse(attrs.labels)(scope)
                labelValues = $parse(attrs.labelValues)(scope)

                render()
            })
        }
    })
]

export default LinearGraph
