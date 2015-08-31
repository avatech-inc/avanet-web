angular.module('avatech.system').controller('LoginController',
function ($scope, $rootScope, $timeout, $location, $http, Global, Restangular) {
    
    $scope.busy = false;

    $scope.submit = function() {

        // browser autofill hack
        // todo: this doesn't seem to work in every case
        // todo: new way of doing it? just set $scope.email and password by jQuery value...
        // $("[ng-model]").each(function(index,el){
        //     var ngModel = angular.element(el).data('$ngModelController');
        //     var val = $(el).val();
        //     ngModel.$setViewValue(val);
        // });
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
        // success
        function() {
            $scope.success = true;
        },  
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