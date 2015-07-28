// angular.module('avatech').factory('LocationSelectModal', [ '$modal',
//     function ($modal) {

//         return { open: function(options) {

//             var modalInstance = $modal.open({
//                 templateUrl: '/modules/location-select-modal/location-select-modal.html',
//                 controller: 'LocationSelectModalController',
//                 backdrop: 'static',
//                 resolve: {
//                     initialLocation: function () {
//                       return options.initialLocation
//                     }
//                 }
//             });

//             return modalInstance.result;

//         }
//     } }
// ]);

angular.module('avatech').controller('NewObservationModalController', function ($scope, $stateParams, $timeout, $modalInstance, initialLocation, Global) {

        $scope.global = Global;

        $scope.form_elements = {};

        $scope.obType = $stateParams.obType;

        $scope.snowpackTest = null;

        // $scope.schema = {
        //     type: "object",
        //     properties: {
        //       name: { required: true, type: "string", minLength: 2, title: "Name"}, //, description: "Name or alias" 
        //       title: {
        //         title: "Title!",
        //         type: "string",
        //         enum: ['dr','jr','sir','mrs','mr','NaN','dj']
        //       },
        //       another: {
        //         type: "string", title: "Another Field"
        //       },
        //       created: {
        //         type: "string",
        //         format: "date",
        //         required: true
        //       },
        //       grainType: {
        //         type: "object",
        //         title: "Grain type",
        //         //required: true
        //       },
        //       currentWindLoading: {
        //         type: "boolean",
        //         title: "Current wind loading"
        //     }
        //   }
        // };

        // $scope.form = [
        //     { key: "name" },
        //     { key: "title" },
        //     {
        //         key: "created",
        //         type: "datepicker"
        //     },
        //     {
        //         key: "grainType",
        //         type: "grainTypeSelect"
        //     },
        //     {
        //         key: "currentWindLoading",
        //         //type: "checkbox"
        //     },
        //     {
        //         key: "another",
        //         condition: "model.currentWindLoading"
        //     },
        //     {
        //         type: "submit",
        //         title: "Save"
        //     },
        //   ];

        $scope.schemas = {};
        $scope.forms = {};

        $scope.schemas['wind'] = {
            type: "object",
            properties: {
              // name: { required: true, type: "string", minLength: 2, title: "Name"}, //, description: "Name or alias" 
              // title: {
              //   title: "Title!",
              //   type: "string",
              //   enum: ['dr','jr','sir','mrs','mr','NaN','dj']
              // },
              // another: {
              //   type: "string", title: "Another Field"
              // },
              // created: {
              //   type: "string",
              //   format: "date",
              //   required: true
              // },
              // grainType: {
              //   type: "object",
              //   title: "Grain type",
              //   //required: true
              // },

            // previousWindLoading: {
            //     title: "Previous wind loading",
            //     type: "boolean",
            //     default: null
            // },
            // currentWindLoading: {
            //     title: "Current wind loading",
            //     type: "boolean",
            //     default: null
            // },
            windLoading: {
                title: "Wind Loading",
                type: "string",
                enum: ['Current','Previous'],
                //default: null
            },
            spatialExtent: {
                title: "Spatial extent",
                type: "string",
                enum: ['Localized','Widespread'],
                default: null
            },
            windDirectionAverage: {
                title: "Wind direction average",
                type: "string",
                enum: ['Consistent','Variable'],
                //enum: ['C','V'],
                default: null
            },
            ridgeLine: {
                title: "Ridgeline",
                type: "boolean"
            },
            windDirection: {
                title: "Wind direction",
                type: "number"
            },
            windSpeed: {
                title: "Wind speed",
                type: "number",
            },
            windSpeedEstimation: {
                title: "Wind speed estimation",
                type: "string",
                enum: ['C','L','M','S','E']
            },
            blowingSnowExtent: {
                title: "Blowing snow extent",
                type: "string",
                enum: ['NONE','PREV', 'L', 'M', 'I', 'U']
            },
            blowingSnowDirection: {
                title: "Blowing snow direction",
                type: "number"
            }

          }
        };
        $scope.forms['wind'] = [
            // { key: "currentWindLoading", type: "radiobuttons-nullable" },
            // { key: "previousWindLoading", type: "radiobuttons-nullable" },
            { key: "windLoading", type: "radiobuttons-nullable" },
            { key: "spatialExtent", type: "radiobuttons-nullable", condition: "model.windLoading" },
            { key: "windDirection", type: "direction-select" },
            { key: "windDirectionAverage",  type: "radiobuttons-nullable" },
            { key: "windSpeed" },
            { 
                key: "windSpeedEstimation",
                titleMap: [
                  { "value": "C", "name": "Calm" },
                  { "value": "L", "name": "Light" },
                  { "value": "M", "name": "Moderate" },
                  { "value": "S", "name": "Strong" },
                  { "value": "E", "name": "Extreme" }
                ]
            },
            { key: "blowingSnowExtent",
                // titleMap: [
                //   { "value": "NONE", "name": "" },
                //   { "value": "PREV", "name": "" },
                //   { "value": "M", "name": "" },
                //   { "value": "I", "name": "" },
                //   { "value": "U", "name": "" }
                // ]
            },
            { key: "blowingSnowDirection", type: "direction-select", condition: "['L', 'M', 'I', 'U'].indexOf(model.blowingSnowExtent) != -1"},

          ];

           $scope.schemas['snowpack-test'] = {
            type: "object",
            properties: {
              // name: { required: true, type: "string", minLength: 2, title: "Name"}, //, description: "Name or alias" 
              // title: {
              //   title: "Title!",
              //   type: "string",
              //   enum: ['dr','jr','sir','mrs','mr','NaN','dj']
              // },
              // another: {
              //   type: "string", title: "Another Field"
              // },
              // created: {
              //   type: "string",
              //   format: "date",
              //   required: true
              // },
              // grainType: {
              //   type: "object",
              //   title: "Grain type",
              //   //required: true
              // },
          }
        };
        $scope.forms['snowpack-test'] = [];



        $scope.schemas['snowpack'] = {
            type: "object",
            properties: {
                cracking: {
                    title: "Cracking",
                    type: "boolean",
                    default: null
                },
                whumpfing: {
                    title: "Whumpfing",
                    type: "boolean",
                    default: null
                },
                poorStructure: {
                    title: "Poor Structure",
                    type: "boolean",
                    default: null
                }
          }
        };
        $scope.forms['snowpack'] = [
            { key: "cracking", type: "radiobuttons-nullable" },
            { key: "whumpfing", type: "radiobuttons-nullable" },
            { key: "poorStructure", type: "radiobuttons-nullable" }
        ];

        $scope.schemas['weather'] = {
            type: "object",
            properties: {
                currentTemperature: {
                    title: "Current Temperature",
                    type: "number"
                },
                maxTemperature: {
                    title: "Max. Temperature",
                    type: "number"
                },
                minTemperature: {
                    title: "Min. Temperature",
                    type: "number"
                },
                surfaceTemperature: {
                    title: "Surface Temperature",
                    type: "number"
                },
                thermographTemperature: {
                    title: "Thermograph Temperature",
                    type: "number"
                },
                thermographTrend: {
                    title: "Thermograph Trend",
                    type: "string",
                    enum: ['RR','R','S','F','FR']
                },
                twentyCMTemperature: {
                    title: "20cm Snow Temperature",
                    type: "number"
                },
                precipitationType: {
                    title: "Precipitation Type",
                    type: "string",
                    enum: ['RR','R','S','F','FR']
                },
                precipitationRate: {
                    title: "Precipitation Rate",
                    type: "string",
                    enum: ['RR','R','S','F','FR']
                },
                skyCondition: {
                    title: "Sky Condition",
                    type: "string",
                    enum: ['RR','R','S','F','FR']
                },
                rapidWarming: {
                    title: "Rapid Warming",
                    type: "boolean",
                    default: null,
                },
                barometricPressure: {
                    title: "Barometric Pressure",
                    type: "number"
                },
                pressureTrend: {
                    title: "Pressure Trend",
                    type: "string",
                    enum: ['RR','R','S','F','FR']
                },
                relativeHumidity: {
                    title: "Relative Humidity",
                    type: "number"
                }
            }
          };

        $scope.forms['weather'] = [
            { key: "barometricPressure" },
            { key: "currentTemperature" },
            { key: "maxTemperature" },
            { key: "minTemperature" },
            { key: "surfaceTemperature" },
            { key: "thermographTemperature" },
            { key: "thermographTrend", type: "trend-select" },
            { key: "twentyCMTemperature" },
            { key: "precipitationType",
                titleMap: [
                  { "value": "NO", "name": "No Precipitation" },
                  { "value": "RA", "name": "Rain" },
                  { "value": "SN", "name": "Snow" },
                  { "value": "RS", "name": "Mixed Rain & Snow" },
                  { "value": "GR", "name": "Graupel & Hail" },
                  { "value": "ZR", "name": "Freezing Rain" }
                ]
            },
            { key: "precipitationRate",
                titleMap: [
                  { "value": "CLR", "name": "Very Light" },
                  { "value": "FEW", "name": "Light" },
                  { "value": "SCT", "name": "Moderate" },
                  { "value": "BKN", "name": "Heavy" },
                  { "value": "OVC", "name": "Very Heavy" }
                ]
            },
            { key: "skyCondition",
                titleMap: [
                  { "value": "CLR", "name": "Clear" },
                  { "value": "FEW", "name": "Few" },
                  { "value": "SCT", "name": "Scattered" },
                  { "value": "BKN", "name": "Broken" },
                  { "value": "OVC", "name": "Overcast" },
                  { "value": "X", "name": "Obscured" }
                ]
            },
            { key: "rapidWarming", type: "radiobuttons-nullable" },
            { key: "barometricPressure" },
            { key: "pressureTrend", type: "trend-select" },
            { key: "relativeHumidity" }
        ];

         $scope.schemas['snow-conditions'] = {
            type: "object",
            properties: {
                quality: {
                    title: "Quality",
                    type: "string",
                    enum: ['test','test2'],
                },
                heightOfSnowpack: {
                    title: "HS - Height of snowpack",
                    type: "number"
                },
                HN24: {
                    title: "HN24 - Height of new snow",
                    type: "number"
                },
                HIT: {
                    title: "HST",
                    type: "number"
                },
                HST: {
                    title: "HST",
                    type: "number",
                },
                HN24W: {
                    title: "HN24W",
                    type: "number",
                },
                density: {
                    title: "Density",
                    type: "number",
                },
                rainGauge: {
                    title: "Rain Gauge (mm)",
                    type: "number",
                },
                precipGauge: {
                    title: "Precip. Gauge (mm)",
                    type: "number",
                },
                footPen: {
                    title: "Foot Penetration (cm)",
                    type: "number",
                },
                surfaceForm: {
                    title: "Surface Form",
                    type: "object",
                },
                grainSize: {
                    title: "Surface Grain Size (mm)",
                    type: "number",
                },
          }
        };
        $scope.forms['snow-conditions'] = [
                { key: "quality" },
                { key: "heightOfSnowpack" },
                { key: "HN24" },
                { key: "HIT" },
                { key: "HST" },
                { key: "HN24W" },
                { key: "density" },
                { key: "rainGauge" },
                { key: "precipGauge" },
                { key: "footPen" },
                { key: "surfaceForm", type: "grainTypeSelect" },
                { key: "grainSize" }
          ];

          // --------------------

          angular.forEach($scope.schemas,function(schema) {
                schema.properties.date = {
                    type: "string",
                    format: "date",
                    title: "Date & Time",
                    required: true,
                };
                schema.properties.slope = {
                    title: "Slope",
                    type: "number"
                };
                schema.properties.aspect = {
                    title: "Aspect",
                    type: "number"
                }
                schema.properties.elevation = {
                    title: "Elevation",
                    type: "number"
                }
            });

          angular.forEach($scope.forms,function(form) {

            form.unshift(
            {
                key: "date",
                type: "datepicker"
            },
            {
                key: "slope"
            },
            {
                key: "aspect",
                type: "direction-select"
            },
            {
                key: "elevation",
                //type: "direction-select"
            });

            // add subit button
            form.push( {
                type: "submit",
                title: "Save"
            });

            // set global form fields
            for (var i = 0; i < form.length; i++) {
                //form[i].fieldHtmlClass = "input-sm";
                form[i].disableSuccessState = true;
            }
          });

          $scope.model = {
            //name: "this is a name",
            //created: new Date()
          };

        $scope.submit = function() {
            // todo: not angular-y (Peter: if you ever see this, I have some 'splaining to do...)
            $timeout(function() { $('[name="form_elements.obsForm"] input[type="submit"]').click(); });
        }
        $scope.onSubmit = function(form) {
            // console.log("SUBMIT!");
            // console.log($scope.model);

            $scope.$broadcast('schemaFormValidate');

            console.log("is valid? " + $scope.form_elements.obsForm.$valid);

            console.log($scope.model);

            // Then we check if the form is valid
            // if (form.$valid) {
            //   // ... do whatever you need to do with your data.
            // }
        }

        // console.log("MAP:");
        // console.log($scope.map);

        // $scope.map = null;

        // $scope.form = {};

        // // $modalInstance.opened.then(function(){ });

        // $scope.loadMap = function(){
        //     // mapbox uses lat/lng, DB uses lng/lat
        //     if (initialLocation) initialLocation = [ initialLocation[1], initialLocation[0]];
        //     else if (!initialLocation) {
        //         // set to either park city or user's location
        //         if (!$scope.global.user.location) initialLocation = [40.633052,-111.7111795]
        //         else initialLocation = [$scope.global.user.location[1],$scope.global.user.location[0]];
        //     }

        //     setTimeout(function(){
        //         $scope.map = L.mapbox.map('map','andrewsohn.ihk2g12l', {
        //             zoomControl: false,
        //             tileLayer: {
        //                 //continuousWorld: false,
        //                 //noWrap: true
        //             }
        //         });

        //         $scope.map.on('move',function(){
        //             if ($scope.marker) $scope.marker.setLatLng($scope.map.getCenter());
        //             //$scope.form.location = [ m.lng, m.lat ];
        //             $scope.$apply();
        //         });
        //         $scope.map.on('moveend',function(){
        //             var m = $scope.map.getCenter().wrap();
        //             $scope.form.location = [ m.lng, m.lat ];
        //             $scope.$apply();
        //         });

        //         // add zoom control
        //         new L.Control.Zoom({ position: 'bottomright' }).addTo($scope.map);

        //         // set starting location and zoom
        //         $scope.map.setView(initialLocation, 10);
        //         $scope.map.invalidateSize();

        //         // add selection marker
        //         // $scope.marker = L.marker(initialLocation, {
        //         //     icon: L.mapbox.marker.icon({
        //         //       'marker-color': '#ffcc00'
        //         //     }), draggable: false
        //         // }).addTo($scope.map);
        //         // marker2.on('dragend', ondragend);
        //         // ondragend();
        //         // function ondragend() {
        //         //     var m = marker2.getLatLng();
        //         //     $scope.form.location = [ m.lng, m.lat ];
        //         //     $scope.$apply();
        //         // }

        //         $scope.$apply();
        //     },100);
        // }

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.select = function () {
            $modalInstance.close($scope.form.location);
        };

        // on map search select
        // $scope.mapSearchSelect = function(location) {
        //     //if (location.lat && location.lng)
        //     //    $scope.map.setView([location.lat,location.lng], 12,{ animate: true});
        // }

    }
);