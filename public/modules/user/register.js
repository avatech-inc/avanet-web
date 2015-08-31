angular.module('avatech.system').controller('RegisterController', 
  function ($scope, $rootScope, $http, $stateParams, $location, Global, Restangular) {

	$scope.isPending = (($stateParams.userHashId == "") || !$stateParams.orgHashId) ? false : null;
	$scope.successfulReset = false;
  $scope.email = "";

  if ($stateParams.userHashId && $stateParams.userHashId != "") {
    Restangular.one('users/pending', $stateParams.userHashId).get()
    .then(function(){
      $scope.isPending = true;
      $scope.userHashId = $stateParams.userHashId;
    },
    // error
    function() {
      $scope.isPending = false;
    });
  }
  
  // todo: this needs to be re-implemented if we want education edition to work
  // if ($stateParams.orgHashId && $stateParams.orgHashId != "") {
  //   $http.get("/v1/orgs/education/" + $stateParams.orgHashId)
  //     .success(function (data) { 
  //         console.log(data);
  //         $scope.isPending = data.ok;
  //         if ($scope.isPending) $scope.org = data;
  //     });
  // }

    $scope.reg = {};

    $scope.scrollToError = function(){
        // jQuery stuff, not so elegant but what can ya do
        var target = $("#errorArea");
        if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top - 12
            }, 300);
        }
    }
    $scope.register = function() {
        $scope.showError = null;
        if(!$scope.registerForm.$valid) {
            $scope.showError = "Please complete all required fields";
            $scope.scrollToError();
        }
        else if ($scope.reg.password.length && $scope.reg.password.length < 6) {
            $scope.showError = "Password must be at least 6 characters long";
            $scope.scrollToError();
        }
        else if ($scope.reg.password.length && ($scope.reg.password != $scope.reg.passwordConfirm)) {
            $scope.showError = "Make sure your passwords match";
            $scope.scrollToError();
        }
        else if (!$scope.isPro) {
            if ($scope.org)
              alert("You must certify that you are a registered student of " + $scope.org.name  + ".");
            else 
              alert("You must certify that you are a snow professional.");
            return;
        }
        else if (!$scope.acceptTerms) {
            alert("You must accept the Terms of Service.");
            return;
        }
        else {

            var newUser = {
                fullName: $scope.reg.name,
                email: $scope.reg.email,
                jobTitle: $scope.reg.jobTitle,
                profession: $scope.reg.profession,
                org: $scope.reg.org,
                city: $scope.reg.city,
                state: $scope.reg.state,
                postal: $scope.reg.postal,
                country: $scope.reg.country,
                password: $scope.reg.password,

                userHashId: $scope.userHashId,
                orgHashId: $stateParams.orgHashId
            }

            Restangular.all('users').post(newUser)
            // success
            .then(function (data) {
                mixpanel.track("registered");
                Global.login(newUser.email, newUser.password);
            }, 
            // error
            function(response) {
                $scope.showError = response.data.message;
                $scope.scrollToError();
            });
        }
    };

});