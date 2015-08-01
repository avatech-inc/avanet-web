

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
            // setTimeout(function(){
            //     lineEdited();
            // }, 100)
        });

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

            var layers = featureGroup._layers;
            var line = layers[Object.keys(layers)[0]];

            for (var i = 0; i < line.editing._poly._latlngs.length - 1; i++) {
                var thisPoint = line.editing._poly._latlngs[i];
                var nextPoint = line.editing._poly._latlngs[i + 1];

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

                    addPoint(newPoint, e.target.segment.index + 1);
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
            var layers = featureGroup._layers;
            var line = layers[Object.keys(layers)[0]];

            if (index == null) index = line.editing._poly._latlngs.length;

            // // find nearest point on line
            // if (middle) {
            //     // var result = null,
            //     //     d = Infinity;

            //     // //angular.forEach(line.editing._poly._latlngs, function(item) {
            //     // for (var i = 0; i < line.editing._poly._latlngs.length; i++) {
            //     //     var item = line.editing._poly._latlngs[i];

            //     //     var distance = turf.distance(
            //     //             turf.point([item.lng,item.lat]),
            //     //             turf.point([latlng.lng,latlng.lat]),
            //     //             "kilometers");

            //     //     if (distance < d) {
            //     //         d = distance;
            //     //         index = i;
            //     //     }
            //     // }
            //     // // we now have the index of the cloest point,

            //     // console.log("RESULT: " + index);
            //     // var point = latlng;
            //     // var points = line.editing._poly._latlngs;
            //     var min_distance1 = 0;
            //     var min_distance2 = 0;

            //     var index1;
            //     var index2;

            //     for (var i = 0; i < line.editing._poly._latlngs.length - 1; i++) {
            //         //if (i < points.length - 2) {
            //         var thisPoint = line.editing._poly._latlngs[i];
            //         var nextPoint = line.editing._poly._latlngs[i + 1];

            //         var distance1 = turf.distance(
            //                 turf.point([latlng.lng,latlng.lat]),
            //                 turf.point([thisPoint.lng,thisPoint.lat]),
            //                 "kilometers");
            //         min_distance1 = Math.min(min_distance1, distance1);
            //                if (distance < d) {
            //             d = distance;
            //             index = i;
            //         }

            //         var distance2 = turf.distance(
            //                 turf.point([latlng.lng,latlng.lat]),
            //                 turf.point([nextPoint.lng,nextPoint.lat]),
            //                 "kilometers");
            //         min_distance2 = Math.min(min_distance2, distance2);


            //             // if (min_distance > L.LineUtil.pointToSegmentDistance( point, points[i], points[i + 1] ) ) {
            //             //     min_distance = L.LineUtil.pointToSegmentDistance( point, points[i], points[i + 1] );
            //             //     min_offset = i;
            //             // }
            //         //}
            //     }
            //     console.log("FOUND? " + index1 + "/" + index2);
            // }

            // find nearest, 'index' is the one NEXT in the list 

            line.editing._poly.spliceLatLngs(index, 0, latlng);
            line.editing._markers.splice(index, 0, line.editing._createMarker(latlng));

            // line.editing._markers.push(line.editing._createMarker(latlng));
            // //line.editing._poly.addLatLng(latlng);
            // line.editing._poly._latlngs.push(L.latLng(latlng));

            line.editing._poly.redraw();

            // before calling updateMarkers, keep track of where waypoints are
            // note: if we ever implement arbitrary new point placement (commented out above)
            // then this might not work properly, since we're using index to keep track
            var waypoints = {};
            //angular.forEach(line.editing._markers,function(marker) {
            for (var i = 0; i < line.editing._markers.length; i++) {
                var marker = line.editing._markers[i];
                if (marker.waypoint) waypoints[i] = true;
            }

            // call updateMarkers to reload points
            line.editing.updateMarkers();

            // re-load waypoints
            angular.forEach(line.editing._markers,function(marker) {
                // start point
                // if (marker._index == 0) $(marker._icon).addClass("start-icon");
                // // finish point
                // if (marker._index == line.editing._markers.length - 1) $(marker._icon).addClass("finish-icon");

                // waypoints
                if (waypoints[marker._index]) {
                    marker.waypoint = true;
                    //$(marker._icon).addClass("waypoint-icon");

                    // add to elevation profile
                    //elevationWidget.addWaypoint(marker._latlng);
                }
            });

            updateMarkers();
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
                var line = L.polyline([e.latlng], {}).addTo(_map);
                featureGroup.addLayer(line);
                editHandler.enable();
                editMode = true;

                // start icon
                $(line.editing._markers[0]).addClass("start-icon");

                // when line is edited (after point is dragged)
                line.on('edit', function(e) {
                    // prevent addition of new points for 1 second after moving point
                    // to prevent accidental addition of new point
                    preventEdit = true;
                    setTimeout(function() { preventEdit = false }, 1000);

                    updateElevationProfile();
                    updateSegments();
                });
            }
        });
    

        function makeWaypoint(marker) {
            marker.waypoint = true;

            // add marker css class
            $(marker._icon).addClass("waypoint-icon");

            // bind popup
            marker.unbindPopup();
            marker.bindPopup("MARKER " + marker._index + "<br/><i>this is a</i> <b>test</>");

            // add to elevation profile
            elevationWidget.addWaypoint(marker._latlng);
        }

        function updateMarkers() {
            var layers = featureGroup._layers;
            var line = layers[Object.keys(layers)[0]];

            angular.forEach(line.editing._markers,function(marker) {
                // remove existing marker click events (which will delete the marker)
                marker.off('click');

                // if marker is already a waypoint, make it a waypoint
                if (marker.waypoint) makeWaypoint(marker);
                // otherwise, bind waypoint/delete button popup
                else {
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
                        line.editing._onMarkerClick({ target: marker });
                         //marker.on('click', line.editing._onMarkerClick, line.editing);
                    });

                    marker.bindPopup(popup, { closeButton: false });
                }
            });

        }
        

        var lastLine;
        function updateElevationProfile() {

            var layers = featureGroup._layers;
            var line = layers[Object.keys(layers)[0]];
            var points = line._latlngs;

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
                angular.forEach(line.editing._markers,function(marker) {
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