
angular.module('avatech').controller('RegisterController', [
    '$scope',
    '$timeout',
    '$stateParams',
    'Global',
    'Restangular',

    (
        $scope,
        $timeout,
        $stateParams,
        Global,
        Restangular
    ) => {
        $scope.reg = {}
        $scope.isPending = (
            !$stateParams.userHashId || $stateParams.userHashId === ''
        ) ? false : null

        if ($stateParams.userHashId && $stateParams.userHashId !== '') {
            Restangular
                .one('users/pending', $stateParams.userHashId)
                .get()
                .then(data => {
                    $scope.isPending = true
                    $scope.userHashId = $stateParams.userHashId

                    if (data.organizations) {
                        $scope.orgName = data.organizations[0].name
                    }

                    $scope.reg.email = data.email
                },
                // error
                () => {
                    $scope.isPending = false
                })
        }

        // todo: this needs to be re-implemented if we want education edition to work
        // if ($stateParams.orgHashId && $stateParams.orgHashId != "") {
        //   $http.get("/v1/orgs/education/" + $stateParams.orgHashId)
        //     .success(function (data) {
        //         console.log(data);
        //         $scope.isPending = data.ok;
        //         if ($scope.isPending) $scope.org = data;
        //     });
        // }

        $scope.scrollToError = () => {
        // jQuery stuff, not so elegant but what can ya do
        // var target = $("#errorArea");
        // if (target.length) {
        //     $('html,body').animate({
        //       scrollTop: target.offset().top - 12
        //     }, 300);
        // }

            $('.login-page').animate({ scrollTop: 0 }, 300)
        }

        $scope.registerPending = () => {
            $scope.showError = null

            if (!$scope.registerForm.$valid) {
                $scope.showError = 'Please complete all required fields'
                $scope.scrollToError()
            } else if ($scope.reg.fullName.indexOf(' ') === -1) {
                $scope.showError = 'Please enter your full name'
                $scope.scrollToError()
            } else if ($scope.reg.password.length && $scope.reg.password.length < 6) {
                $scope.showError = 'Password must be at least 6 characters long'
                $scope.scrollToError()
            } else if (
                $scope.reg.password.length &&
                ($scope.reg.password !== $scope.reg.passwordConfirm)
            ) {
                $scope.showError = 'Make sure your passwords match'
                $scope.scrollToError()
            } else if (!$scope.acceptTerms) {
                alert('You must accept the Terms of Service.')
                return

            // all good
            } else {
                $scope.busy = true
                $('.login-page').animate({ scrollTop: 0 }, 300)

                let newUser = {
                    fullName: $scope.reg.fullName,
                    password: $scope.reg.password,
                    // pro fields
                    userHashId: $scope.userHashId,
                    userType: 'pro'
                }

                setTimeout(() => {
                    // post to API
                    Restangular
                        .all('users')
                        .post(newUser)
                        // success
                        .then(data => {
                            if (__PROD__) {
                                analytics.track('registered')
                            }

                            Global.login(data.email, newUser.password)
                        },
                        // error
                        response => {
                          // todo: this should never happen, but what if it does...
                          // $timeout(function(){
                          //   $scope.busy = false;
                          //   // showpro is false since this can only be an email error
                          //   // todo: what about 500 error? alert?
                          //   $scope.showPro = false;
                          //   $scope.showError = response.data.message;
                          //   $scope.scrollToError();
                          // }, 500);
                        });
                }, 500)
            }
        }

        $scope.registerPro = () => {
            $scope.showError = null

            if (!$scope.registerForm.$valid) {
                $scope.showError = 'Please complete all required fields'
                $scope.scrollToError()

            // all good
            } else {
                $scope.busy = true
                $('.login-page').animate({ scrollTop: 0 }, 300)

                let newUser = {
                    fullName: $scope.reg.fullName,
                    email: $scope.reg.email,
                    password: $scope.reg.password,
                    userType: 'pro',

                    // pro fields
                    org: $scope.reg.org,
                    orgSize: $scope.reg.orgSize,
                    jobTitle: $scope.reg.jobTitle,
                    profession: $scope.reg.profession,
                    certifications: $scope.reg.certifications,
                    city: $scope.reg.city,
                    state: $scope.reg.state,
                    postal: $scope.reg.postal,
                    country: $scope.reg.country
                }

                setTimeout(() => {
                  // post to API
                    Restangular
                        .all('users')
                        .post(newUser)

                        // success
                        .then(function (data) {
                            if (__PROD__) {
                                analytics.track('registered')
                            }

                            Global.login(data.email, newUser.password)
                        },

                        // error
                        response => {
                            $timeout(() => {
                                $scope.busy = false

                                // showpro is false since this can only be an email error
                                // todo: what about 500 error? alert?
                                $scope.showPro = false;
                                $scope.showError = response.data.message;
                                $scope.scrollToError();
                            }, 500)
                        })
                }, 500)
            }
        }

        $scope.register = () => {
            if ($scope.showPro) {
                return $scope.registerPro()
            } else if ($scope.isPending) {
                return $scope.registerPending()
            }

            // $scope.showPro = true;
            // return;

            $scope.showError = null

            if (!$scope.registerForm.$valid) {
                $scope.showError = 'Please complete all required fields'
                $scope.scrollToError()
            } else if ($scope.reg.fullName.indexOf(' ') === -1) {
                $scope.showError = 'Please enter your full name'
                $scope.scrollToError()
            } else if ($scope.reg.password.length && $scope.reg.password.length < 6) {
                $scope.showError = 'Password must be at least 6 characters long'
                $scope.scrollToError()
            } else if (
                $scope.reg.password.length && (
                    $scope.reg.password !== $scope.reg.passwordConfirm
                )
            ) {
                $scope.showError = 'Make sure your passwords match'
                $scope.scrollToError()
            } else if ($scope.reg.isPro === null) {
                // if ($scope.org)
                //   alert("You must certify that you are a registered
                // student of " + $scope.org.name  + ".");
                // else

                alert('Please specify if you are a snow safety professional.')
                // return;
            } else if (!$scope.acceptTerms) {
                alert('You must accept the Terms of Service.')
            } else {
                // if rec, signup!
                if ($scope.reg.isPro === false) {
                    $scope.busy = true;
                    $('.login-page').animate({ scrollTop: 0 }, 300)

                    let newUser = {
                        fullName: $scope.reg.fullName,
                        email: $scope.reg.email,
                        password: $scope.reg.password,
                        userType: 'rec+'
                    }

                    setTimeout(() => {
                        // post to API
                        Restangular
                            .all('users')
                            .post(newUser)

                            // success
                            .then(data => {
                                if (__PROD__) {
                                    analytics.track('registered')
                                }

                                Global.login(data.email, newUser.password)
                            },

                            // error
                            response => {
                                $timeout(() => {
                                    $scope.busy = false
                                    $scope.showError = response.data.message
                                    $scope.scrollToError()
                                }, 500)
                            })
                    }, 500)
                }

                // if pro, show next screen
                if ($scope.reg.isPro === true) {
                    // alert("pro signup!!!");
                    $scope.showPro = true

                    $('.login-page').animate({ scrollTop: 0 }, 300)
                }

                // var newUser = {
                //     fullName: $scope.reg.name,
                //     email: $scope.reg.email,
                //     jobTitle: $scope.reg.jobTitle,
                //     profession: $scope.reg.profession,
                //     org: $scope.reg.org,
                //     city: $scope.reg.city,
                //     state: $scope.reg.state,
                //     postal: $scope.reg.postal,
                //     country: $scope.reg.country,
                //     password: $scope.reg.password,

                //     userHashId: $scope.userHashId,
                //     orgHashId: $stateParams.orgHashId,
                //     userType: "pro"
                // }

                // Restangular.all('users').post(newUser)
                // // success
                // .then(function (data) {
                //     mixpanel.track("registered");
                //     Global.login(data.email, newUser.password);
                // },
                // // error
                // function(response) {
                //     $timeout(function(){
                //       $scope.busy = false;
                //       $scope.showError = response.data.message;
                //       $scope.scrollToError();
                //     }, 1000);
                // });
            }
        }
    }
])
