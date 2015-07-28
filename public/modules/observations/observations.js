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

            previousWindLoading: {
                title: "Previous wind loading",
                type: "boolean",
                default: null
            },
            currentWindLoading: {
                title: "Current wind loading",
                type: "boolean",
                default: null
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
                //enum: ['localized','widespread']
            },
            blowingSnowDirection: {
                title: "Blowing snow direction",
                type: "number"
            }

          }
        };
        $scope.forms['wind'] = [
            { 
                key: "windDirection",
                type: "direction-select"
            },
            // { 
            //     key: "windDirectionAverage", 
            //     type: "radiobuttons-nullable",
            //     titleMap: [
            //       { "value": "C", "name": "Consistent" },
            //       { "value": "V", "name": "Variable" },
            //     ]
            // },
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
            { key: "currentWindLoading", type: "radiobuttons-nullable" },
            { key: "previousWindLoading", type: "radiobuttons-nullable" },
            { key: "spatialExtent", type: "radiobuttons-nullable" }
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

            // date: {
            //     type: "string",
            //     format: "date",
            //     title: "Date & Time",
            //     required: true,
            // },
            // slope: {
            //     title: "Slope",
            //     type: "number"
            // },
            // aspect: {
            //     title: "Aspect",
            //     type: "number"
            // },
          }
        };
        $scope.forms['snowpack-test'] = [
            // {
            //     key: "date",
            //     type: "datepicker"
            // },
            // {
            //     key: "slope"
            // },
            // {
            //     key: "aspect",
            //     type: "direction-select"
            // }
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