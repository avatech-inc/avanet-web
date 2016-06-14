
import './modal.html'

export const Publish = ['$uibModal', $uibModal => ({
    open: options => {
        if (!options.initialSharing) options.initialSharing = null

        let modalInstance = $uibModal.open({
            templateUrl: '/modules/publish-modal/modal.html',
            controller: 'PublishModalController',
            windowClass: 'width-400',
            // backdrop: 'static',
            resolve: {
                initialSharing: () => options.initialSharing
            }
        })

        return modalInstance.result
    }
})]

export const PublishController = [
    '$scope',
    '$uibModalInstance',
    'initialSharing',
    '$timeout',
    'Global',
    'Restangular',

    (
        $scope,
        $uibModalInstance,
        initialSharing,
        $timeout,
        Global,
        Restangular
    ) => {
        $scope.global = Global

        $scope.sharing = {
            published: true,
            organization: null,
            sharingLevel: 'public',
            shareWithAvyCenter: true,
            shareWithStudents: true,
            sharedOrganizations: []
        }

        if (initialSharing) {
            if (initialSharing.published !== null &&
                typeof initialSharing.published !== 'undefined') {
                $scope.sharing.published = initialSharing.published
            }

            if (initialSharing.organization !== null &&
                typeof initialSharing.organization !== 'undefined') {
                $scope.sharing.organization = initialSharing.organization
            }

            if (initialSharing.sharingLevel !== null &&
                typeof initialSharing.sharingLevel !== 'undefined') {
                $scope.sharing.sharingLevel = initialSharing.sharingLevel
            }

            if (initialSharing.shareWithAvyCenter !== null &&
                typeof initialSharing.shareWithAvyCenter !== 'undefined') {
                $scope.sharing.shareWithAvyCenter = initialSharing.shareWithAvyCenter
            }

            if (initialSharing.shareWithStudents !== null &&
                typeof initialSharing.shareWithStudents !== 'undefined') {
                $scope.sharing.shareWithStudents = initialSharing.shareWithStudents
            }

            if (initialSharing.sharedOrganizations !== null &&
                typeof initialSharing.sharedOrganizations !== 'undefined') {
                $scope.sharing.sharedOrganizations = initialSharing.sharedOrganizations
            }
        }

        $scope.close = () => $uibModalInstance.dismiss()

        $scope.publish = () => {
            // if student
            if ($scope.global.user.userType.indexOf('pro') === -1) {
                $scope.sharing.published = true
                $scope.sharing.organization = null
                $scope.sharing.sharingLevel = 'public'
                $scope.sharing.shareWithAvyCenter = true
                $scope.sharing.shareWithStudents = true
                $scope.sharing.sharedOrganizations = []
                $uibModalInstance.close($scope.sharing)

            // if regular user
            } else {
                // if org sharing level selected, make sure user has selected orgs
                if (
                    $scope.sharing.sharingLevel === 'org' &&
                    $scope.sharing.sharedOrganizations.length === 0
                ) {
                    alert('Please add an organization to share with.')
                } else {
                    $uibModalInstance.close($scope.sharing)
                }
            }
        }

        // search

        $scope.newSearch = () => {
            $scope.search = { query: '' }
        }

        $scope.doSearch = () => {
            $timeout.cancel($scope.search.timer)
            $scope.abortSearch = false

            if ($scope.search.query === '' || $scope.search.query.length < 3) {
                $scope.search.results = null
                $scope.abortSearch = true
                return
            }

            $scope.search.timer = $timeout(() => {
                $scope.search.searching = true

                Restangular
                    .all('orgs')
                    .getList({ query: $scope.search.query })
                    .then(orgs => {
                        $scope.search.searching = false
                        if (!$scope.abortSearch) {
                            $scope.search.results = orgs
                        }
                    })
            }, 400)
        }

        $scope.addOrg = org => {
            if (!$scope.isSelected(org._id)) {
                $scope.sharing.sharedOrganizations.push({
                    _id: org._id,
                    name: org.name,
                    type: org.type
                })
            }
        }

        $scope.selectAllOrgs = () => {
            angular.forEach($scope.global.orgs, org => {
                if (!$scope.isSelected(org._id)) {
                    $scope.sharing.sharedOrganizations.push({
                        _id: org._id,
                        name: org.name,
                        type: org.type
                    })
                }
            })
        }

        $scope.isSelected = orgId => {
            let isSelected = false

            angular.forEach($scope.sharing.sharedOrganizations, org => {
                if (orgId === org._id) {
                    isSelected = true
                }
            })

            return isSelected
        }

        $scope.removeOrg = org => {
            let index = $scope.sharing.sharedOrganizations.indexOf(org)

            $scope.sharing.sharedOrganizations.splice(index, 1)
        }
    }
]
