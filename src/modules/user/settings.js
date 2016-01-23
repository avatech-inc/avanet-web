angular.module('avatech').controller('SettingsController', 
    ['$scope', '$q', '$stateParams', '$location', '$timeout', 'Global', 'Restangular', '$http', 'LocationSelectModal',
    function ($scope, $q, $stateParams, $location, $timeout, Global, Restangular, $http, LocationSelectModal) {
    $scope.global = Global;

    $scope.loadSettings = function() { 
        var RestObject = Restangular.one('users', $scope.global.user._id);
        RestObject.get().then(function (user) {
            $scope.user = user;

            $scope.tempUser = Restangular.copy(user);

            $scope.settings = angular.copy(user.settings);
        });
    };
    $scope.loadSettings();

    $scope.$watch('settings',function(newSettings){
        if (!newSettings || !$scope.user) return;

        $scope.user.settings = $scope.settings;
        $scope.user.save();
        Global.setUser($scope.user);
    },true);

    $scope.scrollToError = function(){
        // jQuery stuff, not so elegant but what can ya do
        var target = $("#errorArea");
        if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top - 60
            }, 300);
        }
    }
    $scope.saveUserDetails = function() {
        $scope.showError = null;
        $scope.showSuccess = null;
        if(!$scope.registerForm.$valid) {
            $scope.showError = "Please complete all required fields";
            $scope.scrollToError();
        }
        // merge and save

        delete $scope.tempUser.location;

        $scope.tempUser.save()
        // success
        .then(function(user) {
            $scope.user = user;
            Global.setUser($scope.user);
            $scope.tempUser = Restangular.copy(user);

            $scope.showSuccess = "Your new information has been saved";
            $scope.scrollToError();
        },
        // error
        function(response) {
            $scope.showError = response.data.message;
            $scope.scrollToError();
        });
    }

    // LOCATION LAT/LNG INPUT
    $scope.$watch('user.location', function(newLocation, oldLocation) {
        if (!oldLocation || !newLocation) return;
        
        // if new location set, save user
        if (oldLocation.toString() != newLocation.toString()) {
            $scope.user.save();

            if (__PROD__) {
                mixpanel.track("changed home location");
            }

            $scope.global.setUser($scope.user);
        }
    });

    // SELECT LOCATION MODAL
    $scope.selectLocation = function() {
        LocationSelectModal.open({
            initialLocation: $scope.user.location
        }).then(function (location) {
            if (location && location.length == 2) {
                location[0] = parseFloat(location[0].toFixed(7)); 
                location[1] = parseFloat(location[1].toFixed(7)); 
                $scope.user.location = location;
            }
        });
    }

    function validateEmail(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 


    $scope.scrollToErrorPassword = function(){
        // jQuery stuff, not so elegant but what can ya do
        var target = $("#errorAreaPassword");
        if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top - 60
            }, 300);
        }
    }   
    $scope.changePassword = {};
    $scope.savePassword = function() {
        $scope.showErrorPassword = null;
        $scope.showSuccessPassword = null;

        if (!$scope.changePassword.currentPassword) {
            $scope.showErrorPassword = "Please enter your current password";
            $scope.scrollToErrorPassword();
        }
        else if (!$scope.changePassword.newPassword) {
            $scope.showErrorPassword = "Please enter a new passwrod";
            $scope.scrollToErrorPassword();
        }
        else if ($scope.changePassword.newPassword != $scope.changePassword.confirmPassword) {
            $scope.showErrorPassword = "Your new password doesn't match";
            $scope.scrollToErrorPassword();
        }
        else {
            $scope.user.customPOST($scope.changePassword, 'password')
            // success
            .then(function (data) {
                $scope.changePassword = {};
                $scope.showSuccessPassword = "Your new password has been saved";
                $scope.scrollToErrorPassword();

                if (__PROD__) {
                    mixpanel.track("changed password");
                }
            },
            // error
            function(response) {
                $scope.showErrorPassword = response.data.message;
                $scope.scrollToErrorPassword();
            });
        }
    }

    $scope.downloadData = function() {
        $scope.downloading = true;
        $http.get(window.apiBaseUrl + "sp/bulkDownload")
        .success(function (data) {
            window.location.href = data.url;
            $scope.downloading = false;
        })
        .error(function(){
            $scope.downloading = false;
        });
    }

}]);
