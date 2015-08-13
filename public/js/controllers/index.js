angular.module('avatech.system').controller('IndexController', ['$scope', '$location', '$modal', 'Global', function ($scope, $location, $modal, Global) {
    $scope.global = Global;
    //if (!Global.user.admin) $location.path("/profiles/new");

    // todo: THIS IS A DUPLICATE OF HEADER.JS - MUST CONSOLIDATE!
    $scope.sync = function() {

        var modalInstance = $modal.open({
            templateUrl: '/views/upload.html',
            controller: 'UploadModalController',
            // resolve: {
            //     items: function () {
            //       return $scope.items;
            //     }
            // }
        });

        modalInstance.result.then(function (uploaded) {
            // if new tests were uploaded, redirect to tests
            if (uploaded) {
                if ($location.path() == '/tests') $route.reload();
                else $location.path('/tests');
            }
        }, function () {
            // on dismiss
        });
    };
}]);