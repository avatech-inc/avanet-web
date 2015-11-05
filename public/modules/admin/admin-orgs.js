angular.module('avatech.system').controller('AdminOrgsController', function ($scope, $location, $http, Global, Restangular) {
    $scope.global = Global;

    $scope.init = function() {
        $scope.getOrgs();
    }
    $scope.getOrgs = function() {

        Restangular.all('orgs').getList()
        .then(function(orgs) {
            $scope.orgs = orgs;
        });
    }
});