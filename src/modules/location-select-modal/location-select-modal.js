
import './location-select-modal.html'

export const LocationSelect = ['$uibModal', $uibModal => ({
    open: options => {
        let modalInstance = $uibModal.open({
            templateUrl: '/modules/location-select-modal/location-select-modal.html',
            controller: 'LocationSelectModalController',
            backdrop: 'static',
            windowClass: 'width-680',
            resolve: {
                initialLocation: () => options.initialLocation
            }
        })

        return modalInstance.result
    }
})]

export const LocationSelectController = [
    '$scope',
    '$timeout',
    '$uibModalInstance',
    'initialLocation',
    'Global',

    (
        $scope,
        $timeout,
        $uibModalInstance,
        initialLocation,
        Global
    ) => {
        $scope.global = Global
        $scope.form = {}
        $scope.mapHolder = {}
        $scope.coords = {}

        // $uibModalInstance.opened.then(function(){ });

        let mapChangeTimer

        let mapChange = () => {
            if (mapChangeTimer) $timeout.cancel(mapChangeTimer)

            mapChangeTimer = $timeout(() => {
                if ($scope.marker) {
                    $scope.marker.setLatLng($scope.mapHolder.map.getCenter())
                    $scope.marker.bringToFront()
                }

                let m = $scope.mapHolder.map.getCenter().wrap()

                $scope.setLocation(m.lat, m.lng)
                $scope.invalidLat = false
                $scope.invalidLng = false
                $scope.invalidE = false
                $scope.invalidN = false

                // $scope.$apply();
            }, 50)
        }

        let loadMap = () => {
            let initLoc

            // leaflet uses lat/lng, DB uses lng/lat
            if (initialLocation) {
                initLoc = [
                    parseFloat(initialLocation[1]),
                    parseFloat(initialLocation[0])
                ]
            } else {
                // set to either park city or user's location
                if (!$scope.global.user.location) {
                    initLoc = [40.633052, -111.7111795]
                } else {
                    initLoc = [
                        $scope.global.user.location[1],
                        $scope.global.user.location[0]
                    ]
                }
            }

            // $scope.mapHolder.map.on('drag', mapChange);
            $scope.mapHolder.map.on('moveend', mapChange)

            // set starting location and zoom
            $scope.mapHolder.map.setView(initLoc, 10, { animate: false })
            $scope.mapHolder.map.invalidateSize()
            $scope.setLocation(
                initLoc[0],
                initLoc[1]
            )
        }

        let mapWatcher = $scope.$watch('mapHolder.map', () => {
            if ($scope.mapHolder.map) {
                // unregister watch
                mapWatcher()
                // go
                loadMap()
            }
        })

        $scope.close = () => $uibModalInstance.dismiss()
        $scope.select = () => $uibModalInstance.close($scope.form.location)
        $scope.form.coordSystem = Global.user.settings.coordSystem

        $scope.$watch('form.coordSystem', () => {
            if (!$scope.form.location) return

            $scope.setLocation(
                $scope.form.location[1],
                $scope.form.location[0]
            )
        }, true)

        $scope.zones = []

        for (let i = 1; i <= 60; i++) {
            $scope.zones.push(i)
        }

        $scope.setLocation = (lat, lng) => {
            $scope.form.location = [lng, lat]

            if ($scope.form.coordSystem === 'dd') {
                if (!$scope.coords.decimalDegrees) {
                    $scope.coords.decimalDegrees = {}
                }

                $scope.coords.decimalDegrees.lat = parseFloat(lat.toFixed(5))
                $scope.coords.decimalDegrees.lng = parseFloat(lng.toFixed(5))
            } else if ($scope.form.coordSystem === 'utm') {
                // get UTM
                let utm = UTM.latLonToUTMXY(
                    UTM.degToRad(lat),
                    UTM.degToRad(lng)
                )

                // set UTM
                if (!$scope.coords.utm) {
                    $scope.coords.utm = {}
                }

                $scope.coords.utm.zone = utm.zone
                $scope.coords.utm.hemisphere = (lat > 0) ? 'N' : 'S'
                $scope.coords.utm.e = parseInt(utm.x.toFixed(0), 10)
                $scope.coords.utm.n = parseInt(utm.y.toFixed(0), 10)
            }
        }

        let utmTimer

        $scope.$watch('coords.utm', () => {
            if (utmTimer) clearTimeout(utmTimer)

            utmTimer = setTimeout(() => {
                if (!$scope.coords.utm || $scope.coords.utm.zone === null) return

                // validate
                if ($scope.coords.utm.e.length > 8 || isNaN(parseFloat($scope.coords.utm.e))) {
                    $scope.invalidE = true
                } else {
                    $scope.invalidE = false
                }

                if ($scope.coords.utm.n.length > 8 || isNaN(parseFloat($scope.coords.utm.n))) {
                    $scope.invalidN = true
                } else {
                    $scope.invalidN = false
                }

                if ($scope.invalidE || $scope.invalidN) return

                // conver to lat/lng
                let latlng = UTM.utmXYToLatLon(
                    $scope.coords.utm.e,
                    $scope.coords.utm.n,
                    $scope.coords.utm.zone,
                    $scope.coords.utm.hemisphere === 'S'
                )

                let lat = UTM.radToDeg(latlng.lat)
                let lng = UTM.radToDeg(latlng.lng)

                $scope.invalidLat = false
                $scope.invalidLng = false

                $scope.form.location = [lng, lat]

                // center map
                $scope.mapHolder.map.setView(
                    {
                        lat: lat,
                        lng: lng
                    },
                    $scope.mapHolder.map.getZoom(),
                    {
                        animate: true
                    }
                )

                $scope.$apply()
            }, 100)
        }, true)

        let ddTimer

        $scope.$watch('coords.decimalDegrees', () => {
            if (ddTimer) clearTimeout(ddTimer)

            ddTimer = setTimeout(() => {
                if (!$scope.coords.decimalDegrees) return

                let lat = parseFloat($scope.coords.decimalDegrees.lat)
                let lng = parseFloat($scope.coords.decimalDegrees.lng)

                // validate
                if (isNaN(lat) || lat < -90 || lat > 90) {
                    $scope.invalidLat = true
                } else {
                    $scope.invalidLat = false
                }

                if (isNaN(lng) || lng < -180 || lng > 180) {
                    $scope.invalidLng = true
                } else {
                    $scope.invalidLng = false
                }

                if ($scope.invalidLat || $scope.invalidLng) return

                $scope.form.location = [lng, lat]

                // center map
                $scope.mapHolder.map.setView(
                    {
                        lat: lat,
                        lng: lng
                    },
                    $scope.mapHolder.map.getZoom(),
                    {
                        animate: true
                    }
                )

                $scope.$apply()
            }, 100)
        }, true)
    }
]
