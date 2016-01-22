angular.module('avatech').controller('ForgotPasswordController', 
    function ($scope, $http, Global, Restangular) {

    $scope.send = function() {
    	// validation
        // todo: validate email!
 		if (!$scope.email || $scope.email == "") {
 			$scope.validationError = "Please enter a valid email"; return;
 		}

        Restangular.all('users/forgot-password').post({ 
            email: $scope.email
        })
        // user found
        .then(function(data) {

            if (__PROD__) {
                mixpanel.track("forgot password", { email: $scope.email });
            }

            $scope.resetSuccess = true;
            $scope.validationError = null;

        }, 
        // user not found
        function(response) {

            if (response.status == 404) {
                $scope.validationError =  "Oops! We couldn't find a user with that email."
            }
            else {
                $scope.validationError = "Server Error. Please try again";
            }

        });
    };
});