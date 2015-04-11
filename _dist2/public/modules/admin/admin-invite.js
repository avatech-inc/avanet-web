angular.module('avatech.system').controller('AdminInviteController', ['$scope', '$location', '$http', 'Global', function ($scope, $location, $http, Global) {
    $scope.global = Global;

	// executes on 'page load'
	$scope.init = function() {
		$scope.getInvites();
	}
    
    $scope.getInvites = function() {
	    $http.get("/admin/invites").success(function(invites) {
	    	$scope.invites = invites;
	    });
	}

	$scope.form = {
        invalidEmail: false,
        emailToinvite: ""
    }

    $scope.ivnite = function() {
        $scope.form.error = null;
    	if (!$scope.form.emailToinvite || $scope.form.emailToinvite == "") {
    		return;
    	}
    	$http.post("/admin/invites", { 
        	email: $scope.form.emailToinvite 
    	})
        .success(function (data) { 
            console.log(data);
            if (data.error) {
                $scope.form.error = data.error;
                //$scope.form.invalidEmail = true;
            }
        	if (data.success) {
	        	$scope.form.emailToinvite = "";
	        	// add to the beginning of the invites array
	        	$scope.invites.unshift(data.item);
	        }
        });
    }
    $scope.deleteInvite = function(invite) {
    	// delete from collection
    	angular.forEach($scope.invites,function(_invite,index){
    		if(_invite == invite) $scope.invites.splice(index,1);
    	});
    	// delete on server
    	$http.delete("/admin/invites/" + invite._id)
    	.success(function (data) { 
    		console.log(data);
        	// if (data.success) {
	        // 	$scope.emailToinvite = "";
	        // 	// add to the beginning of the invites array
	        // 	$scope.invites.unshift(data.item);
	        // }
        });
    }

}]);