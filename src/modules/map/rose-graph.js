
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

const RoseGraph = [
    '$timeout',
    '$parse',
    ($timeout, $parse) => ({
        restrict: 'A',
        scope: false,
        link: (scope, element, attrs) => {
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
                // convert string to JSON
                // var points = [];
                // if (scope.points != "") points = JSON.parse(scope.points);

                // clear canvas
                context.clearRect(0, 0, canvas.width, canvas.height)

                let radius = graphWidth / 2
                let padding = 3 * window.devicePixelRatio
                let length = radius - padding

                // draw colors
                context.lineWidth = 3

                for (let i = 0; i <= 360; i++) {
                    context.strokeStyle = 'rgb(' + scope.colorMap[i].join() + ')'

                    let angle = (i - 90) * (Math.PI / 180)

                    context.beginPath()
                    context.moveTo(radius, radius)
                    context.lineTo(
                        radius + length * Math.cos(angle),
                        radius + length * Math.sin(angle)
                    )
                    context.stroke()
                }

                // draw pie
                context.lineWidth = 2 * window.devicePixelRatio
                context.strokeStyle = '#000'
                context.beginPath()
                context.arc(radius, radius, length, 0, 2 * Math.PI)
                context.stroke()

                // draw aspect direction lines
                for (let i = 1; i <= 8; i++) {
                    let angle = (67.5 + (45 * i)) * (Math.PI / 180)

                    context.moveTo(radius, radius)
                    context.lineTo(
                        radius + length * Math.cos(angle),
                        radius + length * Math.sin(angle)
                    )
                }

                context.stroke()

                // draw direction labels

                let labelLength = radius - (28 * window.devicePixelRatio)

                // context.shadowColor = "#fff";
                // context.shadowOffsetX = 0;
                // context.shadowOffsetY = 0;
                // context.shadowBlur = .1;

                context.fillStyle = 'black'

                let fontSize = 16 * window.devicePixelRatio

                context.font = fontSize + 'px sans-serif'

                let angles = ['N', 'E', 'S', 'W']

                for (let i = 0; i < 4; i++) {
                    let angle = ((90 * i) - 90) * (Math.PI / 180)
                    let label = angles[i]

                    let x = radius + labelLength * Math.cos(angle)
                    let y = radius + labelLength * Math.sin(angle)

                    let measured = context.measureText(label)

                    if (label === 'N') {
                        x -= measured.width / 2
                        y -= fontSize / 4
                    } else if (label === 'S') {
                        x -= measured.width / 2
                        y += fontSize
                    } else if (label === 'W') {
                        x -= measured.width
                        y += fontSize / 2.5
                    } else if (label === 'E') {
                        x += measured.width / 6
                        y += fontSize / 2.5
                    }

                    context.fillText(label, x, y)
                }
            }

            attrs.$observe('legend', value => {
                scope.colorMap = getColorMap($parse(attrs.legend)(scope))
                render()
            })

            let timer

            scope.$watch('points', () => {
                if (timer) $timeout.cancel(timer)
                timer = $timeout(render, 100)
            })
        }
    })
]

export default RoseGraph
