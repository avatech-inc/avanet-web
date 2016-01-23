angular.module('avatech').controller('AdminOrgsController', 
    ['$scope', '$location', '$http', 'Global', 'Restangular',
    function ($scope, $location, $http, Global, Restangular) {
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
}]);
