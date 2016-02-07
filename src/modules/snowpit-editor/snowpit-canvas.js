
// I don't even know..
const isPointInPoly = (poly, pt) => {
    let c = false

    for (let i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
        if (
            (
                (
                    poly[i][1] <= pt[1] &&
                    pt[1] < poly[j][1]
                ) || (
                    poly[j][1] <= pt[1] &&
                    pt[1] < poly[i][1]
                )
            ) && (pt[0] < (
                (poly[j][0] - poly[i][0]) *
                (pt[1] - poly[i][1]) /
                (poly[j][1] - poly[i][1]) +
                poly[i][0]
            ))
        ) {
            c = true
        }
    }

    return c
}

// why tho.
const findTotalOffset = obj => {
    let ol = 0
    let ot = 0

    if (obj.offsetParent) {
        do {  // eslint-disable-line no-cond-assign
            ol += obj.offsetLeft
            ot += obj.offsetTop
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

const wrapTextLines = (context, text, maxWidth) => {
    let nextStyle
    let words = text.split(' ')
    let style = "100 10.2px 'roboto condensed'"

    for (let i = 0; i < words.length; i++) {
        let word = words[i]

        if (word.indexOf('[b]') === 0) {
            word = word.substr(3)
            style = "700 10.2px 'roboto condensed'"
        }

        if (
            word.length >= 4 &&
            word.indexOf('[/b]') === word.length - 4
        ) {
            word = word.substring(0, word.length - 4)
            nextStyle = "100 10.2px 'roboto condensed'"
        }

        words[i] = { word: word, style: style }
        style = nextStyle
    }

    let lines = []
    let currentLine = []
    let lineWidth = 0

    for (let i = 0; i < words.length; i++) {
        let word = words[i]

        context.font = word.style

        let metrics = context.measureText(word.word + ' ')

        if (Math.ceil(lineWidth + metrics.width) <= maxWidth) {
            currentLine.push(word)
            lineWidth += metrics.width
        } else {
            lines.push(currentLine)
            currentLine = [word]
            lineWidth = metrics.width
        }
    }

    lines.push(currentLine)

    return lines
}

const fillText = (context, wordArray, x, y) => {
    for (let i = 0; i < wordArray.length; i++) {
        let word = wordArray[i]

        context.font = word.style
        context.fillText(word.word + ' ', x, y)

        let metrics = context.measureText(word.word + ' ')

        x += metrics.width  // eslint-disable-line no-param-reassign
    }
}

const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    let lines = wrapTextLines(context, text, maxWidth)

    for (let i = 0; i < lines.length; i ++) {
        let line = lines[i]

        fillText(context, line, x, y)

        y += lineHeight  // eslint-disable-line no-param-reassign
    }
}

const centerText = (context, text, width, x, y) => {
    let w = context.measureText(text).width
    context.fillText(text, x + ((width - w) / 2), y)
}

angular.module('avatech').directive('profileEditor', [
    '$timeout',
    'snowpitConstants',

    (
        $timeout,
        snowpitConstants
    ) => ({
        restrict: 'A',
        scope: {
            profile: '=profileEditor',
            settings: '=',
            columns: '=',
            options: '=',
            profileLayers: '=?clientLayers',
            clientComments: '=?clientComments'
        },
        link: (scope, element) => {
            // select layer on click
            element.bind('mousedown', e => {
                if (scope.settings.tempMode) return

                let point = getRelativeCoords(e)

                angular.forEach(scope._sideLayers, (layer, index) => {
                    if (isPointInPoly(layer, point)) {
                        scope.settings.selectedLayer = scope.profile.layers[index]
                        scope.$apply()
                        return
                    }
                })

                angular.forEach(scope._layers, (layer, index) => {
                    if (isPointInPoly(layer, point)) {
                        scope.settings.selectedLayer = scope.profile.layers[index]
                        scope.$apply()
                        return
                    }
                })
            })

            // element.bind('mousemove', function(event) {
            //     var point = getRelativeCoords(event);

            //     angular.forEach(scope.layers,function(layer, index) {
            //         if(isPointInPoly(layer,point)) {
            //             angular.forEach(scope.profile.layers, function(_layer, _index) {
            //                 _layer.hover = (index == _index);
            //             });
            //             scope.render();
            //         }
            //     });
            // });

            // using '$watch' allows the canvas to be redrawn when bound vars change
            scope.$watch('profile', () => scope.render(), true)
            scope.$watch('settings', () => scope.render(), true)

            let canvas = element[0]
            let scale = window.devicePixelRatio
            let context = canvas.getContext('2d')

            scope.getGrainType = grainType => {
                if (!grainType) return undefined

                for (let i = 0; i < snowpitConstants.grainTypes.length; i++) {
                    for (let j = 0; j < snowpitConstants.grainTypes[i].types.length; j++) {
                        if (snowpitConstants.grainTypes[i].types[j].icssg === grainType) {
                            return snowpitConstants.grainTypes[i].types[j]
                        }
                    }
                }
            }

            let first = true

            scope.render = () => {
                let options = scope.options
                let columns = angular.copy(scope.columns)

                if (!options) options = {}
                if (!options.background) options.background = 'rgba(255,255,255,0)'
                if (!options.labelColor) options.labelColor = '#000'
                if (!options.commentLineColor) options.commentLineColor = '#666'
                if (!options.dashedLineColor) options.dashedLineColor = '#ddd'
                if (options.print === null) options.print = false
                if (options.showDepth === null) options.showDepth = true
                if (options.showDensity === null) options.showDensity = true
                if (options.drawGrainSize === null) options.drawGrainSize = true
                if (options.drawWaterContent === null) options.drawWaterContent = true
                if (options.drawSurfaceLabel === null) options.drawSurfaceLabel = true

                // only call once
                if (options.scale) scale = options.scale // 4

                if (first) {
                    if (scale > 1) {
                        canvas.width *= scale
                        canvas.height *= scale
                        context.scale(scale, scale)
                    } else {
                        context.translate(0.5, 0.5)
                    }

                    first = false
                }

                // reset global alpha
                context.globalAlpha = 1

                // scaling

                let drawColumn = (context, index, drawFunc) => {
                    context.save()

                    let widthOnLeft = 0
                    let thisColumn = columns[index]

                    if (!thisColumn) return drawFunc(null)

                    for (let i = 0; i < columns.length; i++) {
                        if (i === index) break

                        widthOnLeft += columns[i].width
                    }

                    thisColumn.offsetLeft = widthOnLeft
                    context.translate(widthOnLeft, 0)
                    drawFunc(thisColumn)
                    context.restore()
                }

                let drawColumns = (context, index, count, drawFunc) => {
                    context.save()

                    let widthOnLeft = 0
                    let thisColumn = columns[index]

                    if (!thisColumn) return drawFunc(null)

                    for (let i = 0; i < columns.length; i++) {
                        if (i === index) break

                        widthOnLeft += columns[i].width
                    }

                    let newColumn = { width: 0 }

                    for (let i = index; i < index + count; i++) {
                        newColumn.width += columns[i].width
                    }

                    newColumn.offsetLeft = widthOnLeft

                    context.translate(widthOnLeft, 0)
                    drawFunc(newColumn)
                    context.restore()
                }

                // clear canvas
                context.clearRect(0, 0, canvas.width, canvas.height)

                // canvas background
                context.fillStyle = options.background
                context.fillRect(0, 0, canvas.width, canvas.height)
                context.fill()

                let surfaceLayerHeight = 40
                let paddingLeft = 50
                let paddingTop = 35 + surfaceLayerHeight
                let paddingBottom = 20

                let graphHeight = Math.round(
                    canvas.height / scale - paddingBottom - paddingTop
                )

                let hardness = snowpitConstants.hardness

                if (!scope.profile) return

                // keep track of layer position so they can be interacted with
                scope._layers = []
                scope._sideLayers = []

                // combine stability tests and layer comments into one array
                let allComments = angular.copy(scope.profile.tests)

                angular.forEach(scope.profile.layers, layer => {
                    if (layer.tests) {
                        allComments.push({
                            depth: (scope.profile.depth - layer.depth - layer.height),
                            comment: layer.tests
                        })
                    }
                })

                // "merge" comments at same depth
                let comments = []
                let commentsObj = {}
                let index = 0

                angular.forEach(allComments, comment => {
                    if (comment) {
                        if (comment.depth === null) comment.depth = -1

                        let obj = commentsObj[comment.depth + '']

                        if (!obj) {
                            commentsObj[comment.depth + ''] = {
                                depth: comment.depth,
                                comments: []
                            }
                        }

                        comment.index = index
                        commentsObj[comment.depth + ''].comments.push(comment)
                        index++
                    }
                })

                angular.forEach(commentsObj, comment => {
                    comments.push(comment)
                })

                comments.sort((a, b) => a.depth - b.depth)

                // draw stability tests and comments
                drawColumn(context, 0, column => {
                    if (scope.settings.tempMode && !options.print) {
                        context.globalAlpha = 0.3
                    }

                    let connectorWidth = 14
                    let itemWidth = column.width - connectorWidth - 8
                    let itemHeight = 11
                    let itemPadding = 5
                    let commentPadding = 12

                    // 1. CALCULATE

                    // calculate client height/depth
                    angular.forEach(comments, comment => {
                        // calculate number of lines
                        let _itemHeight = 0

                        for (let _comment of comment.comments) {
                            // test/comment text
                            var text = _comment.comment

                            if (_comment.type === 'ECT') {
                                text = '[b]' + _comment.ECT.score

                                if (
                                    _comment.ECT.score === 'ECTP' ||
                                    _comment.ECT.score === 'ECTN'
                                ) {
                                    text += _comment.ECT.taps
                                }

                                text += ' '

                                if (_comment.ECT.shear) text += _comment.ECT.shear + ' '
                                if (_comment.ECT.fracture) text += _comment.ECT.fracture + ' '

                                text += '[/b] '

                                if (
                                    _comment.comment &&
                                    _comment.comment !== ''
                                ) {
                                    text += '' + _comment.comment + ''
                                }
                            } else if (_comment.type === 'CT') {
                                text = '[b]' + _comment.CT.score

                                if (_comment.CT.score === 'CT') text += _comment.CT.taps

                                text += ' '

                                if (_comment.CT.shear) text += _comment.CT.shear + ' '
                                if (_comment.CT.fracture) text += _comment.CT.fracture + ' '

                                text += '[/b] '

                                if (
                                    _comment.comment &&
                                    _comment.comment !== ''
                                ) {
                                    text += '' + _comment.comment + ''
                                }
                            } else if (_comment.type === 'RB') {
                                text = '[b]' + _comment.RB.score + ' '

                                if (_comment.RB.shear) text += _comment.RB.shear + ' '
                                if (_comment.RB.fracture) text += _comment.RB.fracture + ' '

                                text += '[/b] '

                                if (
                                    _comment.comment &&
                                    _comment.comment !== ''
                                ) {
                                    text += '' + _comment.comment + ''
                                }
                            } else if (_comment.type === 'SB') {
                                text = '[b]' + _comment.SB.score + ' '

                                if (_comment.SB.shear) text += _comment.SB.shear + ' '
                                if (_comment.SB.fracture) text += _comment.SB.fracture + ' '

                                text += '[/b] '

                                if (
                                    _comment.comment &&
                                    _comment.comment !== ''
                                ) {
                                    text += '' + _comment.comment + ''
                                }
                            } else if (_comment.type === 'ST') {
                                text = '[b]' + _comment.ST.score + ' '

                                if (_comment.ST.shear) text += _comment.ST.shear + ' '
                                if (_comment.ST.fracture) text += _comment.ST.fracture + ' '

                                text += '[/b] '

                                if (
                                    _comment.comment &&
                                    _comment.comment !== ''
                                ) {
                                    text += '' + _comment.comment + ''
                                }
                            } else if (_comment.type === 'DT') {
                                text = '[b]' + _comment.DT.score

                                if (_comment.DT.score === 'DT') text += _comment.DT.taps

                                text += ' '

                                if (_comment.DT.shear) text += _comment.DT.shear + ' '
                                if (_comment.DT.fracture) text += _comment.DT.fracture + ' '

                                text += '[/b] '

                                if (
                                    _comment.comment &&
                                    _comment.comment !== ''
                                ) {
                                    text += '' + _comment.comment + ''
                                }
                            } else if (_comment.type === 'PST') {
                                text = '[b]PST '

                                if (_comment.PST.lengthSawCut && _comment.PST.lengthColumn) {
                                    text += (
                                        _comment.PST.lengthSawCut +
                                        '/' +
                                        _comment.PST.lengthColumn +
                                        ' '
                                    )
                                }

                                text += '(' + _comment.PST.score + ') '
                                text += '[/b] '

                                if (
                                    _comment.comment &&
                                    _comment.comment !== ''
                                ) {
                                    text += '' + _comment.comment + ''
                                }
                            }

                            _comment.text = text

                            let _numberOfLines = wrapTextLines(context, text, itemWidth).length
                            let subCommentHeight = _numberOfLines * itemHeight

                            // keep track of client height
                            _comment.clientHeight = subCommentHeight

                            // add subcomment height to comment height
                            _itemHeight += subCommentHeight
                        }

                        // add item padding
                        _itemHeight += itemPadding * comment.comments.length
                        _itemHeight -= 2

                        let clientDepth = graphHeight - Math.round(
                            (scope.profile.depth - comment.depth) *
                            (graphHeight / scope.profile.depth)
                        )

                        comment.depthGraph = clientDepth
                        comment.depthClient = clientDepth
                        comment.heightClient = _itemHeight
                    })

                    // if last comment is over the bottom edge, pull it up
                    let lastComment = comments[comments.length - 1]

                    if (lastComment) {
                        let dif = (lastComment.depthClient + lastComment.heightClient) - graphHeight

                        if (dif > 0) {
                            lastComment.depthClient -= dif + 3
                        }
                    }

                    for (let x = 0; x < comments.length; x++) {
                        for (let i = 0; i < comments.length; i++) {
                            let comment = comments[i]
                            let nextComment = (comments.length === i ? null : comments[i + 1])

                            if (nextComment) {
                                let dif = (
                                    comment.depthClient +
                                    comment.heightClient +
                                    commentPadding
                                ) - nextComment.depthClient

                                if (dif > 0) comment.depthClient -= dif
                            }
                        }
                    }

                    // topmost comment must always remain at top
                    angular.forEach(comments, comment => {
                        if (comment.depth === -1) comment.depthClient = -surfaceLayerHeight - 6
                        if (comment.depth === 0) comment.depthClient = 0
                    })

                    for (let i = 0; i < comments.length; i++) {
                        let comment = comments[i]
                        let nextComment = (comments.length === i ? null : comments[i + 1])

                        if (nextComment) {
                            let dif = (
                                comment.depthClient +
                                comment.heightClient +
                                commentPadding
                            ) - nextComment.depthClient

                            if (dif > 0) nextComment.depthClient += dif
                        }
                    }

                    // 2. DRAW
                    scope.clientComments = angular.copy(allComments)
                    scope.profileLayers = angular.copy(scope.profile.layers)

                    angular.forEach(comments, comment => {
                        // side layer lines
                        let depth1 = parseInt(comment.depthGraph + paddingTop, 10)
                        let depth2 = parseInt(comment.depthClient + paddingTop, 10)

                        context.beginPath()
                        context.strokeStyle = options.commentLineColor

                        // if hovering on comment
                        if (scope.settings.hoverComment &&
                            scope.settings.hoverComment.depth === comment.depth) {
                            context.strokeStyle = '#333'
                        }

                        if (comment.depth !== -1) {
                            let stub = 12

                            // alter stub size based on proximity of comment depth to graph depth
                            let dif = comment.depthClient - comment.depthGraph

                            if (dif !== 0) {
                                stub = stub - Math.pow(Math.abs(dif), 1 / 2)
                            }

                            if (stub < 0) {
                                stub = 0
                            }

                            context.moveTo(column.width, depth1)
                            context.lineTo(column.width, depth1)
                            context.lineTo(column.width - stub, depth1)
                            context.lineTo(column.width - connectorWidth, depth2)
                            context.lineTo(2, depth2)
                        }

                        // draw depth lines
                        context.lineTo(2, depth2 + comment.heightClient + 4)
                        context.stroke()
                        context.closePath()

                        let runningDepth = 9

                        angular.forEach(comment.comments, (_comment, index) => {
                            let depth = depth2 + runningDepth + itemPadding
                            runningDepth += _comment.clientHeight + itemPadding

                            // draw text
                            context.fillStyle = options.labelColor
                            wrapText(context, _comment.text, 7, depth, itemWidth, itemHeight)

                            // keep track of client depth
                            angular.forEach(scope.clientComments, comment => {
                                if (
                                    comment &&
                                    comment.depth !== null &&
                                    comment.index === _comment.index
                                ) {
                                    comment.clientDepth = depth
                                }
                            })
                        })
                    })
                })

                // draw graph background
                drawColumns(context, 1, 2, column => {
                    context.fillStyle = '#fff'
                    context.beginPath()
                    context.fillRect(
                        0, paddingTop - surfaceLayerHeight,
                        column.width, graphHeight + surfaceLayerHeight
                    )
                    context.fill()
                    context.closePath()
                })

                // draw layer background tick lines
                drawColumn(context, 2, column => {
                    // tick lines
                    angular.forEach(['I', 'K', 'P', '1F', '4F', 'F'], type => {
                        context.lineWidth = 1
                        context.strokeStyle = '#e5e5e5'
                        if (options.print) context.strokeStyle = '#d5d5d5'
                        context.beginPath()

                        let w = column.width - Math.round(column.width * hardness[type].width)
                        context.moveTo(w, paddingTop)
                        context.lineTo(w, paddingTop + graphHeight)
                        context.stroke()
                    })

                    // angular.forEach(['I-','K+','K-','P+','P-','1F+','1F-','4F+','4F-','F+'],
                    // function(type) {
                    //     context.lineWidth = 1;
                    //     context.strokeStyle = "#f9f9f9";
                    //     if (options.print) context.strokeStyle = '#f0f0f0';
                    //     context.beginPath();

                    //     var w = column.width - Math.round(column.width * hardness[type].width);
                    //     context.moveTo(w, paddingTop);
                    //     context.lineTo(w, paddingTop + graphHeight);
                    //     context.stroke();
                    // });

                    context.closePath()

                    // hardness axis labels
                    context.fillStyle = options.labelColor
                    context.font = "11.5px 'roboto condensed'"

                    angular.forEach(['I', 'K', 'P', '1F', '4F', 'F'], type => {
                        let x = column.width - Math.round(column.width * hardness[type].width) - 5
                        let textWidth = context.measureText(type).width

                        context.fillText(
                            type,
                            x + ((10 - textWidth) / 2) + 1,
                            graphHeight + paddingTop + 13
                        ) // 62 = top
                    })
                })

                // draw stability test lines on density & layers columns
                drawColumns(context, 1, 2, column => {
                    if (scope.settings.tempMode && !options.print) {
                        context.globalAlpha = 0.1
                    }

                    // note depth dotted lines
                    context.moveTo(0, 0)
                    context.lineWidth = 1

                    angular.forEach(comments, comment => {
                        context.beginPath()
                        context.strokeStyle = options.dashedLineColor

                        // todo: setLineDash doesn't work in older versions of FF
                        if (context.setLineDash) context.setLineDash([3, 3])

                        // if hovering on comment
                        if (scope.settings.hoverComment &&
                            scope.settings.hoverComment.depth === comment.depth) {
                            context.strokeStyle = '#333'
                            context.setLineDash([])
                        }

                        let commentDepth = parseInt(comment.depthGraph + paddingTop, 10)

                        if (comment.depth !== -1) {
                            context.moveTo(0, commentDepth)
                            context.lineTo(column.width, commentDepth)
                            context.stroke()
                        }

                        context.closePath()
                    })

                    if (context.setLineDash) context.setLineDash([])
                })

                // draw density
                drawColumn(context, 1, column => {
                    if (scope.settings.tempMode && !options.print) {
                        context.globalAlpha = 0.2
                    }

                    // only show density if specified
                    if (options.showDensity) {
                        angular.forEach(scope.profile.density, density => {
                            let depth = graphHeight - Math.round((
                                (scope.profile.depth - density.depth) /
                                scope.profile.depth
                            ) * graphHeight) + paddingTop + 5

                            context.fillStyle = options.labelColor
                            context.font = "10.5px 'roboto condensed'"
                            centerText(context, density.density, column.width, 0, depth)
                        })
                    }

                    // top label: density (only show if at least one density)
                    if (scope.profile.density && scope.profile.density.length > 0) {
                        context.fillStyle = options.labelColor
                        context.font = "10px 'roboto condensed'"
                        centerText(context, '\u03C1', column.width + 1.5, 0, 21)
                        centerText(context, 'kg/m\u00B3', column.width + 1, 0, 31)
                    }
                })

                // draw surface layer background
                drawColumns(context, 1, 2, column => {
                    context.fillStyle = '#fff'
                    context.fillRect(
                        0,
                        paddingTop - surfaceLayerHeight,
                        column.width,
                        surfaceLayerHeight
                    )

                    // hatching background

                    // first mask the area
                    context.save()
                    context.beginPath()
                    context.rect(
                        0,
                        paddingTop - surfaceLayerHeight,
                        column.width,
                        surfaceLayerHeight
                    )
                    context.closePath()
                    context.clip()

                    let spacing = 6

                    context.lineWidth = '1'
                    context.strokeStyle = 'rgba(0,0,0,.08)'

                    for (var i = -20; i < 100; i++) {
                        context.beginPath()
                        context.moveTo(i * spacing, paddingTop)
                        context.lineTo(
                            (i * spacing) + surfaceLayerHeight,
                            paddingTop - surfaceLayerHeight
                        )
                        context.stroke()
                        context.closePath()
                    }

                    // restore from mask
                    context.restore()
                })

                // draw layers
                drawColumn(context, 2, column => {
                    // draw layers
                    let prevDepth = paddingTop

                    angular.forEach(scope.profileLayers, (layer, index) => {
                        context.save()
                        context.fillStyle = '#4285f4'

                        if (scope.profile.layers[index] === scope.settings.selectedLayer) {
                            context.globalAlpha = 0.85
                        } else {
                            context.globalAlpha = 0.45
                        }

                        if (scope.settings.tempMode && !options.print) {
                            context.globalAlpha = 0.1
                        }

                        // VIEWS: layer coloring
                        let view = layer.views[scope.settings.view]

                        if (view && view.layer.length > 0) {
                            context.fillStyle = 'rgba(255,204,0,1)'

                            if (view.layer[0].color !== null) {
                                context.fillStyle = view.layer[0].color
                            }
                        }

                        let _newDepth = paddingTop + graphHeight - Math.round(
                            (scope.profile.depth - (scope.profile.depth - layer.depth)) *
                            (graphHeight / scope.profile.depth)
                        )

                        let _width = Math.round(hardness[layer.hardness].width * column.width)
                        let _width2 = _width

                        if (layer.hardness2) {
                            _width2 = Math.round(hardness[layer.hardness2].width * column.width)
                        }

                        // client/display stuff (this isn't bound to original, only clientLayers)
                        layer.index = index
                        layer.clientDepth = _newDepth - paddingTop
                        layer.clientTop = prevDepth - paddingTop
                        layer.clientBottom = graphHeight - (_newDepth - paddingTop)
                        layer.clientHeight = _newDepth - prevDepth
                        layer.clientWidthTop = _width
                        layer.clientWidthBottom = _width2
                        layer.clientInterfaceDepth = _newDepth

                        context.beginPath()

                        // layer polygon
                        context.moveTo(column.width, prevDepth + 0.5)
                        context.lineTo(column.width - _width, prevDepth + 0.5)
                        context.lineTo(column.width - _width2, _newDepth)
                        context.lineTo(column.width, _newDepth)

                        // layer clip mask
                        context.clip()

                        // fill background
                        context.fill()

                        // keep trak of polygon dimensions for clicking
                        scope._layers.push([
                            [column.offsetLeft + column.width, prevDepth],
                            [column.offsetLeft + column.width - _width, prevDepth],
                            [column.offsetLeft + column.width - _width2, _newDepth],
                            [column.offsetLeft + column.width, _newDepth]
                        ])

                        if (scope.settings.tempMode && !options.print) {
                            context.globalAlpha = 0.1
                        } else {
                            context.globalAlpha = 1
                        }

                        // layer of concern
                        if (layer.concern && layer.concern !== '') {
                            context.strokeStyle = 'rgba(255,0,0,8)'
                            context.lineWidth = 3
                            context.beginPath()

                            if (layer.concern === 'B' || layer.concern === 'L') {
                                context.moveTo(0, _newDepth - 1.1)
                                context.lineTo(column.width, _newDepth - 1.1)
                            } else if (layer.concern === 'T') {
                                context.moveTo(0, prevDepth + 1.1)
                                context.lineTo(column.width, prevDepth + 1.1)
                            }

                            context.stroke()
                            context.closePath()
                        }

                        // restore from clip mask
                        context.restore()

                        prevDepth = _newDepth
                    })

                    // draw interface boundry lines
                    angular.forEach(scope.profileLayers, (layer, index) => {
                        let _width = Math.round(hardness[layer.hardness].width * column.width)
                        let _width2 = _width

                        if (layer.hardness2) {
                            _width2 = Math.round(hardness[layer.hardness2].width * column.width)
                        }

                        context.strokeStyle = '#444'
                        context.lineWidth = 1

                        if (
                            (
                                scope.profile.layers[index] === scope.settings.hoverDragLayer &&
                                !scope.settings.dragging
                            ) || layer === scope.settings.dragging
                        ) {
                            context.strokeStyle = '#ffcc00'
                        }

                        if (options.print) context.strokeStyle = '#000'

                        if (scope.settings.tempMode && !options.print) {
                            context.strokeStyle = 'rgba(0,0,0,.2)'
                        }

                        context.beginPath()
                        context.moveTo(column.width - _width2, layer.clientInterfaceDepth)
                        context.lineTo(column.width, layer.clientInterfaceDepth)

                        context.stroke()
                        context.closePath()
                    })

                    // plot temps
                    let surfaceTemp
                    let maxTemp = 30
                    let _width = column.width - 2

                    context.moveTo(_width, paddingTop)

                    if (scope.profile.temps && scope.profile.temps.length > 0) {
                        context.beginPath()

                        for (let i = 0; i < scope.profile.temps.length; i++) {
                            if (scope.profile.temps[i].depth === 0) {
                                surfaceTemp = scope.profile.temps[i].temp
                            }

                            let plotTemp = (
                                (maxTemp - Math.abs(scope.profile.temps[i].temp)) *
                                (_width / maxTemp) + 1
                            )

                            context.lineTo(
                                plotTemp,
                                paddingTop + (
                                    scope.profile.temps[i].depth *
                                    (graphHeight / scope.profile.depth)
                                )
                            )
                        }

                        context.lineCap = 'round'
                        context.lineJoin = 'round'
                        context.lineWidth = 2
                        context.strokeStyle = 'rgba(255,0,0,.5)'

                        if (scope.settings.tempMode && !options.print) context.strokeStyle = 'red'

                        context.stroke()
                    }

                    // plot surface temp to air temp
                    if (
                        surfaceTemp !== null &&
                        scope.profile.airTemp !== null
                        && scope.profile.airTemp <= 0
                        && scope.profile.temps && scope.profile.temps.length > 0
                    ) {
                        let airTemp = (
                            (maxTemp - Math.abs(scope.profile.airTemp)) *
                            (_width / maxTemp) + 1
                        )

                        surfaceTemp = (maxTemp - Math.abs(surfaceTemp)) * (_width / maxTemp) + 1
                        context.setLineDash([5, 5])
                        context.beginPath()
                        context.moveTo(surfaceTemp, paddingTop)
                        context.lineTo(airTemp, paddingTop - surfaceLayerHeight)
                        context.stroke()
                        context.setLineDash([])
                    }

                    context.lineJoin = 'miter'
                    context.lineCap = 'butt'
                    context.closePath()

                    // temp axis labels
                    // if (scope.settings.tempMode) {
                    context.fillStyle = options.labelColor
                    context.font = '10px roboto condensed'

                    let tempUnits = 'C'

                    if (scope.settings.tempUnits) {
                        tempUnits = scope.settings.tempUnits
                    }

                    if (tempUnits === 'C') {
                        angular.forEach(['0°C', '-5', '-10',
                                         '-15', '-20', '-25', ''], (temp, index) => {
                            context.fillText(
                                temp,
                                column.width - (
                                    (column.width / 6.1) * (index + 1)
                                ) + (column.width / 6.1) - 10, 31)
                        })
                    } else if (tempUnits === 'F') {
                        angular.forEach(['32°F', '24', '16',
                                         '8', '0', '-8', '-16'], (temp, index) => {
                            context.fillText(
                                temp,
                                column.width - (
                                    (column.width / 6.8) * (index + 1)
                                ) + (column.width / 6.8) - 6, 31)
                        })
                    }

                    // }
                })

                // draw layer details
                drawColumn(context, 3, column => {
                    if (scope.settings.tempMode && !options.print) {
                        context.globalAlpha = 0.2
                    }

                    let paddingLeft = 70
                    let connectorWidth = 30
                    let minHeight = 23
                    let _width = column.width - paddingLeft
                    let _extra = 0

                    // background
                    context.beginPath()
                    context.fillStyle = '#fafafa'
                    context.fillRect(
                        0,
                        paddingTop - surfaceLayerHeight,
                        _width,
                        graphHeight + surfaceLayerHeight
                    )
                    context.fill()
                    context.closePath()

                    // 1. CALCULATE
                    let runningDepthClientSide = 0

                    angular.forEach(scope.profileLayers, layer => {
                        // calculate side layers
                        let _runningDepthClientSide = runningDepthClientSide

                        if (layer.clientHeight < minHeight) {
                            runningDepthClientSide += minHeight;
                            _extra += minHeight - layer.clientHeight;
                        } else {
                            let newHeight = layer.clientHeight - _extra
                            _extra = 0

                            if (newHeight < minHeight) {
                                runningDepthClientSide += minHeight
                                _extra += minHeight - newHeight
                            } else {
                                runningDepthClientSide += newHeight
                            }
                        }

                        layer.sideLayerDepthClient = runningDepthClientSide
                        layer.sideLayerHeightClient = (
                            runningDepthClientSide - _runningDepthClientSide
                        )
                    })

                    // if the side layers are too tall to fit, squeeze it in
                    if (runningDepthClientSide > graphHeight) {
                        let overflow = (runningDepthClientSide - graphHeight)

                        // todo: if it can all be taken out of one layer, chose that one

                        for (let l = scope.profileLayers.length - 1; l >= 0; l--) {
                            let _layer = scope.profileLayers[l]
                            let availableHeight = _layer.sideLayerHeightClient - minHeight

                            if (overflow > 0 && availableHeight > 0) {
                                let maxRemove = availableHeight

                                if (maxRemove > overflow) {
                                    maxRemove = overflow
                                }

                                _layer.sideLayerHeightClient -= maxRemove
                                overflow -= maxRemove
                            }
                        }

                        // go back and recalculate depth
                        runningDepthClientSide = 0

                        angular.forEach(scope.profileLayers, layer => {
                            runningDepthClientSide += layer.sideLayerHeightClient
                            layer.sideLayerDepthClient = runningDepthClientSide
                        })
                    }

                    // 2. DRAW

                    // side layer fill
                    let previousLayer = null

                    angular.forEach(scope.profileLayers, (layer, index) => {
                        let depth1 = layer.clientDepth + paddingTop
                        let depth2 = layer.sideLayerDepthClient + paddingTop
                        let stub = 9
                        let dif = Math.abs(depth2 - depth1)

                        if (dif > 20) stub = 8
                        if (dif > 40) stub = 7
                        if (dif > 60) stub = 6
                        if (dif > 80) stub = 5
                        if (dif > 100) stub = 2
                        if (dif > 120) stub = 0

                        layer.stub = stub
                        context.fillStyle = '#fff'

                        // highlight background when selected
                        if (
                            !options.print &&
                            (scope.profile.layers[index] === scope.settings.selectedLayer)
                        ) {
                            context.fillStyle = 'rgba(66,133,244,.1)'
                        }

                        context.lineWidth = 0
                        context.beginPath()

                        // use this to keep track of layer polygon for interactivity
                        let sideLayer = []

                        if (previousLayer) {
                            context.moveTo(_width, previousLayer.depth2)
                            context.lineTo(connectorWidth, previousLayer.depth2)
                            context.lineTo(previousLayer.stub, previousLayer.depth1)
                            context.lineTo(0, previousLayer.depth1)

                            sideLayer.push([
                                column.offsetLeft + _width,
                                previousLayer.depth2
                            ])

                            sideLayer.push([
                                column.offsetLeft + connectorWidth,
                                previousLayer.depth2
                            ])

                            sideLayer.push([
                                column.offsetLeft + previousLayer.stub,
                                previousLayer.depth1
                            ])

                            sideLayer.push([
                                column.offsetLeft + 0,
                                previousLayer.depth1
                            ])
                        } else {
                            context.moveTo(_width, paddingTop)
                            context.lineTo(0, paddingTop)

                            sideLayer.push([
                                column.offsetLeft + _width,
                                paddingTop
                            ])

                            sideLayer.push([
                                column.offsetLeft + 0,
                                paddingTop
                            ])
                        }

                        context.lineTo(0, depth1)
                        context.lineTo(stub, depth1)
                        context.lineTo(connectorWidth, depth2)
                        context.lineTo(_width, depth2)
                        context.closePath()
                        context.fill()

                        sideLayer.push([column.offsetLeft + 0, depth1])
                        sideLayer.push([column.offsetLeft + stub, depth1])
                        sideLayer.push([column.offsetLeft + connectorWidth, depth2])
                        sideLayer.push([column.offsetLeft + _width, depth2])
                        scope._sideLayers.push(sideLayer)

                        previousLayer = { stub: stub, depth1: depth1, depth2: depth2 }
                    })

                    let drawGrainType = (layer, depth2) => {
                        let fontSize = 21

                        context.fillStyle = options.labelColor
                        context.font = fontSize + 'px snowsymbols'

                        if (layer.grainType && layer.grainType2) {
                            let scale = scope.getGrainType(layer.grainType).scale

                            if (scale !== null) {
                                context.font = (fontSize * scale) + 'px snowsymbols'
                            }

                            let offsetTop = scope.getGrainType(layer.grainType).offsetTop

                            if (offsetTop === null) {
                                offsetTop = 0
                            }

                            centerText(
                                context,
                                scope.getGrainType(layer.grainType).symbol,
                                20,
                                connectorWidth,
                                depth2 - (layer.sideLayerHeightClient / 2) + 6 + offsetTop
                            )

                            context.font = '21px snowsymbols'

                            // context.fillStyle = "#999";

                            let scale2 = scope.getGrainType(layer.grainType2).scale

                            if (scale2 !== null) {
                                context.font = (fontSize * scale2) + 'px snowsymbols'
                            }

                            let offsetTop2 = scope.getGrainType(layer.grainType2).offsetTop

                            if (offsetTop2 === null) {
                                offsetTop2 = 0
                            }

                            centerText(
                                context,
                                scope.getGrainType(layer.grainType2).symbol,
                                20,
                                connectorWidth + 24,
                                depth2 - (layer.sideLayerHeightClient / 2) + 6 + offsetTop2
                            )

                            // parens
                            context.font = "100 18px 'roboto condensed'"
                            context.fillText(
                                '(',
                                connectorWidth + 20,
                                depth2 - (layer.sideLayerHeightClient / 2) + 5
                            )

                            context.fillText(
                                ')',
                                connectorWidth + 43,
                                depth2 - (layer.sideLayerHeightClient / 2) + 5
                            )
                        } else if (layer.grainType) {
                            let _grainType = scope.getGrainType(layer.grainType)

                            if (_grainType) {
                                let scale = _grainType.scale

                                if (scale !== null) {
                                    context.font = (fontSize * scale) + 'px snowsymbols'
                                }

                                let offsetTop = scope.getGrainType(layer.grainType).offsetTop

                                if (offsetTop === null) offsetTop = 0

                                centerText(
                                    context,
                                    scope.getGrainType(layer.grainType).symbol,
                                    45,
                                    connectorWidth,
                                    depth2 - (layer.sideLayerHeightClient / 2) + 6 + offsetTop
                                )
                            }
                        }
                    }

                    let drawGrainSize = (layer, depth2) => {
                        if (!options.drawGrainSize) return

                        context.fillStyle = options.labelColor
                        context.font = "11px 'roboto condensed'"

                        if (layer.grainSize) {
                            let text = layer.grainSize

                            if (layer.grainSize2) {
                                text += '-' + layer.grainSize2
                            }

                            let width = context.measureText(text).width

                            centerText(
                                context,
                                text,
                                30,
                                connectorWidth + 60,
                                depth2 - (layer.sideLayerHeightClient / 2) + 4.5
                            )
                        }
                    }

                    // draw border between side layers and layers
                    // context.strokeStyle = "red";
                    // context.lineWidth = 1;
                    // context.beginPath();
                    // context.moveTo(0,paddingTop - surfaceLayerHeight);
                    // context.lineTo(0,graphHeight + paddingTop);
                    // context.stroke();
                    // context.closePath();

                    angular.forEach(scope.profileLayers, (layer, index) => {
                        // side layer lines
                        let depth1 = layer.clientDepth + paddingTop
                        let depth2 = layer.sideLayerDepthClient + paddingTop
                        let stub = layer.stub

                        context.beginPath()
                        context.moveTo(0, depth1)
                        context.lineTo(0, depth1)
                        context.lineTo(stub, depth1)
                        context.lineTo(connectorWidth, depth2)
                        context.lineTo(_width, depth2)

                        context.lineWidth = 1
                        context.strokeStyle = '#111'
                        context.stroke()

                        // draw grain type and size
                        drawGrainType(layer, depth2)
                        drawGrainSize(layer, depth2)

                        // draw water content
                        if (options.drawWaterContent) {
                            context.fillStyle = '#444';
                            context.font = "11px 'roboto condensed'"

                            if (layer.waterContent) {
                                centerText(
                                    context,
                                    layer.waterContent,
                                    30,
                                    connectorWidth + 60 + 42,
                                    depth2 - (layer.sideLayerHeightClient / 2) + 4.5
                                )
                            }
                        }

                        // depth axis labels (relative to right side of canvas)
                        if (options.showDepth) {
                            let depthText = layer.depth

                            if (!scope.settings.depthDescending) {
                                depthText = scope.profile.depth - layer.depth
                            }

                            context.fillStyle = options.labelColor
                            context.font = "10px 'roboto condensed'"
                            context.fillText(
                                depthText,
                                column.width - paddingLeft + 3.5,
                                depth2 + 3.5
                            )
                        }

                        // flags and lemons

                        let posX = 45

                        if (scope.settings.view === 'flags') {
                            let nextLayer = scope.profileLayers[index + 1]

                            if (nextLayer) {
                                let totals = Math.max(
                                    layer.views.flags.layer.length,
                                    nextLayer.views.flags.layer.length
                                )

                                totals += layer.views.flags.interface.length

                                if (totals > 0) {
                                    context.font = "11.5px 'fontawesome'"
                                    context.fillText(
                                        '\uf024',
                                        column.width - paddingLeft + posX - 15,
                                        depth2 + 3.5
                                    )
                                    context.font = "10px 'roboto condensed'"
                                    context.fillText(
                                        totals,
                                        column.width - paddingLeft + posX,
                                        depth2 + 3.5
                                    )
                                }
                            }
                        }

                        if (scope.settings.view === 'lemons') {
                            if (layer.views.lemons.layer.length > 0) {
                                let text = ''

                                angular.forEach(layer.views.lemons.layer, match => {
                                    text += match.rule + ','
                                })

                                text = text.slice(0, - 1)

                                context.font = "11.5px 'fontawesome'"
                                context.fillText(
                                    '\uf094',
                                    column.width - paddingLeft + posX - 15,
                                    depth2 - (layer.sideLayerHeightClient / 2) + 4
                                )
                                context.font = "10px 'roboto condensed'"
                                context.fillText(
                                    text,
                                    column.width - paddingLeft + posX,
                                    depth2 - (layer.sideLayerHeightClient / 2) + 4
                                )
                            }

                            if (layer.views.lemons.interface.length > 0) {
                                let text = '';

                                angular.forEach(layer.views.lemons.interface, match => {
                                    text += match.rule + ','
                                })

                                text = text.slice(0, - 1)

                                context.font = "11.5px 'fontawesome'"
                                context.fillText(
                                    '\uf094',
                                    column.width - paddingLeft + posX - 15,
                                    depth2 + 3.5
                                )
                                context.font = "10px 'roboto condensed'"
                                context.fillText(
                                    text,
                                    column.width - paddingLeft + posX,
                                    depth2 + 3.5
                                )
                            }
                        }
                    })

                    // draw surface layer details background
                    context.fillStyle = '#fafafa';
                    context.fillRect(
                        0,
                        paddingTop - surfaceLayerHeight,
                        column.width - 70,
                        surfaceLayerHeight
                    )

                    // draw surface grain type and size
                    if (scope.profile.surfaceGrainType) {
                        drawGrainType({
                            grainType: scope.profile.surfaceGrainType,
                            grainType2: scope.profile.surfaceGrainType2,
                            sideLayerHeightClient: surfaceLayerHeight
                        }, paddingTop)
                    }

                    // draw surface grain size
                    if (scope.profile.surfaceGrainSize) {
                        drawGrainSize({
                            grainSize: scope.profile.surfaceGrainSize,
                            grainSize2: scope.profile.surfaceGrainSize2,
                            sideLayerHeightClient: surfaceLayerHeight
                        }, paddingTop)
                    }

                    // top depth axis label (either 0 or profile depth, depending on depth setting)
                    if (options.showDepth) {
                        let depthText = scope.settings.depthDescending ? scope.profile.depth : '0'

                        context.fillStyle = options.labelColor
                        context.font = "10px 'roboto condensed'"
                        context.fillText(
                            depthText,
                            column.width - paddingLeft + 3.5,
                            3.5 + paddingTop
                        )
                        context.font = "100 10px 'roboto condensed'"

                        if (options.drawSurfaceLabel) {
                            context.fillText(
                                'SURFACE',
                                column.width - paddingLeft + 22,
                                3.5 + paddingTop
                            )
                        }
                    }

                    // top labels
                    context.fillStyle = options.labelColor
                    context.font = "9px 'roboto condensed'"

                    centerText(context, 'GRAIN', 30, 37.5, 21)
                    centerText(context, 'TYPE', 30, 37.5, 31)

                    if (options.drawGrainSize) {
                        centerText(context, 'GRAIN', 30, 90.5, 21)
                        centerText(context, 'SIZE', 30, 90.5, 31)
                    }

                    if (options.drawWaterContent) {
                        centerText(context, 'WATER', 30, 133, 21)
                        centerText(context, 'CONTENT', 30, 133, 31)
                    }
                })

                // draw surface line
                drawColumns(context, 1, 3, column => {
                    context.lineWidth = 1
                    context.strokeStyle = '#111'
                    context.strokeStyle = '#e5e5e5'
                    if (options.print) context.strokeStyle = '#d5d5d5'
                    context.strokeStyle = options.commentLineColor
                    // context.strokeStyle = '#eee';

                    context.beginPath()
                    context.moveTo(0, paddingTop)
                    context.lineTo(column.width - 70, paddingTop)
                    context.stroke()
                    context.closePath()
                })

                // canvas border
                if (options.borderColor) {
                    context.lineWidth = 1
                    context.lineColor = options.borderColor

                    drawColumns(context, 1, 3, column => {
                        context.beginPath()
                        context.moveTo(column.width - 70, paddingTop - surfaceLayerHeight)
                        context.lineTo(0, paddingTop - surfaceLayerHeight)
                        context.lineTo(0, graphHeight + paddingTop)
                        context.lineTo(column.width - 70, graphHeight + paddingTop)
                        context.lineTo(column.width - 70, paddingTop - surfaceLayerHeight)
                        context.stroke()
                        context.closePath()
                    })

                    if (scope.profile.density && scope.profile.density.length > 0) {
                        drawColumn(context, 1, column => {
                            context.beginPath()
                            context.moveTo(column.width, paddingTop - surfaceLayerHeight)
                            context.lineTo(column.width, graphHeight + paddingTop)
                            context.stroke()
                            context.closePath()
                        })
                    }
                }

                scope.drawing = false
            }
        }
    })
])
