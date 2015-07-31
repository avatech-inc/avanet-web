

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

        function addPoint(latlng, middle) {
            var layers = featureGroup._layers;
            var line = layers[Object.keys(layers)[0]];

            var index = line.editing._poly._latlngs.length;

            // find nearest point on line
            // if (middle) {
            //     var result = null,
            //         d = Infinity;

            //     //angular.forEach(line.editing._poly._latlngs, function(item) {
            //     for (var i = 0; i < line.editing._poly._latlngs.length; i++) {
            //         var item = line.editing._poly._latlngs[i];

            //         var distance = turf.distance(
            //                 turf.point([item.lng,item.lat]),
            //                 turf.point([latlng.lng,latlng.lat]),
            //                 "kilometers");

            //         if (distance < d) {
            //             d = distance;
            //             index = i;
            //         }
            //     }

            //     console.log("RESULT: " + index);
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
            angular.forEach(line.editing._markers,function(marker) {
                if (marker.waypoint) waypoints[marker._index] = true;
            });

            // call updateMarkers to reload points
            line.editing.updateMarkers();

            // re-load waypoints
            angular.forEach(line.editing._markers,function(marker) {
                // start point
                if (marker._index == 0) $(marker._icon).addClass("start-icon");
                // finish point
                if (marker._index == line.editing._markers.length - 1) $(marker._icon).addClass("finish-icon");

                if (waypoints[marker._index]) {
                    marker.waypoint = true;
                    $(marker._icon).addClass("waypoint-icon");
                }
            });
        }

        var _line;
        var editMode = false;
        var preventEdit = false;
        _map.on('click', function(e) {
            // if editing existing line, create new point at the end of the line
            if (editMode) {
                if (preventEdit) return;
                addPoint(e.latlng);
                lineEdited();
            }
            // if creating first point
            else {
                var newLayer = L.polyline([e.latlng], {}).addTo(_map);
                featureGroup.addLayer(newLayer);
                editHandler.enable();
                editMode = true;

                // start icon
                $(newLayer.editing._markers[0]).addClass("start-icon");

                // when line is edited (after point is dragged)
                newLayer.on('edit', function(e) {
                    // prevent addition of new points for 1 second after moving point
                    // to prevent accidental addition of new point
                    preventEdit = true;
                    setTimeout(function() { preventEdit = false }, 1000);

                    var layers = featureGroup._layers;
                    var line = layers[Object.keys(layers)[0]];
                    lineEdited();
                });

                // newLayer.on('click', function(e){
                //     console.log("CLICK");
                //     addPoint(e.latlng, true);
                // });

                // elevation widget highlight
                newLayer.on('mousemove', function(e){
                    if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
                });
                newLayer.on('mouseout', function(e){
                    if (elevationWidget) elevationWidget.highlight();
                });
            }
        });

        var lastLine;
        function lineEdited() {

            var layers = featureGroup._layers;
            var line = layers[Object.keys(layers)[0]];
            var points = line._latlngs;

            angular.forEach(line.editing._markers,function(marker) {
                // remove existing marker click events (which will delete the marker)
                marker.off('click');
                marker.on('click',function(e){
                    console.log("clicked on a marker without deleting!!!");
                    console.log(e);
                    console.log(this);

                    this.waypoint = true;
                    $(this._icon).addClass("waypoint-icon");
                });
                // re-enable delete
                //marker.on('click', line.editing._onMarkerClick, line.editing);

                // if marker is a waypoint, make sure it has css class
                // console.log("MARKER:");
                // console.log(marker);
                // if (marker.waypoint) {
                //     console.log("waypoint!!!");
                //     $(marker._icon).addClass("waypoint-icon");
                // }
            });

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

                // // remove outliers
                // for (var i = 1; i < receivedPoints.length - 1; i++) {
                //     var previousPoint = receivedPoints[i - 1];
                //     var thisPoint = receivedPoints[i];
                //     var nextPoint = receivedPoints[i+1];

                //     if (!nextPoint || !thisPoint) continue;

                //     if (thisPoint.elevation == null && previousPoint.elevation != null) {
                //         thisPoint.elevation = previousPoint.elevation;
                //     }
                //     else if (thisPoint.elevation == null && nextPoint.elevation != null) {
                //         thisPoint.elevation = nextPoint.elevation;
                //     }
                //     if (nextPoint.elevation == null && thisPoint.elevation != null) {
                //         nextPoint.elevation = thisPoint.elevation;
                //     }

                //     var distance = turf.distance(
                //         turf.point([thisPoint.lng,thisPoint.lat]),
                //         turf.point([nextPoint.lng,nextPoint.lat]),
                //         "kilometers");
                //     distance *= 1000; // convert from km to meters

                //     var elevationDiff = Math.abs(thisPoint.elevation - nextPoint.elevation);
                //     if (elevationDiff > 0) {
                //         var slope  = Math.round(Math.atan(elevationDiff / distance) * (180/Math.PI));
                //         var slopeDiff = Math.abs(((thisPoint.slope + nextPoint.slope) / 2) - slope);
                //         //var slopeDiff2 = nextPoint.slope - slope;
                //         //console.log("DIFF: " + elevationDiff + " / " + slope + " / " + slopeDiff);

                //         // outlier
                //         if (slope > 60 && slopeDiff > 40) {
                //             console.log("OUTLIER CORRECTED!");
                //             thisPoint.elevation = previousPoint.elevation;
                //         }
                //     }
                // }
                plotElevationProfile(receivedPoints);
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