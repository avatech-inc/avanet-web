angular.module('avatech').controller('ObservationPreviewModalController', [ '$scope','$modalInstance', 'observationId', 'Tests', 'FontLoader', 'Global', 'Restangular', 'snowpitExport', 'Lightbox',
    function ($scope, $modalInstance, observationId, Tests, FontLoader, Global, Restangular, snowpitExport, Lightbox) {

        $scope.global = Global;

        $scope.formatters = snowpitExport.formatters;

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

        if (observationId) {
            $scope.observationId = observationId;

            Restangular.one('observations',$scope.observationId).get().then(function(response) {
                $scope.observation = response;
            });
        }

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

        $scope.showPhoto = function(index) {
            Lightbox.openModal($scope.observation.photos, index);
        }

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.select = function () {
            $modalInstance.close();
        };
    }
]);