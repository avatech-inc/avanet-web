
const _ = {}

import lodashmap from 'lodash.map'
import minBy from 'lodash.minby'
import maxBy from 'lodash.maxby'
import sumBy from 'lodash.sumby'
import sum from 'lodash.sum'

_.map = lodashmap
_.minBy = minBy
_.maxBy = maxBy
_.sumBy = sumBy
_.sum = sum

import './route-planning.html'

// UTILS

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

const calculateLineSegmentStats = points => {
    if (!points || points.length < 2) return {}

    let startPoint = points[0]
    let endPoint = points[points.length - 1]

    let bearing = turf.bearing(
        turf.point([
            startPoint.lng,
            startPoint.lat
        ]),
        turf.point([
            endPoint.lng,
            endPoint.lat
        ])
    )

    if (bearing < 0) bearing += 360

    // calculate stats
    return {
        timeEstimateMinutes: (
            endPoint.totalTimeEstimateMinutes -
            startPoint.totalTimeEstimateMinutes
        ),
        distance: endPoint.totalDistance - startPoint.totalDistance,

        elevationChange: endPoint.elevation - startPoint.elevation,
        elevationMin: _.minBy(points, 'elevation').elevation,
        elevationMax: _.maxBy(points, 'elevation').elevation,

        slopeMin: _.minBy(points, 'slope').slope,
        slopeMax: _.maxBy(points, 'slope').slope,
        slopeAverage: _.sumBy(points, 'slope') / points.length,

        verticalUp: _.sumBy(points, 'verticalUp'),
        verticalDown: _.sumBy(points, 'verticalDown'),

        aspectMin: _.minBy(points, 'aspect').aspect,
        aspectMax: _.maxBy(points, 'aspect').aspect,
        aspectAverage: getAverageAspect(_.map(points, 'aspect')),

        bearing: bearing
    }
}

const getLegPoints = (points, pointIndexStart, pointIndexEnd) => {
    if (!points) return []

    let startIndex = 0
    let endIndex = 0

    for (let i = 0; i < points.length; i++) {
        let point = points[i]

        if (point.originalIndex === pointIndexStart) {
            startIndex = i
        } else if (point.originalIndex === pointIndexEnd) {
            endIndex = i
        }
    }

    return points.slice(startIndex, endIndex + 1)
}

const getElevationProfilePoint = (points, pointIndex) => {
    if (!points) return -1

    for (let i = 0; i < points.length; i++) {
        let point = points[i]

        if (point.originalIndex === pointIndex) return point
    }
}

