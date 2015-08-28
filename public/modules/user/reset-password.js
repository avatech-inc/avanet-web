angular.module('avatech.system').controller('ResetPasswordController', 
	function ($scope, $http, $stateParams, Global, Restangular) {

	$scope.forgotPasswordToken = $stateParams.forgotPasswordToken;
	$scope.validToken = null;
	$scope.successfulReset = false;

    var restPasswordBase = Restangular.all('users/reset-password');

    restPasswordBase.get($scope.forgotPasswordToken)
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

        restPasswordBase.post({
        	forgotPasswordToken: $scope.forgotPasswordToken, 
        	password: $scope.password 
    	})
         // password reset success
        .then(function() {
            $scope.successfulReset = true;
            mixpanel.track("password reset");
        }, 
        // token not found
        function(response) {
            $scope.error = "There was an error updating your password. Please try again or contact support for assistance."
        });
    };
});