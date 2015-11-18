
angular.module('avatech').controller('ProfilePreviewController',
    function ($scope, $rootScope, $location, $state, $stateParams, snowpitExport, snowpitViews, FontLoader, Global, Lightbox, $http) {

        $rootScope.$broadcast('resizeMap');

        $scope.global = Global;

        $scope.discussMode = false;

        $scope.go = function(url) {
            $location.path(url);
        }
        // // formatters
        // $scope.formatters = snowpitExport.formatters;
        

        // views

        $scope.views = snowpitViews;
        $scope.setView = function(view) {
            // calculate views
            angular.forEach($scope.views,function(view){ if (view.func) view.func($scope); });
            // set view
            $scope.settings.view = view;
        }
        $scope.getView = function() {
            var _view = null;
            angular.forEach($scope.views, function(view){ if (view.id == $scope.settings.view) _view = view; });
            return _view;
        }

        // snowpit canvas settings
        $scope.graphWidth = 180;
        $scope.columns = [
            { width: 125 },
            { width: 25 },
            { width: $scope.graphWidth },
            { width: 240 }
        ];
        $scope.snowpitWidth = $scope.columns.reduce(function(a,b){ return { width: a.width + b.width}; }).width;
        $scope.snowpitHeight = 500;
        $scope.canvasOptions = { labelColor: "#222", commentLineColor: "#aaa", dashedLineColor: "#ddd", showDepth: true, showDensity: true };
        $scope.settings = {
            selectedLayer: null,
            dragging: null,
            hoverDragLayer: null,
            view: null,
            depthDescending: true,
            fontsLoaded: false,
            tempMode: false,
            tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
        }


        if ($stateParams.profileId) {
            $scope.profileId = $stateParams.profileId;
            // load profile
            //Profiles.get({ profileId: $stateParams.profileId }, function(profile) {
            $http.get(window.apiBaseUrl + "observations/" + $stateParams.profileId)
            .then(function(res) {
                var profile = res.data;

                // broadcast so map can show location
                $rootScope.$broadcast('profileLoaded', profile);

                // normalize temps
                angular.forEach(profile.temps, function(temp) { 
                    var num = parseFloat(temp.temp);
                    if (!isNaN(num)) temp.temp = num * 2;
                });

                // make sure fonts are loaded so canvas renders them
                var fontLoader = new FontLoader(["Roboto Condensed","snowsymbols"], {
                    "fontsLoaded": function(error) {
                        if (error !== null) {
                            // Reached the timeout but not all fonts were loaded
                            console.log(error.message);
                            console.log(error.notLoadedFontFamilies);
                        } else {
                            // All fonts were loaded
                            console.log("all fonts were loaded");
                        }

                        //$scope.settings.fontsLoaded = true;
                        $scope.profile = angular.copy(profile);
                        $scope.$apply();
                    }
                    //, "fontLoaded": function(fontFamily) {
                    //     // One of the fonts was loaded
                    //     console.log("font loaded: " + fontFamily);
                    // }
                }, 3000);
                fontLoader.loadFonts();

            });
        }

        // $scope.showPhoto = function(index) {
        //     Lightbox.openModal($scope.profile.photos, index);
        // }

        $scope.exportPDF = function() { snowpitExport.PDF($scope.profile, $scope.settings); };
        $scope.exportJPEG = function() { snowpitExport.JPEG($scope.profile, $scope.settings); };
        $scope.exportCSV = function() { snowpitExport.CSV($scope.profile); };

        // $scope.close = function () {
        //     $rootScope.$broadcast('resizeMap');
        //     $state.go('^');
        // };
    }
);