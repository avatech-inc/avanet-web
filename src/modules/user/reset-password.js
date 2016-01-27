angular.module('avatech').controller('ResetPasswordController', 
    ['$scope', '$http', '$stateParams', 'Global', 'Restangular',
	function ($scope, $http, $stateParams, Global, Restangular) {

	$scope.forgotPasswordToken = $stateParams.forgotPasswordToken;
	$scope.validToken = null;
	$scope.successfulReset = false;

    Restangular.one('users/forgot-password', $scope.forgotPasswordToken).get()
    // token found
    .then(function() {
        $scope.validToken = true;
    }, 
    // token not found
    function(response) {
        $scope.validToken = false;
    });

 	$scope.reset = function() {
    	// validation
 		if (!$scope.password || $scope.password == "") {
 			$scope.validationError = "Please enter a new password"; return;
 		}
 		if ($scope.password != $scope.passwordConfirm) {
 			$scope.validationError = "Please make sure your passwords match"; return;
 		}
    	// all good, proceed
 		$scope.validationError = null;

        Restangular.one('users/forgot-password', $scope.forgotPasswordToken).customPOST({
        	password: $scope.password 
    	}, 'reset')
         // password reset success
        .then(function() {
            $scope.successfulReset = true;

            if (__PROD__) {
                analytics.track("password reset");
            }
        }, 
        // token not found
        function(response) {
            $scope.error = "There was an error updating your password. Please try again or contact support for assistance."
        });
    };
}]);
