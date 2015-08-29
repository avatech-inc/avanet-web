angular.module('avatech').factory('RegisterDeviceModal', function ($modal) {
        return { open: function(options) {

            var modalInstance = $modal.open({
                templateUrl: '/modules/register-device-modal/modal.html',
                controller: 'RegisterDeviceModalController',
                backdrop: 'static',
                windowClass: 'width-400'
            });

            return modalInstance.result;

        }
    }
});

angular.module('avatech').controller('RegisterDeviceModalController',
    function ($scope, $modalInstance, $timeout, $http, Global, Restangular) {

        $scope.global = Global;

        $scope.serial = { number: "" };

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.register = function () {

            $scope.checking = true;

            $scope.serial.number = $scope.serial.number.toUpperCase();

            if (!$scope.serial.number || $scope.serial.number == "") {
                alert("Please enter your SP1 serial number.");
                $scope.checking = false; return;
            }
            else if ($scope.serial.number.length != 14) {
                alert("Your SP1 serial number must be 14 digits - please make sure you entered it correctly.");
                $scope.checking = false; return;
            }
            else if ($scope.serial.number.indexOf("SP1") != 0) {
                alert('Your SP1 serial number must begin with "SP1"');
                $scope.checking = false; return;
            }

            Restangular.one('devices', $scope.serial.number).customPOST({}, 'register')
            // success
            .then(function(data){
                $scope.registering = true;
                $timeout(function(){
                    $scope.registering = false;
                    $scope.registered = true;
                }, 2000);
            },
            // error
            function(response) {
                alert(response.data.message);
            })
            // always
            .finally(function(){
                $scope.checking = false;
            });
        };
    }
);