angular.module('avatech.system').controller('ResetPasswordController', 
	['$scope', '$http', '$stateParams', 'Global', function ($scope, $http, $stateParams, Global) {

	$scope.forgotPasswordToken = $stateParams.forgotPasswordToken;
	$scope.validToken = null;
	$scope.successfulReset = false;

	$http.get("/v1/users/reset-password/" + $scope.forgotPasswordToken)
    .success(function (data) { 
    	$scope.validToken = data.ok;
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

        $http.post("/v1/users/reset-password", { 
        	forgotPasswordToken: $scope.forgotPasswordToken, 
        	password: $scope.password 
    	})
        .success(function (data) { 
        	console.log(data);
            if (data.success) {
            	$scope.successfulReset = true;
        	}
        	else $scope.error = data.error;
            //console.log(data);
        });
    };
}]);