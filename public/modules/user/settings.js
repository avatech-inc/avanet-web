
angular.module('avatech').controller('SettingsController', ['$scope', '$q', '$stateParams', '$location', '$modal', '$timeout', 'Global', 'Restangular', 'LocationSelectModal',
function ($scope, $q, $stateParams, $location, $modal, $timeout, Global, Restangular, LocationSelectModal) {
    $scope.global = Global;

    $scope.loadSettings = function() { 
        var RestObject = Restangular.one('users', $scope.global.user._id);
        RestObject.get().then(function (user) {
            $scope.user = user;
            $scope.user.location = $scope.user.location;

            $scope.tempUser = Restangular.copy(user);

            $scope.settings = angular.copy(user.settings);
        });

        // RestObject.getList('members').then(function (members) {
        //     console.log(members);
        //     $scope.members = members;
        // });
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

        $scope.tempUser.save().then(function(user) {
            if (user.error) {
                $scope.showError = user.error;
                $scope.scrollToError();
            }
            else {
                console.log(user);
                $scope.user = user;
                Global.setUser($scope.user);
                $scope.tempUser = Restangular.copy(user);

                $scope.showSuccess = "Your new information has been saved";
                $scope.scrollToError();
            }
        });
    }

    
    // LOCATION LAT/LNG INPUT

        $scope.$watch('user.location', function(newLocation){
            if (!$scope.user) return;
            if (!newLocation) return;
            if (newLocation.length) {
                $scope.user._lat = newLocation[1];
                $scope.user._lng = newLocation[0];
            }

            $scope.user.save();
            $scope.global.setUser($scope.user);
        });
        $scope.$watch('user._lat', function(newLat){
            if (!$scope.obs) return;
            if (!newLat) return;
            newLat = parseFloat(newLat);
            if (isNaN(newLat)) newLat = 0;
            if (newLat > 90) newLat = 90;
            else if (newLat < -90) newLat = -90;
            if (!$scope.user.location) $scope.user.location = [0,0];
            $scope.user.location[1] = newLat;
        });
        $scope.$watch('user._lng', function(newLng){
            if (!$scope.obs) return;
            if (!newLng) return;
            newLng = parseFloat(newLng);
            if (isNaN(newLng)) newLng = 0;
            if (newLng > 180) newLng = 180;
            else if (newLng < -180) newLng = -180;
            if (!$scope.user.location) $scope.user.location = [0,0];
            $scope.user.location[0] = newLng;
        });

        // SELECT LOCATION MODAL

        $scope.selectLocation = function() {

            LocationSelectModal.open({
                initialLocation: $scope.user.location
            }).then(function (location) {
                if (location && location.length == 2) {
                    location[0] = location[0].toFixed(7); 
                    location[1] = location[1].toFixed(7); 

                    $scope.user.location = location;

                    // var featureCodes = 
                    //     "&featureCode=MT" +
                    //     "&featureCode=BUTE" +
                    //     "&featureCode=CNYN" +
                    //     "&featureCode=CONE" +
                    //     "&featureCode=CRQ" +
                    //     "&featureCode=CRQS" +
                    //     "&featureCode=DVD" +
                    //     "&featureCode=GAP" +
                    //     "&featureCode=GRGE" +
                    //     "&featureCode=HLL" +
                    //     "&featureCode=HLLS" +
                    //     "&featureCode=MESA" +
                    //     "&featureCode=MND" +
                    //     "&featureCode=MRN" +
                    //     "&featureCode=MT" +
                    //     "&featureCode=MTS" +
                    //     "&featureCode=NTK" +
                    //     "&featureCode=NTKS" +
                    //     "&featureCode=PASS" +
                    //     "&featureCode=PK" +
                    //     "&featureCode=PKS" +
                    //     "&featureCode=RDGE" +
                    //     "&featureCode=RK" +
                    //     "&featureCode=RKS" +
                    //     "&featureCode=SLP" +
                    //     "&featureCode=SPUR" +
                    //     "&featureCode=VAL" +
                    //     "&featureCode=VALG" +
                    //     "&featureCode=VALS" +
                    //     "&featureCode=VALX" +
                    //     "&featureCode=VLC";


                    // $.getJSON("https://ba-secure.geonames.net/findNearbyJSON?lat=" + location[1] + "&lng=" + location[0] + "" + featureCodes + "&username=avatech")
                    // .success(function(data, status, headers, config) {
                    //     if (data.geonames && data.geonames.length == 1) {
                    //         var place = data.geonames[0];
                    //         var name = "";
                    //         if (place.name) name += place.name;
                    //         // if US, append admin area code, otherwise append admin area name
                    //         if (place.countryCode && place.countryCode == "US" && place.adminCode1) name += ", " + place.adminCode1;
                    //         else if (place.adminName1) name += ", " + place.adminName1;

                    //         //$scope.obs.locationName = name;
                    //         //if (place.countryCode) $scope.obs.country = place.countryCode;

                    //         $scope.$apply();
                    //     }
                    // });
                    // $.getJSON("https://ba-secure.geonames.net/srtm3JSON?lat=" + location[1] + "&lng=" + location[0] + "&username=avatech")
                    // .success(function(data, status, headers, config) {
                    //     if (data.srtm3) {
                    //         var elevation = data.srtm3.toFixed(0);
                    //         // check for 'empty' value of -32768 (http://glcfapp.glcf.umd.edu/data/srtm/questions.shtml#negative)
                    //         if (elevation != -32768) {
                    //             $scope.obs.elevation = elevation; // meters
                    //             $scope.$apply();
                    //         }
                    //         // if no data found, check astergdem
                    //         else {
                    //             $.getJSON("https://ba-secure.geonames.net/astergdemJSON?lat=" + location[1] + "&lng=" + location[0] + "&username=avatech")
                    //             .success(function(data, status, headers, config) {
                    //                 if (data.astergdem) {
                    //                     var elevation = data.astergdem.toFixed(0);
                    //                     // check for 'empty' value of -9999 
                    //                     if (elevation != -9999){
                    //                         $scope.obs.elevation = elevation;
                    //                         $scope.$apply();
                    //                     }
                    //                 }
                    //             });
                    //         }
                    //     }
                    // });
                }
            }, function () {
                // on dismiss
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
                //$http.post('/v1/users/' + $scope.htt, $scope.changePassword)
                $scope.user.customPOST($scope.changePassword, 'change-password')
                .then(function (data) { 
                    if (data.error) {
                        $scope.showErrorPassword = data.error;
                        $scope.scrollToErrorPassword();
                    }
                    else {
                        $scope.changePassword = {};
                        $scope.showSuccessPassword = "Your new password has been saved";
                        $scope.scrollToErrorPassword();
                    }
                });
            }
        }

}]);
