angular.module('avatech').factory('routePlanning', function (Global) { 

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
            // todo: wtf???
            // new_points[i] = { lat: middlePoint.A, lng: middlePoint.F }
            new_points[i] = { lat: middlePoint.G, lng: middlePoint.K }
        }
  }

    return new_points;
}

return {
    init: function(_map, terrainLayer) {

        _map.on('zoomend', function(e) {
            //plotElevationProfile();
        });

        var _line;

        // the feature group holder for the route
        var featureGroup = L.featureGroup().addTo(_map);
        // Leaflet.Draw edit handler for custom edit/draw functionality
        var editHandler = new L.EditToolbar.Edit(_map, {
            featureGroup: featureGroup,
            selectedPathOptions: {
                color: 'blue'
            }
        });

        // keep track of line segments (point-to-point line segments, not route segments)
        var lineSegmentGroup = L.featureGroup().addTo(_map);
        var segments = [];
        function updateSegments() {
            segments = [];
            lineSegmentGroup.clearLayers();

            for (var i = 0; i < _line.editing._poly._latlngs.length - 1; i++) {
                var thisPoint = _line.editing._poly._latlngs[i];
                var nextPoint = _line.editing._poly._latlngs[i + 1];

                var segmentData = {
                    start: thisPoint,
                    end: nextPoint,
                    index: i
                };
                segments.push(segmentData);

                var segment = L.polyline([thisPoint, nextPoint], {
                    color: 'transparent',
                    weight: 12 // allows for a wider clickable area
                });
                segment.segment = segmentData;

                // add new point when clicking on the line
                segment.on('mousedown', function(e){
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
                });
                segment.on('mouseout', function(e) {
                    if (elevationWidget) elevationWidget.highlight();
                });

                lineSegmentGroup.addLayer(segment);
            }
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
                if (marker.waypoint) waypoints[i] = true;
            }

            // call updateMarkers to reload points
            _line.editing.updateMarkers();

            angular.forEach(_line.editing._markers,function(marker) {
                // start point
                // if (marker._index == 0) $(marker._icon).addClass("start-icon");
                // // finish point
                // if (marker._index == line.editing._markers.length - 1) $(marker._icon).addClass("finish-icon");

                // if waypoint
                if (waypoints[marker._index]) makeWaypoint(marker);
                // regular point
                else makeRegularPoint(marker);
            });

            updateElevationProfile();
            updateSegments();
        }

        var editMode = false;
        var preventEdit = false;
        _map.on('click', function(e) {
            // if editing existing line, create new point at the end of the line
            if (editMode) {
                if (preventEdit) return;
                addPoint(e.latlng);
            }
            // if creating first point
            else {
                _line = L.polyline([e.latlng], {}).addTo(_map);
                featureGroup.addLayer(_line);
                editHandler.enable();
                editMode = true;

                // start icon
                $(_line.editing._markers[0]).addClass("start-icon");

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
        });

        function makePoint(marker) {
            // remove existing marker events
            marker.off('click');
            marker.off('mouseover');
            marker.off('mouseout');

            // elevation widget highlight
            marker.on('mouseover', function(e) {
                if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
            });
            marker.on('mouseout', function(e) {
                if (elevationWidget) elevationWidget.highlight();
            });
        }
    

        function makeWaypoint(marker) {
            makePoint(marker);

            marker.waypoint = true;

            // add marker css class
            $(marker._icon).addClass("waypoint-icon");

            // bind popup
            marker.unbindPopup();

            var popup = document.createElement("div");
            popup.style.padding = '5px';

            var deleteaypointbutton = document.createElement("button");
            popup.appendChild(deleteaypointbutton);
            deleteaypointbutton.innerHTML = "delete waypoint";
            deleteaypointbutton.addEventListener("click", function() {
                marker.closePopup();
                marker.unbindPopup();
                deleteWaypoint(marker);
            });

            marker.bindPopup(popup, { closeButton: false });

            // add to elevation profile
            elevationWidget.addWaypoint(marker._latlng);
        }
        function makeRegularPoint(marker) {
            makePoint(marker);

            // remove existing marker click events
            marker.off('click');

            if (marker.waypoint) delete marker.waypoint;

            // remove waypoint css class (if exists)
            $(marker._icon).removeClass("waypoint-icon");

            // bind popup
            var popup = document.createElement("div");
            popup.style.padding = '5px';

            var makeWaypointbutton = document.createElement("button");
            popup.appendChild(makeWaypointbutton);
            makeWaypointbutton.innerHTML = "make waypoint";
            makeWaypointbutton.addEventListener("click", function() {
                marker.closePopup();
                marker.unbindPopup();
                makeWaypoint(marker);
            });

            var deleteButton = document.createElement("button");
            popup.appendChild(deleteButton);
            deleteButton.innerHTML = "delete";
            deleteButton.addEventListener("click", function() {
                _line.editing._onMarkerClick({ target: marker });
                 //marker.on('click', line.editing._onMarkerClick, line.editing);
            });

            marker.bindPopup(popup, { closeButton: false });
        }

        function deleteWaypoint(marker) {
            makeRegularPoint(marker);
            updateElevationProfile();
        }

        var lastLine;
        function updateElevationProfile() {
            var points = _line._latlngs;

            // get distance
            var _points = points.map(function(point) { return [point.lng,point.lat] });
            var linestring = turf.linestring(_points);
            var length = turf.lineDistance(linestring, 'kilometers');
            console.log("LINE LENGTH: " + length);

            // sample every 10m
            var sampleCount = Math.round((length * 1000) / 10);

            //console.log("SAMPLE COUNT: " + sampleCount);

            // interpolate
            while ((points.length * 2) -1 <= sampleCount) { // 200
                points = interpolate(points);
            }

            //console.log("INTERPOLATED: " + points.length);

            terrainLayer.getTerrainDataBulk(points, function(receivedPoints) {
                console.log("DOWNLOAD COMPLETE!!!");
                if (!receivedPoints || receivedPoints.length == 0) return;

                plotElevationProfile(receivedPoints);

                // add waypoints to elevation profile
                angular.forEach(_line.editing._markers,function(marker) {
                    if (marker.waypoint) elevationWidget.addWaypoint(marker._latlng);
                });

            });
        }

        function plotElevationProfile(points) {
            if (!points) return;

            var geoJSON = {
                "name":"NewFeatureType",
                "type":"FeatureCollection",
                "features":[
                {
                    "type":"Feature",
                    "geometry": {
                        "type":"LineString",
                        "coordinates":[]
                    },
                    "properties": null
                }
            ]};
            geoJSON.features[0].geometry.coordinates = [];

            for (var i = 0; i < points.length; i++) {
                var terrainData = points[i];
                if (!terrainData || terrainData.lat == null || terrainData.lat == null || terrainData.elevation == null) continue;

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
            });//.addTo(_map);
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
        }
    }

});