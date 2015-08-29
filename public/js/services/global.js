
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
                var newUser = Restangular.copy(_this._data.user);
                newUser.settings[name] = value;
                newUser.save();
                _this._data.setUser(newUser);
            },

            login: function(user, token) {
                localStorageService.set('user', user);
                localStorageService.set('token', token);
				_this._data.user = user;

				$http.defaults.headers.common['Auth-Token'] = token;

                var tracking_user ={
                    name: user.fullName,
                    username: user.fullName,
                    email: user.email,
                    id: user._id
                };
                Raven.setUserContext(tracking_user);
                heap.identify(tracking_user);
                Rollbar.configure({ payload: { person: tracking_user }});
                mixpanel.identify(user._id);
                tracking_user.$email = tracking_user.email; // for mixpanel
                mixpanel.people.set(tracking_user);
                mixpanel.track('login');

                // if redirectUrl available, go
                if (_this._data.redirectUrl) {
                	var redirectUrl = _this._data.redirectUrl;
                	_this._data.redirectUrl = null;
                	$location.path(redirectUrl);
            	}
                // otherwise, go to home
                else $location.path("/");

                // init
                _this.init();
            },
            logout: function() {
                _this._data.user = null;
                _this._data.orgs = [];
            	localStorageService.remove('user');
            	localStorageService.remove('token');

                delete $http.defaults.headers.common['Auth-Token'];

                Raven.setUserContext();
                heap.identify();
                mixpanel.track('logout');
                mixpanel.identify();
                Rollbar.configure({ payload: { person: { } } });

	            //$state.transitionTo("login", null, {location:'replace'});
                window.location.href = "/login";
            },


	    	init: function() {

	    		var user = localStorageService.get('user');

                Rollbar.critical("test error!");

                console.log("local storage user:");
                console.log(user);

                if (user) {
                    var tracking_user ={
                        name: user.fullName,
                        username: user.fullName,
                        email: user.email,
                        id: user._id
                    };
                    Raven.setUserContext(tracking_user);
                    heap.identify(tracking_user);
                    mixpanel.identify(user._id);
                    Rollbar.configure({ payload: { person: tracking_user }});
                    tracking_user.$email = tracking_user.email; // for mixpanel
                    mixpanel.people.set(tracking_user);
                }
                else {
                    Raven.setUserContext();
                    heap.identify();
                    mixpanel.identify();
                    Rollbar.configure({ payload: { person: { } } });
                }

                // temporary? need it just in case
                if (user) {
                    if (!user.settings) user.settings = {};
                    if (!user.settings.tempUnits) user.settings.tempUnits = 0;
                    if (!user.settings.distance) user.settings.distance = 0;
                    if (!user.settings.elevation) user.settings.elevation = 0;
                    if (!user.settings.fracture) user.settings.fracture = 0;

                    if (!user.permissions) user.permissions = {};
                }
                _this._data.setUser(user);

                var token = localStorageService.get('token');
                if (token) $http.defaults.headers.common['Auth-Token'] = token;

                // get user from web
                if (user && user._id) {
                    Restangular.one('users', user._id).get()
                    .then(function (_user) {
                        if (_user._id) {
                            _this._data.setUser(_user);
                            _this._data.orgs = _user.organizations;

                            console.log(_user.organizations);
                        }
                    });

                    // get user orgs
                    // todo: merge this with user (above)
                    // var promise = Restangular.all('orgs').getList();
                    // promise.then(function(orgs) {
                    //     console.log("ORGS:");
                    //     console.log(orgs);

                    //     _this._data.orgs = orgs;
                    //     // if (newOrg.success && newOrg.success == false) {
                    //     //     // handle error
                    //     // }
                    //     // else $location.path('orgs/' + newOrg._id);

                    // });
                    // return promise;
                }


		    	setInterval(_this._data._monitor, 100);
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