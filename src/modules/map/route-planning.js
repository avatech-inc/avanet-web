angular.module('avatech').controller('RoutePlanningController', function($http, $q, $log, $location, $state, $scope, $stateParams, $rootScope, $timeout, $filter, Global, Routes, snowpitExport, Confirm) {

    $scope.global = Global;

    $scope.formatters = formatters = snowpitExport.formatters;
    $scope.loading = true;

    // this ui-router scope inherits parent map scope
    $scope.map;
    $scope.terrainLayer;

    $scope.route = {
        _id: null,
        name: "Route Name",
        markers: [],
        stats: {},
        points: []
    };

    $scope.routeControl = {
        editing: true,
        autoWaypoint: false
    }

    $scope.close = function () {
        $rootScope.$broadcast('resizeMap');
        $state.go('^');
    };
    $scope.delete = function() {
        Confirm.open("Are you sure you want to delete this route?").then(function() {
            Routes.remove($scope.route);
            $scope.close();
        });
    }

    $scope._hoverOnLeg = function(index) {
        $scope.hoverOnLeg = index;
    }
    $scope._hoverOnPoint = function(index) {
        $scope.hoverOnPoint = index;
    }

    $scope.munterRate = {
        up: 4,
        down: 10
    }

    var _line;
    // $scope.$watchCollection('_line.editing._markers',function(){
    //     $log.debug("markers editing!!!!!!!!")
    //     if (_line && _line.editing && _line.editing._markers)
    //         $scope.route.markers = _line.editing._markers;
    // });

    // wait for map to be ready
    var mapWatcher = $scope.$watch('map', function(){
        if ($scope.map) {
            // unregister watch
            mapWatcher();
            // go
            ready();
        }
    });

    function ready() {
        //$scope.map = $rootScope.map;
        // load if routeId specified
        if ($stateParams.routeId && $stateParams.routeId != "new") {
            $http.get(window.apiBaseUrl + "routes/" + $stateParams.routeId)
            .then(function(res) {
                var route = res.data;

                $scope.route._id = route._id;
                $scope.route.name = route.name;

                // set map to fit route bounds
                var bounds = turf.extent(route.path);
                $scope.map.fitBounds([
                    [bounds[1], bounds[0]],
                    [bounds[3], bounds[2]]
                ], { maxZoom: 14, animate: false });

                // wait a bit for map to move. using a timeout here instead of:
                // $scope.map.on('moveend', function() { ... })
                // since it's just a percaution and 'moveend' can be unpredictabile
                $timeout(function(){
                    // create editable path
                    createLine();
                    // add markers
                    for (var i = 0; i < route.points.length; i++) {
                        var point = route.points[i];
                        var marker = addPoint({ lat: point.coords[1], lng: point.coords[0] });
                        // if waypoint
                        if (point.waypoint) makeWaypoint(marker, point.waypoint);
                    }
                    // disable editing until terrain is loaded
                    editingOff();
                    // load terrain
                    processUpdate(function() {
                        // elevation profile has been loaded
                        $log.debug("elevation profile has been loaded!");
                        // note: this will still get called even if no terrain is present
                        editingOn();
                        $scope.loading = false;
                        $scope.$apply();
                    });
                }, 200);
            });
            // todo: handle 404?
        }
        // if new
        else if ($stateParams.routeId == "new") {
            $scope.loading = false;
        }

        // remove map path and elevation widget when current state is destroyed
        $scope.$on('$destroy', function() {
            $scope.map.off('click', mapClick);
            if (elevationWidget) {
                elevationWidget.clear();
                elevationWidget = null;
            }
            if (lineGroup) lineGroup.removeFrom($scope.map);
            if (lineSegmentGroup) lineSegmentGroup.removeFrom($scope.map);
            _line = null;
            editHandler = null;
        });

        // save when route is edited
        var routeSaveTimer;
        $scope.$watch('route', function() {
            //$log.debug('saving route!')
            if (!_line || !_line.editing || (_line.editing._markers && _line.editing._markers.length < 2)) return;

            if (routeSaveTimer) $timeout.cancel(routeSaveTimer);
            routeSaveTimer = $timeout(function() {

                $log.debug("saving!!");

                var _route = {
                    name: $scope.route.name,
                    points: [],
                    terrain: [],
                    stats: $scope.route.stats,
                    // GeoJSON
                    path: {
                        type: "LineString",
                        coordinates: []
                    }
                };

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

                angular.forEach(_line.editing._markers, function(marker) {
                    _route.path.coordinates.push([ marker._latlng.lng, marker._latlng.lat ]);

                    _route.points.push({ 
                        coords: [ marker._latlng.lng, marker._latlng.lat ],
                        waypoint: marker.waypoint
                    });
                });

                if (!$scope.route._id) {
                    $http.post(window.apiBaseUrl + "routes", _route)
                    .then(function(res) {
                        if (res.data._id) {
                            $scope.route._id = res.data._id;
                            $scope.imageURL = res.data.imageURL;

                            // add to routes datastore
                            _route._id = $scope.route._id;
                            Routes.add(_route);

                            // replace URL with recieved _id
                            $state.params.routeId = $scope.route._id;
                            $state.transitionTo($state.current, $state.params, { inherit: true, notify: true });
                        }
                    });
                }
                else {
                     $http.put(window.apiBaseUrl + "routes/" + $scope.route._id, _route)
                    .then(function(data) {
                        // add to routes datastore
                        _route._id = $scope.route._id;
                        _route.updated = new Date();
                        Routes.add(_route);
                    });
                }

            }, 1000);

        }, true);

        // $scope.saveRoute = function() {
        //     if (!_line || !_line.editing || (_line.editing._markers && _line.editing._markers.length < 2)) return;

        //     if (routeSaveTimer) $timeout.cancel(routeSaveTimer);
        //     routeSaveTimer = $timeout(function() {

        //         $log.debug("saving!!");

        //         var _route = {
        //             name: $scope.route.name,
        //             points: [],
        //             terrain: [],
        //             stats: $scope.route.stats,
        //             // GeoJSON
        //             path: {
        //                 type: "LineString",
        //                 coordinates: []
        //             }
        //         };

        //         // save elevation profile
        //         // angular.forEach(elevationProfilePoints, function(point) {
        //         //    _route.terrain.push({
        //         //         coords: [ point.lng, point.lat ],
        //         //         original: point.original,
        //         //         aspect: point.aspect,
        //         //         slope: point.slope,
        //         //         elevation: point.elevation,
        //         //         totalTimeEstimateMinutes: point.totalTimeEstimateMinutes,
        //         //         totalDistance: point.totalDistance,
        //         //         originalIndex: point.originalIndex,
        //         //         index: point.index,
        //         //    });
        //         // });

        //         angular.forEach(_line.editing._markers, function(marker) {
        //             _route.path.coordinates.push([ marker._latlng.lng, marker._latlng.lat ]);

        //             _route.points.push({ 
        //                 coords: [ marker._latlng.lng, marker._latlng.lat ],
        //                 waypoint: marker.waypoint
        //             });
        //         });

        //         if (!$scope.route._id) {
        //             $http.post(window.apiBaseUrl + "routes", _route)
        //             .then(function(res) {
        //                 if (res.data._id) {
        //                     $scope.route._id = res.data._id;
        //                     $scope.imageURL = res.data.imageURL;

        //                     // add to routes datastore
        //                     Routes.add($scope.route);

        //                     // replace URL with recieved _id
        //                     $state.params.routeId = $scope.route._id;
        //                     $state.transitionTo($state.current, $state.params, { inherit: true, notify: true });
        //                 }
        //             });
        //         }
        //         else {
        //              $http.put(window.apiBaseUrl + "routes/" + $scope.route._id, _route)
        //             .then(function(data) {

        //             });
        //         }
        //     }, 1000);
        // }

        // hide icons when not in edit mode
        $scope.$watch("routeControl.editing", function() {
            if (!_line) return;

            // prevent editing above below zoom level 13
            if ($scope.routeControl.editing && $scope.map.getZoom() < 13) {
                $scope.routeControl.editing = false;
                alert("Please zoom in to edit your route.")
            }

            if ($scope.routeControl.editing) editingOn();
            else editingOff();
        }, true);

        function editingOn() {
            // show all points
            $(".leaflet-editing-icon").not(".waypoint-icon").not(".end-icon").removeClass("_hide");
            // enable point dragging
            angular.forEach(_line.editing._markers, function(marker) {
                marker.dragging.enable();
            });
        }
        function editingOff() {
            // close popups
            setTimeout(function() {
                var popups = $(".leaflet-popup-close-button");
                angular.forEach(popups, function(popup) { popup.click(); });
            });
            // hide all points that aren't waypoints
            $(".leaflet-editing-icon").not(".waypoint-icon").not(".end-icon").addClass("_hide");

            angular.forEach(_line.editing._markers, function(marker) {
                // disable point dragging
                marker.dragging.disable();
                // convert end point into a waypoint (if it isn't already)
                if (marker._index == _line.editing._markers.length - 1 && !marker.waypoint) {
                    makeWaypoint(marker);
                    updateSegments();
                    saveLinePoints();
                }
            });
        }

        $scope.route.waypointPrefix = function() {
            if (!$scope.route.name || $scope.route.name.length == 0) return "W";
            else return $scope.route.name[0];
        };

        $scope.routeControl.downloadGPX = function() {
            downloadGPX();
        };
        $scope.getDeclination = function() {
            var center = $scope.map.getCenter();
            var currentYear = new Date().getFullYear() + ((new Date().getMonth() + 1) / 12.0);  
            var declination = new WorldMagneticModel().declination(0, center.lat, center.lng, currentYear);
            return declination;
        },
        $scope.getGridNorth = function() {
            var center = $scope.map.getCenter();
            // get utm at center
            var utm_center = UTM.LatLonToUTMXY(UTM.DegToRad(center.lat), UTM.DegToRad(center.lng));
            var utm_top = UTM.LatLonToUTMXY(UTM.DegToRad($scope.map.getBounds()._northEast.lat), UTM.DegToRad(center.lng));
            // get easting at center
            var e = utm_center.x;
            // get lat lng of easting at top of map
            var top = UTM.UTMXYToLatLon(e, utm_top.y, utm_center.zone, center.lat < 0);
            // get bearing between center point and top point
            var bearing = turf.bearing(
                turf.point([ center.lng, center.lat ]),
                turf.point([ RadToDeg(top.lng), RadToDeg(top.lat) ])
            );
            return bearing;
        },
        $scope.getPixelsPerScreenInch = function() {
            var dpi = document.createElement("div");
            dpi.setAttribute("style","height: 1in; width: 1in; left: 100%; position: fixed; top: 100%;pointer-events:none;opacity:0;");
            document.body.appendChild(dpi);
            var dpi_x = dpi.offsetWidth;
            document.body.removeChild(dpi);
            dpi = null;
            return dpi_x;
        }
        $scope.getMetersPerPixel = function() {
           return (156543.03392 * Math.cos($scope.map.getCenter().lat * Math.PI / 180) / Math.pow(2, $scope.map.getZoom()));
        }   
        $scope.routeControl.downloadPDF = function() {
            var pdfRows = [];

            // PDF columns
            var columns = [   
                { text: '', style: 'tableHeader', width: 24 },
                { text: 'Name', style: 'tableHeader', width: '*' },
                { text: 'UTM', style: 'tableHeader', width: 49 },
                { text: 'Distance', style: 'tableHeader', width: 44 },
                { text: 'Elevation', style: 'tableHeader', width: 44 },
                { text: 'Net Elevation', style: 'tableHeader', width: 40 },
                { text: 'Bearing', style: 'tableHeader', width: 43 },
                { text: 'Time', style: 'tableHeader', width: 55 },
                { text: 'Running Time', style: 'tableHeader', width: 55 }
            ];
            pdfRows.push(columns);
            // set colummn widths
            var columnWidths = [];
            for (var i = 0; i < columns.length; i++) { columnWidths.push(columns[i].width); }

            // add rows
            angular.forEach($scope.route.points,function(point, index) {
                var nextPoint = index != $scope.route.points.length - 1 ? $scope.route.points[index + 1] : null;
                pdfRows.push([ 
                    $scope.route.waypointPrefix() + (index + 1), 
                    point.waypoint ? point.waypoint.name : "",
                    { text: formatters.formatLatLngAsUTM({ lat: point.lat, lng: point.lng }), alignment: 'right' },
                    { text: nextPoint && nextPoint.leg ? formatters.formatKmOrMiles(nextPoint.leg.distance) : "", alignment: 'right' },
                    { text: point.terrain ? formatters.formatElevation(point.terrain.elevation) : "", alignment: 'right' },
                    { text:nextPoint &&  nextPoint.leg ? ((nextPoint.leg.elevationChange > 0 ? '+':'') + " " + formatters.formatElevation(nextPoint.leg.elevationChange)) : "", alignment: 'right' },
                    nextPoint && nextPoint.leg ? formatters.formatDirection(nextPoint.leg.bearing) : "",
                    nextPoint && nextPoint.leg ? formatters.formatDuration(nextPoint.leg.timeEstimateMinutes) : "",
                    nextPoint && nextPoint.terrain ? formatters.formatDuration(nextPoint.terrain.totalTimeEstimateMinutes) : ""
                ]);
            });

            // pdf layout
            var docDefinition = {
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
                            hLineWidth: function() { return .5 },
                            vLineWidth: function() { return .5 }
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
            //var declination = $scope.getDeclination();
            //var mils = Math.round(declination * 17.777777777778);
            //var gridNoth = $scope.getGridNorth();
            var arrow_canvas = DrawDeclinationCanvas(
                $scope.getDeclination(),
                $scope.getGridNorth()
            );

            function formatMeters(meters) {
                if (meters >= 1000) {
                    var km = parseInt(meters) / 1000;
                    if (km % 1 != 0) return $filter('number')(km, 1)+ " km";
                    else return $filter('number')(km, 0)+ " km";
                }
                else return $filter('number')(meters, 0) + " m";
            }
            function formatFeet(feet) {
                if (feet >= 5280) {
                    var miles = parseInt(feet) / 5280;
                    if (miles % 1 != 0) return $filter('number')(miles, 1) + " mi";
                    else return $filter('number')(miles, 0) + " mi";
                }
                else return $filter('number')(feet, 0) + " ft";
            }

            // // calculate map scale variables
            // var metersPerPixel = $scope.getMetersPerPixel();
            // var inchesPerMeter = 39.3701;
            // // var pixelsPerMeter = metersPerPixel * 
            // // $log.debug("pixelsPerMeter: " + pixelsPerMeter);
            // var mapScale = Math.round(inchesPerMeter * metersPerPixel * $scope.getPixelsPerScreenInch());
            // var feetPerInch = Math.round(mapScale / 12.0);
            // var pixelsPerCm = $scope.getPixelsPerScreenInch() / 2.54;
            // var metersPerCm = Math.round(metersPerPixel * pixelsPerCm);
            // // todo: when above 1 mile or 1 km, show in mile and km
            // // $log.debug("MAP SCALE: 1:" + mapScale)
            // $log.debug("metersPerPixel: " + metersPerPixel)
            // // $log.debug("metersPerCm: " + metersPerCm)

            // // draw map scale
            // var scale_canvas = DrawScaleCanvas(metersPerPixel);

            // // convert elevation profile SVG to canvas

            // var svg = $(".elevation-widget svg")[0];
            // var width = parseInt(svg.getAttribute('width') * 2);
            // var height = parseInt(svg.getAttribute('height') * 2);

            // // svg styles
            // var SVGstyles = "<defs><style type='text/css'>";
            // SVGstyles += ".axis line, .axis path { fill: none; stroke: #000; stroke-width: 1 }";
            // SVGstyles += ".tick text { font-size: 12px; color: #000; }";
            // SVGstyles += ".area { fill: #aaa; }";
            // SVGstyles += "</style></defs>";

            // // get svg string
            // var SVGstring = new XMLSerializer().serializeToString(svg);
            // // viewBox allows for scaling
            // SVGstring = "<svg viewBox='0 0 " + svg.getAttribute('width') + " " + svg.getAttribute('height') + "' style='background:white'>" + SVGstyles + SVGstring.substr(SVGstring.indexOf(">") + 1);
           
            // var elev_canvas = document.createElement("canvas");
            // elev_canvas.width = width;
            // elev_canvas.height = height;
            // canvg(elev_canvas, SVGstring, { ignoreMouse: true, ignoreAnimation: true });//, scaleWidth: width, scaleHeight: height }) 


            leafletImage($scope.map, function(err, canvas) {

                // docDefinition.content.push({
                //     image: elev_canvas.toDataURL('image/png',1),
                //     width: 545
                // });
                // docDefinition.content.push({
                //     image: canvas.toDataURL('image/jpeg',1),
                //     width: (canvas.width / 2) * .635 // todo: this last multiplier is needed for same pixel accuracy as screen- why?
                // });
                // docDefinition.content.push({
                //     margin: [0, 8, 0,0],
                //     columns: [{
                //         image: arrow_canvas.toDataURL('image/jpeg',1),
                //         width: 70,
                //     }, 
                //     [{  
                //         margin: [17, 2.6, 0, 4.2],
                //         fontSize: 8.6,
                //         columns:[{
                //             text: ["SCALE  ",  { text: "1:" + $filter('number')(mapScale, 0), bold: true }],
                //             width: 'auto', margin: [0, 0, 14, 0]
                //         },{
                //             text: ["1 in = ",  { text: formatFeet(feetPerInch), bold: true }],
                //             width: 'auto', margin: [0, 0, 14, 0]
                //         },{
                //             text: ["1 cm = ",  { text: formatMeters(metersPerCm), bold: true }],
                //             width: '*'
                //         }]
                //     }, {
                //         image: scale_canvas.toDataURL('image/jpeg',1),
                //         width: (scale_canvas.width / 4) * .635
                //     }]
                //     ]
                // });
                pdfMake.createPdf(docDefinition).download();
                // for testing
                //window.open(canvas.toDataURL('image/jpeg',1), '_blank');
            });
        }


        $scope.$watch("munterRate", function() {
            if (!elevationProfilePoints || !$scope.munterRate || isNaN($scope.munterRate.up) || isNaN($scope.munterRate.down == null)) return;
            calculateRouteStats();
        }, true);

        $scope.$watch("hoverOnLeg", function() {
            angular.forEach(lineSegmentGroup._layers, function(segment) {
                segment.setStyle({ color: 'transparent' });
                if (segment.segment.legIndex == $scope.hoverOnLeg) {
                    // highlight route leg
                    segment.bringToBack();
                    segment.setStyle({ color: 'rgba(255,255,255,1)' });
                    // todo: highlight in elevation profile
                }
            });
        }, true);
        $scope.$watch("hoverOnPoint", function() {
            if (!_line) return;
            angular.forEach(_line.editing._markers, function(marker) {
                $(marker._icon).removeClass("highlight");
                if (marker._index == $scope.hoverOnPoint) {
                    // highlight marker
                    $(marker._icon).addClass("highlight");
                }
            });
        }, true);

        function interpolate(_points) {
            var new_points = [];
            for (var i = 0; i < _points.length; i++) {
                new_points[i*2] = _points[i];
           }
           for (var i = 0; i < new_points.length; i++) {
                if (!new_points[i]) {
                    var startPoint =  new google.maps.LatLng(new_points[i-1].lat, new_points[i-1].lng); 
                    var endPoint = new google.maps.LatLng(new_points[i+1].lat, new_points[i+1].lng); 
                    var percentage = 0.5; 
                    var middlePoint = google.maps.geometry.spherical.interpolate(startPoint, endPoint, percentage);
                    new_points[i] = { lat: middlePoint.lat(), lng: middlePoint.lng() }
                }
            }
            return new_points;
        }

        var disabledForZoom = false;
        $scope.map.on('zoomend', function(e) {
            // if zoom level is less than 13, disable editing
            if ($scope.routeControl.editing && $scope.map.getZoom() < 13) {
                //$scope.$apply({ 'routeControl.editing' : false });
                $scope.routeControl.editing = false;
                disabledForZoom = true;
            }
            // restart editing once zoomed back in
            else if (!$scope.routeControl.editing && $scope.map.getZoom() >= 13 && disabledForZoom) {
                //$scope.$apply({ 'routeControl.editing' : true });
                $scope.routeControl.editing = true;
                disabledForZoom = false;
            }
        });

        // the feature group holder for the route
        var lineGroup = L.featureGroup().addTo($scope.map);

        // Leaflet.Draw edit handler for custom edit/draw functionality
        var editHandler = new L.EditToolbar.Edit($scope.map, {
            featureGroup: lineGroup,
            selectedPathOptions: {
                color: '#2080cc',
                opacity: 1
            }
        });

        // keep track of line segments (point-to-point line segments, not route segments)
        var lineSegmentGroup = L.featureGroup().addTo($scope.map);

        function updateSegments() {
            lineSegmentGroup.clearLayers();

            var legIndex = 0;
            for (var i = 0; i < _line.editing._markers.length - 1; i++) {
                var thisPoint = _line.editing._markers[i];
                var nextPoint = _line.editing._markers[i + 1];

                // if waypoint
                if (thisPoint.waypoint) {
                    legIndex++;
                }

                var segmentData = {
                    start: thisPoint._latlng,
                    end: nextPoint._latlng,
                    index: i,
                    legIndex: legIndex
                };

                var segment = L.polyline([thisPoint._latlng, nextPoint._latlng], {
                    color: 'transparent',
                    opacity: .5,
                    weight: 12 // allows for a wider clickable area
                });
                segment.segment = segmentData;

                // add new point when clicking on a line segment
                // segment.on('mousedown', function(e) {
                //     if (!$scope.control.editing) return;
                //     // straighten out point on line
                //     // var newPoint = e.latlng;
                //     // newPoint = turf.pointOnLine(
                //     //     turf.linestring([
                //     //         [e.target.segment.start.lat, e.target.segment.start.lng],
                //     //         [e.target.segment.end.lat, e.target.segment.end.lng]
                //     //     ]),
                //     // );
                //     // newPoint = { lat: newPoint.geometry.coordinates[0], lng: newPoint.geometry.coordinates[1] };
                //     addPoint(e.latlng, e.target.segment.index + 1);
                //        processUpdate();
                // });

                // elevation widget highlight
                segment.on('mousemove', function(e) {
                    if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
                    $timeout(function(){ $scope.hoverOnLegMap = e.target.segment.legIndex });
                });
                segment.on('mouseout', function(e) {
                    if (elevationWidget) elevationWidget.highlight();
                    $timeout(function(){ $scope.hoverOnLegMap = null });
                });

                lineSegmentGroup.addLayer(segment);
            }
        }

        var saveLineTimeout;
        function saveLinePoints() {
            $timeout.cancel(saveLineTimeout);
            saveLineTimeout = $timeout(function(){
                $scope.route.stats = {};
                $scope.route.points = [];

                var legIndex = 0;
                var lastWaypointIndex = 0;

                for (var i = 0; i < _line.editing._markers.length; i++) {
                    var thisPoint = _line.editing._markers[i];

                    if (thisPoint.waypoint || i == 0 || i == _line.editing._markers.length - 1) {

                        var pointDetails = {
                            lat: thisPoint._latlng.lat,
                            lng: thisPoint._latlng.lng,
                            waypoint: thisPoint.waypoint,
                            pointIndex: thisPoint._index,
                            terrain: {},
                            leg: {}
                        };

                        // get leg
                        if (elevationProfilePoints) {
                            var legPoints = getLegPoints(lastWaypointIndex, thisPoint._index);
                            pointDetails.leg = calculateLineSegmentStats(legPoints);
                            pointDetails.terrain = getElevationProfilePoint(thisPoint._index);
                        }   

                        // set leg on every point so that we can highlight it
                        pointDetails.leg.index = legIndex;

                        $scope.route.points.push(pointDetails);

                        if (thisPoint.waypoint) legIndex++;
                        lastWaypointIndex = thisPoint._index;
                    }
                }

                // route terrain stats
                if (elevationProfilePoints) {
                    //$log.debug("here!!!!!!!!!!!!!!!!!");
                   $scope.route.stats = calculateLineSegmentStats(elevationProfilePoints);
                   //$log.debug($scope.route.stats);
                }
            }, 10);
        }

        function addPoint(latlng, index) {
            // this prevents a bug where addPoint is called without a latlng object
            if (!latlng) return;

            // prevent adding a point too far from last point
            if (_line.editing._markers.length) {
                // get last point
                var lastPoint = _line.editing._markers[_line.editing._markers.length - 1]._latlng;
                // get distance from last point
                var distance = turf.distance(turf.point([lastPoint.lng,lastPoint.lat]), turf.point([latlng.lng,latlng.lat]), 'kilometers');
                // if distance is greater than 8km/5mi, don't allow
                if (distance > 8) {
                    alert('This point is more than 8km/5mi far from the last point.\n\nPlease place your next point closer.');
                    return;
                }
            }

            if (index == null) index = _line.editing._poly._latlngs.length;
            _line.editing._poly.addLatLng(latlng);
            _line.editing._markers.splice(index, 0, _line.editing._createMarker(latlng));
            _line.editing._poly.redraw();

            // before calling updateMarkers, keep track of where waypoints are
            var waypoints = {};
            for (var i = 0; i < _line.editing._markers.length; i++) {
                var marker = _line.editing._markers[i];
                if (marker.waypoint) waypoints[i] = marker.waypoint;
            }

            // call updateMarkers to reload points
            _line.editing.updateMarkers();

            angular.forEach(_line.editing._markers,function(marker, _index) {
                // if first point and no waypoint, create
                if (_index === 0 && !waypoints[marker._index]) makeWaypoint(marker);
                // if last point and no waypoint, create
                //else if (index === (_line.editing._markers.length - 1) && !waypoints[marker._index]) makeWaypoint(marker);
                // if existing waypoint
                else if (waypoints[marker._index]) makeWaypoint(marker, waypoints[marker._index]);
                // auto-waypoint (only on "new" points at end of existing line, not new midpoints)
                else if ($scope.routeControl.autoWaypoint && index == _index && index == _line.editing._poly._latlngs.length - 1) {
                    makeWaypoint(marker);
                }
                // regular point
                else makeRegularPoint(marker);
            });
            // return marker
            return _line.editing._markers[index];
        }

        function createLine() {
            _line = L.polyline([], { opacity: .5 });
            lineGroup.addLayer(_line);
            editHandler.enable();

            // event when line is edited (after point is dragged or midpoint added)
            _line.on('edit', function(e) {
                // prevent addition of new points for 1 second after moving point
                // to prevent accidental addition of new point
                preventEdit = true;
                setTimeout(function() { preventEdit = false }, 1000);

                // handle new midpoints
                angular.forEach(_line.editing._markers,function(marker) {
                    if (!marker.isPoint) makeRegularPoint(marker);
                });

                processUpdate();
            });
        }

        var preventEdit = false;
        function mapClick(e) {
            if (!$scope.routeControl.editing) return;
            if (preventEdit) return;

            // add route polyline if it doesn't exist (only gets hit on first point)
            if (!_line) createLine();

            // add point
            addPoint(e.latlng);

            // update
            processUpdate();
        };
        $scope.map.on('click', mapClick);

        function makePoint(marker) {
            // mark as a route planning point
            marker.isPoint = true;

            // if first point, add start class
            if (marker._index == 0) $(marker._icon).addClass("start-icon");
            // if last point, add end class
            else if (marker._index == _line.editing._markers.length - 1) $(marker._icon).addClass("end-icon");

            // remove existing marker events
            marker.off('click');
            marker.off('mouseover');
            marker.off('mouseout');

            // elevation widget highlight
            marker.on('mouseover', function(e) {
                if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
                $timeout(function(){ $scope.hoverOnPointMap = e.target._index });

            });
            marker.on('mouseout', function(e) {
                if (elevationWidget) elevationWidget.highlight();
                $timeout(function(){ $scope.hoverOnPointMap = null });
            });

            // popup
            marker.unbindPopup();
            marker.bindPopup("test", { closeButton: true });   

            marker.on('click', function() {
                var leafletPopup = marker.getPopup();

                var popup = document.createElement("div");
                popup.style.padding = '5px';

                if (marker.waypoint) {
                    popup.appendChild($("<div style='font-weight:bold;position:relative;bottom:2px;margin-right:20px;'>" + $scope.route.waypointPrefix() + marker.waypoint.index + "</div>")[0]);

                    var nameInput = document.createElement("input");
                    popup.appendChild(nameInput);
                    nameInput.placeholder = "Waypoint Name";
                    nameInput.value = marker.waypoint.name;
                    nameInput.onkeyup = function() {
                        marker.waypoint.name = nameInput.value;
                        saveLinePoints();
                    }

                    if (marker._index > 0 && $scope.routeControl.editing) {
                        var deleteWaypointbutton = document.createElement("button");
                        popup.appendChild(deleteWaypointbutton);
                        deleteWaypointbutton.innerHTML = "<i class='ion-trash-a'></i>&nbsp;&nbsp;Remove Waypoint";
                        deleteWaypointbutton.addEventListener("click", function() {
                            marker.closePopup();
                            deleteWaypoint(marker);

                            marker.fire('click');
                            // if ($scope.routeControl.editing) {
                            //     marker.fire('click');
                            // }
                            // else {
                            //     editingOff();
                            // }
                        });
                    }
                }
                else {
                    popup.appendChild($("<div style='font-weight:bold;position:relative;bottom:2px;margin-right:20px;'>Route Point<br/></div>")[0]);
                    var makeWaypointbutton = document.createElement("button");
                    popup.appendChild(makeWaypointbutton);
                    makeWaypointbutton.innerHTML = '<i class="fa fa-map-marker"></i>&nbsp;&nbsp;Make Waypoint';
                    makeWaypointbutton.addEventListener("click", function() {
                        // if (marker._index == 0 || marker._index == _line.editing._markers.length - 1) {
                        //     $log.debug("can't create waypoint on start point or end point")
                        //     return;
                        // }

                        marker.closePopup();
                        makeWaypoint(marker);
                        marker.fire('click');

                        processUpdate();
                        saveLinePoints();
                    });

                    var deleteButton = document.createElement("button");
                    popup.appendChild(deleteButton);
                    deleteButton.innerHTML = '<i class="ion-trash-a"></i>&nbsp;&nbsp;Delete';
                    deleteButton.addEventListener("click", function() {
                        if (_line.editing._markers.length == 1) {
                            $log.debug("can't delete only point");
                            return;
                        }
                        _line.editing._onMarkerClick({ target: marker });
                        //makeRegularPoint(_line.editing._markers[marker._index + 1]);
                        // todo: handle proper styling on delete. start/end points should be waypoints!
                    });
                }
                leafletPopup.setContent(popup);
            });
        }

        function makeWaypoint(marker, waypointData) {
            makePoint(marker);

            marker.waypoint = {
                name: ''
            };
            if (waypointData) marker.waypoint = waypointData;

            // add marker css class
            $(marker._icon).addClass("waypoint-icon");

            // keep track of waypoint index
            calculateWaypointIndex();
        }
        function makeRegularPoint(marker) {
            makePoint(marker);

            if (marker.waypoint) delete marker.waypoint;

            // remove waypoint css class (if exists)
            $(marker._icon).removeClass("waypoint-icon");

            // keep track of waypoint index
            calculateWaypointIndex();
        }

        function calculateWaypointIndex() {     
            // keep track of waypoint index
            var waypointCount = 1;
            angular.forEach(_line.editing._markers,function(_marker, _index) {
                if (_marker.waypoint) {
                    _marker.waypoint.index = waypointCount;
                    waypointCount++;
                }
            });
        }

        function deleteWaypoint(marker) {
            makeRegularPoint(marker);
            processUpdate();
            saveLinePoints();
        }

        var elevationProfilePoints;
        var lastLine;

        function processUpdate(callback) {
            updateSegments();

            $log.debug("processUpdate!")

            var points = _line._latlngs;

            // get line distance
            var distance = turf.lineDistance(turf.linestring(points.map(function(point) { return [point.lng,point.lat] })), 'kilometers');
           
            // sample every 5m
            var sampleCount = Math.round((distance * 1000) / 5);

            // keep track of original points
            for (var i = 0; i < points.length;i++) {
                points[i].original  = true;
            }

            // interpolate between points
            while ((points.length * 2) -1 <= sampleCount) {
                points = interpolate(points);
            }

            $scope.terrainLayer.getTerrainDataBulk(points, function(receivedPoints) {
                if (callback) callback();

                if (!receivedPoints || receivedPoints.length == 0) return;

                $log.debug("TERRAIN DATA LAODED!")

                // store elevation profile for later
                elevationProfilePoints = angular.copy(receivedPoints);
                //$log.debug(receivedPoints);

                // calculate route stats/time, etc.
                calculateRouteStats();

                // plot elevation profile
                plotElevationProfile();

                // add waypoints to elevation profile
                angular.forEach(_line.editing._markers,function(marker, i) {
                    // if waypoint isn't first or last
                    if (marker.waypoint && i != 0 && i != _line.editing._markers.length - 1) elevationWidget.addWaypoint(marker._latlng);
                });

                $scope.loading = false;

                saveLinePoints();
            });
            //$log.debug("promises!");
            //$log.debug(promises);
            updateSegments();
        }

        function calculateRouteStats() {
            var points = elevationProfilePoints;
            if (!points) return;

            var totalDistance = 0;
            var totalTimeEstimateMinutes = 0;
            var originalIndex = 0;


            for (var i = 0; i < points.length; i++) {
                //$log.debug(i);
                var point = points[i];
                if (!point) continue;

                // assign index for tracking
                point.index = i;
                // assign original index for tracking markers
                if (point.original) {
                    point.originalIndex = originalIndex;
                    originalIndex++;
                }

                // defaults for first point
                point.totalDistance = 0;
                point.totalTimeEstimateMinutes = 0;

                if (i == 0) continue;

                // keep track of distance

                var segmentDistance = turf.lineDistance(turf.linestring([
                    [points[i-1].lng, points[i-1].lat],
                    [point.lng, point.lat]
                ]), 'kilometers');
                point.distance = segmentDistance;
                totalDistance += segmentDistance
                point.totalDistance = totalDistance;

                // keep track of bearing

                point.bearing = turf.bearing(turf.point([points[i-1].lng, points[i-1].lat]), turf.point([point.lng, point.lat]));
                if (point.bearing < 0) point.bearing += 360;

                // keep track of vertical up/down and munter time estimates

                // munter time estimate details...
                // http://www.foxmountainguides.com/about/the-guides-blog/tags/tag/munter-touring-plan
                // https://books.google.com/books?id=Yg3WTwZxLhIC&lpg=PA339&ots=E-lqpwepiA&dq=munter%20time%20calculation&pg=PA112#v=onepage&q=munter%20time%20calculation&f=false
                // distance: 1km = 1 unit (since distance is already in km, just use as-is)
                // vertical: 100m = 1 unit (vertical is in m, so just divide by 100)

                var previousElevation = points[i-1].elevation;
                point.elevationDifference = point.elevation - previousElevation;

                if (point.elevationDifference > 0) {
                    point.direction = "up";
                    point.verticalUp = point.elevationDifference;

                    point.munterUnits = segmentDistance + (point.verticalUp / 100);
                    point.timeEstimateMinutes = (point.munterUnits / $scope.munterRate.up) * 60;
                }
                else if (point.elevationDifference < 0) {
                    point.direction = "down";
                    point.verticalDown = Math.abs(point.elevationDifference);

                    point.munterUnits = segmentDistance + (point.verticalDown / 100);
                    point.timeEstimateMinutes = (point.munterUnits / $scope.munterRate.down) * 60;
                }
                else {
                    point.direction = "flat";

                    point.munterUnits = segmentDistance;
                    var munter_rate_flat = ($scope.munterRate.up + $scope.munterRate.down) / 2;
                    point.timeEstimateMinutes = (point.munterUnits / munter_rate_flat) * 60;
                }

                totalTimeEstimateMinutes += point.timeEstimateMinutes;
                point.totalTimeEstimateMinutes = totalTimeEstimateMinutes;

            }
            saveLinePoints();
        }

        function getLegPoints(pointIndexStart, pointIndexEnd) {
            if (!elevationProfilePoints) return [];
            var startIndex = 0;
            var endIndex = 0;
            for (var i = 0; i < elevationProfilePoints.length; i++) {
                var point = elevationProfilePoints[i];
                if (point.originalIndex == pointIndexStart) startIndex = i;
                else if (point.originalIndex == pointIndexEnd) endIndex = i;
            }
            return elevationProfilePoints.slice(startIndex, endIndex + 1);
        }
        function getElevationProfilePoint(pointIndex) {
            if (!elevationProfilePoints) return -1;
            for (var i = 0; i < elevationProfilePoints.length; i++) {
                var point = elevationProfilePoints[i];
                if (point.originalIndex == pointIndex) return point;
            }
        }

        function calculateLineSegmentStats(points) {
            if (!points || points.length < 2) return {};

            var startPoint = points[0];
            var endPoint = points[points.length - 1];

            var bearing = turf.bearing(turf.point([startPoint.lng, startPoint.lat]), turf.point([endPoint.lng, endPoint.lat]));
            if (bearing < 0) bearing += 360;

            // calculate stats
            return {
                timeEstimateMinutes: endPoint.totalTimeEstimateMinutes - startPoint.totalTimeEstimateMinutes,
                distance: endPoint.totalDistance  - startPoint.totalDistance,

                elevationChange: endPoint.elevation - startPoint.elevation,
                elevationMin: getMin(points, 'elevation'),
                elevationMax: getMax(points, 'elevation'),

                slopeMin: getMin(points, 'slope'),
                slopeMax: getMax(points, 'slope'),
                slopeAverage: getAverage(points, 'slope'),

                verticalUp: getSum(points, 'verticalUp'),
                verticalDown: getSum(points, 'verticalDown'),

                aspectMin: getMin(points, 'aspect'),
                aspectMax: getMax(points, 'aspect'),
                aspectAverage: getAverageAspect(points, 'aspect'),

                bearing: bearing
            }
        }

        function plotElevationProfile() {
            var points = elevationProfilePoints;
            if (!points) return;

            var geoJSON = {
                "name":"NewFeatureType",
                "type":"FeatureCollection",
                "features":[{
                    "type":"Feature",
                    "geometry": { "type":"LineString", "coordinates":[] },
                    "properties": null
            }]};
            geoJSON.features[0].geometry.coordinates = [];

            // get max elevation
            var max_elevation = 0;
            for (var i = 0; i < points.length; i++) {
                max_elevation = Math.max(points[i].elevation, max_elevation);
                //if (points[i].elevation > max_elevation) max_elevation = 
            }

            for (var i = 0; i < points.length; i++) {
                var thisPoint = points[i];
                if (!thisPoint || thisPoint.lat == null || thisPoint.lat == null) continue;

                if (!thisPoint.elevation) thisPoint.elevation = max_elevation;

                geoJSON.features[0].geometry.coordinates.push([
                    thisPoint.lng,
                    thisPoint.lat,
                    thisPoint.elevation,
                    thisPoint.slope,
                    formatters.formatDirection(thisPoint.aspect),
                    thisPoint.totalTimeEstimateMinutes,
                    thisPoint.totalDistance,
                    formatters.formatDirection(thisPoint.bearing)
                ]);
            }

            if (lastLine) $scope.map.removeLayer(lastLine);
            createElevationProfileWidget();

            lastLine = L.geoJson(geoJSON, {
                onEachFeature: elevationWidget.addData.bind(elevationWidget) //working on a better solution
            });
        }
          //  for (var i = 0; i < points.length; i++) {
          //       point_string += points[i].lng + "," + points[i].lat + ";";
          // }

          // point_string = point_string.substring(0,point_string.length-1);

          // $.getJSON("http://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points=" +
          //   point_string 
          //   + "&access_token=pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0.q_Esm5hrpZLbl1XQERtKpg", function(data) {
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
          //           onEachFeature: elevationWidget.addData.bind(elevationWidget) //working on a better solution
          //       }).addTo($scope.map);
          //   })

        // });

        var elevationWidget;
        function createElevationProfileWidget() {

            if (elevationWidget) elevationWidget.clear();

            elevationWidget = new ElevationWidget();
            elevationWidget.create($scope.map, {
                imperial: Global.user.settings.elevation == 1, // true
                //width: 670,
                height: 163,
                margins: {
                    top: 24,
                    right: 18,
                    bottom: 20,
                    left: 40
                },
                useHeightIndicator: true, //if false a marker is drawn at map position
                hoverNumber: {
                    decimalsX: 3, //decimals on distance (always in km)
                    decimalsY: 0, //deciamls on height (always in m)
                    formatter: undefined //custom formatter function may be injected
                },
                // xTicks: undefined, //number of ticks in x axis, calculated by default according to width
                // yTicks: undefined, //number of ticks on y axis, calculated by default according to height
            });
        }

        function downloadGPX() {
            // var mapScale = 50000; // 1:{mapScale} ft
            // var metersPerPixel = mapScale / 39.3701 / $scope.getPixelsPerScreenInch();
            // var zoom = Math.log((156543.03392 / metersPerPixel) * Math.cos($scope.map.getCenter().lat * Math.PI / 180)) / Math.log(2);
            // $scope.map.setZoom(zoom);
            // todo: if a map scale is explicitly selected, make sure it stays in that scale as map moves

            // var minlat = '40.59382';
            // var minlon = '-111.65113';

            // var maxlat = '40.6090005';
            // var maxlon = '-111.60976';

            // calculate bounds
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < _line.editing._markers.length; i++) {
                var thisPoint = _line.editing._markers[i];
                bounds.extend(new google.maps.LatLng(thisPoint._latlng.lat, thisPoint._latlng.lng));
            }

            var gpx = 
                '<?xml version="1.0"?>\n' +
                '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1">\n' + // xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
                '  <metadata>\n' +
                '    <name><![CDATA[Avanet GPX export]]></name>\n' +
                '    <desc><![CDATA[]]></desc>\n' +
                '    <link href="http://avanet.avatech.com">\n' +
                '      <text>Created with Avanet - Avatech, Inc.</text>\n' +
                '    </link>\n' +
                //'    <bounds minlat="' + minlat + '" minlon="' + minlon + '" maxlat="' + maxlat + '" maxlon="' + maxlon + '"/>\n' +
                '  </metadata>\n';

            // waypoints
            var wayPointIndex = 0;
            for (var i = 0; i < _line.editing._markers.length; i++) {
                var thisPoint = _line.editing._markers[i];
                if (thisPoint.waypoint || i == 0 || i == _line.editing._markers.length - 1) {
                    wayPointIndex++;
                    gpx +=  '  <wpt lat="' + thisPoint._latlng.lat + '" lon="' + thisPoint._latlng.lng + '">\n';
                    //gpx +=  '    <name><![CDATA[' + thisPoint.waypoint.name + ']]></name>\n';
                    gpx +=  '    <name><![CDATA[' + $scope.route.waypointPrefix() + wayPointIndex + ']]></name>\n';
                    if (thisPoint.waypoint && thisPoint.waypoint.name) 
                        gpx += '    <desc><![CDATA[' + thisPoint.waypoint.name + ']]></desc>\n';
                    gpx +=  '  </wpt>\n';
                }
            }

            // route start
            gpx +=  '<rte>' +
                    '<name><![CDATA[]]></name>\n' +
                    '<desc><![CDATA[]]></desc>\n' +
                    '<src>AllTrails</src>\n';

            // route points
            wayPointIndex = 0;
            for (var i = 0; i < _line.editing._markers.length; i++) {
                var thisPoint = _line.editing._markers[i];
                //if (thisPoint.waypoint) legIndex++;
                gpx += '    <rtept lat="' + thisPoint._latlng.lat + '" lon="' + thisPoint._latlng.lng + '">\n';
                if (thisPoint.waypoint || i == 0 || i == _line.editing._markers.length - 1) {
                    wayPointIndex++;
                    gpx += '      <name><![CDATA[' + $scope.route.waypointPrefix() + wayPointIndex + ']]></name>\n';
                    if (thisPoint.waypoint && thisPoint.waypoint.name) 
                        gpx += '      <desc><![CDATA[' + thisPoint.waypoint.name + ']]></desc>\n';
                }
                gpx += '    </rtept>\n';
            }

            // route end
            gpx += '  </rte>\n';

            // end GPX
            gpx += '</gpx>';

            //$log.debug(gpx);

            var gpxData = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpx);
            var link = document.createElement('a');
            angular.element(link)
                .attr('href', gpxData)
                .attr('download', 'avanet-route.gpx');
            link.click();
        }

        // UTILS

        function getAverage(list, property) {
            var sum = 0;
            for (var i = 0; i < list.length; i++) {
                var val;
                if (!property) val = list[i];
                else val = list[i][property];
                if (val != null) sum += val;
            }
            return sum / list.length;
        }
        function getMin(list, property) {
            var min = 9999;
            for (var i = 0; i < list.length; i++) {
                var val;
                if (!property) val = list[i];
                else val = list[i][property];
                if (val != null) min = Math.min(min, val);
            }
            return min;
        }
        function getMax(list, property) {
            var max = 0;
            for (var i = 0; i < list.length; i++) {
                var val;
                if (!property) val = list[i];
                else val = list[i][property];
                if (val != null) max = Math.max(max, val);
            }
            return max;
        }
        function getSum(list, property) {
            var sum = 0;
            for (var i = 0; i < list.length; i++) {
                var val;
                if (!property) val = list[i];
                else val = list[i][property];
                if (val != null) sum += val;
            }
            return sum;
        }

        // for aspect only
        function getAverageAspect(list, property) {
            var sines = [];
            var cosines = [];

            // get sines and cosines
            for (var i = 0; i < list.length; i++) {
                var aspect = list[i][property];
                if (aspect != null) {
                    aspect = parseInt(aspect);
                    // convert aspect degrees to radians
                    aspect *= (Math.PI / 180);
                    sines.push(Math.sin(aspect));
                    cosines.push(Math.cos(aspect));
                }
            }

            // calculate mean of sines and cosines
            var meanSine = getAverage(sines);
            var meanCosine = getAverage(cosines);

            // calculate aspect in radians
            var averageAspectRadians = Math.atan2(meanSine, meanCosine);

            // convert to degrees
            var deg = averageAspectRadians * (180 / Math.PI);

            // if negative, adjust
            if (deg < 0) deg = 360 + deg;

            return deg;
        }
    }
});