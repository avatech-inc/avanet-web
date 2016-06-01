
import './orgs.html'

const AdminOrgsController = [
    '$scope',
    'Global',
    'Restangular',

    (
        $scope,
        Global,
        Restangular
    ) => {
        $scope.global = Global

        $scope.init = () => $scope.getOrgs()

        $scope.getOrgs = () => Restangular
            .all('orgs')
            .getList()
            .then(orgs => {
                $scope.orgs = orgs
            })
    }
]

export default AdminOrgsController
