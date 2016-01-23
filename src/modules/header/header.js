angular.module('avatech').controller('HeaderController', 
    ['$scope', '$location', '$route', 'RegisterDeviceModal', 'DeviceUploadModal', 'Global', '$uibModal',
    function ($scope, $location, $route, RegisterDeviceModal, DeviceUploadModal, Global, $uibModal) {
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

    $scope.newOb = function(type) {
        $uibModal.open({
            templateUrl: "/modules/observations/new.html",
            controller: "NewObservationModalController",
            backdrop: 'static',
            windowClass: 'width-480',
            resolve: {
              ob: function() { return { type: type }; }
            }
        }).result.finally(function() {
            
        });
    }
    
}]);
