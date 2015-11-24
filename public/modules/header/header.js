angular.module('avatech').controller('HeaderController', function ($scope, $location, $route, RegisterDeviceModal, DeviceUploadModal, Global, $uibModal) {
    $scope.global = Global;

    $scope.registerSP1 = function() {
        RegisterDeviceModal.open();
    };

    $scope.deviceUpload = function() {
        DeviceUploadModal.open();
    };

    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
    
});