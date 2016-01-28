
const findTotalOffset = obj => {
    let ol = 0
    let ot = 0

    if (obj.offsetParent) {
        do {  // eslint-disable-line no-cond-assign
            ol += obj.offsetLeft;
            ot += obj.offsetTop;
        } while (obj = obj.offsetParent)  // eslint-disable-line no-param-reassign
    }

    return { left: ol, top: ot }
}

const fixEvent = e => {
    if (
        typeof e.offsetX === 'undefined' ||
        typeof e.offsetY === 'undefined'
    ) {
        let targetOffset = findTotalOffset(e.target)

        e.offsetX = e.pageX - targetOffset.left
        e.offsetY = e.pageY - targetOffset.top
    }

    return e
}

const getRelativeCoords = e => {
    // fix event for not-so-old versions of FF
    let _e = fixEvent(e)
    let pixelRatio = window.devicePixelRatio

    if (
        _e.offsetX !== undefined &&
        _e.offsetY !== undefined
    ) {
        return [
            _e.offsetX * pixelRatio,
            _e.offsetY * pixelRatio
        ]
    }

    return [
        _e.layerX * pixelRatio,
        _e.layerY * pixelRatio
    ]
}

angular.module('avatech').directive('graphBig', () => ({
    restrict: 'A',
    scope: {
        rows: '=graphBig',
        detail: '='
    },
    link: (scope, element) => {
        let paddingTop = 30
        let paddingLeft = 40

        // // handle mouseouver for highlighting
        // var debounce;
        // element.bind('mousemove',function(event) {
        //     if (debounce) clearTimeout(debounce);
        //     debounce = setTimeout(function(){
        //         var point = getRelativeCoords(event);
        //         // if mouse is within graph, render graph width highlighted depth
        //         if (point[1] > paddingTop && point[0] > paddingLeft) {
        //             render(point[1]);
        //         }

        //     }, 10);
        // })
        // // redraw on mouseout to clear highlight
        // element.bind('mouseout',function(event) {
        //     render();
        // });

        // graphing formula (by sam with revisions by joe)

        let A_P4 = -194.1
        let B_P4 = 0.1304
        let C_P4 = -0.0023124
        let D_P4 = 197.7

        let magic = 195.95340007275328

        let graphLogFunction = (pressure, width) => {
            let _pressure = pressure

            _pressure = Math.pow(B_P4, -C_P4 * _pressure)
            _pressure *= A_P4
            _pressure += D_P4
            _pressure *= (width / magic)

            return _pressure
        }

        let graphLogFunctionReverse = (pixels, width) => {
            let _pixels = pixels

            _pixels /= (width / magic)
            _pixels -= D_P4
            _pixels /= A_P4
            _pixels = (Math.log(pixels) / Math.log(B_P4)) / -C_P4

            return pixels
        }

        let render = highlightDepth => {
            if (scope.detail === null) scope.detail = 1

            let canvas = element[0]
            let context = element[0].getContext('2d')

            let graphHeight = canvas.height - paddingTop
            let graphWidth = canvas.width - paddingLeft

            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height)

            // draw white background
            context.fillStyle = '#fff'
            context.fillRect(paddingLeft, paddingTop, canvas.width, canvas.height)

            // pixel value at zero
            let valueAtZero = Math.round(graphLogFunction(0, graphWidth));

            // graph tick lines

            // calculate tick mark locations
            let tickMarks = []

            for (let i = 1; i <= 6; i++) {
                let tickPixels = parseInt((graphWidth / 6) * i, 10)
                let tickPressure = Math.round(
                    graphLogFunctionReverse(tickPixels + valueAtZero, graphWidth + valueAtZero)
                )
                tickMarks.push(tickPressure)
            }

            // draw tick marks
            context.beginPath()

            for (let i = 0; i < tickMarks.length; i++) {
                let tickMark = tickMarks[i]
                let tickMarkPosition = (
                    paddingLeft +
                    graphLogFunction(tickMark, graphWidth + valueAtZero) -
                    valueAtZero +
                    1 // - 1;
                )

                context.moveTo(tickMarkPosition, paddingTop) // change to 0?
                context.lineTo(tickMarkPosition, graphHeight + paddingTop)

                // draw tick labels
                context.fillStyle = '#444'
                context.font = "22.5px 'roboto condensed'"
                context.fillText(
                    tickMark,
                    tickMarkPosition - context.measureText(tickMark).width,
                    22
                )
            }

            context.lineWidth = 2
            context.strokeStyle = 'rgba(10,10,10,.28)'
            context.stroke()
            context.closePath()

            // data
            let rows = scope.rows

            // if no data, don't continue
            if (!rows) return

            let threshold = 3

            // calculate
            let graphRows = []

            for (let i = 0; i < rows.length; i++) {
                let pressureExpanded = (0.00008 * Math.pow(rows[i], 3))
                let pressureGraph = graphLogFunction(
                    pressureExpanded,
                    graphWidth + valueAtZero
                ) - valueAtZero

                graphRows.push(pressureGraph)
            }

            // graph

            // empty bottom depth area
            let emptyDepth = (rows.length) * (graphHeight / 1500)

            emptyDepth *= threshold

            context.fillStyle = '#d0d0d0'
            context.beginPath()
            context.moveTo(paddingLeft, emptyDepth + paddingTop)
            context.lineTo(canvas.width, emptyDepth + paddingTop)
            context.lineTo(canvas.width, graphHeight + paddingTop)
            context.lineTo(paddingLeft, graphHeight + paddingTop)
            context.closePath()
            context.fill()

            // the four levels of blockiness, from less blocky to most blocky
            let details = {
                level2: 0.16,
                level3: 0.32,
                level4: 0.52,
                level5: 0.65
            }

            // profile
            context.beginPath()
            context.fillStyle = 'rgba(50,50,50,.9)'
            context.moveTo(paddingLeft, paddingTop)

            let canvasDepth

            for (let i = 0; i < graphRows.length; i++) {
                canvasDepth = (i + 1) * (graphHeight / 1500)
                canvasDepth *= threshold
                canvasDepth += paddingTop

                let pressureGraph = graphRows[i]

                // detail levels / blocking
                if (scope.detail > 1 && scope.detail < 6 && i !== graphRows.length - 1) {
                    let pressureGraphNext = graphRows[i + 1]

                    if (Math.abs(1 - pressureGraphNext / pressureGraph) <
                            details['level' + scope.detail]) {
                        graphRows[i + 1] = pressureGraph
                    }
                }

                context.lineTo(pressureGraph + paddingLeft, canvasDepth)
            }

            // finish up graph
            if (canvasDepth !== null) {
                context.lineTo(paddingLeft, canvasDepth)
                context.lineTo(paddingLeft, 0)
                context.fill()
            }

            // depth tick marks
            context.beginPath()

            let depthTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90,
                100, 110, 120, 120, 130, 140, 150]

            for (let i = 0; i < depthTicks.length; i++) {
                canvasDepth = (depthTicks[i] * 10) * (graphHeight / 1500)

                if (canvasDepth <= emptyDepth) {
                    // draw tick marks
                    if (i > 0) {
                        context.moveTo(paddingLeft, canvasDepth + paddingTop)
                        context.lineTo(canvas.width, canvasDepth + paddingTop)
                    }

                    // draw labels
                    context.textAlign = 'right'
                    context.fillStyle = '#444'
                    context.font = "22.5px 'roboto condensed'"
                    context.fillText(depthTicks[i], 34, canvasDepth + paddingTop)
                    context.textAlign = 'left'
                }
            }

            context.lineWidth = 2
            context.strokeStyle = 'rgba(180,180,180,.1)'
            context.stroke()
            context.closePath()

            // highlight depth
            if (highlightDepth && highlightDepth <= emptyDepth) {
                // get depth from pixels
                let depthPixels = highlightDepth - paddingTop
                let _depth = Math.round(depthPixels / (graphHeight / 1500))

                // get pressure from depth
                // todo: first need to expand graphRows from 150 to 1500
                // var _pressure = Math.round(graphRows[_depth]);
                // console.log(_pressure);

                context.beginPath()
                context.moveTo(paddingLeft, highlightDepth)
                context.lineTo(canvas.width, highlightDepth)
                context.lineWidth = 2
                context.strokeStyle = 'red'
                context.stroke()
                context.closePath()

                context.fillStyle = 'red'
                context.font = "22.5px 'roboto condensed'"

                // context.fillText(_depth + ', ' + _pressure, 100, highlightDepth)

                context.fillText(_depth, 100, highlightDepth)
            }
        }

        scope.$watch('rows', () => {
            render()
        })

        scope.$watch('detail', () => {
            render()
        })
    }
}))

