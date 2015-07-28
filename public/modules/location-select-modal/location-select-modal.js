angular.module('avatech').factory('LocationSelectModal', [ '$modal',
    function ($modal) {

        return { open: function(options) {

            var modalInstance = $modal.open({
                templateUrl: '/modules/location-select-modal/location-select-modal.html',
                controller: 'LocationSelectModalController',
                backdrop: 'static',
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
            if (initialLocation) initialLocation = [ initialLocation[1], initialLocation[0]];
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

                $scope.map.on('move',function(){
                    if ($scope.marker) $scope.marker.setLatLng($scope.map.getCenter());
                    //$scope.form.location = [ m.lng, m.lat ];
                    $scope.$apply();
                });
                $scope.map.on('moveend',function(){
                    var m = $scope.map.getCenter().wrap();
                    $scope.form.location = [ m.lng, m.lat ];
                    $scope.$apply();
                });

                // add zoom control
                new L.Control.Zoom({ position: 'bottomright' }).addTo($scope.map);

                // set starting location and zoom
                $scope.map.setView(initialLocation, 10);
                $scope.map.invalidateSize();

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
            if (location.lat && location.lng)
                $scope.map.setView([location.lat,location.lng], 12,{ animate: true});
        }

    }
])