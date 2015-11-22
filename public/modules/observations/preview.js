angular.module('avatech').controller('ObservationPreviewController',
    function ($scope, $rootScope, $location, $state, $stateParams, snowpitExport, snowpitViews, FontLoader, Global, $http, Lightbox, ngAudio, Confirm, Observations) {

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

        $scope.showMedia = function(media) {
            // clear audio
            var non_audio_media = [];
            angular.forEach($scope.observation.media, function(m){
                if (m.type == "photo" || m.type == "video")
                    non_audio_media.push(m);
            });
            // get index
            var index = non_audio_media.indexOf(media);

            // show media
            if (media.type == "photo" || media.type == "video") {
                Lightbox.openModal(non_audio_media, index);
            }
            else if (media.type == "audio") {
                // if already loaded, toggle pause/play
                if ($scope.audio && $scope.audio.id == media.URL) {
                    if ($scope.audio.paused) $scope.audio.play();
                    else $scope.audio.pause();
                }
                // load and play
                else {
                    $scope.audio = ngAudio.load(media.URL);
                    console.log($scope.audio);
                    $scope.audio.play();
                }
            }
        }

        $scope.getThumbnailURL = function(media) {
            if (media.type == "photo") {
                url = media.URL;
                if (url.indexOf("cloudinary.com") > -1) {
                    var filename = media.URL.substr(media.URL.indexOf("upload/") + 7);
                    filename = filename.substring(filename.indexOf("/") + 1, filename.indexOf("."));
                    url = "http://res.cloudinary.com/avatech/image/upload/w_300/" + filename + ".jpg";
                }
                return url;
            }
            else if (media.type == "video") {
                var filename = media.URL.substr(media.URL.indexOf("upload/") + 7);
                filename = filename.substring(filename.indexOf("/") + 1, filename.indexOf("."));
                var url = "http://res.cloudinary.com/avatech/video/upload/so_50p/" + filename + ".jpg";
                return url;
            }
        }

        $scope.delete = function() {
            Confirm.open("Are you sure you want to delete this observation? This will also delete it from your Avanet mobile apps.").then(function() {
                Observations.remove($scope.observation);
                $scope.close();
            });
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

        // snowpit views
        $scope.views = snowpitViews;
        $scope.setView = function(view) {
            // calculate views
            angular.forEach($scope.views,function(view){ if (view.func) view.func($scope.observation); });
            // set view
            $scope.settings.view = view;
        }
        $scope.getView = function() {
            var _view = null;
            angular.forEach($scope.views, function(view){ if (view.id == $scope.settings.view) _view = view; });
            return _view;
        }

        // snowpit canvas settings
        $scope.graphWidth = 200;
        $scope.columns = [
            { width: 125 },
            { width: 25 },
            { width: $scope.graphWidth },
            { width: 150 }
        ];
        $scope.snowpitWidth = $scope.columns.reduce(function(a,b){ return { width: a.width + b.width}; }).width;
        $scope.snowpitHeight = 550;
        $scope.canvasOptions = { labelColor: "#222", commentLineColor: "#aaa", dashedLineColor: "#ddd", showDepth: true, showDensity: true, 
            drawGrainSize: false,
            drawWaterContent: false, 
            drawSurfaceLabel: false
        };
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

        $scope.exportPDF = function() { snowpitExport.PDF($scope.observation, $scope.settings); };
        $scope.exportJPEG = function() { snowpitExport.JPEG($scope.observation, $scope.settings); };
        $scope.exportCSV = function() { snowpitExport.CSV($scope.observation); };

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
            ["windLoading", "Wind loading", {
                "PREV": "Previous",
                "CUR": "Current"
                }],
            ["windVariability", "Wind windVariability",{
                "CON":"Consistent",
                "VAR":"Variable"
                }],
            ["spatialExtent", "Spatial extent",{
                "LOC":"Localized",
                "WIDE":"Widespread"
                }],
            ["windSpeedEstimated", "Wind speed estimated",{
                "C":"Calm",
                "L":"Light",
                "M":"Moderate",
                "S":"Strong",
                "X":"Extreme",
                }],
            ["windSpeedMeasured", "Wind speed measured", "windSpeed"],
            ["windDirectionEstimated", "Wind direction estimated", "direction"], 
            ["blowingSnowDirection", "Blowing snow direction", "direction"],
            ["blowingSnowExtent", "Blowing snow extent",{
                "NONE": "NONE",
                "PREV": "PREV",
                "L": "Light",
                "M": "Moderate",
                "I": "Intense",
                "U": "Unkown"
                }]
          ],
          "observation_weather": [
            ["precipitationRate", "Precip. rate",{
                "S-1":"S-1/RV VERY LIGHT",
                "S1":"S1/RL LIGHT",
                "S2":"S2/RM MODERATE",
                "S5":"S5/RH HEAVY",
                "S10":"S10 VERY HEAVY"
                }],
            ["precipitationType", "Precip. type",{
                "NO":"NONE",
                "RA":"RAIN",
                "SN":"SNOW",
                "RS":"RAIN & SNOW",
                "GR":"HAIL",
                "ZR":"FREEZING RAIN",
                }],
            ["skyCondition", "Sky condition",{
                "CLR":"CLEAR",
                "FEW":"FEW",
                "SCT":"SCATTERED",
                "BKN":"BROKEN",
                "OVC":"OVERCAST",
                "X":"OBSCURED"
                }],
            ["barometricPressure", "Barometric pressure", "mb"],
            ["pressureTrend", "Pressure trend",{
                "RR":"RISING RAPIDLY",
                "R":"RISING",
                "S":"STEADY",
                "F":"FALLING",
                "FR":"FALLING RAPIDLY"
                }],
            ["maxTemperature", "Max temp.", "temp"],
            ["minTemperature", "Min temp.", "temp"],
            ["presentTemperature", "Present temp.", "temp"],
            ["relativeHumidity", "Relative humidity", "percent"],
            ["thermographTemperature", "Thermograph temp.", "temp"],
            ["thermographTrend", "Thermograph trend",{
                "RR":"RISING RAPIDLY",
                "R":"RISING",
                "S":"STEADY",
                "F":"FALLING",
                "FR":"FALLING RAPIDLY"
                }]
          ],
          "observation_snowpack-test": [
            ["name", "Test Type",{
                "ECT":"EXTENDED COLUMN",
                "CT":"COMPRESSION",
                "RB":"RUTSCHBLOCK",
                "SB":"STUFFBLOCK",
                "STE":"SHOVEL SHEAR",
                "DPT":"DEEP TAP",
                "PST":"PROPAGATION SAW",
                "HTE":"HAND SHEAR",
                "SVT":"SHOVEL TILT"
                }],
            ["score", "Score"],
            ["shear", "Shear quality"],
            ["fractureCharacter", "Fracture character",{
                "SP":"Sudden planar",
                "SC":"Sudden collapse",
                "RP":"Resistant planar",
                "PC":"Progressive Compression",
                "BRK":"Break",
                }],
            ["nbTaps", "Number of taps"],
            ["isolatedColumnLength", "Isolated column length", "cm"],
            ["sawCutLength", "Saw cut length", "cm"],
            ["weakLayerDepth", "Weak layer depth", "cm"],
            ["criticalGrainForm", "Critical grain type","grainType"],
            ["criticalGrainSizeMax", "Critical grain size (max)", "mm"],
            ["criticalGrainSizeMin", "Critical grain size (min)", "mm"],
          ],
          "observation_snowpack": [
            ["snowQuality", "Snow quality",{
                "POW":"POWDER",
                "CRUD":"CRUD",
                "CRUST":"CRUSTY",
                "HARD":"HARD",
                "SLUSH": "SLUSHY",
                "SPRING":"SPRING SNOW"
                }],
            ["surfaceGrainForm", "Surface grain type", "grainType"],
            ["cracking", "Cracking","bool"],
            ["whumpfing", "Whumpfing","bool"],
            ["footPenetration", "Foot pen.", "cm"],
            ["skiPenetration", "Ski pen.", "cm"],
            ["snowPackDepthEstimate", "Snowpack depth estimate", "cm"],
            ["newSnowDepthEstimate", "New snow depth estimate", "cm"],
            ["surfaceGrainSizeMax", "Surface grain size (max)", "mm"],
            ["surfaceGrainSizeMin", "Surface grain size (min)", "mm"],
            ["surfaceTemperature", "Surface temp.", "temp"],
            ["twentyCMTemperature", "20 cm. temp.", "temp"]
          ]}

          $scope.getTable = function(ob) {
            if (!ob) return [];
            var table = [];
            var items = schema["observation_" + ob.type];
            if (items) {

                for (var i = 0; i < items.length; i++) {
                    var key = items[i][0];
                    var desc = items[i][1];
                    var dataType = items[i][2];

                    var val = ob[key];
                    if (val !== null && val !== undefined) {
                        // if enum
                        if (dataType !== null && typeof dataType === 'object') {
                            var enumVal = dataType[val];
                            if (enumVal) val = enumVal;
                        }
                        // if bool
                        else if (dataType == "bool") {
                            if (val === true) val = "Yes";
                            if (val === false) val = "No";
                        }
                        // temp
                        else if (dataType == "temp") {
                            val = $scope.formatters.formatTemp(val);
                        }
                        // direction
                        else if (dataType == "direction") {
                            val = $scope.formatters.formatDirection(val);
                        }
                        // cm
                        else if (dataType == "cm") {
                            val = $scope.formatters.formatCmOrIn(val);
                        }
                        // percent
                        else if (dataType == "percent") {
                            val += "%";
                        }
                        // millibars (barometric pressure)
                        else if (dataType == "mb") {
                            val += " mb";
                        }
                        // mm (for grain size at the moment, no conversion to imperial needed)
                        else if (dataType == "mm") {
                            val += " mm";
                        }
                        // wind speed (m/s and mi/h)
                        else if (dataType == "windSpeed") {
                            val = $scope.formatters.formatWindSpeed(val);
                        }
                        // grain type
                        else if (dataType == "grainType") {
                            val = $scope.formatters.formatGrainType(val);
                        }

                        table.push({ key: key, description: desc, value: val });
                    }
                }

            }
            return table;
          }

        // load observation

        if ($stateParams.observationId) {
            $scope.profileId = $stateParams.observationId;
            $http.get(window.apiBaseUrl + "observations/" + $stateParams.observationId)
            .then(function(res) {

                var ob = res.data;
                    
                // broadcast so map can show location
                $rootScope.$broadcast('observationLoaded', ob);

                $scope.table = $scope.getTable(ob);

                if ($scope.observation == "snowpit") {

                    var _ob = angular.copy(ob);

                    // normalize temps
                    angular.forEach(_ob.temps, function(temp) { 
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
                            $scope.observation = angular.copy(_ob);
                            $scope.$apply();
                        }
                    }, 3000);
                    fontLoader.loadFonts();
                }
                // all other observation types
                else {
                    $scope.observation = ob;
                }

            });
        }
    }
);