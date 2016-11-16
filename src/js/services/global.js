
const Global = [
    '$location',
    '$http',
    '$state',
    '$stateParams',
    'localStorageService',
    'Restangular',

    (
        $location,
        $http,
        $state,
        $stateParams,
        localStorageService,
        Restangular
    ) => {
        let service = {
            user: null,
            orgs: [],
            redirectUrl: null,

            setUser: user => {
                localStorageService.set('user', angular.copy(user))
                service.user = angular.copy(user)
            },

            setUserSetting: (name, value) => {
                if (service.user.settings[name] && service.user.settings[name] === value) {
                    return
                }

                service.user.settings[name] = value
                Restangular
                    .one('users', service.user._id)
                    .customPUT(service.user)
            },

            login: (email, password, successCallback, errorCallback) => {
                Restangular
                    .all('users/authenticate')
                    .post({
                        email: email,
                        password: password
                    })

                    // on login success
                    .then(auth => {
                        if (successCallback) successCallback()

                        localStorageService.set('auth', auth)

                        $http.defaults.headers.common['Auth-Token'] = auth.authToken

                        // get user from server
                        Restangular
                            .one('users', auth.userId)
                            .get()
                            .then(user => {
                                window._user = user

                                // init
                                service.init(() => {
                                    // if redirectUrl available, go
                                    if (service.redirectUrl) {
                                        let redirectUrl = service.redirectUrl
                                        service.redirectUrl = null
                                        $location.path(redirectUrl)

                                    // otherwise, go to home
                                    } else {
                                        $location.path('/')
                                    }
                                })
                            })
                    },

                    // on login error
                    response => {
                        if (errorCallback) {
                            if (response.status === 401) {
                                errorCallback(response.data.message)
                            } else {
                                errorCallback('Server Error. Please try again')
                            }
                        }
                    })
            },

            logout: () => {
                service.user = null
                service.orgs = []

                localStorageService.remove('auth')
                localStorageService.remove('user')
                localStorageService.remove('token')

                delete $http.defaults.headers.common['Auth-Token']

                if (__PROD__) {
                    Raven.setUserContext()
                    analytics.track('logout')
                }

                window.location.href = '/login';
            },

            init: callback => {
                service.user = null
                service.orgs = []

                if (__PROD__) {
                    Raven.setUserContext()
                }

                delete $http.defaults.headers.common['Auth-Token']

                let auth = localStorageService.get('auth')

                // if token exists, user is logged in
                if (auth) {
                    // set http header
                    $http.defaults.headers.common['Auth-Token'] = auth.authToken

                    let user = window._user

                    if (user) {
                        // save locally
                        service.setUser(user)
                        service.orgs = user.organizations

                        // callback
                        if (callback) callback()

                        // tracking
                        let trackingUser = {
                            name: user.full_name,
                            email: user.email,
                            created_at: user.created_at,
                            subscription_type: user.subscription_type
                        }

                        if (__STAGE__ || __PROD__) {
                            analytics.identify(user._id, trackingUser)
                        }

                        if (__PROD__) {
                            trackingUser.username = user.full_name
                            trackingUser.id = user._id

                            Raven.setUserContext(trackingUser)
                        }

       //              },
       //              // error
       //              function() {
       //                  // todo: if this returns an error, logout?
       //              });
                    }
                }

                // if no userId in localstorage

                // if (user) {
                //     var tracking_user ={
                //         name: user.fullName,
                //         username: user.fullName,
                //         email: user.email,
                //         id: user._id
                //     };
                //     Raven.setUserContext(tracking_user);
                //     heap.identify(tracking_user);
                //     mixpanel.identify(user._id);
                //     tracking_user.$email = tracking_user.email; // for mixpanel
                //     mixpanel.people.set(tracking_user);
                // }
                // else {
                //     Raven.setUserContext();
                //     heap.identify();
                //     mixpanel.identify();
                // }

                // temporary? need it just in case
                // if (user) {
                //     if (!user.settings) user.settings = {};
                //     if (!user.settings.tempUnits) user.settings.tempUnits = 0;
                //     if (!user.settings.distance) user.settings.distance = 0;
                //     if (!user.settings.elevation) user.settings.elevation = 0;
                //     if (!user.settings.fracture) user.settings.fracture = 0;
                //     if (!user.permissions) user.permissions = {};
                // }
               // service.setUser(user);

                // var token = localStorageService.get('token');
                // if (token) $http.defaults.headers.common['Auth-Token'] = token;

                // // get user from web
                // if (user && user._id) {
                //     Restangular.one('users', user._id).get()
                //     .then(function (_user) {
                //         if (_user._id) {
                //             service.setUser(_user);
                //             service.orgs = _user.organizations;

                //             console.log(_user.organizations);
                //         }
                //     });

                //     // get user orgs
                //     // todo: merge this with user (above)
                //     // var promise = Restangular.all('orgs').getList();
                //     // promise.then(function(orgs) {
                //     //     console.log("ORGS:");
                //     //     console.log(orgs);

                //     //     service.orgs = orgs;
                //     //     // if (newOrg.success && newOrg.success == false) {
                //     //     //     // handle error
                //     //     // }
                //     //     // else $location.path('orgs/' + newOrg._id);

                //     // });
                //     // return promise;
                // }


                // setInterval(service._monitor, 100);
            },

            _monitor: () => {
                // compare our local user to the localStorage user
                let user = localStorageService.get('user')

                if (!angular.equals(service.user, user)) {
                    // if user has logged out in another window, log out here too
                    if (!user) {
                        service.logout()

                        return
                    }

                    // check if new user or same user (set via setUser);
                    // console.log(service.user._id);
                    // console.log(user._id)

                    // todo: review this
                    service.user = user

                    let token = localStorageService.get('token')

                    if (token) {
                        $http.defaults.headers.common['Auth-Token'] = token
                    } else {
                        delete $http.defaults.headers.common['Auth-Token']
                    }

                    // with this next line commented out, there should never
                    // be a situation where the user can
                    // log in as another user (login page will redirect to
                    // dash after login in another window)
                    $state.transitionTo(
                        $state.current,
                        $stateParams,
                        {
                            reload: true,
                            inherit: false,
                            notify: true
                        }
                    )
                }
            }
        }

        return service
    }
]

export default Global
