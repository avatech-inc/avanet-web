
import './admin.html'

const AdminController = ['$scope', $scope => {
    $scope.pages = [{
        title: 'Users',
        template: '/modules/admin/users.html'
    }, {
        title: 'Organizations',
        template: '/modules/admin/orgs.html'
    }]

    // select first page
    $scope.selectedPage = $scope.pages[0]

    $scope.selectPage = page => {
        $scope.selectedPage = page
    }
}]

export default AdminController
