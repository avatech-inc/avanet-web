
const _ = {}

import lodashmap from 'lodash.map'
import minBy from 'lodash.minby'
import maxBy from 'lodash.maxby'
import sumBy from 'lodash.sumby'
import sum from 'lodash.sum'

import MG from 'metrics-graphics'

_.map = lodashmap
_.minBy = minBy
_.maxBy = maxBy
_.sumBy = sumBy
_.sum = sum

import './route-planning.html'

// UTILS
const calculateMunterEstimate = (
    totalTimeEstimate,
    munterRate,
    point,
    previousElev,
    currentElev,
    segmentDistance
) => {
    // MUNTER TIME ESTIMATES - DETAILS
    // http://www.foxmountainguides.com/about/the-guides-blog/tags/tag/munter-touring-plan
    // https://books.google.com/books?id=Yg3WTwZxLhIC&lpg=PA339&ots=E-lqpwepiA&dq=munter%20time%20calculation&pg=PA112#v=onepage&q=munter%20time%20calculation&f=false
    // distance: 1km = 1 unit (since distance is already in km, just use as-is)
    // vertical: 100m = 1 unit (vertical is in m, so just divide by 100)
    let totalTime = totalTimeEstimate
    if (currentElev.elev === null) {
        point.direction = 'flat'
        point.munterUnits = segmentDistance

        let munterRateFlat = (munterRate.up + munterRate.down) / 2
        point.timeEstimateMinutes = (point.munterUnits / munterRateFlat) * 60
    } else {
        point.elevationDifference = currentElev.elev - previousElev.elev

        if (point.elevationDifference > 0) {
            point.direction = 'up'
            point.verticalUp = point.elevationDifference

            point.munterUnits = segmentDistance + (point.verticalUp / 100)
            point.timeEstimateMinutes = (point.munterUnits / munterRate.up) * 60
        } else if (point.elevationDifference < 0) {
            point.direction = 'down'
            point.verticalDown = Math.abs(point.elevationDifference)

            point.munterUnits = segmentDistance + (point.verticalDown / 100)
            point.timeEstimateMinutes = (point.munterUnits / munterRate.down) * 60
        } else {
            point.direction = 'flat'
            point.munterUnits = segmentDistance

            let munterRateFlat = (munterRate.up + munterRate.down) / 2
            point.timeEstimateMinutes = (point.munterUnits / munterRateFlat) * 60
        }
    }
    totalTime += point.timeEstimateMinutes
    point.totalTimeEstimateMinutes = totalTime
    return point
}

const getBearing = (start, end) => {
    let bearing = turf.bearing(
        turf.point([start.lng, start.lat]),
        turf.point([end.lng, end.lat])
    )
    if (bearing < 0) bearing += 360
    return bearing
}

// for aspect only
const getAverageAspect = aspects => {
    let sines = []
    let cosines = []

    // get sines and cosines
    for (let aspect of aspects) {
        if (aspect !== null && aspect !== undefined) {
            aspect = parseInt(aspect, 10)

            // convert aspect degrees to radians
            sines.push(Math.sin(aspect * (Math.PI / 180)))
            cosines.push(Math.cos(aspect * (Math.PI / 180)))
        }
    }

    // calculate mean of sines and cosines
    let meanSine = _.sum(sines) / sines.length
    let meanCosine = _.sum(cosines) / cosines.length

    // calculate aspect in radians
    let averageAspectRadians = Math.atan2(meanSine, meanCosine)

    // convert to degrees
    let deg = averageAspectRadians * (180 / Math.PI)

    // if negative, adjust
    if (deg < 0) deg = 360 + deg

    return deg
}

const getLineSegmentStats = (statsPoints) => {
    if (!statsPoints || statsPoints.length < 2) return {}
    let startPoint = statsPoints[0]
    let endPoint = statsPoints[statsPoints.length - 1]

    let bearing = getBearing(startPoint, endPoint)

    let stats = {
        timeEstimateMinutes: endPoint.totalTimeEstimateMinutes - startPoint.totalTimeEstimateMinutes, // eslint-disable-line max-len
        distance: endPoint.totalDistance - startPoint.totalDistance,

        elevationChange: null,
        elevationMin: null,
        elevationMax: null,

        slopeMin: 0,
        slopeMax: 0,
        slopeAverage: 0,

        verticalUp: null,
        verticalDown: null,

        aspectMin: null,
        aspectMax: null,
        aspectAverage: getAverageAspect(_.map(statsPoints, 'aspect')),

        bearing: bearing
    }

    // set elevation change, max, min if available
    if (startPoint.elevation !== null && endPoint.elevation !== null) {
        stats.elevationChange = endPoint.elevation - startPoint.elevation
    }

    let minElevationPoint = _.minBy(statsPoints, 'elevation')
    let maxElevationPoint = _.maxBy(statsPoints, 'elevation')

    if (minElevationPoint && minElevationPoint.elevation !== null) {
        stats.elevationMin = minElevationPoint.elevation
    }

    if (maxElevationPoint && maxElevationPoint.elevation) {
        stats.elevationMax = maxElevationPoint.elevation
    }

    let minSlopePoint = _.minBy(statsPoints, 'slope')
    let maxSlopePoint = _.maxBy(statsPoints, 'slope')

    if (minSlopePoint && minSlopePoint.slope !== null) {
        stats.slopeMin = minSlopePoint.slope
    }

    if (maxSlopePoint && maxSlopePoint.slope !== null) {
        stats.slopeMax = maxSlopePoint.slope
    }

    let slopeTotal = _.sumBy(statsPoints, 'slope')

    if (slopeTotal) stats.slopeAverage = slopeTotal / statsPoints.length

    let verticalUp = _.sumBy(statsPoints, 'verticalUp')
    let verticalDown = _.sumBy(statsPoints, 'verticalDown')

    if (verticalUp) stats.verticalUp = verticalUp
    if (verticalDown) stats.verticalDown = verticalDown

    let minAspectPoint = _.minBy(statsPoints, 'aspect')
    let maxAspectPoint = _.maxBy(statsPoints, 'aspect')

    if (minAspectPoint) stats.aspectMin = minAspectPoint.aspect
    if (maxAspectPoint) stats.aspectMax = maxAspectPoint.aspect

    return stats
}

