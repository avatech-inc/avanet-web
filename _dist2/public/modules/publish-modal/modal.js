angular.module('avatech').factory('PublishModal', [ '$modal',
    function ($modal) {

        // modalInstance.result.then(function (sharing) {

        //     angular.forEach($scope.selectedProfiles,function(profile) {

        //         // get profile from array
        //         // todo: clean this up, not very angular-y...
        //         // this needs to be done since updating myProfiles replaces the references
        //         // should really implement a central store like in the app, with the same
        //         // replace-or-add type functionality
        //         // for (var i = 0; i < $scope.myProfiles.length; i++) {
        //         //     var _profile = $scope.myProfiles[i];
        //         //     if (_profile.type == profile.type && _profile._id == profile._id)  profile = _profile;
        //         // }

        //         profile.published = true;
        //         profile.sharingLevel = sharing.level;
        //         profile.shareWithAvyCenter = sharing.avyCenter;
        //         profile.sharedOrganizations = sharing.selectedOrgs;
        //         profile.shareWithStudents = sharing.students;

        //         Observations.save(profile);

        //     });
    
        //     // clear selected profiles
        //     $scope.selectedProfiles = [];

        // }, function () {
        //     // on dismiss
        // });

        return { open: function(options) {

            if (!options.initialSharing) options.initialSharing = null;
            
             var modalInstance = $modal.open({
                templateUrl: '/modules/publish-modal/modal.html',
                controller: 'PublishModalController',
                windowClass: 'width-400',
                //backdrop: 'static',
                resolve: {
                    //objectName: function() { return 'profile' },
                    initialSharing: function () {
                        return options.initialSharing;
                      // return {
                      //   level: null,
                      //   orgs: null,
                      //   avyCenter: null,
                      //   students: null
                      // };
                    }
                }
            });

            return modalInstance.result;

        }
    } }
]);

angular.module('avatech').controller('PublishModalController', [ '$scope','$modalInstance', 'initialSharing', '$timeout', 'Global', 'Restangular', 
    function ($scope, $modalInstance, initialSharing, $timeout, Global, Restangular) {

        $scope.global = Global;

        //$scope.objectName = objectName;

        $scope.sharing = {
            published: true,
            organization: null,
            sharingLevel: "pros",
            shareWithAvyCenter: true,
            shareWithStudents: true,
            sharedOrganizations: []
        }

        // published: { type: Boolean, default: false },
        // sharingLevel: { type: String },
        // shareWithAvyCenter: { type: Boolean, default: true },
        // shareWithStudents: { type: Boolean, default: true },
        // sharedOrganizations: [{ type: Schema.Types.ObjectId, ref: 'Organization' }]


        if (initialSharing) {
            if (initialSharing.published  != null) $scope.sharing.published = initialSharing.published;
            if (initialSharing.organization  != null) $scope.sharing.organization = initialSharing.organization;
            if (initialSharing.sharingLevel  != null) $scope.sharing.sharingLevel = initialSharing.sharingLevel;
            if (initialSharing.shareWithAvyCenter != null) $scope.sharing.shareWithAvyCenter = initialSharing.shareWithAvyCenter;
            if (initialSharing.shareWithStudents != null) $scope.sharing.shareWithStudents = initialSharing.shareWithStudents;
            if (initialSharing.sharedOrganizations  != null) $scope.sharing.sharedOrganizations = initialSharing.sharedOrganizations;
        }

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.publish = function () {
            // if student
            if ($scope.global.user.student === true) {
                $scope.sharing.published = true;
                $scope.sharing.organization = null;
                $scope.sharing.sharingLevel = "student";
                $scope.sharing.shareWithAvyCenter = true;
                $scope.sharing.shareWithStudents = true;
                $scope.sharing.sharedOrganizations = [];

                $modalInstance.close($scope.sharing);
            }
            // if regular user
            else {
                // if org sharing level selected, make sure user has selected orgs
                if ($scope.sharing.sharingLevel == 'org' && $scope.sharing.sharedOrganizations.length == 0)
                    alert("Please add an organization to share with.")
                else
                    $modalInstance.close($scope.sharing);
            }
        };

        // search

        $scope.newSearch = function() {
            $scope.search = { query: "" };
        }
        $scope.doSearch = function() {
            $timeout.cancel($scope.search.timer);
            $scope.abortSearch = false;
            if ($scope.search.query == "" || $scope.search.query.length < 3) {
                $scope.search.results = null;
                $scope.abortSearch = true;
                return;
            }
            $scope.search.timer = $timeout(function(){
                $scope.search.searching = true;

                Restangular.one("orgs").getList("search", { query: $scope.search.query }).then(function(users) {
                    $scope.search.searching = false;

                    // if (users.length == 0) {
                    //     if ($scope.search.query.indexOf('@') > -1 && validateEmail($scope.search.query)) $scope.search.email =  $scope.search.query;
                    //     else $scope.search.email = null;
                    // }

                    // $scope.members = [];
                    // // detect if already members
                    // for (var r = 0; r < users.length; r++) {
                    //     var user = users[r];
                    //     for (var i = 0; i < $scope.members.length; i ++) {
                    //         if ($scope.members[i].user._id == user._id) {
                    //             user.isMember = true;
                    //             break;
                    //         }
                    //     }
                    //     if (user.isMember == null) user.isMember = false;
                    // }

                    if (!$scope.abortSearch) $scope.search.results = users;
                });            

            },400);
        }
        $scope.addOrg = function(org) {
            if (!$scope.isSelected(org._id))
                $scope.sharing.sharedOrganizations.push({ _id: org._id, name: org.name, type: org.type });
        }
        $scope.selectAllOrgs = function() {
            angular.forEach($scope.global.orgs,function(org){
                if (!$scope.isSelected(org._id))
                    $scope.sharing.sharedOrganizations.push({ _id: org._id, name: org.name, type: org.type });
            });
        }
        $scope.isSelected = function(orgId) {
            var isSelected = false;
            angular.forEach($scope.sharing.sharedOrganizations,function(org) {
                if (orgId == org._id) isSelected = true;
            });
            return isSelected;
        }
        $scope.removeOrg = function(org) {
            console.log(org);
            var index = $scope.sharing.sharedOrganizations.indexOf(org);
            console.log(index);
            $scope.sharing.sharedOrganizations.splice(index, 1);    
        }

    }
]);