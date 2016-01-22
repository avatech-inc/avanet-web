angular.module('avatech').factory('Confirm', function ($uibModal) {
    return { open: function(message) {
        var modalInstance = $uibModal.open({
            templateUrl: '/modules/confirm/confirm.html',
            controller: 'ConfirmController',
            backdrop: 'static',
            windowClass: 'width-400',
            resolve: {
                message: function() { return message; }
            }
        });
        return modalInstance.result;
    }
}
});
angular.module('avatech').controller('ConfirmController', function ($scope, $uibModalInstance,message) {
	$scope.message = message;
    $scope.no = function () {
        $uibModalInstance.dismiss();
    };
    $scope.yes = function () {
        $uibModalInstance.close();
    };
});
