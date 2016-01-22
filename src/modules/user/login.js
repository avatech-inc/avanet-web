angular.module('avatech').controller('LoginController',
function ($scope, $rootScope, $timeout, $location, $http, Global, Restangular) {
    
    $scope.busy = false;

    $scope.submit = function() {
        // browser autofill hack
        $scope.email = $(".signin #email").val();
        $scope.password = $(".signin #password").val();

        // basic validation
        if (!$scope.email || $scope.email == "" || !$scope.password || $scope.password == "") {
            $scope.validationError = "badEntry";
            return;
        }

        $scope.busy = true;

        // server auth
        Global.login($scope.email, $scope.password,
        // login success
        function() { },  
        // login error
        function(message) {
            $timeout(function(){
                $scope.validationError = message;
                $scope.password = "";
                $scope.busy = false;
            },1000);
        });
    };
});