const getSegmentDistance = (previous, current) => { // eslint-disable-line arrow-body-style
    return turf.lineDistance(
        turf.linestring([
            [previous.lng, previous.lat],
            [current.lng, current.lat]
        ]),
        'kilometers'
    )
}

let getProfileGraphStats = (elevationData) => {
    if (!elevationData) return []

    let totalDistance = 0
    let graphPoints = []

    for (let i = 0; i < elevationData.length; i++) {
        if (!elevationData[i]) continue

        let graphPoint = {
            lat: elevationData[i].lat,
            lng: elevationData[i].lng,
            elevation: elevationData[i].elev,
            index: i,
            totalDistance: 0
        }
        if (i === 0) continue

        totalDistance += getSegmentDistance(elevationData[i - 1], elevationData[i])
        graphPoint.totalDistance = totalDistance
        graphPoints.push(graphPoint)
    }
    return graphPoints
}

let getRouteStats = (points, elevData, terrainData, munterRate) => {
    // check if terrainData is valid to use - no undefined values?
    // if terrainData is valid:
    //    ~ existing code
    // if not valid:
    //    calculate only using elevation api data
    //    ignore terrain data
    if (!points) return []
    let statsPoints = []

    let totalDistance = 0
    let totalTimeEstimateMinutes = 0
    let originalIndex = 0

    let noTerrain = false
    if (terrainData[0].elevation == null) {
        noTerrain = true
    }

    if (noTerrain) {
        for (let i = 0; i < elevData.length; i++) {
            if (!elevData[i]) continue

            let statsPoint = {
                lat: elevData[i].lat,
                lng: elevData[i].lng,
                elevation: elevData[i].elev,
            }
            // assign index for tracking
            statsPoint.index = i

            // defaults for first point
            statsPoint.totalDistance = 0
            statsPoint.totalTimeEstimateMinutes = 0

            if (i === 0) continue

            // keep track of distance
            const segmentDistance = getSegmentDistance(elevData[i - 1], elevData[i])
            statsPoint.distance = segmentDistance
            totalDistance += segmentDistance
            statsPoint.totalDistance = totalDistance

            // keep track of bearing
            statsPoint.bearing = getBearing(elevData[i - 1], elevData[i])

            // keep track of vertical up/down and munter time estimates
            statsPoint = calculateMunterEstimate(
                totalTimeEstimateMinutes,
                munterRate,
                statsPoint,
                elevData[i - 1],
                elevData[i],
                segmentDistance
            )
            totalTimeEstimateMinutes = statsPoint.totalTimeEstimateMinutes
            statsPoints.push(statsPoint)
        }
    } else {
        for (let i = 0; i < points.length; i++) {
            if (!points[i]) continue

            let statsPoint = {
                lat: points[i].lat,
                lng: points[i].lng,
                original: points[i].original,
                elevation: terrainData[i].elevation,
                slope: terrainData[i].slope,
                aspect: terrainData[i].aspect
            }
            // assign index for tracking
            statsPoint.index = i

            // assign original index for tracking markers
            if (statsPoint.original) {
                statsPoint.originalIndex = originalIndex
                originalIndex++
            }

            // defaults for first point
            statsPoint.totalDistance = 0
            statsPoint.totalTimeEstimateMinutes = 0

            if (i === 0) continue

            // keep track of distance
            const segmentDistance = getSegmentDistance(points[i - 1], points[i])
            statsPoint.distance = segmentDistance
            totalDistance += segmentDistance
            statsPoint.totalDistance = totalDistance

            // keep track of bearing
            statsPoint.bearing = getBearing(points[i - 1], points[i])

            // keep track of vertical up/down and munter time estimates
            statsPoint = calculateMunterEstimate(
                totalTimeEstimateMinutes,
                munterRate,
                statsPoint,
                terrainData[i - 1].elevation,
                terrainData[i].elevation,
                segmentDistance
            )
            totalTimeEstimateMinutes = statsPoint.totalTimeEstimateMinutes
            statsPoints.push(statsPoint)
        }
    }
    return statsPoints
}

const getLegPoints = (points, pointIndexStart, pointIndexEnd) => {
    if (!points) return []

    let startIndex = 0
    let endIndex = 0

    for (let i = 0; i < points.length; i++) {
        if (points[i].originalIndex === pointIndexStart) {
            startIndex = i
        } else if (points[i].originalIndex === pointIndexEnd) {
            endIndex = i
        }
    }
    return points.slice(startIndex, endIndex + 1)
}

const getElevationProfilePoint = (points, pointIndex) => {
    if (!points) return -1
    for (let i = 0; i < points.length; i++) {
        if (points[i].originalIndex === pointIndex) {
            return points[i]
        }
    }
    return -1
}