angular.module('avatech').directive('graph', () => ({
    restrict: 'A',
    link: (scope, element, attrs) => {
        // expand compressed ascii string
        let expand = str => {
            let unsplitInt = _str => {
                if (_str.length !== 2) return null  // 3

                return (
                    (_str[0].charCodeAt(0) - 32) +
                    (_str[1].charCodeAt(0) - 32)
                )

                // + (str[2].charCodeAt(0) - 32);
            }

            // expand ascii string
            let expanded = ''

            for (let e = 0; e < str.length; e++) {
                let ch = str[e]

                if (ch !== '\n') {
                    expanded += ch
                } else {
                    let streak = str.substr(e + 1, 2)  // 3
                    streak = unsplitInt(streak)

                    let _ch = str[e + 3]  // 4

                    for (let k = 0; k < streak; k++) {
                        expanded += _ch
                    }

                    e += 3  // 4
                }
            }

            // convert ascii string into array of numbers
            let _rows = []

            for (let i = 0; i < expanded.length; i++) {
                // adjust for ascii offset and multiply by 4 (decompress)
                _rows.push((expanded[i].charCodeAt(0) - 32) * 3.9)
            }

            return _rows
        }

        let rows = scope.$eval(attrs.graph)

        if (!rows) return

        // expand if compressed ascii string
        if (typeof rows === 'string') {
            rows = expand(rows)
        }

        let threshold = 10
        let canvas = element[0]
        let context = element[0].getContext('2d')

        // empty bottom depth area
        let emptyDepth = (rows.length) * (canvas.height / 1500)

        emptyDepth *= threshold

        context.fillStyle = '#d0d0d0'
        context.beginPath()
        context.moveTo(0, emptyDepth)
        context.lineTo(canvas.width, emptyDepth)
        context.lineTo(canvas.width, canvas.height)
        context.lineTo(0, canvas.height)
        context.closePath()
        context.fill()

        // graph
        context.beginPath()
        context.fillStyle = 'rgba(50,50,50,.9)'
        context.moveTo(-1, 0)

        let canvasDepth

        for (let i = 0; i < rows.length; i++) {
            canvasDepth = (i + 1) * (canvas.height / 1500)
            canvasDepth *= threshold

            let pressureExpanded = (0.00008 * Math.pow(rows[i], 3))

            let A_P4 = -194.1
            let B_P4 = 0.1304
            let C_P4 = -0.0023124
            let D_P4 = 197.7

            let pressureGraph = (
                (A_P4 * (Math.pow(B_P4, -C_P4 * pressureExpanded)) + D_P4) * (217 / 198)
            )

            pressureGraph = pressureGraph * (canvas.width / 212)

            context.lineTo(pressureGraph, canvasDepth)
        }

        // finish up
        if (canvasDepth !== null) {
            context.lineTo(-1, canvasDepth)
            context.lineTo(-1, 0)
            context.fill()
        }

        context.closePath()
    }
}))
