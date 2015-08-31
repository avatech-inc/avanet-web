angular.module('avatech.system').controller('LoginController',
function ($scope, $rootScope, $location, $http, Global, Restangular) {
    
    $scope.busy = false;

    $scope.submit = function() {
        $scope.busy = true;
        $scope.validationError = null;

        // browser autofill hack
        // todo: this doesn't seem to work in every case
        // todo: new way of doing it? just set $scope.email and password by jQuery value...
        $("[ng-model]").each(function(index,el){
            var ngModel = angular.element(el).data('$ngModelController');
            var val = $(el).val();
            ngModel.$setViewValue(val);
        });

        // basic validation
        if (!$scope.email || $scope.email == "" || !$scope.password || $scope.password == "") {
            $scope.busy = false;
            $scope.validationError = "badEntry";
            return;
        }
        // server auth
        Restangular.all('users/authenticate').post({ 
            email: $scope.email, 
            password: $scope.password 
        })
        // on login success
        .then(function(auth) {
            Global.login(auth);
        }, 
        // on login error
        function(response) {

            if (response.status == 401)
                $scope.validationError = response.data.message;
            else
                $scope.validationError = "Server Error. Please try again";
            
            $scope.password = "";
            $scope.busy = false;

        });
    };
});