const interpolate = _points => {
    let newPoints = []

    for (let i = 0; i < _points.length; i++) {
        newPoints[i * 2] = _points[i]
    }

    for (let i = 0; i < newPoints.length; i++) {
        if (!newPoints[i]) {
            let startPoint = L.latLng(newPoints[i - 1].lat, newPoints[i - 1].lng)
            let endPoint = L.latLng(newPoints[i + 1].lat, newPoints[i + 1].lng)
            let bounds = L.latLngBounds(startPoint, endPoint)
            let middlePoint = bounds.getCenter()

            newPoints[i] = {
                lat: middlePoint.lat,
                lng: middlePoint.lng
            }
        }
    }
    return newPoints
}

const elevationProfile = elevationData => {
    MG.data_graphic({
        data: [
            getProfileGraphStats(elevationData)
        ],
        width: parseInt(window.getComputedStyle(document.getElementById('elevation-profile')).width.slice(0, -2), 10), // eslint-disable-line max-len
        height: parseInt(window.getComputedStyle(document.getElementById('elevation-profile')).height.slice(0, -2), 10), // eslint-disable-line max-len
        target: '#elevation-profile',
        x_accessor: 'totalDistance',
        y_accessor: 'elevation',
        missing_is_hidden: true,
        transition_on_update: false,
        xax_format: value => `${value} km`,
        yax_format: d3.format(',d'),
        min_y_from_data: true,
        y_extended_ticks: true,
        bottom: 25,
        right: 15,
        top: 20,
        left: 40,
        buffer: 0,
        show_rollover_text: false,
        colors: ['blue', 'blue']
        // mouseover: function(d, i) {
        //     var timeFormat

        //     if (d.totalTimeEstimateMinutes < 60) {
        //         timeFormat = d3.time.format("%-M min")
        //     } else {
        //         timeFormat = d3.time.format("%-H hr %-M min")
        //     }

        //     document.getElementById('graphrollover').innerHTML = 'Distance: ' +
        //     d3.format('.3f')(d.totalDistance) +
        //     ' km Elevation: ' + d3.format(',d')(d.elevation) +
        //     ' m Slope: ' + d3.format('d')(d.slope) +
        //     '&deg; Aspect: ' + d3.format('d')(d.aspect) +
        //     '&deg; Bearing: ' + d3.format('0f')(d.bearing) +
        //     '&deg; Time: ' + timeFormat(new Date(2015, 0, 1, 0, d.totalTimeEstimateMinutes))
        // }
    });
    d3.select(document.querySelector('#elevation-profile .mg-line2')).style('stroke-dasharray', ('3, 3'))  // eslint-disable-line max-len
}

