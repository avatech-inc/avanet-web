angular.module('avatech').controller('AdminController',
    ['$scope', '$location', '$http', 'Global',
    function ($scope, $location, $http, Global) {
    
    $scope.pages = [{
    	title: 'Users',
    	template: '/modules/admin/users.html'
    },
    {
        title: 'Organizations',
        template: '/modules/admin/orgs.html'
    }
    ];

    // select first page
    $scope.selectedPage = $scope.pages[0];

    $scope.selectPage = function(page) {
		$scope.selectedPage = page;
    }

}]);
