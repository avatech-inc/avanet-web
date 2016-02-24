
import './new.html'

const NewObservation = [
    '$scope',
    '$stateParams',
    '$location',
    '$log',
    '$timeout',
    '$uibModalInstance',
    'ob',
    'Global',
    'PublishModal',
    'Observations',

    (
        $scope,
        $stateParams,
        $location,
        $log,
        $timeout,
        $uibModalInstance,
        ob,
        Global,
        PublishModal,
        Observations
    ) => {
        $scope.global = Global
        $scope.form_elements = {}
        $scope.selectedTab = 'ob'

        if (ob._id) {
            $scope.model = angular.copy(ob)
        } else {
            $scope.model = {
                type: ob.type,
                location: ob.location,
                date: new Date(),
                media: [],
                user: { fullName: $scope.global.user.fullName, _id: $scope.global.user._id }
            }
        }

        $scope.schemas = {}
        $scope.forms = {}

        $scope.schemas.avalanche = {
            type: 'object',
            properties: {
                avalancheType: {
                    title: 'Avalanche type',
                    type: 'string',
                    enum: ['L', 'WL', 'SS', 'HS', 'WS', 'G', 'I', 'SF', 'C', 'R', 'U'],
                },
                trigger: {
                    title: 'Trigger',
                    type: 'string',
                    enum: ['A', 'N', 'U'],
                },
                secondaryTriggers: {
                    title: 'Secondary triggers',
                    type: 'array',
                    items: { type: 'string' },
                },
                selfTriggered: { title: 'Self triggered', type: 'boolean' },
                sizeRelative: {
                    title: 'Relative size',
                    type: 'string',
                    enum: ['R1', 'R2', 'R3', 'R4', 'R5'],
                },
                sizeDestructive: {
                    title: 'Destructive size',
                    type: 'string',
                    enum: ['D1', 'D2', 'D3', 'D4', 'D5'],
                },
                slabThickness: { title: 'Slab Thickness', type: 'number' },
                slabWidth: { title: 'Slab Width', type: 'number' },
                slabVertical: { title: 'Slab Vertical', type: 'number' },
                peopleCaught: { title: 'People Caught', type: 'number' },
                peopleInjured: { title: 'People Injured', type: 'number' },
                peopleCarried: { title: 'People Carried', type: 'number' },
                peopleBuriedPartially: { title: 'People Buried Partially', type: 'number' },
                peopleBurriedFully: { title: 'People Buried Fully', type: 'number' },
                peopleKilled: { title: 'People Killed', type: 'number' },
            }
        }

        $scope.forms.avalanche = [
            { key: 'avalancheType',
                titleMap: [
                  { value: 'L', name: 'Loose-snow avalanche' },
                  { value: 'WL', name: 'Wet loose-snow avalanche' },
                  { value: 'SS', name: 'Soft slab avalanche' },
                  { value: 'HS', name: 'Hard slab avalanche' },
                  { value: 'WS', name: 'Wet slab avalanche' },
                  { value: 'G', name: 'Glide avalanche' },
                  { value: 'I', name: 'Ice fall or avalanche' },
                  { value: 'SF', name: 'Slush flow' },
                  { value: 'C', name: 'Cornice fall (w/o avalanche)' },
                  { value: 'R', name: 'Roof avalanche' },
                  { value: 'U', name: 'Unkown' },
                ]
            },
            { key: 'trigger', type: 'radiobuttons-nullable',
                titleMap: [
                  { value: 'A', name: 'Artificial' },
                  { value: 'N', name: 'Natural' },
                  { value: 'U', name: 'Unkown' },
                ]
            },
            { key: 'secondaryTriggers', type: 'avalanche-trigger-select',
                trigger: 'A', condition: 'model.trigger == "A"' },
            { key: 'secondaryTriggers', type: 'avalanche-trigger-select',
                trigger: 'N', condition: 'model.trigger == "N"' },
            { key: 'selfTriggered', type: 'radiobuttons-nullable' },
            { key: 'sizeRelative', type: 'radiobuttons-nullable' },
            { key: 'sizeDestructive', type: 'radiobuttons-nullable' },
            { key: 'slabThickness', type: 'number', units: 'cm' },
            { key: 'slabWidth', type: 'number', units: 'm' },
            { key: 'slabVertical', type: 'number', units: 'm' },
            { key: 'peopleCaught' },
            { key: 'peopleCarried' },
            { key: 'peopleBuriedPartially' },
            { key: 'peopleBurriedFully' },
            { key: 'peopleInjured' },
            { key: 'peopleKilled' },
        ]

        $scope.$watch('model.trigger', (oldVal, newVal) => {
            if (oldVal !== newVal && $scope.model.secondaryTriggers) {
                $scope.model.secondaryTriggers = null
            }
        }, true)

        $scope.schemas.wind = {
            type: 'object',
            properties: {
                windLoading: {
                    title: 'Wind Loading',
                    type: 'string',
                    enum: ['CUR', 'PREV'],
                    // default: null
                },
                spatialExtent: {
                    title: 'Spatial extent',
                    type: 'string',
                    enum: ['LOC', 'WIDE'],
                    default: null
                },
                windVariability: {
                    title: 'Wind variability',
                    type: 'string',
                    enum: ['CON', 'VAR'],
                    default: null
                },
                windSpeedMeasured: {
                    title: 'Wind speed measured',
                    type: 'number',
                },
                windSpeedEstimated: {
                    title: 'Wind speed estimated',
                    type: 'string',
                    enum: ['C', 'L', 'M', 'S', 'X'],
                },
                windDirectionEstimated: {
                    title: 'Wind direction estimated',
                    type: 'number'
                },
                blowingSnowExtent: {
                    title: 'Blowing snow extent',
                    type: 'string',
                    enum: ['NONE', 'PREV', 'L', 'M', 'I', 'U']
                },
                blowingSnowDirection: {
                    title: 'Blowing snow direction',
                    type: 'number'
                }
            }
        }

        $scope.forms.wind = [
            { key: 'windLoading', type: 'radiobuttons-nullable',
                titleMap: [
                  { value: 'CUR', name: 'Current' },
                  { value: 'PREV', name: 'Previous' },
                ]
            },
            { key: 'spatialExtent', type: 'radiobuttons-nullable', condition: 'model.windLoading',
                titleMap: [
                  { value: 'LOC', name: 'Localized' },
                  { value: 'WIDE', name: 'Widespread' },
                ]
            },
            {
                key: 'windVariability', type: 'radiobuttons-nullable',
                titleMap: [
                  { value: 'CON', name: 'Consistent' },
                  { value: 'VAR', name: 'Variable' },
                ]
            },
            { key: 'windSpeedMeasured', type: 'number', units: 'm/s' },
            {
                key: 'windSpeedEstimated',
                titleMap: [
                  { value: 'C', name: 'Calm' },
                  { value: 'L', name: 'Light' },
                  { value: 'M', name: 'Moderate' },
                  { value: 'S', name: 'Strong' },
                  { value: 'X', name: 'Extreme' }
                ]
            },
            { key: 'windDirectionEstimated', type: 'direction-select' },
            { key: 'blowingSnowExtent',
                titleMap: [
                  { value: 'NONE', name: 'None' },
                  { value: 'PREV', name: 'Previous' },
                  { value: 'L', name: 'Light' },
                  { value: 'M', name: 'Moderate' },
                  { value: 'I', name: 'Intense' },
                  { value: 'U', name: 'Unkown' }
                ]
            },
            {
                key: 'blowingSnowDirection',
                type: 'direction-select',
                condition: '["L", "M", "I", "U"].indexOf(model.blowingSnowExtent) != -1'
            }
        ]

        $scope.schemas['snowpack-test'] = {
            type: 'object',
            properties: {
                name: {
                    title: 'Test Type',
                    type: 'string',
                    enum: ['ECT', 'CT', 'RB', 'SB', 'STE', 'DPT', 'PST', 'HTE', 'SVT'],
                    default: 'ECT'
                },
                score: {
                    title: 'Score',
                    type: 'string',
                    enum: [
                        'ECTPV', 'ECTP', 'ECTN', 'ECTX',
                        'CTV', 'CT', 'CTN',
                        'RB1', 'RB2', 'RB3', 'RB4', 'RB5', 'RB6', 'RB7',
                        'SBV', 'SB10', 'SB20', 'SB30', 'SB40', 'SB50', 'SB60', 'SB70', 'SBN',
                        'STC', 'STV', 'STE', 'STM', 'STH', 'STN',
                        'DTV', 'DT', 'DTN',
                        'End', 'SF', 'Arr'
                    ]
                },
                result: {
                    title: 'Result',
                    type: 'string',
                    enum: ['E', 'M', 'H']
                },
                weakLayerDepth: { title: 'Depth', type: 'number', },
                shear: {
                    title: 'Shear quality',
                    type: 'string',
                    enum: ['Q1', 'Q2', 'Q3']
                },
                fractureCharacter: {
                    title: 'Fracture character',
                    type: 'string',
                    enum: ['SP', 'SC', 'PC', 'RP', 'BRK']
                },
                nbTaps: { title: '# of taps', type: 'number', },
                sawCutLength: { title: 'Saw cut length', type: 'number', },
                isolatedColumnLength: { title: 'Isolated column length', type: 'number', },
                criticalGrainForm: { title: 'Critical grain form', type: 'string' },
                criticalGrainSizeMin: { title: 'Critical grain size min', type: 'number' },
                criticalGrainSizeMax: { title: 'Critical grain size max', type: 'number' },
            }
        }

        // when to show 'depth'
        let depthScores = [
            'ECTPV', 'ECTP', 'ECTN',
            'CTV', 'CT',
            'RB1', 'RB2', 'RB3', 'RB4', 'RB5', 'RB6',
            'SBV', 'SB10', 'SB20', 'SB30', 'SB40', 'SB50', 'SB60', 'SB70',
            'STC', 'STV', 'STE', 'STM', 'STH',
            'DTV', 'DT',
            'End', 'SF', 'Arr'
        ]

        $scope.showDepth = model => {
            if (model.name === 'HTE' || model.name === 'SVT') return true
            if (depthScores.indexOf(model.score) > -1) return true

            return false
        }

        // when to show 'shear' and 'fracture character'
        let shearScores = [
            'ECTPV', 'ECTP',
            'CTV', 'CT',
            'RB1', 'RB2', 'RB3', 'RB4', 'RB5', 'RB6',
            'SBV', 'SB10', 'SB20', 'SB30', 'SB40', 'SB50', 'SB60', 'SB70',
            'STC', 'STV', 'STE', 'STM', 'STH',
            'DTV', 'DT'
        ]

        $scope.showShear = model => {
            if (model.name === 'HTE' || model.name === 'SVT') return true
            if (shearScores.indexOf(model.score) > -1) return true

            return false
        }

        // when to show '# of taps'
        $scope.tapScores = ['ECTP', 'ECTN', 'CT', 'DT']

        $scope.forms['snowpack-test'] = [
            { key: 'name',
                titleMap: [
                  { value: 'ECT', name: 'Extended Column' },
                  { value: 'CT', name: 'Compression' },
                  { value: 'RB', name: 'Rutschblock' },
                  { value: 'SB', name: 'Stuffblock' },
                  { value: 'STE', name: 'Shovel Shear' },
                  { value: 'DPT', name: 'Deep Tap' },
                  { value: 'PST', name: 'Propgation Saw' },
                  { value: 'HTE', name: 'Hand Shear' },
                  { value: 'SVT', name: 'Shovel Tilt' }
                ]
            },

            //-----------

            { key: 'score', condition: 'model.name == "ECT"', titleMap: [
                  { value: 'ECTPV', name: 'ECTPV' },
                  { value: 'ECTP', name: 'ECTP' },
                  { value: 'ECTN', name: 'ECTN' },
                  { value: 'ECTX', name: 'ECTX' },
            ] },
            { key: 'score', condition: 'model.name == "CT"', titleMap: [
                  { value: 'CTV', name: 'CTV' },
                  { value: 'CT', name: 'CT' },
                  { value: 'CTN', name: 'CTN' },
            ] },
            { key: 'score', condition: 'model.name == "RB"', titleMap: [
                  { value: 'RB1', name: 'RB1' },
                  { value: 'RB2', name: 'RB2' },
                  { value: 'RB3', name: 'RB3' },
                  { value: 'RB4', name: 'RB4' },
                  { value: 'RB5', name: 'RB5' },
                  { value: 'RB6', name: 'RB6' },
                  { value: 'RB7', name: 'RB7' }
            ] },
            { key: 'score', condition: 'model.name == "SB"', titleMap: [
                  { value: 'SBV', name: 'SBV' },
                  { value: 'SB10', name: 'SB10' },
                  { value: 'SB20', name: 'SB20' },
                  { value: 'SB30', name: 'SB30' },
                  { value: 'SB40', name: 'SB40' },
                  { value: 'SB50', name: 'SB50' },
                  { value: 'SB60', name: 'SB60' },
                  { value: 'SB70', name: 'SB70' },
                  { value: 'SBN', name: 'SBN' }
            ] },
            { key: 'score', condition: 'model.name == "STE"', titleMap: [
                  { value: 'STC', name: 'STC' },
                  { value: 'STV', name: 'STV' },
                  { value: 'STE', name: 'STE' },
                  { value: 'STM', name: 'STM' },
                  { value: 'STH', name: 'STH' },
                  { value: 'STN', name: 'STN' },
            ] },
            { key: 'score', condition: 'model.name == "DPT"', titleMap: [
                  { value: 'DTV', name: 'DTV' },
                  { value: 'DT', name: 'DT' },
                  { value: 'DTN', name: 'DTN' },
            ] },
            { key: 'score', title: 'Result', condition: 'model.name == "PST"', titleMap: [
                  { value: 'End', name: 'End' },
                  { value: 'SF', name: 'SF' },
                  { value: 'Arr', name: 'Arr' },
            ] },
            { key: 'result', condition: 'model.name == "HTE" || model.name == "SVT"', titleMap: [
                  { value: 'E', name: 'Easy' },
                  { value: 'M', name: 'Moderate' },
                  { value: 'H', name: 'Hard' },
            ] },

            //-----------

            { key: 'weakLayerDepth', type: 'number', units: 'cm', condition: 'showDepth(model)' },
            { key: 'nbTaps', condition: 'tapScores.indexOf(model.score) > -1' },

            { key: 'shear', type: 'radiobuttons-nullable', condition: 'showShear(model)' },
            { key: 'fractureCharacter', condition: 'showShear(model)',
                titleMap: [
                  { value: 'SP', name: 'SP - Sudden Planar' },
                  { value: 'SC', name: 'SC - Sudden Collapse' },
                  { value: 'PC', name: 'PC - Progressive Compression' },
                  { value: 'RP', name: 'RP - Resistent Planar' },
                  { value: 'BRK', name: 'BRK - Non-planar Break' },
                ]
            },
            { key: 'sawCutLength', type: 'number', units: 'cm', condition: 'model.name == "PST"' },
            { key: 'isolatedColumnLength', type: 'number', units: 'cm',
                condition: 'model.name == "PST"' },
            { key: 'criticalGrainForm', type: 'grainTypeSelect',
                condition: 'showDepth(model)' },
            { key: 'criticalGrainSizeMin', type: 'number', units: 'mm',
                condition: 'showDepth(model)' },
            { key: 'criticalGrainSizeMax', type: 'number', units: 'mm',
                condition: 'showDepth(model)' },
        ]

        $scope.$watch('model.name', (oldVal, newVal) => {
            $scope.model.score = null
        }, true)

        $scope.schemas.snowpack = {
            type: 'object',
            properties: {
                snowQuality: {
                    title: 'Snow quality',
                    type: 'string',
                    enum: ['POW', 'CRUD', 'CRUST', 'HARD', 'SLUSH', 'SPRING']
                },
                cracking: {
                    title: 'Cracking',
                    type: 'boolean',
                    default: null
                },
                whumpfing: {
                    title: 'Whumpfing',
                    type: 'boolean',
                    default: null
                },
                footPenetration: { title: 'Foot penetration', type: 'number' },
                skiPenetration: { title: 'Ski penetration', type: 'number' },
                snowPackDepthEstimate: { title: 'Snowpack depth estimate', type: 'number' },
                newSnowDepthEstimate: { title: 'New snow estimate', type: 'number' },
                surfaceGrainForm: { title: 'Surface grain form', type: 'string' },
                surfaceGrainSizeMin: { title: 'Surface grain size min', type: 'number' },
                surfaceGrainSizeMax: { title: 'Surface grain size max', type: 'number' },
                surfaceTemperature: { title: 'Surface Temperature', type: 'number' },
                twentyCMTemperature: { title: '20cm Temperature', type: 'number' },
            }
        }

        $scope.forms.snowpack = [
            { key: 'snowQuality',
                titleMap: [
                  { value: 'POW', name: 'Powder' },
                  { value: 'CRUD', name: 'Crud' },
                  { value: 'CRUST', name: 'Crusty' },
                  { value: 'HARD', name: 'Hard' },
                  { value: 'SLUSH', name: 'Slushy' },
                  { value: 'SPRING', name: 'Spring Snow' }
                ]
            },
            { key: 'cracking', type: 'radiobuttons-nullable' },
            { key: 'whumpfing', type: 'radiobuttons-nullable' },
            { key: 'snowPackDepthEstimate', type: 'number', units: 'cm' },
            { key: 'newSnowDepthEstimate', type: 'number', units: 'cm' },
            { key: 'footPenetration', type: 'number', units: 'cm' },
            { key: 'skiPenetration', type: 'number', units: 'cm' },
            { key: 'surfaceGrainForm', type: 'grainTypeSelect' },
            { key: 'surfaceGrainSizeMin', type: 'number', units: 'mm' },
            { key: 'surfaceGrainSizeMax', type: 'number', units: 'mm' },
            { key: 'surfaceTemperature', type: 'number', units: '°C' },
            { key: 'twentyCMTemperature', type: 'number', units: '°C' },
        ]

        $scope.schemas.weather = {
            type: 'object',
            properties: {
                precipitationType: {
                    title: 'Precipitation Type',
                    type: 'string',
                    enum: ['NO', 'RA', 'SN', 'RS', 'GR', 'ZR']
                },
                precipitationRate: {
                    title: 'Precipitation Rate',
                    type: 'string',
                    enum: ['S-1', 'S1', 'S2', 'S5', 'S10']
                },
                skyCondition: {
                    title: 'Sky Condition',
                    type: 'string',
                    enum: ['CLR', 'FEW', 'SCT', 'BKN', 'OVC', 'X']
                },
                maxTemperature: { title: 'Max. Temperature', type: 'number' },
                minTemperature: { title: 'Min. Temperature', type: 'number' },
                presentTemperature: { title: 'Current Temperature', type: 'number' },
                thermographTemperature: { title: 'Thermograph Temperature', type: 'number' },
                thermographTrend: {
                    title: 'Thermograph Trend',
                    type: 'string',
                    enum: ['RR', 'R', 'S', 'F', 'FR']
                },
                relativeHumidity: { title: 'Relative Humidity', type: 'number' },
                barometricPressure: { title: 'Barometric Pressure', type: 'number' },
                pressureTrend: {
                    title: 'Pressure Trend',
                    type: 'string',
                    enum: ['RR', 'R', 'S', 'F', 'FR']
                },
            }
        }

        $scope.forms.weather = [
            { key: 'precipitationType',
                titleMap: [
                  { value: 'NO', name: 'No Precipitation' },
                  { value: 'RA', name: 'Rain' },
                  { value: 'SN', name: 'Snow' },
                  { value: 'RS', name: 'Mixed Rain & Snow' },
                  { value: 'GR', name: 'Graupel & Hail' },
                  { value: 'ZR', name: 'Freezing Rain' }
                ]
            },
            { key: 'precipitationRate',
                titleMap: [
                  { value: 'S-1', name: 'Very Light' },
                  { value: 'S1', name: 'Light' },
                  { value: 'S2', name: 'Moderate' },
                  { value: 'S5', name: 'Heavy' },
                  { value: 'S10', name: 'Very Heavy' }
                ]
            },
            { key: 'skyCondition',
                titleMap: [
                  { value: 'CLR', name: 'Clear' },
                  { value: 'FEW', name: 'Few' },
                  { value: 'SCT', name: 'Scattered' },
                  { value: 'BKN', name: 'Broken' },
                  { value: 'OVC', name: 'Overcast' },
                  { value: 'X', name: 'Obscured' }
                ]
            },
            { key: 'maxTemperature', type: 'number', units: '°C' },
            { key: 'minTemperature', type: 'number', units: '°C' },
            { key: 'presentTemperature', type: 'number', units: '°C' },
            { key: 'thermographTemperature', type: 'number', units: '°C' },
            // { key: 'thermographTrend', type: 'trend-select' },
            { key: 'thermographTrend',
                titleMap: [
                  { value: 'RR', name: 'RR - Rising Rapidly' },
                  { value: 'R', name: 'R - Rain' },
                  { value: 'S', name: 'S - Steady' },
                  { value: 'F', name: 'F - Falling' },
                  { value: 'FR', name: 'FR - Falling Rapidly' }
                ]
            },
            { key: 'relativeHumidity', type: 'number', units: '%' },
            { key: 'barometricPressure', type: 'number', units: 'mb' },
            { key: 'pressureTrend',
                titleMap: [
                  { value: 'RR', name: 'RR - Rising Rapidly' },
                  { value: 'R', name: 'R - Rain' },
                  { value: 'S', name: 'S - Steady' },
                  { value: 'F', name: 'F - Falling' },
                  { value: 'FR', name: 'FR - Falling Rapidly' }
                ]
            },
        ]

        // ----------------------------------------------------------

        // add global fields

        angular.forEach($scope.schemas, (schema) => {
            schema.properties.date = {
                type: 'string',
                format: 'date',
                title: 'Date & Time Observed',
                required: true,
            };
            schema.properties.slope = {
                title: 'Slope',
                type: 'number'
            };
            schema.properties.aspect = {
                title: 'Aspect',
                type: 'number'
            }
            schema.properties.elevation = {
                title: 'Elevation',
                type: 'number'
            }
            schema.properties.location = {
                title: 'Location',
                type: 'object'
            }
            schema.properties.locationName = {
                title: 'Location name',
                type: 'string'
            }
        })

        angular.forEach($scope.forms, form => {
            form.unshift(
                { key: 'date', type: 'datepicker' },
                { key: 'location', type: 'location-select' },
                { key: 'locationName' },
                { key: 'slope', type: 'number', units: '°' },
                { key: 'aspect', type: 'direction-select' },
                { key: 'elevation', type: 'number', units: 'm' }
            );

            // add subit button
            form.push({ type: 'submit', title: 'Submit' })

            // set global form fields
            for (let i = 0; i < form.length; i++) {
                // form[i].fieldHtmlClass = "input-sm";
                form[i].disableSuccessState = true
            }
        })

        // -----------------------------------------------------

        $scope.submit = () => {
            // todo: not angular-y (Peter: if you ever see this, I have some 'splaining to do...)
            $timeout(() => $('[name="form_elements.obsForm"] input[type="submit"]').click())
        }

        $scope.onSubmit = form => {
            if (!$scope.model.location) return alert('Please select a location.')

            $scope.$broadcast('schemaFormValidate')

            $log.debug('is valid? ' + $scope.form_elements.obsForm.$valid)
            $log.debug($scope.model)

            if ($scope.form_elements.obsForm.$valid) {
                PublishModal.open({
                    initialSharing: angular.copy($scope.model)
                })
                .then(sharing => {
                    angular.extend($scope.model, sharing)

                    $scope.model.published = true;

                    Observations.save(angular.copy($scope.model), ob => {
                        let redirectUrl = '/obs/' + ob._id

                        if (redirectUrl === $location.path()) {
                            $uibModalInstance.close(ob)
                        } else {
                            $location.path(redirectUrl)
                        }
                    })
                })
            }
        }

        $scope.close = () => {
            $uibModalInstance.dismiss()
        }

        // $scope.select = function () {
        //     $uibModalInstance.close();
        // };

        // media

        $scope.deletePhoto = index => {
            if (index === 0) {
                $scope.model.media.shift()
            } else {
                $scope.model.media.splice(index, 1)
            }
        }

        $scope.onFileAdd = file => {
            if (!$scope.uploading) {
                $scope.uploading = []
            }

            file.uploading = true

            $scope.uploading.unshift(file)
            $scope.$apply()
        }

        $scope.onFileProgress = file => {
            $scope.$apply()
        }

        $scope.onFileUpload = file => {
            if (!$scope.model.media) {
                $scope.model.media = []
            }

            file.uploading = false
            file.caption = file.name
            file.type = 'photo'
            file.URL = file.url

            delete file.url

            $scope.model.media.unshift(file)
            $scope.$apply()

            // console.log($scope.obs);
        }

        $scope.showPhoto = index => {
           // Lightbox.openModal($scope.model.media, index);
        }
    }
]

export default NewObservation
