angular.module('avatech.system').controller('ForgotPasswordController', 
	['$scope', '$http', 'Global', function ($scope, $http, Global) {

    $scope.send = function() {
    	// validation
 		if (!$scope.email || $scope.email == "") {
 			$scope.validationError = "Please enter a valid email"; return;
 		}
        $http.post("/v1/users/forgot-password", { email: $scope.email })
        .success(function (data) { 
 			$scope.validationError = null;
        	if (!data.success) {
        		$scope.validationError = "Oops! We couldn't find a user with that email."
    		}
            else {
                mixpanel.track("forgot password", { email: $scope.email });
            }
            $scope.resetSuccess = data.success;
        });
    };
}]);