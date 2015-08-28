angular.module('avatech.system').controller('LoginController',
function ($scope, $rootScope, $location, $http, Global, Restangular) {
    
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
        Restangular.all('users/session').post({ 
            email: $scope.email, 
            password: $scope.password 
        })
        // on login success
        .then(function(data) {

            $scope.validationError = null;
            Global.login(data.user, data.authToken);

            $rootScope.initPromise = Global.init();
            // todo: duplicate of app.js
            if ($rootScope.initPromise) $rootScope.initPromise.then(function(orgs) {
                $rootScope.orgsLoaded = true;
            });

        }, 
        // on login error
        function(response) {

            if (response.status == 401) {
                $scope.validationError = response.data.message;
            }
            else {
                $scope.validationError = "Server Error. Please try again";
            }
            
            $scope.password = "";
            $scope.busy = false;

          // console.log("Error with status code: " + response.status);
          // console.log(response);

        });

        // $http.post("/v1/users/login", { email: $scope.email, password: $scope.password })
        // .success(function (data) { 
        // 	// if auth successful, login
        // 	if (data.success) {
        //         $scope.validationError = null;
        //         Global.login(data.user, data.token);

        //         $rootScope.initPromise = Global.init();
        //         // todo: duplicate of app.js
        //         if ($rootScope.initPromise) $rootScope.initPromise.then(function(orgs) {
        //             $rootScope.orgsLoaded = true;
        //         });
        //     }
        // 	// otherwise, show the error
        //     else {
        //         $scope.validationError = data.error;
        //         // reset password field
        //         $scope.password = "";
        //         $scope.busy = false;
        //     }
        // })
        // .error(function (data, status) { 

        // });
    };
});