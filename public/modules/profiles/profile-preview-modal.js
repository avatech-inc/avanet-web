
angular.module('avatech').controller('ProfilePreviewModalController', [ '$scope','$modalInstance', 'profileId', 'Profiles', 'snowpitExport', 'snowpitViews', 'FontLoader', 'Global', 'Lightbox',
    function ($scope, $modalInstance, profileId, Profiles, snowpitExport, snowpitViews, FontLoader, Global, Lightbox) {

        $scope.global = Global;

        $scope.map = null;

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

        // formatters
        $scope.formatters = snowpitExport.formatters;
        
        // snowpit canvas settings
        $scope.graphWidth = 253;
        $scope.columns = [
            { width: 130 },
            { width: 27 },
            { width: $scope.graphWidth },
            { width: 240 }
        ];
        $scope.snowpitWidth = $scope.columns.reduce(function(a,b){ return { width: a.width + b.width}; }).width;
        $scope.snowpitHeight = 560;
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


        if (profileId) {
            $scope.profileId = profileId;
            Profiles.get({ profileId: profileId }, function(profile) {
                console.log(profile);

                // normalize temps
                angular.forEach(profile.temps, function(temp) { 
                    var num = parseFloat(temp.temp);
                    if (!isNaN(num)) temp.temp = num * 2;
                });

                //$scope.profile = angular.copy(profile);
                console.log("loaded!");


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

        $scope.showPhoto = function(index) {
            Lightbox.openModal($scope.profile.photos, index);
        }

        $scope.exportPDF = function() { snowpitExport.PDF($scope.profile, $scope.settings); };
        $scope.exportJPEG = function() { snowpitExport.JPEG($scope.profile, $scope.settings); };
        $scope.exportCSV = function() { snowpitExport.CSV($scope.profile); };

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        // $scope.select = function () {
        //     //$modalInstance.close($scope.form.location);
        // };
    }
])