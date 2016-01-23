angular.module('avatech').factory('PublishModal', ['$uibModal', function ($uibModal) {
    return { open: function(options) {

        if (!options.initialSharing) options.initialSharing = null;
        
         var modalInstance = $uibModal.open({
            templateUrl: '/modules/publish-modal/modal.html',
            controller: 'PublishModalController',
            windowClass: 'width-400',
            //backdrop: 'static',
            resolve: {
                initialSharing: function () {
                    return options.initialSharing;
                }
            }
        });

        return modalInstance.result;

    }
}
}]);

angular.module('avatech').controller('PublishModalController',
    ['$scope', '$uibModalInstance', 'initialSharing', '$timeout', 'Global', 'Restangular', 
    function ($scope, $uibModalInstance, initialSharing, $timeout, Global, Restangular) {

        $scope.global = Global;

        $scope.sharing = {
            published: true,
            organization: null,
            sharingLevel: "public",
            shareWithAvyCenter: true,
            shareWithStudents: true,
            sharedOrganizations: []
        }

        if (initialSharing) {
            if (initialSharing.published  != null) $scope.sharing.published = initialSharing.published;
            if (initialSharing.organization  != null) $scope.sharing.organization = initialSharing.organization;
            if (initialSharing.sharingLevel  != null) $scope.sharing.sharingLevel = initialSharing.sharingLevel;
            if (initialSharing.shareWithAvyCenter != null) $scope.sharing.shareWithAvyCenter = initialSharing.shareWithAvyCenter;
            if (initialSharing.shareWithStudents != null) $scope.sharing.shareWithStudents = initialSharing.shareWithStudents;
            if (initialSharing.sharedOrganizations  != null) $scope.sharing.sharedOrganizations = initialSharing.sharedOrganizations;
        }

        $scope.close = function () {
            $uibModalInstance.dismiss();
        };
        $scope.publish = function () {
            // if student
            if ($scope.global.user.userType.indexOf("pro") == -1) {
                $scope.sharing.published = true;
                $scope.sharing.organization = null;
                $scope.sharing.sharingLevel = "public";
                $scope.sharing.shareWithAvyCenter = true;
                $scope.sharing.shareWithStudents = true;
                $scope.sharing.sharedOrganizations = [];
                $uibModalInstance.close($scope.sharing);
            }
            // if regular user
            else {
                // if org sharing level selected, make sure user has selected orgs
                if ($scope.sharing.sharingLevel == 'org' && $scope.sharing.sharedOrganizations.length == 0)
                    alert("Please add an organization to share with.")
                else
                    $uibModalInstance.close($scope.sharing);
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
                    if (!$scope.abortSearch) $scope.search.results = orgs;
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
            var index = $scope.sharing.sharedOrganizations.indexOf(org);
            $scope.sharing.sharedOrganizations.splice(index, 1);    
        }
    }
]);
