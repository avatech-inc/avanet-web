
angular.module('avatech').controller('LoginController', [
    '$scope',
    '$timeout',
    'Global',

    ($scope, $timeout, Global) => {
        $scope.busy = false

        $scope.submit = () => {
            // browser autofill hack
            $scope.email = $('.signin #email').val()
            $scope.password = $('.signin #password').val()

            // basic validation
            if (
                !$scope.email ||
                $scope.email === '' ||
                !$scope.password ||
                $scope.password === ''
            ) {
                $scope.validationError = 'badEntry'
                return
            }

            $scope.busy = true;

            // server auth
            Global.login(
                $scope.email,
                $scope.password,

                // login success
                () => {},

                // login error
                message => {
                    $timeout(() => {
                        $scope.validationError = message
                        $scope.password = ''
                        $scope.busy = false
                    }, 1000)
                }
            )
        }
    }
])
