angular.module('avatech').factory('RegisterDeviceModal', [ '$modal',
    function ($modal) {

        return { open: function(options) {

            var modalInstance = $modal.open({
                templateUrl: '/modules/register-device-modal/modal.html',
                controller: 'RegisterDeviceModalController',
                backdrop: 'static',
                windowClass: 'width-400'
            });

            return modalInstance.result;

        }
    } }
]);

angular.module('avatech').controller('RegisterDeviceModalController', [ '$scope','$modalInstance', '$timeout', '$http', 'Global',
    function ($scope, $modalInstance, $timeout, $http, Global) {

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

            $http.post('/v1/devices/' + $scope.serial.number + '/register', { }).
              success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if (data.error) {
                    alert(data.error);
                }
                else if (data.registered) {
                    $scope.registering = true;
                    $timeout(function(){
                        $scope.registering = false;
                        $scope.registered = true;
                    }, 2000);
                }
                else alert("An error ocurred. Please try again.");
                
                $scope.checking = false;
              }).
              error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
              });

            //alert($scope.serial.number);
            //$modalInstance.close();
        };
    }
])