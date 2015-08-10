angular.module('avatech').directive('routePlanning', function($http, $timeout, Global, snowpitExport) {
  return {
    restrict: 'E',
    scope: { 
      map: '=',
      terrainLayer: '=',
      route: '=',
      hoverOnLegMap: '=',
      hoverOnLeg: '=',

      hoverOnPointMap: '=',
      hoverOnPoint: '=',

      munterRateUp: '=',
      munterRateDown: '=',

      control: '='
    },
    link: function(scope, element) {

        scope.control = {
            downloadGPX: function() {
                downloadGPX();
            }
        }

        scope.$watch("munterRateUp", function() {
            if (!elevationProfilePoints || scope.munterRateUp == null) return;
            calculateRouteStats(elevationProfilePoints);
        }, true);
        scope.$watch("munterRateDown", function() {
            if (!elevationProfilePoints|| scope.munterRateDown == null) return;
            calculateRouteStats(elevationProfilePoints);
        }, true);

        scope.$watch("hoverOnLeg", function(){
            console.log("HOVER ON LEG: " + scope.hoverOnLeg);
            angular.forEach(lineSegmentGroup._layers, function(segment) {
                segment.setStyle({ color: 'transparent' });
                if (segment.segment.legIndex == scope.hoverOnLeg) {
                    // highlight route leg
                    segment.setStyle({ color: 'rgba(0,0,255,.4)' });
                    // todo: highlight in elevation profile
                }
            });
        }, true);
        scope.$watch("hoverOnPoint", function(){
            console.log("HOVER ON POINT: " + scope.hoverOnPoint);
            if (!_line) return;
            angular.forEach(_line.editing._markers, function(marker) {
                $(marker._icon).removeClass("highlight");
                if (marker._index == scope.hoverOnPoint) {
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
                    // todo: wtf?????
                    // new_points[i] = { lat: middlePoint.A, lng: middlePoint.F }
                    new_points[i] = { lat: middlePoint.G, lng: middlePoint.K }
                }
          }

            return new_points;
        }

        var terrainLayer = scope.terrainLayer;
        var _map = scope.map;

        console.log(scope.terrainLayer._map);
        console.log(scope.map);

        // return {
        //     init: function(_map, terrainLayer, saveLinePointsCallback) {

        // L.Control.RoutePlanningToolbar = L.Control.extend({
        //     options: {
        //         position: "topleft"
        //     },
        //     onRemove: function(map) {
        //         this._container = null;
        //     },
        //     onAdd: function(map) {
        //         this._map = map;

        //         var container = this._container = L.DomUtil.create("div", "route-planning-toolbar");

        //         var saveButton = document.createElement("button");
        //         container.appendChild(saveButton);
        //         saveButton.innerHTML = "Save";
        //         saveButton.onclick = function() {
        //             saveRoute();
        //         }

        //         return container;
        //     }
        // });
        // var routePlanningToolbar = new L.Control.RoutePlanningToolbar({}).addTo(_map);

        _map.on('zoomend', function(e) {
            //plotElevationProfile();
            console.log("MAP ZOOM: " + _map.getZoom());
            // todo: if zoom level 11, disable route editing
        });

        var _line;

        // the feature group holder for the route
        var lineGroup = L.featureGroup().addTo(_map);

        // Leaflet.Draw edit handler for custom edit/draw functionality
        var editHandler = new L.EditToolbar.Edit(_map, {
            featureGroup: lineGroup,
            selectedPathOptions: {
                color: 'blue'
            }
        });

        // keep track of line segments (point-to-point line segments, not route segments)
        var lineSegmentGroup = L.featureGroup().addTo(_map);

        function updateSegments() {
            lineSegmentGroup.clearLayers();

            var legIndex = 0;
            for (var i = 0; i < _line.editing._markers.length - 1; i++) {
                var thisPoint = _line.editing._markers[i];
                var nextPoint = _line.editing._markers[i + 1];

                // if waypoint
                if (thisPoint.waypoint) legIndex++;

                var segmentData = {
                    start: thisPoint._latlng,
                    end: nextPoint._latlng,
                    index: i,
                    legIndex: legIndex
                };

                var segment = L.polyline([thisPoint._latlng, nextPoint._latlng], {
                    color: 'transparent',
                    weight: 12 // allows for a wider clickable area
                });
                segment.segment = segmentData;

                // add new point when clicking on a line segment
                segment.on('mousedown', function(e) {
                    // straighten out point on line
                    // var newPoint = e.latlng;
                    // newPoint = turf.pointOnLine(
                    //     turf.linestring([
                    //         [e.target.segment.start.lat, e.target.segment.start.lng],
                    //         [e.target.segment.end.lat, e.target.segment.end.lng]
                    //     ]),
                    // );
                    // newPoint = { lat: newPoint.geometry.coordinates[0], lng: newPoint.geometry.coordinates[1] };

                    addPoint(e.latlng, e.target.segment.index + 1);
                });

                // elevation widget highlight
                segment.on('mousemove', function(e) {
                    if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
                    $timeout(function(){ scope.hoverOnLegMap = e.target.segment.legIndex });
                });
                segment.on('mouseout', function(e) {
                    if (elevationWidget) elevationWidget.highlight();
                    $timeout(function(){ scope.hoverOnLegMap = null });
                });

                lineSegmentGroup.addLayer(segment);
            }
        }

        function saveLinePoints() {
            $timeout(function(){
                scope.route = {
                    terrain: {},
                    points: []
                };

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

                        pointDetails.leg.index = legIndex;

                        scope.route.points.push(pointDetails);

                        if (thisPoint.waypoint) legIndex++;
                        lastWaypointIndex = thisPoint._index;
                    }
                }

                // route terrain stats
                if (elevationProfilePoints)
                   scope.route.terrain = calculateLineSegmentStats(elevationProfilePoints);
            });
        }

        function addPoint(latlng, index) {
            if (index == null) index = _line.editing._poly._latlngs.length;

            _line.editing._poly.spliceLatLngs(index, 0, latlng);
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

            angular.forEach(_line.editing._markers,function(marker) {
                // if waypoint
                if (waypoints[marker._index]) makeWaypoint(marker, waypoints[marker._index]);
                // regular point
                else makeRegularPoint(marker);
            });

            updateElevationProfile();
            updateSegments();
        }

        var preventEdit = false;
        _map.on('click', function(e) {
            if (preventEdit) return;
            if (!_line) {
                _line = L.polyline([], {});
                lineGroup.addLayer(_line);
                editHandler.enable();


                // when line is edited (after point is dragged)
                _line.on('edit', function(e) {
                    // prevent addition of new points for 1 second after moving point
                    // to prevent accidental addition of new point
                    preventEdit = true;
                    setTimeout(function() { preventEdit = false }, 1000);

                    updateElevationProfile();
                    updateSegments();
                });
            }

            // add point
            addPoint(e.latlng);
        });

        function makePoint(marker) {
            // remove existing marker events
            marker.off('click');
            marker.off('mouseover');
            marker.off('mouseout');

            // elevation widget highlight
            marker.on('mouseover', function(e) {
                if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
                $timeout(function(){ scope.hoverOnPointMap = e.target._index });

            });
            marker.on('mouseout', function(e) {
                if (elevationWidget) elevationWidget.highlight();
                $timeout(function(){ scope.hoverOnPointMap = null });
            });
        }

        function makeWaypoint(marker, waypointData) {
            makePoint(marker);

            marker.waypoint = {
                name: 'Waypoint'
            };
            if (waypointData) marker.waypoint = waypointData;

            // add marker css class
            $(marker._icon).addClass("waypoint-icon");

            // bind popup
            marker.unbindPopup();

            var popup = document.createElement("div");
            popup.style.padding = '5px';

            var nameInput = document.createElement("input");
            popup.appendChild(nameInput);
            nameInput.value = marker.waypoint.name;
            nameInput.onkeyup = function() {
                marker.waypoint.name = nameInput.value;
                saveLinePoints();
            }

            var deleteWaypointbutton = document.createElement("button");
            popup.appendChild(deleteWaypointbutton);
            deleteWaypointbutton.innerHTML = "delete waypoint";
            deleteWaypointbutton.addEventListener("click", function() {
                marker.closePopup();
                marker.unbindPopup();
                deleteWaypoint(marker);
            });

            marker.bindPopup(popup, { closeButton: false });
        }
        function makeRegularPoint(marker) {
            makePoint(marker);

            // remove existing marker click events
            marker.off('click');

            if (marker.waypoint) delete marker.waypoint;

            // remove waypoint css class (if exists)
            $(marker._icon).removeClass("waypoint-icon");

            // start point
            if (marker._index == 0) $(marker._icon).addClass("start-icon");
            // end point
            if (marker._index == _line.editing._markers.length - 1 && _line.editing._markers.length > 1) $(marker._icon).addClass("end-icon");

            // bind popup
            var popup = document.createElement("div");
            popup.style.padding = '5px';

            var makeWaypointbutton = document.createElement("button");
            popup.appendChild(makeWaypointbutton);
            makeWaypointbutton.innerHTML = "make waypoint";
            makeWaypointbutton.addEventListener("click", function() {
                if (marker._index == 0 || marker._index == _line.editing._markers.length - 1) {
                    console.log("can't create waypoint on start point or end point")
                    return;
                }

                marker.closePopup();
                marker.unbindPopup();
                makeWaypoint(marker);
                marker.openPopup();

                updateElevationProfile();
                updateSegments();
                saveLinePoints();
            });

            var deleteButton = document.createElement("button");
            popup.appendChild(deleteButton);
            deleteButton.innerHTML = "delete";
            deleteButton.addEventListener("click", function() {
                if (_line.editing._markers.length == 1) {
                    console.log("can't delete only point");
                    return;
                }
                _line.editing._onMarkerClick({ target: marker });
                //makeRegularPoint(_line.editing._markers[marker._index + 1]);
                // todo: handle proper styling on delete. start/end points should be waypoints!
            });

            marker.bindPopup(popup, { closeButton: false });
        }

        function deleteWaypoint(marker) {
            makeRegularPoint(marker);
            updateElevationProfile();
            updateSegments();
            saveLinePoints();
        }

        var elevationProfilePoints;
        var lastLine;

        // todo: change name to "get terrain data" or something more descriptive like that
        function updateElevationProfile() {
            var points = _line._latlngs;

            // get line distance
            var distance = turf.lineDistance(turf.linestring(points.map(function(point) { return [point.lng,point.lat] })), 'kilometers');
            //console.log("DISTANCE: " + length);

            // sample every 10m
            var sampleCount = Math.round((distance * 1000) / 10);
            //console.log("SAMPLE COUNT: " + sampleCount);

            // keep track of original points
            for (var i = 0; i < points.length;i++) {
                points[i].original  = true;
            }

            // interpolate
            while ((points.length * 2) -1 <= sampleCount) { // 200
                points = interpolate(points);
            }

            //console.log("INTERPOLATED: " + points.length);
            //console.log(points);

            terrainLayer.getTerrainDataBulk(points, function(receivedPoints) {
                console.log("TERRAIN DATA DOWNLOAD COMPLETE!");
                if (!receivedPoints || receivedPoints.length == 0) return;

                // store elevation profile for later
                elevationProfilePoints = receivedPoints;

                // calculate route stats/time, etc.
                calculateRouteStats()

                // plot elevation profile
                plotElevationProfile();

                // add waypoints to elevation profile
                angular.forEach(_line.editing._markers,function(marker) {
                    if (marker.waypoint) elevationWidget.addWaypoint(marker._latlng);
                });

                saveLinePoints();

            });
        }

        function calculateRouteStats() {
            var points = elevationProfilePoints;
            if (!points) return;

            var totalDistance = 0;
            var totalTimeEstimateMinutes = 0;
            var originalIndex = 0;

            for (var i = 0; i < points.length; i++) {
                var point = points[i];

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
                    point.timeEstimateMinutes = (point.munterUnits / scope.munterRateUp) * 60;
                }
                else if (point.elevationDifference < 0) {
                    point.direction = "down";
                    point.verticalDown = Math.abs(point.elevationDifference);

                    point.munterUnits = segmentDistance + (point.verticalDown / 100);
                    point.timeEstimateMinutes = (point.munterUnits / scope.munterRateDown) * 60;
                }
                else {
                    point.direction = "flat";

                    point.munterUnits = segmentDistance;
                    var munter_rate_flat = (scope.munterRateUp + scope.munterRateDown) / 2;
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
                var terrainData = points[i];
                if (!terrainData || terrainData.lat == null || terrainData.lat == null) continue;

                if (!terrainData.elevation) terrainData.elevation = max_elevation;

                geoJSON.features[0].geometry.coordinates.push([
                    terrainData.lng,
                    terrainData.lat,
                    terrainData.elevation,
                    terrainData.slope,
                    snowpitExport.formatters.formatDirection(terrainData.aspect),
                    terrainData.totalTimeEstimateMinutes,
                    terrainData.totalDistance,
                    snowpitExport.formatters.formatDirection(terrainData.bearing)
                ]);
            }

            if (lastLine) _map.removeLayer(lastLine);
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
          //       console.log(data.results);

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
          //       }).addTo(_map);
          //   })

      // });

        var elevationWidget;
        function createElevationProfileWidget() {

            if (elevationWidget) {
                elevationWidget.clear();
                elevationWidget.removeFrom(_map);
            }
            elevationWidget = L.control.elevation({
                position: "topright",
                theme: "steelblue-theme", //default: lime-theme
                imperial: Global.user.settings.elevation == 1, // true
                width: 670,
                height: 180,
                margins: {
                    top: 24,
                    right: 20,
                    bottom: 30,
                    left: 50
                },
                useHeightIndicator: true, //if false a marker is drawn at map position
                interpolation: "linear", //see https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
                hoverNumber: {
                    decimalsX: 3, //decimals on distance (always in km)
                    decimalsY: 0, //deciamls on height (always in m)
                    formatter: undefined //custom formatter function may be injected
                },
                xTicks: undefined, //number of ticks in x axis, calculated by default according to width
                yTicks: undefined, //number of ticks on y axis, calculated by default according to height
            });
            elevationWidget.addTo(_map);
        }

        function downloadGPX() {
            var minlat = '40.59382';
            var minlon = '-111.65113';

            var maxlat = '40.6090005';
            var maxlon = '-111.60976';

            // calculate bounds
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < _line.editing._markers.length; i++) {
                var thisPoint = _line.editing._markers[i];
                bounds.extend(new google.maps.LatLng(thisPoint._latlng.lat, thisPoint._latlng.lng));
            }
            console.log("BOUNDS:");
            console.log(bounds);

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
            // for (var i = 0; i < _line.editing._markers.length; i++) {
            //     var thisPoint = _line.editing._markers[i];
            //     if (thisPoint.waypoint) {
            //         gpx +=  '  <wpt lat="' + thisPoint._latlng.lat + '" lon="' + thisPoint._latlng.lng + '">\n' +
            //                 '    <name><![CDATA[' + thisPoint.waypoint.name + ']]></name>\n' +
            //                 '    <desc><![CDATA[]]></desc>\n' +
            //                 '  </wpt>\n';
            //     }
            // }


            // route start
            gpx +=  '<rte>' +
                    '<name><![CDATA[]]></name>\n' +
                    '<desc><![CDATA[]]></desc>\n' +
                    '<src>AllTrails</src>\n';

            // route points
            for (var i = 0; i < _line.editing._markers.length; i++) {
                var thisPoint = _line.editing._markers[i];
                //if (thisPoint.waypoint) legIndex++;
                gpx += '    <rtept lat="' + thisPoint._latlng.lat + '" lon="' + thisPoint._latlng.lng + '">\n';
                if (thisPoint.waypoint) {
                    gpx += '      <name><![' + thisPoint.waypoint.name + ']]></name>\n';
                }
                gpx += '    </rtept>\n';
            }

            // route end
            gpx += '  </rte>\n';

            // end GPX
            gpx += '</gpx>';

            console.log(gpx);

            var gpxData = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpx);
            var link = document.createElement('a');
            angular.element(link)
                .attr('href', gpxData)
                .attr('download', 'avanet-route.gpx');
            link.click();
        }

        // todo: save as geoJSON?
        function saveRoute() {
            // var markers = _line.editing._markers;
            // console.log(markers);

            // console.log("MARKERS:");

            // angular.forEach(markers, function(marker) {
            //     var obj = {}
            //     obj.latlng = marker._latlng;
            //     obj.waypoint = marker.waypoint;
            //     console.log(obj);
            // })
        }

        // UTILS

        function getAverage(list, property) {
            var sum = 0;
            for (var i = 0; i < list.length; i++) {
                var val = list[i][property];
                if (!!val) sum += val;
            }
            return sum / list.length;
        }
        function getMin(list, property) {
            var min = 9999;
            for (var i = 0; i < list.length; i++) {
                var val = list[i][property];
                if (!!val) min = Math.min(min, val);
            }
            return min;
        }
        function getMax(list, property) {
            var max = 0;
            for (var i = 0; i < list.length; i++) {
                var val = list[i][property];
                if (!!val) max = Math.max(max, val);
            }
            return max;
        }
        function getSum(list, property) {
            var sum = 0;
            for (var i = 0; i < list.length; i++) {
                var val = list[i][property];
                if (!!val) sum += val;
            }
            return sum;
        }
    }
}
});