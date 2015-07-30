

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
            }
        });


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


        var lastLine;
        function lineEdited(latlngs) {
            var layers = featureGroup._layers;
            var line = layers[Object.keys(layers)[0]];
            var latlngs = line._latlngs;

             var points = [];

               for (var i = 0; i < latlngs.length; i++) {
                   points.push(latlngs[i]);
              }

              while ((points.length * 2) -1 <= 200) { // 200
                points = interpolate(points);
              }

              for (var i = 0; i < points.length; i++) {
                points[i].lat = Math.round(points[i].lat * 1e5) / 1e5;
                points[i].lng = Math.round(points[i].lng * 1e5) / 1e5;

                // initiate querying if lat/lng isn't already in cache
                var terrainData = terrainLayer.terrainDataCache[points[i].lat + "_" + points[i].lng];
                if (!terrainData) terrainLayer.initiateGetTerrainData(points[i].lat, points[i].lng);
              }

              // todo: using setTimeout is a pretty kludgey way to do this...
              setTimeout(function() {

                    geoJSON.features[0].geometry.coordinates = [];

                    for (var i = 0; i < points.length; i++) {
                        var terrainData = terrainLayer.terrainDataCache[points[i].lat + "_" + points[i].lng];
                        if (terrainData) {
                            geoJSON.features[0].geometry.coordinates.push([
                                points[i].lng,
                                points[i].lat,
                                terrainData.elevation
                            ]);
                        }
                    }


                    if (lastLine) _map.removeLayer(lastLine);
                    createElevationProfileWidget();

                    lastLine = L.geoJson(geoJSON,{
                        style: {
                            color: 'transparent'
                        },
                        onEachFeature: elevationWidget.addData.bind(elevationWidget) //working on a better solution
                    }).addTo(_map);

              }, 1000);

                // var lat = Math.round(lat * 1e5) / 1e5;
                // var lng = Math.round(lng * 1e5) / 1e5;

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
                imperial: true,
                width: 600,
                height: 125,
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