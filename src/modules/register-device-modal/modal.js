
import './modal.html'

export const RegisterDevice = ['$uibModal', $uibModal => ({
    open: options => {
        let modalInstance = $uibModal.open({
            templateUrl: '/modules/register-device-modal/modal.html',
            controller: 'RegisterDeviceModalController',
            backdrop: 'static',
            windowClass: 'width-400'
        })

        return modalInstance.result
    }
})]

export const RegisterDeviceController = [
    '$scope',
    '$uibModalInstance',
    '$timeout',
    '$http',
    'Global',
    'Restangular',

    (
        $scope,
        $uibModalInstance,
        $timeout,
        $http,
        Global,
        Restangular
    ) => {
        $scope.global = Global
        $scope.serial = { number: '' }
        $scope.close = () => $uibModalInstance.dismiss()
        $scope.register = () => {
            $scope.checking = true
            $scope.serial.number = $scope.serial.number.toUpperCase()

            if (!$scope.serial.number || $scope.serial.number === '') {
                alert('Please enter your SP serial number.')
                $scope.checking = false
                return
            } else if ($scope.serial.number.length !== 14) {
                alert('Your SP serial number must be 14 digits - ' +
                    'please make sure you entered it correctly.')
                $scope.checking = false
                return
            } else if ($scope.serial.number.indexOf('SP') !== 0) {
                alert('Your SP serial number must begin with "SP"')
                $scope.checking = false
                return
            }

            Restangular
                .one('devices', $scope.serial.number)
                .customPOST({}, 'register')
                // success
                .then(data => {
                    $scope.registering = true
                    $timeout(() => {
                        $scope.registering = false
                        $scope.registered = true
                    }, 2000)
                },
                // error
                response => {
                    alert(response.data.message)
                })
                // always
                .finally(() => {
                    $scope.checking = false
                })
        }
    }
]
