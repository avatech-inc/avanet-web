angular.module('avatech.system').controller('LoginController', ['$scope', '$rootScope', '$location', '$cookies', '$http', 'Global',
function ($scope, $rootScope, $location, $cookies, $http, Global) {
    
    $scope.busy = false;

    $scope.submit = function() {
        $scope.busy = true;

        // browser autofill hack
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
        $http.post("/v1/users/login", { email: $scope.email, password: $scope.password })
        .success(function (data) { 
        	// if auth successful, login
        	if (data.success) {
                $scope.validationError = null;
                Global.login(data.user, data.token);

                $rootScope.initPromise = Global.init();
                // todo: duplicate of app.js
                if ($rootScope.initPromise) $rootScope.initPromise.then(function(orgs) {
                    $rootScope.orgsLoaded = true;
                });
            }
        	// otherwise, show the error
            else {
                $scope.validationError = data.error;
                // reset password field
                $scope.password = "";
                $scope.busy = false;
            }
        })
        .error(function (data, status) { 

        });
    };
}]);