const RoutePlanning = [
    '$http',
    '$log',
    '$state',
    '$scope',
    '$stateParams',
    '$rootScope',
    '$timeout',
    '$filter',
    'Global',
    'Routes',
    'snowpitExport',
    'Confirm',

    (
        $http,
        $log,
        $state,
        $scope,
        $stateParams,
        $rootScope,
        $timeout,
        $filter,
        Global,
        Routes,
        snowpitExport,
        Confirm
    ) => {
        $scope.global = Global

        $scope.formatters = snowpitExport.formatters
        $scope.loading = true

        // this ui-router scope inherits parent map scope
        $scope.route = {
            _id: null,
            name: 'Route Name',
            markers: [],
            stats: {},
            points: []
        }

        $scope.routeControl = {
            editing: true,
            autoWaypoint: false
        }

        $scope.close = () => {
            $rootScope.$broadcast('resizeMap')
            $state.go('^')
        }

        $scope.delete = () => {
            Confirm
                .open('Are you sure you want to delete this route?')
                .then(() => {
                    Routes.remove($scope.route)
                    $scope.close()
                })
        }

        $scope._hoverOnLeg = index => {
            $scope.hoverOnLeg = index
        }

        $scope._hoverOnPoint = index => {
            $scope.hoverOnPoint = index
        }

        $scope.munterRate = {
            up: 4,
            down: 10
        }

        let ready = () => {
            let lastLine
            let elevationWidget
            let saveLineTimeout

            let _line
            let preventEdit = false

            // the feature group holder for the route
            let lineGroup = L.featureGroup().addTo($scope.map)

            // keep track of line segments (point-to-point line segments, not route segments)
            let lineSegmentGroup = L.featureGroup().addTo($scope.map)

            // Leaflet.Draw edit handler for custom edit/draw functionality
            let editHandler = new L.EditToolbar.Edit($scope.map, {
                featureGroup: lineGroup,
                selectedPathOptions: {
                    color: '#2080cc',
                    opacity: 1
                }
            })

            let updateRouteStats = (routePoints, elevData, terrainData, munterRate) => {
                const statPoints = getRouteStats(routePoints, elevData, terrainData, munterRate)  // eslint-disable-line max-len

                $scope.route.stats = {}
                $scope.route.points = []

                let legIndex = 0
                let prevWaypointIndex = 0

                for (let i = 0; i < _line.editing._markers.length; i++) {
                    let point = _line.editing._markers[i]

                    // if point is a waypoint, or first or last
                    if (point.waypoint || i === 0 || i === _line.editing._markers.length - 1) {
                        let pointDetails = {
                            lat: point._latlng.lat,
                            lng: point._latlng.lng,
                            waypoint: point.waypoint,
                            pointIndex: point._index,
                            terrain: {},
                            leg: {}
                        }

                        let legPoints = getLegPoints(statPoints, prevWaypointIndex, point._index)

                        pointDetails.leg = getLineSegmentStats(legPoints)
                        pointDetails.terrain = getElevationProfilePoint(statPoints, point._index)
                        pointDetails.leg.index = legIndex

                        $scope.route.points.push(pointDetails)

                        if (point.waypoint) {
                            legIndex++
                        }

                        prevWaypointIndex = point._index
                    }
                }

                $scope.route.stats = getLineSegmentStats(statPoints)
            }

            let updateSegments = () => {
                lineSegmentGroup.clearLayers()

                let legIndex = 0
                let mouseMoveHandler = e => {
                    $timeout(() => {
                        $scope.hoverOnLegMap = e.target.segment.legIndex
                    })
                }

                let mouseOutHandler = e => {
                    $timeout(() => {
                        $scope.hoverOnLegMap = null
                    })
                }

                for (let i = 0; i < _line.editing._markers.length - 1; i++) {
                    let thisPoint = _line.editing._markers[i]
                    let nextPoint = _line.editing._markers[i + 1]

                    // if waypoint
                    if (thisPoint.waypoint) {
                        legIndex++
                    }

                    let segmentData = {
                        start: thisPoint._latlng,
                        end: nextPoint._latlng,
                        index: i,
                        legIndex: legIndex
                    }

                    let segment = L.polyline([
                        thisPoint._latlng,
                        nextPoint._latlng
                    ], {
                        color: 'transparent',
                        opacity: 0.5,
                        weight: 12 // allows for a wider clickable area
                    })

                    segment.segment = segmentData

                    // elevation widget highlight
                    segment.on('mousemove', mouseMoveHandler)
                    segment.on('mouseout', mouseOutHandler)

                    lineSegmentGroup.addLayer(segment)
                }
            }

            let processUpdate = polyline => {
                if (typeof polyline === 'undefined' || !polyline._latlngs) return

                // get line distance
                const distance = turf.lineDistance(
                    turf.linestring(polyline._latlngs.map(point => [point.lng, point.lat])),
                    'kilometers'
                )

                // sample every 5m
                const sampleCount = Math.round((distance * 1000) / 20)
                let routePoints = []

                // keep track of original points
                for (let i = 0; i < polyline._latlngs.length; i++) {
                    routePoints.push({
                        lat: polyline._latlngs[i].lat,
                        lng: polyline._latlngs[i].lng,
                        original: true
                    })
                }

                // interpolate between points
                while ((routePoints.length * 2) - 1 <= sampleCount) {
                    routePoints = interpolate(routePoints)
                }

                $scope.terrainLayer.latLngsToTerrainData(routePoints).then(terrainData => {
                    let linestring = ''
                    for (var i = 0; i < routePoints.length; i++) {
                        linestring += `${routePoints[i].lat},${routePoints[i].lng} `
                    }
                    fetch(`http://elevation.avatech.com/elevation/linestring/${linestring}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.elev === 0) {
                                return Promise.reject()
                            }
                            return Promise.resolve(data.data)
                        })
                        .then(elevAPIData => {
                            elevationProfile(elevAPIData)
                            updateRouteStats(routePoints, elevAPIData, terrainData, $scope.munterRate)  // eslint-disable-line max-len
                        })
                })
            }

            /**
             * Returns Leaflet polyline with edit handler.
             *
             * @return {L.Polyline}
             */
            let createLine = () => {
                const polyline = L.polyline([], { opacity: 0.5 })

                // event when line is edited (after point is dragged or midpoint added)
                polyline.on('edit', e => {
                    // prevent addition of new points for 1 second after moving point
                    // to prevent accidental addition of new point
                    preventEdit = true

                    setTimeout(() => { preventEdit = false }, 1000)

                    $scope.$evalAsync(() => {
                        processUpdate(polyline)
                    })
                })

                return polyline
            }

            let editingOn = () => {
                // show all points
                $('.leaflet-editing-icon')
                    .not('.waypoint-icon')
                    .not('.end-icon')
                    .removeClass('_hide')

                // enable point dragging
                angular.forEach(_line.editing._markers, marker => {
                    marker.dragging.enable()
                })
            }

            /**
             * Assign marker.waypoint.index to the index of the waypoint of line `polyline`.
             *
             * @param  {L.Polyline} polyline
             */
            let updateWaypointIndexes = polyline => {
                // keep track of waypoint index
                let waypointCount = 1

                for (let marker of polyline.editing._markers) {
                    if (marker.waypoint) {
                        marker.waypoint.index = waypointCount
                        waypointCount++
                    }
                }
            }

            /**
             * Convert waypoint to marker.
             *
             * @param  {L.EditingToolbar.Marker} marker
             */
            let makeRegularPoint = marker => {
                if (marker.waypoint) {
                    delete marker.waypoint
                }

                // remove waypoint css class (if exists)
                $(marker._icon).removeClass('waypoint-icon')

                // keep track of waypoint index
                updateWaypointIndexes(_line)
            }

            let deleteWaypoint = marker => {
                makeRegularPoint(marker)
                updateSegments()

                $scope.$evalAsync(() => {
                    processUpdate(_line)
                })
            }

            /**
             * Convert marker to waypoint with optional waypoint data to apply to it.
             *
             * @param  {L.EditingToolbar.Marker} marker
             * @param  {Obj} waypointData
             */
            let makeWaypoint = (marker, waypointData) => {
                if (!waypointData) {
                    waypointData = { name: '' }  // eslint-disable-line no-param-reassign
                }

                marker.waypoint = waypointData

                // add marker css class
                $(marker._icon).addClass('waypoint-icon')

                // keep track of waypoint index
                updateWaypointIndexes(_line)
            }

            /**
             * Changes a Leaflet marker into a "point", which has event listeners
             * for popups and elevation graph updates.
             *
             * @param  {[type]} marker [description]
             * @return {[type]}        [description]
             */
            let makePoint = marker => {
                // mark as a route planning point
                marker.isPoint = true

                // if first point, add start class
                if (marker._index === 0) {
                    $(marker._icon).addClass('start-icon')

                // if last point, add end class
                } else if (marker._index === _line.editing._markers.length - 1) {
                    $(marker._icon).addClass('end-icon')
                }

                // remove existing marker events
                marker.off('click')
                marker.off('mouseover')
                marker.off('mouseout')

                // elevation widget highlight
                marker.on('mouseover', e => {
                    // elevationProfile.highlight(e.latlng)

                    $timeout(() => {
                        $scope.hoverOnPointMap = e.target._index
                    })
                })

                marker.on('mouseout', e => {
                    if (elevationWidget) {
                        elevationWidget.highlight()
                    }

                    $timeout(() => {
                        $scope.hoverOnPointMap = null
                    })
                })

                // popup
                marker.unbindPopup()
                marker.bindPopup('test', { closeButton: true })

                marker.on('click', () => {
                    let leafletPopup = marker.getPopup()
                    let popup = document.createElement('div')

                    popup.style.padding = '5px'

                    if (marker.waypoint) {
                        popup.appendChild(
                            $(
                                '<div style="font-weight:bold;position:relative;' +
                                'bottom:2px;margin-right:20px;">' +
                                $scope.route.waypointPrefix() +
                                marker.waypoint.index +
                                '</div>'
                            )[0]
                        )

                        let nameInput = document.createElement('input')

                        popup.appendChild(nameInput)

                        nameInput.placeholder = 'Waypoint Name'
                        nameInput.value = marker.waypoint.name
                        nameInput.onkeyup = () => {
                            marker.waypoint.name = nameInput.value

                            $scope.$evalAsync(() => {
                                processUpdate(_line)
                            })
                        }

                        if (marker._index > 0 && $scope.routeControl.editing) {
                            let deleteWaypointbutton = document.createElement('button')

                            popup.appendChild(deleteWaypointbutton)

                            deleteWaypointbutton.innerHTML = ('<i class="ion-trash-a"></i>' +
                                '&nbsp;&nbsp;Remove Waypoint')

                            deleteWaypointbutton.addEventListener('click', () => {
                                marker.closePopup()
                                deleteWaypoint(marker)

                                marker.fire('click')
                            })
                        }
                    } else {
                        let makeWaypointbutton = document.createElement('button')
                        let deleteButton = document.createElement('button')

                        popup.appendChild(
                            $(
                                '<div style="font-weight:bold;position:relative;' +
                                'bottom:2px;margin-right:20px;">' +
                                    'Route Point<br/>' +
                                '</div>'
                            )[0]
                        )

                        popup.appendChild(makeWaypointbutton)

                        makeWaypointbutton.innerHTML = ('<i class="fa fa-map-marker"></i>' +
                            '&nbsp;&nbsp;Make Waypoint')

                        makeWaypointbutton.addEventListener('click', () => {
                            makeWaypoint(marker)

                            marker.closePopup()
                            marker.fire('click')

                            $scope.$evalAsync(() => {
                                processUpdate(_line)
                            })
                        })

                        popup.appendChild(deleteButton)

                        deleteButton.innerHTML = ('<i class="ion-trash-a"></i>' +
                            '&nbsp;&nbsp;Delete')

                        deleteButton.addEventListener('click', () => {
                            if (_line.editing._markers.length === 1) {
                                $log.debug("can't delete only point")
                                return
                            }

                            _line.editing._onMarkerClick({ target: marker })
                        })
                    }

                    leafletPopup.setContent(popup)
                })
            }

            let addPointToPolyline = (polyline, latlng) => {
                let index = polyline.editing._poly._latlngs.length

                // prevent adding a point too far from last point
                if (polyline.editing._markers.length) {
                    // get last point
                    let lastPoint = polyline.editing._markers[
                        polyline.editing._markers.length - 1
                    ]._latlng

                    // get distance from last point
                    let distance = turf.distance(
                        turf.point([
                            lastPoint.lng,
                            lastPoint.lat
                        ]),
                        turf.point([
                            latlng.lng,
                            latlng.lat
                        ]),
                        'kilometers'
                    )

                    // if distance is greater than 8km/5mi, don't allow
                    if (distance > 8) {
                        alert('This point is more than 8km/5mi far from the last point.\n\n' +
                            'Please place your next point closer.')

                        return undefined
                    }
                }

                polyline.editing._poly.addLatLng(latlng)
                polyline.editing._markers.splice(index, 0, polyline.editing._createMarker(latlng))
                polyline.editing._poly.redraw()

                // before calling updateMarkers, keep track of where waypoints are
                let waypoints = {}

                for (let [i, marker] of polyline.editing._markers.entries()) {
                    if (marker.waypoint) {
                        waypoints[i] = marker.waypoint
                    }
                }

                // call updateMarkers to reload points
                polyline.editing.updateMarkers()

                angular.forEach(polyline.editing._markers, (marker, index) => {
                    if (!marker.isPoint) {
                        makePoint(marker)
                    }

                    // if first point and no waypoint, create
                    if (index === 0 && !waypoints[marker._index]) {
                        makeWaypoint(marker)

                    // if existing waypoint
                    } else if (waypoints[marker._index]) {
                        makeWaypoint(marker, waypoints[marker._index])

                    // auto-waypoint (only on "new" points at end of existing line,
                    // not new midpoints)
                    } else if (
                        $scope.routeControl.autoWaypoint &&
                        index === polyline.editing._poly._latlngs.length - 1
                    ) {
                        makeWaypoint(marker)

                    // regular point
                    } else {
                        makeRegularPoint(marker)
                    }
                })

                // return marker
                return polyline.editing._markers[index]
            }

            let editingOff = () => {
                // close popups
                setTimeout(() => {
                    let popups = $('.leaflet-popup-close-button')
                    angular.forEach(popups, popup => popup.click())
                })

                // hide all points that aren't waypoints
                $('.leaflet-editing-icon')
                    .not('.waypoint-icon')
                    .not('.end-icon')
                    .addClass('_hide')

                angular.forEach(_line.editing._markers, marker => {
                    // disable point dragging
                    marker.dragging.disable()

                    // convert end point into a waypoint (if it isn't already)
                    if (
                        marker._index === _line.editing._markers.length - 1 &&
                        !marker.waypoint
                    ) {
                        makePoint(marker)
                        makeWaypoint(marker)
                        updateSegments()

                        $scope.$evalAsync(() => {
                            processUpdate(_line)
                        })
                    }
                })
            }

            // load if routeId specified
            if ($stateParams.routeId && $stateParams.routeId !== 'new') {
                $http
                    .get(window.apiBaseUrl + 'routes/' + $stateParams.routeId)
                    .then(res => {
                        let route = res.data

                        $scope.route._id = route._id
                        $scope.route.name = route.name

                        // create editable path
                        _line = createLine()

                        lineGroup.addLayer(_line)
                        editHandler.enable()

                        // add markers
                        for (let i = 0; i < route.points.length; i++) {
                            let point = route.points[i]
                            let marker = addPointToPolyline(
                                _line, {
                                    lat: point.coords[1],
                                    lng: point.coords[0]
                                })

                            // if waypoint
                            if (point.waypoint) {
                                makePoint(marker)
                                makeWaypoint(marker, point.waypoint)
                            }
                        }

                        $scope.map.fitBounds(_line.getBounds(), { maxZoom: 14, animate: false })
                        $scope.loading = false

                        processUpdate(_line)
                    })

            // if new
            } else if ($stateParams.routeId === 'new') {
                $scope.loading = false
            }

            let mapClick = e => {
                if (!$scope.routeControl.editing) return
                if (preventEdit) return

                // add route polyline if it doesn't exist (only gets hit on first point)
                if (!_line) {
                    _line = createLine()

                    lineGroup.addLayer(_line)
                    editHandler.enable()
                }

                // add point
                addPointToPolyline(_line, e.latlng)

                // update
                $scope.$evalAsync(() => {
                    processUpdate(_line)
                })
            }

            $scope.map.on('click', mapClick)

            // remove map path and elevation widget when current state is destroyed
            $scope.$on('$destroy', () => {
                $scope.map.off('click', mapClick)

                if (elevationWidget) {
                    elevationWidget.clear()
                    elevationWidget = null
                }

                if (lineGroup) {
                    lineGroup.removeFrom($scope.map)
                }

                if (lineSegmentGroup) {
                    lineSegmentGroup.removeFrom($scope.map)
                }

                _line = null
                editHandler = null
            })

            // save when route is edited
            let routeSaveTimer

            $scope.$watch('route', () => {
                if (
                    !_line ||
                    !_line.editing ||
                    (
                        _line.editing._markers &&
                        _line.editing._markers.length < 2
                    )
                ) {
                    return
                }

                if (routeSaveTimer) {
                    $timeout.cancel(routeSaveTimer)
                }

                routeSaveTimer = $timeout(() => {
                    $log.debug('saving!!')

                    let _route = {
                        name: $scope.route.name,
                        points: [],
                        legs: [],
                        terrain: [],
                        stats: $scope.route.stats,
                        // GeoJSON
                        path: {
                            type: 'LineString',
                            coordinates: []
                        }
                    }

                    angular.forEach(_line.editing._markers, marker => {
                        _route.path.coordinates.push([
                            marker._latlng.lng,
                            marker._latlng.lat
                        ])

                        _route.points.push({
                            coords: [
                                marker._latlng.lng,
                                marker._latlng.lat
                            ],
                            waypoint: marker.waypoint
                        })
                    })

                    for (let i = 1; i < $scope.route.points.length; i++) {
                        _route.legs.push($scope.route.points[i].leg)
                    }

                    if (!$scope.route._id) {
                        $http
                            .post(window.apiBaseUrl + 'routes', _route)
                            .then(res => {
                                if (res.data._id) {
                                    $scope.route._id = res.data._id
                                    $scope.imageURL = res.data.imageURL

                                    // add to routes datastore
                                    _route._id = $scope.route._id
                                    Routes.add(_route)

                                    // replace URL with recieved _id
                                    $state.params.routeId = $scope.route._id
                                    $state.transitionTo(
                                        $state.current,
                                        $state.params,
                                        { inherit: true, notify: true }
                                    )
                                }
                            })
                    } else {
                        $http
                            .put(window.apiBaseUrl + 'routes/' + $scope.route._id, _route)
                            .then(data => {
                                // add to routes datastore
                                _route._id = $scope.route._id
                                _route.updated = new Date()
                                Routes.add(_route)
                            })
                    }
                }, 1000)
            }, true)

            // hide icons when not in edit mode
            $scope.$watch('routeControl.editing', () => {
                if (!_line) return

                // prevent editing above below zoom level 13
                if ($scope.routeControl.editing && $scope.map.getZoom() < 13) {
                    $scope.routeControl.editing = false
                    alert('Please zoom in to edit your route.')
                }

                if ($scope.routeControl.editing) {
                    editingOn()
                } else {
                    editingOff()
                }
            }, true)

            $scope.route.waypointPrefix = () => {
                if (
                    !$scope.route.name ||
                    $scope.route.name.length === 0
                ) {
                    return 'W'
                }

                return $scope.route.name[0]
            }

            $scope.routeControl.downloadGPX = () => {
                let gpx = ('<?xml version="1.0"?>\n' +
                    '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" creator="Avatech, Inc.">\n' +
                    '  <metadata>\n' +
                    '    <name><![CDATA[Avanet GPX export]]></name>\n' +
                    '    <desc><![CDATA[]]></desc>\n' +
                    '    <link href="https://avanet.avatech.com/">\n' +
                    '      <text>Created with Avanet - Avatech, Inc.</text>\n' +
                    '    </link>\n' +
                    '  </metadata>\n')

                // waypoints
                let wayPointIndex = 0

                for (let i = 0; i < _line.editing._markers.length; i++) {
                    let thisPoint = _line.editing._markers[i]

                    if (
                        thisPoint.waypoint ||
                        i === 0 ||
                        i === _line.editing._markers.length - 1
                    ) {
                        wayPointIndex++

                        gpx += ('  <wpt lat="' +
                            thisPoint._latlng.lat +
                            '" lon="' +
                            thisPoint._latlng.lng +
                            '">\n')

                        gpx += ('    <name><![CDATA[' +
                            $scope.route.waypointPrefix() +
                            wayPointIndex +
                            ']]></name>\n')

                        if (thisPoint.waypoint && thisPoint.waypoint.name) {
                            gpx += '    <desc><![CDATA[' + thisPoint.waypoint.name + ']]></desc>\n'
                        }

                        gpx += '  </wpt>\n'
                    }
                }

                // route start
                gpx += ('<rte>' +
                        '<name><![CDATA[]]></name>\n' +
                        '<desc><![CDATA[]]></desc>\n' +
                        '<src>AllTrails</src>\n')

                // route points
                wayPointIndex = 0

                for (let i = 0; i < _line.editing._markers.length; i++) {
                    let thisPoint = _line.editing._markers[i]
                    gpx += ('    <rtept lat="' +
                        thisPoint._latlng.lat +
                        '" lon="' +
                        thisPoint._latlng.lng +
                        '">\n')

                    if (
                        thisPoint.waypoint ||
                        i === 0 ||
                        i === _line.editing._markers.length - 1
                    ) {
                        wayPointIndex++

                        gpx += ('      <name><![CDATA[' +
                            $scope.route.waypointPrefix() +
                            wayPointIndex +
                            ']]></name>\n')

                        if (thisPoint.waypoint && thisPoint.waypoint.name) {
                            gpx += ('      <desc><![CDATA[' +
                                thisPoint.waypoint.name + ']]></desc>\n')
                        }
                    }

                    gpx += '    </rtept>\n'
                }

                // route end
                gpx += '  </rte>\n'

                // end GPX
                gpx += '</gpx>'

                let gpxData = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpx)
                let link = document.createElement('a')

                angular.element(link)
                    .attr('href', gpxData)
                    .attr('download', 'avanet-route.gpx')

                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }

            $scope.getDeclination = () => {
                let center = $scope.map.getCenter()
                let currentYear = new Date().getFullYear() +
                    ((new Date().getMonth() + 1) / 12.0)

                let declination = new WorldMagneticModel()
                    .declination(
                        0,
                        center.lat,
                        center.lng,
                        currentYear
                    )

                return declination
            }

            $scope.getGridNorth = () => {
                let center = $scope.map.getCenter()

                // get utm at center
                let utmCenter = UTM.latLonToUTMXY(
                    UTM.degToRad(center.lat),
                    UTM.degToRad(center.lng)
                )

                let utmTop = UTM.latLonToUTMXY(
                    UTM.degToRad($scope.map.getBounds()._northEast.lat),
                    UTM.degToRad(center.lng)
                )

                // get lat lng of easting at top of map
                let top = UTM.utmXYToLatLon(
                    utmCenter.x,
                    utmTop.y,
                    utmCenter.zone,
                    center.lat < 0
                )

                // get bearing between center point and top point
                let bearing = turf.bearing(
                    turf.point([
                        center.lng,
                        center.lat
                    ]),
                    turf.point([
                        UTM.radToDeg(top.lng),
                        UTM.radToDeg(top.lat)
                    ])
                )

                return bearing
            }

            $scope.getPixelsPerScreenInch = () => {
                let dpi = document.createElement('div')

                dpi.setAttribute('style', 'height: 1in; width: 1in; left: 100%;' +
                    'position: fixed; top: 100%;pointer-events:none;opacity:0;')

                document.body.appendChild(dpi)

                let dpiX = dpi.offsetWidth

                document.body.removeChild(dpi)
                dpi = null

                return dpiX
            }

            $scope.getMetersPerPixel = () => (
                156543.03392 * Math.cos($scope.map.getCenter().lat * Math.PI / 180) /
                Math.pow(2, $scope.map.getZoom())
            )

            $scope.routeControl.downloadPDF = () => {
                let pdfRows = []

                // PDF columns
                let columns = [
                    { text: '', style: 'tableHeader', width: 24 },
                    { text: 'Name', style: 'tableHeader', width: '*' },
                    { text: 'UTM', style: 'tableHeader', width: 49 },
                    { text: 'Distance', style: 'tableHeader', width: 44 },
                    { text: 'Elevation', style: 'tableHeader', width: 44 },
                    { text: 'Net Elevation', style: 'tableHeader', width: 40 },
                    { text: 'Bearing', style: 'tableHeader', width: 43 },
                    { text: 'Time', style: 'tableHeader', width: 55 },
                    { text: 'Running Time', style: 'tableHeader', width: 55 }
                ]

                pdfRows.push(columns)

                // set colummn widths
                let columnWidths = columns.map(column => column.width)

                // add rows
                angular.forEach($scope.route.points, (point, index) => {
                    let nextPoint = null

                    if (index !== $scope.route.points.length - 1) {
                        nextPoint = $scope.route.points[index + 1]
                    }

                    pdfRows.push([
                        $scope.route.waypointPrefix() + (index + 1),
                        point.waypoint ? point.waypoint.name : '',
                        {
                            text: $scope.formatters.formatLatLngAsUTM({
                                lat: point.lat,
                                lng: point.lng
                            }),
                            alignment: 'right'
                        }, {
                            text: (
                                nextPoint && nextPoint.leg
                            ) ? $scope.formatters.formatKmOrMiles(nextPoint.leg.distance) : '',
                            alignment: 'right'
                        }, {
                            text: (
                                point.terrain
                            ) ? $scope.formatters.formatElevation(point.terrain.elevation) : '',
                            alignment: 'right'
                        }, {
                            text: (
                                nextPoint && nextPoint.leg
                            ) ? (
                                (nextPoint.leg.elevationChange > 0 ? '+' : '') +
                                ' ' +
                                $scope.formatters.formatElevation(nextPoint.leg.elevationChange)
                            ) : '',
                            alignment: 'right'
                        },
                        (
                            nextPoint && nextPoint.leg
                        ) ? $scope.formatters.formatDirection(nextPoint.leg.bearing) : '',
                        (
                            nextPoint && nextPoint.leg
                        ) ? $scope.formatters.formatDuration(
                                nextPoint.leg.timeEstimateMinutes
                            ) : '',
                        (
                            nextPoint && nextPoint.terrain
                        ) ? $scope.formatters.formatDuration(
                                nextPoint.terrain.totalTimeEstimateMinutes
                            ) : ''
                    ])
                })

                // pdf layout
                let docDefinition = {
                    pageSize: 'letter',
                    content: [
                        { text: $scope.route.name, style: 'subheader' },
                        {
                            style: 'tableExample',
                            table: {
                                headerRows: 1,
                                widths: columnWidths,
                                body: pdfRows
                            },
                            layout: {
                                hLineWidth: () => 0.5,
                                vLineWidth: () => 0.5
                            }
                        }
                    ],
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true,
                            margin: [0, 0, 0, 10]
                        },
                        subheader: {
                            fontSize: 16,
                            bold: true,
                            margin: [0, 10, 0, 5]
                        },
                        tableExample: {
                            fontSize: 9,
                            margin: [0, 5, 0, 15]
                        },
                        tableHeader: {
                            bold: true,
                            fontSize: 9,
                            color: 'black'
                        }
                    },
                    defaultStyle: {
                        // alignment: 'justify'
                    }
                }

                let arrowCanvas = DrawDeclinationCanvas(  // eslint-disable-line new-cap
                    $scope.getDeclination(),
                    $scope.getGridNorth()
                )

                let formatMeters = meters => {
                    if (meters >= 1000) {
                        let km = parseInt(meters, 10) / 1000

                        if (km % 1 !== 0) {
                            return $filter('number')(km, 1) + ' km'
                        }

                        return $filter('number')(km, 0) + ' km'
                    }

                    return $filter('number')(meters, 0) + ' m'
                }

                let formatFeet = feet => {
                    if (feet >= 5280) {
                        let miles = parseInt(feet, 10) / 5280

                        if (miles % 1 !== 0) {
                            return $filter('number')(miles, 1) + ' mi'
                        }

                        return $filter('number')(miles, 0) + ' mi'
                    }

                    return $filter('number')(feet, 0) + ' ft'
                }

                leafletImage($scope.map, (err, canvas) => {
                    pdfMake.createPdf(docDefinition).download()
                })
            }

            $scope.$watch('munterRate', () => {
                if (
                    !$scope.munterRate ||
                    isNaN($scope.munterRate.up) ||
                    isNaN($scope.munterRate.down === null)
                ) {
                    return
                }

                processUpdate(_line)
            }, true)

            $scope.$watch('hoverOnLeg', () => {
                angular.forEach(lineSegmentGroup._layers, segment => {
                    segment.setStyle({ color: 'transparent' })

                    if (segment.segment.legIndex === $scope.hoverOnLeg) {
                        // highlight route leg
                        segment.bringToBack()
                        segment.setStyle({ color: 'rgba(255,255,255,1)' })
                        // todo: highlight in elevation profile
                    }
                })
            }, true)

            $scope.$watch('hoverOnPoint', () => {
                if (!_line) return

                angular.forEach(_line.editing._markers, marker => {
                    $(marker._icon).removeClass('highlight')

                    if (marker._index === $scope.hoverOnPoint) {
                        // highlight marker
                        $(marker._icon).addClass('highlight')
                    }
                })
            }, true)

            let disabledForZoom = false

            $scope.map.on('zoomend', e => {
                // if zoom level is less than 13, disable editing
                if (
                    $scope.routeControl.editing &&
                    $scope.map.getZoom() < 13
                ) {
                    $scope.routeControl.editing = false
                    disabledForZoom = true

                // restart editing once zoomed back in
                } else if (
                    !$scope.routeControl.editing &&
                    $scope.map.getZoom() >= 13 &&
                    disabledForZoom
                ) {
                    $scope.routeControl.editing = true
                    disabledForZoom = false
                }
            })
        }

        // wait for map to be ready
        let mapWatcher = $scope.$watch('map', () => {
            if ($scope.map) {
                // unregister watch
                mapWatcher()
                // go
                ready()
            }
        })
    }
]

export default RoutePlanning
