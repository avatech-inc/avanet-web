
const validateEmail = email => {
    // eslint-disable-next-line no-useless-escape, max-len
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // eslint-disable-line max-len
    return re.test(email)
}

const defaultSettings = {
    depth: 0
}

const Settings = [
    '$scope',
    'Global',
    'Restangular',
    '$http',
    'LocationSelectModal',

    (
        $scope,
        Global,
        Restangular,
        $http,
        LocationSelectModal
    ) => {
        $scope.global = Global

        $scope.loadSettings = () => {
            Restangular
                .one('users', $scope.global.user._id)
                .get()
                .then(user => {
                    $scope.user = user
                    $scope.tempUser = Restangular.copy(user)
                    $scope.settings = angular.copy(user.settings)
                })
        }

        $scope.loadSettings()

        $scope.$watch('settings', newSettings => {
            if (!newSettings || !$scope.user) return

            $scope.user.settings = $scope.settings
            $scope.user.save()
            Global.setUser($scope.user)
        }, true)

        $scope.scrollToError = () => {
            // jQuery stuff, not so elegant but what can ya do
            let target = $('#errorArea')

            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 60
                }, 300)
            }
        }

        $scope.saveUserDetails = () => {
            $scope.showError = null
            $scope.showSuccess = null

            if (!$scope.registerForm.$valid) {
                $scope.showError = 'Please complete all required fields';
                $scope.scrollToError()
            }

            // merge and save
            delete $scope.tempUser.location;

            $scope.tempUser
                .save()

                // success
                .then(user => {
                    $scope.user = user
                    Global.setUser($scope.user)
                    $scope.tempUser = Restangular.copy(user)

                    $scope.showSuccess = 'Your new information has been saved'
                    $scope.scrollToError()
                },
                // error
                response => {
                    $scope.showError = response.data.message
                    $scope.scrollToError()
                })
        }

        // LOCATION LAT/LNG INPUT
        $scope.$watch('user.location', (newLocation, oldLocation) => {
            if (!oldLocation || !newLocation) return

            // if new location set, save user
            if (oldLocation.toString() !== newLocation.toString()) {
                $scope.user.save()

                if (__PROD__) {
                    analytics.track('changed home location')
                }

                $scope.global.setUser($scope.user)
            }
        })

        // SELECT LOCATION MODAL
        $scope.selectLocation = () => {
            LocationSelectModal.open({
                initialLocation: $scope.user.location
            }).then(location => {
                if (location && location.length === 2) {
                    location[0] = parseFloat(location[0].toFixed(7))
                    location[1] = parseFloat(location[1].toFixed(7))
                    $scope.user.location = location
                }
            })
        }

        $scope.scrollToErrorPassword = () => {
            // jQuery stuff, not so elegant but what can ya do
            let target = $('#errorAreaPassword')

            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 60
                }, 300)
            }
        }

        $scope.changePassword = {}

        $scope.savePassword = () => {
            $scope.showErrorPassword = null
            $scope.showSuccessPassword = null

            if (!$scope.changePassword.currentPassword) {
                $scope.showErrorPassword = 'Please enter your current password'
                $scope.scrollToErrorPassword()
            } else if (!$scope.changePassword.newPassword) {
                $scope.showErrorPassword = 'Please enter a new password'
                $scope.scrollToErrorPassword()
            } else if (
                $scope.changePassword.newPassword !== $scope.changePassword.confirmPassword
            ) {
                $scope.showErrorPassword = "Your new password doesn't match"
                $scope.scrollToErrorPassword()
            } else {
                $scope.user
                    .customPOST($scope.changePassword, 'password')

                    // success
                    .then(data => {
                        $scope.changePassword = {}
                        $scope.showSuccessPassword = 'Your new password has been saved'
                        $scope.scrollToErrorPassword()

                        if (__PROD__) {
                            analytics.track('changed password')
                        }
                    },
                    // error
                    response => {
                        $scope.showErrorPassword = response.data.message
                        $scope.scrollToErrorPassword()
                    })
            }
        }

        $scope.downloadData = () => {
            $scope.downloading = true

            $http
                .get(window.apiBaseUrl + 'sp/bulkDownload')
                .success(data => {
                    window.location.href = data.url
                    $scope.downloading = false
                })
                .error(() => {
                    $scope.downloading = false
                })
        }
    }
]

export default Settings