const interpolate = _points => {
    let newPoints = []

    for (let i = 0; i < _points.length; i++) {
        newPoints[i * 2] = _points[i]
    }

    for (let i = 0; i < newPoints.length; i++) {
        if (!newPoints[i]) {
            let startPoint = new google.maps.LatLng(
                newPoints[i - 1].lat,
                newPoints[i - 1].lng
            )

            let endPoint = new google.maps.LatLng(
                newPoints[i + 1].lat,
                newPoints[i + 1].lng
            )

            let middlePoint = google.maps.geometry.spherical.interpolate(
                startPoint,
                endPoint,
                0.5
            )

            newPoints[i] = {
                lat: middlePoint.lat(),
                lng: middlePoint.lng()
            }
        }
    }

    return newPoints
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

        $scope._hoverOnLeg = index => $scope.hoverOnLeg = index
        $scope._hoverOnPoint = index => $scope.hoverOnPoint = index

        $scope.munterRate = {
            up: 4,
            down: 10
        }

        // $scope.$watchCollection('_line.editing._markers',function(){
        //     $log.debug("markers editing!!!!!!!!")
        //     if (_line && _line.editing && _line.editing._markers)
        //         $scope.route.markers = _line.editing._markers;
        // });

        let ready = () => {
            let elevationProfilePoints
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

            let saveLinePoints = () => {
                $timeout.cancel(saveLineTimeout)
                saveLineTimeout = $timeout(() => {
                    $scope.route.stats = {}
                    $scope.route.points = []

                    let legIndex = 0
                    let lastWaypointIndex = 0

                    for (let i = 0; i < _line.editing._markers.length; i++) {
                        let thisPoint = _line.editing._markers[i]

                        if (
                            thisPoint.waypoint ||
                            i === 0 ||
                            i === _line.editing._markers.length - 1
                        ) {
                            let pointDetails = {
                                lat: thisPoint._latlng.lat,
                                lng: thisPoint._latlng.lng,
                                waypoint: thisPoint.waypoint,
                                pointIndex: thisPoint._index,
                                terrain: {},
                                leg: {}
                            }

                            // get leg
                            if (elevationProfilePoints) {
                                let legPoints = getLegPoints(
                                    elevationProfilePoints,
                                    lastWaypointIndex,
                                    thisPoint._index
                                )

                                pointDetails.leg = calculateLineSegmentStats(legPoints)
                                pointDetails.terrain = getElevationProfilePoint(
                                    elevationProfilePoints,
                                    thisPoint._index
                                )
                            }

                            // set leg on every point so that we can highlight it
                            pointDetails.leg.index = legIndex

                            $scope.route.points.push(pointDetails)

                            if (thisPoint.waypoint) {
                                legIndex++
                            }

                            lastWaypointIndex = thisPoint._index
                        }
                    }

                    // route terrain stats
                    if (elevationProfilePoints) {
                        // $log.debug("here!!!!!!!!!!!!!!!!!");
                        $scope.route.stats = calculateLineSegmentStats(elevationProfilePoints)
                        // $log.debug($scope.route.stats);
                    }
                }, 10)
            }

            let updateSegments = () => {
                lineSegmentGroup.clearLayers()

                let legIndex = 0
                let mouseMoveHandler = e => {
                    if (e.latlng && elevationWidget) {
                        elevationWidget.highlight(e.latlng)
                    }

                    $timeout(() => $scope.hoverOnLegMap = e.target.segment.legIndex)
                }

                let mouseOutHandler = e => {
                    if (elevationWidget) {
                        elevationWidget.highlight()
                    }

                    $timeout(() => $scope.hoverOnLegMap = null)
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

            let createElevationProfileWidget = () => {
                if (elevationWidget) elevationWidget.clear()

                elevationWidget = new ElevationWidget()

                elevationWidget.create($scope.map, {
                    imperial: Global.user.settings.elevation === 1, // true
                    // width: 670,
                    height: 163,
                    margins: {
                        top: 24,
                        right: 18,
                        bottom: 20,
                        left: 40
                    },
                    useHeightIndicator: true, // if false a marker is drawn at map position
                    hoverNumber: {
                        decimalsX: 3, // decimals on distance (always in km)
                        decimalsY: 0, // deciamls on height (always in m)
                        formatter: undefined // custom formatter function may be injected
                    },

                    // xTicks: undefined, //number of ticks in x axis,
                    // calculated by default according to width
                    // yTicks: undefined, //number of ticks on y axis,
                    // calculated by default according to height
                })
            }

            let plotElevationProfile = () => {
                let points = elevationProfilePoints

                if (!points) return

                let geoJSON = {
                    name: 'NewFeatureType',
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: [] },
                        properties: null
                    }]
                }

                geoJSON.features[0].geometry.coordinates = []

                // get max elevation
                let maxElevation = 0

                for (let i = 0; i < points.length; i++) {
                    maxElevation = Math.max(points[i].elevation, maxElevation)
                }

                for (let i = 0; i < points.length; i++) {
                    let thisPoint = points[i]

                    if (!thisPoint || thisPoint.lat === null || thisPoint.lat === null) continue

                    if (!thisPoint.elevation) thisPoint.elevation = maxElevation

                    geoJSON.features[0].geometry.coordinates.push([
                        thisPoint.lng,
                        thisPoint.lat,
                        thisPoint.elevation,
                        thisPoint.slope,
                        $scope.formatters.formatDirection(thisPoint.aspect),
                        thisPoint.totalTimeEstimateMinutes,
                        thisPoint.totalDistance,
                        $scope.formatters.formatDirection(thisPoint.bearing)
                    ])
                }

                if (lastLine) {
                    $scope.map.removeLayer(lastLine)
                }

                createElevationProfileWidget()

                lastLine = L.geoJson(geoJSON, {
                    // working on a better solution
                    onEachFeature: elevationWidget.addData.bind(elevationWidget)
                })
            }

            let calculateRouteStats = () => {
                let points = elevationProfilePoints
                if (!points) return

                let totalDistance = 0
                let totalTimeEstimateMinutes = 0
                let originalIndex = 0

                for (let i = 0; i < points.length; i++) {
                    // $log.debug(i);
                    let point = points[i]

                    if (!point) continue

                    // assign index for tracking
                    point.index = i

                    // assign original index for tracking markers
                    if (point.original) {
                        point.originalIndex = originalIndex
                        originalIndex++
                    }

                    // defaults for first point
                    point.totalDistance = 0
                    point.totalTimeEstimateMinutes = 0

                    if (i === 0) continue

                    // keep track of distance

                    let segmentDistance = turf.lineDistance(
                        turf.linestring([
                            [
                                points[i - 1].lng,
                                points[i - 1].lat
                            ],
                            [
                                point.lng,
                                point.lat
                            ]
                        ]),
                        'kilometers'
                    )

                    point.distance = segmentDistance
                    totalDistance += segmentDistance
                    point.totalDistance = totalDistance

                    // keep track of bearing
                    point.bearing = turf.bearing(
                        turf.point([
                            points[i - 1].lng,
                            points[i - 1].lat
                        ]),
                        turf.point([
                            point.lng,
                            point.lat
                        ])
                    )

                    if (point.bearing < 0) point.bearing += 360

                    // keep track of vertical up/down and munter time estimates

                    // munter time estimate details...
                    // http://www.foxmountainguides.com/about/the-guides-blog/tags/tag/munter-touring-plan
                    // https://books.google.com/books?id=Yg3WTwZxLhIC&lpg=PA339&ots=E-lqpwepiA&dq=munter%20time%20calculation&pg=PA112#v=onepage&q=munter%20time%20calculation&f=false
                    // distance: 1km = 1 unit (since distance is already in km, just use as-is)
                    // vertical: 100m = 1 unit (vertical is in m, so just divide by 100)

                    let previousElevation = points[i - 1].elevation
                    point.elevationDifference = point.elevation - previousElevation

                    if (point.elevationDifference > 0) {
                        point.direction = 'up'
                        point.verticalUp = point.elevationDifference

                        point.munterUnits = segmentDistance + (point.verticalUp / 100)
                        point.timeEstimateMinutes = (point.munterUnits / $scope.munterRate.up) * 60
                    } else if (point.elevationDifference < 0) {
                        point.direction = 'down'
                        point.verticalDown = Math.abs(point.elevationDifference)

                        point.munterUnits = segmentDistance + (point.verticalDown / 100)
                        point.timeEstimateMinutes = (
                            point.munterUnits / $scope.munterRate.down
                        ) * 60
                    } else {
                        point.direction = 'flat'
                        point.munterUnits = segmentDistance

                        let munterRateFlat = ($scope.munterRate.up + $scope.munterRate.down) / 2
                        point.timeEstimateMinutes = (point.munterUnits / munterRateFlat) * 60
                    }

                    totalTimeEstimateMinutes += point.timeEstimateMinutes
                    point.totalTimeEstimateMinutes = totalTimeEstimateMinutes
                }

                saveLinePoints()
            }

            let processUpdate = callback => {
                updateSegments()

                $log.debug('processUpdate!')

                let points = _line._latlngs

                // get line distance
                let distance = turf.lineDistance(
                    turf.linestring(
                        points.map(point => [point.lng, point.lat])
                    ),
                    'kilometers'
                )

                // sample every 5m
                let sampleCount = Math.round((distance * 1000) / 5)

                // keep track of original points
                for (let i = 0; i < points.length; i++) {
                    points[i].original = true
                }

                // interpolate between points
                while ((points.length * 2) - 1 <= sampleCount) {
                    points = interpolate(points)
                }

                $scope.terrainLayer.getTerrainDataBulk(points, receivedPoints => {
                    if (callback) callback()

                    if (!receivedPoints || receivedPoints.length === 0) return

                    $log.debug('TERRAIN DATA LAODED!')

                    // store elevation profile for later
                    elevationProfilePoints = angular.copy(receivedPoints)

                    // $log.debug(receivedPoints);

                    // calculate route stats/time, etc.
                    calculateRouteStats()

                    // plot elevation profile
                    plotElevationProfile()

                    // add waypoints to elevation profile
                    angular.forEach(_line.editing._markers, (marker, i) => {
                        // if waypoint isn't first or last
                        if (
                            marker.waypoint &&
                            i !== 0 &&
                            i !== _line.editing._markers.length - 1
                        ) {
                            elevationWidget.addWaypoint(marker._latlng)
                        }
                    })

                    $scope.loading = false

                    saveLinePoints()
                })

                // $log.debug("promises!");
                // $log.debug(promises);

                updateSegments()
            }

            let createLine = () => {
                _line = L.polyline([], { opacity: 0.5 })
                lineGroup.addLayer(_line)
                editHandler.enable()

                // event when line is edited (after point is dragged or midpoint added)
                _line.on('edit', e => {
                    // prevent addition of new points for 1 second after moving point
                    // to prevent accidental addition of new point
                    preventEdit = true

                    setTimeout(() => { preventEdit = false }, 1000)

                    // handle new midpoints
                    angular.forEach(_line.editing._markers, marker => {
                        if (!marker.isPoint) {
                            makeRegularPoint(marker)
                        }
                    })

                    processUpdate()
                })
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
                        makeWaypoint(marker)
                        updateSegments()
                        saveLinePoints()
                    }
                })
            }

            // $scope.map = $rootScope.map;
            // load if routeId specified
            if ($stateParams.routeId && $stateParams.routeId !== 'new') {
                $http
                    .get(window.apiBaseUrl + 'routes/' + $stateParams.routeId)
                    .then(res => {
                        let route = res.data

                        $scope.route._id = route._id
                        $scope.route.name = route.name

                        // set map to fit route bounds
                        let bounds = turf.extent(route.path)

                        $scope.map.fitBounds([
                            [bounds[1], bounds[0]],
                            [bounds[3], bounds[2]]
                        ], { maxZoom: 14, animate: false })

                        // wait a bit for map to move. using a timeout here instead of:
                        // $scope.map.on('moveend', function() { ... })
                        // since it's just a percaution and 'moveend' can be unpredictabile
                        $timeout(() => {
                            // create editable path
                            createLine()

                            // add markers
                            for (let i = 0; i < route.points.length; i++) {
                                let point = route.points[i]
                                let marker = addPoint({
                                    lat: point.coords[1],
                                    lng: point.coords[0]
                                })

                                // if waypoint
                                if (point.waypoint) {
                                    makeWaypoint(marker, point.waypoint)
                                }
                            }

                            // disable editing until terrain is loaded
                            editingOff()

                            // load terrain
                            processUpdate(() => {
                                // elevation profile has been loaded
                                $log.debug('elevation profile has been loaded!')

                                // note: this will still get called even if no terrain is present
                                editingOn()
                                $scope.loading = false
                                $scope.$apply()
                            })
                        }, 200)
                    })

                    // todo: handle 404?

            // if new
            } else if ($stateParams.routeId === 'new') {
                $scope.loading = false
            }

            let calculateWaypointIndex = () => {
                // keep track of waypoint index
                let waypointCount = 1

                angular.forEach(_line.editing._markers, (_marker, _index) => {
                    if (_marker.waypoint) {
                        _marker.waypoint.index = waypointCount
                        waypointCount++
                    }
                })
            }

            let makeWaypoint = (marker, waypointData) => {
                makePoint(marker)  // eslint-disable-line no-use-before-define

                marker.waypoint = {
                    name: ''
                }

                if (waypointData) {
                    marker.waypoint = waypointData
                }

                // add marker css class
                $(marker._icon).addClass('waypoint-icon')

                // keep track of waypoint index
                calculateWaypointIndex()
            }

            let makeRegularPoint = marker => {
                makePoint(marker) // eslint-disable-line no-use-before-define

                if (marker.waypoint) {
                    delete marker.waypoint
                }

                // remove waypoint css class (if exists)
                $(marker._icon).removeClass('waypoint-icon')

                // keep track of waypoint index
                calculateWaypointIndex()
            }

            let deleteWaypoint = marker => {
                makeRegularPoint(marker)
                processUpdate()
                saveLinePoints()
            }

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
                    if (e.latlng && elevationWidget) {
                        elevationWidget.highlight(e.latlng)
                    }

                    $timeout(() => $scope.hoverOnPointMap = e.target._index)
                })

                marker.on('mouseout', e => {
                    if (elevationWidget) {
                        elevationWidget.highlight()
                    }

                    $timeout(() => $scope.hoverOnPointMap = null)
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
                            saveLinePoints()
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

                                // if ($scope.routeControl.editing) {
                                //     marker.fire('click');
                                // }
                                // else {
                                //     editingOff();
                                // }
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
                            // if (marker._index == 0 ||
                            //    marker._index == _line.editing._markers.length - 1) {
                            //     $log.debug("can't create waypoint on start point or end point")
                            //     return;
                            // }

                            marker.closePopup()
                            makeWaypoint(marker)
                            marker.fire('click')

                            processUpdate()
                            saveLinePoints()
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

                            // makeRegularPoint(_line.editing._markers[marker._index + 1]);
                            // todo: handle proper styling on delete.
                            // start/end points should be waypoints!
                        })
                    }

                    leafletPopup.setContent(popup)
                })
            }

            let addPoint = (latlng, index) => {
                let _index = index

                // this prevents a bug where addPoint is called without a latlng object
                if (!latlng) return undefined

                // prevent adding a point too far from last point
                if (_line.editing._markers.length) {
                    // get last point
                    let lastPoint = _line.editing._markers[
                        _line.editing._markers.length - 1
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

                if (_index === null || typeof _index === 'undefined') {
                    _index = _line.editing._poly._latlngs.length
                }

                _line.editing._poly.addLatLng(latlng)
                _line.editing._markers.splice(_index, 0, _line.editing._createMarker(latlng))
                _line.editing._poly.redraw()

                // before calling updateMarkers, keep track of where waypoints are
                let waypoints = {}

                for (let [i, marker] of _line.editing._markers.entries()) {
                    if (marker.waypoint) {
                        waypoints[i] = marker.waypoint
                    }
                }

                // call updateMarkers to reload points
                _line.editing.updateMarkers()

                angular.forEach(_line.editing._markers, (marker, _index) => {
                    // if first point and no waypoint, create
                    if (_index === 0 && !waypoints[marker._index]) {
                        makeWaypoint(marker)

                    // if last point and no waypoint, create
                    // else if (index === (_line.editing._markers.length - 1) &&
                    // !waypoints[marker._index]) makeWaypoint(marker);

                    // if existing waypoint
                    } else if (waypoints[marker._index]) {
                        makeWaypoint(marker, waypoints[marker._index])

                    // auto-waypoint (only on "new" points at end of existing line,
                    // not new midpoints)
                    } else if (
                        $scope.routeControl.autoWaypoint &&
                        index === _index &&
                        index === _line.editing._poly._latlngs.length - 1
                    ) {
                        makeWaypoint(marker)

                    // regular point
                    } else {
                        makeRegularPoint(marker)
                    }
                })

                // return marker
                return _line.editing._markers[_index]
            }

            let mapClick = e => {
                if (!$scope.routeControl.editing) return
                if (preventEdit) return

                // add route polyline if it doesn't exist (only gets hit on first point)
                if (!_line) createLine()

                // add point
                addPoint(e.latlng)

                // update
                processUpdate()
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
                // $log.debug('saving route!')
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
                        terrain: [],
                        stats: $scope.route.stats,
                        // GeoJSON
                        path: {
                            type: 'LineString',
                            coordinates: []
                        }
                    }

                    // save elevation profile
                    // angular.forEach(elevationProfilePoints, function(point) {
                    //    _route.terrain.push({
                    //         coords: [ point.lng, point.lat ],
                    //         original: point.original,
                    //         aspect: point.aspect,
                    //         slope: point.slope,
                    //         elevation: point.elevation,
                    //         totalTimeEstimateMinutes: point.totalTimeEstimateMinutes,
                    //         totalDistance: point.totalDistance,
                    //         originalIndex: point.originalIndex,
                    //         index: point.index,
                    //    });
                    // });

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
                // var mapScale = 50000; // 1:{mapScale} ft
                // var metersPerPixel = mapScale / 39.3701 / $scope.getPixelsPerScreenInch();
                // var zoom = Math.log((156543.03392 / metersPerPixel) *
                // Math.cos($scope.map.getCenter().lat * Math.PI / 180)) / Math.log(2);
                // $scope.map.setZoom(zoom);
                // todo: if a map scale is explicitly selected,
                // make sure it stays in that scale as map moves

                // var minlat = '40.59382';
                // var minlon = '-111.65113';

                // var maxlat = '40.6090005';
                // var maxlon = '-111.60976';

                // calculate bounds
                let bounds = new google.maps.LatLngBounds()

                for (let i = 0; i < _line.editing._markers.length; i++) {
                    let thisPoint = _line.editing._markers[i]

                    bounds.extend(new google.maps.LatLng(
                        thisPoint._latlng.lat,
                        thisPoint._latlng.lng
                    ))
                }

                let gpx = ('<?xml version="1.0"?>\n' +
                    '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1">\n' + // xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
                    '  <metadata>\n' +
                    '    <name><![CDATA[Avanet GPX export]]></name>\n' +
                    '    <desc><![CDATA[]]></desc>\n' +
                    '    <link href="http://avanet.avatech.com">\n' +
                    '      <text>Created with Avanet - Avatech, Inc.</text>\n' +
                    '    </link>\n' +
                    // '    <bounds minlat="' + minlat + '" minlon="' + minlon +
                    // '" maxlat="' + maxlat + '" maxlon="' + maxlon + '"/>\n' +
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

                        // gpx +=  '    <name><![CDATA[' + thisPoint.waypoint.name + ']]></name>\n';

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

                    // if (thisPoint.waypoint) legIndex++;

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

                // $log.debug(gpx);

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

                // draw declination arrow legend
                // var declination = $scope.getDeclination();
                // var mils = Math.round(declination * 17.777777777778);
                // var gridNoth = $scope.getGridNorth();
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

                    // for testing
                    // window.open(canvas.toDataURL('image/jpeg',1), '_blank');
                })
            }

            $scope.$watch('munterRate', () => {
                if (
                    !elevationProfilePoints ||
                    !$scope.munterRate ||
                    isNaN($scope.munterRate.up) ||
                    isNaN($scope.munterRate.down === null)
                ) {
                    return
                }

                calculateRouteStats()
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
                    // $scope.$apply({ 'routeControl.editing' : false });
                    $scope.routeControl.editing = false
                    disabledForZoom = true

                // restart editing once zoomed back in
                } else if (
                    !$scope.routeControl.editing &&
                    $scope.map.getZoom() >= 13 &&
                    disabledForZoom
                ) {
                    // $scope.$apply({ 'routeControl.editing' : true });
                    $scope.routeControl.editing = true
                    disabledForZoom = false
                }
            })

            //  for (var i = 0; i < points.length; i++) {
            //       point_string += points[i].lng + "," + points[i].lat + ";";
            // }

            // point_string = point_string.substring(0,point_string.length-1);

            // $.getJSON("http://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json" +
            // "?layer=contour&fields=ele&points=" +
            //   point_string
            //   + "&access_token=pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0." +
            // "q_Esm5hrpZLbl1XQERtKpg",
            // function(data) {
            //       $log.debug(data.results);

            //       geoJSON.features[0].geometry.coordinates = [];
            //       for (var i=0; i< data.results.length; i++) {
            //           geoJSON.features[0].geometry.coordinates.push([
            //               data.results[i].latlng.lng,
            //               data.results[i].latlng.lat,
            //               data.results[i].ele
            //           ]);
            //       }

            //       lastLine = L.geoJson(geoJSON,{
            //           onEachFeature: elevationWidget.addData.bind(elevationWidget)
            // working on a better solution
            //       }).addTo($scope.map);
            //   })

            // });
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
