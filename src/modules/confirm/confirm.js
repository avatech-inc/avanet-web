
angular.module('avatech').factory('Confirm', ['$uibModal', $uibModal => ({
    open: message => {
        let modalInstance = $uibModal.open({
            templateUrl: '/modules/confirm/confirm.html',
            controller: 'ConfirmController',
            backdrop: 'static',
            windowClass: 'width-400',
            resolve: {
                message: () => message
            }
        })

        return modalInstance.result
    }
})])

angular.module('avatech').controller('ConfirmController', [
    '$scope',
    '$uibModalInstance',
    'message',

    (
        $scope,
        $uibModalInstance,
        message
    ) => {
        $scope.message = message

        $scope.no = () => $uibModalInstance.dismiss()
        $scope.yes = () => $uibModalInstance.close()
    }
])
