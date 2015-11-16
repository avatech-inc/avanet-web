angular.module('avatech').factory('LocationSelectModal', function ($modal) {
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
}
});

angular.module('avatech').controller('LocationSelectModalController',
    function ($scope, $timeout, $modalInstance, initialLocation, Global) {

        $scope.global = Global;

        $scope.form = {};
        $scope.mapHolder = {};
        $scope.coords = {};

        // $modalInstance.opened.then(function(){ });

        var mapWatcher = $scope.$watch('mapHolder.map', function() {
            if ($scope.mapHolder.map) {
                // unregister watch
                mapWatcher();
                // go
                loadMap();
            }
        });

        function mapChange() {
            $timeout(function(){
                if ($scope.marker) {
                    $scope.marker.setLatLng($scope.mapHolder.map.getCenter());
                    $scope.marker.bringToFront();
                }
                var m = $scope.mapHolder.map.getCenter().wrap();
                $scope.setLocation(m.lat, m.lng);
                $scope.invalidLat = false;
                $scope.invalidLng = false;
                $scope.invalidE = false;
                $scope.invalidN = false;
            });
        }

        function loadMap() {
            // leaflet uses lat/lng, DB uses lng/lat
            if (initialLocation) initialLocation = [ parseFloat(initialLocation[1]), parseFloat(initialLocation[0])];
            else if (!initialLocation) {
                // set to either park city or user's location
                if (!$scope.global.user.location) initialLocation = [40.633052,-111.7111795]
                else initialLocation = [$scope.global.user.location[1],$scope.global.user.location[0]];
            }

            $scope.mapHolder.map.on('drag', mapChange);
            $scope.mapHolder.map.on('moveend', mapChange);

            // set starting location and zoom
            $scope.mapHolder.map.setView(initialLocation, 10, { animate: false });
            $scope.mapHolder.map.invalidateSize();
            $scope.setLocation(initialLocation[0], initialLocation[1]);
        }

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.select = function () {
            $modalInstance.close($scope.form.location);
        };

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

                if (!$scope.coords.decimalDegrees) $scope.coords.decimalDegrees = {};
                $scope.coords.decimalDegrees.lat = parseFloat(lat.toFixed(5));
                $scope.coords.decimalDegrees.lng = parseFloat(lng.toFixed(5));

            }
            else if ($scope.form.coordSystem == "utm") {
                // get UTM
                var utm = LatLonToUTMXY(DegToRad(lat), DegToRad(lng));

                // set UTM
                if (!$scope.coords.utm) $scope.coords.utm = {};
                $scope.coords.utm.zone = utm.zone;
                $scope.coords.utm.hemisphere = (lat > 0) ? "N" : "S";
                $scope.coords.utm.e = parseInt(utm.x.toFixed(0));
                $scope.coords.utm.n = parseInt(utm.y.toFixed(0));
            }
        }

        var utm_timer;
        $scope.$watch("coords.utm", function(){
            if (utm_timer) clearTimeout(utm_timer);
            utm_timer = setTimeout(function(){
                if (!$scope.coords.utm || $scope.coords.utm.zone === null) return;

                // validate
                if ($scope.coords.utm.e.length > 8 || isNaN(parseFloat($scope.coords.utm.e))) $scope.invalidE = true;
                else $scope.invalidE = false;
                if ($scope.coords.utm.n.length > 8 || isNaN(parseFloat($scope.coords.utm.n))) $scope.invalidN = true;
                else $scope.invalidN = false;
                if ($scope.invalidE || $scope.invalidN) return;

                // conver to lat/lng
                var latlng = UTMXYToLatLon($scope.coords.utm.e, $scope.coords.utm.n, $scope.coords.utm.zone, $scope.coords.utm.hemisphere === "S");
                
                var lat = RadToDeg(latlng.lat);
                var lng = RadToDeg(latlng.lng);

                console.log([ lat, lng ]);

                $scope.invalidLat = false;
                $scope.invalidLng = false;

                $scope.form.location = [ lng, lat ];
                // center map
                $scope.mapHolder.map.setView({ lat: lat, lng: lng }, $scope.mapHolder.map.getZoom(), { animate: true });
                $scope.$apply();
            }, 100);
        }, true);

        var dd_timer;
        $scope.$watch("coords.decimalDegrees", function() {
            if (dd_timer) clearTimeout(dd_timer);
            dd_timer = setTimeout(function(){
                if (!$scope.coords.decimalDegrees) return;

                var lat = parseFloat($scope.coords.decimalDegrees.lat);
                var lng = parseFloat($scope.coords.decimalDegrees.lng);

                // validate
                if (isNaN(lat) || lat < -90 || lat > 90) $scope.invalidLat = true;
                else $scope.invalidLat = false;
                if (isNaN(lng) || lng < -180 || lng > 180)  $scope.invalidLng = true;
                else $scope.invalidLng = false;
                if ($scope.invalidLat || $scope.invalidLng) return;

                $scope.form.location = [ lng, lat ];
                // center map
                $scope.mapHolder.map.setView({ lat: lat, lng: lng }, $scope.mapHolder.map.getZoom(), { animate: true });
                $scope.$apply();
            }, 100);
        }, true);

    }
);