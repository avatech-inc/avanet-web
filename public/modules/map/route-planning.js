

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

        var _line;
        var editMode = false;
        var preventEdit = false;
        _map.on('click', function(e) {
            // if editing existing line
            if (editMode) {
                if (preventEdit) return;
                var layers = featureGroup._layers;
                var line = layers[Object.keys(layers)[0]];

                line.editing._markers.push(line.editing._createMarker(e.latlng));
                line.editing._poly.addLatLng(e.latlng);
                line.editing.updateMarkers();
                lineEdited();
            }
            // if creating first point
            else {
                var newLayer = L.polyline([e.latlng], {}).addTo(_map);
                featureGroup.addLayer(newLayer);
                editHandler.enable();
                editMode = true;

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

                newLayer.on('click', function(e){
                    console.log("CLICK");
                    console.log(e.latlng);
                    //elevationWidget.highlight(e.latlng);
                });
                newLayer.on('mouseover', function(e){
                    // console.log("CLICK");
                    // console.log(e.latlng);
                    if (elevationWidget) elevationWidget.highlight(e.latlng);
                });
            }
        });

        var lastLine;
        function lineEdited() {
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

            console.log("SAMPLE COUNT: " + sampleCount);

            // interpolate
            while ((points.length * 2) -1 <= sampleCount) { // 200
                points = interpolate(points);
            }

            console.log("INTERPOLATED: " + points.length);

            terrainLayer.getTerrainDataBulk(points, function(receivedPoints) {
                //receivedPoints.push(terrainData);
                //if (receivedPoints.length == points.length - 6) {
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
                //}
            });

              //  for (var i = 0; i < points.length; i++) {
              //       point_string += points[i].lng + "," + points[i].lat + ";";
              // }

              // point_string = point_string.substring(0,point_string.length-1);

              // $.getJSON("http://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points=" +
              //   point_string 
              //   + "&access_token=pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0.q_Esm5hrpZLbl1XQERtKpg", function(data) {
              //       //console.log(data.results);

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
              //   });

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
                // style: {
                //     color: 'transparent'
                // },
                onEachFeature: elevationWidget.addData.bind(elevationWidget) //working on a better solution
            });//.addTo(_map);
        }

      // var lastLine;
      // var lastLayer;
      // _map.on('draw:created', function(e) {
      //     if (lastLayer) featureGroup.removeLayer(lastLayer);
      //     if (lastLine) _map.removeLayer(lastLine);

      //     lastLayer = e.layer;
      //     console.log(e.layer);
      //     featureGroup.addLayer(e.layer);

      //     editToolbar.enable();

      //     //createElevationProfileWidget();

          // var points = [];

          // var point_string = "";
          //  for (var i = 0; i < e.layer._latlngs.length; i++) {
          //      points.push(e.layer._latlngs[i]);
          // }

          // while ((points.length * 2) -1 <= 200) {
          //   points = interpolate(points);
          // }

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