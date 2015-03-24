angular.module('avatech').controller('AdminController', ['$scope', '$location', '$http', 'Global', function ($scope, $location, $http, Global) {
    
    $scope.pages = [{
    	title: 'Users',
    	template: '/modules/admin/users.html'
    },
    {
        title: 'Organizations',
        template: '/modules/admin/orgs.html'
    },
    {
        title: 'Preorders',
        template: '/modules/admin/orders.html'
    }];

    // select first page
    $scope.selectedPage = $scope.pages[2];

    $scope.selectPage = function(page) {
		$scope.selectedPage = page;
    }

}]);