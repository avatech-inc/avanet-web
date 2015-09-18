
angular.module('avatech').factory("Global",
    function($location,$http,$state,$stateParams,$interval,localStorageService, Restangular) {

        var _this = this;
        _this._data = {

        	user: null,
            orgs: [],

            redirectUrl: null,

            setUser: function(user) {
                console.log("updating user");
                localStorageService.set('user', angular.copy(user));
                _this._data.user = angular.copy(user);
            },

            setUserSetting: function(name, value) {
                if (_this._data.user.settings[name] && _this._data.user.settings[name] == value) return;
                _this._data.user.settings[name] = value;
                Restangular.one('users', _this._data.user._id).customPUT(_this._data.user);
            },

            login: function(email, password, successCallback, errorCallback) {
                Restangular.all('users/authenticate').post({ 
                    email: email,
                    password: password
                })
                // on login success
                .then(function(auth) {

                    if (successCallback) successCallback();

                    localStorageService.set('auth', auth);

                    $http.defaults.headers.common['Auth-Token'] = auth.authToken;
                    // get user from server
                    Restangular.one('users', auth.userId).get()
                    .then(function (user) {
                        window._user = user;

                        // init
                        _this._data.init(function() {

                            // if redirectUrl available, go
                            if (_this._data.redirectUrl) {
                                var redirectUrl = _this._data.redirectUrl;
                                _this._data.redirectUrl = null;
                                $location.path(redirectUrl);
                            }
                            // otherwise, go to home
                            else $location.path("/");

                        });
                    });
                }, 
                // on login error
                function(response) {

                    if (errorCallback) {
                        if (response.status == 401) errorCallback(response.data.message);
                        else errorCallback("Server Error. Please try again");
                    }

                });
            },
            logout: function() {
                _this._data.user = null;
                _this._data.orgs = [];
                localStorageService.remove('auth');
            	localStorageService.remove('user');
            	localStorageService.remove('token');

                delete $http.defaults.headers.common['Auth-Token'];

                Raven.setUserContext();
                heap.identify();
                mixpanel.track('logout');
                mixpanel.identify();

                window.location.href = "/login";
            },


	    	init: function(callback) {

                _this._data.user = null;
                _this._data.orgs = [];

                Raven.setUserContext();
                heap.identify();
                mixpanel.identify();

                delete $http.defaults.headers.common['Auth-Token'];

	    		var auth = localStorageService.get('auth');
                // if token exists, user is logged in
                if (auth) {
                    // set http header
                    $http.defaults.headers.common['Auth-Token'] = auth.authToken;

                    var user = window._user;
                    if (user) {
                        // save locally
                        _this._data.setUser(user);
                        _this._data.orgs = user.organizations;

                        // callback
                        if (callback) callback();

                        // tracking
                        var tracking_user ={
                            name: user.fullName,
                            username: user.fullName,
                            email: user.email,
                            id: user._id
                        };
                        Raven.setUserContext(tracking_user);
                        heap.identify(tracking_user);
                        mixpanel.identify(user._id);
                        tracking_user.$email = tracking_user.email; // for mixpanel
                        mixpanel.people.set(tracking_user);
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
               // _this._data.setUser(user);

                // var token = localStorageService.get('token');
                // if (token) $http.defaults.headers.common['Auth-Token'] = token;

                // // get user from web
                // if (user && user._id) {
                //     Restangular.one('users', user._id).get()
                //     .then(function (_user) {
                //         if (_user._id) {
                //             _this._data.setUser(_user);
                //             _this._data.orgs = _user.organizations;

                //             console.log(_user.organizations);
                //         }
                //     });

                //     // get user orgs
                //     // todo: merge this with user (above)
                //     // var promise = Restangular.all('orgs').getList();
                //     // promise.then(function(orgs) {
                //     //     console.log("ORGS:");
                //     //     console.log(orgs);

                //     //     _this._data.orgs = orgs;
                //     //     // if (newOrg.success && newOrg.success == false) {
                //     //     //     // handle error
                //     //     // }
                //     //     // else $location.path('orgs/' + newOrg._id);

                //     // });
                //     // return promise;
                // }


		    	//setInterval(_this._data._monitor, 100);
	    	},
            _monitor: function() {
                // compare our local user to the localStorage user
	    		var user = localStorageService.get('user');
				if (!angular.equals(_this._data.user,user)) {

                    // if user has logged out in another window, log out here too 
					if (!user) return _this._data.logout();

                    // check if new user or same user (set via setUser);
                    //console.log(_this._data.user._id);
                    //console.log(user._id)

                    // todo: review this
	    			_this._data.user = user;
	    			var token = localStorageService.get('token');
	    			if (token) $http.defaults.headers.common['Auth-Token'] = token;
	    			else delete $http.defaults.headers.common['Auth-Token'];

                    // with this next line commented out, there should never be a situation where the user can
                    // log in as another user (login page will redirect to dash after login in another window)
                    //if ($state.current.name != "login")
					$state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
				}
	    	}
        };

        return _this._data;
    }
);