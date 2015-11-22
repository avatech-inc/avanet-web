
angular.module('avatech').controller('TestPreviewController', [ '$scope', '$rootScope', '$location', '$state', '$stateParams', 'Tests', 'snowpitExport', 'snowpitViews', 'FontLoader', 'Global', 'Observations', '$modal', 'Confirm', 'Lightbox',
    function ($scope, $rootScope, $location, $state, $stateParams, Tests, snowpitExport, snowpitViews, FontLoader, Global, Observations, $modal, Confirm, Lightbox) {

        $rootScope.$broadcast('resizeMap');

        $scope.global = Global;

        $scope.discussMode = false;

        $scope.go = function(url) {
            $location.path(url);
        }

        // // delete profile
        // $scope.delete = function() {

        //     Confirm.open("Are you sure you want to delete this profile?").then(function () {

        //         Observations.remove($scope.profile);

        //         $scope.close();

        //     }, function () {
        //         // user pressed no
        //     });
        // }

        // // publish
        // $scope.publish = function() {
        //      var modalInstance = $modal.open({
        //         templateUrl: '/modules/snowpit-editor/snowpit-publish-modal.html',
        //         controller: 'SnowpitPublishModalController',
        //         windowClass: 'width-480',
        //         //backdrop: 'static',
        //         resolve: {
        //             objectName: function() { return 'profile' },
        //             initialSharing: function () {
        //               return {
        //                 level: $scope.profile.sharingLevel,
        //                 orgs: $scope.profile.sharedOrganizations,
        //                 avyCenter: $scope.profile.shareWithAvyCenter,
        //                 students: $scope.profile.shareWithStudents
        //               };
        //             }
        //         }
        //     });

        //     modalInstance.result.then(function (sharing) {

        //         $scope.profile.published = true;
        //         $scope.profile.sharingLevel = sharing.level;
        //         $scope.profile.shareWithAvyCenter = sharing.avyCenter;
        //         $scope.profile.sharedOrganizations = sharing.selectedOrgs;
        //         $scope.profile.shareWithStudents = sharing.students;

        //         Observations.save($scope.profile);

        //     }, function () {
        //         // on dismiss
        //     });
        // }

        // detail level
        $scope.detailLevel = $scope.global.user.settings.graphDetailLevel;
        if ($scope.detailLevel == null) $scope.detailLevel = 1;

        $scope.toggleDetail = function() {
            $scope.detailLevel++;
            if ($scope.detailLevel == 6) $scope.detailLevel = 1;
            // save to user settings
            $scope.global.setUserSetting("graphDetailLevel", $scope.detailLevel);
        }

        if ($stateParams.testId) {
            $scope.testId = $stateParams.testId;
            // load profile
            Tests.get({ testId: $stateParams.testId }, function(profile) {

                // broadcast so map can show location
                $rootScope.$broadcast('profileLoaded', profile);

                // make sure fonts are loaded so canvas renders them
                var fontLoader = new FontLoader(["Roboto Condensed","snowsymbols"], {
                    "fontsLoaded": function(error) {
                        if (error !== null) {
                            // Reached the timeout but not all fonts were loaded
                            console.log(error.message);
                            console.log(error.notLoadedFontFamilies);
                        } else {
                            // All fonts were loaded
                            console.log("all fonts were loaded");
                        }

                        //$scope.settings.fontsLoaded = true;
                        $scope.profile = angular.copy(profile);
                        $scope.$apply();
                    }
                    //, "fontLoaded": function(fontFamily) {
                    //     // One of the fonts was loaded
                    //     console.log("font loaded: " + fontFamily);
                    // }
                }, 3000);
                fontLoader.loadFonts();

            });
        }
    }
])