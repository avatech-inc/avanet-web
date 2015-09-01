
angular.module('avatech').controller('SnowpitPublishModalController', [ '$scope','$modalInstance', 'initialSharing', 'objectName', '$timeout', 'Global', 'Restangular', 
    function ($scope, $modalInstance, initialSharing, objectName, $timeout, Global, Restangular) {

        $scope.global = Global;

        $scope.objectName = objectName;

        $scope.sharing = {
            level: "pros",
            avyCenter: true,
            students: true,
            selectedOrgs: []
        }
        if (initialSharing.level  != null) $scope.sharing.level = initialSharing.level;
        if (initialSharing.orgs  != null) $scope.sharing.selectedOrgs = initialSharing.orgs;
        if (initialSharing.avyCenter != null) $scope.sharing.avyCenter = initialSharing.avyCenter;
        if (initialSharing.students != null) $scope.sharing.students = initialSharing.students;

        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.publish = function () {
            // if student
            if ($scope.global.user.student === true) {
                $scope.sharing.level = "student";
                $scope.sharing.avyCenter = true;
                $scope.sharing.students = true;
                $scope.sharing.selectedOrgs = [];

                $modalInstance.close($scope.sharing);
            }
            // if regular user
            else {
                // if org sharing level selected, make sure user has selected orgs
                if ($scope.sharing.level == 'org' && $scope.sharing.selectedOrgs.length == 0)
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

                Restangular.all("orgs").getList({ query: $scope.search.query }).then(function(orgs) {
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

                    if (!$scope.abortSearch) $scope.search.results = orgs;
                });            

            },400);
        }
        $scope.addOrg = function(org) {
            if (!$scope.isSelected(org._id))
                $scope.sharing.selectedOrgs.push({ _id: org._id, name: org.name, type: org.type });
        }
        $scope.selectAllOrgs = function() {
            angular.forEach($scope.global.orgs,function(org){
                if (!$scope.isSelected(org._id))
                    $scope.sharing.selectedOrgs.push({ _id: org._id, name: org.name, type: org.type });
            });
        }
        $scope.isSelected = function(orgId) {
            var isSelected = false;
            angular.forEach($scope.sharing.selectedOrgs,function(org) {
                if (orgId == org._id) isSelected = true;
            });
            return isSelected;
        }
        $scope.removeOrg = function(org) {
            console.log(org);
            var index = $scope.sharing.selectedOrgs.indexOf(org);
            console.log(index);
            $scope.sharing.selectedOrgs.splice(index, 1);    
        }

    }
]);