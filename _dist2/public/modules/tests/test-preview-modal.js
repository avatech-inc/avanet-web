
angular.module('avatech').controller('TestPreviewModalController', [ '$scope','$modalInstance', 'testId', 'Tests', 'FontLoader', 'Global',
    function ($scope, $modalInstance, testId, Tests, FontLoader, Global) {

        $scope.global = Global;

        if (testId) {
            $scope.testId = testId;
            Tests.get({ testId: testId }, function(profile) {
                console.log("loaded!");
                $scope.profile = angular.copy(profile);
                //$scope.$apply();
            });
        }


        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.select = function () {
            $modalInstance.close();
        };
    }
])