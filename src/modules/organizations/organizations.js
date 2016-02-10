
import './new.html'
import './view.html'

const validateEmail = email => {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/  // eslint-disable-line max-len
    return re.test(email)
}

const OrganizationsController = [
    '$scope',
    '$q',
    '$log',
    '$stateParams',
    '$location',
    '$timeout',
    'Global',
    'Restangular',

    (
        $scope,
        $q,
        $log,
        $stateParams,
        $location,
        $timeout,
        Global,
        Restangular
    ) => {
        $scope.global = Global
        $scope.newOrg = {}
        $scope.selectedTab = null

        $scope.userIsAdmin = () => {
            let isAdmin = false

            // if user is Avanet admin, also can admin group
            if ($scope.global.user.admin) return true

            angular.forEach($scope.members, member => {
                if (member.admin && member.user._id === $scope.global.user._id) {
                    isAdmin = true
                }
            })

            return isAdmin
        }

        $scope.userIsMember = () => {
            let isMember = false

            angular.forEach($scope.members, member => {
                if (member.user._id === $scope.global.user._id) {
                    isMember = true
                }
            })

            return isMember
        }

        $scope.create = () => {
            $log.debug($scope.newOrgForm.$valid)

            if (!$scope.newOrgForm.$valid) return

            $log.debug($scope.newOrgForm)

            Restangular
                .all('orgs')
                .post($scope.newOrg)
                .then(newOrg => {
                    $location.path('orgs/' + newOrg._id)

                    if (!Global.orgs.length) {
                        Global.orgs = []
                    }

                    Global.orgs.push({ name: newOrg.name, _id: newOrg._id })
                },
                // error
                response => alert(response.data.message))
        }

        $scope.members = []
        $scope.students = []

        $scope.loadOrg = () => {
            let restObject = Restangular.one('orgs', $stateParams.orgId)

            restObject
                .get()
                .then(org => {
                    $scope.org = org
                    // org.name += " Test";
                    // org.save();
                })

            restObject
                .getList('members')
                .then(members => {
                    $scope.members = []
                    $scope.students = []

                    angular.forEach(members, member => {
                        if (member.student) {
                            $scope.students.push(member)
                        } else {
                            $scope.members.push(member)
                        }
                    })
                })
        }

        $scope.setMemberAdmin = (member, admin) => {
            // var RestObject = Restangular.one('orgs', $stateParams.orgId).one('members');
            member.admin = admin
            member.save()
        }

        $scope.removeMember = (member, index) => {
            member.remove()
            $scope.members.splice(index, 1)
        }

        $scope.removeStudent = (member, index) => {
            member.remove()
            $scope.students.splice(index, 1)
        }

        let addMember = userIdOrEmail => {
            Restangular
                .one('orgs', $stateParams.orgId)
                .all('members')
                .post({ userIdOrEmail: userIdOrEmail })
                // success
                .then(member => {
                    // add new member to  collection
                    $scope.members.push(member)
                    // $scope.$apply();
                },
                // error
                () => $log.debug(userIdOrEmail)
            )
        }

        $scope.addMember = user => {
            if (user.isMember) return

            addMember(user._id)
        }

        $scope.inviteEmail = () => {
            if (!$scope.search.email) return

            addMember($scope.search.email)
        }

        $scope.allowMemberRemove = member => {
            return (!(
                member.admin &&
                member.user._id === $scope.global.user._id
            ))
        }

        $scope.isOnlyAdmin = member => {
            let adminCount = 0

            angular.forEach($scope.members, m => {
                if (m.admin) adminCount++
            })

            return (adminCount === 1 && member.admin)
        }

        // user search

        $scope.newSearch = () => {
            $scope.search = { query: '' }

            // $scope.focus('focusSearch');
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
                    .all('users')
                    .getList({ query: $scope.search.query })
                    .then(users => {
                        $scope.search.searching = false

                        if (users.length === 0) {
                            if (
                                $scope.search.query.indexOf('@') > -1 &&
                                validateEmail($scope.search.query)
                            ) {
                                $scope.search.email = $scope.search.query
                            } else {
                                $scope.search.email = null
                            }
                        }

                        // detect if already members
                        for (let r = 0; r < users.length; r++) {
                            let user = users[r]

                            for (let i = 0; i < $scope.members.length; i ++) {
                                if ($scope.members[i].user._id === user._id) {
                                    user.isMember = true
                                    break
                                }
                            }

                            if (user.isMember === null) {
                                user.isMember = false
                            }
                        }

                        if (!$scope.abortSearch) $scope.search.results = users
                    })
            }, 400)
        }

        $scope.onLogoUpload = file => {
            $scope.org.logoUrl = file.url
            $scope.org.save()
            $scope.refreshOrg()
        }

        $scope.removeLogo = file => {
            $scope.org.logoUrl = null
            $scope.org.save()
            $scope.refreshOrg()
        }

        $scope.refreshOrg = () => {
            for (let i = 0; i < $scope.global.orgs.length; i++) {
                if ($scope.global.orgs[i]._id === $scope.org._id) {
                    $scope.global.orgs[i] = $scope.org
                }
            }
        }
    }
]

export default OrganizationsController
