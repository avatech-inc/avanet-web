angular.module('avatech.system').controller('HeaderController', ['$scope', '$location', '$modal','$route', 'RegisterDeviceModal', 'DeviceUploadModal', 'Global', function ($scope, $location, $modal, $route, RegisterDeviceModal, DeviceUploadModal, Global) {
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

    // $scope.loadModal = function() {

    //     var modalInstance = $modal.open({
    //         templateUrl: '/views/upload.html',
    //         controller: 'UploadModalController',
    //         // resolve: {
    //         //     items: function () {
    //         //       return $scope.items;
    //         //     }
    //         // }
    //     });

    //     modalInstance.result.then(function (uploaded) {
    //         // if new tests were uploaded, redirect to tests
    //         if (uploaded) {
    //             if ($location.path() == '/tests') $route.reload();
    //             else $location.path('/tests');
    //         }
    //     }, function () {
    //         // on dismiss
    //     });
    // }
    
}]);