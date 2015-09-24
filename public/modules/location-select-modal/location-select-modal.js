angular.module('avatech').factory('LocationSelectModal', [ '$modal',
    function ($modal) {

        return { open: function(options) {

            var modalInstance = $modal.open({
                templateUrl: '/modules/location-select-modal/location-select-modal.html',
                controller: 'LocationSelectModalController',
                backdrop: 'static',
                windowClass: 'width-680',
                resolve: {
                    initialLocation: function () {
                      return options.initialLocation
                    }
                }
            });

            return modalInstance.result;

        }
    } }
]);

angular.module('avatech').controller('LocationSelectModalController', [ '$scope','$modalInstance', 'initialLocation', 'Global',
    function ($scope, $modalInstance, initialLocation, Global) {

        $scope.global = Global;

        $scope.map = null;

        $scope.form = {};

        // $modalInstance.opened.then(function(){ });

        $scope.loadMap = function(){
            // mapbox uses lat/lng, DB uses lng/lat
            if (initialLocation) initialLocation = [ parseFloat(initialLocation[1]), parseFloat(initialLocation[0])];
            else if (!initialLocation) {
                // set to either park city or user's location
                if (!$scope.global.user.location) initialLocation = [40.633052,-111.7111795]
                else initialLocation = [$scope.global.user.location[1],$scope.global.user.location[0]];
            }

            setTimeout(function(){
                $scope.map = L.mapbox.map('map_location','andrewsohn.ihk2g12l', {
                    zoomControl: false,
                    tileLayer: {
                        //continuousWorld: false,
                        //noWrap: true
                    }
                });

                $scope.map.on('drag',function() {
                    if ($scope.marker) $scope.marker.setLatLng($scope.map.getCenter());
                    var m = $scope.map.getCenter().wrap();
                    $scope.setLocation(m.lat, m.lng);
                    $scope.invalidLat = false;
                    $scope.invalidLng = false;
                    $scope.invalidE = false;
                    $scope.invalidN = false;
                    $scope.$apply();
                });

                // add zoom control
                new L.Control.Zoom({ position: 'bottomright' }).addTo($scope.map);

                // set starting location and zoom
                $scope.map.setView(initialLocation, 10, { animate: false });
                $scope.map.invalidateSize();
                $scope.setLocation(initialLocation[0], initialLocation[1]);

                $scope.$apply();
            },100);
        }

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.select = function () {
            $modalInstance.close($scope.form.location);
        };

        // on map search select
        $scope.mapSearchSelect = function(location) {
            if (location.lat && location.lng) {
                $scope.map.setView([location.lat,location.lng], 12,{ animate: false });
                $scope.setLocation(location.lat, location.lng);
            }
        }

        $scope.form.coordSystem = Global.user.settings.coordSystem;
        $scope.$watch("form.coordSystem", function() {
            if (!$scope.form.location) return;
            $scope.setLocation($scope.form.location[1], $scope.form.location[0]);
        }, true);

        $scope.zones = [];
        for (var i = 1; i <= 60; i++) {
            $scope.zones.push(i);
        }

        $scope.setLocation = function(lat, lng) {
            $scope.form.location = [ lng, lat ];

            if ($scope.form.coordSystem == "dd") {

                if (!$scope.decimalDegrees) $scope.decimalDegrees = {};
                $scope.decimalDegrees.lat = parseFloat(lat.toFixed(5));
                $scope.decimalDegrees.lng = parseFloat(lng.toFixed(5));

            }
            else if ($scope.form.coordSystem == "utm") {

                // convert lat decimal degrees to UTM band
                var band = (lat > 0) ? "N" : "S";

                // get UTM
                var zone = Math.floor((lng + 180.0) / 6) + 1;
                var xy = new Array(2);
                LatLonToUTMXY (DegToRad(lat), DegToRad(lng), zone, xy);

                // set UTM
                if (!$scope.utm) $scope.utm = {};
                $scope.utm.zone = zone;
                $scope.utm.hemisphere = (lat > 0) ? "N" : "S";
                $scope.utm.e = parseInt(xy[0].toFixed(0));
                $scope.utm.n = parseInt(xy[1].toFixed(0));
            }
        }

        var utm_timer;
        $scope.$watch("utm", function(){
            if (utm_timer) clearTimeout(utm_timer);
            utm_timer = setTimeout(function(){
                if (!$scope.utm || $scope.utm.zone === null) return;

                // validate
                if ($scope.utm.e.length > 8 || isNaN(parseFloat($scope.utm.e))) $scope.invalidE = true;
                else $scope.invalidE = false;
                if ($scope.utm.n.length > 8 || isNaN(parseFloat($scope.utm.n))) $scope.invalidN = true;
                else $scope.invalidN = false;
                if ($scope.invalidE || $scope.invalidN) return;

                // conver to lat/lng
                var latlng = new Array(2);
                UTMXYToLatLon($scope.utm.e, $scope.utm.n, $scope.utm.zone, $scope.utm.hemisphere === "S", latlng);
                
                var lat = RadToDeg(latlng[0]);
                var lng = RadToDeg(latlng[1]);

                console.log([ lat, lng ]);

                $scope.invalidLat = false;
                $scope.invalidLng = false;

                $scope.form.location = [ lng, lat ];
                // center map
                $scope.map.setView({ lat: lat, lng: lng }, $scope.map.getZoom(), { animate: true });
                $scope.$apply();
            }, 100);
        }, true);

        var dd_timer;
        $scope.$watch("decimalDegrees", function() {
            if (dd_timer) clearTimeout(dd_timer);
            dd_timer = setTimeout(function(){
                if (!$scope.decimalDegrees) return;

                var lat = parseFloat($scope.decimalDegrees.lat);
                var lng = parseFloat($scope.decimalDegrees.lng);

                // validate
                if (isNaN(lat) || lat < -90 || lat > 90) $scope.invalidLat = true;
                else $scope.invalidLat = false;
                if (isNaN(lng) || lng < -180 || lng > 180)  $scope.invalidLng = true;
                else $scope.invalidLng = false;
                if ($scope.invalidLat || $scope.invalidLng) return;

                $scope.form.location = [ lng, lat ];
                // center map
                $scope.map.setView({ lat: lat, lng: lng }, $scope.map.getZoom(), { animate: true });
                $scope.$apply();
            }, 100);
        }, true);

    }
])