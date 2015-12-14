angular.module('avatech').controller('NewObservationModalController', function ($scope, $stateParams, $log, $timeout, $uibModalInstance, initialLocation, Global) {

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
    $scope.schemas['avalanche'] = {
        type: "object",
        properties: {
            avalancheType: {
                title: "Avalanche type",
                type: "string",
                enum: ['L','WL','SS','HS','WS','G','I','SF','C','R','U'],
            },
            trigger: {
                title: "Trigger",
                type: "string",
                enum: ['A','N','U'],
            },
            secondaryTriggers: {
                title: "Secondary triggers",
                type: "array",
                items: { type: "string" },
            },
            selfTriggered: { title: "Self triggered", type: "boolean" },
            sizeRelative: {
                title: "Relative size",
                type: "string",
                enum: ['R1','R2','R3','R4','R5'],
            },
            sizeDestructive: {
                title: "Relative size",
                type: "string",
                enum: ['D1','D2','D3','D4','D5'],
            },
            slabThickness: { title: "Slab Thickness", type: "number", description: "cm" },
            slabWidth: { title: "Slab Width", type: "number" },
            slabVertical: { title: "Slab Vertical", type: "number" },
            peopleCaught: { title: "Slab Thickness", type: "number" },
            peopleInjured: { title: "People Injured", type: "number" },
            peopleCarried: { title: "People Carried", type: "number" },
            peopleBuriedPartially: { title: "People Buried Partially", type: "number" },
            peopleBurriedFully: { title: "People Buried Fully", type: "number" },
            peopleKilled: { title: "People Killed", type: "number" },
        }
    };
    $scope.forms['avalanche'] = [
        { key: "avalancheType",
            titleMap: [
              { "value": "L", "name": "Loose-snow avalanche" },
              { "value": "WL", "name": "Wet loose-snow avalanche" },
              { "value": "SS", "name": "Soft slab avalanche" },
              { "value": "HS", "name": "Hard slab avalanche" },
              { "value": "WS", "name": "Wet slab avalanche" },
              { "value": "G", "name": "Glide avalanche" },
              { "value": "I", "name": "Ice fall or avalanche" },
              { "value": "SF", "name": "Slush flow" },
              { "value": "C", "name": "Cornice fall (w/o avalanche)" },
              { "value": "R", "name": "Roof avalanche" },
              { "value": "U", "name": "Unkown" },
            ]
        },
        { key: "trigger", type: "radiobuttons-nullable",
            titleMap: [
              { "value": "A", "name": "Artificial" },
              { "value": "N", "name": "Natural" },
              { "value": "U", "name": "Unkown" },
            ]
        },
        { key: "secondaryTriggers", type: "avalanche-trigger-select", trigger: 'A', condition: "model.trigger == 'A'" },
        { key: "secondaryTriggers", type: "avalanche-trigger-select", trigger: 'N', condition: "model.trigger == 'N'" },
        { key: "selfTriggered", type: "radiobuttons-nullable" },
        { key: "sizeRelative", type: "radiobuttons-nullable" },
        { key: "sizeDestructive", type: "radiobuttons-nullable" },
        { key: "slabThickness", type:"number", units: "cm" },
        { key: "slabWidth", type:"number", units: "m" },
        { key: "slabVertical", type:"number", units: "m" },
        { key: "peopleCaught" },
        { key: "peopleCarried" },
        { key: "peopleBuriedPartially" },
        { key: "peopleBurriedFully" },
        { key: "peopleInjured" },
        { key: "peopleKilled" },
    ];
    $scope.$watch('model.trigger',function(oldVal, newVal) {
        if (oldVal != newVal && $scope.model.secondaryTriggers) 
            $scope.model.secondaryTriggers = null;
    }, true);


    $scope.schemas['wind'] = {
        type: "object",
        properties: {
            windLoading: {
                title: "Wind Loading",
                type: "string",
                enum: ['CUR','PREV'],
                //default: null
            },
            spatialExtent: {
                title: "Spatial extent",
                type: "string",
                enum: ['LOC','WIDE'],
                default: null
            },
            windVariability: {
                title: "Wind variability",
                type: "string",
                enum: ['CON','VAR'],
                default: null
            },
            windSpeedMeasured: {
                title: "Wind speed measured",
                type: "number",
            },
            windSpeedEstimated: {
                title: "Wind speed estimated",
                type: "string",
                enum: ['C','L','M','S','X'],
            },
            windDirectionEstimated: {
                title: "Wind direction estimated",
                type: "number"
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
        { key: "windLoading", type: "radiobuttons-nullable",
            titleMap: [
              { "value": "CUR", "name": "Current" },
              { "value": "PREV", "name": "Previous" },
            ] 
        },
        { key: "spatialExtent", type: "radiobuttons-nullable", condition: "model.windLoading",
            titleMap: [
              { "value": "LOC", "name": "Localized" },
              { "value": "WIDE", "name": "Widespread" },
            ]
        },
        { 
            key: "windVariability", type: "radiobuttons-nullable",
            titleMap: [
              { "value": "CON", "name": "Consistent" },
              { "value": "VAR", "name": "Variable" },
            ]
        },
        { key: "windSpeedMeasured", type:"number", units: "m/s" },
        { 
            key: "windSpeedEstimated",
            titleMap: [
              { "value": "C", "name": "Calm" },
              { "value": "L", "name": "Light" },
              { "value": "M", "name": "Moderate" },
              { "value": "S", "name": "Strong" },
              { "value": "X", "name": "Extreme" }
            ]
        },
        { key: "windDirectionEstimated", type: "direction-select" },
        { key: "blowingSnowExtent",
            titleMap: [
              { "value": "NONE", "name": "None" },
              { "value": "PREV", "name": "Previous" },
              { "value": "L", "name": "Light" },
              { "value": "M", "name": "Moderate" },
              { "value": "I", "name": "Intense" },
              { "value": "U", "name": "Unkown" }
            ]
        },
        { 
            key: "blowingSnowDirection", 
            type: "direction-select", 
            condition: "['L', 'M', 'I', 'U'].indexOf(model.blowingSnowExtent) != -1"
        }
    ];

    $scope.schemas['snowpack-test'] = {
        type: "object",
        properties: { 
            name: {
                title: "Test Type",
                type: "string",
                enum: ['ECT','CT','RB','SB','STE','DPT','PST','HTE','SVT'],
                default: 'ECT'
            },
            { key: "blowingSnowDirection", type: "direction-select", condition: "['L', 'M', 'I', 'U'].indexOf(model.blowingSnowExtent) != -1"},

          ];
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
            score: {
                title: "Score",
                type: "string",
                enum: [
                    'ECTPV','ECTP','ECTN','ECTX',
                    'CTV','CT','CTN',
                    'RB1','RB2','RB3','RB4','RB5','RB6','RB7',
                    'SBV','SB10','SB20','SB30','SB40','SB50','SB60','SB70','SBN',
                    'STC','STV','STE','STM','STH','STN',
                    'DTV','DT','DTN',
                    'End','SF','Arr'
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
            result: {
                title: "Result",
                type: "string",
                enum: ['E','M','H']
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
            weakLayerDepth: { title: "Depth", type: "number", },
            shear: {
                title: "Shear quality",
                type: "string",
                enum: ['Q1','Q2','Q3']
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
                    title: "HIT",
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
            fractureCharacter: {
                title: "Fracture character",
                type: "string",
                enum: ['SP','SC','PC','RP','BRK']
            },
            nbTaps: { title: "# of taps", type: "number", },
            sawCutLength: { title: "Saw cut length", type: "number", },
            isolatedColumnLength: { title: "Isolated column length", type: "number", },
            criticalGrainForm: { title: "Critical grain form", type: "string" },
            criticalGrainSizeMin: { title: "Critical grain size min", type: "number" },
            criticalGrainSizeMax: { title: "Critical grain size max", type: "number" },
        }
    };

        // when to show 'depth'
        var depthScores = 
         ['ECTPV','ECTP','ECTN',
         'CTV','CT',
         'RB1','RB2','RB3','RB4','RB5','RB6',
         'SBV','SB10','SB20','SB30','SB40','SB50','SB60','SB70',
         'STC','STV','STE','STM','STH',
         'DTV','DT',
         'End','SF','Arr'];
         $scope.showDepth = function(model) {
            if (model.name == 'HTE' || model.name == 'SVT') return true;
            if (depthScores.indexOf(model.score) > -1) return true
            return false;
         }

        // when to show 'shear' and 'fracture character'
        var shearScores = 
        ['ECTPV','ECTP',
         'CTV','CT',
         'RB1','RB2','RB3','RB4','RB5','RB6',
         'SBV','SB10','SB20','SB30','SB40','SB50','SB60','SB70',
         'STC','STV','STE','STM','STH',
         'DTV','DT'];
         $scope.showShear = function(model) {
            if (model.name == 'HTE' || model.name == 'SVT') return true;
            if (shearScores.indexOf(model.score) > -1) return true
            return false;
         }

         // when to show '# of taps'
         $scope.tapScores = ['ECTP','ECTN','CT','DT'] 

    $scope.forms['snowpack-test'] = [
        { key: "name",
            titleMap: [
              { "value": "ECT", "name": "Extended Column" },
              { "value": "CT", "name": "Compression" },
              { "value": "RB", "name": "Rutschblock" },
              { "value": "SB", "name": "Stuffblock" },
              { "value": "STE", "name": "Shovel Shear" },
              { "value": "DPT", "name": "Deep Tap" },
              { "value": "PST", "name": "Propgation Saw" },
              { "value": "HTE", "name": "Hand Shear" },
              { "value": "SVT", "name": "Shovel Tilt" }
            ]
        },

        //-----------

        { key: "score", condition: "model.name == 'ECT'", titleMap: [
              { "value": "ECTPV", "name": "ECTPV" },
              { "value": "ECTP", "name": "ECTP" },
              { "value": "ECTN", "name": "ECTN" },
              { "value": "ECTX", "name": "ECTX" },
            ]
        },
        { key: "score", condition: "model.name == 'CT'", titleMap: [
              { "value": "CTV", "name": "CTV" },
              { "value": "CT", "name": "CT" },
              { "value": "CTN", "name": "CTN" },
            ]
        },
        { key: "score", condition: "model.name == 'RB'", titleMap: [
              { "value": "RB1", "name": "RB1" },
              { "value": "RB2", "name": "RB2" },
              { "value": "RB3", "name": "RB3" },
              { "value": "RB4", "name": "RB4" },
              { "value": "RB5", "name": "RB5" },
              { "value": "RB6", "name": "RB6" },
              { "value": "RB7", "name": "RB7" }
            ]
        },
        { key: "score", condition: "model.name == 'SB'", titleMap: [
              { "value": "SBV", "name": "SBV" },
              { "value": "SB10", "name": "SB10" },
              { "value": "SB20", "name": "SB20" },
              { "value": "SB30", "name": "SB30" },
              { "value": "SB40", "name": "SB40" },
              { "value": "SB50", "name": "SB50" },
              { "value": "SB60", "name": "SB60" },
              { "value": "SB70", "name": "SB70" },
              { "value": "SBN", "name": "SBN" }
            ]
        },
        { key: "score", condition: "model.name == 'STE'", titleMap: [
              { "value": "STC", "name": "STC" },
              { "value": "STV", "name": "STV" },
              { "value": "STE", "name": "STE" },
              { "value": "STM", "name": "STM" },
              { "value": "STH", "name": "STH" },
              { "value": "STN", "name": "STN" },
            ]
        },
        { key: "score", condition: "model.name == 'DPT'", titleMap: [
              { "value": "DTV", "name": "DTV" },
              { "value": "DT", "name": "DT" },
              { "value": "DTN", "name": "DTN" },
            ]
        },
        { key: "score", title: "Result", condition: "model.name == 'PST'", titleMap: [
              { "value": "End", "name": "End" },
              { "value": "SF", "name": "SF" },
              { "value": "Arr", "name": "Arr" },
            ]
        },
        { key: "result", condition: "model.name == 'HTE' || model.name == 'SVT'", titleMap: [
              { "value": "E", "name": "Easy" },
              { "value": "M", "name": "Moderate" },
              { "value": "H", "name": "Hard" },
            ]
        },

        //-----------

        { key: "weakLayerDepth", type:"number", units: "cm", condition: "showDepth(model)" },
        { key: "nbTaps", condition: "tapScores.indexOf(model.score) > -1" },

        { key: "shear", type: "radiobuttons-nullable", condition: "model.name != 'PST'", condition: "showShear(model)" },
        { key: "fractureCharacter", condition: "model.name != 'PST'", condition: "showShear(model)",
            titleMap: [
              { "value": "SP", "name": "SP - Sudden Planar" },
              { "value": "SC", "name": "SC - Sudden Collapse" },
              { "value": "PC", "name": "PC - Progressive Compression" },
              { "value": "RP", "name": "RP - Resistent Planar" },
              { "value": "BRK", "name": "BRK - Non-planar Break" },
            ]
        },
        { key: "sawCutLength", type:"number", units: "cm", condition: "model.name == 'PST'" },
        { key: "isolatedColumnLength", type:"number", units: "cm", condition: "model.name == 'PST'" },

        { key: "criticalGrainForm", type: "grainTypeSelect", condition: "showDepth(model)" },
        { key: "criticalGrainSizeMin", type:"number", units: "mm", condition: "showDepth(model)" },
        { key: "criticalGrainSizeMax", type:"number", units: "mm", condition: "showDepth(model)" },
    ];

    $scope.$watch('model.name',function(oldVal, newVal) {
        $scope.model.score = null;
    }, true);


            form.unshift(
            {
                key: "date",
                type: "datepicker"
    $scope.schemas['snowpack'] = {
        type: "object",
        properties: {
            snowQuality: {
                title: "Snow quality",
                type: "string",
                enum: ['POW','CRUD', 'CRUST', 'HARD', 'SLUSH', 'SPRING']
            },
            {
                key: "slope"
            cracking: {
                title: "Cracking",
                type: "boolean",
                default: null
            },
            {
                key: "aspect",
                type: "direction-select"
            whumpfing: {
                title: "Whumpfing",
                type: "boolean",
                default: null
            },
            {
                key: "elevation",
                //type: "direction-select"
            });
            footPenetration: { title: "Foot penetration", type: "number" },
            skiPenetration: { title: "Ski penetration", type: "number" },
            snowPackDepthEstimate: { title: "Snowpack depth estimate", type: "number" },
            newSnowDepthEstimate: { title: "New snow estimate", type: "number" },
            surfaceGrainForm: { title: "Surface grain form", type: "string" },
            surfaceGrainSizeMin: { title: "Surface grain size min", type: "number" },
            surfaceGrainSizeMax: { title: "Surface grain size max", type: "number" },
            surfaceTemperature: { title: "Surface Temperature", type: "number" },
            twentyCMTemperature: { title: "20cm Temperature", type: "number" },
      }
    };
    $scope.forms['snowpack'] = [
        { key: "snowQuality",
            titleMap: [
              { "value": "POW", "name": "Powder" },
              { "value": "CRUD", "name": "Crud" },
              { "value": "CRUST", "name": "Crusty" },
              { "value": "HARD", "name": "Hard" },
              { "value": "SLUSH", "name": "Slushy" },
              { "value": "SPRING", "name": "Spring Snow" }
            ]
        },
        { key: "cracking", type: "radiobuttons-nullable" },
        { key: "whumpfing", type: "radiobuttons-nullable" },
        { key: "snowPackDepthEstimate", type:"number", units: "cm"  },
        { key: "newSnowDepthEstimate", type:"number", units: "cm" },
        { key: "footPenetration", type:"number", units: "cm" },
        { key: "skiPenetration", type:"number", units: "cm" },
        { key: "surfaceGrainForm", type: "grainTypeSelect" },
        { key: "surfaceGrainSizeMin", type:"number", units: "mm" },
        { key: "surfaceGrainSizeMax", type:"number", units: "mm" },
        { key: "surfaceTemperature", type:"number", units: "°C" },
        { key: "twentyCMTemperature", type:"number", units: "°C" },
    ];

            // add subit button
            form.push( {
                type: "submit",
                title: "Save"
            });
    $scope.schemas['weather'] = {
        type: "object",
        properties: {
            precipitationType: {
                title: "Precipitation Type",
                type: "string",
                enum: ['NO','RA','SN','RS','GR','ZR']
            },
            precipitationRate: {
                title: "Precipitation Rate",
                type: "string",
                enum: ['S-1','S1','S2','S5','S10']
            },
            skyCondition: {
                title: "Sky Condition",
                type: "string",
                enum: ['CLR','FEW','SCT','BKN','OVC','X']
            },
            maxTemperature: { title: "Max. Temperature", type: "number" },
            minTemperature: { title: "Min. Temperature", type: "number" },
            presentTemperature: { title: "Current Temperature", type: "number" },
            thermographTemperature: { title: "Thermograph Temperature", type: "number" },
            thermographTrend: {
                title: "Thermograph Trend",
                type: "string",
                enum: ['RR','R','S','F','FR']
            },
            relativeHumidity: { title: "Relative Humidity", type: "number" },
            barometricPressure: { title: "Barometric Pressure", type: "number" },
            pressureTrend: {
                title: "Pressure Trend",
                type: "string",
                enum: ['RR','R','S','F','FR']
            },
        }
      };

    $scope.forms['weather'] = [
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
        { key: "maxTemperature", type:"number", units: "°C"  },
        { key: "minTemperature", type:"number", units: "°C"  },
        { key: "presentTemperature", type:"number", units: "°C"  },
        { key: "thermographTemperature", type:"number", units: "°C" },
        //{ key: "thermographTrend", type: "trend-select" },
        { key: "thermographTrend",
            titleMap: [
              { "value": "RR", "name": "RR - Rising Rapidly" },
              { "value": "R", "name": "R - Rain" },
              { "value": "S", "name": "S - Steady" },
              { "value": "F", "name": "F - Falling" },
              { "value": "FR", "name": "FR - Falling Rapidly" }
            ]
        },
        { key: "relativeHumidity", type:"number", units: "%" },
        { key: "barometricPressure", type:"number", units: "mb" },
        { key: "pressureTrend", 
            titleMap: [
              { "value": "RR", "name": "RR - Rising Rapidly" },
              { "value": "R", "name": "R - Rain" },
              { "value": "S", "name": "S - Steady" },
              { "value": "F", "name": "F - Falling" },
              { "value": "FR", "name": "FR - Falling Rapidly" }
            ]
        },
    ];

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

            $log.debug("is valid? " + $scope.form_elements.obsForm.$valid);

            $log.debug($scope.model);

            // Then we check if the form is valid
            // if (form.$valid) {
            //   // ... do whatever you need to do with your data.
            // }
        }

        // console.log("MAP:");
        // console.log($scope.map);

        // $scope.map = null;

        // $scope.form = {};

        // // $uibModalInstance.opened.then(function(){ });

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
            $uibModalInstance.dismiss();
        };
        $scope.select = function () {
            $uibModalInstance.close($scope.form.location);
        };

        // on map search select
        // $scope.mapSearchSelect = function(location) {
        //     //if (location.lat && location.lng)
        //     //    $scope.map.setView([location.lat,location.lng], 12,{ animate: true});
        // }

    }
);