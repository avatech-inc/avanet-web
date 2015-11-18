angular.module('avatech').controller('ObservationPreviewController',
    function ($scope, $rootScope, $location, $state, $stateParams, snowpitExport, snowpitViews, FontLoader, Global, $http) { //Lightbox

        $rootScope.$broadcast('resizeMap');

        $scope.global = Global;

        $scope.formatters = snowpitExport.formatters;

        $scope.discussMode = false;

        $scope.close = function () {
            $rootScope.$broadcast('resizeMap');
            $state.go('^');
        };

        $scope.go = function(url) {
            $location.path(url);
        }

        $scope.showPhoto = function(index) {
            //Lightbox.openModal($scope.observation.photos, index);
        }

        // ------------------------------------------------------------------------------------------
        // AVALANCHE

        $scope.avalancheTypes = {
            "": "",
            "U": "Unkown",
            "L": "Loose-snow avalanche",
            "WL": "Wet loose-snow avalanche",
            "SS": "Soft slab avalanche",
            "HS": "Hard slab avalanche",
            "WS": "Wet slab avalanche",
            "I": "Ice fall or avalanche",
            "SF": "Slush flow",
            "C": "Cornice fall",
            "R": "Roof avalanche"
        };
        $scope.avalancheTriggers = {
            "N": "Natural or Spontaneous",
            "A": "Artificial",
            "U": "Unkown",
        };
        $scope.artificialTriggers = {
            "Explosive": [
                { code: "AA", name: "Artillery" },
                { code: "AE", name: "Explosive thrown or placed on or under snow surface by hand" },
                { code: "AL", name: "Avalauncher" },
                { code: "AB", name: "Explosive detonated above snow surface (air blast)" },
                { code: "AC", name: "Cornice fall triggered by human or explosive action" },
                { code: "AX", name: "Gas exploder" },
                { code: "AH", name: "Explosives placed via helicopter" },
                { code: "AP", name: "Pre-placed, remotely detonated explosive charge" }
            ],
            "Vehicle": [
                { code: "AM", name: "Snowmobile" },
                { code: "AK", name: "Snowcat" },
                { code: "AV", name: "Other Vehicle" } //specify
            ],
            "Human": [
                { code: "AS", name: "Skier" },
                { code: "AR", name: "Snowboarder" },
                { code: "AI", name: "Snowshoer" },
                { code: "AF", name: "Foot penetration" },
                //{ code: "AC", name: "Cornice fall produced by human or explosive action" }
            ],
            "Miscellaneous": [
                { code: "AW", name: "Wildlife" },
                { code: "AU", name: "Unknown artificial trigger" },
                { code: "AO", name: "Unclassified artificial trigger" } //specify
            ]
        };
        $scope.naturalTriggers = [
            { code: "N", name: "Natural trigger" },
            { code: "NC", name: "Cornice fall" },
            { code: "NE", name: "Earthquake" },
            { code: "NI", name: "Ice fall" },
            { code: "NL", name: "Avalanche triggered by loose snow avalanche" },
            { code: "NS", name: "Avalanche triggered by slab avalanche" },
            { code: "NR", name: "Rock fall" },
            { code: "NO", name: "Unclassified natural trigger" } // specify
        ];

        $scope.getTriggerNames = function(triggerCodes) {
            var names = "";
            if (!triggerCodes || !triggerCodes.length) return "";

            for(var i = 0; i < triggerCodes.length; i++) {
                var _name = $scope.getTriggerName(triggerCodes[i]);
                if (_name) names += _name + ", ";
            }
            if (names.length > 2) names = names.substring(0,names.length-2);

            return names;
        }

        $scope.getTriggerName = function(triggerCode) {
            if (!$scope.observation.trigger) return "";
            var name = "";
            if ($scope.observation.trigger == 'A') {
                angular.forEach($scope.artificialTriggers,function(triggers, triggerCategory){
                    angular.forEach(triggers, function(trigger){
                        if (trigger.code == triggerCode) return name = triggerCategory + ": " + trigger.name;
                    });
                });
            }
            else if ($scope.observation.trigger == 'N') {
                angular.forEach($scope.naturalTriggers,function(trigger){
                    if (trigger.code == triggerCode) return name = trigger.name;
                });
            }
            return name;
        }


        // ------------------------------------------------------------------------------------------
        // SNOWPIT

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

        $scope.exportPDF = function() { snowpitExport.PDF($scope.profile, $scope.settings); };
        $scope.exportJPEG = function() { snowpitExport.JPEG($scope.profile, $scope.settings); };
        $scope.exportCSV = function() { snowpitExport.CSV($scope.profile); };

        // --------------------------------------------------------------------------------
        // SP PROFILES

        // detail level
        $scope.detailLevel = $scope.global.user.settings.graphDetailLevel;
        if ($scope.detailLevel == null) $scope.detailLevel = 1;

        $scope.toggleDetail = function() {
            $scope.detailLevel++;
            if ($scope.detailLevel == 6) $scope.detailLevel = 1;
            // save to user settings
            $scope.global.setUserSetting("graphDetailLevel", $scope.detailLevel);
        }

        // --------------------------------------------------------------------------------
        
        // "SCHEMA"

        var schema = {
        "observation_wind": [
            ["windLoading", "Wind loading"],
            ["windVariability", "Wind windVariability"],
            ["spatialExtent", "Spatial extent"],
            ["windSpeedEstimated", "Wind speed estimated"],
            ["windSpeedMeasured", "Wind speed measured"],
            ["windDirectionEstimated", "Wind direction estimated"],
            ["blowingSnowDirection", "Blowing snow direction"],
            ["blowingSnowExtent", "Blowing snow extent"]
          ],
          "observation_weather": [
            ["precipitationRate", "Precip. rate"],
            ["precipitationType", "Precip. type"],
            ["skyCondition", "Sky condition"],
            ["barometricPressure", "Barometric pressure"],
            ["pressureTrend", "Pressure trend"],
            ["maxTemperature", "Max temp."],
            ["minTemperature", "Min temp."],
            ["presentTemperature", "Present temp."],
            ["relativeHumidity", "Relative humidity"],
            ["thermographTemperature", "Thermograph temp."],
            ["thermographTrend", "Thermograph trend"]
          ],
          "observation_snowpack-test": [
            ["name", "Test Type"],
            ["score", "Score"],
            ["shear", "Shear quality"],
            ["fractureCharacter", "Fracture character"],
            ["nbTaps", "Number of taps"],
            ["isolatedColumnLength", "Isolated column length"],
            ["sawCutLength", "Saw cut length"],
            ["weakLayerDepth", "Weak layer depth"],
            ["criticalGrainForm", "Critical grain type"],
            ["criticalGrainSizeMax", "Critical grain size (max)"],
            ["criticalGrainSizeMin", "Critical grain size (min)"],
          ],
          "observation_snowpack": [
            ["snowQuality", "Snow quality"],
            ["surfaceGrainForm", "Surface grain type"],
            ["cracking", "Cracking"],
            ["whumpfing", "Whumpfing"],
            ["footPenetration", "Foot pen."],
            ["skiPenetration", "Ski pen."],
            ["snowPackDepthEstimate", "Snowpack depth estimate"],
            ["newSnowDepthEstimate", "New snow depth estimate"],
            ["surfaceGrainSizeMax", "Surface grain size (max)"],
            ["surfaceGrainSizeMin", "Surface grain size (min)"],
            ["surfaceTemperature", "Surface temp."],
            ["twentyCMTemperature", "20 cm. temp."]
          ]}

          $scope.getTable = function(ob) {
            if (!ob) return [];
            var table = [];
            var items = schema["observation_" + ob.type];
            if (items) {

                for (var i = 0; i < items.length; i++) {
                    var key = items[i][0];
                    var desc = items[i][1];

                    var inOb = ob[key];
                    if (inOb) table.push({ key: key, description: desc, value: inOb });
                }

            }
            return table;
          }


        // views

        // $scope.views = snowpitViews;
        // $scope.setView = function(view) {
        //     // calculate views
        //     angular.forEach($scope.views,function(view){ if (view.func) view.func($scope); });
        //     // set view
        //     $scope.settings.view = view;
        // }
        // $scope.getView = function() {
        //     var _view = null;
        //     angular.forEach($scope.views, function(view){ if (view.id == $scope.settings.view) _view = view; });
        //     return _view;
        // }
        
        // // snowpit canvas settings
        // $scope.graphWidth = 180;
        // $scope.columns = [
        //     { width: 125 },
        //     { width: 25 },
        //     { width: $scope.graphWidth },
        //     { width: 240 }
        // ];
        // $scope.snowpitWidth = $scope.columns.reduce(function(a,b){ return { width: a.width + b.width}; }).width;
        // $scope.snowpitHeight = 500;
        // $scope.canvasOptions = { labelColor: "#222", commentLineColor: "#aaa", dashedLineColor: "#ddd", showDepth: true, showDensity: true };
        // $scope.settings = {
        //     selectedLayer: null,
        //     dragging: null,
        //     hoverDragLayer: null,
        //     view: null,
        //     depthDescending: true,
        //     fontsLoaded: false,
        //     tempMode: false,
        //     tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
        // }


        if ($stateParams.observationId) {
            $scope.profileId = $stateParams.observationId;
            // load profile
            //Profiles.get({ profileId: $stateParams.profileId }, function(profile) {
            $http.get(window.apiBaseUrl + "observations/" + $stateParams.observationId)
            .then(function(res) {

                var ob = res.data;
                    
                // // broadcast so map can show location
                // $rootScope.$broadcast('profileLoaded', profile);

                $scope.table = $scope.getTable(ob);

                if ($scope.observation == "snowpit") {

                    var profile = angular.copy(ob);

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
                            $scope.observation = angular.copy(profile);
                            $scope.$apply();
                        }
                        //, "fontLoaded": function(fontFamily) {
                        //     // One of the fonts was loaded
                        //     console.log("font loaded: " + fontFamily);
                        // }
                    }, 3000);
                    fontLoader.loadFonts();

                }
                // all other observation types
                else {
                    $scope.observation = ob;
                }

            });
        }



        // 
        // $scope.exportPDF = function() { snowpitExport.PDF($scope.profile, $scope.settings); };
        // $scope.exportJPEG = function() { snowpitExport.JPEG($scope.profile, $scope.settings); };
        // $scope.exportCSV = function() { snowpitExport.CSV($scope.profile); };


    }
);