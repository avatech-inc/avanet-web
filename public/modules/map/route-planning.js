angular.module('avatech').directive('routePlanning', function($http, $timeout) {
  return {
    restrict: 'E',
    scope: { 
      map: '=',
      terrainLayer: '=',
      route: '=',
      hoverOnLegMap: '=',
      hoverOnLeg: '=',

      hoverOnPointMap: '=',
      hoverOnPoint: '='
    },
    link: function(scope, element) {

        scope.$watch("hoverOnLeg", function(){
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
                    //     turf.point([newPoint.lat,newPoint.lng])
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
                var legPoints = [];

                var totalVerticalUp = 0;
                var totalVerticalDown = 0;

                var verticalUp = 0;
                var verticalDown = 0;
                var startElevation;
                for (var i = 0; i < _line.editing._markers.length; i++) {
                    var thisPoint = _line.editing._markers[i];

                    if (i == 0 && thisPoint.terrain) startElevation = thisPoint.terrain.elevation;

                    var pointDetails = {
                        lat: thisPoint._latlng.lat,
                        lng: thisPoint._latlng.lng,
                        waypoint: thisPoint.waypoint,
                        terrain: thisPoint.terrain
                    };

                    // keep track of all points in this leg
                    legPoints.push([thisPoint._latlng.lng, thisPoint._latlng.lat]);

                    // keep track of leg terrain stats
                    if (thisPoint.terrain) {
                        verticalUp += thisPoint.terrain.verticalUp;
                        verticalDown += thisPoint.terrain.verticalDown;

                        totalVerticalUp += thisPoint.terrain.verticalUp;
                        totalVerticalDown += thisPoint.terrain.verticalDown;
                    }   

                    if (thisPoint.waypoint || i == _line.editing._markers.length - 1) {
                        var leg = {};
                        leg.index = legIndex;
                        legIndex++;

                        // get distance
                        leg.distance = turf.lineDistance(turf.linestring(legPoints), 'kilometers');


                        if (thisPoint.terrain) {
                            // vertical up/down
                            leg.verticalUp = verticalUp;
                            leg.verticalDown = verticalDown;

                            // elevation change
                            leg.elevationChange = thisPoint.terrain.elevation - startElevation;
                        }

                        pointDetails.leg = leg;

                        // reset for next leg
                        if (thisPoint.terrain) startElevation = thisPoint.terrain.elevation;
                        legPoints = [[thisPoint._latlng.lng, thisPoint._latlng.lat]];
                        verticalUp = 0;
                        verticalDown = 0;
                    }
                    
                    scope.route.points.push(pointDetails);
                }

                // route terrain stats
                if (thisPoint.terrain) {
                    scope.route.terrain.distance = _line.editing._markers[_line.editing._markers.length - 1].terrain.totalDistance;
                    scope.route.terrain.verticalUp = totalVerticalUp;
                    scope.route.terrain.verticalDown = totalVerticalDown;
                    scope.route.terrain.elevationChange = 
                        _line.editing._markers[_line.editing._markers.length - 1].terrain.elevation -
                        _line.editing._markers[0].terrain.elevation ;
                }
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
            saveLinePoints();
        }

        var preventEdit = false;
        _map.on('click', function(e) {
            if (preventEdit) return;
            // // if editing existing line, create new point at the end of the line
            // if (_line) {
            //     addPoint(e.latlng);
            // }
            // // if creating first point
            // else {
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
                    saveLinePoints();
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

            var deleteaypointbutton = document.createElement("button");
            popup.appendChild(deleteaypointbutton);
            deleteaypointbutton.innerHTML = "delete waypoint";
            deleteaypointbutton.addEventListener("click", function() {
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
                if (marker._index == 0) {
                    console.log("can't create waypoint on start point")
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
                _line.editing._onMarkerClick({ target: marker });
            });

            marker.bindPopup(popup, { closeButton: false });
        }

        function deleteWaypoint(marker) {
            makeRegularPoint(marker);
            updateElevationProfile();
            updateSegments();
            saveLinePoints();
        }

        var lastLine;
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

                // plot profile
                plotElevationProfile(receivedPoints);

                // add waypoints to elevation profile
                angular.forEach(_line.editing._markers,function(marker) {
                    if (marker.waypoint) elevationWidget.addWaypoint(marker._latlng);
                });

                // store terrain data
                var originalIndex = 0;
                var verticalUp = 0;
                var verticalDown = 0;
                var previousElevation = 0;
                var totalDistance = 0;
                for (var i = 0; i < receivedPoints.length; i++) {
                    var terrainData = receivedPoints[i];

                    if (i > 0) {
                        // keep track of vertical up/down
                        var previousElevation = receivedPoints[i-1].elevation;
                        var elevationDifference =  terrainData.elevation - previousElevation;
                        if (elevationDifference > 0) verticalUp += elevationDifference;
                        else if (elevationDifference < 0) verticalDown += Math.abs(elevationDifference);

                        // keep track of distance
                        totalDistance += turf.lineDistance(turf.linestring([
                            [receivedPoints[i-1].lng, receivedPoints[i-1].lat],
                            [terrainData.lng, terrainData.lat]
                        ]), 'kilometers');
                    }

                    if (terrainData.original) {
                        var marker = _line.editing._markers[originalIndex];
                        marker.terrain = {
                            elevation: terrainData.elevation,
                            slope: terrainData.slope,
                            aspect: terrainData.aspect,

                            verticalUp: verticalUp,
                            verticalDown: verticalDown,

                            totalDistance: totalDistance
                        };
                        // reset for next
                        verticalUp = 0;
                        verticalDown = 0;
                        originalIndex++;
                    }
                }

                saveLinePoints();

            });
        }

        function plotElevationProfile(points) {
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
                    terrainData.slope
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
                imperial: false, // true
                width: 700,
                height: 180,
                margins: {
                    top: 10,
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
                collapsed: false    //collapsed mode, show chart on click or mouseover
            });
            elevationWidget.addTo(_map);
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
    }
}
});