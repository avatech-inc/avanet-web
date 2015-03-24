angular.module('avatech').factory('Confirm', [ '$modal',
    function ($modal) {

        return { open: function(message) {

            var modalInstance = $modal.open({
                templateUrl: '/modules/confirm/confirm.html',
                controller: 'ConfirmController',
                resolve: {
                    message: function() { return message; }
                }
            });

            return modalInstance.result;

        }
    } }
]);


angular.module('avatech').controller('ConfirmController', [ '$scope','$modalInstance','message',
    function ($scope, $modalInstance,message) {
    	$scope.message = message;
        $scope.no = function () {
            $modalInstance.dismiss();
        };
        $scope.yes = function () {
            $modalInstance.close();
        };
    }
]);
