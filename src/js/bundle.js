/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	__webpack_require__(2)
	__webpack_require__(3)

	__webpack_require__(4)
	__webpack_require__(5)
	__webpack_require__(6)
	__webpack_require__(7)
	__webpack_require__(8)
	__webpack_require__(9)
	__webpack_require__(10)
	__webpack_require__(11)
	__webpack_require__(12)
	__webpack_require__(13)
	__webpack_require__(14)
	__webpack_require__(16)
	__webpack_require__(17)
	__webpack_require__(18)
	__webpack_require__(19)
	__webpack_require__(15)
	__webpack_require__(20)
	__webpack_require__(21)
	__webpack_require__(22)
	__webpack_require__(23)
	__webpack_require__(24)
	__webpack_require__(25)
	__webpack_require__(26)
	__webpack_require__(27)
	__webpack_require__(28)
	__webpack_require__(29)
	__webpack_require__(30)
	__webpack_require__(31)
	__webpack_require__(32)
	__webpack_require__(33)
	__webpack_require__(34)
	__webpack_require__(35)
	__webpack_require__(36)
	__webpack_require__(37)
	__webpack_require__(38)
	__webpack_require__(39)
	__webpack_require__(40)

	__webpack_require__(41)
	__webpack_require__(42)
	__webpack_require__(43)

	__webpack_require__(44)
	__webpack_require__(45)
	__webpack_require__(46)
	__webpack_require__(47)
	__webpack_require__(48)
	__webpack_require__(49)
	__webpack_require__(50)
	__webpack_require__(51)
	__webpack_require__(52)

	__webpack_require__(53)


/***/ },
/* 2 */
/***/ function(module, exports) {

	
	// define app and dependencies
	angular.module('avatech', [
	    'ngRaven',
	    'ngRoute', 'ngTouch',
	    'ui.bootstrap', 'ui.router', 'ui.route', 
	    'restangular', 
	    'LocalStorageModule', 
	    'angularMoment', 
	    'sun.scrollable', 
	    'vr.directives.slider',
	    'pascalprecht.translate',
	    'schemaForm',
	    'pasvaz.bindonce',
	    'ct.ui.router.extras',
	    'bootstrapLightbox',
	    'credit-cards',
	    'angular-country-picker',
	    'pikaday',
	    'ngjsColorPicker',
	    'ngAudio',
	    'terrain'
	]);

	// configure console debug
	angular.module('avatech').config(function($logProvider){
	  $logProvider.debugEnabled(false);
	});

	// configure lightbox
	angular.module('avatech').config(function (LightboxProvider) {
	  LightboxProvider.getImageUrl = function (media) {
	    // if video, replace .mov with .mp4 so we can play with native HTML5 (for Cloudinary)
	    if (media.type == "video" && media.URL.indexOf(".mov") == media.URL.length - 4) {
	        media.URL = media.URL.substring(0, media.URL.length - 4) + ".mp4";
	    }
	    return media.URL;
	  };
	  LightboxProvider.getImageCaption = function (media) {
	    return null;
	  };
	});

	// configure angular schema forms
	angular.module('schemaForm').config(
	  function(schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {

	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'direction-select',
	      '/modules/forms/direction-select.html'
	    );
	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'radiobuttons-nullable',
	      '/modules/forms/radiobuttons-nullable.html'
	    );
	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'datepicker',
	      '/modules/forms/datepicker.html'
	    );
	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'grainTypeSelect',
	      '/modules/forms/grain-type-select.html'
	    );
	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'trend-select',
	      '/modules/forms/trend-select.html'
	    );
	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'location-select',
	      '/modules/forms/location-select.html'
	    );
	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'avalanche-trigger-select',
	      '/modules/forms/avalanche-trigger-select.html'
	    );
	    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
	      'number',
	      '/modules/forms/number.html'
	    );
	});

	// configure Restangular
	angular.module('avatech').config(function(RestangularProvider) {
	    // set API base url
	    RestangularProvider.setBaseUrl(window.apiBaseUrl);
	    // support mongodb "_id" format
	    RestangularProvider.setRestangularFields({ id: "_id" });
	});

	// enable html5 pushstate
	angular.module('avatech').config(function($locationProvider) {
	    $locationProvider.html5Mode({ enabled: true, requireBase: false });
	});

	// define additional triggers on Tooltip and Popover 
	// (show this be in this file? doesn't feel totally right to have it here)
	angular.module('avatech').config(function($tooltipProvider){
	    $tooltipProvider.setTriggers({
	        mouseenter: 'mouseleave',
	        click: 'click',
	        focus: 'blur',
	        never: 'mouseleave',
	        show: 'hide',
	    });
	});

	// configure translation
	angular.module('avatech').config(function($translateProvider, $translatePartialLoaderProvider) {
	    $translatePartialLoaderProvider.addPart('test');
	    $translateProvider.useLoader('$translatePartialLoader', {
	      urlTemplate: '/translate/{lang}/{part}.json'
	    });
	    // set language
	    $translateProvider.preferredLanguage('en');
	    // enable proper escaping of translation content
	    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
	});

	// the first thing that gets run
	angular.module('avatech').run(
	 function($rootScope, $location, $state, $stateParams, $log, $document, $http, $uibModalStack, Observations, Routes, Global) {

	    $rootScope.todaysDate = new Date();
	    // init global service
	    Global.init();

	    // init observations service
	    Observations.init();
	    // init routes service
	    Routes.init();

	    // periodically check if new app version is available
	    // var newVersion = false;
	    // setInterval(function() {
	    //     $http.get('/assets/release.json')
	    //     .then(function(res){
	    //         // console.log("current release: " + window._releaseVersion);
	    //         // console.log("    new release: " + res.data.version);

	    //         if (window._releaseVersion != res.data.version) {
	    //             newVersion = true;
	    //             console.log("New version available! " + res.data.version);
	    //         }
	    //     });
	    // }, 5 * 60 * 1000);


	    $rootScope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {

	        // console.log("LOCATION!");
	        // console.log(event);
	        // console.log(newUrl);
	        // console.log(oldUrl);
	        // console.log("newVersion? " + newVersion)

	    });

	    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
	        // close any open modals before navigating to new state
	        $uibModalStack.dismissAll();

	        if (!toState) return;
	        if (toState.name == fromState.name) return;

	        // todo: kludgy non-angular way to clear tooltips on state change. 
	        // not ideal, but best solution for now
	        $(".tooltip").remove();

	        // redirect from login page if already logged in
	        if (toState.data && toState.data.redirectIfLoggedIn && Global.user) {
	            $log.debug("already logged in...");
	            event.preventDefault();
	            $state.transitionTo("index", null, {location:'replace'});
	            return;
	        }
	        // access control
	        if (toState.data && toState.data.requireLogin && !Global.user) {
	            $log.debug("must be logged in");
	            event.preventDefault();
	            Global.redirectUrl = $location.url();
	            $state.transitionTo("login", null, {location:'replace'});
	            return;
	        }
	        if (toState.data && toState.data.requireAdmin && !Global.user.admin) {
	            $log.debug("admin only");
	            event.preventDefault();
	            $state.transitionTo("index", null, {location:'replace'});
	            return;
	        }
	        // set title
	        // todo: there's gotta be a more angular-y way to do this
	        $document.prop('title', (toState.data && toState.data.title ? toState.data.title : ""));
	    });

	    // 3. after route change
	    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
	        // resize map based on new layout
	        $rootScope.$broadcast('resizeMap');

	        analytics.page()

	        // add class to body for page-specific styling
	        // todo: there's gotta be a more angular-y way to do this
	        //        ^^ in fact there is, <body class='{{ bodyCssClass }}' $rootScope.bodyCssClass
	        $document[0].body.className = (toState.data && toState.data.bodyCssClass ? toState.data.bodyCssClass : "");
	    });

	});

	// requestAnimationFrame
	(function() {
	    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	    window.requestAnimationFrame = requestAnimationFrame;
	})();


/***/ },
/* 3 */
/***/ function(module, exports) {

	angular.module('avatech').config(function($stateProvider) {
	  $stateProvider

	    .state('index', {
	        url: '/',
	        templateUrl: '/modules/map/map.html',
	        data: { 
	            title: 'Avanet',
	            requireLogin: true 
	        }
	    })

	    .state('index.route', {
	        url: 'routes/:routeId',
	        views: { "route-pane": { templateUrl: '/modules/map/route-planning.html' } },
	        data: { }
	    })

	    .state('index.ob-side', {
	        url: 'obs/:observationId',
	        views: { "right-pane": { templateUrl: '/modules/observations/preview.html' } },
	        data: {
	            showPreviewPane: true
	        }
	    })

	    // Snowpit Editor
	    .state('index.profileEditor', {
	        abstract: true,
	        views: { "content": { templateUrl: '/modules/snowpit-editor/snowpit.html' } },
	        data: { 
	            title: 'Snow Profile | Avanet',
	            requireLogin: true,
	            bodyCssClass: 'snowpit',
	            fullScreen: true
	        }
	    })
	    .state('index.profileEditor.details', {
	        url: 'profiles/:profileId',
	        params: { location : null }
	    })

	    // organizations
	    .state('index.orgNew', {
	        url: 'orgs/new',
	        views: { "content": { templateUrl: '/modules/organizations/new.html' } },
	        data: { 
	            title: 'New Organization / Avanet',
	            requireLogin: true,
	            fullScreen: true
	        }
	    })
	    .state('index.org', {
	        url: 'orgs/:orgId',
	        views: { "content": { templateUrl: '/modules/organizations/view.html' } },
	        data: { 
	            title: 'Organization / Avanet',
	            requireLogin: true,
	            fullScreen: true
	        }
	    })

	    .state('index.admin', {
	        url: 'admin',
	        views: { "content": { templateUrl: '/modules/admin/admin.html' } },
	        data: { 
	            title: 'Admin / Avanet',
	            requireLogin: true, 
	            requireAdmin: true,
	            bodyCssClass: 'admin',
	            fullScreen: true
	        }
	    })

	    .state('index.settings', {
	        url: 'settings',
	        views: { "content": { templateUrl: '/modules/user/settings.html' } },
	        data: { 
	            title: 'Settings / Avanet',
	            requireLogin: true,
	            bodyCssClass: 'profiles',
	            fullScreen: true
	        }
	    })

	    .state('index.SP1update2', {
	        url: 'sp1update',
	        views: { "content": { templateUrl: '/modules/firmware-update/SP1update.html' } },
	        data: { title: 'SP Firmware Update / Avanet', requireLogin: true, fullScreen: true }
	    }).state('index.SP1update', {
	        url: 'SP1update',
	        views: { "content": { templateUrl: '/modules/firmware-update/SP1update.html' } },
	        data: { title: 'SP Firmware Update / Avanet', requireLogin: true, fullScreen: true }
	    }).state('index.SPupdate', {
	        url: 'SPupdate',
	        views: { "content": { templateUrl: '/modules/firmware-update/SP1update.html' } },
	        data: { title: 'SP Firmware Update / Avanet', requireLogin: true, fullScreen: true }
	    }).state('index.SPupdate1', {
	        url: 'spupdate',
	        views: { "content": { templateUrl: '/modules/firmware-update/SP1update.html' } },
	        data: { title: 'SP Firmware Update / Avanet', requireLogin: true, fullScreen: true }
	    })

	    .state('index.support', {
	        url: 'support',
	        views: { "content": { templateUrl: '/modules/support/support.html' } },
	        data: { 
	            title: 'Support',
	            requireLogin: true,
	            fullScreen: true
	        }
	    })

	    // user routes
	    .state('login', {
	        url: '/login',
	        templateUrl: '/modules/user/login.html',
	        data: { 
	            title: 'Login / Avanet',
	            redirectIfLoggedIn: true,
	            bodyCssClass: 'login'
	        }
	    })
	    .state('forgotPassword', {
	        url: '/forgot-password',
	        templateUrl: '/modules/user/forgot-password.html',
	        data: { 
	            title: 'Password Reset / Avanet',
	            bodyCssClass: 'login'
	        }
	    })
	    .state('forgotPasswordReset', {
	        url: '/reset/:forgotPasswordToken',
	        templateUrl: '/modules/user/reset-password.html',
	        data: { 
	            title: 'Password Reset / Avanet',
	            bodyCssClass: 'login'
	        }
	    })
	    .state('register', {
	        url: '/register',
	        templateUrl: '/modules/user/register-new.html',
	        data: { 
	            title: 'Sign up / Avanet',
	            redirectIfLoggedIn: true,
	            bodyCssClass: 'login'
	        }
	    })
	    .state('signup', {
	        url: '/signup',
	        templateUrl: '/modules/user/register-new.html',
	        data: { 
	            title: 'Sign up / Avanet',
	            redirectIfLoggedIn: true,
	            bodyCssClass: 'login'
	        }
	    })
	    .state('registerPending', {
	        url: '/register/:userHashId',
	        templateUrl: '/modules/user/register-new.html',
	        data: { 
	            title: 'Register / Avanet',
	            bodyCssClass: 'login'
	        }
	    })

	    // logout
	    .state('logout', {
	        url: '/logout',
	        onEnter: ['Global', function(Global) { Global.logout(); }]
	    })

	    // catchall 404 (keeps URL)
	    .state('404', {
	        url: '/*path',
	        templateUrl: '/modules/404/404.html'
	    });
	});

/***/ },
/* 4 */
/***/ function(module, exports) {

	angular.module('avatech').controller('AdminOrgsController', function ($scope, $location, $http, Global, Restangular) {
	    $scope.global = Global;

	    $scope.init = function() {
	        $scope.getOrgs();
	    }
	    $scope.getOrgs = function() {

	        Restangular.all('orgs').getList()
	        .then(function(orgs) {
	            $scope.orgs = orgs;
	        });
	    }
	});

/***/ },
/* 5 */
/***/ function(module, exports) {

	angular.module('avatech').controller('AdminUsersController', function ($scope, $log, $location, $http, Global, Restangular) {
	    $scope.global = Global;

	    // executes on 'page load'
	    $scope.init = function() {
	        $scope.getUsers();
	    }

	    var countries = {};
	    
	    $scope.totalUsers = 0;
	    $scope.totalUsersToday = 0;
	    $scope.totalUsersThisWeek = 0;
	    $scope.totalUsersThisMonth = 0;
	    $scope.totalCountries = 0;
	    //$scope.totalOrgs = 0;

	    var countries = {};
	    var orgs = {};

	    var allOrgs = [];

	    var yesterday = new Date();
	    yesterday.setDate(yesterday.getDate() - 1);

	    var week = new Date();
	    week.setDate(week.getDate() - 7);

	    var month = new Date();
	    month.setDate(month.getDate() - 30);

	    var europe = [
	"Albania",
	"Andorra",
	"Armenia",
	"Austria",
	"Azerbaijan",
	"Belarus",
	"Belgium",
	"Bosnia & Herzegovina",
	"Bulgaria",
	"Croatia",
	"Cyprus",
	"Czech Republic",
	"Denmark",
	"Estonia",
	"Finland",
	"France",
	"Georgia",
	"Germany",
	"Greece",
	"Hungary",
	"Iceland",
	"Ireland",
	"Italy",
	"Kosovo",
	"Latvia",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Macedonia",
	"Malta",
	"Moldova",
	"Monaco",
	"Montenegro",
	"The Netherlands",
	"Norway",
	"Poland",
	"Portugal",
	"Romania",
	"Russia",
	"San Marino",
	"Serbia",
	"Slovakia",
	"Slovenia",
	"Spain",
	"Sweden",
	"Switzerland",
	"Turkey",
	"Ukraine",
	"United Kingdom"];

	    $scope.getUsers = function() {
	        Restangular.all('users').getList()
	        .then(function(users) {
	            $scope.users = users;

	            var emails = {};

	          var _orgs = {};

	            //$scope.totalUsers = users.length;
	            for (var i = 0; i < users.length; i++) {

	                if (!users[i].admin && !users[i].test && users[i].org && users[i].org.length > 2 && users[i].org.toLowerCase() != "n/a" && users[i].org.toLowerCase() != "test"  && users[i].org != "/" && users[i].org.toLowerCase() != "avatech" && users[i].org != "ski patrol" && users[i].org != "pc" && users[i].org != "none" && users[i].org != "public" ) {
	                    var normalized = users[i].org.toLowerCase().trim().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
	                    _orgs[normalized] = null;
	                }


	                // if (!users[i].admin && !users[i].test) {
	                //     if (!countries[users[i].country]) countries[users[i].country] = 1;
	                //     else countries[users[i].country]++;
	                // }

	                if (!users[i].admin && !users[i].test) {
	                    $scope.totalUsers++;

	                    if (new Date(users[i].created) > yesterday) $scope.totalUsersToday++;

	                    if (new Date(users[i].created) > week) $scope.totalUsersThisWeek++;

	                    if (new Date(users[i].created) > month) $scope.totalUsersThisMonth++;

	                    countries[users[i].country] = 0;

	                    if (users[i].org && users[i].org != "" && users[i].org.toLowerCase() != "n/a" && users[i].org.toLowerCase() != "test"  && users[i].org != "/" && users[i].org.toLowerCase() != "avatech") {
	                        if (!orgs[users[i].org]) orgs[users[i].org] = users[i].org +"|" + users[i].city + "|" + users[i].country + "|";
	                        //else orgs[users[i].org]++;
	                    }

	                    emails[users[i].email] = 0;

	                    //console.log(users[i].fullName + "," + users[i].created + "," + users[i].country + "," + users[i].org)
	                    //console.log(users[i].created + "}" + users[i].city + "," + users[i].country + "}" + users[i].org);

	                    if (users[i].country && europe.indexOf(users[i].country) > -1)
	                        allOrgs.push({ 
	                            name: users[i].fullName,
	                            organization: users[i].org,
	                            email: users[i].email,
	                            city: users[i].city,
	                            country: users[i].country,
	                            device: false
	                        });
	                }
	            }


	            $scope.totalOrgs = Object.keys(_orgs).length;
	            
	            // $http.get('/fizblix')
	            // .success(function(data){

	            //     angular.forEach(data,function(order){
	            //         // var orgName = order.order.pro_org;
	            //         // if (orgName && orgName != "" && orgName != "N/A"  && orgName != "n/a"  && orgName != "/") {
	            //         //     if (!orgs[orgName]) orgs[orgName] = orgName +"|" + order.order.billing_city + "|" + order.order.billing_country + "|";
	            //         //     //else orgs[users[i].org]++;
	            //         // }
	            //         countries[order.order.billing_country] = 0;

	            //         emails[order.email] = 0;

	            //         console.log(order.order.billing_country);

	            //         if (order.order.billing_country && europe.indexOf(order.order.billing_country) > -1)
	            //             allOrgs.push({ 
	            //                 name: order.order.pro_name,
	            //                 organization: order.order.pro_org,
	            //                 email: order.email,
	            //                 city: order.order.billing_city,
	            //                 country: order.order.billing_country,
	            //                 device: true
	            //             });



	            //     });

	            //     console.log(allOrgs);

	            //     for (var j = 0; j < allOrgs.length; j++) {
	            //         console.log(allOrgs[j].name + "{" + allOrgs[j].organization + "{" + allOrgs[j].email + "{" + allOrgs[j].city + "{" + allOrgs[j].country + "{" + allOrgs[j].device);
	            //     }


	            //     // angular.forEach(orgs,function(org) {
	            //     //     console.log(org);
	            //     // });
	            //     // console.log(Object.keys(orgs).length);

	            //     // angular.forEach(emails,function(index,email) {
	            //     //     console.log(email);
	            //     // });

	            //     console.log(Object.keys(emails).length)
	            // });


	            //console.log(orgs);

	            // $scope.totalCountries = Object.keys(countries).length;
	            //$scope.totalOrgs = Object.keys(orgs).length;
	            // console.log(countries);
	            // console.log(Object.keys(countries).length)
	        });
	    }

	    $scope.toggleDisabled = function(user) {
	        user.disabled = !user.disabled;
	        user.$update(function(data) {
	            $log.debug(data);
	        });
	    }

	    $scope.toggleTest = function(user) {
	        user.test = !user.test;
	        user.$update(function(data) {
	            $log.debug(data);
	        });
	    }

	    $scope.getStats = function(user) {
	        // $http.get('/v1/users/' + user._id + '/stats').success(function(data){
	        //     console.log(data);
	        // });
	    }

	});

/***/ },
/* 6 */
/***/ function(module, exports) {

	angular.module('avatech').controller('AdminController', function ($scope, $location, $http, Global) {
	    
	    $scope.pages = [{
	    	title: 'Users',
	    	template: '/modules/admin/users.html'
	    },
	    {
	        title: 'Organizations',
	        template: '/modules/admin/orgs.html'
	    }
	    ];

	    // select first page
	    $scope.selectedPage = $scope.pages[0];

	    $scope.selectPage = function(page) {
			$scope.selectedPage = page;
	    }

	});

/***/ },
/* 7 */
/***/ function(module, exports) {

	angular.module('avatech').directive('commentsNew', function($http, $log, $timeout, $sce, Restangular) {
	  return {
	    restrict: 'E',
	    scope: { 
	      ownerType: '=',
	      ownerId: '='
	    },
	    templateUrl: '/modules/comments/comments-new.html',
	    controller: ['$scope','Global', function($scope, Global) {

	      $scope.global = Global;

	        $('textarea.comment').mentionsInput({
	          minChars: 100, // to disable, make 100 (otherwise, 2)
	          onDataRequest:function (mode, query, callback) {

	            Restangular.all("users").getList({ query: $scope.search.query }).then(function(response) {
	              var results = [];
	              for (var i = 0; i < response.length; i++) {
	                $log.debug(result);
	                var result = response[i];
	                results.push({ id: result._id, name: result.fullName, avatar: '', type: 'user' });
	              }
	              callback.call(this, results);
	            });
	          }

	        });

	        // load comments 
	        $scope.$watch('ownerId', function(){
	          if (!$scope.ownerId) return;

	          Restangular.all('comments').customGETLIST($scope.ownerType + "/" + $scope.ownerId)
	          .then(function(comments) {
	            $scope.comments = comments;
	          },
	          // error
	          function() { 

	          });

	        });

	      $scope.saveComment = function() {
	          
	          $('textarea.comment').mentionsInput('val', function(comment) {

	          $log.debug(comment);

	          if (comment == "" || comment == null) return;

	            $scope.saving = true;

	            // $http.post("/v1/comments/" + $scope.ownerType + "/" + $scope.ownerId, { content: comment })
	            // .success(function(newComment){
	            //   newComment.new = true;
	            //   $scope.comments.unshift(newComment);
	            //   $scope.newComment = "";
	            //    $('textarea.comment').mentionsInput('reset');
	            //   $scope.saving = false;
	            // });


	            Restangular.all('comments').customPOST({ content: comment },
	              $scope.ownerType + "/" + $scope.ownerId)
	            .then(function(newComment) {
	              newComment.new = true;
	              $scope.comments.unshift(newComment);
	              $scope.newComment = "";
	              $('textarea.comment').mentionsInput('reset');
	              $scope.saving = false;
	            },
	            // error
	            function() { 

	            });
	            // scroll to top (todo: not angular-y)
	            //$(".modal-content .comments.list .nano").nanoScroller({ scroll: 'top' });
	        });
	      }

	      $scope.deleteComment = function(commentId, index) {
	        // remove from server
	        Restangular.one("comments", commentId).remove();
	        // remove from local collection
	        $scope.comments.splice(index, 1);
	      }

	      // todo: (todo: not very angular-y)
	      $scope.adjustHeight = function() {
	        $timeout(function(){
	          var _height = $(".modal-content .commentBox").outerHeight();
	          $(".modal-content  ul.comments.list").css("top",_height);
	          // reset nanoScroller
	          $(".modal-content .comments.list .nano").nanoScroller();
	        },80);
	      }

	      $scope.parseComment = function(comment) {
	        // replace markup with user link
	        var regex = /@\[([A-Za-z0-9 \-]+)\]\(user:([A-Za-z0-9\-]+)\)/igm;
	        //var match = regex.exec(comment);

	        var match;
	        while ((match = regex.exec(comment)) !== null)
	        {
	          var name = match[1];
	          var id = match[2];
	          $log.debug(match[0]);
	          comment = comment.replace(match[0],"<span style='border-bottom:1px solid #ccc;'>" + name + "</span>");
	        }
	        // if (match.length == 3) {

	        //   var name = match[1];
	        //   var id = match[2];

	        //   console.log(match);

	        //   comment = comment.replace(new RegExp(match[0], 'g'),"<span style='border-bottom:1px solid #ccc;'>" + name + "</span>");
	        // }

	        return $sce.trustAsHtml(comment);
	      }

	    }]
	  }
	});

	// angular.module('avatech').directive('comments', function($http, $timeout) {
	//   return {
	//     restrict: 'E',
	//     scope: { 
	//       // onadd: '&',
	//       // onload: '&',
	//       // onprogress: '&',
	//       // onupload: '&'
	//       ownerType: '=',
	//       ownerId: '='
	//     },
	//     templateUrl: '/modules/comments/comments.html',
	//     controller: ['$scope','Global', function($scope, Global) {

	//       $scope.global = Global;

	//       // load comments 
	//       $scope.$watch('ownerId', function(){
	//         if (!$scope.ownerId) return;

	//         $http.get("/v1/comments/" + $scope.ownerType + "/" + $scope.ownerId)
	//         .success(function(comments){
	//           $scope.comments = comments;
	//         });

	//         Restangular.all('comments').customGETLIST($scope.ownerType + "/" + $scope.ownerId)

	//       });

	//       $scope.saveComment = function() {
	//         if ($scope.newComment == "" || $scope.newComment == null) return;

	//         $scope.saving = true;
	//         console.log("post:");
	//         $http.post("/v1/comments/" + $scope.ownerType + "/" + $scope.ownerId, { content: $scope.newComment })
	//         .success(function(newComment){
	//           newComment.new = true;
	//           $scope.comments.unshift(newComment);
	//           $scope.newComment = "";
	//           $scope.saving = false;
	//         });

	//         // scroll to top (todo: not angular-y)
	//         $(".modal-content .comments.list .nano").nanoScroller({ scroll: 'top' });
	//       }

	//       $scope.deleteComment = function(commentId, index) {
	//         // remove from server
	//         $http.delete("/v1/comments/" + commentId);
	//         // remove from local collection
	//         $scope.comments.splice(index, 1);
	//       }

	//       // todo: (todo: not very angular-y)
	//       $scope.adjustHeight = function() {
	//         $timeout(function(){
	//           var _height = $(".modal-content .commentBox").outerHeight();
	//           $(".modal-content  ul.comments.list").css("top",_height);
	//           // reset nanoScroller
	//           $(".modal-content .comments.list .nano").nanoScroller();
	//         },80);
	//       }

	//     }]
	//   }
	// });

/***/ },
/* 8 */
/***/ function(module, exports) {

	angular.module('avatech').factory('Confirm', function ($uibModal) {
	    return { open: function(message) {
	        var modalInstance = $uibModal.open({
	            templateUrl: '/modules/confirm/confirm.html',
	            controller: 'ConfirmController',
	            backdrop: 'static',
	            windowClass: 'width-400',
	            resolve: {
	                message: function() { return message; }
	            }
	        });
	        return modalInstance.result;
	    }
	}
	});
	angular.module('avatech').controller('ConfirmController', function ($scope, $uibModalInstance,message) {
		$scope.message = message;
	    $scope.no = function () {
	        $uibModalInstance.dismiss();
	    };
	    $scope.yes = function () {
	        $uibModalInstance.close();
	    };
	});


/***/ },
/* 9 */
/***/ function(module, exports) {

	angular.module('avatech').directive('avalancheTriggerSelect', function($http, $timeout, $log) {
	  return {
	    restrict: 'E',
	    scope: { 
	      triggers: '=ngModel',
	      trigger: '=trigger'
	    },
	    template: '<div class="btn-group userSelect" uib-dropdown ng-show="trigger == \'N\'">' +
	'       <button  type="button" uib-dropdown-toggle class="btn btn-default">' +
	'         <i class="fa fa-plus"></i> Add Secondary Natural Trigger' +
	'       </button>' +
	'       <ul class="dropdown-menu" ng-click="$event.stopPropagation()" role="menu" style="width:300px;min-height:100px;"><li><a style="white-space:normal !important;background:transparent !important;padding:0 !important;">' +
	'         <ul class="results">' +
	'         	<li ng-repeat="type in naturalTriggers" ng-click="addTrigger(type)" ng-class="{ isMember: hasTrigger(type) }" close-dropdown-on-click>' +
	'         		{{ type.name }}<span class="arrow"><i class="fa fa-plus"></i></span>' +
	'     		</li>' +
	'         </ul>' +
	'         </a></li></ul>' +
	'</div>' +
	'<div class="btn-group userSelect" uib-dropdown ng-show="trigger == \'A\'">' +
	'      <button  type="button" uib-dropdown-toggle class="btn btn-default">' +
	'        <i class="fa fa-plus"></i> Add Secondary Artificial Trigger' +
	'      </button>' +
	'      <ul class="dropdown-menu" ng-click="$event.stopPropagation()" role="menu" style="width:300px;min-height:100px;"><li><a style="white-space:normal !important;background:transparent !important;padding:0 !important;">' +
	'        <div ng-repeat="cat in [\'Explosive\',\'Vehicle\',\'Human\',\'Miscellaneous\']">' +
	'	        <div class="subheader" ng-class="{ \'first\': $index == 0 }">{{ cat }}</div>' +
	'	        <ul class="results">' +
	'	        	<li ng-repeat="type in artificialTriggers[cat]" ng-click="addTrigger(type)" ng-class="{ isMember: hasTrigger(type) }" close-dropdown-on-click>' +
	'	        		{{ type.name }}' +
	'	        		<span class="arrow"><i class="fa fa-plus"></i></span>' +
	'        		</li>' +
	'	        </ul>' +
	'        </div>' +
	'        </a></li></ul>' +
	'	</div>' +
	'<ul style="margin-bottom:0px;margin-top:8px;padding-left:22px;" ng-show="triggers && triggers.length">' +
	'	<li ng-repeat="trigger in triggers">{{ getTriggerName(trigger) }} <span ng-click="removeTrigger(trigger)" style="margin-left:6px;"><i class="fa fa-times"></i></span></li>' +
	'</ul>'
		,link: function(scope, element) {


	    scope.addTrigger = function(trigger) {
	    	console.log("add trigger");
	    	console.log(trigger);
	        if (!scope.triggers) scope.triggers = [];
	        if (!scope.hasTrigger(trigger)) {
	        	console.log("pushing!");
	        	scope.triggers.push(trigger.code);
	        }
	    }
	    scope.removeTrigger = function(trigger) {
	    	if (!scope.triggers) return false;
	        angular.forEach(scope.triggers, function(triggerCode, index) {
	            if (triggerCode == trigger) {
	            	console.log("found!");
	            	scope.triggers.splice(index, 1);
	            	return;
	            }
	        });
	    }

	    scope.hasTrigger = function(trigger) {
	        if (!scope.triggers) return false;
	        var hasTrigger = false;
	        angular.forEach(scope.triggers, function(triggerCode){
	            if (triggerCode == trigger.code) hasTrigger = true;
	        })
	        return hasTrigger;
	    }

	    scope.getTriggerName = function(triggerCode) {
	        var name = "";
	        angular.forEach(scope.artificialTriggers,function(triggers, triggerCategory){
	            angular.forEach(triggers, function(trigger){
	                if (trigger.code == triggerCode) return name = triggerCategory + ": " + trigger.name;
	            });
	        });
	        angular.forEach(scope.naturalTriggers,function(trigger){
	            if (trigger.code == triggerCode) return name = trigger.name;
	        });
	        return name;
	    }

	    scope.artificialTriggers = {
	        "Explosive": [
	            { code: "AA", name: "Artillery" },
	            { code: "AE", name: "Explosive thrown or placed on or under snow surface by hand" },
	            { code: "AL", name: "Avalauncher" },
	            { code: "AB", name: "Explosive detonated above snow surface (air blast)" },
	            { code: "AC", name: "Cornice fall triggered by human or explosive action" },
	            { code: "AX", name: "Gas exploder" },
	            { code: "AH", name: "Explosives placed via helicopter" },
	            { code: "AP", name: "Pre-placed, remotely detonated explosive charge" }
	        ],
	        "Vehicle": [
	            { code: "AM", name: "Snowmobile" },
	            { code: "AK", name: "Snowcat" },
	            { code: "AV", name: "Other Vehicle" } //specify
	        ],
	        "Human": [
	            { code: "AS", name: "Skier" },
	            { code: "AR", name: "Snowboarder" },
	            { code: "AI", name: "Snowshoer" },
	            { code: "AF", name: "Foot penetration" },
	            //{ code: "AC", name: "Cornice fall produced by human or explosive action" }
	        ],
	        "Miscellaneous": [
	            { code: "AW", name: "Wildlife" },
	            { code: "AU", name: "Unknown artificial trigger" },
	            { code: "AO", name: "Unclassified artificial trigger" } //specify
	        ]
	    };
	    scope.naturalTriggers = [
	        { code: "N", name: "Natural trigger" },
	        { code: "NC", name: "Cornice fall" },
	        { code: "NE", name: "Earthquake" },
	        { code: "NI", name: "Ice fall" },
	        { code: "NL", name: "Avalanche triggered by loose snow avalanche" },
	        { code: "NS", name: "Avalanche triggered by slab avalanche" },
	        { code: "NR", name: "Rock fall" },
	        { code: "NO", name: "Unclassified natural trigger" } // specify
	    ];
	}
	}
	});


/***/ },
/* 10 */
/***/ function(module, exports) {

	angular.module('avatech').controller('HeaderController', function ($scope, $location, $route, RegisterDeviceModal, DeviceUploadModal, Global, $uibModal) {
	    $scope.global = Global;

	    $scope.registerSP1 = function() {
	        RegisterDeviceModal.open();
	    };

	    $scope.deviceUpload = function() {
	        DeviceUploadModal.open();
	    };

	    $scope.isActive = function (viewLocation) { 
	        return viewLocation === $location.path();
	    };

	    $scope.newOb = function(type) {
	        $uibModal.open({
	            templateUrl: "/modules/observations/new.html",
	            controller: "NewObservationModalController",
	            backdrop: 'static',
	            windowClass: 'width-480',
	            resolve: {
	              ob: function() { return { type: type }; }
	            }
	        }).result.finally(function() {
	            
	        });
	    }
	    
	});

/***/ },
/* 11 */
/***/ function(module, exports) {

	angular.module('avatech').factory('LocationSelectModal', function ($uibModal) {
	    return { open: function(options) {
	        var modalInstance = $uibModal.open({
	            templateUrl: '/modules/location-select-modal/location-select-modal.html',
	            controller: 'LocationSelectModalController',
	            backdrop: 'static',
	            windowClass: 'width-680',
	            resolve: {
	                initialLocation: function () {
	                  return options.initialLocation
	                }
	            }
	        });
	        return modalInstance.result;
	    }
	}
	});

	angular.module('avatech').controller('LocationSelectModalController',
	    function ($scope, $timeout, $uibModalInstance, initialLocation, Global) {

	        $scope.global = Global;

	        $scope.form = {};
	        $scope.mapHolder = {};
	        $scope.coords = {};

	        // $uibModalInstance.opened.then(function(){ });

	        var mapWatcher = $scope.$watch('mapHolder.map', function() {
	            if ($scope.mapHolder.map) {
	                // unregister watch
	                mapWatcher();
	                // go
	                loadMap();
	            }
	        });

	        var mapChangeTimer;
	        function mapChange() {
	            if (mapChangeTimer) $timeout.cancel(mapChangeTimer);
	            mapChangeTimer = $timeout(function(){
	                if ($scope.marker) {
	                    $scope.marker.setLatLng($scope.mapHolder.map.getCenter());
	                    $scope.marker.bringToFront();
	                }
	                var m = $scope.mapHolder.map.getCenter().wrap();
	                $scope.setLocation(m.lat, m.lng);
	                $scope.invalidLat = false;
	                $scope.invalidLng = false;
	                $scope.invalidE = false;
	                $scope.invalidN = false;
	                //$scope.$apply();
	            }, 50);
	        }

	        function loadMap() {
	            // leaflet uses lat/lng, DB uses lng/lat
	            if (initialLocation) initialLocation = [ parseFloat(initialLocation[1]), parseFloat(initialLocation[0])];
	            else if (!initialLocation) {
	                // set to either park city or user's location
	                if (!$scope.global.user.location) initialLocation = [40.633052,-111.7111795]
	                else initialLocation = [$scope.global.user.location[1],$scope.global.user.location[0]];
	            }

	            //$scope.mapHolder.map.on('drag', mapChange);
	            $scope.mapHolder.map.on('moveend', mapChange);

	            // set starting location and zoom
	            $scope.mapHolder.map.setView(initialLocation, 10, { animate: false });
	            $scope.mapHolder.map.invalidateSize();
	            $scope.setLocation(initialLocation[0], initialLocation[1]);
	        }

	        $scope.close = function () {
	            $uibModalInstance.dismiss();
	        };
	        $scope.select = function () {
	            $uibModalInstance.close($scope.form.location);
	        };

	        $scope.form.coordSystem = Global.user.settings.coordSystem;
	        $scope.$watch("form.coordSystem", function() {
	            if (!$scope.form.location) return;
	            $scope.setLocation($scope.form.location[1], $scope.form.location[0]);
	        }, true);

	        $scope.zones = [];
	        for (var i = 1; i <= 60; i++) {
	            $scope.zones.push(i);
	        }

	        $scope.setLocation = function(lat, lng) {
	            $scope.form.location = [ lng, lat ];

	            if ($scope.form.coordSystem == "dd") {

	                if (!$scope.coords.decimalDegrees) $scope.coords.decimalDegrees = {};
	                $scope.coords.decimalDegrees.lat = parseFloat(lat.toFixed(5));
	                $scope.coords.decimalDegrees.lng = parseFloat(lng.toFixed(5));

	            }
	            else if ($scope.form.coordSystem == "utm") {
	                // get UTM
	                var utm = LatLonToUTMXY(DegToRad(lat), DegToRad(lng));

	                // set UTM
	                if (!$scope.coords.utm) $scope.coords.utm = {};
	                $scope.coords.utm.zone = utm.zone;
	                $scope.coords.utm.hemisphere = (lat > 0) ? "N" : "S";
	                $scope.coords.utm.e = parseInt(utm.x.toFixed(0));
	                $scope.coords.utm.n = parseInt(utm.y.toFixed(0));
	            }
	        }

	        var utm_timer;
	        $scope.$watch("coords.utm", function(){
	            if (utm_timer) clearTimeout(utm_timer);
	            utm_timer = setTimeout(function(){
	                if (!$scope.coords.utm || $scope.coords.utm.zone === null) return;

	                // validate
	                if ($scope.coords.utm.e.length > 8 || isNaN(parseFloat($scope.coords.utm.e))) $scope.invalidE = true;
	                else $scope.invalidE = false;
	                if ($scope.coords.utm.n.length > 8 || isNaN(parseFloat($scope.coords.utm.n))) $scope.invalidN = true;
	                else $scope.invalidN = false;
	                if ($scope.invalidE || $scope.invalidN) return;

	                // conver to lat/lng
	                var latlng = UTMXYToLatLon($scope.coords.utm.e, $scope.coords.utm.n, $scope.coords.utm.zone, $scope.coords.utm.hemisphere === "S");
	                
	                var lat = RadToDeg(latlng.lat);
	                var lng = RadToDeg(latlng.lng);

	                $scope.invalidLat = false;
	                $scope.invalidLng = false;

	                $scope.form.location = [ lng, lat ];
	                // center map
	                $scope.mapHolder.map.setView({ lat: lat, lng: lng }, $scope.mapHolder.map.getZoom(), { animate: true });
	                $scope.$apply();
	            }, 100);
	        }, true);

	        var dd_timer;
	        $scope.$watch("coords.decimalDegrees", function() {
	            if (dd_timer) clearTimeout(dd_timer);
	            dd_timer = setTimeout(function(){
	                if (!$scope.coords.decimalDegrees) return;

	                var lat = parseFloat($scope.coords.decimalDegrees.lat);
	                var lng = parseFloat($scope.coords.decimalDegrees.lng);

	                // validate
	                if (isNaN(lat) || lat < -90 || lat > 90) $scope.invalidLat = true;
	                else $scope.invalidLat = false;
	                if (isNaN(lng) || lng < -180 || lng > 180)  $scope.invalidLng = true;
	                else $scope.invalidLng = false;
	                if ($scope.invalidLat || $scope.invalidLng) return;

	                $scope.form.location = [ lng, lat ];
	                // center map
	                $scope.mapHolder.map.setView({ lat: lat, lng: lng }, $scope.mapHolder.map.getZoom(), { animate: true });
	                $scope.$apply();
	            }, 100);
	        }, true);

	    }
	);

/***/ },
/* 12 */
/***/ function(module, exports) {

	angular.module('avatech').factory('mapLayers', function ($q, Restangular, Global) { 

	var layers = Restangular.one("users", Global.user._id).one("maps").get();

	return {

	   loaded: layers,

	   getLayerByAlias: function(alias) {
	      var _this = this;
	      if (!_this.baseLayers) return null;

	      var layer;
	      if (_this.baseLayers.terrain) {
	         for (var i = 0; i < _this.baseLayers.terrain.length; i++) {
	            var l = _this.baseLayers.terrain[i];
	            if (l.alias == alias) layer = l;
	         }
	      }
	      if (_this.baseLayers.aerial) {
	         for (var i = 0; i < _this.baseLayers.aerial.length; i++) {
	            var l = _this.baseLayers.aerial[i];
	            if (l.alias == alias) layer = l;
	         }
	      }
	      return layer;
	    },
	    baseLayers: layers.$object,
	  };
	});

/***/ },
/* 13 */
/***/ function(module, exports) {

	angular.module('avatech').directive('linearGraph', function($timeout, $q, $parse) {
	  return {
	    restrict: 'A',
	    scope: false,
	    link: function(scope, element, attrs) {

	        var labels;
	        var colorMap;
	        var labelValues;

	        var a = $q.defer();
	        var b = $q.defer();
	        var c = $q.defer();

	        attrs.$observe('legend', function(value) {
	            a.resolve();
	        });

	        attrs.$observe('labelValues', function(value) {
	            b.resolve();
	        });

	        attrs.$observe('labels', function(value) {
	            c.resolve();
	        });

	        $q.all([a.promise,b.promise,c.promise]).then(function() {
	            colorMap = getColorMap($parse(attrs.legend)(scope));
	            labels = $parse(attrs.labels)(scope);
	            labelValues = $parse(attrs.labelValues)(scope);

	            render();
	        })

	        function blendRGBColors(c0, c1, p) {
	            return [Math.round(Math.round(c1[0] - c0[0]) * (p / 100)) + c0[0],
	                    Math.round(Math.round(c1[1] - c0[1]) * (p / 100)) + c0[1],
	                    Math.round(Math.round(c1[2] - c0[2]) * (p / 100)) + c0[2]
	                ];
	        }
	        function blendHexColors(c0, c1, p) {
	            c0 = hexToRGB(c0);
	            c1 = hexToRGB(c1);
	            return blendRGBColors(c0, c1, p);
	        }
	        function hexToRGB(hex) {
	            return [
	                parseInt(hex.substring(0,2),16),
	                parseInt(hex.substring(2,4),16),
	                parseInt(hex.substring(4,6),16)
	            ];
	        }

	        function getPercent(min, max, val) {
	            return Math.floor(((val - min) * 100) / (max - min));
	        }

	        function getColorMap(steps){
	            var colorMap = [];
	            //var maxValue = steps[steps-1].val;
	            //var increment = parseInt(maxValue / steps.length);

	            for (var s = 0; s < steps.length; s++) {
	                if (s == steps.length - 1) break;
	                var min = steps[s].val;
	                var max = steps[s+1].val;

	                var minColor = steps[s].color;
	                var maxColor = steps[s+1].color;

	                for (var i = min; i <= max; i++)
	                    colorMap[i] = blendHexColors(minColor,maxColor, getPercent(min, max, i));
	            }
	            return colorMap;
	        }

	        var canvas = element[0];
	        var context = canvas.getContext('2d');

	        // scale for retina
	        if (window.devicePixelRatio > 1) {
	            context.scale(window.devicePixelRatio, window.devicePixelRatio);
	            canvas.height *= window.devicePixelRatio;
	            canvas.width *= window.devicePixelRatio;
	        }

	        var graphHeight = canvas.height;
	        var graphWidth = canvas.width;

	        function render() {
	            // clear canvas
	            context.clearRect(0, 0, canvas.width, canvas.height);

	            // draw colors

	            var min = attrs.min ? parseInt(attrs.min) : 0;
	            var max = parseInt(attrs.max);
	            var width = canvas.width;

	            context.lineWidth = 1;

	            for (var i = 0; i < width; i++) {
	                var slope = (((i / width) * (max - min)) + min);
	                var color = colorMap[parseInt(slope)]

	                // blend between stops
	                if (slope % 1 > 0) {
	                    var previousColor = colorMap[parseInt(slope - 1)];
	                    var percent = (slope - parseInt(slope)) * 100;
	                    color = blendRGBColors(previousColor, color, percent);
	                }

	                // draw
	                context.strokeStyle = "rgb(" + color.join() + ")";
	                context.beginPath();
	                context.moveTo(i, 0);
	                context.lineTo(i, 28 * window.devicePixelRatio);
	                context.stroke();
	            }

	            // draw labels

	            context.fillStyle = 'black';
	            context.font = (19 * window.devicePixelRatio) + 'px sans-serif';

	            angular.forEach(labels, function(label, i) {
	                var x = ((label - min) / (max - min)) * width;
	                if (attrs.labelSuffix) label += attrs.labelSuffix;

	                if (labelValues) label = labelValues[i];

	                var measured = context.measureText(label);
	                context.fillText(label, x - (measured.width / 2), 50 * window.devicePixelRatio);
	            });
	        }
	    }
	  };
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	
	var AvatechTerrainLayer = __webpack_require__(15)

	angular.module('avatech').directive('map', function($timeout, $q, $state, $rootScope, $templateRequest, $compile, snowpitExport, snowpitConstants, Global, mapLayers, $http, $log, terrainVisualization, $uibModal) {
	  return {
	    restrict: 'A',
	    templateUrl: "/modules/map/map-directive.html",
	    scope: { 
	        map: '=map',
	        terrainLayer: '=terrainLayer',
	        profiles: '=obs',
	        detailMode: '=detailMode',
	        loadingNew: '=loadingNew',
	        loadingProfiles: '=loading',
	        hoverOb: '=hoverOb',
	        obSearch: '=search',
	        showTerrain: '=showTerrain',
	        showCoords: '=showCoords',
	        load: '=load'
	    },
	    link: function(scope, element) {

	        scope.global = Global;

	        scope.formatters = snowpitExport.formatters;

	        scope.mapLayers = mapLayers;

	        // get color maps for terrain viz legends
	        scope.colorMaps = terrainVisualization.colorMaps;

	        // defaults
	        if (scope.showTerrain == undefined) scope.showTerrain = true;
	        if (scope.showCoords == undefined) scope.showCoords = true;

	        var loaded = false;
	        scope.$watch('load', function() {
	            if (scope.load && !loaded) loadMap();
	        });

	        function loadMap() {
	            loaded = true;

	            // pre-compile observation map popup
	            scope.compiledPopup;
	            $templateRequest("/modules/map/observation-map-popup.html").then(function(templateHtml) {
	                scope.compiledPopup = $compile(angular.element(templateHtml));
	            });

	            // get map holder DOM element
	            var mapElement = element[0].querySelector('.map-holder');

	            function newOb(type, latlng) {
	                // lng/lat array
	                var location = [
	                    parseFloat(latlng.lng.toFixed(7)),
	                    parseFloat(latlng.lat.toFixed(7))
	                ];
	                // for snowpit, go to snowpit editor
	                if (type == "snowpit") {
	                    $state.go('index.profileEditor.details', { profileId: "new", location: location })
	                    return;
	                }
	                // for everything else, show edit modal
	                $uibModal.open({
	                    templateUrl: "/modules/observations/new.html",
	                    controller: "NewObservationModalController",
	                    backdrop: 'static',
	                    windowClass: 'width-480',
	                    resolve: {
	                      ob: function() { return { type: type, location: location }; }
	                    }
	                });
	            }

	             // init leaflet map
	            scope.map = L.map(mapElement, {
	                zoomControl: false,
	                minZoom: 3,
	                maxZoom: 18,
	                worldCopyJump: true,
	                // context menu
	                contextmenu: true,
	                contextmenuWidth: 140,
	                contextmenuItems: [
	                {
	                    text: 'Avalanche',
	                    callback: function(e) { newOb('avalanche', e.latlng); }
	                },
	                {
	                    text: 'Snowpack',
	                    callback: function(e) { newOb('snowpack', e.latlng); }
	                }, 
	                {
	                    text: 'Snowpack Test',
	                    callback: function(e) { newOb('snowpack-test', e.latlng); }
	                }, 
	                {
	                    text: 'Snowpit',
	                    callback: function(e) { newOb('snowpit', e.latlng); }
	                }, 
	                {
	                    text: 'Weather',
	                    callback: function(e) { newOb('weather', e.latlng); }
	                },
	                {
	                    text: 'Wind',
	                    callback: function(e) { newOb('wind', e.latlng); }
	                }
	                ]
	            });

	            // disable scroll wheel zoom
	            //scope.map.scrollWheelZoom.disable();

	            // add markers layer
	            scope.mapLayer = L.layerGroup().addTo(scope.map);

	            // add zoom control to map
	            new L.Control.Zoom({ position: 'bottomright' }).addTo(scope.map);
	            //L.control.zoomslider({ position: 'bottomright' }).addTo(scope.map);

	            // add scale control to map
	            // L.control.scale({
	            //     metric: true,
	            //     imperial: true,
	            //     position: 'topleft'
	            // }).addTo(scope.map);
	            
	            var mapLoaded = $q.defer();
	            scope.map.on('load', function(e) { mapLoaded.resolve(); });

	            // setup heatmap
	            var heatMap;
	            setTimeout(function() {
	                heatMap = L.heatLayer([], { radius: 1, blur: 1, maxZoom: 20 }).addTo(scope.map);
	            },10);

	            // setup clustering
	            var pruneCluster = new PruneClusterForLeaflet();
	            pruneCluster.Cluster.Size = 10; 
	            scope.map.addLayer(pruneCluster);

	            // render observation icons
	            pruneCluster.PrepareLeafletMarker = function(leafletMarker, data) {
	                // detailed mode
	                if (scope.detailMode) {
	                    var markerClass = 'count-icon';
	                    // append observation type to class
	                    markerClass += ' ' + data.observation.type
	                    // append redFlag
	                    if (data.observation.redFlag) markerClass += ' redFlag';

	                    // set marker icon based on observation type
	                    leafletMarker.setIcon(L.divIcon({
	                        className: markerClass,
	                        html: "",
	                        iconSize: [30, 45]
	                    }));

	                    // clear existing bindings
	                    leafletMarker.off('click');

	                    // show popup on click
	                    leafletMarker.on('click', function (e) {
	                        var existingPopup = leafletMarker.getPopup();
	                        // if popup doesn't exist, create it
	                        if (!existingPopup) {
	                            // create scope for popup (true indicates isolate scope)
	                            var newScope = scope.$new(true);
	                            newScope.profile = data.observation;
	                            // bind scope to pre-compiled popup template
	                            scope.compiledPopup(newScope, function(clonedElement) {
	                                // bind popup with compiled template html
	                                leafletMarker.bindPopup(clonedElement[0], {
	                                    offset: new L.Point(0, -10)
	                                });
	                            });
	                            scope.$apply();
	                            this.openPopup();
	                        }
	                    });
	                }
	                // heatmap mode
	                else {
	                    // if single icon, style as cluster icon
	                    leafletMarker.setIcon(L.divIcon({
	                        className: 'prunecluster',
	                        html: "<div><span>1</span></div>",
	                        iconSize: [30, 30]
	                    }));

	                    // clear existing bindings
	                    leafletMarker.off('click');

	                    // zoom in on click
	                    leafletMarker.on('click', function (e) {
	                        scope.map.setView(e.latlng, 11, { animate: true });
	                    });
	                }
	            };

	            // render observation cluster icons
	            pruneCluster.BuildLeafletClusterIcon = function(cluster) {
	                var className = 'prunecluster'

	                // if in detailed mode
	                if (scope.detailMode) className += ' detailed'

	                // hacky yet highly performant way to determine if there is a red flag in the cluster
	                var redFlagInCluster = cluster.stats[1] > 0;
	                if (redFlagInCluster) className += ' redFlag';

	                // create icon
	                return new L.DivIcon({
	                    html: "<div><span>" + cluster.population + "</span></div>",
	                    className: className,
	                    iconSize: L.point(30, 30)
	                });
	            }

	            // plot obs on map
	            var obsOnMap = {};
	            function plotObsOnMap() {
	                angular.forEach(scope.profiles,function(profile) {
	                    // already on map
	                    var existingMarker = obsOnMap[profile._id];
	                    if (existingMarker) {
	                        // if deleted, remove it from map and from list
	                        if (profile.removed) {
	                            pruneCluster.RemoveMarkers([existingMarker]);
	                            delete obsOnMap[profile._id];
	                        }
	                    }
	                    // not on map (ignore if removed)
	                    else if (!profile.removed) {
	                        var marker = new PruneCluster.Marker(profile.location[1], profile.location[0]);

	                        // associate profile with marker
	                        marker.data.observation = angular.copy(profile);

	                        // this looks hacky but it's by far the most performant way to keep
	                        // track of red flags (uses the PruneCluster lib's 'category' feature)
	                        marker.category = + profile.redFlag;

	                        // add to map
	                        pruneCluster.RegisterMarker(marker);
	                        // keep track of all markers placed on map
	                        obsOnMap[profile._id] = marker;
	                    }
	                });
	                pruneCluster.ProcessView();
	            }

	            // search
	            var searchObs = function() {
	                if (!scope.obSearch) return;
	                // reset heatmap
	                if (heatMap) heatMap.setLatLngs([]);

	                // hide all markers
	                angular.forEach(obsOnMap, function(marker) {
	                    marker.filtered = true;
	                    marker.data.filtered = true;
	                });
	                // iterate through obs and filter
	                angular.forEach(scope.profiles,function(ob) {
	                    ob.filtered = true;
	                    if (scope.obSearch.doSearch(ob)) {
	                        ob.filtered = false;
	                        obsOnMap[ob._id].filtered = false;
	                        obsOnMap[ob._id].data.filtered = false;
	                        // add to heatmap
	                        if (heatMap) heatMap.addLatLng([ob.location[1], ob.location[0]]);
	                    }
	                });
	                pruneCluster.ProcessView();
	            }

	            // debounce ob search
	            var _searchTimeout;
	            scope.$watch('obSearch',function() {
	                if (!scope.obSearch) return;
	                if (_searchTimeout) $timeout.cancel(_searchTimeout);
	                _searchTimeout = $timeout(function() {
	                    searchObs();
	                }, 200);
	            }, true);

	            // go to location selected in location search
	            scope.mapSearchSelect = function(location) {
	                if (location.lat && location.lng)
	                    scope.map.setView([location.lat,location.lng], 
	                        12, // zoom
	                        { animate: false });
	            }

	            scope.setBaseLayer = function(layer, clicked) {

	                if (clicked) mixpanel.track("set base layer", { alias: layer.alias, name: layer.name });

	                scope.selectedBaseLayer = layer;

	                var newBaseLayer;
	                if (layer.type == "TILE") {
	                    var options = {
	                        zIndex: 2,
	                        opacity: 1,
	                        detectRetina: true,
	                        errorTileUrl: "https://s3.amazonaws.com/avatech-static/empty.png",
	                        tms: layer.tms == null ? false : layer.tms,
	                        reuseTiles: true, updateInterval: 400
	                    }
	                    if (layer.retina != null) options.detectRetina = layer.retina;
	                    if (layer.maxresolution) options.maxNativeZoom = layer.maxresolution;
	                    if (layer.subdomains) options.subdomains = layer.subdomains;

	                    var _url = layer.template;
	                    // if (layer.proxy) {
	                    //     var _url = "http://localhost:4000/?url=" +
	                    //         _url.substr(_url.indexOf("://") + 3);
	                    // }

	                    newBaseLayer = L.tileLayer(_url, options);
	                }
	                else if (layer.type == "WMS") {
	                    var options = {
	                        zIndex: 2,
	                        opacity: 1,
	                        //detectRetina: true,
	                        maxNativeZoom: 16,
	                        format: 'image/png',
	                        errorTileUrl: "https://s3.amazonaws.com/avatech-static/empty.png",
	                        reuseTiles: true, updateInterval: 400
	                    };
	                    if (layer.layers) options.layers = layer.layers;
	                    else options.layers = 0;

	                    if (layer.version) options.version = layer.version;

	                    newBaseLayer = L.tileLayer.wms(layer.template, options);
	                }
	                else if (layer.type == "MAPBOX") {
	                    var options = {};
	                    if (layer.maxresolution) options.maxNativeZoom = layer.maxresolution;
	                   // newBaseLayer = L.mapbox.tileLayer(layer.id, options);

	                    newBaseLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/{layerId}/{z}/{x}/{y}{retina}.png?access_token={accessToken}', {
	                        accessToken: 'pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0.q_Esm5hrpZLbl1XQERtKpg',
	                        layerId: layer.id,
	                        retina: L.Browser.retina ? '@2x' : '',
	                        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
	                        reuseTiles: true, updateInterval: 400
	                        //crossOrigin: true
	                    });
	                }

	                // add new layer to map
	                if (newBaseLayer) newBaseLayer.addTo(scope.map);
	                // remove old layer from map (todo: should we keep it?)
	                if (scope.baseLayer) scope.map.removeLayer(scope.baseLayer);
	                // keep track of base layer on scope
	                scope.baseLayer = newBaseLayer;

	                // save to user settings
	                scope.global.setUserSetting("defaultMap", layer.alias);
	            }

	             // re-render observation icons when zoom level is changed
	            var detailedZoomMin = 9;
	            scope.detailMode = true;
	            scope.map.on('zoomend', function(e) {
	                var zoom = scope.map.getZoom();

	                if (!scope.detailMode && zoom >= detailedZoomMin) {
	                    $log.debug("DETAIL MODE ON");
	                    scope.detailMode = true;

	                    // redraw icons
	                    pruneCluster.RedrawIcons();
	                    pruneCluster.ProcessView();

	                    // hide heatmap
	                    if (heatMap) heatMap.setOptions({ radius: 1, blur: 1, maxZoom: 20 });
	                }
	                else if (scope.detailMode && zoom < detailedZoomMin) {
	                    $log.debug("DETAIL MODE OFF");
	                    scope.detailMode = false;

	                    // redraw icons
	                    pruneCluster.RedrawIcons();
	                    pruneCluster.ProcessView();

	                    // show heatmap
	                    if (heatMap) heatMap.setOptions({
	                        radius: 10, blur: 15, maxZoom: zoom //(zoom + (zoom / 4))
	                    });
	                }

	                // track zoom on mixpanel (to see which zoom levels are most popular)
	                mixpanel.track("zoom", zoom);
	            });

	            // keep track of location at cursor
	            var terrainQueryTimer;
	            scope.map.on('mousemove', function(e) {
	                scope.$apply(function() {
	                    scope.mapCursorLocation = e.latlng;
	                    // query terrain layer
	                    if (e.latlng && scope.terrainLayer) {
	                        if (terrainQueryTimer) $timeout.cancel(terrainQueryTimer);
	                        terrainQueryTimer = $timeout(function(){
	                            scope.terrainLayer.getTerrainData(e.latlng.lat, e.latlng.lng)
	                            .then(function(data) {
	                                if (!data || !data.elevation) return;
	                                scope.mapCursorElevation = data.elevation;
	                                scope.$apply();
	                            });
	                        }, 50);
	                    }
	                });
	                //scope.$apply();
	            });
	            scope.map.on('mouseout', function(e) {
	                //$timeout(;
	                scope.$apply(function(){ scope.mapCursorLocation = null; });
	            });

	            // set initial location and zoom level
	            var defaultZoom = 13;
	            var initialLocation = (!scope.global.user.location) ? [40.633052,-111.7111795] : [scope.global.user.location[1],scope.global.user.location[0]];
	            scope.map.setView(initialLocation, defaultZoom);

	            // set base layer after map has been initialized and layers have been loaded from server
	            $q.all([
	                mapLoaded,
	                scope.mapLayers.loaded
	            ]).then(function() {

	                // get default layer based on location
	                var defaultMap = "mbworld";
	                var country = scope.global.user.country;
	                if (country) {
	                    if (country == "US") defaultMap = "mbus";
	                    else if (country == "CA") defaultMap = "mbmetric";
	                    else if (country == "FR") defaultMap = "mbfr";
	                    else if (country == "DE") defaultMap = "mbde";
	                    else if (country == "AT") defaultMap = "mbde";
	                }
	                var defaultLayer = scope.mapLayers.getLayerByAlias(defaultMap);

	                // get saved default base layer
	                var savedMap = scope.global.user.settings.defaultMap;
	                var baseMap = scope.mapLayers.getLayerByAlias(savedMap);
	                if (!baseMap) baseMap = defaultLayer;

	                // setTimeout is needed to solve that bug where the zoom animation is incorrect
	                setTimeout(function() {
	                    scope.setBaseLayer(baseMap);
	                });

	                // load obs

	            });


	            // resize map when window is resized
	            scope.$on('resizeMap', function() { 
	                $timeout(function() { scope.map.invalidateSize(); });
	                // weird hack to ensure correct new window size
	                $timeout(function() { scope.map.invalidateSize(); }, 200);
	            });

	            // load profiles
	            scope.loadingNew = false;
	            scope.loadProfiles = function(showLoader) {
	                var bounds = scope.map.getBounds();
	                if (showLoader !== false) scope.loadingNew = true;

	                // abort previous requests
	                //if (scope.canceler) scope.canceler.resolve();
	                //scope.canceler = $q.defer();

	                // padding in pixels (so we don't get cut-off map points)
	                var padding = 5;

	                var point_ne = scope.map.latLngToContainerPoint(bounds._northEast);
	                point_ne.y += padding; point_ne.x -= padding;
	                point_ne = scope.map.containerPointToLatLng(point_ne);

	                var point_sw = scope.map.latLngToContainerPoint(bounds._southWest);
	                point_sw.y -= padding; point_sw.x += padding;
	                point_sw = scope.map.containerPointToLatLng(point_sw);

	                $http({
	                    method: 'GET',
	                    url: window.apiBaseUrl + "observations",
	                    responseType: "json",
	                    params: {
	                        nelat: point_ne.lat, nelng: point_ne.lng, 
	                        swlat: point_sw.lat, swlng: point_sw.lng, 
	                        verbose: false
	                    }
	                })
	                .then(function(res) {
	                    scope.profiles = res.data;
	                    plotObsOnMap();
	                    searchObs();
	                    scope.loadingProfiles = false;
	                    scope.loadingNew = false;
	                });
	            }

	            // handle loading of observations
	            function initLoad() {
	                scope.loadingProfiles = true;
	                scope.loadProfiles(false);
	                setTimeout(function(){
	                    setInterval(function(){
	                        scope.loadProfiles(false);
	                    }, 60000);
	                }, 60000);
	            }

	            function terrainLoad() {
	                scope.terrainLayer.off('load', terrainLoad);
	                scope.loadProfiles();
	            }
	            var moveTimer;
	            scope.map.on('moveend', function() {
	                if (scope.terrainLayer) {
	                    scope.terrainLayer.off('load', terrainLoad);
	                    // todo: hacky way to wait for terrain loading, need to find a better solution
	                    if (moveTimer) $timeout.cancel(moveTimer);
	                    moveTimer = $timeout(function() {
	                        if(!scope.isTerrainLoaded) {
	                            scope.terrainLayer.off('load', terrainLoad);
	                            scope.terrainLayer.on('load', terrainLoad);
	                        } 
	                        else terrainLoad();

	                    }, 200);
	                }
	                else scope.loadProfiles();
	            });

	            // make sure map loads properly
	            $timeout(function(){
	                scope.map.invalidateSize();
	            });

	            var hoverDelay;
	            scope.$watch('hoverOb', function() {
	                // debounce
	                if (hoverDelay) $timeout.cancel(hoverDelay);
	                hoverDelay = $timeout(function() {
	                    scope.hideMapButtons = !!scope.hoverOb;
	                    // if ob is specified, only show that ob
	                    if (scope.hoverOb) {
	                        angular.forEach(obsOnMap, function(marker) {
	                            // hide
	                            marker.filtered = true;
	                            // show if matches filter
	                            if (scope.hoverOb == marker.data.observation._id) marker.filtered = false;
	                        });
	                    }
	                    // if no ob is specified, reset to former value
	                    else {
	                        angular.forEach(obsOnMap, function(marker) {
	                            marker.filtered = marker.data.filtered;
	                        });
	                    }
	                    pruneCluster.ProcessView();
	                }, 50);
	            }, true);


	            // hack to hide zoom control on hideMapButtons
	            scope.$watch("hideMapButtons", function() {
	                $(mapElement).find(".leaflet-control-zoom").css("opacity", scope.hideMapButtons ? 0 : 1);
	            });

	            // ---------------------------------------------------
	            // --------------------- TERRAIN ---------------------
	            // ---------------------------------------------------

	            // init terrain layer
	            if (scope.showTerrain) {
	                scope.overlayOpacity = .5;
	                scope.terrainLayer = AvatechTerrainLayer({
	                    zIndex: 999,
	                    opacity: scope.overlayOpacity
	                }).addTo(scope.map);

	                scope.terrainLayer.on('loading', function() {
	                    scope.isTerrainLoaded = false;
	                });
	                scope.terrainLayer.on('load', function() {
	                    scope.isTerrainLoaded = true;
	                });
	                scope.terrainLayer.once('load', initLoad);

	                setTimeout(function(){
	                    scope.terrainLayer.setZIndex(99998);
	                }, 100);

	                scope.$watch('overlayOpacity', function() {
	                    scope.terrainLayer.setOpacity(scope.overlayOpacity);
	                });

	                scope.map.on('viewreset', function () {
	                    scope.terrainLayer.redrawQueue = [];
	                    // workers.forEach(function (worker) {
	                    //     worker.postMessage('clear');
	                    // });
	                });
	                scope.map.on('zoomstart', function(e) {
	                    scope.terrainLayer.redrawQueue = [];
	                });

	                // set terrain overlay
	                scope.$watch('terrainOverlay', function() {
	                    scope.terrainLayer.setOverlayType(scope.terrainOverlay);
	                });

	                // custom terrain visualization
	                scope.elevationMax = Global.user.settings.elevation == 0 ? 8850 : 8850;
	                scope.customTerrain = {
	                    color: '#FFFF00',

	                    elev_low: 0,
	                    elev_high: scope.elevationMax,

	                    slope_low: 0,
	                    slope_high: 70,

	                    aspect_low: 0,
	                    aspect_high: 359,
	                };
	                var customTerrainTimer;
	                scope.$watch('customTerrain', function() {
	                    if (customTerrainTimer) clearTimeout(customTerrainTimer);
	                    customTerrainTimer = setTimeout(function(){
	                        if (scope.customTerrain.color.indexOf('#') == 0) scope.customTerrain.color = scope.customTerrain.color.substr(1);
	                        scope.terrainLayer.setCustomParams(angular.copy(scope.customTerrain));
	                    }, 30);
	                }, true);
	            }
	            else initLoad();

	            scope.capitalizeFirstLetter = function(str) {
	                if (!str) return '';
	                return str.charAt(0).toUpperCase() + str.slice(1);
	            }

	            // map grid overlay
	            var gridOverlayLayer;
	            scope.$watch('gridOverlay', function(newOverlay, oldOverlay) {
	                if (newOverlay != oldOverlay && gridOverlayLayer) {
	                    scope.map.removeLayer(gridOverlayLayer);
	                    gridOverlayLayer = null;
	                }
	                if (newOverlay == 'utm') {
	                    gridOverlayLayer = new UTMGridLayer();
	                }
	                else if (newOverlay == 'dd') {
	                    //gridOverlayLayer = new LatLngGridLayer();
	                }
	                if (gridOverlayLayer) {
	                    gridOverlayLayer.addTo(scope.map);
	                    gridOverlayLayer.setZIndex(99999);
	                }
	            });

	            // todo: duplicate
	            scope.formatElev = function(val) {
	                if (!Global.user.settings) return;
	                // meters
	                if (Global.user.settings.elevation == 0)
	                    return val + " m";
	                // feet
	                else {
	                    return Math.round(val * 3.28084).toFixed(0) + " ft";
	                }
	            }
	            scope.formatTempRange = function(val1,val2) {
	                if (!Global.user.settings) return;
	                // meters
	                if (Global.user.settings.elevation == 0)
	                    return val1 + "-" + val2 + " m";
	                // feet
	                else {
	                    return Math.round(val1 * 3.28084).toFixed(0) + "-" + Math.round(val2 * 3.28084).toFixed(0) + " ft";
	                }
	            }
	            scope.formatDegSlider = function(val) {
	                return val + "°"
	            }
	        }
	    }
	  };
	});

/***/ },
/* 15 */
/***/ function(module, exports) {

	// By Andrew Sohn
	// (C) 2015 Avatech, Inc.

	var AvatechTerrainLayer = function (options) {

	    // get angular module dependencies
	    var injector = angular.injector(["ng","terrain"]);
	    var $q = injector.get("$q");
	    var terrainVisualization = injector.get("terrainVisualization");

	    options.underzoom = true;
	    options.updateWhenIdle = true;
	    options.maxNativeZoom = 13;

	    // base terrain layer on leaflet GridLayer
	    var terrainLayer = new L.GridLayer(options);

	    terrainLayer.redrawQueue = [];
	    terrainLayer.needsRedraw = false;
	    terrainLayer.overlayType;

	    terrainLayer.createTile = function(tilePoint, tileLoaded) {
	        // create tile canvas element
	        var tile = L.DomUtil.create('canvas', 'leaflet-tile always-show');

	        // setup tile width and height according to the options
	        var size = this.getTileSize();
	        tile.width = size.x;
	        tile.height = size.y;

	        // attach tileLoaded callback to element for easier access down the chain
	        tile._tileLoaded = tileLoaded;

	        tile._terrainLoaded = $q.defer();

	        // if tileLoaded not specified, call dummy function
	        if (!tile._tileLoaded) tile._tileLoaded = function() { };
	        // draw tile
	        this.drawTile(tile, tilePoint);
	        // return tile so Leaflet knows to expect tileLoaded callback later
	        return tile;
	    }

	    terrainLayer.getTileSize = function () {
	        var map = this._map,
	            tileSize = L.GridLayer.prototype.getTileSize.call(this),
	            zoom = this._tileZoom,
	            zoomN = this.options.maxNativeZoom;

	        // increase tile size for zoom level 12 (scale up from 11)
	        if (options.underzoom && parseInt(zoom) == 12) tileSize = new L.Point(512, 512); // 128

	        // increase tile size when overzooming (scalw down from 13)
	        else tileSize = zoomN !== null && zoom > zoomN ?
	            tileSize.divideBy(map.getZoomScale(zoomN, zoom)).round() : tileSize;

	        return tileSize;
	    }

	    terrainLayer.updateTile = function(ctx, pixels) {
	        // get tile size
	        var tileSize = ctx.canvas.width;

	        // clear canvas
	        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	        // get new pixels from worker thread response
	        var pixels = new Uint8ClampedArray(pixels);

	        // regular size tile
	        if (tileSize == 256) {
	            var imgData = ctx.createImageData(256, 256);
	            imgData.data.set(pixels);
	            ctx.putImageData(imgData, 0, 0);
	        }
	        // scale for overzoom and underzoom
	        else {
	            var temp_canvas = document.createElement('canvas');
	            temp_canvas.width = temp_canvas.height = 256;
	            var temp_context = temp_canvas.getContext('2d');

	            var imgData = temp_context.createImageData(256, 256);
	            imgData.data.set(pixels);
	            temp_context.putImageData(imgData, 0, 0);

	            ctx.drawImage(temp_canvas, 0, 0, 256, 256, 0, 0, tileSize, tileSize);
	        }
	    }

	    terrainLayer.drawTile = function(canvas, tilePoint) {
	        var context = canvas.getContext('2d');
	        //context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	        function redraw() {
	            // if no terrain overlay specified, clear canvas
	            if (!terrainLayer.overlayType) {
	                context.clearRect (0, 0, canvas.width, canvas.height);
	                return;
	            }
	            // get pixels
	            var pixels;
	            if (terrainLayer.overlayType == "hillshade") pixels = terrainVisualization.hillshade(canvas._terrainData)
	            else pixels = terrainVisualization.render(canvas._terrainData, terrainLayer.overlayType, terrainLayer.customParams); 
	            // draw canvas
	            terrainLayer.updateTile(context, pixels.buffer);
	        }
	        
	        // adjust zoom point for overzoom
	        // overzoom
	        if (tilePoint.z > this.options.maxNativeZoom) tilePoint.z = this.options.maxNativeZoom;
	        // make zoom level 12 overzoomed from 11
	        if (this.options.underzoom && parseInt(tilePoint.z) == 12) tilePoint.z = 11;

	        // elevation tile URL
	        var url = L.Util.template('https://tiles-{s}.avatech.com/{z}/{x}/{y}.png', L.extend(tilePoint, {
	            // use multiple subdomains to parallelize requests
	            //   cycle through using same implementation as Leaflet TileLayer.
	            //   makes sure to return same subdomain each time a URL is fetched
	            //   to prevent duplicate browser caching.
	            s: function (argument) {
	                var subdomains = "abc";
	                return subdomains[Math.abs(tilePoint.x + tilePoint.y) % subdomains.length];
	            }
	        }));

	        // get tile as raw Array Buffer so we can process PNG on our own 
	        // to avoid bogus data from native browser alpha premultiplication
	        var xhr = new XMLHttpRequest;
	        xhr.open("GET", url, true);
	        xhr.responseType = "arraybuffer";
	        xhr.onload = function() {
	            // if anything other than a 200 status code is recieved, fire loaded callback
	            if (xhr.status != 200) return canvas._tileLoaded(null, canvas);
	            // get PNG data from response
	            var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
	            // decode PNG
	            var png = new PNG(data);
	            // if PNG was succesfully decoded
	            if (png) {
	                var pixels = png.decodePixels();
	                canvas._terrainData = new Uint32Array(new Uint8ClampedArray(pixels).buffer);

	                canvas._terrainLoaded.resolve();

	                // fire tileLoaded callback
	                if (canvas._tileLoaded) {
	                    //console.log("loaded!");
	                    canvas._tileLoaded(null, canvas);
	                    // remove the function so it can't be called twice
	                    canvas._tileLoaded = null;
	                }

	                redraw();
	                terrainLayer.redrawQueue.push(redraw);

	                pixels = null;
	                png = null;
	            }
	            // error decoding PNG
	            else if (canvas._tileLoaded) canvas._tileLoaded(null, canvas);
	        };
	        // if network error, fire loaded callback 
	        xhr.onerror = function() {
	            if (canvas._tileLoaded) canvas._tileLoaded(null, canvas);
	        }
	        xhr.send(null);
	    }

	    terrainLayer.redraw = function() {
	        if (terrainLayer.needsRedraw) {
	            terrainLayer.redrawQueue.forEach(function(redraw) { redraw(); });
	        }
	        terrainLayer.needsRedraw = false;
	        L.Util.requestAnimFrame(terrainLayer.redraw);
	    }
	    terrainLayer.redraw();

	    terrainLayer.setOverlayType = function(overlayType) {
	        terrainLayer.options.updateWhenIdle = (!overlayType);
	        //console.log("updateWhenIdle: " + terrainLayer.options.updateWhenIdle);
	        terrainLayer.overlayType = overlayType;
	        terrainLayer.needsRedraw = true;
	    }
	    terrainLayer.setCustomParams = function(customParams) {
	        terrainLayer.customParams = customParams;
	        terrainLayer.needsRedraw = true;
	    }

	    // ----- Terrain data querying ------

	    function convertInt(_int) {
	        return [
	            (0xFFFE0000 & _int) >> 17, // elevation
	            (0x1FC00 & _int) >> 10, // slope
	            (0x1FF & _int) // aspect
	        ];
	    }

	    function latLngToTilePoint(lat, lng, zoom) {
	        lat *= (Math.PI/180);
	        return {
	            x: parseInt(Math.floor( (lng + 180) / 360 * (1<<zoom) )),
	            y: parseInt(Math.floor( (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * (1<<zoom) )),
	            z: zoom
	        }
	    }
	    function tilePointToLatLng(x, y, zoom) {
	        var n = Math.PI-2*Math.PI*y/Math.pow(2,zoom);
	        return {
	            lng: (x/Math.pow(2,zoom)*360-180),
	            lat: (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))))
	        }
	    }

	    terrainLayer.getTerrainData = function(lat, lng, index, original) {
	        // round down lat/lng for fewer lookups
	        // 4 decimal places = 11.132 m percision
	        // https://en.wikipedia.org/wiki/Decimal_degrees
	        // lat = Math.round(lat * 1e4) / 1e4;
	        // lng = Math.round(lng * 1e4) / 1e4;

	        // adjust zoom level for overzoom
	        var zoom = Math.min(terrainLayer.options.maxNativeZoom, terrainLayer._map.getZoom());
	        if (terrainLayer.options.underzoom) { if (parseInt(zoom) == 12) zoom = 11; } // 13
	        // get xyz of clicked tile based on clicked lat/lng
	        var tilePoint = latLngToTilePoint(lat, lng, zoom);
	        // get nw lat/lng of tile
	        var backToLatLng = tilePointToLatLng(tilePoint.x, tilePoint.y, zoom);
	        // get nw container point of tile
	        var nwContainerPoint = terrainLayer._map.latLngToContainerPoint(backToLatLng);
	        // get container point of original lat lng
	        var containerPoint = terrainLayer._map.latLngToContainerPoint(L.latLng(lat,lng));

	        // subtract queried point from nw container point to get point within tile
	        var pointInTile = {
	            x: containerPoint.x - nwContainerPoint.x,
	            y: containerPoint.y - nwContainerPoint.y
	        }
	        // adjust points for overzoom
	        if (terrainLayer._map.getZoom() > terrainLayer.options.maxNativeZoom) {
	            var zoomDifference = terrainLayer._map.getZoom() - terrainLayer.options.maxNativeZoom;
	            var zoomDivide = Math.pow(2, zoomDifference)
	            pointInTile.x = Math.floor(pointInTile.x / zoomDivide);
	            pointInTile.y = Math.floor(pointInTile.y / zoomDivide);
	        }
	        // adjust points for underzoom
	        else if (terrainLayer.options.underzoom && parseInt(terrainLayer._map.getZoom()) == 12) {
	            var zoomDifference = terrainLayer._map.getZoom() - 11;
	            var zoomDivide = Math.pow(2, zoomDifference)
	            pointInTile.x = Math.floor(pointInTile.x / zoomDivide);
	            pointInTile.y = Math.floor(pointInTile.y / zoomDivide);
	            // previous underzoom code
	            // var zoomDifference = 1;
	            // var zoomDivide = Math.pow(2, zoomDifference)
	            // pointInTile.x = Math.floor(pointInTile.x * zoomDivide);
	            // pointInTile.y = Math.floor(pointInTile.y * zoomDivide);
	        }

	        // make sure point is within 256x256 bounds
	        if (pointInTile.x > 255) pointInTile.x = 255;
	        if (pointInTile.y > 255) pointInTile.y = 255;
	        if (pointInTile.x < 0) pointInTile.x = 0;
	        if (pointInTile.y < 0) pointInTile.y = 0;
	        
	        // promise
	        var promise = $q.defer();

	        var tile_id = tilePoint.x + ":" + tilePoint.y + ":" + parseInt(terrainLayer._map.getZoom());
	        var tile = terrainLayer._tiles[tile_id]
	        if (!tile) {
	            //promise.resolve(null);
	            return promise.promise;
	        }

	        var canvas = tile.el;

	        // wait for tile to load
	        canvas._terrainLoaded.promise.then(function() {
	            // make sure terrain is loaded
	            if (!canvas._terrainData) return;

	            // make sure coords are with bounds
	            if (pointInTile.x > 255) pointInTile.x = 255;
	            if (pointInTile.y > 255) pointInTile.y = 255;
	            if (pointInTile.x < 0) pointInTile.x = 0;
	            if (pointInTile.y < 0) pointInTile.y = 0;

	            // convert xy coord to 2d array index
	            var arrayIndex = (pointInTile.y * 256 + pointInTile.x);

	            // get terrain data
	            var _terrainData = convertInt(canvas._terrainData[arrayIndex]);

	            var terrainData = { 
	                lat: lat,
	                lng: lng,

	                index: index,
	                pointInTile: pointInTile,
	                original: original,

	                elevation: _terrainData[0],
	                slope: _terrainData[1],
	                aspect: _terrainData[2]
	            };

	            // if empty values, make null
	            if (terrainData && terrainData.elevation == 127 && terrainData.slope == 127 && terrainData.aspect == 511) {
	                terrainData.elevation = null;
	                terrainData.slope = null;
	                terrainData.aspect = null;
	            }
	            promise.resolve(terrainData);
	        });
	        return promise.promise;
	    }

	    // since 'getTerrainDataBulk' is using terrain tile worker threads, the data 
	    // callback will only return after all tiles have loaded, so we don't have
	    // to worry about checking if terrain tiles have been loaded before querying.
	    terrainLayer.getTerrainDataBulk = function(points, callback) {
	        //console.log("getTerrainDataBulk!");
	        var promises = [];
	        // call 'getTerrainData' for each point
	        for (var i = 0; i < points.length; i++) {
	            var promise = terrainLayer.getTerrainData(points[i].lat, points[i].lng, 
	            i, // index
	            points[i].original // original
	            );
	            promises.push(promise);
	        }
	        // keep track of recieved data in original order
	        var receivedPoints = [];
	        $q.all(promises).then(function(results) {
	            //console.log("everything resolved!");
	            for (var i = 0; i < results.length; i++) {
	                var terrainData = results[i];
	                receivedPoints[terrainData.index] = terrainData;
	            }
	            callback(receivedPoints);
	        });
	    }
	    return terrainLayer;
	};

	module.exports = AvatechTerrainLayer;


/***/ },
/* 16 */
/***/ function(module, exports) {

	angular.module('avatech').controller('MapController', function ($scope, $state, $location, $timeout, Observations, Routes, Global, PublishModal) {
	    $scope.global = Global;

	    mixpanel.track("home");

	    var firstTime = true;

	    $scope.loadMap = false;
	    $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
	        if (toState.name.indexOf("index") === 0 && firstTime) init();
	    });

	    $scope.map;
	    $scope.terrainLayer;
	    $scope.obSearch;

	    $scope.profiles;
	    $scope.detailMode = true;
	    $scope.loadingNew = false;
	    $scope.loadingProfiles = true;

	    $scope.myProfiles = Observations.observations;
	    $scope.myRoutes = Routes.observations;

	    $scope.showPreviewPane = function() { return $state.current.data.showPreviewPane; }
	    $scope.isFullScreen = function() { return $state.current.data.fullScreen; }
	    $scope.showBottomPane = function() { return $state.current.name == "index.route"; }
	    $scope.showRoutePane = function() { return $state.current.name == "index.route"; }

	    $scope.hoverProfile = function(id) { $scope.hoverOb = id; }

	    // which list to show in side bar
	    $scope.selectedTab = 'obs';
	    $scope.selectTab = function(tabName, $event) {
	        $event.preventDefault();
	        $event.stopPropagation();
	        $scope.selectedTab = tabName;
	        
	        // reset scrollbars (todo: hacky! but only way for now)
	        $timeout(function(){ $(".nano").nanoScroller(); });
	        return false;
	    }

	    $scope.selectedList = 'published';
	    $scope.selectList = function(listName, $event) {
	        $event.preventDefault();
	        $event.stopPropagation();
	        $scope.selectedList = listName;

	        // clear selected profiles
	        $scope.selectedProfiles = [];

	        // reset scrollbars (todo: hacky! but only way for now)
	        $timeout(function(){ $(".nano").nanoScroller(); });
	        return false;
	    }

	    // filters for my observations (published / unpublished)

	    $scope.my_unpublished = function(profile) {
	        if (!$scope.obSearch) return false;

	        var ok = (profile.published === false && profile.user._id == $scope.global.user._id);

	        if ($scope.obSearch.search_type(profile) === false) ok = false;
	        if ($scope.obSearch.search_text(profile) === false) ok = false;
	        if ($scope.obSearch.search_elevation(profile) === false) ok = false;
	        if ($scope.obSearch.search_aspect(profile) === false) ok = false;
	        if ($scope.obSearch.search_slope(profile) === false) ok = false;

	        return ok;
	    }
	    $scope.my_published = function(profile) {
	        if (!$scope.obSearch) return false;

	        var ok = (profile.published === true && profile.user._id == $scope.global.user._id);

	        if ($scope.obSearch.search_type(profile) === false) ok = false;
	        if ($scope.obSearch.search_text(profile) === false) ok = false;
	        if ($scope.obSearch.search_elevation(profile) === false) ok = false;
	        if ($scope.obSearch.search_aspect(profile) === false) ok = false;
	        if ($scope.obSearch.search_slope(profile) === false) ok = false;

	        return ok;
	    }

	    // DRAFTS

	    $scope.selectedProfiles = [];
	    $scope.selectProfile = function(profile) {
	        var index = $scope.getProfileSelectedIndex(profile);
	        if (index > -1) {
	            $scope.selectedProfiles.splice(index, 1);
	            return false;
	        }
	        $scope.selectedProfiles.push(profile);
	        return false;
	    }
	    $scope.getProfileSelectedIndex = function(profile) {
	        for (var i = 0; i < $scope.selectedProfiles.length; i++) {
	            if ($scope.selectedProfiles[i]._id == profile._id) { return i; break; }
	        }
	        return -1;
	    }
	    $scope.isProfileSelected = function(profile) {
	        return ($scope.getProfileSelectedIndex(profile) != -1);
	    }

	    $scope.publishProfiles = function() {
	        PublishModal.open({ initialSharing: null })
	        .then(function (sharing) {
	            // update profiles with new sharing settings
	            angular.forEach($scope.selectedProfiles, function(profile) {
	                angular.extend(profile, sharing);
	                Observations.save(profile);
	            });
	            // clear selected profiles
	            $scope.selectedProfiles = [];
	        });
	    }

	    $scope.$on('goToUnpublished', function() { 
	        $scope.selectedTab = 'obs';
	        $scope.selectedList = 'my_unpublished';
	    });

	    function init() {
	        firstTime = false;

	        // when an observation preview is loaded, go to location on map
	        $scope.$on('observationLoaded', function(e, ob) {
	            if (!ob || !ob.location) return;
	            $timeout(function() {
	                var point = new L.LatLng(ob.location[1], ob.location[0]);
	                // close any open popups
	                var closebtn = $(".leaflet-popup-close-button");
	                if (closebtn.length) closebtn[0].click();

	                // if location is outside current map, pan to location
	                if ($scope.map && !$scope.map.getBounds().contains(point)) {
	                    $scope.map.setView(point, 13, { animate: false });
	                }
	            });
	        });

	        $scope.loadMap = true;
	    }
	});

/***/ },
/* 17 */
/***/ function(module, exports) {

	angular.module('avatech').directive('obSearch', function($timeout, $q, $rootScope, $templateRequest, $compile, snowpitExport, snowpitConstants, Global, mapLayers, Restangular, ObSearch) {
	  return {
	    restrict: 'A',
	    templateUrl: "/modules/map/ob-search.html",
	    scope: { 
	        obSearch: '=obSearch',
	        showPublisher: '=showPublisher',
	        orgs: '=orgs'
	    },
	    link: function(scope, element) {
			scope.obSearch = new ObSearch();

		    // formatters

		    scope.formatElev = function(val) {
		        if (!Global.user.settings) return;
		        // meters
		        if (Global.user.settings.elevation == 0)
		            return val + " m";
		        // feet
		        else {
		            return Math.round(val * 3.28084).toFixed(0) + " ft";
		        }
		    }
		    scope.formatTempRange = function(val1,val2) {
		        if (!Global.user.settings) return;
		        // meters
		        if (Global.user.settings.elevation == 0)
		            return val1 + "-" + val2 + " m";
		        // feet
		        else {
		            return Math.round(val1 * 3.28084).toFixed(0) + "-" + Math.round(val2 * 3.28084).toFixed(0) + " ft";
		        }
		    }
		    scope.formatDegSlider = function(val) {
		        return val + "°"
		    }

	    }
	}
	});

	angular.module('avatech').factory('ObSearch', function (Global) { 

		return function() {

			// defaults

			this.elevationMax = Global.user.settings.elevation == 0 ? 8850 : 8850;

			var defaultPublisher = { orgs: null, outsideOrgs: true, me: true, rec: true };
		    this.searchQuery = {
		        days: 7,

		        elev_low: 0,
		        elev_high: this.elevationMax,

		        aspect_low: 0,
		        aspect_high: 359,

		        slope_low: 0,
		        slope_high: 70,

		        text: '',

		        type: {},

		        publisher: angular.copy(defaultPublisher)
		    }

		    this.observationTypes = [
		        "avalanche",
		        "weather",
		        "wind",
		        "snowpack",
		        "snowpack-test",
		        "snowpit",
		        "sp-profile",
		    ];

		    this.search_text = function(val) {
		        var needle = this.searchQuery.text.toLowerCase();
		        if (needle.length < 3) return true;

		        // build haystack
		        var haystack = [];

		        if (val.user.fullName) haystack.push(val.user.fullName.toLowerCase());
		        if (val.metaData && val.metaData.location) haystack.push(val.metaData.location.toLowerCase());
		        if (val.organization) haystack.push(val.organization.name.toLowerCase());

		        // search through haystack
		        for (var i = 0; i < haystack.length; i++) {
		            if (haystack[i].length == 0) continue;
		            if (haystack[i].indexOf(needle) != -1) return true;
		        }
		        return false;
		    }

		   this.publisher_isOutsideOrg = function(orgId) {
		        for (var i = 0; i < Global.orgs.length; i++) {
		            if (Global.orgs[i]._id == orgId) return false;
		        }
		        return true;
		    }

		    this.search_publisher = function(val) {
		    	var self = this;
		        var allowed = false;  

		        // my orgs
		        if (self.searchQuery.publisher.orgs) {
		            // if no organization specified, return null
		            if (!val.organization) allowed = false;

		            if (val.organization 
		                && !self.publisher_isOutsideOrg(val.organization._id)
		                && self.searchQuery.publisher.orgs.indexOf(val.organization._id) != -1) allowed = true;
		        } 
		        else if (!self.searchQuery.publisher.orgs) allowed = true;

		        // outside orgs
		        if (!val.organization || (val.organization && self.publisher_isOutsideOrg(val.organization._id))) {
		            allowed = self.searchQuery.publisher.outsideOrgs;
		        }

		        // rec users
		        //console.log("userType: " + val.user.userType);
		        if (val.user && ((val.user.userType && val.user.userType.indexOf("pro") == -1) || !val.user.userType)) {
		        //if (val.user && val.user.student) {
		            if (allowed === false && self.searchQuery.publisher.rec) allowed = true;
		            else if (allowed === true && !self.searchQuery.publisher.rec) allowed = false;
		        }

		        // me
		        if (self.searchQuery.publisher.me == null) self.searchQuery.publisher.me = true;
		        if (self.searchQuery.publisher.me != null) {
		            if (val.user._id == Global.user._id) {
		                if (allowed === false && self.searchQuery.publisher.me) allowed = true;
		                else if (allowed === true && !self.searchQuery.publisher.me) allowed = false;
		            }
		        }  

		        return allowed;
		    }

		    this.search_type = function(val) { 
		        return (this.searchQuery.type[val.type]);
		    }

		    this.search_date = function(val) { 
		        var d = new Date();
		        // hack for 'today' (since midnight)
		        if (this.searchQuery.days == 0) {
		        	// set to midnight
		        	d.setHours(0,0,0,0);
		        }
		        else {
			        d.setDate(d.getDate() - this.searchQuery.days);
			    }

		        if (new Date(val.date) > d) return true;
		        else return false;
		    }

		    this.search_elevation = function(val) { 
		        // if full range is selected, return everything (including profiles without elevation specified)
		        if (this.searchQuery.elev_low == 0 && this.searchQuery.elev_high == this.elevationMax) {
		            return true;
		        }
		        else if ((val.metaData && val.metaData.elevation) || val.elevation) {
		            var elevation;
		            if (val.metaData && val.metaData.elevation) elevation = val.metaData.elevation;
		            else elevation = val.elevation;

		            if (elevation >= this.searchQuery.elev_low &&
		                elevation <= this.searchQuery.elev_high ) return true;
		            else return false;
		        }
		        else return false;
		    }
		    this.search_aspect = function(val) { 
		        // if full range is selected, return everything (including profiles without aspect specified)
		        if (this.searchQuery.aspect_low == 0 && this.searchQuery.aspect_high == 359) {
		            return true;
		        }
		        else if ((val.metaData && val.metaData.aspect) || val.aspect) {
		            var aspect;
		            if (val.metaData && val.metaData.aspect) aspect = val.metaData.aspect;
		            else aspect = val.aspect;
		            
		            if (this.searchQuery.aspect_low > this.searchQuery.aspect_high) {
		                if (aspect >= this.searchQuery.aspect_low ||
		                    aspect <= this.searchQuery.aspect_high ) return true;
		            }
		            else if (aspect >= this.searchQuery.aspect_low &&
		                    aspect <= this.searchQuery.aspect_high ) return true;
		            
		            return false;
		        }
		        else return false;
		    }
		    this.search_slope = function(val) { 
		        // if full range is selected, return everything (including profiles without slope specified)
		        if (this.searchQuery.slope_low == 0 && this.searchQuery.slope_high == 70) {
		            return true;
		        }
		        else if ((val.metaData && val.metaData.slope) || val.slope) {
		            var slope;
		            if (val.metaData && val.metaData.slope) slope = val.metaData.slope;
		            else slope = val.slope;

		            if (slope >= this.searchQuery.slope_low &&
		                slope <= this.searchQuery.slope_high ) return true;
		            else return false;
		        }
		        else return false;
		    }

			this.doSearch = function(profile) {
				var self = this;
		        var ok = true;

		        // only search through published profiles 
		        if (!profile.published) return false;

		        if (self.search_type(profile) === false) ok = false;
		        if (self.search_date(profile) === false) ok = false;
		        if (self.search_text(profile) === false) ok = false;
		        if (self.search_publisher(profile) === false) ok = false;
		        if (self.search_elevation(profile) === false) ok = false;
		        if (self.search_aspect(profile) === false) ok = false;
		        if (self.search_slope(profile) === false) ok = false;

		        return ok;
		    }
		    this.publisher_isOrgSelected = function(orgId) {
		        if (!this.searchQuery.publisher.orgs) return true;
		        else return (this.searchQuery.publisher.orgs.indexOf(orgId) != -1);
		    }
		    this.publisher_selectOrg = function(orgId) {
		    	var self = this;
		        // if empty, add all orgs
		        if (!this.searchQuery.publisher.orgs) {
		            this.searchQuery.publisher.orgs = [];
		            angular.forEach(Global.orgs,function(org) { 
		            	self.searchQuery.publisher.orgs.push(org._id) 
		            });
		        }

		        // if not in array, add
		        if (this.searchQuery.publisher.orgs.indexOf(orgId) == -1)
		            this.searchQuery.publisher.orgs.push(orgId);
		        // if already in array, remove
		        else {
		            for (var i = 0; i < this.searchQuery.publisher.orgs.length; i++) {
		                if (this.searchQuery.publisher.orgs[i] == orgId) { 
		                    this.searchQuery.publisher.orgs.splice(i, 1); break;
		                }
		            }
		        }
		    }
		    this.publisher_selectMyOrgs = function() {
		    	var self = this;
		        // if all orgs selected, select none
		        if (this.searchQuery.publisher.orgs == null 
		            || (this.searchQuery.publisher.orgs && this.searchQuery.publisher.orgs.length == Global.orgs.length)) {

		            this.searchQuery.publisher.orgs = [];
		        }
		        // if none selected, add all orgs
		        else {
		            this.searchQuery.publisher.orgs = [];
		            angular.forEach(Global.orgs, function(org) { 
		            	self.searchQuery.publisher.orgs.push(org._id) 
		            });
		        }
		    }
		    this.publisher_selectOutsideOrgs = function() {
		        if (this.searchQuery.publisher.outsideOrgs != null) this.searchQuery.publisher.outsideOrgs = !this.searchQuery.publisher.outsideOrgs;
		        else this.searchQuery.publisher.outsideOrgs = false;
		    }

		    this.publisher_selectMe = function() {
		        if (this.searchQuery.publisher.me != null) this.searchQuery.publisher.me = !this.searchQuery.publisher.me;
		        else this.searchQuery.publisher.me = false;
		    }

		    this.publisher_selectRec = function() {
		        if (this.searchQuery.publisher.rec != null) this.searchQuery.publisher.rec = !this.searchQuery.publisher.rec;
		        else this.searchQuery.publisher.rec = false;
		    }

		    this.type_select = function(type) {
		        this.searchQuery.type[type] = !this.searchQuery.type[type];
		    }
		    this.clearSearchElevation = function($event) {
		        $event.preventDefault();
		        this.searchQuery.elev_low = 0; 
		        this.searchQuery.elev_high = 9000;
		        return false;
		    }
		    this.clearSearchAspect = function($event) {
		        $event.preventDefault();
		        this.searchQuery.aspect_low = 0;
		        this.searchQuery.aspect_high = 359;
		        return false;
		    }
		    this.clearSearchSlope = function($event) {
		        $event.preventDefault();
		        this.searchQuery.slope_low = 0;
		        this.searchQuery.slope_high = 70;
		        return false;
		    }

	        this.isDefaultPublisher = function() {
		        if (!this.searchQuery) return false;

		        var publisher = this.searchQuery.publisher;
		        if (
		            (publisher.orgs == null || publisher.orgs.length == Global.orgs.length) &&
		            (publisher.outsideOrgs == true) &&
		            (publisher.me == true) &&
		            (publisher.rec == true)
		            )
		            return true;
		        else return false;
		    }
		    this.setDefaultPublisher = function() {
		        this.searchQuery.publisher = angular.copy(defaultPublisher);
		    }

		    this.isDefaultType = function() {
		    	var trueCount = 0;
		    	angular.forEach(this.searchQuery.type, function(obType) { 
		    		if (obType) trueCount++;
		    	});
		    	return trueCount == Object.keys(this.observationTypes).length;
		    }
		    this.setDefaultType = function() {
			    var self = this;
			    angular.forEach(this.observationTypes, function(obType) {
			    	self.searchQuery.type[obType] = true;
			    });
		    }
		    // add all observation types to query as default
		    this.setDefaultType();

		}
	});

/***/ },
/* 18 */
/***/ function(module, exports) {

	angular.module('avatech').directive('roseGraph', function($timeout) {
	  return {
	    restrict: 'A',
	    scope: false,
	    link: function(scope, element, attrs) {
	        attrs.$observe('legend', function(value) {
	            scope.colorMap = getColorMap(JSON.parse(value));
	            render();
	        });

	        function blendRGBColors(c0, c1, p) {
	            return [Math.round(Math.round(c1[0] - c0[0]) * (p / 100)) + c0[0],
	                    Math.round(Math.round(c1[1] - c0[1]) * (p / 100)) + c0[1],
	                    Math.round(Math.round(c1[2] - c0[2]) * (p / 100)) + c0[2]
	                ];
	        }
	        function blendHexColors(c0, c1, p) {
	            c0 = hexToRGB(c0);
	            c1 = hexToRGB(c1);
	            return blendRGBColors(c0, c1, p);
	        }
	        function hexToRGB(hex) {
	            return [
	                parseInt(hex.substring(0,2),16),
	                parseInt(hex.substring(2,4),16),
	                parseInt(hex.substring(4,6),16)
	            ];
	        }

	        function getPercent(min, max, val) {
	            return Math.floor(((val - min) * 100) / (max - min));
	        }

	        function getColorMap(steps){
	            var colorMap = [];

	            for (var s = 0; s < steps.length; s++) {
	                if (s == steps.length - 1) break;
	                var min = steps[s].val;
	                var max = steps[s+1].val;

	                var minColor = steps[s].color;
	                var maxColor = steps[s+1].color;

	                for (var i = min; i <= max; i++)
	                    colorMap[i] = blendHexColors(minColor,maxColor, getPercent(min, max, i));
	            }
	            return colorMap;
	        }



	        var timer;
	        scope.$watch('points', function() {
	            if (timer) $timeout.cancel(timer);
	            timer = $timeout(render, 100);
	        });

	        var canvas = element[0];
	        var context = canvas.getContext('2d');

	        // scale for retina
	        if (window.devicePixelRatio > 1) {
	            context.scale(window.devicePixelRatio, window.devicePixelRatio);
	            canvas.height *= window.devicePixelRatio;
	            canvas.width *= window.devicePixelRatio;
	        }

	        var graphHeight = canvas.height;
	        var graphWidth = canvas.width;

	        function render() {
	            // convert string to JSON
	            // var points = [];
	            // if (scope.points != "") points = JSON.parse(scope.points);

	            // clear canvas
	            context.clearRect(0, 0, canvas.width, canvas.height);

	            var radius = graphWidth / 2;
	            var padding = 3 * window.devicePixelRatio;
	            var length = radius - padding;

	            // draw colors

	            context.lineWidth = 3;

	            for (var i = 0; i <= 360; i++) {
	                context.strokeStyle = "rgb(" + scope.colorMap[i].join() + ")";

	                var angle = (i - 90) * (Math.PI/180);
	                context.beginPath();
	                context.moveTo(radius, radius);
	                context.lineTo(radius + length * Math.cos(angle), radius + length * Math.sin(angle));
	                context.stroke();
	            }

	            // draw pie

	            context.lineWidth = 2 * window.devicePixelRatio;
	            context.strokeStyle = "#000";
	            context.beginPath();
	            context.arc(radius, radius, length, 0, 2 * Math.PI);
	            context.stroke();

	            // draw aspect direction lines

	            for (var i = 1; i <= 8; i++) {
	                var angle = (67.5 + (45 * i)) * (Math.PI/180);
	                context.moveTo(radius, radius);
	                context.lineTo(radius + length * Math.cos(angle), radius + length * Math.sin(angle));
	            }
	            context.stroke();

	            // draw direction labels

	            var labelLength = radius - (28 * window.devicePixelRatio);

	            // context.shadowColor = "#fff";
	            // context.shadowOffsetX = 0; 
	            // context.shadowOffsetY = 0; 
	            // context.shadowBlur = .1;
	            context.fillStyle = "black";

	            var fontSize = 16 * window.devicePixelRatio;
	            context.font = fontSize + "px sans-serif";
	            var angles = [ 'N', 'E', 'S', 'W']
	            for (var i = 0; i < 4; i++) {
	                var angle = ((90 * i) - 90) * (Math.PI/180);
	                var label = angles[i];

	                var x = radius + labelLength * Math.cos(angle);
	                var y = radius + labelLength * Math.sin(angle);

	                var measured = context.measureText(label);

	                if (label == "N") {
	                    x -= measured.width / 2;
	                    y -= fontSize / 4;
	                }
	                else if (label == "S") {
	                    x -= measured.width / 2;
	                    y += fontSize;
	                }
	                else if (label == "W") {
	                    x -= measured.width;
	                    y += fontSize / 2.5;
	                }
	                else if (label == "E") {
	                    x += measured.width / 6;
	                    y += fontSize / 2.5;
	                }
	                context.fillText(label, x, y);
	            }
	        }
	    }
	  };
	});

/***/ },
/* 19 */
/***/ function(module, exports) {

	angular.module('avatech').controller('RoutePlanningController', function($http, $q, $log, $location, $state, $scope, $stateParams, $rootScope, $timeout, $filter, Global, Routes, snowpitExport, Confirm) {

	    $scope.global = Global;

	    $scope.formatters = formatters = snowpitExport.formatters;
	    $scope.loading = true;

	    // this ui-router scope inherits parent map scope
	    $scope.map;
	    $scope.terrainLayer;

	    $scope.route = {
	        _id: null,
	        name: "Route Name",
	        markers: [],
	        stats: {},
	        points: []
	    };

	    $scope.routeControl = {
	        editing: true,
	        autoWaypoint: false
	    }

	    $scope.close = function () {
	        $rootScope.$broadcast('resizeMap');
	        $state.go('^');
	    };
	    $scope.delete = function() {
	        Confirm.open("Are you sure you want to delete this route?").then(function() {
	            Routes.remove($scope.route);
	            $scope.close();
	        });
	    }

	    $scope._hoverOnLeg = function(index) {
	        $scope.hoverOnLeg = index;
	    }
	    $scope._hoverOnPoint = function(index) {
	        $scope.hoverOnPoint = index;
	    }

	    $scope.munterRate = {
	        up: 4,
	        down: 10
	    }

	    var _line;
	    // $scope.$watchCollection('_line.editing._markers',function(){
	    //     $log.debug("markers editing!!!!!!!!")
	    //     if (_line && _line.editing && _line.editing._markers)
	    //         $scope.route.markers = _line.editing._markers;
	    // });

	    // wait for map to be ready
	    var mapWatcher = $scope.$watch('map', function(){
	        if ($scope.map) {
	            // unregister watch
	            mapWatcher();
	            // go
	            ready();
	        }
	    });

	    function ready() {
	        //$scope.map = $rootScope.map;
	        // load if routeId specified
	        if ($stateParams.routeId && $stateParams.routeId != "new") {
	            $http.get(window.apiBaseUrl + "routes/" + $stateParams.routeId)
	            .then(function(res) {
	                var route = res.data;

	                $scope.route._id = route._id;
	                $scope.route.name = route.name;

	                // set map to fit route bounds
	                var bounds = turf.extent(route.path);
	                $scope.map.fitBounds([
	                    [bounds[1], bounds[0]],
	                    [bounds[3], bounds[2]]
	                ], { maxZoom: 14, animate: false });

	                // wait a bit for map to move. using a timeout here instead of:
	                // $scope.map.on('moveend', function() { ... })
	                // since it's just a percaution and 'moveend' can be unpredictabile
	                $timeout(function(){
	                    // create editable path
	                    createLine();
	                    // add markers
	                    for (var i = 0; i < route.points.length; i++) {
	                        var point = route.points[i];
	                        var marker = addPoint({ lat: point.coords[1], lng: point.coords[0] });
	                        // if waypoint
	                        if (point.waypoint) makeWaypoint(marker, point.waypoint);
	                    }
	                    // disable editing until terrain is loaded
	                    editingOff();
	                    // load terrain
	                    processUpdate(function() {
	                        // elevation profile has been loaded
	                        $log.debug("elevation profile has been loaded!");
	                        // note: this will still get called even if no terrain is present
	                        editingOn();
	                        $scope.loading = false;
	                        $scope.$apply();
	                    });
	                }, 200);
	            });
	            // todo: handle 404?
	        }
	        // if new
	        else if ($stateParams.routeId == "new") {
	            $scope.loading = false;
	        }

	        // remove map path and elevation widget when current state is destroyed
	        $scope.$on('$destroy', function() {
	            $scope.map.off('click', mapClick);
	            if (elevationWidget) {
	                elevationWidget.clear();
	                elevationWidget = null;
	            }
	            if (lineGroup) lineGroup.removeFrom($scope.map);
	            if (lineSegmentGroup) lineSegmentGroup.removeFrom($scope.map);
	            _line = null;
	            editHandler = null;
	        });

	        // save when route is edited
	        var routeSaveTimer;
	        $scope.$watch('route', function() {
	            //$log.debug('saving route!')
	            if (!_line || !_line.editing || (_line.editing._markers && _line.editing._markers.length < 2)) return;

	            if (routeSaveTimer) $timeout.cancel(routeSaveTimer);
	            routeSaveTimer = $timeout(function() {

	                $log.debug("saving!!");

	                var _route = {
	                    name: $scope.route.name,
	                    points: [],
	                    terrain: [],
	                    stats: $scope.route.stats,
	                    // GeoJSON
	                    path: {
	                        type: "LineString",
	                        coordinates: []
	                    }
	                };

	                // save elevation profile
	                // angular.forEach(elevationProfilePoints, function(point) {
	                //    _route.terrain.push({
	                //         coords: [ point.lng, point.lat ],
	                //         original: point.original,
	                //         aspect: point.aspect,
	                //         slope: point.slope,
	                //         elevation: point.elevation,
	                //         totalTimeEstimateMinutes: point.totalTimeEstimateMinutes,
	                //         totalDistance: point.totalDistance,
	                //         originalIndex: point.originalIndex,
	                //         index: point.index,
	                //    });
	                // });

	                angular.forEach(_line.editing._markers, function(marker) {
	                    _route.path.coordinates.push([ marker._latlng.lng, marker._latlng.lat ]);

	                    _route.points.push({ 
	                        coords: [ marker._latlng.lng, marker._latlng.lat ],
	                        waypoint: marker.waypoint
	                    });
	                });

	                if (!$scope.route._id) {
	                    $http.post(window.apiBaseUrl + "routes", _route)
	                    .then(function(res) {
	                        if (res.data._id) {
	                            $scope.route._id = res.data._id;
	                            $scope.imageURL = res.data.imageURL;

	                            // add to routes datastore
	                            _route._id = $scope.route._id;
	                            Routes.add(_route);

	                            // replace URL with recieved _id
	                            $state.params.routeId = $scope.route._id;
	                            $state.transitionTo($state.current, $state.params, { inherit: true, notify: true });
	                        }
	                    });
	                }
	                else {
	                     $http.put(window.apiBaseUrl + "routes/" + $scope.route._id, _route)
	                    .then(function(data) {
	                        // add to routes datastore
	                        _route._id = $scope.route._id;
	                        _route.updated = new Date();
	                        Routes.add(_route);
	                    });
	                }

	            }, 1000);

	        }, true);

	        // $scope.saveRoute = function() {
	        //     if (!_line || !_line.editing || (_line.editing._markers && _line.editing._markers.length < 2)) return;

	        //     if (routeSaveTimer) $timeout.cancel(routeSaveTimer);
	        //     routeSaveTimer = $timeout(function() {

	        //         $log.debug("saving!!");

	        //         var _route = {
	        //             name: $scope.route.name,
	        //             points: [],
	        //             terrain: [],
	        //             stats: $scope.route.stats,
	        //             // GeoJSON
	        //             path: {
	        //                 type: "LineString",
	        //                 coordinates: []
	        //             }
	        //         };

	        //         // save elevation profile
	        //         // angular.forEach(elevationProfilePoints, function(point) {
	        //         //    _route.terrain.push({
	        //         //         coords: [ point.lng, point.lat ],
	        //         //         original: point.original,
	        //         //         aspect: point.aspect,
	        //         //         slope: point.slope,
	        //         //         elevation: point.elevation,
	        //         //         totalTimeEstimateMinutes: point.totalTimeEstimateMinutes,
	        //         //         totalDistance: point.totalDistance,
	        //         //         originalIndex: point.originalIndex,
	        //         //         index: point.index,
	        //         //    });
	        //         // });

	        //         angular.forEach(_line.editing._markers, function(marker) {
	        //             _route.path.coordinates.push([ marker._latlng.lng, marker._latlng.lat ]);

	        //             _route.points.push({ 
	        //                 coords: [ marker._latlng.lng, marker._latlng.lat ],
	        //                 waypoint: marker.waypoint
	        //             });
	        //         });

	        //         if (!$scope.route._id) {
	        //             $http.post(window.apiBaseUrl + "routes", _route)
	        //             .then(function(res) {
	        //                 if (res.data._id) {
	        //                     $scope.route._id = res.data._id;
	        //                     $scope.imageURL = res.data.imageURL;

	        //                     // add to routes datastore
	        //                     Routes.add($scope.route);

	        //                     // replace URL with recieved _id
	        //                     $state.params.routeId = $scope.route._id;
	        //                     $state.transitionTo($state.current, $state.params, { inherit: true, notify: true });
	        //                 }
	        //             });
	        //         }
	        //         else {
	        //              $http.put(window.apiBaseUrl + "routes/" + $scope.route._id, _route)
	        //             .then(function(data) {

	        //             });
	        //         }
	        //     }, 1000);
	        // }

	        // hide icons when not in edit mode
	        $scope.$watch("routeControl.editing", function() {
	            if (!_line) return;

	            // prevent editing above below zoom level 13
	            if ($scope.routeControl.editing && $scope.map.getZoom() < 13) {
	                $scope.routeControl.editing = false;
	                alert("Please zoom in to edit your route.")
	            }

	            if ($scope.routeControl.editing) editingOn();
	            else editingOff();
	        }, true);

	        function editingOn() {
	            // show all points
	            $(".leaflet-editing-icon").not(".waypoint-icon").not(".end-icon").removeClass("_hide");
	            // enable point dragging
	            angular.forEach(_line.editing._markers, function(marker) {
	                marker.dragging.enable();
	            });
	        }
	        function editingOff() {
	            // close popups
	            setTimeout(function() {
	                var popups = $(".leaflet-popup-close-button");
	                angular.forEach(popups, function(popup) { popup.click(); });
	            });
	            // hide all points that aren't waypoints
	            $(".leaflet-editing-icon").not(".waypoint-icon").not(".end-icon").addClass("_hide");

	            angular.forEach(_line.editing._markers, function(marker) {
	                // disable point dragging
	                marker.dragging.disable();
	                // convert end point into a waypoint (if it isn't already)
	                if (marker._index == _line.editing._markers.length - 1 && !marker.waypoint) {
	                    makeWaypoint(marker);
	                    updateSegments();
	                    saveLinePoints();
	                }
	            });
	        }

	        $scope.route.waypointPrefix = function() {
	            if (!$scope.route.name || $scope.route.name.length == 0) return "W";
	            else return $scope.route.name[0];
	        };

	        $scope.routeControl.downloadGPX = function() {
	            downloadGPX();
	        };
	        $scope.getDeclination = function() {
	            var center = $scope.map.getCenter();
	            var currentYear = new Date().getFullYear() + ((new Date().getMonth() + 1) / 12.0);  
	            var declination = new WorldMagneticModel().declination(0, center.lat, center.lng, currentYear);
	            return declination;
	        },
	        $scope.getGridNorth = function() {
	            var center = $scope.map.getCenter();
	            // get utm at center
	            var utm_center = LatLonToUTMXY(DegToRad(center.lat), DegToRad(center.lng));
	            var utm_top = LatLonToUTMXY(DegToRad($scope.map.getBounds()._northEast.lat), DegToRad(center.lng));
	            // get easting at center
	            var e = utm_center.x;
	            // get lat lng of easting at top of map
	            var top = UTMXYToLatLon(e, utm_top.y, utm_center.zone, center.lat < 0);
	            // get bearing between center point and top point
	            var bearing = turf.bearing(
	                turf.point([ center.lng, center.lat ]),
	                turf.point([ RadToDeg(top.lng), RadToDeg(top.lat) ])
	            );
	            return bearing;
	        },
	        $scope.getPixelsPerScreenInch = function() {
	            var dpi = document.createElement("div");
	            dpi.setAttribute("style","height: 1in; width: 1in; left: 100%; position: fixed; top: 100%;pointer-events:none;opacity:0;");
	            document.body.appendChild(dpi);
	            var dpi_x = dpi.offsetWidth;
	            document.body.removeChild(dpi);
	            dpi = null;
	            return dpi_x;
	        }
	        $scope.getMetersPerPixel = function() {
	           return (156543.03392 * Math.cos($scope.map.getCenter().lat * Math.PI / 180) / Math.pow(2, $scope.map.getZoom()));
	        }   
	        $scope.routeControl.downloadPDF = function() {
	            var pdfRows = [];

	            // PDF columns
	            var columns = [   
	                { text: '', style: 'tableHeader', width: 24 },
	                { text: 'Name', style: 'tableHeader', width: '*' },
	                { text: 'UTM', style: 'tableHeader', width: 49 },
	                { text: 'Distance', style: 'tableHeader', width: 44 },
	                { text: 'Elevation', style: 'tableHeader', width: 44 },
	                { text: 'Net Elevation', style: 'tableHeader', width: 40 },
	                { text: 'Bearing', style: 'tableHeader', width: 43 },
	                { text: 'Time', style: 'tableHeader', width: 55 },
	                { text: 'Running Time', style: 'tableHeader', width: 55 }
	            ];
	            pdfRows.push(columns);
	            // set colummn widths
	            var columnWidths = [];
	            for (var i = 0; i < columns.length; i++) { columnWidths.push(columns[i].width); }

	            // add rows
	            angular.forEach($scope.route.points,function(point, index) {
	                var nextPoint = index != $scope.route.points.length - 1 ? $scope.route.points[index + 1] : null;
	                pdfRows.push([ 
	                    $scope.route.waypointPrefix() + (index + 1), 
	                    point.waypoint ? point.waypoint.name : "",
	                    { text: formatters.formatLatLngAsUTM({ lat: point.lat, lng: point.lng }), alignment: 'right' },
	                    { text: nextPoint && nextPoint.leg ? formatters.formatKmOrMiles(nextPoint.leg.distance) : "", alignment: 'right' },
	                    { text: point.terrain ? formatters.formatElevation(point.terrain.elevation) : "", alignment: 'right' },
	                    { text:nextPoint &&  nextPoint.leg ? ((nextPoint.leg.elevationChange > 0 ? '+':'') + " " + formatters.formatElevation(nextPoint.leg.elevationChange)) : "", alignment: 'right' },
	                    nextPoint && nextPoint.leg ? formatters.formatDirection(nextPoint.leg.bearing) : "",
	                    nextPoint && nextPoint.leg ? formatters.formatDuration(nextPoint.leg.timeEstimateMinutes) : "",
	                    nextPoint && nextPoint.terrain ? formatters.formatDuration(nextPoint.terrain.totalTimeEstimateMinutes) : ""
	                ]);
	            });

	            // pdf layout
	            var docDefinition = {
	                pageSize: 'letter',
	                content: [
	                    { text: $scope.route.name, style: 'subheader' },
	                    {
	                        style: 'tableExample',
	                        table: {
	                            headerRows: 1,
	                            widths: columnWidths,
	                            body: pdfRows
	                        },
	                        layout: {
	                            hLineWidth: function() { return .5 },
	                            vLineWidth: function() { return .5 }
	                        }
	                    }
	                ],
	                styles: {
	                    header: {
	                        fontSize: 18,
	                        bold: true,
	                        margin: [0, 0, 0, 10]
	                    },
	                    subheader: {
	                        fontSize: 16,
	                        bold: true,
	                        margin: [0, 10, 0, 5]
	                    },
	                    tableExample: {
	                        fontSize: 9,
	                        margin: [0, 5, 0, 15]
	                    },
	                    tableHeader: {
	                        bold: true,
	                        fontSize: 9,
	                        color: 'black'
	                    }
	                },
	                defaultStyle: {
	                    // alignment: 'justify'
	                }
	                
	            }

	            // draw declination arrow legend
	            //var declination = $scope.getDeclination();
	            //var mils = Math.round(declination * 17.777777777778);
	            //var gridNoth = $scope.getGridNorth();
	            var arrow_canvas = DrawDeclinationCanvas(
	                $scope.getDeclination(),
	                $scope.getGridNorth()
	            );

	            function formatMeters(meters) {
	                if (meters >= 1000) {
	                    var km = parseInt(meters) / 1000;
	                    if (km % 1 != 0) return $filter('number')(km, 1)+ " km";
	                    else return $filter('number')(km, 0)+ " km";
	                }
	                else return $filter('number')(meters, 0) + " m";
	            }
	            function formatFeet(feet) {
	                if (feet >= 5280) {
	                    var miles = parseInt(feet) / 5280;
	                    if (miles % 1 != 0) return $filter('number')(miles, 1) + " mi";
	                    else return $filter('number')(miles, 0) + " mi";
	                }
	                else return $filter('number')(feet, 0) + " ft";
	            }

	            // // calculate map scale variables
	            // var metersPerPixel = $scope.getMetersPerPixel();
	            // var inchesPerMeter = 39.3701;
	            // // var pixelsPerMeter = metersPerPixel * 
	            // // $log.debug("pixelsPerMeter: " + pixelsPerMeter);
	            // var mapScale = Math.round(inchesPerMeter * metersPerPixel * $scope.getPixelsPerScreenInch());
	            // var feetPerInch = Math.round(mapScale / 12.0);
	            // var pixelsPerCm = $scope.getPixelsPerScreenInch() / 2.54;
	            // var metersPerCm = Math.round(metersPerPixel * pixelsPerCm);
	            // // todo: when above 1 mile or 1 km, show in mile and km
	            // // $log.debug("MAP SCALE: 1:" + mapScale)
	            // $log.debug("metersPerPixel: " + metersPerPixel)
	            // // $log.debug("metersPerCm: " + metersPerCm)

	            // // draw map scale
	            // var scale_canvas = DrawScaleCanvas(metersPerPixel);

	            // // convert elevation profile SVG to canvas

	            // var svg = $(".elevation-widget svg")[0];
	            // var width = parseInt(svg.getAttribute('width') * 2);
	            // var height = parseInt(svg.getAttribute('height') * 2);

	            // // svg styles
	            // var SVGstyles = "<defs><style type='text/css'>";
	            // SVGstyles += ".axis line, .axis path { fill: none; stroke: #000; stroke-width: 1 }";
	            // SVGstyles += ".tick text { font-size: 12px; color: #000; }";
	            // SVGstyles += ".area { fill: #aaa; }";
	            // SVGstyles += "</style></defs>";

	            // // get svg string
	            // var SVGstring = new XMLSerializer().serializeToString(svg);
	            // // viewBox allows for scaling
	            // SVGstring = "<svg viewBox='0 0 " + svg.getAttribute('width') + " " + svg.getAttribute('height') + "' style='background:white'>" + SVGstyles + SVGstring.substr(SVGstring.indexOf(">") + 1);
	           
	            // var elev_canvas = document.createElement("canvas");
	            // elev_canvas.width = width;
	            // elev_canvas.height = height;
	            // canvg(elev_canvas, SVGstring, { ignoreMouse: true, ignoreAnimation: true });//, scaleWidth: width, scaleHeight: height }) 


	            leafletImage($scope.map, function(err, canvas) {

	                // docDefinition.content.push({
	                //     image: elev_canvas.toDataURL('image/png',1),
	                //     width: 545
	                // });
	                // docDefinition.content.push({
	                //     image: canvas.toDataURL('image/jpeg',1),
	                //     width: (canvas.width / 2) * .635 // todo: this last multiplier is needed for same pixel accuracy as screen- why?
	                // });
	                // docDefinition.content.push({
	                //     margin: [0, 8, 0,0],
	                //     columns: [{
	                //         image: arrow_canvas.toDataURL('image/jpeg',1),
	                //         width: 70,
	                //     }, 
	                //     [{  
	                //         margin: [17, 2.6, 0, 4.2],
	                //         fontSize: 8.6,
	                //         columns:[{
	                //             text: ["SCALE  ",  { text: "1:" + $filter('number')(mapScale, 0), bold: true }],
	                //             width: 'auto', margin: [0, 0, 14, 0]
	                //         },{
	                //             text: ["1 in = ",  { text: formatFeet(feetPerInch), bold: true }],
	                //             width: 'auto', margin: [0, 0, 14, 0]
	                //         },{
	                //             text: ["1 cm = ",  { text: formatMeters(metersPerCm), bold: true }],
	                //             width: '*'
	                //         }]
	                //     }, {
	                //         image: scale_canvas.toDataURL('image/jpeg',1),
	                //         width: (scale_canvas.width / 4) * .635
	                //     }]
	                //     ]
	                // });
	                pdfMake.createPdf(docDefinition).download();
	                // for testing
	                //window.open(canvas.toDataURL('image/jpeg',1), '_blank');
	            });
	        }


	        $scope.$watch("munterRate", function() {
	            if (!elevationProfilePoints || !$scope.munterRate || isNaN($scope.munterRate.up) || isNaN($scope.munterRate.down == null)) return;
	            calculateRouteStats();
	        }, true);

	        $scope.$watch("hoverOnLeg", function() {
	            angular.forEach(lineSegmentGroup._layers, function(segment) {
	                segment.setStyle({ color: 'transparent' });
	                if (segment.segment.legIndex == $scope.hoverOnLeg) {
	                    // highlight route leg
	                    segment.bringToBack();
	                    segment.setStyle({ color: 'rgba(255,255,255,1)' });
	                    // todo: highlight in elevation profile
	                }
	            });
	        }, true);
	        $scope.$watch("hoverOnPoint", function() {
	            if (!_line) return;
	            angular.forEach(_line.editing._markers, function(marker) {
	                $(marker._icon).removeClass("highlight");
	                if (marker._index == $scope.hoverOnPoint) {
	                    // highlight marker
	                    $(marker._icon).addClass("highlight");
	                }
	            });
	        }, true);

	        function interpolate(_points) {
	            var new_points = [];
	            for (var i = 0; i < _points.length; i++) {
	                new_points[i*2] = _points[i];
	           }
	           for (var i = 0; i < new_points.length; i++) {
	                if (!new_points[i]) {
	                    var startPoint =  new google.maps.LatLng(new_points[i-1].lat, new_points[i-1].lng); 
	                    var endPoint = new google.maps.LatLng(new_points[i+1].lat, new_points[i+1].lng); 
	                    var percentage = 0.5; 
	                    var middlePoint = google.maps.geometry.spherical.interpolate(startPoint, endPoint, percentage);
	                    new_points[i] = { lat: middlePoint.lat(), lng: middlePoint.lng() }
	                }
	            }
	            return new_points;
	        }

	        var disabledForZoom = false;
	        $scope.map.on('zoomend', function(e) {
	            // if zoom level is less than 13, disable editing
	            if ($scope.routeControl.editing && $scope.map.getZoom() < 13) {
	                //$scope.$apply({ 'routeControl.editing' : false });
	                $scope.routeControl.editing = false;
	                disabledForZoom = true;
	            }
	            // restart editing once zoomed back in
	            else if (!$scope.routeControl.editing && $scope.map.getZoom() >= 13 && disabledForZoom) {
	                //$scope.$apply({ 'routeControl.editing' : true });
	                $scope.routeControl.editing = true;
	                disabledForZoom = false;
	            }
	        });

	        // the feature group holder for the route
	        var lineGroup = L.featureGroup().addTo($scope.map);

	        // Leaflet.Draw edit handler for custom edit/draw functionality
	        var editHandler = new L.EditToolbar.Edit($scope.map, {
	            featureGroup: lineGroup,
	            selectedPathOptions: {
	                color: '#2080cc',
	                opacity: 1
	            }
	        });

	        // keep track of line segments (point-to-point line segments, not route segments)
	        var lineSegmentGroup = L.featureGroup().addTo($scope.map);

	        function updateSegments() {
	            lineSegmentGroup.clearLayers();

	            var legIndex = 0;
	            for (var i = 0; i < _line.editing._markers.length - 1; i++) {
	                var thisPoint = _line.editing._markers[i];
	                var nextPoint = _line.editing._markers[i + 1];

	                // if waypoint
	                if (thisPoint.waypoint) {
	                    legIndex++;
	                }

	                var segmentData = {
	                    start: thisPoint._latlng,
	                    end: nextPoint._latlng,
	                    index: i,
	                    legIndex: legIndex
	                };

	                var segment = L.polyline([thisPoint._latlng, nextPoint._latlng], {
	                    color: 'transparent',
	                    opacity: .5,
	                    weight: 12 // allows for a wider clickable area
	                });
	                segment.segment = segmentData;

	                // add new point when clicking on a line segment
	                // segment.on('mousedown', function(e) {
	                //     if (!$scope.control.editing) return;
	                //     // straighten out point on line
	                //     // var newPoint = e.latlng;
	                //     // newPoint = turf.pointOnLine(
	                //     //     turf.linestring([
	                //     //         [e.target.segment.start.lat, e.target.segment.start.lng],
	                //     //         [e.target.segment.end.lat, e.target.segment.end.lng]
	                //     //     ]),
	                //     // );
	                //     // newPoint = { lat: newPoint.geometry.coordinates[0], lng: newPoint.geometry.coordinates[1] };
	                //     addPoint(e.latlng, e.target.segment.index + 1);
	                //        processUpdate();
	                // });

	                // elevation widget highlight
	                segment.on('mousemove', function(e) {
	                    if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
	                    $timeout(function(){ $scope.hoverOnLegMap = e.target.segment.legIndex });
	                });
	                segment.on('mouseout', function(e) {
	                    if (elevationWidget) elevationWidget.highlight();
	                    $timeout(function(){ $scope.hoverOnLegMap = null });
	                });

	                lineSegmentGroup.addLayer(segment);
	            }
	        }

	        var saveLineTimeout;
	        function saveLinePoints() {
	            $timeout.cancel(saveLineTimeout);
	            saveLineTimeout = $timeout(function(){
	                $scope.route.stats = {};
	                $scope.route.points = [];

	                var legIndex = 0;
	                var lastWaypointIndex = 0;

	                for (var i = 0; i < _line.editing._markers.length; i++) {
	                    var thisPoint = _line.editing._markers[i];

	                    if (thisPoint.waypoint || i == 0 || i == _line.editing._markers.length - 1) {

	                        var pointDetails = {
	                            lat: thisPoint._latlng.lat,
	                            lng: thisPoint._latlng.lng,
	                            waypoint: thisPoint.waypoint,
	                            pointIndex: thisPoint._index,
	                            terrain: {},
	                            leg: {}
	                        };

	                        // get leg
	                        if (elevationProfilePoints) {
	                            var legPoints = getLegPoints(lastWaypointIndex, thisPoint._index);
	                            pointDetails.leg = calculateLineSegmentStats(legPoints);
	                            pointDetails.terrain = getElevationProfilePoint(thisPoint._index);
	                        }   

	                        // set leg on every point so that we can highlight it
	                        pointDetails.leg.index = legIndex;

	                        $scope.route.points.push(pointDetails);

	                        if (thisPoint.waypoint) legIndex++;
	                        lastWaypointIndex = thisPoint._index;
	                    }
	                }

	                // route terrain stats
	                if (elevationProfilePoints) {
	                    //$log.debug("here!!!!!!!!!!!!!!!!!");
	                   $scope.route.stats = calculateLineSegmentStats(elevationProfilePoints);
	                   //$log.debug($scope.route.stats);
	                }
	            }, 10);
	        }

	        function addPoint(latlng, index) {
	            // this prevents a bug where addPoint is called without a latlng object
	            if (!latlng) return;

	            // prevent adding a point too far from last point
	            if (_line.editing._markers.length) {
	                // get last point
	                var lastPoint = _line.editing._markers[_line.editing._markers.length - 1]._latlng;
	                // get distance from last point
	                var distance = turf.distance(turf.point([lastPoint.lng,lastPoint.lat]), turf.point([latlng.lng,latlng.lat]), 'kilometers');
	                // if distance is greater than 8km/5mi, don't allow
	                if (distance > 8) {
	                    alert('This point is more than 8km/5mi far from the last point.\n\nPlease place your next point closer.');
	                    return;
	                }
	            }

	            if (index == null) index = _line.editing._poly._latlngs.length;
	            _line.editing._poly.addLatLng(latlng);
	            _line.editing._markers.splice(index, 0, _line.editing._createMarker(latlng));
	            _line.editing._poly.redraw();

	            // before calling updateMarkers, keep track of where waypoints are
	            var waypoints = {};
	            for (var i = 0; i < _line.editing._markers.length; i++) {
	                var marker = _line.editing._markers[i];
	                if (marker.waypoint) waypoints[i] = marker.waypoint;
	            }

	            // call updateMarkers to reload points
	            _line.editing.updateMarkers();

	            angular.forEach(_line.editing._markers,function(marker, _index) {
	                // if first point and no waypoint, create
	                if (_index === 0 && !waypoints[marker._index]) makeWaypoint(marker);
	                // if last point and no waypoint, create
	                //else if (index === (_line.editing._markers.length - 1) && !waypoints[marker._index]) makeWaypoint(marker);
	                // if existing waypoint
	                else if (waypoints[marker._index]) makeWaypoint(marker, waypoints[marker._index]);
	                // auto-waypoint (only on "new" points at end of existing line, not new midpoints)
	                else if ($scope.routeControl.autoWaypoint && index == _index && index == _line.editing._poly._latlngs.length - 1) {
	                    makeWaypoint(marker);
	                }
	                // regular point
	                else makeRegularPoint(marker);
	            });
	            // return marker
	            return _line.editing._markers[index];
	        }

	        function createLine() {
	            _line = L.polyline([], { opacity: .5 });
	            lineGroup.addLayer(_line);
	            editHandler.enable();

	            // event when line is edited (after point is dragged or midpoint added)
	            _line.on('edit', function(e) {
	                // prevent addition of new points for 1 second after moving point
	                // to prevent accidental addition of new point
	                preventEdit = true;
	                setTimeout(function() { preventEdit = false }, 1000);

	                // handle new midpoints
	                angular.forEach(_line.editing._markers,function(marker) {
	                    if (!marker.isPoint) makeRegularPoint(marker);
	                });

	                processUpdate();
	            });
	        }

	        var preventEdit = false;
	        function mapClick(e) {
	            if (!$scope.routeControl.editing) return;
	            if (preventEdit) return;

	            // add route polyline if it doesn't exist (only gets hit on first point)
	            if (!_line) createLine();

	            // add point
	            addPoint(e.latlng);

	            // update
	            processUpdate();
	        };
	        $scope.map.on('click', mapClick);

	        function makePoint(marker) {
	            // mark as a route planning point
	            marker.isPoint = true;

	            // if first point, add start class
	            if (marker._index == 0) $(marker._icon).addClass("start-icon");
	            // if last point, add end class
	            else if (marker._index == _line.editing._markers.length - 1) $(marker._icon).addClass("end-icon");

	            // remove existing marker events
	            marker.off('click');
	            marker.off('mouseover');
	            marker.off('mouseout');

	            // elevation widget highlight
	            marker.on('mouseover', function(e) {
	                if (e.latlng && elevationWidget) elevationWidget.highlight(e.latlng);
	                $timeout(function(){ $scope.hoverOnPointMap = e.target._index });

	            });
	            marker.on('mouseout', function(e) {
	                if (elevationWidget) elevationWidget.highlight();
	                $timeout(function(){ $scope.hoverOnPointMap = null });
	            });

	            // popup
	            marker.unbindPopup();
	            marker.bindPopup("test", { closeButton: true });   

	            marker.on('click', function() {
	                var leafletPopup = marker.getPopup();

	                var popup = document.createElement("div");
	                popup.style.padding = '5px';

	                if (marker.waypoint) {
	                    popup.appendChild($("<div style='font-weight:bold;position:relative;bottom:2px;margin-right:20px;'>" + $scope.route.waypointPrefix() + marker.waypoint.index + "</div>")[0]);

	                    var nameInput = document.createElement("input");
	                    popup.appendChild(nameInput);
	                    nameInput.placeholder = "Waypoint Name";
	                    nameInput.value = marker.waypoint.name;
	                    nameInput.onkeyup = function() {
	                        marker.waypoint.name = nameInput.value;
	                        saveLinePoints();
	                    }

	                    if (marker._index > 0 && $scope.routeControl.editing) {
	                        var deleteWaypointbutton = document.createElement("button");
	                        popup.appendChild(deleteWaypointbutton);
	                        deleteWaypointbutton.innerHTML = "<i class='ion-trash-a'></i>&nbsp;&nbsp;Remove Waypoint";
	                        deleteWaypointbutton.addEventListener("click", function() {
	                            marker.closePopup();
	                            deleteWaypoint(marker);

	                            marker.fire('click');
	                            // if ($scope.routeControl.editing) {
	                            //     marker.fire('click');
	                            // }
	                            // else {
	                            //     editingOff();
	                            // }
	                        });
	                    }
	                }
	                else {
	                    popup.appendChild($("<div style='font-weight:bold;position:relative;bottom:2px;margin-right:20px;'>Route Point<br/></div>")[0]);
	                    var makeWaypointbutton = document.createElement("button");
	                    popup.appendChild(makeWaypointbutton);
	                    makeWaypointbutton.innerHTML = '<i class="fa fa-map-marker"></i>&nbsp;&nbsp;Make Waypoint';
	                    makeWaypointbutton.addEventListener("click", function() {
	                        // if (marker._index == 0 || marker._index == _line.editing._markers.length - 1) {
	                        //     $log.debug("can't create waypoint on start point or end point")
	                        //     return;
	                        // }

	                        marker.closePopup();
	                        makeWaypoint(marker);
	                        marker.fire('click');

	                        processUpdate();
	                        saveLinePoints();
	                    });

	                    var deleteButton = document.createElement("button");
	                    popup.appendChild(deleteButton);
	                    deleteButton.innerHTML = '<i class="ion-trash-a"></i>&nbsp;&nbsp;Delete';
	                    deleteButton.addEventListener("click", function() {
	                        if (_line.editing._markers.length == 1) {
	                            $log.debug("can't delete only point");
	                            return;
	                        }
	                        _line.editing._onMarkerClick({ target: marker });
	                        //makeRegularPoint(_line.editing._markers[marker._index + 1]);
	                        // todo: handle proper styling on delete. start/end points should be waypoints!
	                    });
	                }
	                leafletPopup.setContent(popup);
	            });
	        }

	        function makeWaypoint(marker, waypointData) {
	            makePoint(marker);

	            marker.waypoint = {
	                name: ''
	            };
	            if (waypointData) marker.waypoint = waypointData;

	            // add marker css class
	            $(marker._icon).addClass("waypoint-icon");

	            // keep track of waypoint index
	            calculateWaypointIndex();
	        }
	        function makeRegularPoint(marker) {
	            makePoint(marker);

	            if (marker.waypoint) delete marker.waypoint;

	            // remove waypoint css class (if exists)
	            $(marker._icon).removeClass("waypoint-icon");

	            // keep track of waypoint index
	            calculateWaypointIndex();
	        }

	        function calculateWaypointIndex() {     
	            // keep track of waypoint index
	            var waypointCount = 1;
	            angular.forEach(_line.editing._markers,function(_marker, _index) {
	                if (_marker.waypoint) {
	                    _marker.waypoint.index = waypointCount;
	                    waypointCount++;
	                }
	            });
	        }

	        function deleteWaypoint(marker) {
	            makeRegularPoint(marker);
	            processUpdate();
	            saveLinePoints();
	        }

	        var elevationProfilePoints;
	        var lastLine;

	        function processUpdate(callback) {
	            updateSegments();

	            $log.debug("processUpdate!")

	            var points = _line._latlngs;

	            // get line distance
	            var distance = turf.lineDistance(turf.linestring(points.map(function(point) { return [point.lng,point.lat] })), 'kilometers');
	           
	            // sample every 5m
	            var sampleCount = Math.round((distance * 1000) / 5);

	            // keep track of original points
	            for (var i = 0; i < points.length;i++) {
	                points[i].original  = true;
	            }

	            // interpolate between points
	            while ((points.length * 2) -1 <= sampleCount) {
	                points = interpolate(points);
	            }

	            $scope.terrainLayer.getTerrainDataBulk(points, function(receivedPoints) {
	                if (callback) callback();

	                if (!receivedPoints || receivedPoints.length == 0) return;

	                $log.debug("TERRAIN DATA LAODED!")

	                // store elevation profile for later
	                elevationProfilePoints = angular.copy(receivedPoints);
	                //$log.debug(receivedPoints);

	                // calculate route stats/time, etc.
	                calculateRouteStats();

	                // plot elevation profile
	                plotElevationProfile();

	                // add waypoints to elevation profile
	                angular.forEach(_line.editing._markers,function(marker, i) {
	                    // if waypoint isn't first or last
	                    if (marker.waypoint && i != 0 && i != _line.editing._markers.length - 1) elevationWidget.addWaypoint(marker._latlng);
	                });

	                $scope.loading = false;

	                saveLinePoints();
	            });
	            //$log.debug("promises!");
	            //$log.debug(promises);
	            updateSegments();
	        }

	        function calculateRouteStats() {
	            var points = elevationProfilePoints;
	            if (!points) return;

	            var totalDistance = 0;
	            var totalTimeEstimateMinutes = 0;
	            var originalIndex = 0;


	            for (var i = 0; i < points.length; i++) {
	                //$log.debug(i);
	                var point = points[i];
	                if (!point) continue;

	                // assign index for tracking
	                point.index = i;
	                // assign original index for tracking markers
	                if (point.original) {
	                    point.originalIndex = originalIndex;
	                    originalIndex++;
	                }

	                // defaults for first point
	                point.totalDistance = 0;
	                point.totalTimeEstimateMinutes = 0;

	                if (i == 0) continue;

	                // keep track of distance

	                var segmentDistance = turf.lineDistance(turf.linestring([
	                    [points[i-1].lng, points[i-1].lat],
	                    [point.lng, point.lat]
	                ]), 'kilometers');
	                point.distance = segmentDistance;
	                totalDistance += segmentDistance
	                point.totalDistance = totalDistance;

	                // keep track of bearing

	                point.bearing = turf.bearing(turf.point([points[i-1].lng, points[i-1].lat]), turf.point([point.lng, point.lat]));
	                if (point.bearing < 0) point.bearing += 360;

	                // keep track of vertical up/down and munter time estimates

	                // munter time estimate details...
	                // http://www.foxmountainguides.com/about/the-guides-blog/tags/tag/munter-touring-plan
	                // https://books.google.com/books?id=Yg3WTwZxLhIC&lpg=PA339&ots=E-lqpwepiA&dq=munter%20time%20calculation&pg=PA112#v=onepage&q=munter%20time%20calculation&f=false
	                // distance: 1km = 1 unit (since distance is already in km, just use as-is)
	                // vertical: 100m = 1 unit (vertical is in m, so just divide by 100)

	                var previousElevation = points[i-1].elevation;
	                point.elevationDifference = point.elevation - previousElevation;

	                if (point.elevationDifference > 0) {
	                    point.direction = "up";
	                    point.verticalUp = point.elevationDifference;

	                    point.munterUnits = segmentDistance + (point.verticalUp / 100);
	                    point.timeEstimateMinutes = (point.munterUnits / $scope.munterRate.up) * 60;
	                }
	                else if (point.elevationDifference < 0) {
	                    point.direction = "down";
	                    point.verticalDown = Math.abs(point.elevationDifference);

	                    point.munterUnits = segmentDistance + (point.verticalDown / 100);
	                    point.timeEstimateMinutes = (point.munterUnits / $scope.munterRate.down) * 60;
	                }
	                else {
	                    point.direction = "flat";

	                    point.munterUnits = segmentDistance;
	                    var munter_rate_flat = ($scope.munterRate.up + $scope.munterRate.down) / 2;
	                    point.timeEstimateMinutes = (point.munterUnits / munter_rate_flat) * 60;
	                }

	                totalTimeEstimateMinutes += point.timeEstimateMinutes;
	                point.totalTimeEstimateMinutes = totalTimeEstimateMinutes;

	            }
	            saveLinePoints();
	        }

	        function getLegPoints(pointIndexStart, pointIndexEnd) {
	            if (!elevationProfilePoints) return [];
	            var startIndex = 0;
	            var endIndex = 0;
	            for (var i = 0; i < elevationProfilePoints.length; i++) {
	                var point = elevationProfilePoints[i];
	                if (point.originalIndex == pointIndexStart) startIndex = i;
	                else if (point.originalIndex == pointIndexEnd) endIndex = i;
	            }
	            return elevationProfilePoints.slice(startIndex, endIndex + 1);
	        }
	        function getElevationProfilePoint(pointIndex) {
	            if (!elevationProfilePoints) return -1;
	            for (var i = 0; i < elevationProfilePoints.length; i++) {
	                var point = elevationProfilePoints[i];
	                if (point.originalIndex == pointIndex) return point;
	            }
	        }

	        function calculateLineSegmentStats(points) {
	            if (!points || points.length < 2) return {};

	            var startPoint = points[0];
	            var endPoint = points[points.length - 1];

	            var bearing = turf.bearing(turf.point([startPoint.lng, startPoint.lat]), turf.point([endPoint.lng, endPoint.lat]));
	            if (bearing < 0) bearing += 360;

	            // calculate stats
	            return {
	                timeEstimateMinutes: endPoint.totalTimeEstimateMinutes - startPoint.totalTimeEstimateMinutes,
	                distance: endPoint.totalDistance  - startPoint.totalDistance,

	                elevationChange: endPoint.elevation - startPoint.elevation,
	                elevationMin: getMin(points, 'elevation'),
	                elevationMax: getMax(points, 'elevation'),

	                slopeMin: getMin(points, 'slope'),
	                slopeMax: getMax(points, 'slope'),
	                slopeAverage: getAverage(points, 'slope'),

	                verticalUp: getSum(points, 'verticalUp'),
	                verticalDown: getSum(points, 'verticalDown'),

	                aspectMin: getMin(points, 'aspect'),
	                aspectMax: getMax(points, 'aspect'),
	                aspectAverage: getAverageAspect(points, 'aspect'),

	                bearing: bearing
	            }
	        }

	        function plotElevationProfile() {
	            var points = elevationProfilePoints;
	            if (!points) return;

	            var geoJSON = {
	                "name":"NewFeatureType",
	                "type":"FeatureCollection",
	                "features":[{
	                    "type":"Feature",
	                    "geometry": { "type":"LineString", "coordinates":[] },
	                    "properties": null
	            }]};
	            geoJSON.features[0].geometry.coordinates = [];

	            // get max elevation
	            var max_elevation = 0;
	            for (var i = 0; i < points.length; i++) {
	                max_elevation = Math.max(points[i].elevation, max_elevation);
	                //if (points[i].elevation > max_elevation) max_elevation = 
	            }

	            for (var i = 0; i < points.length; i++) {
	                var thisPoint = points[i];
	                if (!thisPoint || thisPoint.lat == null || thisPoint.lat == null) continue;

	                if (!thisPoint.elevation) thisPoint.elevation = max_elevation;

	                geoJSON.features[0].geometry.coordinates.push([
	                    thisPoint.lng,
	                    thisPoint.lat,
	                    thisPoint.elevation,
	                    thisPoint.slope,
	                    formatters.formatDirection(thisPoint.aspect),
	                    thisPoint.totalTimeEstimateMinutes,
	                    thisPoint.totalDistance,
	                    formatters.formatDirection(thisPoint.bearing)
	                ]);
	            }

	            if (lastLine) $scope.map.removeLayer(lastLine);
	            createElevationProfileWidget();

	            lastLine = L.geoJson(geoJSON, {
	                onEachFeature: elevationWidget.addData.bind(elevationWidget) //working on a better solution
	            });
	        }
	          //  for (var i = 0; i < points.length; i++) {
	          //       point_string += points[i].lng + "," + points[i].lat + ";";
	          // }

	          // point_string = point_string.substring(0,point_string.length-1);

	          // $.getJSON("http://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points=" +
	          //   point_string 
	          //   + "&access_token=pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0.q_Esm5hrpZLbl1XQERtKpg", function(data) {
	          //       $log.debug(data.results);

	          //       geoJSON.features[0].geometry.coordinates = [];
	          //       for (var i=0; i< data.results.length; i++) {
	          //           geoJSON.features[0].geometry.coordinates.push([
	          //               data.results[i].latlng.lng,
	          //               data.results[i].latlng.lat,
	          //               data.results[i].ele
	          //           ]);
	          //       }

	          //       lastLine = L.geoJson(geoJSON,{
	          //           onEachFeature: elevationWidget.addData.bind(elevationWidget) //working on a better solution
	          //       }).addTo($scope.map);
	          //   })

	        // });

	        var elevationWidget;
	        function createElevationProfileWidget() {

	            if (elevationWidget) elevationWidget.clear();

	            elevationWidget = new ElevationWidget();
	            elevationWidget.create($scope.map, {
	                imperial: Global.user.settings.elevation == 1, // true
	                //width: 670,
	                height: 163,
	                margins: {
	                    top: 24,
	                    right: 18,
	                    bottom: 20,
	                    left: 40
	                },
	                useHeightIndicator: true, //if false a marker is drawn at map position
	                hoverNumber: {
	                    decimalsX: 3, //decimals on distance (always in km)
	                    decimalsY: 0, //deciamls on height (always in m)
	                    formatter: undefined //custom formatter function may be injected
	                },
	                // xTicks: undefined, //number of ticks in x axis, calculated by default according to width
	                // yTicks: undefined, //number of ticks on y axis, calculated by default according to height
	            });
	        }

	        function downloadGPX() {
	            // var mapScale = 50000; // 1:{mapScale} ft
	            // var metersPerPixel = mapScale / 39.3701 / $scope.getPixelsPerScreenInch();
	            // var zoom = Math.log((156543.03392 / metersPerPixel) * Math.cos($scope.map.getCenter().lat * Math.PI / 180)) / Math.log(2);
	            // $scope.map.setZoom(zoom);
	            // todo: if a map scale is explicitly selected, make sure it stays in that scale as map moves

	            // var minlat = '40.59382';
	            // var minlon = '-111.65113';

	            // var maxlat = '40.6090005';
	            // var maxlon = '-111.60976';

	            // calculate bounds
	            var bounds = new google.maps.LatLngBounds();
	            for (var i = 0; i < _line.editing._markers.length; i++) {
	                var thisPoint = _line.editing._markers[i];
	                bounds.extend(new google.maps.LatLng(thisPoint._latlng.lat, thisPoint._latlng.lng));
	            }

	            var gpx = 
	                '<?xml version="1.0"?>\n' +
	                '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1">\n' + // xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
	                '  <metadata>\n' +
	                '    <name><![CDATA[Avanet GPX export]]></name>\n' +
	                '    <desc><![CDATA[]]></desc>\n' +
	                '    <link href="http://avanet.avatech.com">\n' +
	                '      <text>Created with Avanet - Avatech, Inc.</text>\n' +
	                '    </link>\n' +
	                //'    <bounds minlat="' + minlat + '" minlon="' + minlon + '" maxlat="' + maxlat + '" maxlon="' + maxlon + '"/>\n' +
	                '  </metadata>\n';

	            // waypoints
	            var wayPointIndex = 0;
	            for (var i = 0; i < _line.editing._markers.length; i++) {
	                var thisPoint = _line.editing._markers[i];
	                if (thisPoint.waypoint || i == 0 || i == _line.editing._markers.length - 1) {
	                    wayPointIndex++;
	                    gpx +=  '  <wpt lat="' + thisPoint._latlng.lat + '" lon="' + thisPoint._latlng.lng + '">\n';
	                    //gpx +=  '    <name><![CDATA[' + thisPoint.waypoint.name + ']]></name>\n';
	                    gpx +=  '    <name><![CDATA[' + $scope.route.waypointPrefix() + wayPointIndex + ']]></name>\n';
	                    if (thisPoint.waypoint && thisPoint.waypoint.name) 
	                        gpx += '    <desc><![CDATA[' + thisPoint.waypoint.name + ']]></desc>\n';
	                    gpx +=  '  </wpt>\n';
	                }
	            }

	            // route start
	            gpx +=  '<rte>' +
	                    '<name><![CDATA[]]></name>\n' +
	                    '<desc><![CDATA[]]></desc>\n' +
	                    '<src>AllTrails</src>\n';

	            // route points
	            wayPointIndex = 0;
	            for (var i = 0; i < _line.editing._markers.length; i++) {
	                var thisPoint = _line.editing._markers[i];
	                //if (thisPoint.waypoint) legIndex++;
	                gpx += '    <rtept lat="' + thisPoint._latlng.lat + '" lon="' + thisPoint._latlng.lng + '">\n';
	                if (thisPoint.waypoint || i == 0 || i == _line.editing._markers.length - 1) {
	                    wayPointIndex++;
	                    gpx += '      <name><![CDATA[' + $scope.route.waypointPrefix() + wayPointIndex + ']]></name>\n';
	                    if (thisPoint.waypoint && thisPoint.waypoint.name) 
	                        gpx += '      <desc><![CDATA[' + thisPoint.waypoint.name + ']]></desc>\n';
	                }
	                gpx += '    </rtept>\n';
	            }

	            // route end
	            gpx += '  </rte>\n';

	            // end GPX
	            gpx += '</gpx>';

	            //$log.debug(gpx);

	            var gpxData = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpx);
	            var link = document.createElement('a');
	            angular.element(link)
	                .attr('href', gpxData)
	                .attr('download', 'avanet-route.gpx');
	            link.click();
	        }

	        // UTILS

	        function getAverage(list, property) {
	            var sum = 0;
	            for (var i = 0; i < list.length; i++) {
	                var val;
	                if (!property) val = list[i];
	                else val = list[i][property];
	                if (val != null) sum += val;
	            }
	            return sum / list.length;
	        }
	        function getMin(list, property) {
	            var min = 9999;
	            for (var i = 0; i < list.length; i++) {
	                var val;
	                if (!property) val = list[i];
	                else val = list[i][property];
	                if (val != null) min = Math.min(min, val);
	            }
	            return min;
	        }
	        function getMax(list, property) {
	            var max = 0;
	            for (var i = 0; i < list.length; i++) {
	                var val;
	                if (!property) val = list[i];
	                else val = list[i][property];
	                if (val != null) max = Math.max(max, val);
	            }
	            return max;
	        }
	        function getSum(list, property) {
	            var sum = 0;
	            for (var i = 0; i < list.length; i++) {
	                var val;
	                if (!property) val = list[i];
	                else val = list[i][property];
	                if (val != null) sum += val;
	            }
	            return sum;
	        }

	        // for aspect only
	        function getAverageAspect(list, property) {
	            var sines = [];
	            var cosines = [];

	            // get sines and cosines
	            for (var i = 0; i < list.length; i++) {
	                var aspect = list[i][property];
	                if (aspect != null) {
	                    aspect = parseInt(aspect);
	                    // convert aspect degrees to radians
	                    aspect *= (Math.PI / 180);
	                    sines.push(Math.sin(aspect));
	                    cosines.push(Math.cos(aspect));
	                }
	            }

	            // calculate mean of sines and cosines
	            var meanSine = getAverage(sines);
	            var meanCosine = getAverage(cosines);

	            // calculate aspect in radians
	            var averageAspectRadians = Math.atan2(meanSine, meanCosine);

	            // convert to degrees
	            var deg = averageAspectRadians * (180 / Math.PI);

	            // if negative, adjust
	            if (deg < 0) deg = 360 + deg;

	            return deg;
	        }
	    }
	});

/***/ },
/* 20 */
/***/ function(module, exports) {

	// register module
	angular.module('terrain', []);

	angular.module('terrain').factory('terrainVisualization', function () { 

	    var colorMaps = {

	        elevation: [
	            { color: "fd4bfb", val: 0 },
	            { color: "1739fb", val: 380 * 2 },
	            { color: "00aeff", val: 380 * 3 },
	            { color: "28f937", val: 380 * 4 },
	            { color: "fefa37", val: 380 * 7 },
	            { color: "e6000b", val: 380 * 13 },
	            { color: "910209", val: 380 * 14 },
	            { color: "6a450c", val: 380 * 15 },
	            { color: "8b8b8b", val: 380 * 16 },
	            { color: "ffffff", val: 8400 },
	        ],
	        slope: [
	            { color: "ffffff", val: 0 },
	            { color: "00f61c", val: 6 },
	            { color: "02fbd2", val: 11 },
	            { color: "01c6f6", val: 17 },
	            { color: "3765f9", val: 22 },
	            { color: "9615f8", val: 27 },
	            { color: "eb02d0", val: 31 },
	            { color: "fb1978", val: 35 },
	            { color: "ff5c17", val: 39 },
	            { color: "f9c304", val: 42 },
	            { color: "fefe2b", val: 45 },
	            { color: "000000", val: 80 },
	        ],
	        aspect: [
	            { color: "c0fc33", val: 0 },
	            { color: "3bc93d", val: 22 },
	            { color: "3cca99", val: 67 },
	            { color: "1b29e1", val: 112 },
	            { color: "7e3ac8", val: 157 },
	            { color: "fb0b1a", val: 202 },
	            { color: "fc9325", val: 247 },
	            { color: "fefc37", val: 292 },
	            { color: "c0fc33", val: 338 },
	            { color: "c0fc33", val: 360 },
	        ]
	    };

	    // convert to rgb first for quicker math in getColor()
	    var colorMapsProcessed = {};
	    // angular.forEach(colorMaps, function(colorMap, key) {
	    //     var colorMap = angular.copy(colorMap);
	    //     for (var i = 0; i < colorMap.length; i++)
	    //         colorMap[i].color = hexToRGB(colorMap[i].color);
	    //     colorMapsProcessed[key] = colorMap;
	    // });
	    angular.forEach(colorMaps, function(colorMap, key) {
	        colorMapsProcessed[key] = getColorMap(colorMap);
	    });


	    // function getColor(colorMap, val) {
	    //     // return if above max values
	    //     if (val > colorMap[colorMap.length - 1].val) return;
	    //     // get color from color map
	    //     for (var i = 0; i < colorMap.length - 1; i++) {
	    //         if (val >= colorMap[i].val &&  val <= colorMap[i + 1].val) {
	    //             var thisStep = colorMap[i];
	    //             var nextStep = colorMap[i+1];
	    //             var percent = getPercent(thisStep.val, nextStep.val, val);
	    //             return blendRGBColors(thisStep.color, nextStep.color, percent);
	    //         }
	    //     }
	    // }

	    function convertInt(_int) {
	        return [
	            (0xFFFE0000 & _int) >> 17, // elevation
	            (0x1FC00 & _int) >> 10, // slope
	            (0x1FF & _int) // aspect
	        ];
	    }

	    function blendRGBColors(c0, c1, p) {
	        return [Math.round(Math.round(c1[0] - c0[0]) * (p / 100)) + c0[0],
	                Math.round(Math.round(c1[1] - c0[1]) * (p / 100)) + c0[1],
	                Math.round(Math.round(c1[2] - c0[2]) * (p / 100)) + c0[2]
	            ];
	    }
	    function blendHexColors(c0, c1, p) {
	        c0 = hexToRGB(c0);
	        c1 = hexToRGB(c1);
	        return blendRGBColors(c0, c1, p);
	    }

	    function hexToRGB(hex) {
	        var bigint = parseInt(hex, 16);
	        return [
	            (bigint >> 16) & 255,
	            (bigint >> 8) & 255,
	            (bigint & 255)
	        ];
	    }

	    function getPercent(min, max, val) {
	        return Math.floor(((val - min) * 100) / (max - min));
	    }

	    function getColorMap(steps){
	        var colorMap = [];
	        //var maxValue = steps[steps-1].val;
	        //var increment = parseInt(maxValue / steps.length);

	        for (var s = 0; s < steps.length; s++) {
	            if (s == steps.length - 1) break;
	            var min = steps[s].val;
	            var max = steps[s+1].val;

	            var minColor = steps[s].color;
	            var maxColor = steps[s+1].color;

	            for (var i = min; i <= max; i++)
	                colorMap[i] = blendHexColors(minColor,maxColor, getPercent(min, max, i));
	        }
	        return colorMap;
	    }

	    return {

	    colorMaps: colorMaps,

	    hillshade: function(dem) {

	        var altitude = 70 * (Math.PI / 180);
	        var azimuth = 0 * (Math.PI / 180);
	        var shadows = .7; // .45
	        var highlights = .2; // .45

	        var px = new Uint8ClampedArray(256 * 256 * 4),
	            a = - azimuth - Math.PI / 2,
	            z = Math.PI / 2 - altitude,
	            cosZ = Math.cos(z),
	            sinZ = Math.sin(z),
	            neutral = cosZ,
	            x, y, i, hillshade, alpha;

	        for (x = 0; x < 256; x++) {
	            for (y = 0; y < 256; y++) {

	                var i = y * 256 + x;

	                if (dem[i] == null) continue;

	                var sl  = (dem[i][1] * (Math.PI / 180)) * 1.9;
	                var asp = (dem[i][2] * (Math.PI / 180)) * 1.9;

	                if (sl == null) continue;

	                hillshade = cosZ * Math.cos(sl) + sinZ * Math.sin(sl) * Math.cos(a - asp);
	                if (hillshade < 0) hillshade /= 2;
	                alpha = neutral - hillshade;

	                i = (y * 256 + x) * 4;

	                // shadows
	                if (neutral > hillshade) { 
	                    px[i]     = 20;
	                    px[i + 1] = 0;
	                    px[i + 2] = 30;
	                    px[i + 3] = Math.round(255 * alpha * shadows);

	                } 
	                // highlights
	                else { 
	                    alpha = Math.min(-alpha * cosZ * highlights / (1 - hillshade), highlights);
	                    px[i]     = 255;
	                    px[i + 1] = 255;
	                    px[i + 2] = 230;
	                    px[i + 3] = Math.round(255 * alpha);
	                }
	            }
	        }
	        return px;
	    },

	    render: function(data, overlayType, customParams) {

	        var new_pixels = new Uint8ClampedArray(256 * 256 * 4);

	        for (var i=0; i < data.length; i++) {
	            var terrain = convertInt(data[i]);

	            var new_elevation = terrain[0];
	            var new_slope = terrain[1];
	            var new_aspect = terrain[2];

	            var newColor = [];

	            // if no data, return transparent
	            if (new_elevation==127 && new_slope==127 && new_aspect ==511) { newColor = [0,0,0,0]; continue; }

	            // CUSTOM
	            if (overlayType == "custom") {

	                var showAspect = false;
	                if (customParams.aspect_low == 0 && customParams.aspect_high == 359) 
	                    showAspect = true;
	                else {
	                    if (customParams.aspect_low > customParams.aspect_high) {
	                        if (new_aspect >= customParams.aspect_low ||
	                            new_aspect <= customParams.aspect_high ) showAspect = true;
	                    }
	                    else if (new_aspect >= customParams.aspect_low &&
	                            new_aspect <= customParams.aspect_high ) showAspect = true;
	                }

	                var showElevation = (new_elevation >= customParams.elev_low && new_elevation <= customParams.elev_high);

	                var showSlope = (new_slope >= customParams.slope_low && new_slope <= customParams.slope_high);

	                if (showAspect && showElevation && showSlope) newColor = hexToRGB(customParams.color);
	            }

	            // ELEVATION
	            if (overlayType == "elevation") {
	                if (new_elevation > 0 && new_elevation > 0)
	                    //newColor = getColor(colorMapsProcessed.elevation, new_elevation);
	                    newColor = colorMapsProcessed.elevation[new_elevation];
	            }

	            // SLOPE
	            if (overlayType == "slope") {
	                if (new_slope > 0 && new_slope <= 80)
	                    //newColor = getColor(colorMapsProcessed.slope, new_slope);
	                    newColor = colorMapsProcessed.slope[new_slope];
	            }

	            // ASPECT
	            if (overlayType == "aspect") {
	                if (new_aspect > 0 && new_aspect <= 360)
	                    //newColor = getColor(colorMapsProcessed.aspect, new_aspect);
	                    newColor = colorMapsProcessed.aspect[new_aspect];
	            }

	            // MKS (aspect-slope)
	            // http://blogs.esri.com/esri/arcgis/2008/05/23/aspect-slope-map/
	            if (overlayType == "mks") {
	                var num = 0;

	                if (new_slope >= 40) num = 40;
	                else if (new_slope >= 20) num = 30;
	                else if (new_slope >= 5) num = 20;
	                else if (new_slope >= 0) num = 10;

	                if (new_aspect >= 0 && new_aspect <= 22.5) num+= 1;
	                else if (new_aspect > 22.5 && new_aspect <= 67.5) num+= 2;
	                else if (new_aspect > 67.5 && new_aspect <= 112.5) num+= 3;
	                else if (new_aspect > 112.5 && new_aspect <= 157.5) num+= 4;
	                else if (new_aspect > 157.5 && new_aspect <= 202.5) num+= 5;
	                else if (new_aspect > 202.5 && new_aspect <= 247.5) num+= 6;
	                else if (new_aspect > 247.5 && new_aspect <= 292.5) num+= 7;
	                else if (new_aspect > 292.5 && new_aspect <= 337.5) num+= 8;
	                else if (new_aspect > 337.5 && new_aspect <= 360) num+= 1;

	                if (num == 19) newColor = [153, 153, 153];
	                if (num == 21) newColor = [147, 166, 89];
	                if (num == 22) newColor = [102, 153, 102];
	                if (num == 23) newColor = [102, 153, 136];
	                if (num == 24) newColor = [89, 89, 166];
	                if (num == 25) newColor = [128, 108, 147];
	                if (num == 26) newColor = [166, 89, 89];
	                if (num == 27) newColor = [166, 134, 89];
	                if (num == 28) newColor = [166, 166, 89];
	                if (num == 31) newColor = [172, 217, 38];
	                if (num == 32) newColor = [77, 179, 77];
	                if (num == 33) newColor = [73, 182, 146];
	                if (num == 34) newColor = [51, 51, 204];
	                if (num == 35) newColor = [128, 89, 166];
	                if (num == 36) newColor = [217, 38, 38];
	                if (num == 37) newColor = [217, 142, 38];
	                if (num == 38) newColor = [217, 217, 38];
	                if (num == 41) newColor = [191, 255, 0];
	                if (num == 42) newColor = [51, 204, 51];
	                if (num == 43) newColor = [51, 204, 153];
	                if (num == 44) newColor = [26, 26, 230];
	                if (num == 45) newColor = [128, 51, 204];
	                if (num == 46) newColor = [255, 0, 0];
	                if (num == 47) newColor = [255, 149, 0];
	                if (num == 48) newColor = [255, 255, 0];
	            }

	            // ------------------------------------------------------

	            // if no alpha specified, default to fully opaque
	            if (newColor && newColor.length == 3) newColor[3] = 255;

	            // set pixels
	            if (newColor && newColor.length == 4) {
	                var _i = i * 4;
	                new_pixels[_i]   = newColor[0];
	                new_pixels[_i+1] = newColor[1];
	                new_pixels[_i+2] = newColor[2];
	                new_pixels[_i+3] = newColor[3];
	            }
	        }
	        return new_pixels;
	    }
	}

	});

/***/ },
/* 21 */
/***/ function(module, exports) {

	angular.module('avatech').directive('mapSearch', function($timeout, $log, $http, $q) {
	  return {
	    restrict: 'E',
	    scope: {
	      locationSelect: '&'
	    },
	    templateUrl: '/modules/map-search/map-search.html',

	    link: function(scope, elem, attr, ctrl) {
	      // $(elem).keydown(function(event) {
	      //    if (event.keyCode == 13) {
	      //       scope.onenter();
	      //       console.log("enter!");
	      //       return false;
	      //    }
	      // });
	    },

	    controller: function($scope, $timeout, $log, $http, $q) {

	        // -- map location search --

	        // simple lat/lng distance sorting
	        function geoSort(locations, pos) {
	          function dist(l) {
	            return (l.lat - pos.lat) * (l.lat - pos.lat) +
	              (l.lng - pos.lng) * (l.lng - pos.lng);
	          }
	          locations.sort(function(l1, l2) {
	            return dist(l1) - dist(l2);
	          });
	        }
	        function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	            var deg2rad = function(deg) {
	              return deg * (Math.PI/180)
	            }
	          var R = 6371; // Radius of the earth in km
	          var dLat = deg2rad(lat2-lat1);  // deg2rad below
	          var dLon = deg2rad(lon2-lon1); 
	          var a = 
	            Math.sin(dLat/2) * Math.sin(dLat/2) +
	            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	            Math.sin(dLon/2) * Math.sin(dLon/2)
	            ; 
	          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  //Math.asin(Math.sqrt(a))
	          var d = R * c; // Distance in km
	          return d;
	        }
	        var levDist = function(s, t) {
	            var d = []; //2d matrix

	            // Step 1
	            var n = s.length;
	            var m = t.length;

	            if (n == 0) return m;
	            if (m == 0) return n;

	            //Create an array of arrays in javascript (a descending loop is quicker)
	            for (var i = n; i >= 0; i--) d[i] = [];

	            // Step 2
	            for (var i = n; i >= 0; i--) d[i][0] = i;
	            for (var j = m; j >= 0; j--) d[0][j] = j;

	            // Step 3
	            for (var i = 1; i <= n; i++) {
	                var s_i = s.charAt(i - 1);

	                // Step 4
	                for (var j = 1; j <= m; j++) {

	                    //Check the jagged ld total so far
	                    if (i == j && d[i][j] > 4) return n;

	                    var t_j = t.charAt(j - 1);
	                    var cost = (s_i == t_j) ? 0 : 1; // Step 5

	                    //Calculate the minimum
	                    var mi = d[i - 1][j] + 1;
	                    var b = d[i][j - 1] + 1;
	                    var c = d[i - 1][j - 1] + cost;

	                    if (b < mi) mi = b;
	                    if (c < mi) mi = c;

	                    d[i][j] = mi; // Step 6

	                    //Damerau transposition
	                    if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
	                        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
	                    }
	                }
	            }

	            // Step 7
	            return d[n][m];
	        }

	        var abort;
	        var timer;
	        $scope.$watch('geo.query', function() {
	            // clear current results
	            $scope.geo.results = [];

	            if (abort) abort.abort();
	            if (timer) $timeout.cancel(timer);
	            timer = $timeout(function(){
	              $scope.geoSearch();
	            }, 300);
	        }, true);

	        $scope.geo = { query: '', results: [] }
	        $scope.geoSearch = function() {
	            $log.debug($scope.geo.query);

	            $scope.geo.query = $scope.geo.query.trim();
	            if ($scope.geo.query == "") return;
	            //codeAddress($scope.geo.geoQuery);

	            if ($scope.geo.query.length < 3) return;

	            $scope.searching = true;

	            //abort = $q.defer();
	            abort = $.getJSON("https://ba-secure.geonames.net/searchJSON?q=" + $scope.geo.query + "&countryBias=US&featureClass=A&featureClass=L&featureClass=P&featureClass=T&featureClass=V&featureClass=S&style=FULL&maxRows=20&username=avatech")
	            // .success(function(data, status, headers, config) {

	            // });
	            // $http({ method: 'GET', timeout: abort.promise, 
	            //     url: "https://ba-secure.geonames.net/searchJSON?q=" + $scope.geo.query + "&countryBias=US&featureClass=A&featureClass=L&featureClass=P&featureClass=T&featureClass=V&featureClass=S&style=FULL&maxRows=20&username=avatech" })
	            .success(function(data, status, headers, config) {

	            $scope.searching = false;
	            // geoSort(data.geonames, 40.633052, -111.5658795);

	            var states = {
	                // primary
	                "CO": 200,
	                "UT": 200,
	                "WA": 100,
	                "NV": 100,
	                "MT": 100,
	                "WY": 100,
	                "AK": 100,
	                "CA": 100,
	                "ID": 100,
	                "OR": 100,

	                // secondary
	                "NH": 50,
	                "ME": 50,
	                "NM": 30,
	                "VT": 20,
	                "NY": 20,

	                // mostly flat
	                "AZ": 10,
	                "MA": 10,
	                "MN": 10,
	                "NJ": 10,
	                "NC": 10,
	                "ND": 10,
	                "PA": 10,
	                "SD": 10,
	                "TN": 10,
	                "VA": 10,
	                "WV": 10,
	                "MI": 10,

	                // flat places
	                "NE": 0,
	                "AL": 0,
	                "AS": 0,
	                "AR": 0,
	                "CT": 0,
	                "DE": 0,
	                "DC": 0,
	                "FM": 0,
	                "FL": 0,
	                "GA": 0,
	                "GU": 0,
	                "HI": 0,
	                "IL": 0,
	                "IN": 0,
	                "IA": 0,
	                "PR": 0,
	                "RI": 0,
	                "SC": 0,
	                "PW": 0,
	                "MP": 0,
	                "MH": 0,
	                "KS": 0,
	                "MD": 0,
	                "OH": 0,
	                "OK": 0,
	                "VI": 0,
	                "MS": 0,
	                "MO": 0,
	                "TX": 0,
	                "WI": 0,
	                "KY": 0,
	                "LA": 0,
	            }

	            // remove
	            var exlcude = ['church','cemetery','mine(s)','tower','golf course','island','mall','museum','library'];
	            data.geonames = data.geonames.filter(function(a) {
	                var code = a.fcodeName;
	                $log.debug(a.countryCode);
	                if (exlcude.indexOf(code) == -1 && a.countryCode != undefined) return a;
	            });

	            // // sort by location weight
	            // for (var i = 0; i < data.geonames.length; i++) {
	            //     var result = data.geonames[i];
	            //     result.weight = states[result.adminCode1.trim().toUpperCase()];
	            //     if (result.weight == null) { console.log("NOT FOUND (" + result.adminCode1 + ")"); result.weight = 100; }
	            // }

	            //   data.geonames.sort(function(a,b) {
	            //     return b.weight - a.weight;
	            //   });
	            
	            // filter out only the "flat" areas
	              // data.geonames = data.geonames.filter(function(a) {
	              //   return a.weight > 0;
	              // });

	                // merge "neighbors"
	                var merged = [];
	                for (var i = 0; i < data.geonames.length; i++) {
	                    var neighbors = [];
	                    var result = data.geonames[i];
	                    // go through others
	                    (function() {
	                        for (var j = 0; j < data.geonames.length; j++) {
	                            var result2 = data.geonames[j];
	                            if (result2.merged) continue;
	                            //if (result == result2) continue;
	                            var distance = getDistanceFromLatLonInKm(
	                                parseFloat(result.lat),
	                                parseFloat(result.lng),
	                                parseFloat(result2.lat),
	                                parseFloat(result2.lng)
	                            );
	                            //console.log(distance);
	                            //console.log(result2.merged);
	                            if (distance < 2) {
	                                result.merged = true;
	                                result2.merged = true;
	                                neighbors.push(result2);
	                            }
	                        }
	                    })();

	                    //console.log(neighbors.length);
	                    if (neighbors.length != 0) merged.push(neighbors);
	                    //break;
	                }

	                // find the "best" of the merged
	                var finalResults = [];
	                for (var i = 0; i < merged.length; i++) {
	                    var _merged = merged[i];
	                    if (_merged.length == 1) { finalResults.push(_merged[0]); continue; }

	                    $log.debug("----------------------- " + i);
	                    // for (var m = 0; m < _merged.length; m++) {
	                    //     var result = _merged[m];
	                    //     var name = result.name.toLowerCase().trim();
	                    //     var query = $scope.geo.query.toLowerCase().trim();

	                    //     // if (name == query) result.quality = 3;
	                    //     // else if (name.indexOf(query) == 0) result.quality = 2;
	                    //     // else if (name.indexOf(query) != -1) result.quality = 1;
	                    //     // else result.quality = 0;

	                    //     //if (name == query) result.quality = 5;
	                    //     //else 
	                    //     result.quality = result.score;
	                    // }

	                    // sort by quality
	                    _merged.sort(function(a,b) { return b.score - a.score });

	                    for (var m = 0; m < _merged.length; m++) {
	                        var result = _merged[m];
	                        $log.debug(result.name + ": " + result.quality + " / " + result.score);
	                    }

	                    // pick first
	                    finalResults.push(_merged[0]);
	                }


	            // sort final results by quality
	            //finalResults.sort(function(a,b) { return b.score - a.score });

	              data.geonames = data.geonames.slice(0,6);
	              //finalResults = finalResults.slice(0,8);

	              $scope.geo.results = data.geonames;
	              $scope.$apply();
	            });
	        }
	        $scope.focusLocationSearchInput = function() {
	          $(".location-search-input").focus(function(){ this.select(); });
	          setTimeout(function(){ $(".location-search-input").focus() }, 100)
	        }
	        $scope.goTo = function(result) {
	          $scope.locationSelect({ location: { lat: parseFloat(result.lat), lng: parseFloat(result.lng) } });
	        }
	    }
	  }
	});

/***/ },
/* 22 */
/***/ function(module, exports) {

	angular.module('avatech').controller('NewObservationModalController', function ($scope, $stateParams, $location, $log, $timeout, $uibModalInstance, ob, Global, PublishModal, Observations) {

	    $scope.global = Global;

	    $scope.form_elements = {};

	    $scope.selectedTab = 'ob';

	    if (ob._id) $scope.model = angular.copy(ob);
	    else $scope.model = {
	        type: ob.type,
	        location: ob.location,
	        date: new Date(),
	        media: []
	    };

	    $scope.schemas = {};
	    $scope.forms = {};

	    $scope.schemas['avalanche'] = {
	        type: "object",
	        properties: {
	            avalancheType: {
	                title: "Avalanche type",
	                type: "string",
	                enum: ['L','WL','SS','HS','WS','G','I','SF','C','R','U'],
	            },
	            trigger: {
	                title: "Trigger",
	                type: "string",
	                enum: ['A','N','U'],
	            },
	            secondaryTriggers: {
	                title: "Secondary triggers",
	                type: "array",
	                items: { type: "string" },
	            },
	            selfTriggered: { title: "Self triggered", type: "boolean" },
	            sizeRelative: {
	                title: "Relative size",
	                type: "string",
	                enum: ['R1','R2','R3','R4','R5'],
	            },
	            sizeDestructive: {
	                title: "Relative size",
	                type: "string",
	                enum: ['D1','D2','D3','D4','D5'],
	            },
	            slabThickness: { title: "Slab Thickness", type: "number" },
	            slabWidth: { title: "Slab Width", type: "number" },
	            slabVertical: { title: "Slab Vertical", type: "number" },
	            peopleCaught: { title: "People Caught", type: "number" },
	            peopleInjured: { title: "People Injured", type: "number" },
	            peopleCarried: { title: "People Carried", type: "number" },
	            peopleBuriedPartially: { title: "People Buried Partially", type: "number" },
	            peopleBurriedFully: { title: "People Buried Fully", type: "number" },
	            peopleKilled: { title: "People Killed", type: "number" },
	        }
	    };
	    $scope.forms['avalanche'] = [
	        { key: "avalancheType",
	            titleMap: [
	              { "value": "L", "name": "Loose-snow avalanche" },
	              { "value": "WL", "name": "Wet loose-snow avalanche" },
	              { "value": "SS", "name": "Soft slab avalanche" },
	              { "value": "HS", "name": "Hard slab avalanche" },
	              { "value": "WS", "name": "Wet slab avalanche" },
	              { "value": "G", "name": "Glide avalanche" },
	              { "value": "I", "name": "Ice fall or avalanche" },
	              { "value": "SF", "name": "Slush flow" },
	              { "value": "C", "name": "Cornice fall (w/o avalanche)" },
	              { "value": "R", "name": "Roof avalanche" },
	              { "value": "U", "name": "Unkown" },
	            ]
	        },
	        { key: "trigger", type: "radiobuttons-nullable",
	            titleMap: [
	              { "value": "A", "name": "Artificial" },
	              { "value": "N", "name": "Natural" },
	              { "value": "U", "name": "Unkown" },
	            ]
	        },
	        { key: "secondaryTriggers", type: "avalanche-trigger-select", trigger: 'A', condition: "model.trigger == 'A'" },
	        { key: "secondaryTriggers", type: "avalanche-trigger-select", trigger: 'N', condition: "model.trigger == 'N'" },
	        { key: "selfTriggered", type: "radiobuttons-nullable" },
	        { key: "sizeRelative", type: "radiobuttons-nullable" },
	        { key: "sizeDestructive", type: "radiobuttons-nullable" },
	        { key: "slabThickness", type:"number", units: "cm" },
	        { key: "slabWidth", type:"number", units: "m" },
	        { key: "slabVertical", type:"number", units: "m" },
	        { key: "peopleCaught" },
	        { key: "peopleCarried" },
	        { key: "peopleBuriedPartially" },
	        { key: "peopleBurriedFully" },
	        { key: "peopleInjured" },
	        { key: "peopleKilled" },
	    ];
	    $scope.$watch('model.trigger',function(oldVal, newVal) {
	        if (oldVal != newVal && $scope.model.secondaryTriggers) 
	            $scope.model.secondaryTriggers = null;
	    }, true);


	    $scope.schemas['wind'] = {
	        type: "object",
	        properties: {
	            windLoading: {
	                title: "Wind Loading",
	                type: "string",
	                enum: ['CUR','PREV'],
	                //default: null
	            },
	            spatialExtent: {
	                title: "Spatial extent",
	                type: "string",
	                enum: ['LOC','WIDE'],
	                default: null
	            },
	            windVariability: {
	                title: "Wind variability",
	                type: "string",
	                enum: ['CON','VAR'],
	                default: null
	            },
	            windSpeedMeasured: {
	                title: "Wind speed measured",
	                type: "number",
	            },
	            windSpeedEstimated: {
	                title: "Wind speed estimated",
	                type: "string",
	                enum: ['C','L','M','S','X'],
	            },
	            windDirectionEstimated: {
	                title: "Wind direction estimated",
	                type: "number"
	            },
	            blowingSnowExtent: {
	                title: "Blowing snow extent",
	                type: "string",
	                enum: ['NONE','PREV', 'L', 'M', 'I', 'U']
	            },
	            blowingSnowDirection: {
	                title: "Blowing snow direction",
	                type: "number"
	            }
	      }
	    };
	    $scope.forms['wind'] = [
	        { key: "windLoading", type: "radiobuttons-nullable",
	            titleMap: [
	              { "value": "CUR", "name": "Current" },
	              { "value": "PREV", "name": "Previous" },
	            ] 
	        },
	        { key: "spatialExtent", type: "radiobuttons-nullable", condition: "model.windLoading",
	            titleMap: [
	              { "value": "LOC", "name": "Localized" },
	              { "value": "WIDE", "name": "Widespread" },
	            ]
	        },
	        { 
	            key: "windVariability", type: "radiobuttons-nullable",
	            titleMap: [
	              { "value": "CON", "name": "Consistent" },
	              { "value": "VAR", "name": "Variable" },
	            ]
	        },
	        { key: "windSpeedMeasured", type:"number", units: "m/s" },
	        { 
	            key: "windSpeedEstimated",
	            titleMap: [
	              { "value": "C", "name": "Calm" },
	              { "value": "L", "name": "Light" },
	              { "value": "M", "name": "Moderate" },
	              { "value": "S", "name": "Strong" },
	              { "value": "X", "name": "Extreme" }
	            ]
	        },
	        { key: "windDirectionEstimated", type: "direction-select" },
	        { key: "blowingSnowExtent",
	            titleMap: [
	              { "value": "NONE", "name": "None" },
	              { "value": "PREV", "name": "Previous" },
	              { "value": "L", "name": "Light" },
	              { "value": "M", "name": "Moderate" },
	              { "value": "I", "name": "Intense" },
	              { "value": "U", "name": "Unkown" }
	            ]
	        },
	        { 
	            key: "blowingSnowDirection", 
	            type: "direction-select", 
	            condition: "['L', 'M', 'I', 'U'].indexOf(model.blowingSnowExtent) != -1"
	        }
	    ];

	    $scope.schemas['snowpack-test'] = {
	        type: "object",
	        properties: { 
	            name: {
	                title: "Test Type",
	                type: "string",
	                enum: ['ECT','CT','RB','SB','STE','DPT','PST','HTE','SVT'],
	                default: 'ECT'
	            },
	            score: {
	                title: "Score",
	                type: "string",
	                enum: [
	                    'ECTPV','ECTP','ECTN','ECTX',
	                    'CTV','CT','CTN',
	                    'RB1','RB2','RB3','RB4','RB5','RB6','RB7',
	                    'SBV','SB10','SB20','SB30','SB40','SB50','SB60','SB70','SBN',
	                    'STC','STV','STE','STM','STH','STN',
	                    'DTV','DT','DTN',
	                    'End','SF','Arr'
	                ]
	            },
	            result: {
	                title: "Result",
	                type: "string",
	                enum: ['E','M','H']
	            },
	            weakLayerDepth: { title: "Depth", type: "number", },
	            shear: {
	                title: "Shear quality",
	                type: "string",
	                enum: ['Q1','Q2','Q3']
	            },
	            fractureCharacter: {
	                title: "Fracture character",
	                type: "string",
	                enum: ['SP','SC','PC','RP','BRK']
	            },
	            nbTaps: { title: "# of taps", type: "number", },
	            sawCutLength: { title: "Saw cut length", type: "number", },
	            isolatedColumnLength: { title: "Isolated column length", type: "number", },
	            criticalGrainForm: { title: "Critical grain form", type: "string" },
	            criticalGrainSizeMin: { title: "Critical grain size min", type: "number" },
	            criticalGrainSizeMax: { title: "Critical grain size max", type: "number" },
	        }
	    };

	        // when to show 'depth'
	        var depthScores = 
	         ['ECTPV','ECTP','ECTN',
	         'CTV','CT',
	         'RB1','RB2','RB3','RB4','RB5','RB6',
	         'SBV','SB10','SB20','SB30','SB40','SB50','SB60','SB70',
	         'STC','STV','STE','STM','STH',
	         'DTV','DT',
	         'End','SF','Arr'];
	         $scope.showDepth = function(model) {
	            if (model.name == 'HTE' || model.name == 'SVT') return true;
	            if (depthScores.indexOf(model.score) > -1) return true
	            return false;
	         }

	        // when to show 'shear' and 'fracture character'
	        var shearScores = 
	        ['ECTPV','ECTP',
	         'CTV','CT',
	         'RB1','RB2','RB3','RB4','RB5','RB6',
	         'SBV','SB10','SB20','SB30','SB40','SB50','SB60','SB70',
	         'STC','STV','STE','STM','STH',
	         'DTV','DT'];
	         $scope.showShear = function(model) {
	            if (model.name == 'HTE' || model.name == 'SVT') return true;
	            if (shearScores.indexOf(model.score) > -1) return true
	            return false;
	         }

	         // when to show '# of taps'
	         $scope.tapScores = ['ECTP','ECTN','CT','DT'] 

	    $scope.forms['snowpack-test'] = [
	        { key: "name",
	            titleMap: [
	              { "value": "ECT", "name": "Extended Column" },
	              { "value": "CT", "name": "Compression" },
	              { "value": "RB", "name": "Rutschblock" },
	              { "value": "SB", "name": "Stuffblock" },
	              { "value": "STE", "name": "Shovel Shear" },
	              { "value": "DPT", "name": "Deep Tap" },
	              { "value": "PST", "name": "Propgation Saw" },
	              { "value": "HTE", "name": "Hand Shear" },
	              { "value": "SVT", "name": "Shovel Tilt" }
	            ]
	        },

	        //-----------

	        { key: "score", condition: "model.name == 'ECT'", titleMap: [
	              { "value": "ECTPV", "name": "ECTPV" },
	              { "value": "ECTP", "name": "ECTP" },
	              { "value": "ECTN", "name": "ECTN" },
	              { "value": "ECTX", "name": "ECTX" },
	            ]
	        },
	        { key: "score", condition: "model.name == 'CT'", titleMap: [
	              { "value": "CTV", "name": "CTV" },
	              { "value": "CT", "name": "CT" },
	              { "value": "CTN", "name": "CTN" },
	            ]
	        },
	        { key: "score", condition: "model.name == 'RB'", titleMap: [
	              { "value": "RB1", "name": "RB1" },
	              { "value": "RB2", "name": "RB2" },
	              { "value": "RB3", "name": "RB3" },
	              { "value": "RB4", "name": "RB4" },
	              { "value": "RB5", "name": "RB5" },
	              { "value": "RB6", "name": "RB6" },
	              { "value": "RB7", "name": "RB7" }
	            ]
	        },
	        { key: "score", condition: "model.name == 'SB'", titleMap: [
	              { "value": "SBV", "name": "SBV" },
	              { "value": "SB10", "name": "SB10" },
	              { "value": "SB20", "name": "SB20" },
	              { "value": "SB30", "name": "SB30" },
	              { "value": "SB40", "name": "SB40" },
	              { "value": "SB50", "name": "SB50" },
	              { "value": "SB60", "name": "SB60" },
	              { "value": "SB70", "name": "SB70" },
	              { "value": "SBN", "name": "SBN" }
	            ]
	        },
	        { key: "score", condition: "model.name == 'STE'", titleMap: [
	              { "value": "STC", "name": "STC" },
	              { "value": "STV", "name": "STV" },
	              { "value": "STE", "name": "STE" },
	              { "value": "STM", "name": "STM" },
	              { "value": "STH", "name": "STH" },
	              { "value": "STN", "name": "STN" },
	            ]
	        },
	        { key: "score", condition: "model.name == 'DPT'", titleMap: [
	              { "value": "DTV", "name": "DTV" },
	              { "value": "DT", "name": "DT" },
	              { "value": "DTN", "name": "DTN" },
	            ]
	        },
	        { key: "score", title: "Result", condition: "model.name == 'PST'", titleMap: [
	              { "value": "End", "name": "End" },
	              { "value": "SF", "name": "SF" },
	              { "value": "Arr", "name": "Arr" },
	            ]
	        },
	        { key: "result", condition: "model.name == 'HTE' || model.name == 'SVT'", titleMap: [
	              { "value": "E", "name": "Easy" },
	              { "value": "M", "name": "Moderate" },
	              { "value": "H", "name": "Hard" },
	            ]
	        },

	        //-----------

	        { key: "weakLayerDepth", type:"number", units: "cm", condition: "showDepth(model)" },
	        { key: "nbTaps", condition: "tapScores.indexOf(model.score) > -1" },

	        { key: "shear", type: "radiobuttons-nullable", condition: "model.name != 'PST'", condition: "showShear(model)" },
	        { key: "fractureCharacter", condition: "model.name != 'PST'", condition: "showShear(model)",
	            titleMap: [
	              { "value": "SP", "name": "SP - Sudden Planar" },
	              { "value": "SC", "name": "SC - Sudden Collapse" },
	              { "value": "PC", "name": "PC - Progressive Compression" },
	              { "value": "RP", "name": "RP - Resistent Planar" },
	              { "value": "BRK", "name": "BRK - Non-planar Break" },
	            ]
	        },
	        { key: "sawCutLength", type:"number", units: "cm", condition: "model.name == 'PST'" },
	        { key: "isolatedColumnLength", type:"number", units: "cm", condition: "model.name == 'PST'" },

	        { key: "criticalGrainForm", type: "grainTypeSelect", condition: "showDepth(model)" },
	        { key: "criticalGrainSizeMin", type:"number", units: "mm", condition: "showDepth(model)" },
	        { key: "criticalGrainSizeMax", type:"number", units: "mm", condition: "showDepth(model)" },
	    ];

	    $scope.$watch('model.name',function(oldVal, newVal) {
	        $scope.model.score = null;
	    }, true);


	    $scope.schemas['snowpack'] = {
	        type: "object",
	        properties: {
	            snowQuality: {
	                title: "Snow quality",
	                type: "string",
	                enum: ['POW','CRUD', 'CRUST', 'HARD', 'SLUSH', 'SPRING']
	            },
	            cracking: {
	                title: "Cracking",
	                type: "boolean",
	                default: null
	            },
	            whumpfing: {
	                title: "Whumpfing",
	                type: "boolean",
	                default: null
	            },
	            footPenetration: { title: "Foot penetration", type: "number" },
	            skiPenetration: { title: "Ski penetration", type: "number" },
	            snowPackDepthEstimate: { title: "Snowpack depth estimate", type: "number" },
	            newSnowDepthEstimate: { title: "New snow estimate", type: "number" },
	            surfaceGrainForm: { title: "Surface grain form", type: "string" },
	            surfaceGrainSizeMin: { title: "Surface grain size min", type: "number" },
	            surfaceGrainSizeMax: { title: "Surface grain size max", type: "number" },
	            surfaceTemperature: { title: "Surface Temperature", type: "number" },
	            twentyCMTemperature: { title: "20cm Temperature", type: "number" },
	      }
	    };
	    $scope.forms['snowpack'] = [
	        { key: "snowQuality",
	            titleMap: [
	              { "value": "POW", "name": "Powder" },
	              { "value": "CRUD", "name": "Crud" },
	              { "value": "CRUST", "name": "Crusty" },
	              { "value": "HARD", "name": "Hard" },
	              { "value": "SLUSH", "name": "Slushy" },
	              { "value": "SPRING", "name": "Spring Snow" }
	            ]
	        },
	        { key: "cracking", type: "radiobuttons-nullable" },
	        { key: "whumpfing", type: "radiobuttons-nullable" },
	        { key: "snowPackDepthEstimate", type:"number", units: "cm"  },
	        { key: "newSnowDepthEstimate", type:"number", units: "cm" },
	        { key: "footPenetration", type:"number", units: "cm" },
	        { key: "skiPenetration", type:"number", units: "cm" },
	        { key: "surfaceGrainForm", type: "grainTypeSelect" },
	        { key: "surfaceGrainSizeMin", type:"number", units: "mm" },
	        { key: "surfaceGrainSizeMax", type:"number", units: "mm" },
	        { key: "surfaceTemperature", type:"number", units: "°C" },
	        { key: "twentyCMTemperature", type:"number", units: "°C" },
	    ];

	    $scope.schemas['weather'] = {
	        type: "object",
	        properties: {
	            precipitationType: {
	                title: "Precipitation Type",
	                type: "string",
	                enum: ['NO','RA','SN','RS','GR','ZR']
	            },
	            precipitationRate: {
	                title: "Precipitation Rate",
	                type: "string",
	                enum: ['S-1','S1','S2','S5','S10']
	            },
	            skyCondition: {
	                title: "Sky Condition",
	                type: "string",
	                enum: ['CLR','FEW','SCT','BKN','OVC','X']
	            },
	            maxTemperature: { title: "Max. Temperature", type: "number" },
	            minTemperature: { title: "Min. Temperature", type: "number" },
	            presentTemperature: { title: "Current Temperature", type: "number" },
	            thermographTemperature: { title: "Thermograph Temperature", type: "number" },
	            thermographTrend: {
	                title: "Thermograph Trend",
	                type: "string",
	                enum: ['RR','R','S','F','FR']
	            },
	            relativeHumidity: { title: "Relative Humidity", type: "number" },
	            barometricPressure: { title: "Barometric Pressure", type: "number" },
	            pressureTrend: {
	                title: "Pressure Trend",
	                type: "string",
	                enum: ['RR','R','S','F','FR']
	            },
	        }
	      };

	    $scope.forms['weather'] = [
	        { key: "precipitationType",
	            titleMap: [
	              { "value": "NO", "name": "No Precipitation" },
	              { "value": "RA", "name": "Rain" },
	              { "value": "SN", "name": "Snow" },
	              { "value": "RS", "name": "Mixed Rain & Snow" },
	              { "value": "GR", "name": "Graupel & Hail" },
	              { "value": "ZR", "name": "Freezing Rain" }
	            ]
	        },
	        { key: "precipitationRate",
	            titleMap: [
	              { "value": "CLR", "name": "Very Light" },
	              { "value": "FEW", "name": "Light" },
	              { "value": "SCT", "name": "Moderate" },
	              { "value": "BKN", "name": "Heavy" },
	              { "value": "OVC", "name": "Very Heavy" }
	            ]
	        },
	        { key: "skyCondition",
	            titleMap: [
	              { "value": "CLR", "name": "Clear" },
	              { "value": "FEW", "name": "Few" },
	              { "value": "SCT", "name": "Scattered" },
	              { "value": "BKN", "name": "Broken" },
	              { "value": "OVC", "name": "Overcast" },
	              { "value": "X", "name": "Obscured" }
	            ]
	        },
	        { key: "maxTemperature", type:"number", units: "°C"  },
	        { key: "minTemperature", type:"number", units: "°C"  },
	        { key: "presentTemperature", type:"number", units: "°C"  },
	        { key: "thermographTemperature", type:"number", units: "°C" },
	        //{ key: "thermographTrend", type: "trend-select" },
	        { key: "thermographTrend",
	            titleMap: [
	              { "value": "RR", "name": "RR - Rising Rapidly" },
	              { "value": "R", "name": "R - Rain" },
	              { "value": "S", "name": "S - Steady" },
	              { "value": "F", "name": "F - Falling" },
	              { "value": "FR", "name": "FR - Falling Rapidly" }
	            ]
	        },
	        { key: "relativeHumidity", type:"number", units: "%" },
	        { key: "barometricPressure", type:"number", units: "mb" },
	        { key: "pressureTrend", 
	            titleMap: [
	              { "value": "RR", "name": "RR - Rising Rapidly" },
	              { "value": "R", "name": "R - Rain" },
	              { "value": "S", "name": "S - Steady" },
	              { "value": "F", "name": "F - Falling" },
	              { "value": "FR", "name": "FR - Falling Rapidly" }
	            ]
	        },
	    ];

	    // ----------------------------------------------------------

	    // add global fields

	    angular.forEach($scope.schemas, function(schema) {
	        schema.properties.date = {
	            type: "string",
	            format: "date",
	            title: "Date & Time Observed",
	            required: true,
	        };
	        schema.properties.slope = {
	            title: "Slope",
	            type: "number"
	        };
	        schema.properties.aspect = {
	            title: "Aspect",
	            type: "number"
	        }
	        schema.properties.elevation = {
	            title: "Elevation",
	            type: "number"
	        }
	        schema.properties.location = {
	            title: "Location",
	            type: "object"
	        }
	        schema.properties.locationName = {
	            title: "Location name",
	            type: "string"
	        }
	    });

	    angular.forEach($scope.forms, function(form) {

	        form.unshift(
	            { key: "date", type: "datepicker" }, 
	            { key: "location", type: "location-select" },
	            { key: "locationName" },
	            { key: "slope", type: "number", units: "°" }, 
	            { key: "aspect", type: "direction-select" }, 
	            { key: "elevation", type: "number", units: "m" }
	        );

	        // add subit button
	        form.push({ type: "submit", title: "Submit" });

	        // set global form fields
	        for (var i = 0; i < form.length; i++) {
	            //form[i].fieldHtmlClass = "input-sm";
	            form[i].disableSuccessState = true;
	        }
	    });

	    // -----------------------------------------------------

	    $scope.submit = function() {
	        // todo: not angular-y (Peter: if you ever see this, I have some 'splaining to do...)
	        $timeout(function() { $('[name="form_elements.obsForm"] input[type="submit"]').click(); });
	    }
	    $scope.onSubmit = function(form) {

	        if (!$scope.model.location) return alert("Please select a location.");

	        $scope.$broadcast('schemaFormValidate');

	        $log.debug("is valid? " + $scope.form_elements.obsForm.$valid);
	        $log.debug($scope.model);

	        if ($scope.form_elements.obsForm.$valid) {
	            PublishModal.open({ 
	                initialSharing: angular.copy($scope.model)
	            })
	            .then(function (sharing) {
	                angular.extend($scope.model, sharing);
	                $scope.model.published = true;
	                Observations.save(angular.copy($scope.model), function(ob) {
	                   
	                    var redirectUrl = '/obs/' + ob._id;
	                    if (redirectUrl == $location.path()) $uibModalInstance.close(ob);
	                    else $location.path(redirectUrl);

	                });
	            });
	        }
	    }

	    $scope.close = function () {
	        $uibModalInstance.dismiss();
	    };
	    // $scope.select = function () {
	    //     $uibModalInstance.close();
	    // };

	    // media

	    $scope.deletePhoto = function(index) {
	        if (index == 0) $scope.model.media.shift();
	        else $scope.model.media.splice(index,1);
	    }
	    $scope.onFileAdd = function(file) {
	        if ($scope.uploading == null) $scope.uploading = [];
	        file.uploading = true;
	        $scope.uploading.unshift(file);
	        $scope.$apply();
	    }
	    $scope.onFileProgress = function(file) {
	        $scope.$apply();
	    }
	    $scope.onFileUpload = function(file) {
	        if ($scope.model.media == null) $scope.model.media = [];
	        file.uploading = false;
	        file.caption = file.name;
	        file.type = "photo";
	        file.URL = file.url;
	        delete file.url;
	        $scope.model.media.unshift(file);
	        $scope.$apply();
	        //console.log($scope.obs);
	    };

	    $scope.showPhoto = function(index) {
	       // Lightbox.openModal($scope.model.media, index);
	    }

	});

/***/ },
/* 23 */
/***/ function(module, exports) {

	angular.module('avatech').controller('ObservationPreviewController',
	    function ($scope, $rootScope, $location, $uibModal, $state, $log, $stateParams, snowpitExport, snowpitViews, Global, $http, Lightbox, ngAudio, Confirm, Observations) {

	        $rootScope.$broadcast('resizeMap');

	        $scope.global = Global;

	        $scope.formatters = snowpitExport.formatters;

	        $scope.discussMode = false;

	        $scope.close = function () {
	            $rootScope.$broadcast('resizeMap');
	            $state.go('^');
	        };

	        $scope.go = function(url) {
	            $location.path(url);
	        }

	        $scope.edit = function(type) {
	            $uibModal.open({
	                templateUrl: "/modules/observations/new.html",
	                controller: "NewObservationModalController",
	                backdrop: 'static',
	                windowClass: 'width-480',
	                resolve: {
	                  ob: function() { return $scope.observation; }
	                }
	            }).result.then(function(ob) {
	                console.log("obesrvation");
	                console.log(ob);
	                $scope.observation = ob;
	            });
	        }

	        $scope.showMedia = function(media) {
	            // clear audio
	            var non_audio_media = [];
	            angular.forEach($scope.observation.media, function(m){
	                if (m.type == "photo" || m.type == "video")
	                    non_audio_media.push(m);
	            });
	            // get index
	            var index = non_audio_media.indexOf(media);

	            // show media
	            if (media.type == "photo" || media.type == "video") {
	                Lightbox.openModal(non_audio_media, index);
	            }
	            else if (media.type == "audio") {
	                // if already loaded, toggle pause/play
	                if ($scope.audio && $scope.audio.id == media.URL) {
	                    if ($scope.audio.paused) $scope.audio.play();
	                    else $scope.audio.pause();
	                }
	                // load and play
	                else {
	                    $scope.audio = ngAudio.load(media.URL);
	                    $scope.audio.play();
	                }
	            }
	        }

	        $scope.getThumbnailURL = function(media) {
	            // http://cloudinary.com/documentation/image_transformations
	            if (media.type == "photo") {
	                url = media.URL;
	                if (url.indexOf("cloudinary.com") > -1) {
	                    var filename = media.URL.substr(media.URL.indexOf("upload/") + 7);
	                    filename = filename.substring(filename.indexOf("/") + 1, filename.indexOf("."));
	                    url = "http://res.cloudinary.com/avatech/image/upload/w_300/" + filename + ".jpg";
	                }
	                return url;
	            }
	            // http://cloudinary.com/documentation/video_manipulation_and_delivery#generating_video_thumbnails
	            else if (media.type == "video") {
	                var filename = media.URL.substr(media.URL.indexOf("upload/") + 7);
	                filename = filename.substring(filename.indexOf("/") + 1, filename.indexOf("."));
	                var url = "http://res.cloudinary.com/avatech/video/upload/so_50p/" + filename + ".jpg";
	                return url;
	            }
	        }

	        $scope.delete = function() {
	            Confirm.open("Are you sure you want to delete this observation? This will also delete it from your Avanet mobile apps.").then(function() {
	                Observations.remove($scope.observation);
	                $scope.close();
	            });
	        }

	        // ------------------------------------------------------------------------------------------
	        // AVALANCHE

	        $scope.avalancheTypes = {
	            "": "",
	            "U": "Unkown",
	            "L": "Loose-snow avalanche",
	            "WL": "Wet loose-snow avalanche",
	            "SS": "Soft slab avalanche",
	            "HS": "Hard slab avalanche",
	            "WS": "Wet slab avalanche",
	            "I": "Ice fall or avalanche",
	            "SF": "Slush flow",
	            "C": "Cornice fall",
	            "R": "Roof avalanche"
	        };
	        $scope.avalancheTriggers = {
	            "N": "Natural or Spontaneous",
	            "A": "Artificial",
	            "U": "Unkown",
	        };
	        $scope.artificialTriggers = {
	            "Explosive": [
	                { code: "AA", name: "Artillery" },
	                { code: "AE", name: "Explosive thrown or placed on or under snow surface by hand" },
	                { code: "AL", name: "Avalauncher" },
	                { code: "AB", name: "Explosive detonated above snow surface (air blast)" },
	                { code: "AC", name: "Cornice fall triggered by human or explosive action" },
	                { code: "AX", name: "Gas exploder" },
	                { code: "AH", name: "Explosives placed via helicopter" },
	                { code: "AP", name: "Pre-placed, remotely detonated explosive charge" }
	            ],
	            "Vehicle": [
	                { code: "AM", name: "Snowmobile" },
	                { code: "AK", name: "Snowcat" },
	                { code: "AV", name: "Other Vehicle" } //specify
	            ],
	            "Human": [
	                { code: "AS", name: "Skier" },
	                { code: "AR", name: "Snowboarder" },
	                { code: "AI", name: "Snowshoer" },
	                { code: "AF", name: "Foot penetration" },
	                //{ code: "AC", name: "Cornice fall produced by human or explosive action" }
	            ],
	            "Miscellaneous": [
	                { code: "AW", name: "Wildlife" },
	                { code: "AU", name: "Unknown artificial trigger" },
	                { code: "AO", name: "Unclassified artificial trigger" } //specify
	            ]
	        };
	        $scope.naturalTriggers = [
	            { code: "N", name: "Natural trigger" },
	            { code: "NC", name: "Cornice fall" },
	            { code: "NE", name: "Earthquake" },
	            { code: "NI", name: "Ice fall" },
	            { code: "NL", name: "Avalanche triggered by loose snow avalanche" },
	            { code: "NS", name: "Avalanche triggered by slab avalanche" },
	            { code: "NR", name: "Rock fall" },
	            { code: "NO", name: "Unclassified natural trigger" } // specify
	        ];

	        $scope.getTriggerNames = function(triggerCodes) {
	            var names = "";
	            if (!triggerCodes || !triggerCodes.length) return "";

	            for(var i = 0; i < triggerCodes.length; i++) {
	                var _name = $scope.getTriggerName(triggerCodes[i]);
	                if (_name) names += _name + ", ";
	            }
	            if (names.length > 2) names = names.substring(0,names.length-2);

	            return names;
	        }

	        $scope.getTriggerName = function(triggerCode) {
	            if (!$scope.observation.trigger) return "";
	            var name = "";
	            if ($scope.observation.trigger == 'A') {
	                angular.forEach($scope.artificialTriggers,function(triggers, triggerCategory){
	                    angular.forEach(triggers, function(trigger){
	                        if (trigger.code == triggerCode) return name = triggerCategory + ": " + trigger.name;
	                    });
	                });
	            }
	            else if ($scope.observation.trigger == 'N') {
	                angular.forEach($scope.naturalTriggers,function(trigger){
	                    if (trigger.code == triggerCode) return name = trigger.name;
	                });
	            }
	            return name;
	        }


	        // ------------------------------------------------------------------------------------------
	        // SNOWPIT

	        // snowpit views
	        $scope.views = snowpitViews;
	        $scope.setView = function(view) {
	            // calculate views
	            angular.forEach($scope.views,function(view){ if (view.func) view.func($scope.observation); });
	            // set view
	            $scope.settings.view = view;
	        }
	        $scope.getView = function() {
	            var _view = null;
	            angular.forEach($scope.views, function(view){ if (view.id == $scope.settings.view) _view = view; });
	            return _view;
	        }

	        // snowpit canvas settings
	        $scope.graphWidth = 200;
	        $scope.columns = [
	            { width: 125 },
	            { width: 25 },
	            { width: $scope.graphWidth },
	            { width: 150 }
	        ];
	        $scope.snowpitWidth = $scope.columns.reduce(function(a,b){ return { width: a.width + b.width}; }).width;
	        $scope.snowpitHeight = 550;
	        $scope.canvasOptions = { labelColor: "#222", commentLineColor: "#aaa", dashedLineColor: "#ddd", showDepth: true, showDensity: true, 
	            drawGrainSize: false,
	            drawWaterContent: false, 
	            drawSurfaceLabel: false
	        };
	        $scope.settings = {
	            selectedLayer: null,
	            dragging: null,
	            hoverDragLayer: null,
	            view: null,
	            depthDescending: true,
	            tempMode: false,
	            tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
	        }

	        $scope.exportPDF = function() { snowpitExport.PDF($scope.observation, $scope.settings); };
	        $scope.exportJPEG = function() { snowpitExport.JPEG($scope.observation, $scope.settings); };
	        $scope.exportCSV = function() { snowpitExport.CSV($scope.observation); };

	        // --------------------------------------------------------------------------------
	        // SP PROFILES

	        // detail level
	        $scope.detailLevel = $scope.global.user.settings.graphDetailLevel;
	        if ($scope.detailLevel == null) $scope.detailLevel = 1;

	        $scope.toggleDetail = function() {
	            $scope.detailLevel++;
	            if ($scope.detailLevel == 6) $scope.detailLevel = 1;
	            // save to user settings
	            $scope.global.setUserSetting("graphDetailLevel", $scope.detailLevel);
	        }

	        // --------------------------------------------------------------------------------
	        
	        // "SCHEMA"

	        var schema = {
	        "observation_wind": [
	            ["windLoading", "Wind loading", {
	                "PREV": "Previous",
	                "CUR": "Current"
	                }],
	            ["windVariability", "Wind variability",{
	                "CON":"Consistent",
	                "VAR":"Variable"
	                }],
	            ["spatialExtent", "Spatial extent",{
	                "LOC":"Localized",
	                "WIDE":"Widespread"
	                }],
	            ["windSpeedEstimated", "Wind speed estimated",{
	                "C":"Calm",
	                "L":"Light",
	                "M":"Moderate",
	                "S":"Strong",
	                "X":"Extreme",
	                }],
	            ["windSpeedMeasured", "Wind speed measured", "windSpeed"],
	            ["windDirectionEstimated", "Wind direction estimated", "direction"], 
	            ["blowingSnowDirection", "Blowing snow direction", "direction"],
	            ["blowingSnowExtent", "Blowing snow extent",{
	                "NONE": "NONE",
	                "PREV": "PREV",
	                "L": "Light",
	                "M": "Moderate",
	                "I": "Intense",
	                "U": "Unkown"
	                }]
	          ],
	          "observation_weather": [
	            ["precipitationRate", "Precip. rate",{
	                "S-1":"S-1/RV VERY LIGHT",
	                "S1":"S1/RL LIGHT",
	                "S2":"S2/RM MODERATE",
	                "S5":"S5/RH HEAVY",
	                "S10":"S10 VERY HEAVY"
	                }],
	            ["precipitationType", "Precip. type",{
	                "NO":"NONE",
	                "RA":"RAIN",
	                "SN":"SNOW",
	                "RS":"RAIN & SNOW",
	                "GR":"HAIL",
	                "ZR":"FREEZING RAIN",
	                }],
	            ["skyCondition", "Sky condition",{
	                "CLR":"CLEAR",
	                "FEW":"FEW",
	                "SCT":"SCATTERED",
	                "BKN":"BROKEN",
	                "OVC":"OVERCAST",
	                "X":"OBSCURED"
	                }],
	            ["barometricPressure", "Barometric pressure", "mb"],
	            ["pressureTrend", "Pressure trend",{
	                "RR":"RISING RAPIDLY",
	                "R":"RISING",
	                "S":"STEADY",
	                "F":"FALLING",
	                "FR":"FALLING RAPIDLY"
	                }],
	            ["maxTemperature", "Max temp.", "temp"],
	            ["minTemperature", "Min temp.", "temp"],
	            ["presentTemperature", "Present temp.", "temp"],
	            ["relativeHumidity", "Relative humidity", "percent"],
	            ["thermographTemperature", "Thermograph temp.", "temp"],
	            ["thermographTrend", "Thermograph trend",{
	                "RR":"RISING RAPIDLY",
	                "R":"RISING",
	                "S":"STEADY",
	                "F":"FALLING",
	                "FR":"FALLING RAPIDLY"
	                }]
	          ],
	          "observation_snowpack-test": [
	            ["name", "Test Type",{
	                "ECT":"EXTENDED COLUMN",
	                "CT":"COMPRESSION",
	                "RB":"RUTSCHBLOCK",
	                "SB":"STUFFBLOCK",
	                "STE":"SHOVEL SHEAR",
	                "DPT":"DEEP TAP",
	                "PST":"PROPAGATION SAW",
	                "HTE":"HAND SHEAR",
	                "SVT":"SHOVEL TILT"
	                }],
	            ["score", "Score"],
	            ["result", "Result",{
	                "E":"Easy",
	                "M":"Moderate",
	                "H":"Hard",
	                }],
	            ["shear", "Shear quality"],
	            ["fractureCharacter", "Fracture character",{
	                "SP":"Sudden planar",
	                "SC":"Sudden collapse",
	                "RP":"Resistant planar",
	                "PC":"Progressive Compression",
	                "BRK":"Break",
	                }],
	            ["nbTaps", "Number of taps"],
	            ["isolatedColumnLength", "Isolated column length", "cm"],
	            ["sawCutLength", "Saw cut length", "cm"],
	            ["weakLayerDepth", "Weak layer depth", "cm"],
	            ["criticalGrainForm", "Critical grain type","grainType"],
	            ["criticalGrainSizeMax", "Critical grain size (max)", "mm"],
	            ["criticalGrainSizeMin", "Critical grain size (min)", "mm"],
	          ],
	          "observation_snowpack": [
	            ["snowQuality", "Snow quality",{
	                "POW":"POWDER",
	                "CRUD":"CRUD",
	                "CRUST":"CRUSTY",
	                "HARD":"HARD",
	                "SLUSH": "SLUSHY",
	                "SPRING":"SPRING SNOW"
	                }],
	            ["surfaceGrainForm", "Surface grain type", "grainType"],
	            ["cracking", "Cracking","bool"],
	            ["whumpfing", "Whumpfing","bool"],
	            ["footPenetration", "Foot pen.", "cm"],
	            ["skiPenetration", "Ski pen.", "cm"],
	            ["snowPackDepthEstimate", "Snowpack depth estimate", "cm"],
	            ["newSnowDepthEstimate", "New snow depth estimate", "cm"],
	            ["surfaceGrainSizeMax", "Surface grain size (max)", "mm"],
	            ["surfaceGrainSizeMin", "Surface grain size (min)", "mm"],
	            ["surfaceTemperature", "Surface temp.", "temp"],
	            ["twentyCMTemperature", "20 cm. temp.", "temp"]
	          ]}

	          $scope.getTable = function(ob) {
	            if (!ob) return [];
	            var table = [];
	            var items = schema["observation_" + ob.type];
	            if (items) {

	                for (var i = 0; i < items.length; i++) {
	                    var key = items[i][0];
	                    var desc = items[i][1];
	                    var dataType = items[i][2];

	                    var val = ob[key];
	                    if (val !== null && val !== undefined) {
	                        // if enum
	                        if (dataType !== null && typeof dataType === 'object') {
	                            var enumVal = dataType[val];
	                            if (enumVal) val = enumVal;
	                        }
	                        // if bool
	                        else if (dataType == "bool") {
	                            if (val === true) val = "Yes";
	                            if (val === false) val = "No";
	                        }
	                        // temp
	                        else if (dataType == "temp") {
	                            val = $scope.formatters.formatTemp(val);
	                        }
	                        // direction
	                        else if (dataType == "direction") {
	                            val = $scope.formatters.formatDirection(val);
	                        }
	                        // cm
	                        else if (dataType == "cm") {
	                            val = $scope.formatters.formatCmOrIn(val);
	                        }
	                        // percent
	                        else if (dataType == "percent") {
	                            val = parseInt(val) + "%";
	                        }
	                        // millibars (barometric pressure)
	                        else if (dataType == "mb") {
	                            val = parseInt(val) + " mb";
	                        }
	                        // mm (for grain size at the moment, no conversion to imperial needed)
	                        else if (dataType == "mm") {
	                            val = parseFloat(val).toFixed(1) + " mm";
	                        }
	                        // wind speed (m/s and mi/h)
	                        else if (dataType == "windSpeed") {
	                            val = $scope.formatters.formatWindSpeed(val);
	                        }
	                        // grain type
	                        else if (dataType == "grainType") {
	                            val = $scope.formatters.formatGrainType(val);
	                        }

	                        table.push({ key: key, description: desc, value: val });
	                    }
	                }

	            }
	            return table;
	          }

	        // load observation

	        if ($stateParams.observationId) {
	            $scope.profileId = $stateParams.observationId;
	            $http.get(window.apiBaseUrl + "observations/" + $stateParams.observationId)
	            .then(function(res) {

	                var ob = res.data;
	                    
	                // broadcast so map can show location
	                $rootScope.$broadcast('observationLoaded', ob);

	                $scope.table = $scope.getTable(ob);

	                if ($scope.observation == "snowpit") {
	                    $scope.observation = angular.copy(ob);
	                    $scope.$apply();
	                }
	                // all other observation types
	                else {
	                    $scope.observation = ob;
	                }

	            });
	        }
	    }
	);

/***/ },
/* 24 */
/***/ function(module, exports) {

	angular.module('avatech').controller('OrganizationsController', function ($scope, $q, $log, $stateParams, $location, $timeout, Global, Restangular) { 
	    $scope.global = Global;

	    $scope.newOrg = {};

	    $scope.selectedTab = null;

	    $scope.userIsAdmin = function() {
	        var isAdmin = false;

	        // if user is Avanet admin, also can admin group
	        if ($scope.global.user.admin) return true;

	        angular.forEach($scope.members, function(member) {
	            if (member.admin && member.user._id == $scope.global.user._id) {
	                isAdmin = true; return;
	            }
	        });
	        return isAdmin;
	    }
	    $scope.userIsMember = function() {
	        var isMember = false;

	        angular.forEach($scope.members, function(member) {
	            if (member.user._id == $scope.global.user._id) {
	                isMember = true; return;
	            }
	        });
	        return isMember;
	    }

	    $scope.create = function() {
	        $log.debug($scope.newOrgForm.$valid);
	        if (!$scope.newOrgForm.$valid) return;
	        $log.debug($scope.newOrgForm);

	        Restangular.all('orgs').post($scope.newOrg).then(function(newOrg) {
	            $location.path('orgs/' + newOrg._id);
	            if (!Global.orgs.length) Global.orgs = [];
	            Global.orgs.push({ name: newOrg.name, _id: newOrg._id });
	        }, 
	        // error
	        function(response) {
	            alert(response.data.message);
	        });
	    }
	    $scope.members = [];
	    $scope.students = [];

	    $scope.loadOrg = function() { 
	        var RestObject = Restangular.one('orgs', $stateParams.orgId);
	        RestObject.get().then(function (org) {
	            $scope.org = org;

	            //org.name += " Test";
	            //org.save();
	        });

	        RestObject.getList('members').then(function (members) {
	            $scope.members = [];
	            $scope.students = [];
	            angular.forEach(members, function(member) {
	                if (member.student) $scope.students.push(member);
	                else $scope.members.push(member);
	            });
	        });
	    };

	    $scope.setMemberAdmin = function(member, admin) {
	        //var RestObject = Restangular.one('orgs', $stateParams.orgId).one('members');
	        member.admin = admin;
	        member.save();
	    }
	    $scope.removeMember = function(member, index) {
	        member.remove();
	        $scope.members.splice(index, 1);
	    }
	    $scope.removeStudent = function(member, index) {
	        member.remove();
	        $scope.students.splice(index, 1);
	    }
	    function addMember(userIdOrEmail) {
	        Restangular.one('orgs', $stateParams.orgId).all('members')
	        .post({ userIdOrEmail: userIdOrEmail })
	        // success
	        .then(function (member) {
	            // add new member to  collection
	            $scope.members.push(member);
	            //$scope.$apply();
	        }
	        // error
	        , function(){
	            $log.debug(member);
	        });
	    }
	    $scope.addMember = function(user) {
	        if (user.isMember) return;
	        addMember(user._id);
	    }
	    $scope.inviteEmail = function() {
	        if (!$scope.search.email) return;
	        addMember($scope.search.email);
	    }

	    $scope.allowMemberRemove = function(member) {
	        if (member.admin && member.user._id == $scope.global.user._id) return false;
	        else return true;
	    }
	    $scope.isOnlyAdmin = function(member) {
	        var adminCount = 0;
	        angular.forEach($scope.members,function(m){ if (m.admin) adminCount++; });
	        return (adminCount == 1 && member.admin);
	    }

	    // user search

	    $scope.newSearch = function() {
	        $scope.search = { query: "" };
	        //$scope.focus('focusSearch');
	    }
	    $scope.doSearch = function() {
	        $timeout.cancel($scope.search.timer);
	        $scope.abortSearch = false;
	        if ($scope.search.query == "" || $scope.search.query.length < 3) {
	            $scope.search.results = null;
	            $scope.abortSearch = true;
	            return;
	        }
	        $scope.search.timer = $timeout(function(){
	            $scope.search.searching = true;

	            Restangular.all("users").getList({ query: $scope.search.query }).then(function(users) {
	                $scope.search.searching = false;

	                if (users.length == 0) {
	                    if ($scope.search.query.indexOf('@') > -1 && validateEmail($scope.search.query)) $scope.search.email =  $scope.search.query;
	                    else $scope.search.email = null;
	                }

	                // detect if already members
	                for (var r = 0; r < users.length; r++) {
	                    var user = users[r];
	                    for (var i = 0; i < $scope.members.length; i ++) {
	                        if ($scope.members[i].user._id == user._id) {
	                            user.isMember = true;
	                            break;
	                        }
	                    }
	                    if (user.isMember == null) user.isMember = false;
	                }

	                if (!$scope.abortSearch) $scope.search.results = users;
	            });            

	        },400);
	    }
	    function validateEmail(email) { 
	        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	        return re.test(email);
	    } 

	    $scope.onLogoUpload = function(file) {
	        $scope.org.logoUrl = file.url;
	        $scope.org.save();
	        $scope.refreshOrg();
	    }
	    $scope.removeLogo = function(file) {
	        $scope.org.logoUrl = null;
	        $scope.org.save();
	        $scope.refreshOrg();
	    }

	    $scope.refreshOrg = function() {
	        for(var i = 0; i < $scope.global.orgs.length; i++) {
	            if ($scope.global.orgs[i]._id == $scope.org._id) $scope.global.orgs[i] = $scope.org;
	        }
	    }

	});

/***/ },
/* 25 */
/***/ function(module, exports) {

	angular.module('avatech').factory('PublishModal', function ($uibModal) {
	    return { open: function(options) {

	        if (!options.initialSharing) options.initialSharing = null;
	        
	         var modalInstance = $uibModal.open({
	            templateUrl: '/modules/publish-modal/modal.html',
	            controller: 'PublishModalController',
	            windowClass: 'width-400',
	            //backdrop: 'static',
	            resolve: {
	                initialSharing: function () {
	                    return options.initialSharing;
	                }
	            }
	        });

	        return modalInstance.result;

	    }
	}
	});

	angular.module('avatech').controller('PublishModalController', [ '$scope','$uibModalInstance', 'initialSharing', '$timeout', 'Global', 'Restangular', 
	    function ($scope, $uibModalInstance, initialSharing, $timeout, Global, Restangular) {

	        $scope.global = Global;

	        $scope.sharing = {
	            published: true,
	            organization: null,
	            sharingLevel: "public",
	            shareWithAvyCenter: true,
	            shareWithStudents: true,
	            sharedOrganizations: []
	        }

	        if (initialSharing) {
	            if (initialSharing.published  != null) $scope.sharing.published = initialSharing.published;
	            if (initialSharing.organization  != null) $scope.sharing.organization = initialSharing.organization;
	            if (initialSharing.sharingLevel  != null) $scope.sharing.sharingLevel = initialSharing.sharingLevel;
	            if (initialSharing.shareWithAvyCenter != null) $scope.sharing.shareWithAvyCenter = initialSharing.shareWithAvyCenter;
	            if (initialSharing.shareWithStudents != null) $scope.sharing.shareWithStudents = initialSharing.shareWithStudents;
	            if (initialSharing.sharedOrganizations  != null) $scope.sharing.sharedOrganizations = initialSharing.sharedOrganizations;
	        }

	        $scope.close = function () {
	            $uibModalInstance.dismiss();
	        };
	        $scope.publish = function () {
	            // if student
	            if ($scope.global.user.userType.indexOf("pro") == -1) {
	                $scope.sharing.published = true;
	                $scope.sharing.organization = null;
	                $scope.sharing.sharingLevel = "public";
	                $scope.sharing.shareWithAvyCenter = true;
	                $scope.sharing.shareWithStudents = true;
	                $scope.sharing.sharedOrganizations = [];
	                $uibModalInstance.close($scope.sharing);
	            }
	            // if regular user
	            else {
	                // if org sharing level selected, make sure user has selected orgs
	                if ($scope.sharing.sharingLevel == 'org' && $scope.sharing.sharedOrganizations.length == 0)
	                    alert("Please add an organization to share with.")
	                else
	                    $uibModalInstance.close($scope.sharing);
	            }
	        };

	        // search

	        $scope.newSearch = function() {
	            $scope.search = { query: "" };
	        }
	        $scope.doSearch = function() {
	            $timeout.cancel($scope.search.timer);
	            $scope.abortSearch = false;
	            if ($scope.search.query == "" || $scope.search.query.length < 3) {
	                $scope.search.results = null;
	                $scope.abortSearch = true;
	                return;
	            }
	            $scope.search.timer = $timeout(function(){
	                $scope.search.searching = true;

	                Restangular.all("orgs").getList({ query: $scope.search.query }).then(function(orgs) {
	                    $scope.search.searching = false;
	                    if (!$scope.abortSearch) $scope.search.results = orgs;
	                });            

	            },400);
	        }
	        $scope.addOrg = function(org) {
	            if (!$scope.isSelected(org._id))
	                $scope.sharing.sharedOrganizations.push({ _id: org._id, name: org.name, type: org.type });
	        }
	        $scope.selectAllOrgs = function() {
	            angular.forEach($scope.global.orgs,function(org){
	                if (!$scope.isSelected(org._id))
	                    $scope.sharing.sharedOrganizations.push({ _id: org._id, name: org.name, type: org.type });
	            });
	        }
	        $scope.isSelected = function(orgId) {
	            var isSelected = false;
	            angular.forEach($scope.sharing.sharedOrganizations,function(org) {
	                if (orgId == org._id) isSelected = true;
	            });
	            return isSelected;
	        }
	        $scope.removeOrg = function(org) {
	            var index = $scope.sharing.sharedOrganizations.indexOf(org);
	            $scope.sharing.sharedOrganizations.splice(index, 1);    
	        }
	    }
	]);

/***/ },
/* 26 */
/***/ function(module, exports) {

	angular.module('avatech').factory('RegisterDeviceModal', function ($uibModal) {
	        return { open: function(options) {

	            var modalInstance = $uibModal.open({
	                templateUrl: '/modules/register-device-modal/modal.html',
	                controller: 'RegisterDeviceModalController',
	                backdrop: 'static',
	                windowClass: 'width-400'
	            });

	            return modalInstance.result;

	        }
	    }
	});

	angular.module('avatech').controller('RegisterDeviceModalController',
	    function ($scope, $uibModalInstance, $timeout, $http, Global, Restangular) {

	        $scope.global = Global;

	        $scope.serial = { number: "" };

	        $scope.close = function () {
	            $uibModalInstance.dismiss();
	        };
	        $scope.register = function () {

	            $scope.checking = true;

	            $scope.serial.number = $scope.serial.number.toUpperCase();

	            if (!$scope.serial.number || $scope.serial.number == "") {
	                alert("Please enter your SP serial number.");
	                $scope.checking = false; return;
	            }
	            else if ($scope.serial.number.length != 14) {
	                alert("Your SP serial number must be 14 digits - please make sure you entered it correctly.");
	                $scope.checking = false; return;
	            }
	            else if ($scope.serial.number.indexOf("SP") != 0) {
	                alert('Your SP serial number must begin with "SP"');
	                $scope.checking = false; return;
	            }

	            Restangular.one('devices', $scope.serial.number).customPOST({}, 'register')
	            // success
	            .then(function(data) {
	                $scope.registering = true;
	                $timeout(function(){
	                    $scope.registering = false;
	                    $scope.registered = true;
	                }, 2000);
	            },
	            // error
	            function(response) {
	                alert(response.data.message);
	            })
	            // always
	            .finally(function(){
	                $scope.checking = false;
	            });
	        };
	    }
	);

/***/ },
/* 27 */
/***/ function(module, exports) {

	angular.module('avatech').directive('profileEditor', ['$timeout','snowpitConstants', function($timeout, snowpitConstants) {
	  return {
	    restrict: 'A',
	    scope: { 
	        profile: '=profileEditor', 
	        settings: '=',
	        columns: '=',
	        options: '=',

	        profileLayers: '=?clientLayers',
	        clientComments: '=?clientComments'
	    },
	    link: function(scope, element) {

	 		function isPointInPoly(poly, pt){
	            for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
	                ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
	                && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
	                && (c = !c);
	            return c;
	        }
	        function findTotalOffset(obj) {
			  var ol = ot = 0;
			  if (obj.offsetParent) {
			    do {
			      ol += obj.offsetLeft;
			      ot += obj.offsetTop;
			    }while (obj = obj.offsetParent);
			  }
			  return {left : ol, top : ot};
			}
	        function fixEvent(ev) {
			    if(typeof ev.offsetX === "undefined" || typeof ev.offsetY === "undefined") {
				    var targetOffset = findTotalOffset(ev.target);
				    ev.offsetX = ev.pageX - targetOffset.left;
				    ev.offsetY = ev.pageY - targetOffset.top;
				  }    
				  return ev;
			}
	        function getRelativeCoords(event) {
	        	// fix event for not-so-old versions of FF
	        	var _event = fixEvent(event);
	            var pixelRatio = 1;
	            if (event.offsetX !== undefined && event.offsetY !== undefined) { return [ event.offsetX * pixelRatio, event.offsetY  * pixelRatio]; }
	            return [event.layerX * pixelRatio, event.layerY * pixelRatio];
	        }
	        function wrapTextLines(context, text, maxWidth) {
	            var words = text.split(' ');
	            var style = "100 10.2px 'roboto condensed'";
	            for (i = 0; i < words.length; i++) {
	                var word = words[i];
	                if (word.indexOf('[b]') == 0) {
	                    word = word.substr(3);
	                    style = "700 10.2px 'roboto condensed'";
	                }
	                if (word.length >= 4 && word.indexOf('[/b]') == word.length - 4) {
	                    word = word.substring(0, word.length - 4);
	                    var nextStyle = "100 10.2px 'roboto condensed'";
	                }
	                words[i] = { word: word, style: style };
	                style = nextStyle;
	            }

	            var lines = [];
	            var currentLine = [];
	            var lineWidth = 0;
	         
	            for (i = 0; i < words.length; i++) {
	                var word = words[i];
	                context.font = word.style;
	                var metrics = context.measureText(word.word + ' ');
	                if (Math.ceil(lineWidth + metrics.width) <= maxWidth) {
	                    currentLine.push(word);
	                    lineWidth += metrics.width;
	                }
	                else {
	                    lines.push(currentLine);
	                    currentLine = [word];
	                    lineWidth = metrics.width;
	                }
	            }      
	            lines.push(currentLine);
	            return lines;
	        }
	        function wrapText(context, text, x, y, maxWidth, lineHeight) {
	            var lines = wrapTextLines(context, text, maxWidth);
	            for (var i = 0; i < lines.length; i ++) {
	                var line = lines[i];
	                fillText(context, line, x, y);
	                y += lineHeight;
	            } 
	        }
	        function fillText(context, wordArray, x, y) {
	            for (var i = 0; i < wordArray.length; i++) {
	                var word = wordArray[i];
	                context.font = word.style;
	                context.fillText(word.word + ' ', x, y);
	                var metrics = context.measureText(word.word + ' ');
	                x += metrics.width;
	            }
	        }

	        // select layer on click
	        element.bind('mousedown',function(event) {
	        	if (scope.settings.tempMode) return;
	            var point = getRelativeCoords(event);

	            angular.forEach(scope._sideLayers,function(layer, index) {
	                if(isPointInPoly(layer,point)) {
	                    scope.settings.selectedLayer = scope.profile.layers[index];
	                    scope.$apply();
	                    return;
	                }
	            });
	            angular.forEach(scope._layers,function(layer, index) {
	                if(isPointInPoly(layer,point)) {
	                    scope.settings.selectedLayer = scope.profile.layers[index];
	                    scope.$apply();
	                    return;
	                }
	            });
	        })

	        // element.bind('mousemove', function(event) {
	        //     var point = getRelativeCoords(event);

	        //     angular.forEach(scope.layers,function(layer, index) {
	        //         if(isPointInPoly(layer,point)) {
	        //             angular.forEach(scope.profile.layers, function(_layer, _index) {
	        //                 _layer.hover = (index == _index);
	        //             });
	        //             scope.render();
	        //         }
	        //     });
	        // });

	        // using '$watch' allows the canvas to be redrawn when bound vars change
	        scope.$watch('profile', function() { 
	            scope.render(); 
	        }, true);
	        scope.$watch('settings', function() { 
	            scope.render(); 
	        }, true);

	        var canvas = element[0];
	        var scale = window.devicePixelRatio;
	        var context = canvas.getContext('2d');
			
	        var centerText = function(context, text, width, x, y) {
	            var w = context.measureText(text).width;
	            context.fillText(text, x + ((width - w) / 2), y);
	        };

	        scope.getGrainType = function(grainType) {
	            if (!grainType) return;
	            for (var i = 0; i < snowpitConstants.grainTypes.length;i++){
	                for (var j = 0; j < snowpitConstants.grainTypes[i].types.length; j++) {
	                    if (snowpitConstants.grainTypes[i].types[j].icssg == grainType) {
	                        return snowpitConstants.grainTypes[i].types[j];
	                    }
	                }
	            }
	        }

	        var first = true;
	        scope.render = function() {

	            var options = scope.options;
	            var columns = angular.copy(scope.columns);

	            if (!options) options = {};
	            if (!options.background) options.background = "rgba(255,255,255,0)";
	            if (!options.labelColor) options.labelColor = "#000";
	            if (!options.commentLineColor) options.commentLineColor = "#666";
	            if (!options.dashedLineColor) options.dashedLineColor = "#ddd";
	            if (options.print == null) options.print = false;
	            if (options.showDepth == null) options.showDepth = true;
	            if (options.showDensity == null) options.showDensity = true;
	            if (options.drawGrainSize == null) options.drawGrainSize = true;
	            if (options.drawWaterContent == null) options.drawWaterContent = true;
	            if (options.drawSurfaceLabel == null) options.drawSurfaceLabel = true;

	            // only call once
	            if (options.scale) scale = options.scale; // 4
	            if (first) {
	                if (scale > 1) {
	                    canvas.width *= scale;
	                    canvas.height *= scale;
	                    context.scale(scale,scale);
	                }
	                else {
	                    context.translate(0.5, 0.5);
	                }
	                first = false;
	            }
	            // reset global alpha
	            context.globalAlpha = 1;

	            // scaling

	            var drawColumn = function(context, index, drawFunc) {
	                context.save();

	                var widthOnLeft = 0;
	                var thisColumn = columns[index];
	                if (!thisColumn) return drawFunc(null);

	                for(var i = 0; i < columns.length; i++) {
	                    if (i == index) break;
	                    widthOnLeft += columns[i].width;
	                }
	                thisColumn.offsetLeft = widthOnLeft;
	                context.translate(widthOnLeft, 0);
	                drawFunc(thisColumn);
	                context.restore();
	            }
	            var drawColumns = function(context, index, count, drawFunc) {
	                context.save();

	                var widthOnLeft = 0;
	                var thisColumn = columns[index];
	                if (!thisColumn) return drawFunc(null);

	                for(var i = 0; i < columns.length; i++) {
	                    if (i == index) break;
	                    widthOnLeft += columns[i].width;
	                }
	                var newColumn = { width: 0};
	                for (var i = index; i < index + count; i++) {
	                    newColumn.width += columns[i].width;
	                }
	                newColumn.offsetLeft = widthOnLeft;

	                context.translate(widthOnLeft, 0);
	                drawFunc(newColumn);
	                context.restore();
	            }

	            // clear canvas
	            context.clearRect(0, 0, canvas.width, canvas.height);
	            // canvas background 
	            context.fillStyle = options.background;
	            context.fillRect(0, 0, canvas.width, canvas.height);
	            context.fill();

	            var surfaceLayerHeight = 40;
	            var paddingLeft = 50;
	            var paddingTop = 35 + surfaceLayerHeight;
	            var paddingBottom = 20;

	            var graphHeight = Math.round(canvas.height / scale - paddingBottom - paddingTop);

	            var hardness = snowpitConstants.hardness;

	            if (!scope.profile) return;

	            // keep track of layer position so they can be interacted with
	            scope._layers = [];
	            scope._sideLayers = [];

	            // combine stability tests and layer comments into one array
	            var allComments = angular.copy(scope.profile.tests);
	            angular.forEach(scope.profile.layers,function(layer) {
	                if (layer.tests) allComments.push({ depth: (scope.profile.depth - layer.depth - layer.height), comment: layer.tests });
	            });

	            // "merge" comments at same depth
	            var comments = [];
	            var commentsObj = {};
	            var index = 0;

	            angular.forEach(allComments,function(comment){
	                if (comment) {
	                    if (comment.depth == null) comment.depth = -1;
	                    var obj = commentsObj[comment.depth+""];
	                    if (!obj) commentsObj[comment.depth+""] = { depth: comment.depth, comments: [] };
	                    comment.index = index;
	                    commentsObj[comment.depth+""].comments.push(comment);
	                    index++;
	                }
	            });
	            angular.forEach(commentsObj,function(comment) { comments.push(comment); });
	            comments.sort(function(a, b){return a.depth-b.depth});

	            // draw stability tests and comments
	            drawColumn(context,0,function(column) {

	                if (scope.settings.tempMode && !options.print) context.globalAlpha = .3;

	                var connectorWidth = 14;
	                var itemWidth = column.width - connectorWidth - 8;
	                var itemHeight = 11;
	                var itemPadding = 5;
	                var commentPadding = 12;

	                // 1. CALCULATE

	                // calculate client height/depth
	                angular.forEach(comments,function(comment){
	                    // calculate number of lines
	                    var _itemHeight = 0;
	                    for (var c = 0; c < comment.comments.length; c++) {
	                        var _comment = comment.comments[c];

	                        // test/comment text

	                        var text = _comment.comment;

	                        if (_comment.type == 'ECT') {
	                            text = "[b]" + _comment.ECT.score;
	                            if (_comment.ECT.score == 'ECTP' || _comment.ECT.score == 'ECTN') text += _comment.ECT.taps;
	                            text+= " ";
	                            if (_comment.ECT.shear) text += _comment.ECT.shear + " ";
	                            if (_comment.ECT.fracture) text += _comment.ECT.fracture + " ";
	                            text+="[/b] ";
	                            if (_comment.comment && _comment.comment != "") text += "" + _comment.comment + "";
	                        }
	                        else if (_comment.type == 'CT') {
	                            text = "[b]" + _comment.CT.score;
	                            if (_comment.CT.score == 'CT') text += _comment.CT.taps;
	                            text+= " ";
	                            if (_comment.CT.shear) text += _comment.CT.shear + " ";
	                            if (_comment.CT.fracture) text += _comment.CT.fracture + " ";
	                            text+="[/b] ";
	                            if (_comment.comment && _comment.comment != "") text += "" + _comment.comment + "";
	                        }
	                        else if (_comment.type == 'RB') {
	                            text = "[b]" + _comment.RB.score + " ";
	                            if (_comment.RB.shear) text += _comment.RB.shear + " ";
	                            if (_comment.RB.fracture) text += _comment.RB.fracture + " ";
	                            text+="[/b] ";
	                            if (_comment.comment && _comment.comment != "") text += "" + _comment.comment + "";
	                        }
	                        else if (_comment.type == 'SB') {
	                            text = "[b]" + _comment.SB.score + " ";
	                            if (_comment.SB.shear) text += _comment.SB.shear + " ";
	                            if (_comment.SB.fracture) text += _comment.SB.fracture + " ";
	                            text+="[/b] ";
	                            if (_comment.comment && _comment.comment != "") text += "" + _comment.comment + "";
	                        }
	                        else if (_comment.type == 'ST') {
	                            text = "[b]" + _comment.ST.score + " ";
	                            if (_comment.ST.shear) text += _comment.ST.shear + " ";
	                            if (_comment.ST.fracture) text += _comment.ST.fracture + " ";
	                            text+="[/b] ";
	                            if (_comment.comment && _comment.comment != "") text += "" + _comment.comment + "";
	                        }
	                        else if (_comment.type == 'DT') {
	                            text = "[b]" + _comment.DT.score;
	                            if (_comment.DT.score == 'DT') text += _comment.DT.taps;
	                            text+= " ";
	                            if (_comment.DT.shear) text += _comment.DT.shear + " ";
	                            if (_comment.DT.fracture) text += _comment.DT.fracture + " ";
	                            text+="[/b] ";
	                            if (_comment.comment && _comment.comment != "") text += "" + _comment.comment + "";
	                        }
	                        else if (_comment.type == 'PST') {
	                            text = "[b]PST ";
	                            if (_comment.PST.lengthSawCut && _comment.PST.lengthColumn) {
	                                text += _comment.PST.lengthSawCut + "/" + _comment.PST.lengthColumn + " ";
	                            }
	                            text += "(" + _comment.PST.score + ") ";
	                            text+="[/b] ";
	                            if (_comment.comment && _comment.comment != "") text += "" + _comment.comment + "";
	                        }
	                        _comment.text = text;

	                        var _numberOfLines = 1;
	                        _numberOfLines = wrapTextLines(context, text, itemWidth).length;
	                        var subCommentHeight = _numberOfLines * itemHeight;
	                        // keep track of client height
	                        _comment.clientHeight = subCommentHeight;
	                        // add subcomment height to comment height
	                        _itemHeight += subCommentHeight;
	                    };

	                    // add item padding
	                    _itemHeight += itemPadding * comment.comments.length;
	                    _itemHeight -= 2;

	                    var clientDepth = graphHeight - Math.round(((scope.profile.depth - comment.depth) * (graphHeight / scope.profile.depth)));

	                    comment.depthGraph = clientDepth;
	                    comment.depthClient = clientDepth;
	                    comment.heightClient = _itemHeight;
	                });

	                // if last comment is over the bottom edge, pull it up
	                var lastComment = comments[comments.length - 1];
	                if (lastComment) {
	                    var dif = (lastComment.depthClient + lastComment.heightClient) - graphHeight;
	                    if (dif > 0) {
	                        lastComment.depthClient -= dif + 3;
	                    }
	                }

	                for (var x = 0; x < comments.length; x++) {
	                    for (var i = 0; i < comments.length; i++) {
	                        var comment = comments[i];
	                        var nextComment = (comments.length == i ? null : comments[i+1]);
	                        if (nextComment) {
	                            var dif = (comment.depthClient + comment.heightClient + commentPadding) - nextComment.depthClient;
	                            if (dif > 0) comment.depthClient -= dif;
	                        }
	                    }
	                }

	                // topmost comment must always remain at top
	                angular.forEach(comments, function(comment) {
	                    if (comment.depth == -1) comment.depthClient = -surfaceLayerHeight - 6;
	                    if (comment.depth == 0) comment.depthClient = 0;
	                });

	                for (var i = 0; i < comments.length; i++) {
	                    var comment = comments[i];
	                    var nextComment = (comments.length == i ? null : comments[i+1]);
	                    if (nextComment) {
	                        var dif = (comment.depthClient + comment.heightClient + commentPadding) - nextComment.depthClient;
	                        if (dif > 0) nextComment.depthClient += dif;
	                    }
	                }

	                // 2. DRAW
	                scope.clientComments = angular.copy(allComments);
	                scope.profileLayers = angular.copy(scope.profile.layers);

	                var lastComment;
	                angular.forEach(comments,function(comment){

	                    // side layer lines
	                    var depth1 = parseInt(comment.depthGraph + paddingTop);
	                    var depth2 = parseInt(comment.depthClient + paddingTop);

	                    context.beginPath();
	                    context.strokeStyle = options.commentLineColor; 
	                    // if hovering on comment
	                    if (scope.settings.hoverComment && 
	                        scope.settings.hoverComment.depth == comment.depth) {
	                        context.strokeStyle = "#333";
	                    }

	                    if (comment.depth != -1) {
	                        var stub = 12;
	                        // alter stub size based on proximity of comment depth to graph depth
	                        var dif = comment.depthClient - comment.depthGraph;
	                        if (dif != 0) stub = stub - Math.pow(Math.abs(dif), 1 / 2);
	                        //if (dif != 0) stub = stub - Math.round(dif / 5);
	                        if (stub < 0) stub = 0;

	                        context.moveTo(column.width, depth1);
	                        context.lineTo(column.width, depth1);
	                        context.lineTo(column.width - stub, depth1);
	                        context.lineTo(column.width - connectorWidth, depth2);
	                        context.lineTo(2, depth2);
	                    }

	                    // draw depth lines
	                    context.lineTo(2, depth2 + comment.heightClient + 4);
	                    context.stroke();
	                    context.closePath();     

	                    var runningDepth = 9;
	                    angular.forEach(comment.comments,function(_comment, index){
	                        var depth = depth2 + runningDepth + itemPadding;
	                        runningDepth += _comment.clientHeight + itemPadding;

	                        // draw text
	                        context.fillStyle = options.labelColor;
	                        wrapText(context, _comment.text, 7, depth, itemWidth, itemHeight);

	                        // keep track of client depth
	                        angular.forEach(scope.clientComments,function(comment){
	                            if (comment && comment.depth != null && comment.index == _comment.index)
	                                comment.clientDepth = depth;
	                        });

	                    });
	                });
	            });

	            // draw graph background
	            drawColumns(context, 1, 2, function(column) {
	                context.fillStyle = "#fff";
	                context.beginPath();
	                context.fillRect(0, paddingTop - surfaceLayerHeight, column.width, graphHeight + surfaceLayerHeight);
	                context.fill();
	                context.closePath();
	            });

	            // draw layer background tick lines
	            drawColumn(context,2,function(column){

	                // tick lines
	                angular.forEach(['I','K','P','1F','4F','F'],function(type) {
	                    context.lineWidth = 1;
	                    context.strokeStyle = "#e5e5e5";
	                    if (options.print) context.strokeStyle = '#d5d5d5';
	                    context.beginPath();

	                    var w = column.width - Math.round(column.width * hardness[type].width);
	                    context.moveTo(w, paddingTop);
	                    context.lineTo(w, paddingTop + graphHeight);
	                    context.stroke();
	                });
	                // angular.forEach(['I-','K+','K-','P+','P-','1F+','1F-','4F+','4F-','F+'],function(type) {
	                //     context.lineWidth = 1;
	                //     context.strokeStyle = "#f9f9f9";
	                //     if (options.print) context.strokeStyle = '#f0f0f0';
	                //     context.beginPath();

	                //     var w = column.width - Math.round(column.width * hardness[type].width);
	                //     context.moveTo(w, paddingTop);
	                //     context.lineTo(w, paddingTop + graphHeight);
	                //     context.stroke();
	                // });
	                context.closePath();

	                // hardness axis labels
	                context.fillStyle = options.labelColor;
	                context.font = "11.5px 'roboto condensed'";
	                angular.forEach(['I','K','P','1F','4F','F'],function(type) {
	                    var x = column.width - Math.round(column.width * hardness[type].width) - 5;
	                    var textWidth = context.measureText(type).width
	                    context.fillText(type, x + ((10 - textWidth) / 2) + 1, graphHeight + paddingTop + 13); //62 = top
	                });
	            });

	            // draw stability test lines on density & layers columns
	            drawColumns(context, 1, 2, function(column) {

	                if (scope.settings.tempMode && !options.print) context.globalAlpha = .1;

	                // note depth dotted lines

	                context.moveTo(0,0);
	                context.lineWidth = 1;
	                angular.forEach(comments,function(comment){

	                    context.beginPath();
	                    context.strokeStyle = options.dashedLineColor;

	                    // todo: setLineDash doesn't work in older versions of FF
	                    if (context.setLineDash) context.setLineDash([3,3])

	                    // if hovering on comment
	                    if (scope.settings.hoverComment && 
	                        scope.settings.hoverComment.depth == comment.depth) {
	                        context.strokeStyle = "#333";
	                        context.setLineDash([]);
	                    }


	                    var commentDepth = parseInt(comment.depthGraph + paddingTop);

	                    if (comment.depth != -1) {
	                        context.moveTo(0, commentDepth);
	                        context.lineTo(column.width, commentDepth);
	                        context.stroke();
	                    }
	                    context.closePath();
	                });
	                if (context.setLineDash) context.setLineDash([]);
	            });

	            // draw density
	            drawColumn(context,1,function(column){

	                if (scope.settings.tempMode && !options.print) context.globalAlpha = .2;

	                // only show density if specified
	                if (options.showDensity) {
	                    angular.forEach(scope.profile.density,function(density){
	                        var depth = graphHeight - Math.round(((scope.profile.depth - density.depth) / scope.profile.depth) * graphHeight) + paddingTop + 5;
	                        context.fillStyle = options.labelColor;
	                        context.font = "10.5px 'roboto condensed'";
	                        centerText(context, density.density, column.width,  0, depth);
	                    });
	                }

	                // top label: density (only show if at least one density)
	                if (scope.profile.density && scope.profile.density.length > 0) {
	                    context.fillStyle = options.labelColor;
	                    context.font = "10px 'roboto condensed'";
	                    centerText(context, "\u03C1", column.width + 1.5, 0, 21);
	                    centerText(context, "kg/m\u00B3", column.width + 1,  0, 31);
	                }
	            });
	    
	            // draw surface layer background
	            drawColumns(context, 1, 2, function(column) {
	                context.fillStyle = "#fff";
	                context.fillRect(0, paddingTop - surfaceLayerHeight, column.width, surfaceLayerHeight);


	                // hatching background

	                // first mask the area
	                context.save();
	                context.beginPath();
	                context.rect(0, paddingTop - surfaceLayerHeight, column.width, surfaceLayerHeight);
	                context.closePath();
	                context.clip();

	                var spacing = 6;
	                context.lineWidth = "1";
	                context.strokeStyle = "rgba(0,0,0,.08)";
	                for (var i = -20; i < 100; i++){
	                    context.beginPath();
	                    context.moveTo(i * spacing,paddingTop);
	                    context.lineTo((i * spacing) + surfaceLayerHeight,paddingTop - surfaceLayerHeight);
	                    context.stroke();
	                    context.closePath();
	                }
	                // restore from mask
	                context.restore();
	            });

	            // draw layers
	            drawColumn(context,2,function(column){

	                // draw layers
	                var prevDepth = paddingTop;
	                angular.forEach(scope.profileLayers, function(layer, index) {

	                    context.save();

	                    context.fillStyle = '#4285f4';
	                    if (scope.profile.layers[index] == scope.settings.selectedLayer) context.globalAlpha = .85;
	                    else context.globalAlpha = .45;
	                    if (scope.settings.tempMode && !options.print) context.globalAlpha = .1;

	                    // VIEWS: layer coloring
	                    var view = layer.views[scope.settings.view];
	                    if (view && view.layer.length > 0) {
	                        context.fillStyle = 'rgba(255,204,0,1)';
	                        if (view.layer[0].color != null) context.fillStyle = view.layer[0].color;
	                    }

	                    var _newDepth = paddingTop + graphHeight - Math.round( ((scope.profile.depth - (scope.profile.depth - layer.depth)) * (graphHeight / scope.profile.depth)));
	                   
	                    var _width = Math.round(hardness[layer.hardness].width * column.width);
	                    var _width2 = _width;
	                    if (layer.hardness2)
	                        _width2 = Math.round(hardness[layer.hardness2].width * column.width);

	                    // client/display stuff (this isn't bound to original, only clientLayers)
	                    layer.index = index;
	                    layer.clientDepth = _newDepth - paddingTop;
	                    layer.clientTop = prevDepth - paddingTop;
	                    layer.clientBottom = graphHeight - (_newDepth - paddingTop);
	                    layer.clientHeight = _newDepth - prevDepth;
	                    layer.clientWidthTop = _width;
	                    layer.clientWidthBottom = _width2;

	                    layer.clientInterfaceDepth = _newDepth;

	                    context.beginPath();
	                    // layer polygon
	                    context.moveTo(column.width,prevDepth + .5);
	                    context.lineTo(column.width - _width, prevDepth + .5);
	                    context.lineTo(column.width - _width2, _newDepth);
	                    context.lineTo(column.width, _newDepth);
	                    // layer clip mask
	                    context.clip();
	                    // fill background
	                    context.fill();

	                    // keep trak of polygon dimensions for clicking
	                    scope._layers.push([
	                        [column.offsetLeft + column.width,prevDepth],
	                        [column.offsetLeft + column.width - _width, prevDepth],
	                        [column.offsetLeft + column.width - _width2, _newDepth],
	                        [column.offsetLeft + column.width, _newDepth]
	                    ]);

	                    
	                    if (scope.settings.tempMode && !options.print) context.globalAlpha = .1
	                    else context.globalAlpha = 1;

	                    // layer of concern
	                    if (layer.concern && layer.concern != "") {
	                        context.strokeStyle = 'rgba(255,0,0,8)';
	                        context.lineWidth = 3;
	                        context.beginPath();

	                        if (layer.concern == "B" || layer.concern == "L") {
	                            context.moveTo(0, _newDepth - 1.1);
	                            context.lineTo(column.width, _newDepth - 1.1);
	                        }
	                        else if (layer.concern == "T") {
	                            context.moveTo(0, prevDepth + 1.1);
	                            context.lineTo(column.width, prevDepth + 1.1);
	                        }
	                        context.stroke();
	                        context.closePath();
	                    }

	                    // restore from clip mask
	                    context.restore();

	                    prevDepth = _newDepth;
	                });

	                // draw interface boundry lines
	                angular.forEach(scope.profileLayers, function(layer, index) {

	                    var _width = Math.round(hardness[layer.hardness].width * column.width);
	                    var _width2 = _width;
	                    if (layer.hardness2)
	                        _width2 = Math.round(hardness[layer.hardness2].width * column.width);

	                    context.strokeStyle = '#444';
	                    context.lineWidth = 1;
	                    if ((scope.profile.layers[index] == scope.settings.hoverDragLayer && !scope.settings.dragging) || layer == scope.settings.dragging) context.strokeStyle = '#ffcc00';
	                    if (options.print) context.strokeStyle = '#000';

	                    if (scope.settings.tempMode && !options.print) context.strokeStyle = 'rgba(0,0,0,.2)'; 

	                    context.beginPath();
	                    context.moveTo(column.width - _width2, layer.clientInterfaceDepth);
	                    context.lineTo(column.width, layer.clientInterfaceDepth);
	                    
	                    context.stroke();
	                    context.closePath();
	                });

	                // plot temps
	                var surfaceTemp;
	                var maxTemp = 30;
	                var _width = column.width - 2;
	                context.moveTo(_width, paddingTop);
	                if (scope.profile.temps && scope.profile.temps.length > 0) {
	                    context.beginPath();
	                    for (var i = 0; i < scope.profile.temps.length; i++){
	                        if (scope.profile.temps[i].depth == 0) surfaceTemp = scope.profile.temps[i].temp;
	                        var plotTemp = (maxTemp - Math.abs(scope.profile.temps[i].temp)) * (_width / maxTemp) + 1;
	                        context.lineTo(
	                            plotTemp, 
	                            paddingTop + (scope.profile.temps[i].depth * (graphHeight / scope.profile.depth))
	                        );
	                    }
	                    context.lineCap = 'round';
	                    context.lineJoin = 'round';
	                    context.lineWidth = 2;
	                    context.strokeStyle = 'rgba(255,0,0,.5)';
	                    if (scope.settings.tempMode && !options.print) context.strokeStyle = 'red';
	                    context.stroke();
	                }

	                // plot surface temp to air temp
	                if (surfaceTemp != null && scope.profile.airTemp != null 
	                    && scope.profile.airTemp <= 0
	                    && scope.profile.temps && scope.profile.temps.length > 0) {

	                    var surfaceTemp = (maxTemp - Math.abs(surfaceTemp)) * (_width / maxTemp) + 1; 
	                    var airTemp = (maxTemp - Math.abs(scope.profile.airTemp)) * (_width / maxTemp) + 1;
	                    context.setLineDash([5,5]);
	                    context.beginPath();
	                    context.moveTo(surfaceTemp, paddingTop);
	                    context.lineTo(airTemp,paddingTop - surfaceLayerHeight);
	                    context.stroke();
	                    context.setLineDash([]);
	                }

	                context.lineJoin = 'miter';
	                context.lineCap = 'butt';
	                context.closePath();

	                // temp axis labels
	                //if (scope.settings.tempMode) {
	                    context.fillStyle = options.labelColor;
	                    context.font = "10px roboto condensed";

	                    var tempUnits = "C";
	                    if (scope.settings.tempUnits) tempUnits = scope.settings.tempUnits;
	                    if (tempUnits == "C") {
	                        angular.forEach(['0°C','-5','-10','-15','-20','-25',''], function(temp, index) {
	                            context.fillText(temp, column.width - ((column.width / 6.1) * (index + 1)) + (column.width / 6.1) - 10, 31);
	                        });
	                    }
	                    else if (tempUnits == "F") {
	                        angular.forEach(['32°F','24','16','8','0','-8','-16'], function(temp, index) {
	                            context.fillText(temp, column.width - ((column.width / 6.8) * (index + 1)) + (column.width / 6.8) - 6, 31);
	                        });
	                    }
	                //}
	            });

	            // draw layer details
	            drawColumn(context, 3, function(column) {

	                if (scope.settings.tempMode && !options.print) context.globalAlpha = .2;

	                var paddingLeft = 70;
	                var connectorWidth = 30;
	                var minHeight = 23;

	                var _width = column.width - paddingLeft;

	                var _extra = 0;

	                // background 
	                context.beginPath();
	                context.fillStyle = "#fafafa";
	                context.fillRect(0, paddingTop - surfaceLayerHeight, _width, graphHeight + surfaceLayerHeight);
	                context.fill();
	                context.closePath();

	                // 1. CALCULATE
	                
	                var runningDepthClientSide = 0;

	                angular.forEach(scope.profileLayers,function(layer){

	                    // calculate side layers
	                    var _runningDepthClientSide = runningDepthClientSide;
	                    if (layer.clientHeight < minHeight) {
	                        runningDepthClientSide += minHeight;
	                        _extra += minHeight - layer.clientHeight;
	                    }
	                    else {
	                        var newHeight = layer.clientHeight - _extra;
	                        _extra = 0;
	                        if (newHeight < minHeight) {
	                            runningDepthClientSide += minHeight;
	                            _extra += minHeight - newHeight;
	                        }
	                        else runningDepthClientSide += newHeight;
	                    }

	                    layer.sideLayerDepthClient = runningDepthClientSide;
	                    layer.sideLayerHeightClient =  runningDepthClientSide - _runningDepthClientSide;
	                });

	                // if the side layers are too tall to fit, squeeze it in
	                if (runningDepthClientSide > graphHeight) {
	                    var overflow = (runningDepthClientSide - graphHeight);

	                    // todo: if it can all be taken out of one layer, chose that one

	                    for (var l = scope.profileLayers.length - 1; l >= 0; l--) {
	                        var _layer = scope.profileLayers[l];
	                        var availableHeight = _layer.sideLayerHeightClient - minHeight;

	                        if (overflow > 0 && availableHeight > 0) {

	                            var maxRemove = availableHeight;
	                            if (maxRemove > overflow) maxRemove = overflow;

	                            _layer.sideLayerHeightClient -= maxRemove;
	                            overflow -= maxRemove;
	                        }
	                    }

	                    // go back and recalculate depth
	                    runningDepthClientSide = 0;
	                    angular.forEach(scope.profileLayers,function(layer){
	                        runningDepthClientSide += layer.sideLayerHeightClient;
	                        layer.sideLayerDepthClient = runningDepthClientSide;
	                    });
	                }

	                // 2. DRAW

	                // side layer fill
	                var previousLayer = null;
	                angular.forEach(scope.profileLayers,function(layer, index) {

	                    var depth1 = layer.clientDepth + paddingTop;
	                    var depth2 = layer.sideLayerDepthClient + paddingTop;

	                    var stub = 9;
	                    var dif = Math.abs(depth2 - depth1);
	                    if (dif > 20) stub = 8;
	                    if (dif > 40) stub = 7;
	                    if (dif > 60) stub = 6;
	                    if (dif > 80) stub = 5;
	                    if (dif > 100) stub = 2;
	                    if (dif > 120) stub = 0;
	                    layer.stub = stub;

	                    context.fillStyle = '#fff';

	                    // highlight background when selected
	                    if (!options.print && (scope.profile.layers[index] == scope.settings.selectedLayer)) context.fillStyle = 'rgba(66,133,244,.1)'; 

	                    context.lineWidth = 0;
	                    context.beginPath();

	                    // use this to keep track of layer polygon for interactivity
	                    var sideLayer = [];

	                    if (previousLayer) {
	                        context.moveTo(_width, previousLayer.depth2);
	                        context.lineTo(connectorWidth, previousLayer.depth2);
	                        context.lineTo(previousLayer.stub, previousLayer.depth1);
	                        context.lineTo(0,previousLayer.depth1);

	                        sideLayer.push([column.offsetLeft + _width, previousLayer.depth2]);
	                        sideLayer.push([column.offsetLeft + connectorWidth, previousLayer.depth2]);
	                        sideLayer.push([column.offsetLeft + previousLayer.stub, previousLayer.depth1]);
	                        sideLayer.push([column.offsetLeft + 0, previousLayer.depth1]);
	                    }
	                    else {
	                        context.moveTo(_width, paddingTop);
	                        context.lineTo(0, paddingTop);

	                        sideLayer.push([column.offsetLeft + _width, paddingTop]);
	                        sideLayer.push([column.offsetLeft + 0, paddingTop]);
	                    }

	                    context.lineTo(0,depth1);
	                    context.lineTo(stub, depth1);
	                    context.lineTo(connectorWidth, depth2);
	                    context.lineTo(_width, depth2);
	                    context.closePath();
	                    context.fill();

	                    sideLayer.push([column.offsetLeft + 0,depth1]);
	                    sideLayer.push([column.offsetLeft + stub, depth1]);
	                    sideLayer.push([column.offsetLeft + connectorWidth, depth2]);
	                    sideLayer.push([column.offsetLeft + _width, depth2]);
	                    scope._sideLayers.push(sideLayer);

	                    previousLayer = { stub: stub, depth1: depth1, depth2: depth2 };
	                });

	                var drawGrainType = function(layer, depth2) {

	                    var fontSize = 21;
	                    context.fillStyle = options.labelColor;
	                    context.font = fontSize + "px snowsymbols";

	                    if (layer.grainType && layer.grainType2) {
	                        var scale = scope.getGrainType(layer.grainType).scale;
	                        if (scale != null) context.font = (fontSize * scale) + "px snowsymbols";
	                        var offsetTop = scope.getGrainType(layer.grainType).offsetTop;
	                        if (offsetTop == null) offsetTop = 0;

	                        centerText(context, scope.getGrainType(layer.grainType).symbol, 20, connectorWidth, depth2 - (layer.sideLayerHeightClient / 2) + 6 + offsetTop);
	                        
	                        context.font = "21px snowsymbols";
	                        //context.fillStyle = "#999";
	                        var scale2 = scope.getGrainType(layer.grainType2).scale;
	                        if (scale2 != null) context.font = (fontSize * scale2) + "px snowsymbols";
	                        var offsetTop2 = scope.getGrainType(layer.grainType2).offsetTop;
	                        if (offsetTop2 == null) offsetTop2 = 0;

	                        centerText(context, scope.getGrainType(layer.grainType2).symbol, 20, connectorWidth + 24, depth2 - (layer.sideLayerHeightClient / 2) + 6 + offsetTop2);

	                        // parens
	                        context.font = "100 18px 'roboto condensed'";
	                        context.fillText("(", connectorWidth + 20, depth2 - (layer.sideLayerHeightClient / 2) + 5);
	                        context.fillText(")", connectorWidth + 43, depth2 - (layer.sideLayerHeightClient / 2) + 5);
	                    }
	                    else if (layer.grainType) {
	                        var _grainType = scope.getGrainType(layer.grainType);
	                        if (_grainType) {
	                            var scale = _grainType.scale;
	                            if (scale != null) context.font = (fontSize * scale) + "px snowsymbols";
	                            var offsetTop = scope.getGrainType(layer.grainType).offsetTop;
	                            if (offsetTop == null) offsetTop = 0;

	                            centerText(context, scope.getGrainType(layer.grainType).symbol, 45, connectorWidth, depth2 - (layer.sideLayerHeightClient / 2) + 6 + offsetTop);
	                        }
	                    }
	                }
	                var drawGrainSize = function(layer, depth2) {
	                    if (!options.drawGrainSize) return;
	                    context.fillStyle = options.labelColor;
	                    context.font = "11px 'roboto condensed'";
	                    if (layer.grainSize) { 
	                        var text = layer.grainSize;
	                        if (layer.grainSize2) text+= "-" + layer.grainSize2;
	                        var width = context.measureText(text).width
	                        centerText(context, text, 30, connectorWidth + 60, depth2 - (layer.sideLayerHeightClient / 2) + 4.5);
	                    }
	                }

	                // draw border between side layers and layers
	                // context.strokeStyle = "red";
	                // context.lineWidth = 1;
	                // context.beginPath();
	                // context.moveTo(0,paddingTop - surfaceLayerHeight);
	                // context.lineTo(0,graphHeight + paddingTop);
	                // context.stroke();
	                // context.closePath();
	                
	                angular.forEach(scope.profileLayers,function(layer,index) {

	                    // side layer lines
	                    var depth1 = layer.clientDepth + paddingTop;
	                    var depth2 = layer.sideLayerDepthClient + paddingTop;
	                    var stub = layer.stub;

	                    context.beginPath();
	                    context.moveTo(0, depth1);
	                    context.lineTo(0, depth1);
	                    context.lineTo(stub, depth1);
	                    context.lineTo(connectorWidth, depth2);
	                    context.lineTo(_width, depth2);
	                    
	                    context.lineWidth = 1;
	                    context.strokeStyle = '#111';
	                    context.stroke();

	                    // draw grain type and size
	                    drawGrainType(layer, depth2);
	                    drawGrainSize(layer, depth2);

	                    // draw water content
	                    if (options.drawWaterContent) {
	                        context.fillStyle = "#444";
	                        context.font = "11px 'roboto condensed'";
	                        if (layer.waterContent) {
	                            centerText(context, layer.waterContent, 30, connectorWidth + 60 + 42, depth2 - (layer.sideLayerHeightClient / 2) + 4.5);
	                        }
	                    }

	                    // depth axis labels (relative to right side of canvas)
	                    if (options.showDepth) {
	                        var depthText = (scope.settings.depthDescending ? layer.depth : (scope.profile.depth - layer.depth));
	                        context.fillStyle = options.labelColor;
	                        context.font = "10px 'roboto condensed'";
	                        context.fillText(depthText, column.width - paddingLeft + 3.5, depth2 + 3.5);
	                    }

	                    // flags and lemons

	                    var posX = 45;

	                    if (scope.settings.view == "flags") {

	                        var nextLayer = scope.profileLayers[index + 1];
	                        if (nextLayer) {
	                            var totals = Math.max(layer.views.flags.layer.length, nextLayer.views.flags.layer.length);
	                            totals += layer.views.flags.interface.length;

	                            if (totals > 0) {
	                                context.font = "11.5px 'fontawesome'";
	                                context.fillText("\uf024", column.width - paddingLeft + posX - 15, depth2 + 3.5);
	                                context.font = "10px 'roboto condensed'"
	                                context.fillText(totals, column.width - paddingLeft + posX, depth2 + 3.5);
	                            }
	                        }
	                    }
	                    if (scope.settings.view == "lemons") {
	                        if (layer.views.lemons.layer.length > 0) {
	                            var text = "";
	                            angular.forEach(layer.views.lemons.layer,function(match){ text += match.rule + ","; });
	                            text = text.slice(0, - 1);

	                            context.font = "11.5px 'fontawesome'";
	                            context.fillText("\uf094", column.width - paddingLeft + posX - 15, depth2 - (layer.sideLayerHeightClient / 2) + 4);
	                            context.font = "10px 'roboto condensed'"
	                            context.fillText(text, column.width - paddingLeft + posX, depth2 - (layer.sideLayerHeightClient / 2) + 4);
	                        }
	                        if (layer.views.lemons.interface.length > 0) {
	                            var text = "";
	                            angular.forEach(layer.views.lemons.interface,function(match){ text += match.rule + ","; });
	                            text = text.slice(0, - 1);

	                            context.font = "11.5px 'fontawesome'";
	                            context.fillText("\uf094", column.width - paddingLeft + posX - 15, depth2 + 3.5);
	                            context.font = "10px 'roboto condensed'"
	                            context.fillText(text, column.width - paddingLeft + posX, depth2 + 3.5);
	                        }
	                    }

	                });
	                
	                // draw surface layer details background 
	                context.fillStyle = "#fafafa";
	                context.fillRect(0, paddingTop - surfaceLayerHeight, column.width - 70, surfaceLayerHeight);

	                // draw surface grain type and size
	                if (scope.profile.surfaceGrainType) {
	                    drawGrainType({
	                        grainType: scope.profile.surfaceGrainType,
	                        grainType2: scope.profile.surfaceGrainType2,
	                        sideLayerHeightClient: surfaceLayerHeight
	                    }, paddingTop);
	                }
	                // draw surface grain size
	                if (scope.profile.surfaceGrainSize) {
	                    drawGrainSize({
	                        grainSize: scope.profile.surfaceGrainSize,
	                        grainSize2: scope.profile.surfaceGrainSize2,
	                        sideLayerHeightClient: surfaceLayerHeight
	                    }, paddingTop);
	                }

	                // top depth axis label (either 0 or profile depth, depending on depth setting)
	                if (options.showDepth) {
	                    var depthText = scope.settings.depthDescending ? scope.profile.depth : "0";
	                    context.fillStyle = options.labelColor;
	                    context.font = "10px 'roboto condensed'";
	                    context.fillText(depthText, column.width - paddingLeft + 3.5, 3.5 + paddingTop);

	                    context.font = "100 10px 'roboto condensed'";
	                    if (options.drawSurfaceLabel) context.fillText("SURFACE", column.width - paddingLeft + 22, 3.5 + paddingTop);
	                }

	                // top labels
	                context.fillStyle = options.labelColor;
	                context.font = "9px 'roboto condensed'";

	                centerText(context, "GRAIN", 30, 37.5, 21);
	                centerText(context, "TYPE", 30, 37.5, 31);

	                if (options.drawGrainSize) {
	                    centerText(context, "GRAIN", 30, 90.5, 21);
	                    centerText(context, "SIZE", 30, 90.5, 31);
	                }

	                if (options.drawWaterContent) {
	                    centerText(context, "WATER", 30, 133, 21);
	                    centerText(context, "CONTENT", 30, 133, 31);
	                }

	            });

	            // draw surface line
	            drawColumns(context, 1, 3, function(column) {
	                context.lineWidth = 1;
	                context.strokeStyle = "#111";
	                context.strokeStyle = "#e5e5e5";
	                if (options.print) context.strokeStyle = '#d5d5d5';
	                context.strokeStyle = options.commentLineColor;
	                //context.strokeStyle = '#eee';

	                context.beginPath();
	                context.moveTo(0, paddingTop);
	                context.lineTo(column.width - 70, paddingTop);
	                context.stroke();
	                context.closePath();
	            });

	            // canvas border
	            if (options.borderColor) {
	                context.lineWidth = 1;
	                context.lineColor = options.borderColor;
	                drawColumns(context, 1, 3, function(column){
	                        context.beginPath();
	                        context.moveTo(column.width - 70, paddingTop - surfaceLayerHeight);
	                        context.lineTo(0, paddingTop - surfaceLayerHeight);
	                        context.lineTo(0, graphHeight + paddingTop);
	                        context.lineTo(column.width - 70, graphHeight + paddingTop);  
	                        context.lineTo(column.width - 70, paddingTop - surfaceLayerHeight);  
	                        context.stroke();
	                        context.closePath();
	                });
	                if (scope.profile.density && scope.profile.density.length > 0) {
	                    drawColumn(context, 1, function(column){
	                        context.beginPath();
	                        context.moveTo(column.width, paddingTop - surfaceLayerHeight); 
	                        context.lineTo(column.width, graphHeight + paddingTop);
	                        context.stroke();
	                        context.closePath();
	                    });
	                }
	            }
	            scope.drawing = false;
	        }
	    }
	  };
	}]);

/***/ },
/* 28 */
/***/ function(module, exports) {

	angular.module('avatech').factory('snowpitConstants', ['$q', function ($q) { 

	var begin = 0.08;
	var end = 0.999;
	var inc = (1 - ((1 - end) + begin)) / 15;

	return {

	    hardness : {
	        "F":   { width: begin, index: 1 },
	        "F+":  { width: begin + (1 * inc), index: 2 },
	        "4F-": { width: begin + (2 * inc), index: 3 },
	        "4F":  { width: begin + (3 * inc), index: 4 },
	        "4F+": { width: begin + (4 * inc), index: 5 },
	        "1F-": { width: begin + (5 * inc), index: 6 },
	        "1F":  { width: begin + (6 * inc), index: 7 },
	        "1F+": { width: begin + (7 * inc), index: 8 },
	        "P-":  { width: begin + (8 * inc), index: 9 },
	        "P":   { width: begin + (9 * inc), index: 10 },
	        "P+":  { width: begin + (10 * inc), index: 11 },
	        "K-":  { width: begin + (11 * inc), index: 12 },
	        "K":   { width: begin + (12 * inc), index: 13 },
	        "K+":  { width: begin + (13 * inc), index: 14 },
	        "I-":  { width: begin + (14 * inc), index: 15 },
	        "I":   { width: end, index: 16 }
	    },
	    grainSizes: [
	        '',
	        '.1',
	        '.3',
	        '.5',
	        '1',
	        '1.5',
	        '2',
	        '2.5',
	        '3',
	        '3.5',
	        '4',
	        '4.5',
	        '5',
	        '6',
	        '7',
	        '8',
	        '9',
	        '10',
	        '15',
	        '20',
	        '30',
	        '40',
	        '50',
	        '50+'
	    ],
	    grainTypes: [
	        { symbol: "a", legacyCode: "a", code: "PP", desc: "Precipitation Particles", types: [
	            { icssg: "PP", code: "a", symbol: "a", desc: "Precipitation particles" },
	            { icssg: "PPco", code: "j", symbol: "j", desc: "Columns" },
	            { icssg: "PPnd", code: "k", symbol: "k", desc: "Needles" },
	            { icssg: "PPpl", code: "p1", symbol: "l", desc: "Plates" },
	            { icssg: "PPsd", code: "m", symbol: "m", desc: "Stellars, Dendrites" },
	            { icssg: "PPir", code: "n", symbol: "n", desc: "Irregular crystals" },
	            { icssg: "PPgp", code: "o", symbol: "o", desc: "Graupel" },
	            { icssg: "PPhl", code: "p", symbol: "p", desc: "Hail" },
	            { icssg: "PPip", code: "q", symbol: "q", desc: "Ice pellets" },
	            { icssg: "PPrm", code: "r", symbol: "r", desc: "Rime" }
	        ]},
	        { symbol: "u", legacyCode: "u", code: "DF", desc: "Decomposing & Fragmented PP", types: [
	            { icssg: "DF", code: "u1", symbol: "u", desc: "Decomposing & Fragmented PP" },
	            { icssg: "DFdc", code: "u2", symbol: "u", desc: "Partly decomposed PP" },
	            { icssg: "DFbk", code: "v",  symbol: "v", desc: "Wind-broken PP" }
	        ]},
	        { symbol: "d", legacyCode: "d", code: "RG", desc: "Rounded Grains", types: [
	            { icssg: "RG", code: "x", symbol: "x", desc: "Rounded grains" },
	            { icssg: "RGsr", code: "w", symbol: "w", desc: "Small rounded particles" },
	            { icssg: "RGlr", code: "d", symbol: "d", desc: "Large rounded particles" },
	            { icssg: "RGwp", code: "y", symbol: "y", desc: "Wind packed" },
	            { icssg: "RGxf", code: "z", symbol: "z", desc: "Faceted rounded particles" }
	        ]},
	        { symbol: "e", legacyCode: "e", code: "FC", desc: "Faceted Crystals", types: [
	            { icssg: "FC", code: "A1", symbol: "A", desc: "Faceted Crystals" },
	            { icssg: "FCso", code: "A2", symbol: "A", desc: "Solid faceted particles" },
	            { icssg: "FCsf", code: "B", symbol: "B", desc: "Near-surface faceted particles" },
	            { icssg: "FCxr", code: "C", symbol: "C", desc: "Rounding faceted particles" }
	        ]},
	        { symbol: "D", legacyCode: "D", code: "DH", desc: "Depth Hoar", types: [
	            { icssg: "DH", code: "D1", symbol: "D", desc: "Depth hoar" },
	            { icssg: "DHcp", code: "D2", symbol: "D", desc: "Hollow cups" },
	            { icssg: "DHpr", code: "E", symbol: "E", desc: "Hollow prisms" },
	            { icssg: "DHch", code: "F", symbol: "F", desc: "Chains of depth hoar" },
	            { icssg: "DHla", code: "D3", symbol: "G", desc: "Large striated crystals" },
	            { icssg: "DHxr", code: "H", symbol: "H", desc: "Rounding depth hoar" }
	        ]},
	        { symbol: "I", legacyCode: "I", code: "SH", desc: "Surface Hoar", types: [
	            { icssg: "SH", code: "I1", symbol: "I", desc: "Surface hoar" },
	            { icssg: "SHsu", code: "I2", symbol: "I", desc: "Surface hoar cystals" },
	            { icssg: "SHcv", code: "J", symbol: "J", desc: "Cavity or crevasse hoar" },
	            { icssg: "SHxr", code: "K", symbol: "K", desc: "Rounding surface hoar" }
	        ]},
	        { symbol: "h", legacyCode: "h", code: "MF", desc: "Melt Forms", types: [
	            { icssg: "MF", code: "h", symbol: "h", desc: "Melt forms" },
	            { icssg: "MFcl", code: "L", symbol: "L", desc: "Clustered rounded grains" },
	            { icssg: "MFpc", code: "M", symbol: "M", desc: "Rounded polycrystals" },
	            { icssg: "MFsl", code: "N", symbol: "N", desc: "Slush" },
	            { icssg: "MFcr", code: "O", symbol: "Oh",desc: "Melt-freeze crust", style:{ 'font-size':'54%', position:'relative', bottom:'2px', left:'1px' }, scale: 0.53, offsetTop: -3 },
	        ]},
	        { symbol: "P", legacyCode: "i", code: "IF", desc: "Ice Formations", types: [
	            { icssg: "IF", code: "P1", symbol: "P", desc: "Ice formations" },
	            { icssg: "IFil", code: "P2", symbol: "P", desc: "Ice layer" },
	            { icssg: "IFic", code: "Q", symbol: "Q", desc: "Ice column" },
	            { icssg: "IFbi", code: "R", symbol: "R", desc: "Basal ice" },
	            { icssg: "IFrc", code: "S", symbol: "S", desc: "Rain crust" },
	            { icssg: "IFsc", code: "T", symbol: "T", desc: "Sun crust" }
	        ]}, 
	        { symbol: "s", legacyCode: "s", code: "MM", desc: "Machine Made Snow", types: [
	            { icssg: "MM", code: "s1", symbol: "s", desc: "Machine Made Snow" },
	            { icssg: "MMrp", code: "s", symbol: "s", desc: "Round polycrystalline particles" },
	            { icssg: "MMci", code: "t", symbol: "t", desc: "Crushed ice particles" }
	        ]}
	        ]
	        
	};}]);

/***/ },
/* 29 */
/***/ function(module, exports) {

	angular.module('avatech')
	.controller('SnowpitController', 
	    function ($scope, $state, $stateParams, $location, $log, $http, $timeout, snowpitConstants, snowpitViews, snowpitExport, Global, Confirm, LocationSelectModal, Lightbox, PublishModal, Observations) {

	        $scope.global = Global;

	        $scope.loading = true;

	        // constants
	        $scope.grainSizes = snowpitConstants.grainSizes;
	        $scope.hardness = snowpitConstants.hardness;
	        $scope.hardnessCount = Object.keys($scope.hardness).length;
	        $scope.today = new Date().toISOString();

	        // config
	        $scope.graphWidth = 320;

	        // define canvas columns
	        $scope.columns = [
	            { width: 140 },
	            { width: 27 },
	            { width: $scope.graphWidth },
	            { width: 240 }
	        ];

	        $scope.snowpitWidth = $scope.columns.reduce(function(a,b){ return { width: a.width + b.width}; }).width;
	        $scope.snowpitHeight = 600;

	        $scope.columnsPrint = [
	            { width: 150 },
	            { width: 27 },
	            { width: 353 },
	            { width: 240 }
	        ];
	        // canvas options
	        $scope.canvasOptions = { labelColor: "#222", commentLineColor: "#aaa", dashedLineColor: "#ddd", showDepth: false, showDensity: false };
	        $scope.canvasOptionsPrint = { labelColor: "#000", commentLineColor: "#000", background: "#fff", dashedLineColor: "#aaa", print: true, showDepth: true, showDensity: true };

	        $scope.settings = {
	            selectedLayer: null,
	            dragging: null,
	            hoverDragLayer: null,
	            view: null,
	            depthDescending: true,
	            tempMode: false,
	            tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
	        }

	        $scope._isNew = true;
	        $scope.rightPaneMode = 'snowpit';

	        $scope.profile = null;

	        $scope.tooltips = ($state.params.profileId == "new");
	        $scope.disableTooltips = function() {
	            $scope.tooltips = false;
	        }
	        // show guidance tooltips if new (wait a second or two after page load)
	        setTimeout(function(){ 
	            if ($scope.tooltips) { $("#addLayerButton").tooltip('show'); }
	        },2000);

	        // show other tooltips
	        $('.tooltip-trigger').tooltip();

	        $scope.getThumbnailURL = function(media) {
	            if (media.type == "photo") {
	                url = media.URL;
	                if (url.indexOf("cloudinary.com") > -1) {
	                    var filename = media.URL.substr(media.URL.indexOf("upload/") + 7);
	                    filename = filename.substring(filename.indexOf("/") + 1, filename.indexOf("."));
	                    url = "http://res.cloudinary.com/avatech/image/upload/w_300/" + filename + ".jpg";
	                }
	                return url;
	            }
	        }

	        // beacuse of the ui.router hack to allow url transition without loading new state,
	        // we have to manually keep track of when to reload state (when they release 'dyanmic
	        // params' this can be changed) https://github.com/angular-ui/ui-router/issues/64
	        $scope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
	            if (fromState.name == toState.name) {
	                var isUrlUpdate = (fromParams.profileId == "new" && toParams.profileId == $scope.profile._id);
	                if (!isUrlUpdate) {
	                    $log.debug("reload!");
	                    var go = $scope.$on('$stateChangeSuccess', function () { 
	                        $log.debug("success!");
	                        $state.go(toState.name, toParams, { reload: true }); 
	                        go();
	                    });
	                }
	            }
	        });

	        $scope.init = function(){
	            if ($stateParams.profileId == "new") {
	                var profile = { 
	                    depth: 150,
	                    layers: [],
	                    temps: [],
	                    tests: [],
	                    media: [],
	                    density: [],
	                    metaData: { },
	                    user: { fullName: Global.user.fullName, _id: Global.user._id },
	                    type: "snowpit"
	                };

	                // if location param is specified, set initial location
	                if ($stateParams.location) {
	                    profile.location = $stateParams.location;
	                }

	                if ($scope.global.orgs.length) profile.organization = $scope.global.orgs[0]._id;

	                $scope.profile = angular.copy(profile);
	                $scope.loading = false;
	            } else {
	                $scope.findOne();
	            }
	        }


	        // PROFILE CRUD

	        $scope.findOne = function() {
	            $http.get(window.apiBaseUrl + "observations/" + $stateParams.profileId)
	            .then(function(res) {
	                if (res.status != 200) return;

	                var profile = res.data;

	                // convert populated org to org _id
	                if (profile.organization) profile.organization = profile.organization._id;

	                $scope.profile = angular.copy(profile);
	                $timeout(function(){
	                    $scope.loading = false;
	                },400);
	                
	                $scope._isNew = false;
	            });
	        };

	        // delete profile
	        $scope.delete = function() {
	            Confirm.open("Are you sure you want to delete this snowpit?").then(function() {
	                Observations.remove($scope.profile);
	                $location.path('/');
	            });
	        }

	        // create new profile
	        $scope.create = function() {
	            var profile = $scope.getSanitizedProfileCopy();

	            // if no changes have been made, don't create 
	            if ((profile.layers && profile.layers.length == 0) &&
	                (profile.temps && profile.temps.length == 0) &&
	                (profile.tests && profile.tests.length == 0) &&
	                (profile.media && profile.media.length == 0) &&
	                (profile.density && profile.density.length == 0) &&
	                (profile.metaData && Object.keys(profile.metaData).length == 0)) return;

	            $http.post(window.apiBaseUrl + "observations/", profile)
	            .then(function(res) {

	                var _profile = res.data;

	                $scope._isNew = false;
	                $scope.profile._id = _profile._id;
	                $scope.loading = false;
	                $location.path('profiles/' + _profile._id).replace();
	            });
	        };
	        // update current profile
	        $scope.update = function() {
	            var profile = $scope.getSanitizedProfileCopy();
	            Observations.save($scope.getSanitizedProfileCopy());
	        };

	        $scope.getSanitizedProfileCopy = function() {
	            // make temp copy of profile
	            var profile = angular.copy($scope.profile);

	            // make sure observation type is always set
	            profile.type = 'snowpit';

	            return profile;
	        }

	        // save profile on changes

	        $scope.timer = null;
	        $scope.$watch("profile",function(newProfile, oldProfile){
	            if (!newProfile) return;

	            // calculate layer depth (and keep track of index)
	            var runningDepth = $scope.profile.depth;
	            angular.forEach($scope.profile.layers,function(layer, index){
	                runningDepth -= layer.height;
	                layer.depth = runningDepth;
	                layer.index = index;
	            });
	            // calculate views
	            $scope.calculateViews();

	            if ($scope.timer) $timeout.cancel($scope.timer);
	            $scope.timer = $timeout(function(){
	                // if new, create
	                if ($scope._isNew) $scope.create();
	                // otherwise, save
	                else if ($scope.profile._id) $scope.update();
	            }, 500);
	        }, true);


	        // DENSITY

	        $scope.addDensity = function() {
	            if (!$scope.newDensity) return;
	            if (!$scope.newDensity.density) return;
	            if (!$scope.newDensity.depth) return;

	            if ($scope.newDensity.depth > $scope.profile.depth) $scope.newDensity.depth = $scope.profile.depth;
	            if ($scope.newDensity.depth < 0) $scope.newDensity.depth = 0;

	            if ($scope.settings.depthDescending) $scope.newDensity.depth = $scope.profile.depth - $scope.newDensity.depth;

	            $scope.profile.density.push($scope.newDensity);
	            $scope.newDensity = null;
	        }

	        $scope.saveDensity = function(density, newDensity) {
	            if (!newDensity) return;
	            if (!newDensity.density) return;
	            if (!newDensity.depth) return;

	            if (newDensity.depth > $scope.profile.depth) newDensity.depth = $scope.profile.depth;
	            if (newDensity.depth < 0) newDensity.depth = 0;

	            if ($scope.settings.depthDescending) newDensity.depth = $scope.profile.depth - newDensity.depth;

	            density.depth = newDensity.depth;
	            density.density = newDensity.density;
	        }
	        $scope.deleteDensity = function(index) {
	            if (index == 0) $scope.profile.density.shift();
	            else $scope.profile.density.splice(index, 1);
	        };

	        // PROFILE DEPTH INPUT

	        $scope.$watch('settings.selectedLayer.height', function(height){
	            if (!$scope.settings.selectedLayer) return;

	            var maxHeight = 0;
	            for (var i = 0; i < $scope.profile.layers.length ; i++) { 
	            if ($scope.profile.layers[i] != $scope.settings.selectedLayer) maxHeight+= $scope.profile.layers[i].height; 
	            };
	            maxHeight = $scope.profile.depth - maxHeight;
	            if (height > maxHeight) $scope.settings.selectedLayer.height = maxHeight;
	            if (height < 1 || isNaN(height)) $scope.settings.selectedLayer.height = 1;
	        });

	        $scope.$watch('profile.depth', function(newSnowpitDepth){
	            if (!$scope.profile) return;
	            // todo: shouldnt be 150, it should be total layer height (if bigger than 150, could potentially clip)
	            if (isNaN(newSnowpitDepth)) newSnowpitDepth = 150;
	            $scope.profile._depth = newSnowpitDepth;
	        });
	        $scope.$watch('profile._depth', function(newSnowpitDepth){
	            if (!$scope.profile) return;
	            if (newSnowpitDepth != "") {

	                newSnowpitDepth = parseInt(newSnowpitDepth);

	                // get total height of all layers
	                var totalHeight = 0;
	                if ($scope.profile.layers) {
	                    for (var i = 0; i < $scope.profile.layers.length ; i++) { 
	                        totalHeight+= $scope.profile.layers[i].height; 
	                    };
	                }

	                if (newSnowpitDepth < totalHeight) $scope.profile.depth = totalHeight;
	                else if (newSnowpitDepth < 10) $scope.profile.depth = 10;
	                else if (newSnowpitDepth > 400) $scope.profile.depth = 400;
	                else $scope.profile.depth = newSnowpitDepth;

	                $scope.profile._depth = $scope.profile.depth;
	            }
	            else {
	                $scope.profile._depth = $scope.profile.depth;
	            }
	        });

	        // PROFILE LOCATION LAT/LNG INPUT

	        $scope.$watch('profile.location', function(newLocation){
	            if (!$scope.profile) return;
	            if (!newLocation) return;
	            if (newLocation.length) {
	                $scope.profile._lat = newLocation[1];
	                $scope.profile._lng = newLocation[0];
	            }
	        });
	        $scope.$watch('profile._lat', function(newLat){
	            if (!$scope.profile) return;
	            if (!newLat) return;
	            newLat = parseFloat(newLat);
	            if (isNaN(newLat)) newLat = 0;
	            if (newLat > 90) newLat = 90;
	            else if (newLat < -90) newLat = -90;
	            if (!$scope.profile.location) $scope.profile.location = [0,0];
	            $scope.profile.location[1] = newLat;
	        });
	        $scope.$watch('profile._lng', function(newLng){
	            if (!$scope.profile) return;
	            if (!newLng) return;
	            newLng = parseFloat(newLng);
	            if (isNaN(newLng)) newLng = 0;
	            if (newLng > 180) newLng = 180;
	            else if (newLng < -180) newLng = -180;
	            if (!$scope.profile.location) $scope.profile.location = [0,0];
	            $scope.profile.location[0] = newLng;
	        });

	        // TEMPERATURE
	            
	        $scope.toggleTempMode = function() {
	            if($scope.settings.tempMode) {
	                $scope.settings.tempMode = false;
	            }
	            else {
	                $scope.settings.tempMode = true;
	                $scope.settings.selectedLayer = null; 
	                if ($scope.rightPaneMode == 'layer') $scope.rightPaneMode = 'snowpit';
	            }
	            
	        }
	        $scope.translateTemp = function(temp) {
	            temp = parseFloat(temp);
	            if (Global.user.settings.tempUnits == 1) {
	                var newTemp = (temp * 1.8 + 32).toFixed(1);
	                return (Math.round(newTemp * 1) / 1).toFixed(0) + "°F";
	            }
	            else return temp.toFixed(1) + "°C";
	        }
	        $scope.selectTemp = function(temp){
	            $scope.selectedTemp = temp;
	        }
	        $scope.settings.tempInterval = 10;
	        $scope.addTemp = function() {
	            if (!$scope.profile.temps) $scope.profile.temps = [];
	            var newTemp = null;
	            if ($scope.profile.temps.length == 0) {
	                newTemp = { depth: 0, temp: 0 };
	            }
	            else {
	                var bottomDepth = $scope.profile.temps[$scope.profile.temps.length-1].depth;
	                var spacing = $scope.settings.tempInterval;
	                if (spacing === null || isNaN(spacing)) {
	                    if ($scope.profile.temps.length > 2) spacing = bottomDepth - $scope.profile.temps[$scope.profile.temps.length-2].depth;
	                    else spacing = 10;
	                }

	                if (spacing < 0) spacing = 10;
	                if (bottomDepth + spacing > $scope.profile.depth) spacing = $scope.profile.depth - bottomDepth;
	                var newDepth = bottomDepth + spacing;
	                if (newDepth <= $scope.profile.depth)
	                    newTemp = { depth: newDepth, temp: $scope.profile.temps[$scope.profile.temps.length-1].temp };
	            }
	            if (newTemp) {
	                $scope.profile.temps.push(newTemp);
	                $scope.selectTemp(newTemp);
	            }
	        }
	        $scope.saveTemp = function(temp, $event, index) {
	            var depthInput = $($event.target.parentNode).children(".depth");
	            var newDepth = parseInt(depthInput.val());
	            if (isNaN(newDepth)) newDepth = temp.depth;
	            if (newDepth < 0) newDepth = 0;
	            if (newDepth > $scope.profile.depth) newDepth = $scope.profile.depth;

	            if ($scope.settings.depthDescending) newDepth = $scope.profile.depth - newDepth;
	            temp.depth = newDepth;

	            // interesting hack here: this allows the value attribute to stay bound
	            $scope.profile.temps = angular.copy($scope.profile.temps);
	            // select by index, since the entire array has technically been swapped above
	            $scope.selectTemp($scope.profile.temps[index]);
	        }
	        $scope.deleteTemp = function(temp) {
	            $log.debug("delete!");
	            var index = null;
	            for (var i = 0; i < $scope.profile.temps.length; i++) {
	                if ($scope.profile.temps[i] == temp) index = i;
	            }
	            // todo: why doesn't splice work when index is 0?
	            if (index == 0) $scope.profile.temps.shift();
	            else if (index) $scope.profile.temps.splice(index, 1);
	        }

	        // LAYERS

	        $scope.$watch('settings.selectedLayer', function(newLayer){
	            if (newLayer) {
	                // show layer pane
	                $scope.rightPaneMode = 'layer';
	            }
	        });

	        $scope.addLayer = function(index) {
	            var state = $state.params.profileId;

	            // calculate max possible layer height
	            var maxHeight = 0;
	            for (var i = 0; i < $scope.profile.layers.length ; i++) { 
	                maxHeight+= $scope.profile.layers[i].height; 
	            };
	            maxHeight = $scope.profile.depth - maxHeight;

	            if(maxHeight == 0) {
	                alert("There isn't room for a new layer.");
	                return;
	            }

	            // if default layer height doesn't fit, use max height
	            var newHeight = Math.floor($scope.profile.depth / 5) //30;
	            if (maxHeight < newHeight) newHeight = maxHeight;

	            var newLayer = { height: newHeight, hardness: 'F', hardness2: null };

	            // if index is specified, insert, otherwise, add at bottom
	            if (index == null) $scope.profile.layers.push(newLayer);
	            else $scope.profile.layers.splice(index + 1, 0, newLayer);

	            // hide 'add layer' tooltip
	            $timeout(function(){ $(".tooltip").remove() });
	            // show tooltip
	            if ($scope.tooltips) {
	                $timeout(function(){ 
	                    $(".layerDrag").tooltip('show');
	                    $(".layerHeight").tooltip('show');
	                });
	            }

	            $scope.selectLayer(newLayer);
	        }
	        $scope.deleteLayer = function() {
	            // first get layer index
	            var index = null;
	            angular.forEach($scope.profile.layers,function(layer, i) {
	                if (layer == $scope.settings.selectedLayer) index = i;
	            });
	            if (index == null) return;

	            // splice it out of the array
	            $scope.profile.layers.splice(index, 1);
	            $scope.settings.selectedLayer = null;
	            $scope.rightPaneMode = "snowpit";
	        }
	        $scope.selectLayer = function(layer){
	            $scope.settings.selectedLayer = layer;
	        }
	        $scope.selectLayerByIndex = function(index) {
	            $scope.selectLayer($scope.profile.layers[index]);
	        }
	        $scope.hoverDragArea = function(layer) {
	            $scope.settings.hoverDragLayer = layer;
	        }
	        $scope.getWidth = function(hardness) {
	            return Math.round($scope.graphWidth * $scope.hardness[hardness].width);
	        }
	        $scope.hardDif = function(layer){
	            if (!layer.hardness2) return 0;
	            return $scope.getWidth(layer.hardness) - $scope.getWidth(layer.hardness2);
	        }
	        $scope.hoverComment = function(comment) {
	            $scope.settings.hoverComment = comment;
	        }

	        // if primary grain type is deleted, make secondary grain type primary
	        $scope.$watch('settings.selectedLayer.grainType', function(){
	            if ($scope.settings && $scope.settings.selectedLayer &&
	                $scope.settings.selectedLayer.grainType == null) {
	                if ($scope.settings.selectedLayer.grainType2) {
	                    $scope.settings.selectedLayer.grainType = $scope.settings.selectedLayer.grainType2;
	                    $scope.settings.selectedLayer.grainType2 = null;
	                }
	            }
	        });
	        $scope.$watch('profile.surfaceGrainType', function(){
	            if ($scope.profile && $scope.profile.surfaceGrainType == null) {
	                if ($scope.profile.surfaceGrainType2) {
	                    $scope.profile.surfaceGrainType = $scope.profile.surfaceGrainType2;
	                    $scope.profile.surfaceGrainType2 = null;
	                }
	            }
	        });

	        // VIEWS

	        $scope.views = snowpitViews;
	        $scope.setView = function(view) {
	            $scope.settings.view = view;
	        }
	        $scope.calculateViews = function() {
	            angular.forEach($scope.views,function(view){ if (view.func) view.func($scope.profile); });
	        }

	        // TOGGLE DEPTH

	        $scope.toggleDepthDirection = function() {
	            $scope.settings.depthDescending = !$scope.settings.depthDescending;
	        }

	        // SELECT LOCATION MODAL

	        $scope.selectLocation = function() {

	            LocationSelectModal.open({
	                initialLocation: $scope.profile.location
	            }).then(function (location) {
	                if (location && location.length == 2) {
	                    location[0] = location[0].toFixed(6); 
	                    location[1] = location[1].toFixed(6); 

	                    $scope.profile.location = location;

	                    var featureCodes = 
	                        "&featureCode=MT" +
	                        "&featureCode=BUTE" +
	                        "&featureCode=CNYN" +
	                        "&featureCode=CONE" +
	                        "&featureCode=CRQ" +
	                        "&featureCode=CRQS" +
	                        "&featureCode=DVD" +
	                        "&featureCode=GAP" +
	                        "&featureCode=GRGE" +
	                        "&featureCode=HLL" +
	                        "&featureCode=HLLS" +
	                        "&featureCode=MESA" +
	                        "&featureCode=MND" +
	                        "&featureCode=MRN" +
	                        "&featureCode=MT" +
	                        "&featureCode=MTS" +
	                        "&featureCode=NTK" +
	                        "&featureCode=NTKS" +
	                        "&featureCode=PASS" +
	                        "&featureCode=PK" +
	                        "&featureCode=PKS" +
	                        "&featureCode=RDGE" +
	                        "&featureCode=RK" +
	                        "&featureCode=RKS" +
	                        "&featureCode=SLP" +
	                        "&featureCode=SPUR" +
	                        "&featureCode=VAL" +
	                        "&featureCode=VALG" +
	                        "&featureCode=VALS" +
	                        "&featureCode=VALX" +
	                        "&featureCode=VLC";


	                    $.getJSON("https://ba-secure.geonames.net/findNearbyJSON?lat=" + location[1] + "&lng=" + location[0] + "" + featureCodes + "&username=avatech")
	                    .success(function(data, status, headers, config) {
	                        if (data.geonames && data.geonames.length == 1) {
	                            var place = data.geonames[0];
	                            var name = "";
	                            if (place.name) name += place.name;
	                            // if US, append admin area code, otherwise append admin area name
	                            if (place.countryCode && place.countryCode == "US" && place.adminCode1) name += ", " + place.adminCode1;
	                            else if (place.adminName1) name += ", " + place.adminName1;

	                            // if metadata is null, initialize
	                            if (!$scope.profile.metaData) $scope.profile.metaData = {};

	                            if ($scope.profile.locationName == "" || !$scope.profile.locationName)
	                                $scope.profile.locationName = name;
	                           
	                            $scope.$apply();
	                        }
	                    });
	                    $.getJSON("https://ba-secure.geonames.net/srtm3JSON?lat=" + location[1] + "&lng=" + location[0] + "&username=avatech")
	                    .success(function(data, status, headers, config) {
	                        if (data.srtm3) {
	                            if (!$scope.profile.metaData) $scope.profile.metaData = {};
	                            var elevation = data.srtm3.toFixed(0);
	                            // check for 'empty' value of -32768 (http://glcfapp.glcf.umd.edu/data/srtm/questions.shtml#negative)
	                            if (elevation != -32768) {
	                                $scope.profile.elevation = elevation; // meters
	                                $scope.$apply();
	                            }
	                            // if no data found, check astergdem
	                            else {
	                                $.getJSON("https://ba-secure.geonames.net/astergdemJSON?lat=" + location[1] + "&lng=" + location[0] + "&username=avatech")
	                                .success(function(data, status, headers, config) {
	                                    if (data.astergdem) {
	                                        var elevation = data.astergdem.toFixed(0);
	                                        // check for 'empty' value of -9999 
	                                        if (elevation != -9999){
	                                            $scope.profile.elevation = elevation;
	                                            $scope.$apply();
	                                        }
	                                    }
	                                });
	                            }
	                        }
	                    });
	                }
	            }, function () {
	                // on dismiss
	            });
	        }

	        // EXPORT

	        var getProfileForExport = function() {
	            var _profile = angular.copy($scope.profile);

	            // populate with org details
	            if (_profile.organization && !_profile.organization._id) {
	                var org;
	                for(var i = 0; i < $scope.global.orgs.length; i++) {
	                    if ($scope.global.orgs[i]._id == _profile.organization) org = $scope.global.orgs[i];
	                }
	                if (org) _profile.organization = org;
	            }
	            return _profile;
	        }

	        $scope.exportPDF = function() { 
	            snowpitExport.PDF(getProfileForExport(), $scope.settings); 
	        };
	        $scope.exportJPEG = function() { 
	            snowpitExport.JPEG(getProfileForExport(), $scope.settings); 
	        };
	        $scope.exportCSV = function() { 
	            snowpitExport.CSV(getProfileForExport()); 
	        };

	        // PUBLISH

	        $scope.publish = function() {

	            // get total height of all layers
	            var totalHeight = 0;
	            for (var i = 0; i < $scope.profile.layers.length ; i++) { 
	                totalHeight+= $scope.profile.layers[i].height; 
	            };

	            // basic validation before publishing

	            if (totalHeight != $scope.profile.depth) {
	                alert("There is empty space in your snowpit. Please complete this snowpit, or adjust 'Snowpit Depth' as needed.");
	                return;
	            }
	            else if (!$scope.profile.date) {
	                alert("Before publishing, you must enter the date and time of this snowpit.");
	                return;
	            }
	            else if (!$scope.profile.location) {
	                alert("Before publishing, you must select the location of this profile.");
	                $scope.selectLocation();
	                return;
	            }

	            PublishModal.open({ 
	                initialSharing: angular.copy($scope.profile)
	            })
	            .then(function (sharing) {
	                angular.extend($scope.profile, sharing);
	                $scope.profile.published = true;
	                $scope.update();
	                $location.path('/obs/' + $scope.profile._id);
	            });
	        }

	        // PHOTO UPLOAD

	        $scope.deletePhoto = function(index) {
	            if (index == 0) $scope.profile.media.shift();
	            else $scope.profile.media.splice(index,1);
	        }

	        $scope.onFileAdd = function(file) {
	            if ($scope.uploading == null) $scope.uploading = [];
	            file.uploading = true;
	            $scope.uploading.unshift(file);
	            $scope.$apply();
	        }
	        $scope.onFileProgress = function(file) {
	            $scope.$apply();
	        }

	        $scope.onFileUpload = function(file) {
	            if ($scope.profile.media == null) $scope.profile.media = [];
	            file.uploading = false;
	            file.caption = file.name;
	            file.type = "photo";
	            file.URL = file.url;
	            delete file.url;
	            $scope.profile.media.unshift(file);
	            $scope.$apply();
	        };


	        $scope.showPhoto = function(index) {
	            Lightbox.openModal($scope.profile.media, index);
	        }

	        // UTILITIES

	        $scope.round = function(num) {
	            //return parseInt(num.toFixed(0));
	            return Math.round(num);
	        }

	        // set date picker
	        // setTimeout(function(){
	        //     var picker = new Pikaday({
	        //         field: document.getElementById('datepicker')
	        //         , maxDate: new Date()
	        //         //, format: 'YYYY-MM-DD'
	        //         , onSelect: function() {
	        //             //$log.debug(picker.toString());
	        //             //$log.debug(this.getMoment().format('Do MMMM YYYY'));
	        //         }
	        //     });
	        //     // todo:find a more elegant way to make sure the picker loads the date
	        //     setTimeout(function(){
	        //         picker.setMoment(moment(document.getElementById('datepicker').value));
	        //     },500);
	        // },1);
	    })

	.directive('draggable', function($document, $timeout, $log) {
	    return {
	      restrict: 'A',
	      scope: { layer: '=draggable' },
	      link: function(scope, elm, attrs) {

	        var startY, initialMouseY, initialHeight;

	        var ControlScope = scope.$parent.$parent;
	 
	        elm.bind('mousedown', function($event) {
	            // turn off layer drag tooltip
	            $timeout(function(){ $(".tooltip").remove() });

	          ControlScope.selectLayer(scope.layer);
	          ControlScope.settings.dragging = scope.layer;
	          $event.preventDefault();
	          initialHeight = scope.layer.height;
	          startY = elm.prop('offsetTop');
	          initialMouseY = $event.clientY;
	          $document.bind('mousemove', mousemove);
	          $document.bind('mouseup', mouseup);
	          return false;
	        });
	 
	        function mousemove($event) {
	          ControlScope.settings.dragging = scope.layer;
	          var dy = $event.clientY - initialMouseY;

	          var newHeight = initialHeight + (dy / (ControlScope.snowpitHeight / ControlScope.profile.depth));
	          if (newHeight < 1) newHeight = 1;
	                
	          scope.layer.height = Math.round(newHeight);
	          scope.$apply();
	          return false;
	        }
	 
	        function mouseup() {
	            // remove existing tooltips
	            $timeout(function(){ $(".tooltip").remove() });
	            // show hardness drag tooltip
	            $log.debug(ControlScope.tooltips);
	            if (ControlScope.tooltips) { $timeout(function(){ $(".hardnessBar").tooltip('show') }); }

	          $document.unbind('mousemove', mousemove);
	          $document.unbind('mouseup', mouseup);
	          ControlScope.settings.dragging = null;
	          scope.$apply();
	        }
	      }
	    };
	  })

	.directive('draggableHardness', function($document, $timeout, $log) {
	    return {
	      restrict: 'A',
	      scope: { layer: '=draggableHardness' },
	      link: function(scope, elm, attrs) {

	        var initialMouseX, initialWidth, initialHardness, initialHardness;

	        var ControlScope = scope.$parent.$parent;
	 
	        elm.bind('mousedown', function($event) {
	            ControlScope.selectLayer(scope.layer);

	            // turn off hardness drag tooltips
	            $timeout(function(){ $(".tooltip").remove() });
	            // turn off tooltips (if more are added, add to "final" tooltip)
	            //ControlScope.disableTooltips();
	            //scope.$apply();


	            // ControlScope.settings.dragging = scope.layer;
	            $event.preventDefault();

	            initialHardness = scope.layer.hardness;
	            initialHardness2 = scope.layer.hardness2;
	            if (!initialHardness2) initialHardness2 = scope.layer.hardness;

	            initialMouseX = $event.clientX;

	            if (attrs.draggableType == "bottom")
	                initialWidth = ControlScope.hardness[initialHardness2].width * ControlScope.graphWidth;
	            else
	                initialWidth = ControlScope.hardness[initialHardness].width * ControlScope.graphWidth;

	            $document.bind('mousemove', mousemove);
	            $document.bind('mouseup', mouseup);
	            return false;
	        });
	 
	        function mousemove($event) {
	            //ControlScope.settings.dragging = scope.layer;
	            var dx = $event.clientX - initialMouseX;

	            var newPos = Math.round(initialWidth - dx);

	            // make sure within mix/max allowed ranges
	            var min, max;
	            var index = 0;
	            for (key in ControlScope.hardness) {
	                var hardness = ControlScope.hardness[key]
	                var width = hardness.width * ControlScope.graphWidth;
	                if (index == 0) min = width;
	                else if (index == ControlScope.hardnessCount - 1) max = width;
	                index++;
	            }
	            if (newPos < min) newPos = min;
	            if (newPos > max) newPos = max;

	            // snap to nearest hardness level
	            for (key in ControlScope.hardness) {
	                var hardness = ControlScope.hardness[key]
	                var width = hardness.width * ControlScope.graphWidth;
	                if (newPos > width - 6 && newPos < width + 6) {
	                    if (attrs.draggableType == "both") {
	                        ControlScope.settings.selectedLayer.hardness = key;
	                        ControlScope.settings.selectedLayer.hardness2 = key;
	                    }
	                    else if (attrs.draggableType == "bottom") {
	                        ControlScope.settings.selectedLayer.hardness2 = key;
	                    }
	                    else if (attrs.draggableType == "top") {
	                        $log.debug("top!");
	                        ControlScope.settings.selectedLayer.hardness2 = initialHardness2;
	                        ControlScope.settings.selectedLayer.hardness = key;
	                    }
	                    scope.$apply();
	                    return;
	                }
	            }
	            return false;
	        }
	 
	        function mouseup() {
	            // show top/bottom hardness tooltips
	            if (ControlScope.tooltips) $timeout(function(){ 
	                $(".hardnessDragTop").tooltip("show") 
	                $(".hardnessDragBottom").tooltip("show") 
	            });
	            // turn off tooltips (if more are added, add to "final" tooltip)
	            ControlScope.disableTooltips();
	            scope.$apply();


	          $document.unbind('mousemove', mousemove);
	          $document.unbind('mouseup', mouseup);
	          //ControlScope.settings.dragging = null;
	          scope.$apply();
	        }
	      }
	    };
	  });

/***/ },
/* 30 */
/***/ function(module, exports) {

	angular.module('avatech').factory('snowpitExport', function ($q, snowpitConstants,$compile,$rootScope, Global) { 

	var getGrainType = function(icssg) {
	    for (var i = 0; i < snowpitConstants.grainTypes.length;i++){
	        for (var j = 0; j < snowpitConstants.grainTypes[i].types.length; j++) {
	            if (snowpitConstants.grainTypes[i].types[j].icssg == icssg) {
	                return snowpitConstants.grainTypes[i].types[j];
	            }
	        }
	    }
	}

	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function dataURItoBlob(dataURI) {
	    // convert base64/URLEncoded data component to raw binary data held in a string
	    var byteString;
	    if (dataURI.split(',')[0].indexOf('base64') >= 0)
	        byteString = atob(dataURI.split(',')[1]);
	    else
	        byteString = unescape(dataURI.split(',')[1]);

	    // separate out the mime component
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	    // write the bytes of the string to a typed array
	    var ia = new Uint8Array(byteString.length);
	    for (var i = 0; i < byteString.length; i++) {
	        ia[i] = byteString.charCodeAt(i);
	    }

	    return new Blob([ia], {type:mimeString});
	}

	function isNorU(val) {
	    return (val === null || val === undefined);
	}

	var formatters = {

	    format: function(str) {
	        if (isNorU(str) || str == "") return "--";
	        return str;
	    },
	    formatOrg: function(org) {
	        if (isNorU(org) || org == "" || !org.name) return "--";
	        return org.name;
	    },
	    formatCm: function(str) {
	        if (isNorU(str)) return "--";
	        return str + " cm";
	    },
	    formatCmOrIn: function(str) {
	        if (isNorU(str) || isNaN(str)) return "--";

	        if (Global.user.settings.elevation == 1) 
	            return numberWithCommas(Math.round(parseFloat(str) * 0.393701)) + " in";
	        else return numberWithCommas(Math.round(parseFloat(str))) + " cm";

	        return "--";
	    },
	    formatDistance: function(str) {
	        return this.formatElevation(str);
	    },
	    formatKmOrMiles: function(str) {
	        if (isNorU(str) || isNaN(str)) return "--";

	        var km = parseFloat(str);
	        if (Global.user.settings.elevation == 1) 
	            return (km * 0.621371).toFixed(3) + " mi"; 
	        else return km.toFixed(3) + " km";
	    },
	    formatMetersOrFeet: function(str) {
	        return this.formatElevation(str);
	    },
	    formatElevation: function(str) {
	        if (isNorU(str) || isNaN(str)) return "--";

	        var val;
	        if (Global.user.settings.elevation == 1) 
	            return numberWithCommas(Math.round(parseFloat(str) * 3.28084)) + " ft";
	        else return numberWithCommas(Math.round(parseFloat(str))) + " m";

	        return "--";
	    },
	    formatTemp: function(str) {
	        var temp = parseFloat(str);
	        if (isNorU(str) || isNaN(temp)) return "--";

	        if (Global.user.settings.tempUnits == 0)
	            return temp.toFixed(1) + "°C";
	        else {
	            var newTemp = (temp*1.8+32).toFixed(1);
	            return (Math.round(newTemp * 1) / 1).toFixed(0) + "°F";
	        }
	    },
	    formatSlope: function(str) {
	        if (isNorU(str) || isNaN(str)) return "--";
	        return parseFloat(str).toFixed(0) + "°";
	    },
	    formatDirection: function(str) {
	        if (isNorU(str)) return "--";

	        var direction = parseFloat(str);
	        if (isNaN(direction)) return "--";

	        if ((direction > 354.38 && direction <= 360) || (direction >= 0 && direction < 5.62)) str='N';
	        else if (direction >5.63 && direction < 16.87) str='NbE';
	        else if (direction >16.88 && direction < 28.12) str='NNE';
	        else if (direction >28.13 && direction < 39.37) str='NEbN';
	        else if (direction >39.38 && direction < 50.62) str='NE';
	        else if (direction >50.63 && direction < 61.87) str='NEbE';
	        else if (direction >61.88 && direction < 73.12) str='ENE';
	        else if (direction >73.13 && direction < 84.37) str='EbN';
	        else if (direction >84.38 && direction < 95.62) str='E';
	        else if (direction >95.63 && direction < 106.87) str='EbS';
	        else if (direction >106.88 && direction < 118.12) str='ESE';
	        else if (direction >118.13 && direction < 129.37) str='SEbE';
	        else if (direction >129.38 && direction < 140.62) str='SE';
	        else if (direction >140.63 && direction < 151.87) str='SEbS';
	        else if (direction >151.88 && direction < 163.12) str='SSE';
	        else if (direction >163.13 && direction < 174.37) str='SbE';
	        else if (direction >174.38 && direction < 185.62) str='S';
	        else if (direction >185.63 && direction < 196.87) str='SbW';
	        else if (direction >196.88 && direction < 208.12) str='SSW';
	        else if (direction >208.13 && direction < 219.37) str='SWbS';
	        else if (direction >219.38 && direction < 230.62) str='SW';
	        else if (direction >230.63 && direction < 241.87) str='SWbW';
	        else if (direction >241.88 && direction < 253.12) str='WSW';
	        else if (direction >253.13 && direction < 264.37) str='WbS';
	        else if (direction >264.38 && direction < 275.62) str='W';
	        else if (direction >275.63 && direction < 286.87) str='WbN';
	        else if (direction >286.88 && direction < 298.12) str='WNW';
	        else if (direction >298.13 && direction < 309.37) str='NWbW';
	        else if (direction >309.38 && direction < 320.62) str='NW';
	        else if (direction >320.63 && direction < 331.87) str='NWbN';
	        else if (direction >331.88 && direction < 343.12) str='NNW';
	        else if (direction >343.13 && direction < 354.37) str='NbW';

	        direction = direction.toFixed(0);
	        
	        return direction + "° " + str;
	    },
	    formatWindSpeed: function(str) {
	        if (isNorU(str) || isNaN(str)) return "--";

	        var speed = parseFloat(str);
	        // imperial = mi/h
	        if (Global.user.settings.elevation == 1) return (speed * 2.23694).toFixed(2) + " mi/h";
	        // metric = m/s
	        else return str + " m/s";

	        return "--";
	    },
	    formatPrecip: function(str) {
	        if (isNorU(str)) return "--";

	        if (str == "NO") return "No Precipitation";

	        if (str == "RA1") return "Rain - Very Light";
	        if (str == "RA2") return "Rain - Light";
	        if (str == "RA3") return "Rain - Moderate";
	        if (str == "RA4") return "Rain - Heavy";

	        if (str == "SN1") return "Snow - Very Light";
	        if (str == "SN2") return "Snow - Light";
	        if (str == "SN3") return "Snow - Moderate";
	        if (str == "SN4") return "Snow - Heavy";
	        if (str == "SN5") return "Snow - Very Heavy";

	        if (str == "RS") return "Rain & Snow";
	        if (str == "GR") return "Graupel & Hail";
	        if (str == "ZR") return "Freezing Rain";

	        return "--";
	    },
	    formatSky: function(str) {
	        if (isNorU(str) || str == "") return "--";
	        if (str == "CLR") return "Clear";
	        if (str == "FEW") return "Few";
	        if (str == "SCT") return "Scattered";
	        if (str == "BKN") return "Broken";
	        if (str == "OVC") return "Overcast";
	        if (str == "X") return "Obscured";

	        return "--";
	    },
	    getSkyIcon: function(symbol) {
	        if (symbol == "BKN") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwRDc0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDg0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBDMTBENTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBENjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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";
	        else if (symbol == "CLR") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OERBMzZEQkU0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OERBMzZEQkY0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRCQzQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4REEzNkRCRDQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0zMjIzPUZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYBGSEhKiUqMyAgM0YzKjNGRkY4OEZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRv/AABEIAHEAcAMBIgACEQEDEQH/xAByAAEAAwEBAQEAAAAAAAAAAAAABQYHBAMCAQEBAAAAAAAAAAAAAAAAAAAAABAAAQMBBAULAwUBAAAAAAAAAQACAwQRIRIFMUFRIgbwYXGRobHB0TJCE4FSkuFiIzMUghEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AtiIiAviSRsTS55DWjWVH5lm0WXtsO9IRus89gVLnq6rNZMN7vtY3QOW0oLHWcTRR2tpxjP3G5vmexQM2fVkptx4eZtylqPhcEB1S6/7W+J8lNQ5NRwiwRh3O/e7/AAQUU11VM635Hk8xPggrqqF1vyPB5yfFaSyJkfoaBZdcEfEyT1tBtuvCCgQZ9WQutL8Y2P0dlhVhouJIZzhmHxO26W9er63LvmyajmFhjDedm73eKg67hgjepXW/sd4HzQW1rg8Ymm0HWF+rOIKuqyuTDe2zSx2g8toV0y3NoswbYN2QDeZ5bQgk0REBROcZo2gjwj+14OAbP3fTtUlNK2FjpH+lotKzeWSXMqm3S6R1jRs2DoH6oPuioZszlIab/U97uWtXygy6KhZhjF/udrKZdQMoIhG2zF7nbTy0LtQEREBERAREQcVfl0VczDIL/a7WFQ62hmyyUBxv9THt5alpK4sxoGV8RjdZi9rth5aUHjlOZNr4rTYJG3Pb49BUms5o55Mrq960YThkG0a/MLRWuDgHC8G8IK1xRVlkbadvv3ndA0dvcubhihxF1U8XDdZ06z4dajc/mM1Y/Yyxg+n6kq6ZbTf5aaOPWBa7pN5QdqIiAiIgIiICIiAiIgp/E9EGubUt9267p1FSPDdYZ6f4neqK7/k6PJdmdwfNRyDW0Y/xv7rVU+H6kw1bW+2TdI7urzQctaf9FY+27FJh7bFpDRhAGxZrVWw1jy+6yQk/latKBxC0a0H6iIgIiICIiAiIgIiIPiVgkY5hFocCLOlZvl7jBVx2i8PA7bFpL3YWl2wWrNaPFNVsIF7ng9tqD3zyMx1slus4usK90E4qKeOUe5o69faq5xVTG2OcC6zA49o8V78MVgfG6mdpZvN6Dp6j3oLMiIgIiICIiAiIgIiII/N5RFRyk62lv5XeKpeRxOkrI8PtOI9AU5xRVhsbacaXHE7oGjrPcv3hekwsdUuF7t1vQNPb3IJ6spW1kLoX6HDTsOorPoJZMsqrSN6N1jhtGvrGhaUoLPcp/wBjPmj/ALWDR9w2dOzqQS1LUx1cYliNrTysPOvdZ5lebSZc8gjFGfUzxHOr5TVUdUwSRG0Hs6UHuiIgIiICIiAvCqqY6SMyymxo5WDnSpqo6VhklNgHb0Kh5pm0mYvAAwxj0s8TzoPgmTN6zZjd+Lf0HatCghbBG2NnpaLAonJMr/wx43j+V/q5hs81NICIiCv5vkTaoGWABsukjU7yPI7VU4Kmoy2U4CWOFzmnxC0xclZQQ1rcMrbTqcNI6CgiqLiOCYYZ/wCN232ny5XqcjmZKLY3Bw2tNvcqbVcMTsJMBD26gbj5dqiXUlXSu9D2Hmt7wg0xFmrcwq4N35Ht12EnxR2YVc+78j3a7AT4INGlmjhGKRwaNpNigK7iWKLdpx8jvu0N8yquyjq6t1ga97trre8qYo+GJXm2oIY37W3nyHaghp6mozKUYyXuNzWjwCtmUZE2lAlnAdLpA1N8zyG1S1JQQUbbIWgc+s/VdSAiIgIiICIiAiIg4Kj1pT+tEQd6IiAiIgIiIP/Z";
	        else if (symbol == "FEW") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwQ0Y0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDA0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRDMDQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBDRTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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";
	        else if (symbol == "X") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OERBMzZEQkE0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OERBMzZEQkI0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRCODQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4REEzNkRCOTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAICAgICAgICAgIDAgICAwQD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";
	        else if (symbol == "OVC") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwRTBCQjA0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwRTBCQjE0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBFMEJBRTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBFMEJBRjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTExQUExMcGxsbHB8fHx8fHx8fHx8BBwcHDQwNGBAQGBoVERUaHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fH//AABEIAG8AcAMBEQACEQEDEQH/xAB+AAEBAQEAAgMAAAAAAAAAAAAACAcGAwQCBQkBAQAAAAAAAAAAAAAAAAAAAAAQAAEDAgQDAgoIBgIDAQAAAAECAwQABRESBgchMQhBE1FhcSKzFHU2VhiB0TJC0iOTlJFSYoIkFaFysaIzYxEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AqmgUCg9K8Xu0WWA7cLtMZgwmQVOSH1pbQAOPNRFBP+vusvTFtVIh6PgrvElHmtT5GZmJm7SEea6tI/tx8nGgwu/9TO8l4m+si+KtqBjkjW9CWWkg4cOOdasMOGZRNBy1y3S3LuEky5mprop5QCSpMp1oYDl5rakJ/wCKBbd0ty7fJEuHqa6JeSCkKVKddGB5+a4paf8Aig6zTfU7vDZJxlLvH+3bUnKqJckd60cO0ZC0tJ/6qFBvm3vWFo29Ooh6rjK09LXwTKBU/EJxwAKwnO3j/UnKO00G9wbhBuEVuXBkNyoroxbfZWFoUPEpJIoPPQKBQKBQZZvHv/pbbuKuIlSbjqR1sri21s4pSccoU+ofYTjjw5nDhQSDeNSbsbyajEX/ACru8pfeR7VGChEjAnKFZMciAnNgXFnHDmaDctAdGFtbjNTNbXJx+SoJUq2QSENoxGJS48oFSjxwOUDymg2GwbDbRWNnu42mIUlRSELdnNiYpWHHH8/OkHxpAoMk60bfb4WidNMwozUZpuetCG2UJbSlIYOCQEgAAeCgdF1vt83ROpWZsZqS05PQhbbyEuJUksDFJCgQQfBQa3f9htor4z3cnTEKMoJKEOwWxDUnHjj+RkST41A0GK7jdGSMrk7Qc8ggYm0Tjjif/wAnx/4WP7qDF7RqbdrZzUfqhMq0utrzv2qTmMSQkHAqyE5FpVlwDiOPgNBXuzm/+ltxIqIilJt2pGmwuVbXDglRxylTCj9tOOHDmMeNBqdAoFBj3UPvfF2/sSrXblFeqroysQcuGEZBxT6wvEKHmn7CcOJ8VBJu1G1WpN1NTvx2pJaYb/yLtdn8XCnOTxwJzOOLPIY+M0F07d7aaV0FZW7bY4qUOZEiXOUkd/IWn7zi+fMnBPIUHVUCgm7rd9ztOe0XPQGgdEXudqP2i36AUFI0Cg5XcTbTSuvbK5bb5FStzIoRJyUjv461febXz5gYp5GghbdfarUm1ep2I7skusOf5FpuzGLZVkI44A5m3EHmMfGKCv8AYHeWLuJphKJi2mtS29IRcYiCfOSOCX0hX3V9vE4HhQapQfVar1Hb9NacuN+uK8kO3MLfdPaco81I8alYJHjoPzwUrVG6m5IBWX7vf5mCM2YoZQtRIGHnFLTKP4AUF97a7e2XQelYtitjaSptIVMlhOVch/DznF8SfIMeAoOpoFAoJu63fc7TntFz0BoHRF7naj9ot+gFBSNAoFBy25W3tl15pWVYrm2kKcSVQ5ZTmXHfw81xHEHyjHiKCF9OXbUezm7IEkqQ9aJfq1zZTmCJEUnBeA83MFtnO3j24Gg/Qm23CJcrfGuENwOxJbSH47o5KbcSFJP0g0E09autZEaBZtHRnkpRPzT7i2lRCy20rIwFpH3FLCiMe1HioPX6MtuEBqfryakKWoqg2kfygcX3PpxCB/dQVNQKBQKCbut33O057Rc9AaB0Re52o/aLfoBQUjQKBQKCVetDb5pItuuYbZDilCBdMoJB4FTDhPZyKD9FB1HR1rx+86Kl6ZmO95I0+4n1UqJKvVZBUpCST2IWFAeAYCgwHqZvki77z3wOYpTAU1AYSVZgEMoH2fAFKUpWHhNBa+12lo+ltvrDY2SFeqxGy+4niFvODvHljEA4FxZwx7KDqaBQKBQTd1u+52nPaLnoDQOiL3O1H7Rb9AKCkaBQKBQZ31B6cbv20GpI6ggOw4qrgwtzNglUP85WGX7xbSpI8tBI/TBqWdZd4LOzHUosXfPAltA4JUhxOZJPP7C0JVQcvubdV3DdTUU64o7wf7aQl5DXmZm2Xi3gDxwJQjnQb9H62bbHYbYa0s6G2kpQgGSknKkYDE5KD5/PBB+Fnf3KfwUD54IPws7+5T+CgfPBB+Fnf3KfwUD54IPws7+5T+CgzTfPqAjbnWW225q0LtqoElUguKdDgUFNlGXAAeGgbGdQEbbGy3K3O2hdyVPkpkBxLobCQlsIy4EHwUGl/PBB+Fnf3KfwUD54IPws7+5T+CgfPBB+Fnf3KfwUD54IPws7+5T+Cg8Fw61bdMgSYi9LLKJDS2lBT6VJwWkp4pKOI40GA7VXOTbtzdMTYuUPJucZAzDEYOuhtXD/AKrNB890rW5bd0tSwphzFN0kLcLRBOR50uDLj25V/wAaCiYnRRpeTEZkp1LOSl5tLgSWGcQFgHDn46DzfJBpn4nm/oNfXQPkg0z8Tzf0GvroHyQaZ+J5v6DX10D5INM/E839Br66DLt++n+07ZWO2XGFdpFxXPkqjrbebQgJCWyvEZSfBQNhOn+07m2O53GbdpFuXAkpjobZbQsKCmwvE5iPDQaj8kGmfieb+g19dA+SDTPxPN/Qa+ugfJBpn4nm/oNfXQPkg0z8Tzf0GvroPTvPRlpG12ibc5OqpbceCw7JecWw0EpQ0grUVYHkAKCetqLW/c9ztMQoxSHFXOMtJUcBg06HFf8Aqg0HU9Tlhfs2816UvMUXHurgwtQwCkvIAOXwhK0KT9FBZmzuqzqrbPT96cw9YeiIalAFP/3YxZcOCeCcykZgOwGg7KgUCgUE3dbvudpz2i56A0Doi9ztR+0W/QCgpGgUCgUGc9Q2pEWHZ/Ub+Ke9mxzb2UrBIUZf5Sxw7Q2pZHjFBJPS9puRe94rQtolLdpS5cpChhwQ0Agc/wCZx1KfpoNi609ESZdptGsYzaVN2wqhXBQT54bfWCypSv5UuYjyq8dB9d0Z7kISZ2g5ywkrKp1oUealcn2v4ALH91BVdAoFAoJu63fc7TntFz0BoHRF7naj9ot+gFBSNAoFAoJR6z9w2XXbboaE5mUwRPupSo8FEFLDRHLkSs/RQdh0faBdsmh5GpZrSUS9QrCopI/MERklKMcexa8yh4sDQbdqKw23UFjnWS5t99AuDKmJDeOBKVjDgRyI5g0H586hsmrNntzk5QpmZapPrNslEENyY4WciuB4pcR5q04+EUFw7SboWjcbSjd6hI9XlNK7m4QSoFTLwAJ8eRWOKSef0UHa0CgUE3dbvudpz2i56A0Doi9ztR+0W/QCgpGgUCg4rdvdC0bc6UcvU1HrEp1Xc2+CFAKeeIJHjyJwxURy+mgjLb7S9+3n3aXIuilOMSZBn32QCcG4wVj3aOIIzcGkYfZ59lBfkGFFgwmIUVsNRozaWWGxyShACUgeQCg81BnG9uz1o3H0y4yW0t6ghtrVZ5xOUpcwxDTigFflLP2uHDmONBFGltXa92l1k+qMlcC6RFFi422QCWnU88jqARmHalQPjBoLZ2i3u0ruPbkpiOCLfmWkrn2pfBSTyKmiftox7RxHbQaLQKCbut33O057Rc9AaB0Re52o/aLfoBQUjQKDOt3d7tK7cW5SZbglX55pS4FqRxUo8gp0j7CMe08T2UETap1dr3drWTCpKVz7pLUGLdbY4IaaTzyNIJOUdqlE+MmguPZzau2bdaSZtTBS/cXvzblOyJSp109nDjkRySCaDu6BQKDgN3NmtNbk2YRZ/wDiXSPiqBdW0guNE80qHDOhWHFJPkwNBE+t9rdxts7x38yNIjsx3cYN8iE90rKrzFpdQcW1cMcqsCKDUtuusfUNqYbgaxhC8Rm0hLc9ghqUABgO8B8xzlz4Hw40G6aY6l9nr+FJTexbH05j3FyQYxypw84OHM1xx4DPj4qDKer3Vul9RaKsDtiu0S5oauTiXDFeQ7lPcHmEkkUDpC1bpfTuir+7fbtEtiHbk2lsynkNZj3A5BRBNBqmrOpjaHTzJy3lN2lYAoi21JfxxBwxdGDI4jj5+PioMA3G6v8AWF8S5B0qwLBb1jKqSSHJisfAv7Lf9ox8dBnWiNrdxtzLx6xDjPyGZDuM++Sye6TmV561OLOLiuOOVOJoLY2j2a01ttZjFgf5d0kYKn3VxIDjpHJKRxyITjwSD5cTQd/QKBQKBQfX38WE2aWNQeq/6Ytq9e9e7sRu6+93ve+Zl8OagmnWOyXTXeZL8uya9ten3ncSlhq4wn4qVntDS3Urw/pDgoMhvOxyIkgItuu9J3NhRVg6LvFYIAOCcyXF81DjgCcPDQczcdurxCklhNyskxIAPfxrzbVNnHsBU+g4jyUC3bdXibJDCrlZIaSCe/k3m2pbGHYSl9ZxPkoOpsGxsabN7u8a90raYgwzSBdYkpZBxxyNocTiR/UpPloNj0Hs9006efbmXvW1n1LMQB5kqfCbi5gccfV0uqx8i1qFBStt/wBb6kz/AKzufUco7j1bL3WXsyZPNw8lB7NAoFB//9k=";
	        else if (symbol == "SCT") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwRDM0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDQ0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBDMTBEMTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBEMjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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";
	        else return "";
	    },
	    formatWind: function(speed,direction) {
	        var str = "";

	        if (speed == "C") str = "Calm";
	        else if (speed == "L") str = "Light";
	        else if (speed == "M") str = "Moderate";
	        else if (speed == "S") str = "Strong";
	        else if (speed == "X") str = "Extreme";

	        if (direction != null) {
	            str += ", " + formatters.formatDirection(direction);
	        }
	        if (str == "") return "--";
	        else return str;
	    },
	    formatBlowingSnow: function(speed,direction) {
	        var str = "";

	        if (speed == "None") str = "None";
	        else if (speed == "Prev") str = "Previous";
	        else if (speed == "L") str = "Light";
	        else if (speed == "M") str = "Moderate";
	        else if (speed == "I") str = "Intense";
	        else if (speed == "U") str = "Unkown";
	        if (direction != null) {
	            str += ", " + formatters.formatDirection(direction);
	        }
	        if (str == "") return "--";
	        else return str;
	    },
	    formatLatLng: function(point) {
	        if (!point) return "--"
	        var s = "";

	        if (point.lat != null && point.lng != null) {
	            s+= point.lat.toFixed(5) + ", "
	            s+= point.lng.toFixed(5)
	        }
	        else if (point.length == 2) {
	            s+= point[1].toFixed(5) + ", "
	            s+= point[0].toFixed(5)
	        }
	        else s = "--"

	        return s;
	    },
	    formatLatLngAsUTM: function(point, html) {
	        if (!point) return "--"
	        var s = "";

	        var lat, lng;
	        if (point.lat != null && point.lng != null) {
	            lat = point.lat;
	            lng = point.lng;
	        }
	        else if (point.length == 2) {
	            lat = point[1];
	            lng = point[0];
	        }
	        else return "--";

	        // get utm
	        var utm = LatLonToUTMXY(DegToRad(lat), DegToRad(lng));

	        var e = utm.x.toFixed(0);

	        var n = utm.y.toFixed(0);
	        if (n.length == 6) n = "0" + n;

	        var _e = e;
	        var _n = n;
	        if (html) {
	            _e = e.substr(0, 1);
	            _e += "<span>" + e.substr(1, 2) + "</span>";
	            _e += e.substr(3, 3);

	            _n = n.substr(0, 2);
	            _n += "<span>" + n.substr(2, 2) + "</span>";
	            _n += n.substr(4, 3);
	        }

	        // format
	        s += utm.zone + utm.band + " ";
	        s += _e + " ";
	        s += _n;

	        return s;
	    },
	    formatDate: function(date,time) {
	        var str = "";
	        if (date) str += moment(date).format("YYYY-MM-DD");
	        if (time) str += " " + moment(time).format("h:mm a"); //todo: user setting 24 hour/ 12 hour clock
	        if (str == "") str = "--";
	        return str;
	    },
	    formatDuration: function(minutes) {
	        var str = "--";
	        if (minutes >= 60) {
	            var hours = minutes / 60;
	            //var mins = Math.floor(minutes % 60);
	            var mins = parseInt(minutes % 60);
	            str = Math.floor(hours) + " hr";
	            if (mins > 0) str += " " + mins + " min";
	        }
	        else str = Math.floor(minutes) + " min";
	        return str;
	    },
	    formatGrainType: function(icssg) {
	        var grainType = getGrainType(icssg);
	        if (grainType) {
	            return icssg + " - " + grainType.desc;
	        }
	        return "--";
	    }
	};

	return {
	    formatters: formatters,
	    CSV: function(profile) {
	        var text = "depth top (cm),height (cm),hardness top,hardness bottom,grain type primary,grain type secondary\n";

	        angular.forEach(profile.layers,function(layer){
	            text += profile.depth - layer.depth - layer.height + ",";
	            text += layer.height + ",";
	            text += layer.hardness + ",";
	            text += layer.hardness2 + ",";
	            if (layer.grainType) text += layer.grainType + ",";
	            if (layer.grainType2) text += layer.grainType2 + "";

	            text += "\n";
	        });

	        var data = "data:text/csv;base64," + btoa(unescape(encodeURIComponent(text)));

	        var link = document.createElement('a');
	        angular.element(link)
	            .attr('href', data)
	            .attr('download', 'profile.csv');
	        link.click();
	    },
	    PDF: function(profile, _settings) {
	        this.PDForJPEG(profile, _settings, 'PDF');
	    },
	    JPEG: function(profile, _settings) {
	        this.PDForJPEG(profile, _settings, 'JPEG');
	    },
	    PDForJPEG: function(profile, _settings, PDForJPEG) {

	        var columns = [
	            { width: 150 },
	            { width: 27 },
	            { width: 353 },
	            { width: 240 }
	        ];
	        // canvas options
	        var profileHeight = 708;
	        if (PDForJPEG == 'JPEG') profileHeight = 608;
	        var canvasOptions = { scale: 4, borderColor: "#000", labelColor: "#000", commentLineColor: "#000", background: "#fff", dashedLineColor: "#aaa", print: true, showDepth: true, showDensity: true };

	        var settings = {
	            selectedLayer: null,
	            dragging: null,
	            hoverDragLayer: null,
	            view: null,
	            depthDescending: true,
	            tempMode: false,
	            tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
	        }
	        if (_settings) {
	            if (_settings.view) settings.view = _settings.view;
	            if (_settings.depthDescending) settings.depthDescending = _settings.depthDescending;
	        }

	        // compile canvas
	        // todo: a cleaner event-based way? maybe two-way binding? $watch the param? "newScope.loaded = function..."
	        var canvasHtml = '<canvas profile-editor="profile" settings="settings" options="canvasOptionsPrint" columns="columnsPrint" width="1540" height="' + profileHeight + '"></canvas>';
	        var newScope = $rootScope.$new();
	        newScope.profile = profile;
	        newScope.settings = settings;
	        newScope.canvasOptionsPrint = canvasOptions
	        newScope.columnsPrint = columns;
	        var canvas = $compile(angular.element(canvasHtml))(newScope)[0];

	        // timeout is used to allow the canvas time to render
	        // todo: a cleaner event-based way?
	        setTimeout(function() {

	            // canvas for JPEG output
	            var _canvas = document.createElement('canvas');
	            var scale = 2;
	            _canvas.width = 760 * scale;
	            _canvas.height = 930 * scale;
	            _canvas.style.display = 'none';
	            var context = _canvas.getContext("2d");
	            document.body.appendChild(_canvas);

	            context.fillStyle = "#fff";
	            context.fillRect(0,0,_canvas.width,_canvas.height);
	            context.fillStyle = "#000";

	            context.translate(-30 * scale, -18 * scale);
	            context.scale(scale,scale);

	            var render = {
	                drawImage: function(img, x, y, w, h) {
	                    if (img.tagName && img.tagName == "CANVAS") {
	                        var _img = img.toDataURL("image/jpeg",1);
	                        doc.addImage(_img, "JPEG", x, y, w, h);
	                    }
	                    else doc.addImage(img, "JPEG", x, y, w, h);

	                    x *= 3.779527559;
	                    y *= 3.779527559;
	                    w *= 3.779527559;
	                    h *= 3.779527559;
	                    x = parseInt(x) + .5;
	                    y = parseInt(y) + .5;
	                    w = parseInt(w) + .5;
	                    h = parseInt(h) + .5;

	                    if (img.tagName && img.tagName == "CANVAS") {
	                        context.drawImage(img, x, y, w, h);
	                    }
	                    else {
	                        var image = new Image();    
	                        image.src = img;
	                        image.onload = function() { context.drawImage(image, x, y, w, h); }
	                    }
	                },
	                drawLine: function(x1, y1, x2, y2) {
	                    doc.line(x1, y1, x2, y2);

	                    x1 *= 3.779527559;
	                    y1 *= 3.779527559;
	                    x2 *= 3.779527559;
	                    y2 *= 3.779527559;
	                    x1 = parseInt(x1) + .5;
	                    y1 = parseInt(y1) + .5;
	                    x2 = parseInt(x2) + .5;
	                    y2 = parseInt(y2) + .5;

	                    context.beginPath();
	                    context.moveTo(x1, y1);
	                    context.lineTo(x2, y2);
	                    context.stroke();
	                },
	                setLineWidth: function(width) {
	                    doc.setLineWidth(width);

	                    width *= 3.779527559;
	                    width = parseInt(width) + .5;

	                    context.lineWidth = width;
	                },
	                setFont: function(name, size, type) {
	                    if (!type) type = "normal";

	                    doc.setFont(name);
	                    doc.setFontSize(size);
	                    doc.setFontType(type);

	                    context.font = type + ' ' + size + 'pt ' + name;
	                },
	                setLineColor: function(r, g, b) {
	                    doc.setDrawColor(r, g, b);

	                    context.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
	                },
	                // setDrawColor: function(r, g, b) {
	                //     doc.setDrawColor(r, g, b);

	                //     context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
	                // },
	                setTextColor: function(r, g, b) {
	                    doc.setTextColor(r, g, b);

	                    context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
	                },
	                drawText: function(x, y, text, width) {
	                    if (width) { 
	                        var lines = doc.splitTextToSize(text, width, {});
	                        doc.text(x, y, lines);

	                        x *= 3.779527559;
	                        y *= 3.779527559;
	                        x = parseInt(x) + .5;
	                        y = parseInt(y) + .5;

	                        var lineHeight = doc.internal.getLineHeight();
	                        lineHeight *= 1.333333; //lineHeight is in pt, convert to px
	                        for(var i = 0; i < lines.length; i++) {
	                            var newY = y + (lineHeight * i);
	                            context.fillText(lines[i], x, newY);
	                        }
	                    }
	                    else {
	                        doc.text(x, y, text);

	                        x *= 3.779527559;
	                        y *= 3.779527559;
	                        x = parseInt(x) + .5;
	                        y = parseInt(y) + .5;

	                        context.fillText(text, x, y);
	                    }
	                },
	                addPage: function() {
	                    doc.addPage();
	                }
	            }

	            function drawParam(label, val, x, y, labelWidth) {

	                render.setFont("helvetica", 10.5, "normal");
	                render.setTextColor(110, 110, 110);
	                render.drawText(x, y, label);
	                render.setTextColor(0, 0, 0);
	                render.drawText(x + labelWidth, y, val);

	            }
	            
	            function drawSkySymbol(symbol, x, y) {
	                if (!symbol | symbol == "") return;
	                var imgData = formatters.getSkyIcon(symbol);
	                if (imgData != "") render.drawImage(imgData, x, y, 4, 4);
	            };

	            // All units are in the set measurement for the document
	            // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
	            var doc = new jsPDF("p", "mm", "letter");

	            var docWidth = 216;
	            var margin = 15;
	            var marginTop = 13;
	            var fullWidth = docWidth - margin;

	            var topLine = 12.6 + marginTop + 5;
	            var upperLine = 33.3 + 6;
	            var lowerLine = 73.7 + 6;

	            // draw logo
	            
	            var logoWidth = 64;
	            var logoHeight = 16;
	            var isLogoLoaded = $q.defer();
	            if (profile.organization && profile.organization.logoUrl) {
	                var logo = new Image();
	                logo.crossOrigin =" Anonymous";
	                logo.src = profile.organization.logoUrl + "?sdgdsgsdg";
	                logo.onload = function() {
	                    var photoWidthMM = logo.width * 0.264583333;
	                    var photoHeightMM = logo.height * 0.264583333;

	                    var scale = Math.min(logoWidth/photoWidthMM, logoHeight/photoHeightMM);
	                    var _photoWidth = photoWidthMM * scale;
	                    var _photoHeight = photoHeightMM * scale;

	                    // draw to canvas

	                    var photoCanvas = document.createElement("canvas");
	                    photoCanvas.height = (_photoHeight * 3.779527559) * 2;
	                    photoCanvas.width = (_photoWidth * 3.779527559) * 2;
	                    photoCanvas.style.display = "none";
	                    document.body.appendChild(photoCanvas);
	                    photoContext = photoCanvas.getContext('2d');
	                    photoContext.drawImage(logo,0,0,photoCanvas.width,photoCanvas.height);

	                    //var imgData = photoCanvas.toDataURL("image/jpeg",1);
	                    render.drawImage(photoCanvas, 
	                        // logo x, y
	                        docWidth - margin - (_photoWidth), 
	                        0 + marginTop - (_photoHeight - 9.8),
	                        //0 + marginTop + ((logoHeight - _photoHeight) / 2), 
	                        // logo width, height
	                        _photoWidth ,_photoHeight);
	                    isLogoLoaded.resolve();
	                }
	            }
	            else {
	                isLogoLoaded.resolve();
	            }

	            // 'Snow Profile' title

	            //var imgData = 'data:image/jpeg;base64,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';
	            var imgData = 'data:image/jpeg;base64,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';
	            //var imageScale = .03;
	            //render.drawImage(imgData, margin - .5, marginTop + 2.36, 300 * imageScale, 244 * imageScale);
	            var imageScale = .075;
	            render.drawImage(imgData, margin - .5, marginTop + 2.36, 1014 * imageScale, 100 * imageScale);

	            // var titleCanvas=document.createElement("canvas");
	            // titleCanvas.width = 600;
	            // titleCanvas.height = 70;
	            // titleCanvas.style.display = 'none'
	            // document.body.appendChild(titleCanvas);
	            // var ctx=titleCanvas.getContext("2d");
	            // ctx.fillStyle = "#fff";
	            // ctx.fillRect(0,0,titleCanvas.width,titleCanvas.height);

	            // ctx.fillStyle = "#000";

	            // ctx.font="700 68px 'Roboto Condensed'";
	            // ctx.fillText("Avanet",0,60);

	            // ctx.font="100 68px 'Roboto Condensed'";
	            // ctx.fillStyle = "#000";
	            // ctx.fillText("Snow Profile",206,60);

	            // setTimeout(function() {
	            //     render.drawImage(titleCanvas, margin + 9.24, marginTop + 1.7, (titleCanvas.width / 2) * 0.264583333, (titleCanvas.height / 2) * 0.264583333);
	            // },60);

	            // gray line beneath title
	            render.setLineColor(130,130,130);
	            render.setLineWidth(.6);
	            render.drawLine(margin, topLine - 5.8, fullWidth, topLine - 5.8); // horizontal line

	            // graph
	            var posY = 93;
	            var scale = .122
	            var height = (canvas.height / 2) * scale;
	            var width = (canvas.width / 2) * scale;
	            render.drawImage(canvas, margin, posY, width, height);

	            drawParam("Organization:", formatters.formatOrg(profile.organization), margin, topLine + 2, 24);
	            drawParam("Location:", formatters.format(profile.locationName), margin, topLine + 9.1, 18);
	            drawParam("Lat/Lng:", formatters.formatLatLng(profile.location), margin, topLine + 16.1, 18);
	            drawParam("Date:", formatters.formatDate(profile.date,profile.time), margin + 80, topLine + 9.1, 19);
	            drawParam("Observer:", formatters.format(profile.user.fullName), margin + 80, topLine + 16.1, 19);
	            drawParam("Snowpit depth:", formatters.formatCm(profile.depth), margin + 144, topLine + 9.1, 30);
	            drawParam("Snowpack depth:", formatters.formatCm(profile.snowpackHeight), margin + 144, topLine + 16.1, 30);
	            drawParam("Elevation:", formatters.formatElevation(profile.elevation), margin, upperLine + 12 + 8.5, 18);
	            drawParam("Slope:", formatters.formatSlope(profile.slope), margin, upperLine + 12 + 15.5, 18);
	            drawParam("Aspect:", formatters.formatDirection(profile.aspect), margin, upperLine + 12 + 22.5, 18);
	            drawParam("Air temp.:", formatters.formatTemp(profile.airTemp), margin, upperLine + 12 + 29.5, 18);
	            drawParam("Sky:", formatters.formatSky(profile.sky), margin, upperLine + 12 + 36.5, 18);
	            drawSkySymbol(profile.sky, margin + 10.5, upperLine + 12 + 33.2);
	            drawParam("Wind:", formatters.formatWind(profile.windSpeed,profile.windDirection), margin + 45, upperLine + 12 + 8.5, 27);
	            drawParam("Blowing snow:", formatters.formatBlowingSnow(profile.blowingSnow,profile.blowingSnowDirection), margin + 45, upperLine + 12 + 15.5, 27);
	            drawParam("Precipitation:", formatters.formatPrecip(profile.precipType), margin + 45, upperLine + 12 + 22.5, 27);
	            drawParam("Foot Pen. (PF):", formatters.formatCm(profile.PF), margin + 45, upperLine + 12 + 29.5, 27);
	            drawParam("Ski Pen. (PS):", formatters.formatCm(profile.PS), margin + 45, upperLine + 12 + 36.5, 27);

	            // horizontal line top
	            render.setLineColor(130,130,130);
	            render.setLineWidth(.24);
	            render.drawLine(margin, upperLine + marginTop, fullWidth, upperLine + marginTop); 
	            render.drawLine(54.9, upperLine + marginTop, 54.9, lowerLine + marginTop); // vertical line 1
	            render.drawLine(127, upperLine + marginTop, 127, lowerLine + marginTop); // vertical line 2

	            if (profile.notes) {
	                render.setFont("helvetica", 8);
	                render.drawText(130.5, upperLine + 18, profile.notes, 70);
	            }

	            render.drawLine(margin, lowerLine + marginTop, fullWidth, lowerLine + marginTop); // horizontal line bottom

	            // footer

	            var footerY = 272;
	            if (PDForJPEG == 'JPEG') footerY -= (100 * 0.264583333);

	            render.setTextColor(110, 110, 110);
	            render.setFont("helvetica", 6, "normal");
	            render.drawText(docWidth - margin - 21.9, footerY, "Powered by AVATECH");
	            // var left = docWidth - margin - 42.6;
	            // render.drawText(left, footerY, "Powered by");
	            // var _imgData = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABaAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEM4REYwNjg4MUMzMTFFNDlERkJGRTkxRDk0NDgwNEIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEM4REYwNjk4MUMzMTFFNDlERkJGRTkxRDk0NDgwNEIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0QzhERjA2NjgxQzMxMUU0OURGQkZFOTFEOTQ0ODA0QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0QzhERjA2NzgxQzMxMUU0OURGQkZFOTFEOTQ0ODA0QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAEBAQEBAQEBAQECAQEBAgIC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';
	            // render.drawImage(_imgData, left + 12.4, footerY - 4.22, 300 * .1 , 43 * .1);

	            render.drawText(margin, footerY, profile._id.toUpperCase());

	            $q.all([isLogoLoaded.promise]).then(function(){

	                if (PDForJPEG == "PDF") doc.save('profile.pdf');
	                else if (PDForJPEG == "JPEG") {

	                    setTimeout(function() {
	                        _canvas.toBlob(function(blob) {
	                            saveAs(blob, "profile.jpg");
	                        }, "image/jpeg", 1);

	                        // remove canvas elements from DOM
	                        setTimeout(function() {
	                            if (_canvas) document.body.removeChild(_canvas);
	                        },1000);

	                    }, 300);
	                }
	            });
	        }, 300);
	    }
	}});

/***/ },
/* 31 */
/***/ function(module, exports) {

	
	angular.module('avatech').directive('profile', ['$timeout','snowpitConstants', function($timeout, snowpitConstants) {
	  return {
	    restrict: 'A',
	    //scope: { profile: '=profile' },
	    link: function(scope, element, attrs) {

	        //return;
	        var profile = scope.$eval(attrs.profile);
	        if (!profile) return;

	        // using '$watch' allows the canvas to be redrawn
	        //scope.$watch('profile', function(profile) {

	            var canvas = element[0];
	            var context = element[0].getContext('2d');

	            // clear canvas
	            //context.clearRect(0, 0, canvas.width, canvas.height);


	            context.lineWidth = 1;
	            context.strokeStyle = "#444";
	            context.fillStyle = '#444';

	            var hardness = snowpitConstants.hardness;

	            var runningHeight = 0;

	            if (profile.layers) {
	                for (var i = 0; i < profile.layers.length; i++) {

	                    var layer = profile.layers[i];

	                    var _height = layer.height  * (canvas.height / profile.depth);
	                    var _width = Math.round(hardness[layer.hardness].width * canvas.width);
	                    var _width2 = _width;
	                    if (layer.hardness2)
	                        _width2 = Math.round(hardness[layer.hardness2].width * canvas.width);

	                    context.beginPath();

	                    context.moveTo(canvas.width,runningHeight);
	                    context.lineTo(canvas.width - _width, runningHeight);
	                    context.lineTo(canvas.width - _width2, runningHeight + _height);
	                    context.lineTo(canvas.width, runningHeight + _height);

	                    context.closePath();
	                    context.fill();
	                    context.stroke();

	                    runningHeight += _height;
	                }
	            }
	        //});
	    }
	  };
	}]);

	angular.module('avatech').directive('profileBig', ['$timeout', 'snowpitConstants', function($timeout, snowpitConstants) {
	  return {
	    restrict: 'A',
	    scope: { profile: '=profileBig' },
	    link: function(scope, element) {

	        // using '$watch' allows the canvas to be redrawn
	        scope.$watch('profile', function(profile) {

	            var canvas = element[0];
	            var context = element[0].getContext('2d');

	            // clear canvas
	            context.clearRect(0, 0, canvas.width, canvas.height);

	            // background 
	            context.fillStyle = "#fff";
	            context.fillRect(0, 0, canvas.width, canvas.height);
	            context.fill();

	            if (!profile) return;

	            context.lineWidth = 1.2;
	            context.strokeStyle = "#000";
	            context.fillStyle = '#bbb';

	            var hardness = snowpitConstants.hardness;

	            var runningHeight = 0;

	            for (var i = 0; i < scope.profile.layers.length; i++) {

	                var layer = scope.profile.layers[i];

	                var _height = layer.height  * (canvas.height / scope.profile.depth);
	                var _width = Math.round(hardness[layer.hardness].width * canvas.width);
	                var _width2 = _width;
	                if (layer.hardness2)
	                    _width2 = Math.round(hardness[layer.hardness2].width * canvas.width);

	                context.beginPath();

	                context.moveTo(canvas.width,runningHeight);
	                context.lineTo(canvas.width - _width, runningHeight);
	                context.lineTo(canvas.width - _width2, runningHeight + _height);
	                context.lineTo(canvas.width, runningHeight + _height);

	                context.closePath();
	                context.fill();
	                context.stroke();

	                runningHeight += _height;
	            }
	            // plot temps

	            // todo: sort temps by depth

	            if (profile.temps.length > 0) {
	                context.beginPath();
	                for (var i = 0; i < profile.temps.length; i++){
	                    var plotTemp = (60 - Math.abs(profile.temps[i].temp)) * (canvas.width / 60);
	                    context.lineTo(
	                        plotTemp, 
	                        (profile.depth - profile.temps[i].depth) * (canvas.height / profile.depth)
	                    );
	                }

	                context.lineWidth = 3;
	                context.strokeStyle = 'red';
	                context.stroke();
	            }

	            // canvas border

	            context.strokeStyle = 'black';
	            context.lineWidth = 2;
	            context.beginPath();

	            context.moveTo(0,0);
	            context.lineTo(canvas.width, 0);
	            context.lineTo(canvas.width, canvas.height);
	            context.lineTo(0, canvas.height);
	            context.closePath();
	            context.stroke();
	        });
	    }
	  };
	}]);


/***/ },
/* 32 */
/***/ function(module, exports) {

	angular.module('avatech').directive('stabilityTest', ['$http', 'Global', function ($http, Global) {
	    return {
	      restrict: 'A',
	      templateUrl: '/modules/snowpit-editor/snowpit-stability.html',
	      scope: { 
	        test: '=',
	        profile: '=prof',
	        depthDescending: "=", 
	        testType: "=",
	        hideFormButton: "=",
	        largeInputs: "=",
	        hideComment: "=",
	        longLabels: "="
	       },
	      controller: ['$scope', function($scope) {

	        $scope.global = Global;

	        var newCommentDefault = { isNew: true, 
	            type: $scope.testType, 
	            ECT: { score: 'ECTPV' }, 
	            CT: { score: 'CTV' }, 
	            RB: { score: 'RB1' },
	            SB: { score: 'SBV' },
	            DT: { score: 'DTV' },
	            ST: { score: 'STC' },
	            PST: { score: 'End' }
	        }; 

	        $scope.newComment = angular.copy($scope.test);
	        if ($scope.newComment == null) $scope.newComment = angular.copy(newCommentDefault);
	        if ($scope.newComment.isNew == null) $scope.newComment.isNew = false;

	        if (!$scope.newComment.isNew){
	            if ($scope.newComment.depth == -1) $scope.newComment.depth = null;
	            else {
	                if ($scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.test.depth;
	                else $scope.newComment.depth = $scope.test.depth;
	            }
	        }

	        $scope.$watch("profile.depth",function(){
	            if ($scope.depthDescending == null) return;
	            if ($scope.newComment.isNew) return;
	            if (!$scope.profile || !$scope.newComment || !$scope.test) return;
	            
	            if ($scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.test.depth;
	            else $scope.newComment.depth = $scope.test.depth;
	        });

	        $scope.$watch("depthDescending",function(){
	            if ($scope.depthDescending == null) return;
	            if ($scope.newComment.isNew) return;
	            if (!$scope.newComment.depth) return;

	            if ($scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.test.depth;
	            else $scope.newComment.depth = $scope.test.depth;
	        });

	        $scope.deleteComment = function() {
	            var index = null;
	            angular.forEach($scope.profile.tests, function(_comment, i) {
	                if (_comment == $scope.test) index = i;
	            });
	            if (index == null) return;
	            if (index == 0) $scope.profile.tests.shift();
	            else $scope.profile.tests.splice(index, 1);
	        };

	        $scope.saveComment = function() {
	            if ($scope.newComment.depth && $scope.newComment.depth > $scope.profile.depth) $scope.newComment.depth = $scope.profile.depth;
	            else if ($scope.newComment.depth && $scope.newComment.depth < 0) $scope.newComment.depth = 0;

	            var newComment = angular.copy($scope.newComment);
	            if (isNaN(newComment.depth)) newComment.depth = null;
	            if (newComment.depth != null && $scope.depthDescending) newComment.depth = $scope.profile.depth - newComment.depth;

	            // save
	            angular.copy(newComment, $scope.test);

	        }
	        
	        $scope.addComment = function() {
	            if ($scope.newComment.type == null) return;
	            else if ($scope.newComment.depth && $scope.newComment.depth > $scope.profile.depth) $scope.newComment.depth = $scope.profile.depth;
	            else if ($scope.newComment.depth && $scope.newComment.depth < 0) $scope.newComment.depth = 0;

	            if (isNaN($scope.newComment.depth)) $scope.newComment.depth = null;
	            if ($scope.newComment.depth != null && $scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.newComment.depth;

	            $scope.newComment.isNew = false;

	            if (!$scope.profile.tests) $scope.profile.tests = [];
	            $scope.profile.tests.push($scope.newComment);
	            $scope.newComment = angular.copy(newCommentDefault);
	        }
	      }],
	      link: function(scope, elm, attrs) {

	      }
	    };
	  }]);



/***/ },
/* 33 */
/***/ function(module, exports) {

	angular.module('avatech').factory('snowpitViews', ['$q','snowpitConstants', function ($q,snowpitConstants) { 

	// helper functions

	function averageGrainSize(num1, num2) {
	    if (!isNaN(num1)) num1 = parseFloat(num1);
	    if (!isNaN(num2)) num2 = parseFloat(num2);
	    if (num1 && num2) return (num1 + num2) / 2;
	    else if (num1 && !num2) return num1;
	    else if (num2 && !num1) return num2;
	}
	function hasGrainTypeCategory(layer, cats) {
	    if (layer.grainType)
	        if (cats.indexOf(layer.grainType.category) > -1) return true;
	    if (layer.grainType2)
	        if (cats.indexOf(layer.grainType2.category) > -1) return true;
	    return false;
	}

	// calculate

	var calculatePersistentGrains = function(profile) {

	    angular.forEach(profile.layers,function(layer, index){

	        if (!layer.views) layer.views = {};
	        layer.views.pgrains = { layer: [] };

	        // RULE 1: Persistent grain types (faceted crystals, depth hoar, surface hoar)
	        if (hasGrainTypeCategory(layer,["D","e","I"])) layer.views.pgrains.layer.push({ });

	    });
	}
	var calculateFlags = function(profile) {

	    // A: Average grain size > 1mm
	    // B: Layer hardness < 1F
	    // C: Grain type is facets, depth hoar or surface hoar
	    // D: Interface grain size difference > 0.15mm
	    // E: Interface hardness difference > 1 step
	    // F: Interface is 20-85cm deep

	    angular.forEach(profile.layers,function(layer, index){

	        if (!layer.views) layer.views = {};
	        layer.views.flags = { layer: [], interface: []};

	        var nextLayer = profile.layers[index + 1];
	        var depth = profile.depth - layer.depth;

	        // RULE 1: average of grain sizes > 1mm
	        if (grainSize > 1) layer.views.flags.layer.push({ rule: 'A' });

	        // RULE 2: Hardness < 1F
	        var hardness = snowpitConstants.hardness[layer.hardness].index;
	        if (layer.hardness2) hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2;

	        if (hardness < 7) layer.views.flags.layer.push({ rule: 'B' });

	        // RULE 3: Grain type (faceted crystals, depth hoar, surface hoar)
	        if (hasGrainTypeCategory(layer,["D","e","I"])) layer.views.flags.layer.push({ rule: 'C' });

	        // RULE 4: INTERFACE: grain size diff > 0.5mm
	        var grainSize = averageGrainSize(layer.grainSize,layer.grainSize2);
	        if (nextLayer) {
	            var nextGrainSize = averageGrainSize(nextLayer.grainSize,nextLayer.grainSize2);

	            var dif = Math.abs(nextGrainSize - grainSize);
	            if (dif > .5) layer.views.flags.interface.push({ rule: 'D' });
	        }

	        // RULE 5: INTERFACE: hardness difference > 1 step
	        var hardness = snowpitConstants.hardness[layer.hardness].index;
	        if (layer.hardness2) hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2;

	        if (nextLayer) {
	            var nextHardness = snowpitConstants.hardness[nextLayer.hardness].index;
	            if (nextHardness.hardness2) nextHardness = (nextHardness + snowpitConstants.hardness[nextLayer.hardness2].index) / 2;

	            var dif = Math.abs(nextHardness - hardness);
	            if (dif > 3) layer.views.flags.interface.push({ rule: 'E' });
	        }

	        // RULE 6: INTERFACE: 20-85cm deep
	        var depthDown = profile.depth - layer.depth;
	        if (depthDown >= 20 && depthDown <= 85) layer.views.flags.interface.push({ rule: 'F' });
	    });
	}
	var calculateLemons = function(profile) {

	    // A: Layer depth ≤ 1m
	    // B: Layer height ≤ 10 cm
	    // C: Grain type is facets or surface hoar
	    // D: Interface hardness difference ≥ 1 step
	    // E: Interface grain size difference ≥ 1 mm

	    angular.forEach(profile.layers,function(layer, index){

	        if (!layer.views) layer.views = {};
	        layer.views.lemons = { layer: [], interface: []};

	        var nextLayer = profile.layers[index + 1];
	        var depth = profile.depth - layer.depth;

	        // RULE 1: layer depth ≤ 1m from surface
	        if ((profile.depth - layer.depth) < 100) layer.views.lemons.layer.push({ rule: 'A' });

	        // RULE 2: Weak layer thickness ≤ 10 cm
	        if (layer.height <= 10) layer.views.lemons.layer.push({ rule: 'B' });

	        // RULE 3: Persistent grain types (faceted crystals, depth hoar, surface hoar)
	        if (hasGrainTypeCategory(layer,["D","e","I"])) layer.views.lemons.layer.push({ rule: 'C' });

	        // RULE 4: INTERFACE: hardness difference ≥ 1 step
	        var hardness = snowpitConstants.hardness[layer.hardness].index;
	        if (layer.hardness2) hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2;

	        if (nextLayer) {
	            var nextHardness = snowpitConstants.hardness[nextLayer.hardness].index;
	            if (nextHardness.hardness2) nextHardness = (nextHardness + snowpitConstants.hardness[nextLayer.hardness2].index) / 2;

	            var dif = Math.abs(nextHardness - hardness);
	            if (dif >= 3) layer.views.lemons.interface.push({ rule: 'D' });
	        }

	        // RULE 5: INTERFACE: grain size difference ≥ 1 mm
	        var grainSize = averageGrainSize(layer.grainSize,layer.grainSize2);
	        if (nextLayer) {
	            var nextGrainSize = averageGrainSize(nextLayer.grainSize,nextLayer.grainSize2);

	            var dif = Math.abs(nextGrainSize - grainSize);
	            if (dif > 1) layer.views.lemons.interface.push({ rule: 'E' });
	        }

	    });
	}

	var calculateICSSG = function(profile) {

	    angular.forEach(profile.layers,function(layer, index){

	        if (!layer.views) layer.views = {};
	        layer.views.icssg = { layer: [] };

	        if (!layer.grainType) return;

	        if (layer.grainType.category == "a") layer.views.icssg.layer.push({ color: "#00FF00" });
	        else if (layer.grainType.category == "s") layer.views.icssg.layer.push({ color: "#FFD700" });
	        else if (layer.grainType.category == "u") layer.views.icssg.layer.push({ color: "#228B22" });
	        else if (layer.grainType.category == "d") layer.views.icssg.layer.push({ color: "#FFB6C1" });
	        else if (layer.grainType.category == "e") layer.views.icssg.layer.push({ color: "#ADD8E6" });
	        else if (layer.grainType.category == "D") layer.views.icssg.layer.push({ color: "#0000FF" });
	        else if (layer.grainType.category == "I") layer.views.icssg.layer.push({ color: "#FF00FF" });
	        else if (layer.grainType.category == "h" && layer.grainType.code == "O") layer.views.icssg.layer.push({ color: "#BBBBBB" }); // should be black bars ||||||||
	        else if (layer.grainType.category == "h") layer.views.icssg.layer.push({ color: "#FF0000" });
	        else if (hasGrainTypeCategory(layer,["i"])) layer.views.icssg.layer.push({ color: "#00FFFF" });

	    });
	}

	return [
	    { name: "Default", id: null },
	    { name: "Flags", id: "flags", func: calculateFlags },
	    { name: "Lemons", id: "lemons", func: calculateLemons },
	    { name: "Persistent Grains", id: "pgrains", func: calculatePersistentGrains },
	    { name: "ICSSG Grain Coloring", id: "icssg", func: calculateICSSG }
	];

	}]);

/***/ },
/* 34 */
/***/ function(module, exports) {

	angular.module('avatech').factory('DeviceUploadModal', function ($uibModal) {
	    return { open: function(options) {
	        var modalInstance = $uibModal.open({
	            templateUrl: '/modules/sp-profile-upload/modal.html',
	            controller: 'DeviceUploadModalController',
	            backdrop: 'static',
	            windowClass: 'width-400'
	        });
	        return modalInstance.result;
	    }
	}});

	angular.module('avatech').controller('DeviceUploadModalController',
	    function ($scope, $location, $rootScope, $uibModalInstance, $log, $timeout, $http, Global, Observations) {

	        $scope.global = Global;

	        $scope.isMac = window.navigator.platform.toLowerCase().indexOf("mac") > -1;
	        $scope.isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	        $scope.close = function() {
	            $scope.cancelled = true;
	            $uibModalInstance.dismiss();
	        };
	        $scope.closeAfterUpload = function() { 
	            $rootScope.$broadcast('goToUnpublished');
	            $scope.close();
	        }

	        if ($scope.isChrome) $scope.screen = "isConnected";
	        else $scope.screen = "notChrome";

	        $scope.screenOK = function() {
	            $scope.screen = "selectDevice";
	        }
	        $scope.starting = function() {
	            $scope.screen = "starting";
	            $scope.selecting = true;
	            setTimeout(function(){
	                if (!$scope.checking) $scope.processing = true;
	                $scope.$apply();
	            }, 12000);
	            $timeout(function() { $scope.$apply(); });
	        }
	        $scope.checking = function() {
	            $scope.processing = true;
	            $scope.selecting = false;
	            $scope.checking = true;
	            $timeout(function() { $scope.$apply(); });
	        }
	        $scope.uploading = function() {
	            $scope.screen = "uploading";
	            $timeout(function() { $scope.$apply(); });
	        }
	        $scope.invalidDevice = function() {
	            alert("The device you selected is not an Avatech SP.")
	            $scope.screen = "selectDevice";
	            $timeout(function() { $scope.$apply(); });
	        }
	        $scope.complete = function(uploaded) {
	            Observations.sync(function() {
	                $scope.uploaded = uploaded;
	                $scope.screen = "complete";
	                $timeout(function() { $scope.$apply(); });
	            });
	        }
	        $scope.cancel = function() {
	            $scope.cancelled = true;
	            $scope.screen = "selectDevice";
	            $timeout(function() { $scope.$apply(); });
	        }

	        $scope.progressPercent = 0;
	        $scope.progress = function(percent) {
	            var dif = percent - $scope.progressPercent;
	            $scope.progressPercent += dif;
	            $timeout(function() { $scope.$apply(); });
	        }
	    }
	);


	// upload button directive

	angular.module('avatech').directive('sp1Upload', function($q, $http, $timeout, $log) {
	  return {
	    restrict: 'E',
	    scope: { 
	      oncancel: '&',
	      oncheck: '&',
	      onupload: '&',
	      oninvaliddevice: '&',
	      oncomplete: '&',
	      onstart: '&',
	      onadd: '&',
	      onload: '&',
	      onprogress: '&',
	      cancel: '=',
	    },
	    template: "<button class='upload-area btn btn-primary btn-lg'>Select SP<input name='fileUpload' type='file' webkitdirectory directory mozdirectory></button>",
	    link: function(scope, element) {

	      scope.$watch("cancel",function(){
	        //alert(scope.cancel === true);
	      }, true);

	      var filesUpload = element[0].querySelector("input");

	      var deviceSerial;

	      var hashes = [];
	      var _files = {};

	      function uploadFiles(files) {

	            if (scope.cancel === true) return;

	            if (scope.oncheck) scope.oncheck();

	            for (var i=0, l=files.length; i<l; i++) {

	                var file = files[i];

	                if (file.name.length == 8 && file.name.toLowerCase().indexOf("p") == 0) {
	                    var fileNumber = parseInt(file.name.substr(1));
	                    var hash = md5(deviceSerial + (fileNumber + ''));

	                    _files[hash] = file;
	                    hashes.push(hash);
	                }
	            }
	            $log.debug("FILES: " + hashes.length);

	            // ask server which should be uploaded
	            $http.post(window.apiBaseUrl + 'sp/checkIfExists', { hashes: hashes }).
	              success(function(newHashes) {

	                if (newHashes.length == 0) {
	                    if (scope.oncomplete) scope.oncomplete({ uploaded: [] });
	                    return;
	                }

	                if (scope.onupload) scope.onupload();

	                var uploadCount = 0;

	                // uploaded files
	                var uploaded = [];

	                angular.forEach(newHashes, function(hash) {
	                    var file = _files[hash];
	                    var reader = new FileReader();
	                    reader.onload = function(e) {
	                        var fileBytes = e.target.result;
	                        uploadFile(fileBytes, function(data) {

	                            if (data.hash && uploaded.indexOf(data.hash) == -1) uploaded.push(data.hash);
	                            else if (data.hash) $log.debug("DUPLICATE!");

	                            uploadCount++;
	                            setTimeout(function(){
	                                var progress = ((uploadCount / newHashes.length) * 100).toFixed(0);
	                                if (scope.onprogress) scope.onprogress({ percent: progress });
	                            },1);

	                            // complete
	                            if(uploadCount == newHashes.length) {
	                                if (scope.oncomplete) scope.oncomplete({ uploaded: uploaded });
	                                $log.debug("UPLOADED: " + uploaded.length);
	                            }
	                        });
	                    }
	                    reader.readAsArrayBuffer(file);
	                });
	              });
	        }

	        function uploadFile(fileBytes, callback) {

	          if (scope.cancel === true) return;

	          var xhr = new XMLHttpRequest();
	          
	          // Update progress bar
	          xhr.upload.addEventListener("progress", function (evt) {
	            if (evt.lengthComputable) {
	              $log.debug((evt.loaded / evt.total) * 100 + "%"); 
	            }
	          }, false);
	          
	          xhr.addEventListener("load", function () {

	          }, false);

	          xhr.onreadystatechange = function() {
	            if (xhr.readyState == 4) {
	              if (xhr.status == 200) {
	                data = JSON.parse(xhr.responseText);
	                callback(data);
	              }
	            }
	          };


	            setTimeout(function() {

	              xhr.open("POST", window.apiBaseUrl + "sp/upload", true);

	              // set token
	              xhr.setRequestHeader('Auth-Token', $http.defaults.headers.common['Auth-Token']);

	              //var formData = new FormData();
	              //formData.append("fileData", file);
	              //xhr.send(formData);
	              xhr.send(fileBytes);

	            }, 50)
	        }

	        
	        function traverseFiles (files) {
	          if (typeof files !== "undefined") {

	            // first check if valid SP1
	            var isSP1 = false;
	            for (var i=0, l=files.length; i<l; i++) {
	                if (files[i].name.toLowerCase() == "serial.txt") { 
	                    // get serial number
	                    var reader = new FileReader();
	                    reader.onload = function(e) {
	                        // keep track of serial number
	                        deviceSerial = e.target.result.replace(/(\r\n|\n|\r)/gm,"").trim();

	                        // valid SP1, continue...
	                        uploadFiles(files);
	                    }
	                    reader.readAsText(files[i]);

	                    isSP1 = true; 
	                    break; 
	                }
	            }
	            // invalid SP1
	            if (!isSP1 && scope.oninvaliddevice) {
	                scope.oninvaliddevice(); 
	                return;
	            }
	          }
	          else {
	           // No support for the File API in this web browser
	          } 
	        }

	        // var checkInput = function() {
	        //     document.body.onfocus = null;
	        //     $log.debug(filesUpload.value == null);
	        //     // check if uplpading
	        //     setTimeout(function(){
	        //         if (filesUpload.value == "") {
	        //             $log.debug("cancelled!");
	        //             scope.oncancel();
	        //         }
	        //     }, 20 * 1000); // wait 20 seconds
	        // }

	        filesUpload.addEventListener("click", function() {
	            if (scope.onstart) scope.onstart();
	            $log.debug(filesUpload.test);
	            //document.body.onfocus = function () { setTimeout(checkInput, 200); };
	        });
	        
	        filesUpload.addEventListener("change", function() {
	            traverseFiles(this.files);
	        }, false);
	    }
	  };
	});

/***/ },
/* 35 */
/***/ function(module, exports) {

	angular.module('avatech').directive('graphBig', function() {
	  return {
	    restrict: 'A',
	    scope: { 
	        rows: '=graphBig', 
	        detail: '=' 
	    },
	    link: function(scope, element) {

	        scope.$watch('rows', function() {
	            render();
	        });
	        scope.$watch('detail', function() {
	            render();
	        });

	        function findTotalOffset(obj) {
	          var ol = ot = 0;
	          if (obj.offsetParent) {
	            do {
	              ol += obj.offsetLeft;
	              ot += obj.offsetTop;
	            }while (obj = obj.offsetParent);
	          }
	          return {left : ol, top : ot};
	        }
	        function fixEvent(ev) {
	            if(typeof ev.offsetX === "undefined" || typeof ev.offsetY === "undefined") {
	                var targetOffset = findTotalOffset(ev.target);
	                ev.offsetX = ev.pageX - targetOffset.left;
	                ev.offsetY = ev.pageY - targetOffset.top;
	              }    
	              return ev;
	        }
	        function getRelativeCoords(event) {
	            var _event = fixEvent(event);
	            var pixelRatio = window.devicePixelRatio;
	            if (event.offsetX !== undefined && event.offsetY !== undefined) { return [ event.offsetX * pixelRatio, event.offsetY  * pixelRatio]; }
	            return [event.layerX * pixelRatio, event.layerY * pixelRatio];
	        }


	        var paddingTop = 30;
	        var paddingLeft = 40;


	        // // handle mouseouver for highlighting
	        // var debounce;
	        // element.bind('mousemove',function(event) {
	        //     if (debounce) clearTimeout(debounce);
	        //     debounce = setTimeout(function(){
	        //         var point = getRelativeCoords(event);
	        //         // if mouse is within graph, render graph width highlighted depth
	        //         if (point[1] > paddingTop && point[0] > paddingLeft) {
	        //             render(point[1]);
	        //         }

	        //     }, 10);
	        // })
	        // // redraw on mouseout to clear highlight
	        // element.bind('mouseout',function(event) {
	        //     render();
	        // });


	        // graphing formula (by sam with revisions by joe)

	        var A_P4 = -194.1;
	        var B_P4 = .1304;
	        var C_P4 = -.0023124;
	        var D_P4 = 197.7;

	        var magic = 195.95340007275328;

	        function graphLogFunction(pressure, width) {
	          pressure = Math.pow(B_P4 , -C_P4 * pressure);
	          pressure *= A_P4;
	          pressure += D_P4;
	          pressure *= (width/magic);
	          return pressure;
	        }
	        function graphLogFunctionReverse(pixels, width) {
	          pixels /= (width/magic);
	          pixels -= D_P4;
	          pixels /= A_P4;
	          pixels = (Math.log(pixels) / Math.log(B_P4)) /  -C_P4;
	          return pixels;
	        }


	        function render(highlightDepth) {

	            if (scope.detail == null) scope.detail = 1;

	            var canvas = element[0];
	            var context = element[0].getContext('2d');

	            var graphHeight = canvas.height - paddingTop;
	            var graphWidth = canvas.width - paddingLeft;

	            // clear canvas
	            context.clearRect(0, 0, canvas.width, canvas.height);

	            // draw white background

	            context.fillStyle = "#fff";
	            context.fillRect(paddingLeft, paddingTop, canvas.width, canvas.height);

	            // pixel value at zero
	            var valueAtZero = Math.round(graphLogFunction(0, graphWidth));

	            // graph tick lines

	            // calculate tick mark locations
	            var tickMarks = [];
	            for (var i = 1; i <= 6; i++) {
	                var tickPixels = parseInt((graphWidth / 6) * i);
	                var tickPressure = Math.round(graphLogFunctionReverse(tickPixels + valueAtZero, graphWidth + valueAtZero));
	                tickMarks.push(tickPressure)
	            }

	            // draw tick marks

	            context.beginPath();

	            for (var i = 0; i < tickMarks.length;i++) {
	                var tickMark = tickMarks[i];
	                var tickMarkPosition = paddingLeft + graphLogFunction(tickMark, graphWidth + valueAtZero) - valueAtZero + 1; // - 1;

	                context.moveTo(tickMarkPosition, paddingTop); // change to 0?
	                context.lineTo(tickMarkPosition, graphHeight + paddingTop);

	                // draw tick labels
	                context.fillStyle = "#444";
	                context.font = "22.5px 'roboto condensed'";
	                context.fillText(tickMark, tickMarkPosition - context.measureText(tickMark).width, 22);
	            }

	            context.lineWidth = 2;
	            context.strokeStyle = 'rgba(10,10,10,.28)';
	            context.stroke();
	            context.closePath();

	            // data
	            var rows = scope.rows;
	            
	            // if no data, don't continue
	            if (!rows) return;

	            var threshold = 3;

	            var canvas = element[0];
	            var context = element[0].getContext('2d');
	                
	            // calculate
	            var graphRows = [];
	            for (var i = 0; i < rows.length; i++) {

	                var pressure_expanded = (.00008 * Math.pow(rows[i],3));

	                var pressure_graph = graphLogFunction(pressure_expanded, graphWidth + valueAtZero) - valueAtZero;

	                graphRows.push(pressure_graph);
	            }


	            // graph

	            // empty bottom depth area
	            var emptyDepth = (rows.length) * (graphHeight / 1500);
	            emptyDepth *= threshold;
	            context.fillStyle = "#d0d0d0";
	            context.beginPath();
	            context.moveTo(paddingLeft,emptyDepth + paddingTop);
	            context.lineTo(canvas.width,emptyDepth + paddingTop);
	            context.lineTo(canvas.width,graphHeight + paddingTop); 
	            context.lineTo(paddingLeft,graphHeight + paddingTop);
	            context.closePath();
	            context.fill();

	            // the four levels of blockiness, from less blocky to most blocky
	            var details = {
	                level2: .16,
	                level3: .32,
	                level4: .52,
	                level5: .65
	            }

	            // profile
	            context.beginPath();
	            context.fillStyle = 'rgba(50,50,50,.9)';
	            context.moveTo(paddingLeft, paddingTop);
	            var canvasDepth;
	            for (var i = 0; i < graphRows.length; i++) {


	                canvasDepth = (i+1) * (graphHeight / 1500);
	                canvasDepth *= threshold;
	                canvasDepth += paddingTop;

	                var pressure_graph = graphRows[i];

	                // detail levels / blocking
	                if (scope.detail > 1 && scope.detail < 6 && i != graphRows.length - 1) {
	                    var pressure_graph_next = graphRows[i + 1];

	                    if (Math.abs(1-pressure_graph_next/pressure_graph) < details['level' + scope.detail]) {
	                        graphRows[i + 1] = pressure_graph;
	                    }
	                }

	                context.lineTo(pressure_graph + paddingLeft, canvasDepth);
	            }

	            // finish up graph

	            if (canvasDepth != null) {
	                context.lineTo(paddingLeft, canvasDepth);
	                context.lineTo(paddingLeft,0);
	                context.fill();
	            }


	            // depth tick marks

	            context.beginPath();
	            var depthTicks = [0,10,20,30,40,50,60,70,80,90,100,110,120,120,130,140,150];
	            for (var i = 0; i < depthTicks.length; i++) {
	                var canvasDepth;
	                canvasDepth = (depthTicks[i] * 10) * (graphHeight / 1500);

	                if (canvasDepth <= emptyDepth) {
	                    // draw tick marks
	                    if (i > 0) {
	                        context.moveTo(paddingLeft, canvasDepth + paddingTop);
	                        context.lineTo(canvas.width, canvasDepth + paddingTop);
	                    }
	                    
	                    // draw labels
	                    context.textAlign="right";
	                    context.fillStyle = "#444";
	                    context.font = "22.5px 'roboto condensed'";
	                    context.fillText(depthTicks[i], 34, canvasDepth + paddingTop);
	                    context.textAlign="left";
	                }
	            }

	            context.lineWidth = 2;
	            context.strokeStyle = 'rgba(180,180,180,.1)';
	            context.stroke();
	            context.closePath();

	            // highlight depth
	            if (highlightDepth && highlightDepth <= emptyDepth) {
	                // get depth from pixels
	                var depthPixels = highlightDepth - paddingTop;
	                var _depth = Math.round(depthPixels / (graphHeight / 1500));
	                // get pressure from depth
	                // todo: first need to expand graphRows from 150 to 1500
	                // var _pressure = Math.round(graphRows[_depth]);
	                // console.log(_pressure);

	                context.beginPath();
	                context.moveTo(paddingLeft, highlightDepth);
	                context.lineTo(canvas.width, highlightDepth);
	                context.lineWidth = 2;
	                context.strokeStyle = 'red';
	                context.stroke();
	                context.closePath();

	                context.fillStyle = "red";
	                context.font = "22.5px 'roboto condensed'";
	                context.fillText(_depth + ", " + _pressure, 100, highlightDepth);

	            }
	        }
	    }
	  };
	});


	angular.module('avatech').directive('graph', function() {
	  return {
	    restrict: 'A',
	    link: function(scope, element, attrs) {

	        // expand compressed ascii string
	        function expand(str) {
	            var unsplitInt = function(_str) {
	                if (_str.length != 2) return null; // 3
	                return  (_str[0].charCodeAt(0) - 32) +
	                        (_str[1].charCodeAt(0) - 32);
	                        // + (str[2].charCodeAt(0) - 32);
	            }
	            // expand ascii string
	            var expanded = "";
	            for (var e = 0; e < str.length; e++) {
	                var ch = str[e];
	                if (ch != "\n") expanded += ch;
	                else {
	                    var streak = str.substr(e + 1, 2); //3
	                    streak = unsplitInt(streak);
	                    var _ch = str[e+3]; //4
	                    for (var k = 0; k < streak; k++) expanded += _ch;
	                    e += 3; //4
	                }
	            }
	            // convert ascii string into array of numbers
	            var _rows = [];
	            for (var i = 0; i < expanded.length; i++) {
	                // adjust for ascii offset and multiply by 4 (decompress)
	                _rows.push((expanded[i].charCodeAt(0) - 32) * 3.9);
	            }
	            return _rows;
	        }

	        var rows = scope.$eval(attrs.graph);
	        if (!rows) return;

	        // expand if compressed ascii string
	        if (typeof rows === 'string') {
	            rows = expand(rows);
	        }

	        var threshold = 10;

	        var canvas = element[0];
	        var context = element[0].getContext('2d');

	        // empty bottom depth area
	        var emptyDepth = (rows.length) * (canvas.height / 1500);
	        emptyDepth *= threshold;
	        context.fillStyle = "#d0d0d0";
	        context.beginPath();
	        context.moveTo(0,emptyDepth);
	        context.lineTo(canvas.width,emptyDepth);
	        context.lineTo(canvas.width,canvas.height);
	        context.lineTo(0,canvas.height);
	        context.closePath();
	        context.fill();
	        
	        // graph
	        context.beginPath();
	        context.fillStyle = 'rgba(50,50,50,.9)';
	        context.moveTo(-1,0);
	        var canvasDepth;
	        for (var i = 0; i < rows.length; i++) {

	            canvasDepth = (i+1) * (canvas.height / 1500);
	            canvasDepth *= threshold;

	            var pressure_expanded = (.00008 * Math.pow(rows[i],3));

	            var A_P4 = -194.1;
	            var B_P4 = .1304;
	            var C_P4 = -.0023124;
	            var D_P4 = 197.7;
	            var pressure_graph = (A_P4 * (Math.pow(B_P4 , -C_P4 * pressure_expanded)) + D_P4) * (217/198);

	            pressure_graph = pressure_graph * (canvas.width / 212);

	            context.lineTo(pressure_graph, canvasDepth);
	        }
	        // finish up
	        if (canvasDepth != null) {
	            context.lineTo(-1, canvasDepth);
	            context.lineTo(-1,0);
	            context.fill();
	        }
	        context.closePath();
	    }
	  };
	});

/***/ },
/* 36 */
/***/ function(module, exports) {

	angular.module('avatech').controller('ForgotPasswordController', 
	    function ($scope, $http, Global, Restangular) {

	    $scope.send = function() {
	    	// validation
	        // todo: validate email!
	 		if (!$scope.email || $scope.email == "") {
	 			$scope.validationError = "Please enter a valid email"; return;
	 		}

	        Restangular.all('users/forgot-password').post({ 
	            email: $scope.email
	        })
	        // user found
	        .then(function(data) {

	            mixpanel.track("forgot password", { email: $scope.email });
	            $scope.resetSuccess = true;
	            $scope.validationError = null;

	        }, 
	        // user not found
	        function(response) {

	            if (response.status == 404) {
	                $scope.validationError =  "Oops! We couldn't find a user with that email."
	            }
	            else {
	                $scope.validationError = "Server Error. Please try again";
	            }

	        });
	    };
	});

/***/ },
/* 37 */
/***/ function(module, exports) {

	angular.module('avatech').controller('LoginController',
	function ($scope, $rootScope, $timeout, $location, $http, Global, Restangular) {
	    
	    $scope.busy = false;

	    $scope.submit = function() {
	        // browser autofill hack
	        $scope.email = $(".signin #email").val();
	        $scope.password = $(".signin #password").val();

	        // basic validation
	        if (!$scope.email || $scope.email == "" || !$scope.password || $scope.password == "") {
	            $scope.validationError = "badEntry";
	            return;
	        }

	        $scope.busy = true;

	        // server auth
	        Global.login($scope.email, $scope.password,
	        // login success
	        function() { },  
	        // login error
	        function(message) {
	            $timeout(function(){
	                $scope.validationError = message;
	                $scope.password = "";
	                $scope.busy = false;
	            },1000);
	        });
	    };
	});

/***/ },
/* 38 */
/***/ function(module, exports) {

	angular.module('avatech').controller('RegisterController', 
	  function ($scope, $rootScope, $timeout, $http, $stateParams, $location, Global, Restangular) {

	    $scope.reg = {};

		//$scope.isPending = (($stateParams.userHashId == "") || !$stateParams.orgHashId) ? false : null;
	  $scope.isPending = (!$stateParams.userHashId || $stateParams.userHashId == "") ? false : null;

	    $scope.reg = {};
	  if ($stateParams.userHashId && $stateParams.userHashId != "") {
	    Restangular.one('users/pending', $stateParams.userHashId).get()
	    .then(function(data) {
	      $scope.isPending = true;
	      $scope.userHashId = $stateParams.userHashId;

	      if (data.organizations) $scope.orgName = data.organizations[0].name;
	      $scope.reg.email = data.email;
	    },
	    // error
	    function() {
	      $scope.isPending = false;
	    });
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


	    $scope.scrollToError = function(){
	        // jQuery stuff, not so elegant but what can ya do
	        // var target = $("#errorArea");
	        // if (target.length) {
	        //     $('html,body').animate({
	        //       scrollTop: target.offset().top - 12
	        //     }, 300);
	        // }
	        $('.login-page').animate({ scrollTop: 0 }, 300);
	    }

	    $scope.registerPending = function() {

	        $scope.showError = null;

	        if(!$scope.registerForm.$valid) {
	            $scope.showError = "Please complete all required fields";
	            $scope.scrollToError();
	        }
	        else if($scope.reg.fullName.indexOf(' ') == -1) {
	            $scope.showError = "Please enter your full name";
	            $scope.scrollToError();
	        }
	        else if ($scope.reg.password.length && $scope.reg.password.length < 6) {
	            $scope.showError = "Password must be at least 6 characters long";
	            $scope.scrollToError();
	        }
	        else if ($scope.reg.password.length && ($scope.reg.password != $scope.reg.passwordConfirm)) {
	            $scope.showError = "Make sure your passwords match";
	            $scope.scrollToError();
	        }
	        else if (!$scope.acceptTerms) {
	            alert("You must accept the Terms of Service.");
	            return;
	        }
	        // all good
	        else {
	            $scope.busy = true;
	        $('.login-page').animate({ scrollTop: 0 }, 300);

	          var newUser = {
	            fullName: $scope.reg.fullName,
	            password: $scope.reg.password,
	            // pro fields
	            userHashId: $scope.userHashId,
	            userType: "pro"
	          }

	          setTimeout(function(){

	              // post to API
	              Restangular.all('users').post(newUser)
	              // success
	              .then(function (data) {
	                  mixpanel.track("registered");
	                  Global.login(data.email, newUser.password);
	              }, 
	              // error
	              function(response) {
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

	          }, 500);

	        }
	    }
	    $scope.registerPro = function() {

	        $scope.showError = null;

	        if(!$scope.registerForm.$valid) {
	            $scope.showError = "Please complete all required fields";
	            $scope.scrollToError();
	        }
	        // all good
	        else {
	              $scope.busy = true;
	        $('.login-page').animate({ scrollTop: 0 }, 300);
	              
	              var newUser = {
	                fullName: $scope.reg.fullName,
	                email: $scope.reg.email,
	                password: $scope.reg.password,
	                userType: "pro",
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

	              setTimeout(function(){

	                  // post to API
	                  Restangular.all('users').post(newUser)
	                  // success
	                  .then(function (data) {
	                      mixpanel.track("registered");
	                      Global.login(data.email, newUser.password);
	                  }, 
	                  // error
	                  function(response) {
	                      $timeout(function(){
	                        $scope.busy = false;
	                        // showpro is false since this can only be an email error
	                        // todo: what about 500 error? alert?
	                        $scope.showPro = false;
	                        $scope.showError = response.data.message;
	                        $scope.scrollToError();
	                      }, 500);
	                  });

	              }, 500);

	        } 

	    }
	    $scope.register = function() {
	        if ($scope.showPro) return $scope.registerPro();
	        else if ($scope.isPending) return $scope.registerPending();

	          // $scope.showPro = true;
	          // return;

	        $scope.showError = null;
	        if(!$scope.registerForm.$valid) {
	            $scope.showError = "Please complete all required fields";
	            $scope.scrollToError();
	        }
	        else if($scope.reg.fullName.indexOf(' ') == -1) {
	            $scope.showError = "Please enter your full name";
	            $scope.scrollToError();
	        }
	        else if ($scope.reg.password.length && $scope.reg.password.length < 6) {
	            $scope.showError = "Password must be at least 6 characters long";
	            $scope.scrollToError();
	        }
	        else if ($scope.reg.password.length && ($scope.reg.password != $scope.reg.passwordConfirm)) {
	            $scope.showError = "Make sure your passwords match";
	            $scope.scrollToError();
	        }
	        else if ($scope.reg.isPro == null) {
	            // if ($scope.org)
	            //   alert("You must certify that you are a registered student of " + $scope.org.name  + ".");
	            // else 
	            alert("Please specify if you are a snow safety professional.");
	            //return;
	        }
	        else if (!$scope.acceptTerms) {
	            alert("You must accept the Terms of Service.");
	            return;
	        }
	        else {

	            // if rec, signup!
	            if ($scope.reg.isPro === false) {

	                $scope.busy = true;
	        $('.login-page').animate({ scrollTop: 0 }, 300);

	                var newUser = {
	                  fullName: $scope.reg.fullName,
	                  email: $scope.reg.email,
	                  password: $scope.reg.password,
	                  userType: "rec+"
	                }


	                setTimeout(function() {
	                  // post to API
	                  Restangular.all('users').post(newUser)
	                  // success
	                  .then(function (data) {
	                      mixpanel.track("registered");
	                      Global.login(data.email, newUser.password);
	                  }, 
	                  // error
	                  function(response) {
	                      $timeout(function(){
	                        $scope.busy = false;
	                        $scope.showError = response.data.message;
	                        $scope.scrollToError();
	                      }, 500);
	                  });
	                }, 500);
	            }
	            // if pro, show next screen
	            if ($scope.reg.isPro === true) {
	              //alert("pro signup!!!");
	              $scope.showPro = true;
	        $('.login-page').animate({ scrollTop: 0 }, 300);

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
	    };

	});

/***/ },
/* 39 */
/***/ function(module, exports) {

	angular.module('avatech').controller('ResetPasswordController', 
		function ($scope, $http, $stateParams, Global, Restangular) {

		$scope.forgotPasswordToken = $stateParams.forgotPasswordToken;
		$scope.validToken = null;
		$scope.successfulReset = false;

	    Restangular.one('users/forgot-password', $scope.forgotPasswordToken).get()
	    // token found
	    .then(function() {
	        $scope.validToken = true;
	    }, 
	    // token not found
	    function(response) {
	        $scope.validToken = false;
	    });

	 	$scope.reset = function() {
	    	// validation
	 		if (!$scope.password || $scope.password == "") {
	 			$scope.validationError = "Please enter a new password"; return;
	 		}
	 		if ($scope.password != $scope.passwordConfirm) {
	 			$scope.validationError = "Please make sure your passwords match"; return;
	 		}
	    	// all good, proceed
	 		$scope.validationError = null;

	        Restangular.one('users/forgot-password', $scope.forgotPasswordToken).customPOST({
	        	password: $scope.password 
	    	}, 'reset')
	         // password reset success
	        .then(function() {
	            $scope.successfulReset = true;
	            mixpanel.track("password reset");
	        }, 
	        // token not found
	        function(response) {
	            $scope.error = "There was an error updating your password. Please try again or contact support for assistance."
	        });
	    };
	});

/***/ },
/* 40 */
/***/ function(module, exports) {

	angular.module('avatech').controller('SettingsController', 
	function ($scope, $q, $stateParams, $location, $timeout, Global, Restangular, $http, LocationSelectModal) {
	    $scope.global = Global;

	    $scope.loadSettings = function() { 
	        var RestObject = Restangular.one('users', $scope.global.user._id);
	        RestObject.get().then(function (user) {
	            $scope.user = user;

	            $scope.tempUser = Restangular.copy(user);

	            $scope.settings = angular.copy(user.settings);
	        });
	    };
	    $scope.loadSettings();

	    $scope.$watch('settings',function(newSettings){
	        if (!newSettings || !$scope.user) return;

	        $scope.user.settings = $scope.settings;
	        $scope.user.save();
	        Global.setUser($scope.user);
	    },true);

	    $scope.scrollToError = function(){
	        // jQuery stuff, not so elegant but what can ya do
	        var target = $("#errorArea");
	        if (target.length) {
	            $('html,body').animate({
	              scrollTop: target.offset().top - 60
	            }, 300);
	        }
	    }
	    $scope.saveUserDetails = function() {
	        $scope.showError = null;
	        $scope.showSuccess = null;
	        if(!$scope.registerForm.$valid) {
	            $scope.showError = "Please complete all required fields";
	            $scope.scrollToError();
	        }
	        // merge and save

	        delete $scope.tempUser.location;

	        $scope.tempUser.save()
	        // success
	        .then(function(user) {
	            $scope.user = user;
	            Global.setUser($scope.user);
	            $scope.tempUser = Restangular.copy(user);

	            $scope.showSuccess = "Your new information has been saved";
	            $scope.scrollToError();
	        },
	        // error
	        function(response) {
	            $scope.showError = response.data.message;
	            $scope.scrollToError();
	        });
	    }

	    // LOCATION LAT/LNG INPUT
	    $scope.$watch('user.location', function(newLocation, oldLocation) {
	        if (!oldLocation || !newLocation) return;
	        
	        // if new location set, save user
	        if (oldLocation.toString() != newLocation.toString()) {
	            $scope.user.save();
	            mixpanel.track("changed home location");
	            $scope.global.setUser($scope.user);
	        }
	    });

	    // SELECT LOCATION MODAL
	    $scope.selectLocation = function() {
	        LocationSelectModal.open({
	            initialLocation: $scope.user.location
	        }).then(function (location) {
	            if (location && location.length == 2) {
	                location[0] = parseFloat(location[0].toFixed(7)); 
	                location[1] = parseFloat(location[1].toFixed(7)); 
	                $scope.user.location = location;
	            }
	        });
	    }

	    function validateEmail(email) { 
	        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	        return re.test(email);
	    } 


	    $scope.scrollToErrorPassword = function(){
	        // jQuery stuff, not so elegant but what can ya do
	        var target = $("#errorAreaPassword");
	        if (target.length) {
	            $('html,body').animate({
	              scrollTop: target.offset().top - 60
	            }, 300);
	        }
	    }   
	    $scope.changePassword = {};
	    $scope.savePassword = function() {
	        $scope.showErrorPassword = null;
	        $scope.showSuccessPassword = null;

	        if (!$scope.changePassword.currentPassword) {
	            $scope.showErrorPassword = "Please enter your current password";
	            $scope.scrollToErrorPassword();
	        }
	        else if (!$scope.changePassword.newPassword) {
	            $scope.showErrorPassword = "Please enter a new passwrod";
	            $scope.scrollToErrorPassword();
	        }
	        else if ($scope.changePassword.newPassword != $scope.changePassword.confirmPassword) {
	            $scope.showErrorPassword = "Your new password doesn't match";
	            $scope.scrollToErrorPassword();
	        }
	        else {
	            $scope.user.customPOST($scope.changePassword, 'password')
	            // success
	            .then(function (data) {
	                $scope.changePassword = {};
	                $scope.showSuccessPassword = "Your new password has been saved";
	                $scope.scrollToErrorPassword();
	                mixpanel.track("changed password");
	            },
	            // error
	            function(response) {
	                $scope.showErrorPassword = response.data.message;
	                $scope.scrollToErrorPassword();
	            });
	        }
	    }

	    $scope.downloadData = function() {
	        $scope.downloading = true;
	        $http.get(window.apiBaseUrl + "sp/bulkDownload")
	        .success(function (data) {
	            window.location.href = data.url;
	            $scope.downloading = false;
	        })
	        .error(function(){
	            $scope.downloading = false;
	        });
	    }

	});

/***/ },
/* 41 */
/***/ function(module, exports) {

	
	angular.module('avatech').factory("Global",
	    function($location,$http,$state,$stateParams,$interval,localStorageService, Restangular) {

	        var _this = this;
	        _this._data = {

	        	user: null,
	            orgs: [],

	            redirectUrl: null,

	            setUser: function(user) {
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
	                    $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
					}
		    	}
	        };

	        return _this._data;
	    }
	);

/***/ },
/* 42 */
/***/ function(module, exports) {

	angular.module('avatech').service('Observations', 
	    function($q, $rootScope, $timeout, $interval, Global, $http) {

		var self=this;

		var lastSync;

		this.observations = [];

		this.init = function() {
			self.sync();
	    $interval(function() { self.sync() }, 60000);
		};

		this.sync = function(callback) {
	        // if user not available, don't sync
	        if (!Global.user || !Global.user._id) return;
	        
	        // Restangular.all("users/" + Global.user._id + "/observations")
	        // .getList({
	        //     verbose: false,
	        //     //since: lastSync.toISOString()
	        // })
	        // .then(function(obs) {
	        $http({
	            method: 'GET',
	            url: window.apiBaseUrl + "users/" + Global.user._id + "/observations",
	            responseType: "json",
	            params: {
	                verbose: false
	            }
	        })
	        .then(function(res) {
	          var obs = res.data;

	          for (var i = 0; i < obs.length; i++) {
	                addOrReplace(obs[i]);
	            }
	            // keep track of last sync
	            lastSync = new Date();
	            // callback
	            if (callback) callback();
	        });
		};

		function replaceObservation(observation) {
	        for (var i = 0; i < self.observations.length; i++) {
	        	var _observation = self.observations[i];
	        	if (_observation._id == observation._id) {
	        		self.observations[i] = observation;
	        		return true;
	        	}
	        }
	        return false;
		}

		function addOrReplace(observation) {

	    	// if observation already exists, replace
	    	if (replaceObservation(observation)) return;

	    	// doesn't exist, add
			self.observations.push(observation);

	    	// todo: removed
		}

		this.save = function(observation, callback) {
			replaceObservation(observation);
	    
	    // update
	    if (observation._id) {
	      $http.put(window.apiBaseUrl + "observations/" + observation._id, observation)
	      .then(function(res) {
	          angular.extend(observation, res.data);
	          replaceObservation(observation);
	          if (callback) callback(observation);
	      });
	    }
	    // create
	    else {
	      $http.post(window.apiBaseUrl + "observations", observation)
	      .then(function(res) {
	          angular.extend(observation, res.data);
	          replaceObservation(observation);
	          if (callback) callback(observation);
	      });
	    }
		};

		this.remove = function(observation) {
	        // remove from local cache
			    var index = -1;
	        for (var i = 0; i < self.observations.length; i++) {
	        	var _observation = self.observations[i];
	        	if (_observation._id == observation._id) {
	        		index = i;
	        		break;
	        	}
	        }
	        if (index > -1) self.observations.splice(index, 1);

	        // mark as removed on server
	        $http.delete(window.apiBaseUrl + "observations/" + observation._id);
		};
	});



/***/ },
/* 43 */
/***/ function(module, exports) {

	angular.module('avatech').service('Routes', 
	    function($q, $rootScope, $timeout, $interval, Global, $http) {

		var self=this;

		var lastSync;

		this.observations = [];

		this.init = function() {
			self.sync();
	    $interval(function() { self.sync() }, 60000);
		};

		this.sync = function(callback) {
	        // if user not available, don't sync
	        if (!Global.user || !Global.user._id) return;
	        
	        // Restangular.all("users/" + Global.user._id + "/routes")
	        // .getList({
	        //     verbose: false,
	        //     //since: lastSync.toISOString()
	        // })
	        // .then(function(obs) {
	        $http({
	            method: 'GET',
	            url: window.apiBaseUrl + "users/" + Global.user._id + "/routes",
	            responseType: "json",
	            params: {
	                verbose: false
	            }
	        })
	        .then(function(res) {
	          var obs = res.data;

	            for (var i = 0; i < obs.length; i++) {
	                addOrReplace(obs[i]);
	            }
	            // keep track of last sync
	            lastSync = new Date();
	            // callback
	            if (callback) callback();
	        });
		};

		function replaceObservation(observation) {
	        for (var i = 0; i < self.observations.length; i++) {
	        	var _observation = self.observations[i];
	        	if (_observation._id == observation._id) {
	        		self.observations[i] = observation;
	        		return true;
	        	}
	        }
	        return false;
		}

		function addOrReplace(observation) {

	    	// if observation already exists, replace
	    	if (replaceObservation(observation)) return;

	    	// doesn't exist, add
			  self.observations.push(observation);

	    	// todo: removed
		}

		this.save = function(observation) {
			replaceObservation(observation);

	        // update on server
	        // todo: update!
	        // if (observation.type == 'test') {
	        // 	$http.post("/v1/tests", observation);
	        // }
		};

	  this.add = function(observation) {
	    addOrReplace(observation);
	  }

		this.remove = function(observation) {
	     // remove from local cache
	        var index = -1;
	        for (var i = 0; i < self.observations.length; i++) {
	          var _observation = self.observations[i];
	          if (_observation._id == observation._id) {
	            index = i;
	            break;
	          }
	        }
	        if (index > -1) self.observations.splice(index, 1);

	        // mark as removed on server
	        $http.delete(window.apiBaseUrl + "routes/" + observation._id);
	  //       }
		};
	});



/***/ },
/* 44 */
/***/ function(module, exports) {

	angular.module('avatech').directive('datetimepicker', function ($window, $log) {
	    return {
	        require:'^ngModel',
	        restrict:'E',
	        scope: { 
	          theDate: '=ngModel'
	        },
	        template: '<input class="form-control" ng-model="dateInput" schema-validate="form" style="width:100px;display:inline-block;vertical-align:bottom;margin-right:6px;"/><timepicker style="display:inline-block;vertical-align:bottom;height:34px;" class="timepicker" ng-model="timeInput" hour-step="1" minute-step="1" show-meridian="true" mousewheel="false" show-spinners="false"></timepicker>',
	        link:function (scope, elm, attrs, ctrl) {

	          scope.$watch('theDate',function(){
	            if (!scope.theDate) scope.theDate = new Date();
	            
	            scope.internalDate = new Date(scope.theDate);

	            scope.dateInput = angular.copy(scope.internalDate);
	            scope.timeInput = angular.copy(scope.internalDate);
	          }, true);

	          scope.$watch('dateInput',function() {
	            $log.debug(scope.dateInput);
	            if (!scope.dateInput) return $log.debug("BAD DATE!");

	            //$log.debug("    DATE: " + scope.dateInput.toISOString());
	            scope.internalDate.setDate(scope.dateInput.getDate());
	            scope.internalDate.setMonth(scope.dateInput.getMonth());
	            scope.internalDate.setFullYear(scope.dateInput.getFullYear());
	          }, true);

	          scope.$watch('timeInput',function(){
	            if (!scope.timeInput) return $log.debug("BAD TIME!");

	            //$log.debug("    TIME: " + scope.timeInput.toISOString());
	            scope.internalDate.setMinutes(scope.timeInput.getMinutes());
	            scope.internalDate.setHours(scope.timeInput.getHours());
	          }, true);

	        }
	      };
	    });

	angular.module('avatech').directive('moDateInput', function ($window) {
	    return {
	        require:'^ngModel',
	        restrict:'A',
	        link:function (scope, elm, attrs, ctrl) {

	          elm = $(elm)[0];

	            setTimeout(function(){
	                  var picker = new Pikaday({
	                      field: elm,
	                      // todo: make this configurable
	                      // can't select date greater than today
	                      maxDate: new Date(),
	                      //, format: 'YYYY-MM-DD'
	                      onSelect: function() {
	                          //$log.debug(picker.toString());
	                          //$log.debug(this.getMoment().format('Do MMMM YYYY'));
	                      }
	                  });
	                  // todo:find a more elegant way to make sure the picker loads the date
	                  setTimeout(function(){
	                      picker.setMoment(moment(elm.value));
	                  },400);
	            },1);


	            var moment = $window.moment;
	            var dateFormat = attrs.moMediumDate;
	            
	            dateFormat = "YYYY-MM-DD";

	            attrs.$observe('moDateInput', function (newValue) {
	                if (dateFormat == newValue || !ctrl.$modelValue) return;
	                dateFormat = newValue;
	                ctrl.$modelValue = new Date(ctrl.$setViewValue);
	            });

	            ctrl.$formatters.unshift(function (modelValue) {
	                if (!dateFormat || !modelValue) return "";
	                var retVal = moment(modelValue).format(dateFormat);
	                return retVal;
	            });

	            ctrl.$parsers.unshift(function (viewValue) {
	                var date = moment(viewValue,["YYYY-MM-DD","MM/DD/YY"]);
	                return (date && date.isValid() && date.year() > 1950 ) ? date.toDate() : "";
	            });
	        }
	    };
	});


	angular.module('avatech').directive('dateInput', function ($window) {
	    return {
	        require:'^ngModel',
	        restrict:'A',
	        link:function (scope, elm, attrs, ctrl) {

	          elm = $(elm)[0];

	            var moment = $window.moment;
	            var dateFormat = attrs.moMediumDate;
	            
	            dateFormat = "YYYY-MM-DD";

	            // attrs.$observe('dateInput', function (newValue) {
	            //     if (dateFormat == newValue || !ctrl.$modelValue) return;
	            //     dateFormat = newValue;
	            //     ctrl.$modelValue = new Date(ctrl.$setViewValue);
	            // });

	            ctrl.$formatters.unshift(function (modelValue) {
	                if (!dateFormat || !modelValue) return "";
	                var retVal = moment(modelValue).format(dateFormat);
	                return retVal;
	            });

	            ctrl.$parsers.unshift(function (viewValue) {
	                var date = moment(viewValue,["YYYY-MM-DD","MM/DD/YY"]);
	                return (date && date.isValid() && date.year() > 1950 ) ? date.toDate() : "";
	            });
	        }
	    };
	});

/***/ },
/* 45 */
/***/ function(module, exports) {

	
	// file upload

	angular.module('avatech').directive('uploader', function($http, $timeout, $log) {
	  return {
	    restrict: 'E',
	    scope: { 
	      onadd: '&',
	      onload: '&',
	      onprogress: '&',
	      onupload: '&'
	    },
	    template: "<div class='upload-area'><input type='file' multiple/><div class='drop-area'><div class='big'>Drop photos here</div><div class='small'>or click to select files</div></div></div>",
	    link: function(scope, element) {

	      var filesUpload = element[0].querySelector("input");
	      var dropArea = element[0].querySelector(".upload-area");

	      function uploadFile (file) {

	            var ext = file.name.substr(file.name.lastIndexOf(".") + 1).toLowerCase();
	            $log.debug(ext);
	            if (['jpg','png','gif','bmp'].indexOf(ext) == -1) return;

	            var fileObject = { 
	              name: file.name.replace(/\.[^/.]+$/, ""), 
	              progress: 0
	            };

	            if (scope.onadd) scope.onadd({ file: fileObject });
	            if (scope.onprogress) scope.onprogress({ file: fileObject });

	            var xhr = new XMLHttpRequest();
	            
	            // Update progress bar
	            xhr.upload.addEventListener("progress", function (evt) {
	              if (evt.lengthComputable) {
	                var progress = (evt.loaded / evt.total) * 100;
	                if (progress > fileObject.progress) fileObject.progress = progress;
	                progress = parseInt(progress);
	                if (scope.onprogress) scope.onprogress({ file: fileObject });
	              }
	            }, false);
	            
	            // xhr.addEventListener("load", function () { }, false);

	            xhr.onreadystatechange = function() {
	              var status;
	              var data;
	              if (xhr.readyState == 4) {
	                status = xhr.status;
	                if (status == 200) {
	                  data = JSON.parse(xhr.responseText);
	                  fileObject.url = data.secure_url;
	                  fileObject.cloudinary_format = data.format;
	                  fileObject.cloudinary_id = data.public_id;

	                  delete fileObject.progress;
	                  delete fileObject.uploading;

	                  if (scope.onupload) scope.onupload({ file: fileObject });
	                } else {
	                  //errorHandler && errorHandler(status);
	                }
	              }
	            };

	            xhr.open("POST", "https://api.cloudinary.com/v1_1/avatech/upload", true);

	            var formData = new FormData();
	            formData.append("upload_preset", "mqemm6fd");
	            formData.append("file", file);
	            xhr.send(formData);

	            // setTimeout(function(){

	            //   $log.debug(file);

	            //   // var fileObject = { name: file.name };
	            //   // if (scope.onadd) scope.onadd({ file: fileObject });

	            //   // var img = new Image();
	            //   // var reader = new FileReader();
	            //   // reader.onload = (function (_img, fileName, _file) {
	            //   //   fileObject.progress = 20; if (scope.onprogress) scope.onprogress({ file: fileObject });
	            //   //   return function (evt) {
	            //   //     _img.onload = function () { uploadImage(_img, fileName, _file); };
	            //   //     _img.src = evt.target.result;
	            //   //   };
	            //   // }(img, file.name, fileObject));
	            //   // reader.readAsDataURL(file);
	            // },100);
	        }

	        // function uploadImage(img, fileName, fileObject) {

	        //   fileObject.progress = 30; if (scope.onprogress) scope.onprogress({ file: fileObject });

	        //   // downsample image
	        //   var max = 2400;
	        //   if (img.width > max) {
	        //     img.width = max;
	        //     img.height = img.height * (img.width / img.naturalWidth);
	        //   }
	        //   else if (img.height > max) {
	        //     img.height = max;
	        //     img.width = img.width * (img.height / img.naturalHeight);
	        //   }

	        //   fileObject.progress = 40; if (scope.onprogress) scope.onprogress({ file: fileObject });

	        //   var canvas = document.createElement('canvas');
	        //   canvas.width = img.width;
	        //   canvas.height = img.height;

	        //   // hide canvas
	        //   canvas.style.opacity = "0";
	        //   canvas.style.position = "absolute";
	        //   canvas.style.zIndex = "-1";
	        //   canvas.style.left = "-999999px";
	        //   document.body.appendChild(canvas);

	        //   // load into canvas
	        //   var context = canvas.getContext('2d');
	        //   context.drawImage(img, 0, 0, img.width, img.height);

	        //   fileObject.progress = 50; if (scope.onprogress) scope.onprogress({ file: fileObject });
	        //   // // resize
	        //   // function resize_image( src, dst, type, quality ) {
	        //   //    var tmp = new Image(),
	        //   //        _canvas, _context, cW, cH;
	           
	        //   //    type = type || 'image/jpeg';
	        //   //    quality = quality || 0.92;
	           
	        //   //    cW = src.naturalWidth;
	        //   //    cH = src.naturalHeight;
	           
	        //   //    tmp.src = src.src;
	        //   //    tmp.onload = function() {
	           
	        //   //       _canvas = document.createElement( 'canvas' );
	           
	        //   //       cW /= 2;
	        //   //       cH /= 2;
	           
	        //   //       if ( cW < src.width ) cW = src.width;
	        //   //       if ( cH < src.height ) cH = src.height;
	           
	        //   //       _canvas.width = cW;
	        //   //       _canvas.height = cH;
	        //   //       _context = canvas.getContext( '2d' );
	        //   //       _context.drawImage( tmp, 0, 0, cW, cH );
	           
	        //   //       //dst.src = _canvas.toDataURL( type, quality );
	           
	        //   //       if ( cW <= src.width || cH <= src.height )
	        //   //          return _canvas;
	           
	        //   //       // tmp.src = dst.src;
	        //   //       // return _canvas;
	        //   //    }
	        //   // }
	        //   // var dst = new Image();
	        //   // img.width = img.width / 4;
	        //   // img.height = img.height / 4;

	        //   // var newCanvas = resize_image(img,dst,"image/jpeg", 1);
	        //   // $log.debug(newCanvas.width + "," + newCanvas.height);
	        //   $log.debug(canvas.width + "," + canvas.height);
	        //   //return;

	        //   // get data url of canvas
	        //   var dataUrl = canvas.toDataURL("image/jpeg", .8);

	        //   //scope.file = { url: dataUrl, name: fileName };

	        //   if (scope.onload) scope.onload({ file: fileObject });

	        //   // data url to blob
	        //   var b64 = dataUrl.slice(dataUrl.indexOf(',')+1);
	        //   var arr = atob(b64).split('').map(function (e) {return e.charCodeAt(0);});
	        //   var blob = new Blob([new Uint8Array(arr)],{ type: "image/jpeg"});
	        //   $log.debug(blob);

	        //   //setTimeout(function(){
	        //   fileObject.progress = 60; if (scope.onprogress) scope.onprogress({ file: fileObject });
	        //   //},10);

	        //   var xhr = new XMLHttpRequest();
	          
	        //   // Update progress bar
	        //   xhr.upload.addEventListener("progress", function (evt) {
	        //     if (evt.lengthComputable) {
	        //       $log.debug((evt.loaded / evt.total) * 100 + "%"); 
	        //       var progress = (evt.loaded / evt.total) * 100;
	        //       $log.debug(progress + "," + fileObject.progress);
	        //       if (progress > fileObject.progress) fileObject.progress = progress;
	        //       if (scope.onprogress) scope.onprogress({ file: fileObject });
	        //     }
	        //     else {
	        //       // No data to calculate on
	        //     }
	        //   }, false);
	          
	        //   xhr.addEventListener("load", function () {

	        //   }, false);

	        //   xhr.onreadystatechange = function() {
	        //     var status;
	        //     var data;
	        //     if (xhr.readyState == 4) {
	        //       status = xhr.status;
	        //       if (status == 200) {
	        //         data = JSON.parse(xhr.responseText);
	        //         fileObject.url = data.url;
	        //         if (scope.onupload) scope.onupload({ file: fileObject });
	        //         document.body.removeChild(canvas);
	        //       } else {
	        //         //errorHandler && errorHandler(status);
	        //       }
	        //     }
	        //   };

	        //   xhr.open("POST", "/upload", true);

	        //   var formData = new FormData();
	        //   formData.append("fileData", blob);
	        //   xhr.send(formData);
	        // }
	        
	        function traverseFiles (files) {
	          if (typeof files !== "undefined") {
	            for (var i=0, l=files.length; i<l; i++) {
	              uploadFile(files[i]);
	            }
	          }
	          else {
	           // fileList.innerHTML = "No support for the File API in this web browser";
	          } 
	        }
	        
	        filesUpload.addEventListener("change", function () {
	          traverseFiles(this.files);
	        }, false);
	        
	        dropArea.addEventListener("dragleave", function (evt) {
	          var target = evt.target;
	          
	            angular.element(dropArea).removeClass("over");
	          if (target && target === dropArea) {
	            angular.element(dropArea).removeClass("over");
	          }
	          evt.preventDefault();
	          evt.stopPropagation();
	        }, false);
	        
	        dropArea.addEventListener("dragenter", function (evt) {
	          angular.element(this).addClass("over");
	          evt.preventDefault();
	          evt.stopPropagation();
	        }, false);
	        
	        dropArea.addEventListener("dragover", function (evt) {
	          angular.element(this).addClass("over");
	          evt.preventDefault();
	          evt.stopPropagation();
	        }, false);
	        
	        dropArea.addEventListener("drop", function (evt) {
	          traverseFiles(evt.dataTransfer.files);
	          angular.element(this).removeClass("over");
	          evt.preventDefault();
	          evt.stopPropagation();
	        }, false);
	    }
	  };
	});

/***/ },
/* 46 */
/***/ function(module, exports) {

	angular.module('avatech').directive('grainSelect', function(snowpitConstants) {    

	    var template = "";
	    template += '<div class="btn-group grainTypeSelect" uib-dropdown>';
	    template += '  <div uib-dropdown-toggle>';
	    template += '    <span ng-hide="grainType" class="empty">{{ placeholder }}</span>';
	    template += '    <span class="snowsym" style="font-size:21px;position:relative;right:5px;"><span ng-style="grainTypeObject.style">{{ grainTypeObject.symbol }}</span></span>{{ grainTypeObject.desc }}';
	    template += '    <i ng-hide="grainType" class="fa fa-sort sort"></i>';
	    template += '  </div>';
	    template += '  <i ng-show="grainType" class="fa fa-times clear" ng-click="setGrainType(null)"></i>';
	    template += '  <ul class="dropdown-menu" role="menu" style="width:240px;height:auto;" >';
	    template += '    <li ng-show="!selectedCategory" ng-repeat="category in grainTypes"><a ng-click="selectCategory(category); $event.stopPropagation();" style="padding-top:0px;padding-bottom:0px;"><span class="snowsym" style="font-size:19px;position:relative;right:7px;"><span ng-style="type.style">{{ category.symbol }}</span></span> {{ category.desc }}</a></li>';
	    template += '    <li ng-show="selectedCategory" ng-click="selectedCategory = null; $event.stopPropagation();"><a style="font-weight:bold;margin-bottom:-4px;"><i class="fa fa-angle-left"></i>Categories</a></li>';
	    template += '    <li ng-show="selectedCategory" class="divider"></li>';
	    template += '    <li ng-repeat-start="category in grainTypes"></li>';
	    template += '    <li ng-show="selectedCategory == category.code" ng-repeat="type in category.types"><a ng-click="setGrainType(type.icssg)" close-dropdown-on-click style="padding-top:0px;padding-bottom:0px;"><span class="snowsym" style="font-size:19px;position:relative;right:7px;"><span ng-style="type.style">{{ type.symbol }}</span></span> {{ type.desc }}</a></li>';
	    template += '    <li ng-repeat-end></li>';
	    template += '  </ul>';
	    template += '</div>';

	    return {
	        restrict: 'E',
	        scope: {
	          grainType: '=ngModel',
	          placeholder: '@'
	        },
	        template: template,
	        link: function(scope, el, attrs) {    

	            scope.grainTypes = snowpitConstants.grainTypes;

	            scope.$watch('grainType',function(){
	                if (!scope.grainType) {
	                    scope.selectedCategory = null;
	                    scope.grainTypeObject = null;
	                    return;
	                }

	                angular.forEach(scope.grainTypes,function(category) {
	                    for (var i = 0; i < category.types.length; i++) {
	                        if (category.types[i].icssg == scope.grainType) {
	                            scope.selectedCategory = category.code;
	                            scope.grainTypeObject = category.types[i];
	                            return;
	                        }
	                    }
	                });
	            });
	            scope.selectCategory = function(category) { 
	                scope.selectedCategory = category.code;
	            };
	            scope.setGrainType = function(code) {
	                scope.grainType = code;
	            }; 
	        }
	    };        
	});

/***/ },
/* 47 */
/***/ function(module, exports) {

	
	angular.module('avatech').directive('imageUpload', function($http, $timeout, $log) {
	  return {
	    restrict: 'A',
	    scope: { 
	      onadd: '&',
	      onload: '&',
	      onprogress: '&',
	      onupload: '&'
	    },
	    //template: "<div class='upload-area'><input type='file' multiple/><div class='drop-area'><div class='big'>Drop photos here</div><div class='small'>or click to select files</div></div></div>",
	    link: function(scope, element) {

	      var label = document.createElement("label");

	      var filesUpload = document.createElement("input");
	      filesUpload.type = 'file';
	      $log.debug(element);
	      label.appendChild(filesUpload);
	      element[0].appendChild(label);

	      // CSS
	      if (element[0].style.position != "relative" && element[0].style.position != "absolute") {
	        element[0].style.position = "relative";
	      }
	      label.setAttribute("style", "background: red; position: absolute; top: 0; left: 0; width: 100%; bottom: 0; opacity: 0; cursor: pointer !important; margin: 0 !important; padding: 0 !important;");
	      filesUpload.setAttribute("style", "position: fixed; top: -1000000px;");

	      //var filesUpload = element[0].querySelector("input");
	      //var dropArea = element[0].querySelector(".upload-area");

	      function uploadFile (file) {

	            var ext = file.name.substr(file.name.lastIndexOf(".") + 1).toLowerCase();
	            $log.debug(ext);
	            if (['jpg','png','gif','bmp'].indexOf(ext) == -1) return;

	            setTimeout(function(){
	              var fileObject = { name: file.name };
	              if (scope.onadd) scope.onadd({ file: fileObject });

	              var img = new Image();
	              var reader = new FileReader();
	              reader.onload = (function (_img, fileName, _file) {
	                fileObject.progress = 20; if (scope.onprogress) scope.onprogress({ file: fileObject });
	                return function (evt) {
	                  _img.onload = function () { uploadImage(_img, fileName, _file); };
	                  _img.src = evt.target.result;
	                };
	              }(img, file.name, fileObject));
	              reader.readAsDataURL(file);
	            },100);
	        }

	        function uploadImage(img, fileName, fileObject) {

	          fileObject.progress = 30; if (scope.onprogress) scope.onprogress({ file: fileObject });

	          // downsample image
	          var max = 600;
	          if (img.width > max) {
	            img.width = max;
	            img.height = img.height * (img.width / img.naturalWidth);
	          }
	          else if (img.height > max) {
	            img.height = max;
	            img.width = img.width * (img.height / img.naturalHeight);
	          }

	          fileObject.progress = 40; if (scope.onprogress) scope.onprogress({ file: fileObject });

	          var canvas = document.createElement('canvas');
	          canvas.width = img.width;
	          canvas.height = img.height;

	          // hide canvas
	          canvas.style.opacity = "0";
	          canvas.style.position = "absolute";
	          canvas.style.zIndex = "-1";
	          canvas.style.left = "-999999px";
	          document.body.appendChild(canvas);

	          // draw white background
	          var context = canvas.getContext('2d');
	          context.fillStyle = '#fff';
	          context.fillRect(0, 0, canvas.width, canvas.height);

	          // load into canvas
	          context.drawImage(img, 0, 0, img.width, img.height);

	          fileObject.progress = 50; if (scope.onprogress) scope.onprogress({ file: fileObject });
	          
	          $log.debug(canvas.width + "," + canvas.height);

	          // get data url of canvas
	          var dataUrl = canvas.toDataURL("image/jpeg", 1);

	          //scope.file = { url: dataUrl, name: fileName };

	          if (scope.onload) scope.onload({ file: fileObject });

	          // data url to blob
	          var b64 = dataUrl.slice(dataUrl.indexOf(',')+1);
	          var arr = atob(b64).split('').map(function (e) {return e.charCodeAt(0);});
	          var blob = new Blob([new Uint8Array(arr)],{ type: "image/jpeg"});
	          $log.debug(blob);

	          //setTimeout(function(){
	          fileObject.progress = 60; if (scope.onprogress) scope.onprogress({ file: fileObject });
	          //},10);

	          var xhr = new XMLHttpRequest();
	          
	          // Update progress bar
	          xhr.upload.addEventListener("progress", function (evt) {
	            if (evt.lengthComputable) {
	              $log.debug((evt.loaded / evt.total) * 100 + "%"); 
	              var progress = (evt.loaded / evt.total) * 100;
	              $log.debug(progress + "," + fileObject.progress);
	              if (progress > fileObject.progress) fileObject.progress = progress;
	              if (scope.onprogress) scope.onprogress({ file: fileObject });
	            }
	            else {
	              // No data to calculate on
	            }
	          }, false);
	          
	          xhr.addEventListener("load", function () {

	          }, false);

	          xhr.onreadystatechange = function() {
	            var status;
	            var data;
	            if (xhr.readyState == 4) {
	              status = xhr.status;
	              if (status == 200) {
	                data = JSON.parse(xhr.responseText);
	                fileObject.url = data.url;
	                if (scope.onupload) scope.onupload({ file: fileObject });
	                document.body.removeChild(canvas);
	              } else {
	                //errorHandler && errorHandler(status);
	              }
	            }
	          };

	          xhr.open("POST", "/upload", true);

	          var formData = new FormData();
	          formData.append("fileData", blob);
	          xhr.send(formData);
	        }
	        
	        function traverseFiles (files) {
	          if (typeof files !== "undefined") {
	            for (var i=0, l=files.length; i<l; i++) {
	              uploadFile(files[i]);
	            }
	          }
	          else {
	           // fileList.innerHTML = "No support for the File API in this web browser";
	          } 
	        }
	        
	        filesUpload.addEventListener("change", function () {
	          traverseFiles(this.files);
	        }, false);
	        
	        // dropArea.addEventListener("dragleave", function (evt) {
	        //   var target = evt.target;
	          
	        //     angular.element(dropArea).removeClass("over");
	        //   if (target && target === dropArea) {
	        //     angular.element(dropArea).removeClass("over");
	        //   }
	        //   evt.preventDefault();
	        //   evt.stopPropagation();
	        // }, false);
	        
	        // dropArea.addEventListener("dragenter", function (evt) {
	        //   angular.element(this).addClass("over");
	        //   evt.preventDefault();
	        //   evt.stopPropagation();
	        // }, false);
	        
	        // dropArea.addEventListener("dragover", function (evt) {
	        //   angular.element(this).addClass("over");
	        //   evt.preventDefault();
	        //   evt.stopPropagation();
	        // }, false);
	        
	        // dropArea.addEventListener("drop", function (evt) {
	        //   traverseFiles(evt.dataTransfer.files);
	        //   angular.element(this).removeClass("over");
	        //   evt.preventDefault();
	        //   evt.stopPropagation();
	        // }, false);
	    }
	  };
	});

/***/ },
/* 48 */
/***/ function(module, exports) {

	angular.module('avatech').directive('inputDirectionRange', function() {    

	    var selectionArea = "<div class='bg'>";
	    selectionArea += "<div class='dir dir-N'>N</div>";
	    selectionArea += "<div class='dir dir-NE'>NE</div>";
	    selectionArea += "<div class='dir dir-E'>E</div>";
	    selectionArea += "<div class='dir dir-SE'>SE</div>";
	    selectionArea += "<div class='dir dir-S'>S</div>";
	    selectionArea += "<div class='dir dir-SW'>SW</div>";
	    selectionArea += "<div class='dir dir-W'>W</div>";
	    selectionArea += "<div class='dir dir-NW'>NW</div>";
	    selectionArea += "</div>";

	    selectionArea += "<input value='{{ _model }}' class='dial' data-min=0 data-max=359 data-width=90 data-displayInput=false data-cursor=12 data-thickness=.2 data-fgColor='#4285f4'>";
	  
	    return {
	        restrict: 'E',
	        scope: {
	          model: '=ngModel',
	          angleLow: '=angleLow',
	          angleHigh: '=angleHigh',
	        },
	        template: '<div style="min-width:100px;height:100px;overflow:hidden;text-align:center;padding-top:4px;margin-top:0px;display:inline-block;position:relative;"> ' + selectionArea + "</div>",
	        link: function(scope, el, attrs) {    

	            var input = { focus: function(){}};

	            $(el[0]).find("div.dir.dir-N").mousedown(function($event) {
	                scope.model = 0; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-NE").mousedown(function($event) {
	                scope.model = 45; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-E").mousedown(function($event) {
	                scope.model = 90; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-SE").mousedown(function($event) {
	                scope.model = 135; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-S").mousedown(function($event) {
	                scope.model = 180; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-SW").mousedown(function($event) {
	                scope.model = 225; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-W").mousedown(function($event) {
	                scope.model = 270; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-NW").mousedown(function($event) {
	                scope.model = 315; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });

	            scope.$watch('angleHigh', function(val) {
	                $(el[0]).find("input.dial").trigger('setAngleHigh', val).trigger('change');
	            });
	            scope.$watch('angleLow', function(val) {
	                $(el[0]).find("input.dial").trigger('setAngleLow', val).trigger('change');
	            });

	            scope.$watch('model', function(newVal) {
	              if (newVal === 0) scope._model = "N";
	              else if (newVal == 45) scope._model = "NE";
	              else if (newVal == 90) scope._model = "E";
	              else if (newVal == 135) scope._model = "SE";
	              else if (newVal == 180) scope._model = "S";
	              else if (newVal == 225) scope._model = "SW";
	              else if (newVal == 270) scope._model = "W";
	              else if (newVal == 315) scope._model = "NW";
	              else scope._model = newVal;
	            });


	            scope.$watch('_model', function(newVal) {
	              if(newVal === null || newVal === undefined) {
	                //scope.model = null;
	                $(el[0]).find("input.dial").val(-999).trigger('change');
	                return;
	            }

	                if (newVal.length && newVal.toLowerCase() == "n") {
	                    $(el[0]).find("input.dial").val(0).trigger('change');
	                    scope.model = 0;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "ne") {
	                    $(el[0]).find("input.dial").val(45).trigger('change');
	                    scope.model = 45;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "e") {
	                    $(el[0]).find("input.dial").val(90).trigger('change');
	                    scope.model = 90;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "se") {
	                    $(el[0]).find("input.dial").val(135).trigger('change');
	                    scope.model = 135;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "s") {
	                    $(el[0]).find("input.dial").val(180).trigger('change');
	                    scope.model = 180;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "sw") {
	                    $(el[0]).find("input.dial").val(225).trigger('change');
	                    scope.model = 225; 
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "w") {
	                    $(el[0]).find("input.dial").val(270).trigger('change');
	                    scope.model = 270;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "nw") {
	                    $(el[0]).find("input.dial").val(315).trigger('change');
	                    scope.model = 315;
	                    return;
	                }

	              newVal = parseInt(newVal);

	              if (newVal > 359) newVal = 0;
	              else if (newVal < 0) newVal = 0;
	              else if (isNaN(newVal) || newVal === null || newVal === undefined) {
	                newVal = null;
	              }
	              // setting model to null doesn't trigger $watch (why?), so we have to manually set _model to null
	              if (newVal === null) scope._model = null;
	              scope.model = newVal;

	              if (!(isNaN(newVal) || newVal === null || newVal=== undefined)) {
	                $(el[0]).find("input.dial").val(newVal).trigger('change');
	              }

	            });
	    
	            // init jquery-knob
	            $(el[0]).find("input.dial").knob({
	              change: function(newVal) {
	                newVal = parseInt(newVal);
	                scope.model = newVal;
	                scope.$apply();
	              },
	              draw: function(context) {

	              }
	            });
	        }
	    };        
	});

	angular.module('avatech').directive('inputDirection', function() {    

	    var selectionArea = "<div class='bg'>";
	    selectionArea += "<div class='dir dir-N'>N</div>";
	    selectionArea += "<div class='dir dir-NE'>NE</div>";
	    selectionArea += "<div class='dir dir-E'>E</div>";
	    selectionArea += "<div class='dir dir-SE'>SE</div>";
	    selectionArea += "<div class='dir dir-S'>S</div>";
	    selectionArea += "<div class='dir dir-SW'>SW</div>";
	    selectionArea += "<div class='dir dir-W'>W</div>";
	    selectionArea += "<div class='dir dir-NW'>NW</div>";
	    selectionArea += "</div>";

	    selectionArea += "<input value='{{ _model }}' class='dial' data-min=0 data-max=359 data-width=90 data-displayInput=false data-cursor=12 data-thickness=.2 data-fgColor='#4285f4'>";
	  
	    return {
	        restrict: 'E',
	        scope: {
	          model: '=ngModel'
	        },
	        template: '<div class="btn-group" uib-dropdown is-open="isOpen" ><div><input style="width:65px;" ng-model="_model" class="trigger" ng-focus="isOpen = true" ></div><ul class="dropdown-menu" role="menu" style="min-width:100px;height:100px;overflow:hidden;text-align:center;padding-top:4px;margin-top:0px;">' + selectionArea + '</ul></div>',
	        link: function(scope, el, attrs) {    
	            var input = $(el[0]).find("input.trigger");

	            $(el[0]).find("div.dir.dir-N").mousedown(function($event) {
	                scope.model = 0; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-NE").mousedown(function($event) {
	                scope.model = 45; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-E").mousedown(function($event) {
	                scope.model = 90; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-SE").mousedown(function($event) {
	                scope.model = 135; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-S").mousedown(function($event) {
	                scope.model = 180; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-SW").mousedown(function($event) {
	                scope.model = 225; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-W").mousedown(function($event) {
	                scope.model = 270; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });
	            $(el[0]).find("div.dir.dir-NW").mousedown(function($event) {
	                scope.model = 315; scope.$apply(); input.focus();
	                $(el[0]).find("input.dial").val(scope.model).trigger('change');
	            });

	            var className = attrs.inputClass;
	            input.addClass(className);

	            scope.$watch('model', function(newVal) {
	              if (newVal === 0) scope._model = "N";
	              else if (newVal == 45) scope._model = "NE";
	              else if (newVal == 90) scope._model = "E";
	              else if (newVal == 135) scope._model = "SE";
	              else if (newVal == 180) scope._model = "S";
	              else if (newVal == 225) scope._model = "SW";
	              else if (newVal == 270) scope._model = "W";
	              else if (newVal == 315) scope._model = "NW";
	              else scope._model = newVal;
	            });


	            scope.$watch('_model', function(newVal) {
	              if(newVal=== null || newVal=== undefined) {
	                //scope.model = null;
	                $(el[0]).find("input.dial").val(-999).trigger('change');
	                return;
	            }

	                if (newVal.length && newVal.toLowerCase() == "n") {
	                    $(el[0]).find("input.dial").val(0).trigger('change');
	                    scope.model = 0;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "ne") {
	                    $(el[0]).find("input.dial").val(45).trigger('change');
	                    scope.model = 45;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "e") {
	                    $(el[0]).find("input.dial").val(90).trigger('change');
	                    scope.model = 90;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "se") {
	                    $(el[0]).find("input.dial").val(135).trigger('change');
	                    scope.model = 135;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "s") {
	                    $(el[0]).find("input.dial").val(180).trigger('change');
	                    scope.model = 180;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "sw") {
	                    $(el[0]).find("input.dial").val(225).trigger('change');
	                    scope.model = 225; 
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "w") {
	                    $(el[0]).find("input.dial").val(270).trigger('change');
	                    scope.model = 270;
	                    return;
	                }
	                else if (newVal.length && newVal.toLowerCase() == "nw") {
	                    $(el[0]).find("input.dial").val(315).trigger('change');
	                    scope.model = 315;
	                    return;
	                }

	              newVal = parseInt(newVal);

	              if (newVal > 359) newVal = 0;
	              else if (newVal < 0) newVal = 0;
	              else if (isNaN(newVal) || newVal === null || newVal === undefined) {
	                newVal = null;
	              }
	              // setting model to null doesn't trigger $watch (why?), so we have to manually set _model to null
	              if (newVal === null) scope._model = null;
	              scope.model = newVal;

	              if (!(isNaN(newVal) || newVal === null || newVal === undefined))
	                $(el[0]).find("input.dial").val(newVal).trigger('change');
	            });
	    
	            // init jquery-knob
	            $(el[0]).find("input.dial").knob({
	              change: function(newVal) {
	                newVal = parseInt(newVal);
	                scope.model = newVal;
	                scope.$apply();
	              }
	            });

	            // prevent default dropdown behavior
	            input.click(function($event) {
	                $event.preventDefault();
	                $event.stopPropagation();
	            });

	            // simulate blur
	            input.keydown(function($event) {
	                var keyCode = $event.keyCode || $event.which; 
	                if (keyCode == 9) {
	                  scope.isOpen = false;
	                  scope.$apply();
	                }
	            });

	            // prevent hide when clicking inside dropdown
	            $(el[0]).find("ul").click(function($event) {
	                $event.preventDefault();
	                $event.stopPropagation();
	            });
	        }
	    };        
	});

/***/ },
/* 49 */
/***/ function(module, exports) {

	angular.module('avatech').directive('locationSelectButton', function(LocationSelectModal) {    
	    return {
	        restrict: 'A',
	        scope: {
	          model: '=ngModel'
	        },
	        link: function(scope, el, attrs) {    
	            // el.bind('click', function($event) {
	            //   var el = $($event.target).closest(".open");
	            //   if (el && el.data() && el.data().$uibDropdownController) el.data().$uibDropdownController.toggle();
	            //   scope.$apply();
	            // });
	            el.bind('click', function($event) {

	                LocationSelectModal.open({
	                    initialLocation: scope.model
	                }).then(function (location) {
	                    if (location && location.length == 2) {
	                        location[0] = parseFloat(location[0].toFixed(7)); 
	                        location[1] = parseFloat(location[1].toFixed(7)); 
	                        scope.model = location;
	                    }
	                }, function () {
	                    // on dismiss
	                });

	            });
	        }
	    };        
	});

	angular.module('avatech').directive('accordionNew', function () {
	    return {
	        restrict: 'E',
	        link: function (scope, elem, attrs, ctrl) {
	            $(elem).find(".header").click(function() {
	                if ($(this).parent().hasClass("open")) {
	                    $(this).parent().removeClass("open");
	                }
	                else {
	                    $(elem).find(".accordion-item").removeClass("open");
	                    $(this).parent().addClass("open");
	                }
	            });
	        }
	    }
	});

	// on enter
	angular.module('avatech').directive('onenter', function() {
	  return {
	    restrict: 'A',
	    scope: {
	      onenter: '&'
	    },
	    link: function(scope, elem, attr, ctrl) {
	      $(elem).keydown(function(event) {
	         if (event.keyCode == 13) {
	            scope.onenter();
	            return false;
	         }
	      });
	    }
	  };
	});

	angular.module('avatech').directive('focusOn', ['$timeout', '$parse',function($timeout, $parse) {
	  return {
	    link: function(scope, element, attrs) {
	      var model = $parse(attrs.focusOn);
	      scope.focus = function(modelName) {
	        if (!scope[modelName]) scope[modelName] = 0;
	        scope[modelName]++;
	      };
	      scope.$watch(model, function(value) {
	        $timeout(function() {
	          element[0].focus(); 
	        });
	      });
	    }
	  };
	}]);
	angular.module('avatech').directive('autoFocus', function() {
	    return {
	        restrict: 'AC',
	        link: function(_scope, _element) {
	            _element[0].focus();
	        }
	    };
	});

	angular.module('avatech').directive('windowResize', ['$window', function($window) {
	  return function($scope) {
	    $scope._getWindowSize = function() {
	      $scope.windowHeight = $window.innerHeight;
	      $scope.windowWidth  = $window.innerWidth;
	    };
	    angular.element($window).bind("resize", function() {
	      $scope._getWindowSize();
	    });
	    $scope._getWindowSize();
	  };
	}]);

	angular.module('avatech').directive('onChange', function() {    
	    return {
	        restrict: 'A',
	        scope:{'onChange':'=' },
	        link: function(scope, elm, attrs) {
	            scope.$watch('onChange', function(nVal) { elm.val(nVal); });            
	            elm.bind('blur', function() {
	                var currentValue = elm.val();
	                if( scope.onChange !== currentValue ) {
	                    scope.$apply(function() {
	                        scope.onChange = currentValue;
	                    });
	                }
	            });
	        }
	    };        
	});

	angular.module('avatech').directive('metersOrFeet', ['$window','$parse', function ($window, $parse) {
	    return {
	        require:'^ngModel',
	        restrict:'A',
	        link:function (scope, elm, attrs, ctrl) {
	            var metersOrFeet = attrs.metersOrFeet;

	            attrs.$observe('metersOrFeet', function (newValue) {
	                if (newValue === null) return;
	                metersOrFeet = newValue;
	            });

	            ctrl.$formatters.unshift(function (modelValue) {
	                if (modelValue === null) return;

	                // if feet
	                if (metersOrFeet == 1) return Math.round(modelValue * 3.28084);
	                else return Math.round(modelValue);
	            });

	            ctrl.$parsers.unshift(function (viewValue) {
	                // if feet
	                if (metersOrFeet == 1) {
	                    return (viewValue * 0.3048);
	                }
	                // if meters (multiply by 1 to screen out non-numbers)
	                else return (viewValue * 1);
	            });
	        }
	    };
	}]);

	angular.module('avatech').directive('cmOrIn', ['$window','$parse', function ($window, $parse) {
	    return {
	        require:'^ngModel',
	        restrict:'A',
	        link:function (scope, elm, attrs, ctrl) {
	            var cmOrIn = attrs.cmOrIn;

	            attrs.$observe('cmOrIn', function (newValue) {
	                if (newValue === null) return;
	                cmOrIn = newValue;
	            });

	            ctrl.$formatters.unshift(function (modelValue) {
	                if (modelValue === null) return;
	                if (cmOrIn == 1) return Math.round(modelValue * 0.393701); 
	                else return Math.round(modelValue);
	            });

	            ctrl.$parsers.unshift(function (viewValue) {
	                // if inches
	                if (cmOrIn == 1) {
	                    return (viewValue * 2.54);
	                }
	                // if cm (multiply by 1 to screen out non-numbers)
	                else return (viewValue * 1);
	            });
	        }
	    };
	}]);

	angular.module('avatech').directive('tempUnits', ['$window','$parse', function ($window, $parse) {
	    return {
	        require:'^ngModel',
	        restrict:'A',
	        link:function (scope, elm, attrs, ctrl) {
	            var tempUnits = attrs.tempUnits;

	            attrs.$observe('tempUnits', function (newValue) {
	                if (newValue === null) return;
	                tempUnits = newValue;
	            });

	            ctrl.$formatters.unshift(function (modelValue) {
	                if (modelValue === null) return;
	                // if fahrenheit
	                if (tempUnits == 'F') return ((modelValue*(9/5))+32);
	                else return Math.round(modelValue).toFixed(1);
	            });

	            ctrl.$parsers.unshift(function (viewValue) {
	                // if fahrenheit
	                if (viewValue == "-") return "-";
	                if (tempUnits == 'F') {
	                    return (viewValue - 32) * (5/9);
	                }
	                // if celsius (multiply by 1 to screen out non-numbers)
	                else return (viewValue * 1);
	            });
	        }
	    };
	}]);

	angular.module('avatech').directive('numberOnly', function () {
	    return {
	        restrict: 'EA',
	        require: '?ngModel',
	        scope:{
	            allowDecimal: '@',
	            allowNegative: '@',
	            minNum: '@',
	            maxNum: '@'
	        },

	        link: function (scope, element, attrs, ctrl) {
	            if (!ctrl) return;
	            ctrl.$parsers.unshift(function (inputValue) {
	                var decimalFound = false;
	                var digits = inputValue.split('').filter(function (s,i)
	                {
	                    var b = (!isNaN(s) && s != ' ');
	                    if (!b && attrs.allowDecimal && attrs.allowDecimal == "true")
	                    {
	                        if (s == "." && decimalFound === false)
	                        {
	                            decimalFound = true;
	                            b = true;
	                        }
	                    }
	                    if (!b && attrs.allowNegative && attrs.allowNegative == "true")
	                    {
	                        b = (s == '-' && i === 0);
	                    }

	                    return b;
	                }).join('');
	                if (attrs.maxNum && !isNaN(attrs.maxNum) && parseFloat(digits) > parseFloat(attrs.maxNum))
	                {
	                    digits = attrs.maxNum;
	                }
	                if (attrs.minNum && !isNaN(attrs.minNum) && parseFloat(digits) < parseFloat(attrs.minNum))
	                {
	                    digits = attrs.minNum;
	                }
	                ctrl.$viewValue = digits;
	                ctrl.$render();

	                return digits;
	            });
	        }
	    };
	});

	// closes a bootstrap dropdown when clicked (can be anywhere within the dropdown)
	angular.module('avatech').directive('closeDropdownOnClick', function() {    
	    return {
	        restrict: 'A',
	        link: function(scope, el, attrs) {    
	            el.bind('click', function($event) {
	              var el = $($event.target).closest(".open");
	              if (el && el.data() && el.data().$uibDropdownController) el.data().$uibDropdownController.toggle();
	              scope.$apply();
	            });
	        }
	    };        
	});

	angular.module('avatech').directive('tooltipHideOnClick', function() {    
	    return {
	        restrict: 'A',
	        link: function(scope, el, attrs) {    
	            el.bind('click', function($event) {
	              // var el = $($event.target).closest(".open");
	              // if (el && el.data().$dropdownController) el.data().$dropdownController.toggle();
	              // scope.$apply();
	              el.data().$scope.tt_isOpen = false;
	              //console.log(el.data().$scope.tt_isOpen);
	            });
	        }
	    };        
	});

	angular.module('avatech').directive('selectOnClick', function () {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            element.on('click', function () {
	                this.select();
	            });
	        }
	    };
	});

/***/ },
/* 50 */
/***/ function(module, exports) {

	// textarea autosize (relies on jquery.autosize.js)
	angular.module('avatech').directive('autosize', function() {
	  return {
	    restrict: 'A',
	    link: function(scope, elem, attr, ctrl) {
	      $(elem).on('focus', function(){
	        $(this).autosize();
	      });
	      // handle programatic reset to empty string
	      scope.$watch(function() { return $(elem).val(); }, 
	      function(newVal, oldVal) {
	        if(newVal === null || newVal === "" && oldVal !== null && oldVal !== "") {
	          $(elem).autosize().show().trigger('autosize.resize');
	        }
	      });
	    }
	  };
	});

	(function ($) {
	  var
	  defaults = {
	    className: 'autosizejs',
	    id: 'autosizejs',
	    append: '',
	    callback: false,
	    resizeDelay: 10,
	    placeholder: true
	  },

	  // border:0 is unnecessary, but avoids a bug in Firefox on OSX
	  copy = '<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;"/>',

	  // line-height is conditionally included because IE7/IE8/old Opera do not return the correct value.
	  typographyStyles = [
	    'fontFamily',
	    'fontSize',
	    'fontWeight',
	    'fontStyle',
	    'letterSpacing',
	    'textTransform',
	    'wordSpacing',
	    'textIndent'
	  ],

	  // to keep track which textarea is being mirrored when adjust() is called.
	  mirrored,

	  // the mirror element, which is used to calculate what size the mirrored element should be.
	  mirror = $(copy).data('autosize', true)[0];

	  // test that line-height can be accurately copied.
	  mirror.style.lineHeight = '99px';
	  if ($(mirror).css('lineHeight') === '99px') {
	    typographyStyles.push('lineHeight');
	  }
	  mirror.style.lineHeight = '';

	  $.fn.autosize = function (options) {
	    if (!this.length) {
	      return this;
	    }

	    options = $.extend({}, defaults, options || {});

	    if (mirror.parentNode !== document.body) {
	      $(document.body).append(mirror);
	    }

	    return this.each(function () {
	      var
	      ta = this,
	      $ta = $(ta),
	      maxHeight,
	      minHeight,
	      boxOffset = 0,
	      callback = $.isFunction(options.callback),
	      originalStyles = {
	        height: ta.style.height,
	        overflow: ta.style.overflow,
	        overflowY: ta.style.overflowY,
	        wordWrap: ta.style.wordWrap,
	        resize: ta.style.resize
	      },
	      timeout,
	      width = $ta.width(),
	      taResize = $ta.css('resize');

	      if ($ta.data('autosize')) {
	        // exit if autosize has already been applied, or if the textarea is the mirror element.
	        return;
	      }
	      $ta.data('autosize', true);

	      if ($ta.css('box-sizing') === 'border-box' || $ta.css('-moz-box-sizing') === 'border-box' || $ta.css('-webkit-box-sizing') === 'border-box'){
	        boxOffset = $ta.outerHeight() - $ta.height();
	      }

	      // IE8 and lower return 'auto', which parses to NaN, if no min-height is set.
	      minHeight = Math.max(parseInt($ta.css('minHeight'), 10) - boxOffset || 0, $ta.height());

	      $ta.css({
	        overflow: 'hidden',
	        overflowY: 'hidden',
	        wordWrap: 'break-word' // horizontal overflow is hidden, so break-word is necessary for handling words longer than the textarea width
	      });

	      if (taResize === 'vertical') {
	        $ta.css('resize','none');
	      } else if (taResize === 'both') {
	        $ta.css('resize', 'horizontal');
	      }

	      // The mirror width must exactly match the textarea width, so using getBoundingClientRect because it doesn't round the sub-pixel value.
	      // window.getComputedStyle, getBoundingClientRect returning a width are unsupported, but also unneeded in IE8 and lower.
	      function setWidth() {
	        var width;
	        var style = window.getComputedStyle ? window.getComputedStyle(ta, null) : false;
	        
	        if (style) {

	          width = ta.getBoundingClientRect().width;

	          if (width === 0 || typeof width !== 'number') {
	            width = parseInt(style.width,10);
	          }

	          $.each(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], function(i,val){
	            width -= parseInt(style[val],10);
	          });
	        } else {
	          width = $ta.width();
	        }

	        mirror.style.width = Math.max(width,0) + 'px';
	      }

	      function initMirror() {
	        var styles = {};

	        mirrored = ta;
	        mirror.className = options.className;
	        mirror.id = options.id;
	        maxHeight = parseInt($ta.css('maxHeight'), 10);

	        // mirror is a duplicate textarea located off-screen that
	        // is automatically updated to contain the same text as the
	        // original textarea.  mirror always has a height of 0.
	        // This gives a cross-browser supported way getting the actual
	        // height of the text, through the scrollTop property.
	        $.each(typographyStyles, function(i,val){
	          styles[val] = $ta.css(val);
	        });
	        
	        $(mirror).css(styles).attr('wrap', $ta.attr('wrap'));

	        setWidth();

	        // Chrome-specific fix:
	        // When the textarea y-overflow is hidden, Chrome doesn't reflow the text to account for the space
	        // made available by removing the scrollbar. This workaround triggers the reflow for Chrome.
	        if (window.chrome) {
	          var width = ta.style.width;
	          ta.style.width = '0px';
	          var ignore = ta.offsetWidth;
	          ta.style.width = width;
	        }
	      }

	      // Using mainly bare JS in this function because it is going
	      // to fire very often while typing, and needs to very efficient.
	      function adjust() {
	        var height, original;

	        if (mirrored !== ta) {
	          initMirror();
	        } else {
	          setWidth();
	        }

	        if (!ta.value && options.placeholder) {
	          // If the textarea is empty, copy the placeholder text into 
	          // the mirror control and use that for sizing so that we 
	          // don't end up with placeholder getting trimmed.
	          mirror.value = ($ta.attr("placeholder") || '') + options.append;
	        } else {
	          mirror.value = ta.value + options.append;
	        }

	        mirror.style.overflowY = ta.style.overflowY;
	        original = parseInt(ta.style.height,10);

	        // Setting scrollTop to zero is needed in IE8 and lower for the next step to be accurately applied
	        mirror.scrollTop = 0;

	        mirror.scrollTop = 9e4;

	        // Using scrollTop rather than scrollHeight because scrollHeight is non-standard and includes padding.
	        height = mirror.scrollTop;

	        if (maxHeight && height > maxHeight) {
	          ta.style.overflowY = 'scroll';
	          height = maxHeight;
	        } else {
	          ta.style.overflowY = 'hidden';
	          if (height < minHeight) {
	            height = minHeight;
	          }
	        }

	        height += boxOffset;

	        if (original !== height) {
	          ta.style.height = height + 'px';
	          if (callback) {
	            options.callback.call(ta,ta);
	          }
	        }
	      }

	      function resize () {
	        clearTimeout(timeout);
	        timeout = setTimeout(function(){
	          var newWidth = $ta.width();

	          if (newWidth !== width) {
	            width = newWidth;
	            adjust();
	          }
	        }, parseInt(options.resizeDelay,10));
	      }

	      if ('onpropertychange' in ta) {
	        if ('oninput' in ta) {
	          // Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
	          // so binding to onkeyup to catch most of those occasions.  There is no way that I
	          // know of to detect something like 'cut' in IE9.
	          $ta.on('input.autosize keyup.autosize', adjust);
	        } else {
	          // IE7 / IE8
	          $ta.on('propertychange.autosize', function(){
	            if(event.propertyName === 'value'){
	              adjust();
	            }
	          });
	        }
	      } else {
	        // Modern Browsers
	        $ta.on('input.autosize', adjust);
	      }

	      // Set options.resizeDelay to false if using fixed-width textarea elements.
	      // Uses a timeout and width check to reduce the amount of times adjust needs to be called after window resize.

	      if (options.resizeDelay !== false) {
	        $(window).on('resize.autosize', resize);
	      }

	      // Event for manual triggering if needed.
	      // Should only be needed when the value of the textarea is changed through JavaScript rather than user input.
	      $ta.on('autosize.resize', adjust);

	      // Event for manual triggering that also forces the styles to update as well.
	      // Should only be needed if one of typography styles of the textarea change, and the textarea is already the target of the adjust method.
	      $ta.on('autosize.resizeIncludeStyle', function() {
	        mirrored = null;
	        adjust();
	      });

	      $ta.on('autosize.destroy', function(){
	        mirrored = null;
	        clearTimeout(timeout);
	        $(window).off('resize', resize);
	        $ta
	          .off('autosize')
	          .off('.autosize')
	          .css(originalStyles)
	          .removeData('autosize');
	      });

	      // Call adjust in case the textarea already contains text.
	      adjust();
	    });
	  };
	}(window.jQuery || window.$)); // jQuery or jQuery-like library, such as Zepto

/***/ },
/* 51 */
/***/ function(module, exports) {

	angular.module('avatech').directive('time', function($compile) {
	  return {
	    restrict: 'A', //attribute or element
	    scope: {
	      model: '=time',
	     //bindAttr: '='
	    },
	    //template: '<div class="some">' +
	    //  '<input ng-model="myDirectiveVar"></div>',
	    //replace: true,
	    //require: 'ngModel',
	    link: function(scope, elem, attr, ctrl) {

	      scope._model = null;

	      scope.$watch("model",function(newModel){
	        scope._model = angular.copy(newModel);
	        var newDate = new Date(newModel);
	        if (newModel !== null && newDate instanceof Date && !isNaN(newDate.valueOf())) {
	          elem.val(formatTime(newDate));
	        }
	        else elem.val("");
	      });

	      elem.bind("blur",function(){
	        validate(elem.val());
	      });
	      elem.bind("keydown keypress", function(event) {
	        if (event.which === 13) {
	            event.preventDefault();
	            validate(elem.val());
	        }
	      });

	      function formatTime(date) {
	        var hours = date.getHours();
	        var minutes = date.getMinutes();
	        var ampm = hours >= 12 ? 'PM' : 'AM';
	        hours = hours % 12;
	        hours = hours ? hours : 12; // the hour '0' should be '12'
	        minutes = minutes < 10 ? '0'+minutes : minutes;
	        var strTime = hours + ':' + minutes + ' ' + ampm;
	        return strTime;
	      }

	      function validate(text) {
	        var newTime = parseTime(text);
	        if (newTime !== null) scope.model = newTime;
	        else scope.model = null;
	        scope.$apply();
	      }

	      function insertIntoString(a,b,position) {
	        return [a.slice(0, position), b, a.slice(position)].join('');
	      }

	      function parseTime(text) {
	        text = text.trim().toLowerCase();

	        if (text === "") return null;

	        // try to parse
	        var date = Date.parse("1/1/1800 " + text); 

	        // if date is invalid, parse manually
	        if (isNaN(date)) {
	          var AM_PM = "";
	          if (text.indexOf("a") > -1 && text.indexOf("p") == -1) AM_PM = "am";
	          else if (text.indexOf("p") > -1 && text.indexOf("a") == -1) AM_PM = "pm";

	          // strip out everything but numbers and colons
	          text = text.replace(/[^0-9:]/g, '');

	          var h = 0;
	          var m = 0;
	          //var s = null;

	          // trim length
	          text = text.substr(0,6);

	          // if no colon, place it
	          if (text.indexOf(":") == -1){
	            if (text.length == 1 || text.length == 2) text = text + ":00";
	            else if (text.length == 3) text = insertIntoString(text,':',1);
	            else if (text.length == 4) text = insertIntoString(text,':',2);
	            else if (text.length == 5 || text.length == 6) {
	              text = insertIntoString(text,':',2);
	              text = insertIntoString(text,':',5);
	            }
	          }

	          // split by colon
	          var parts = text.split(":");
	          for (var p = 0; p < parts.length; p++) {
	            var num = parseInt(parts[p]);
	            if (num !== null && !isNaN(num)) {
	              if (p === 0) h = num;
	              else if (p == 1) m = num;
	              //else if (p == 2) h = num;
	            }
	          }

	          // 24-hour time
	          if (h === 0) {
	            h = 12; AM_PM = "am";
	          }
	          else if (h > 12 && h <= 23) {
	            h = h - 12; AM_PM = "pm";
	          }

	          // if junk
	          if (h === 0 && m === 0) return null;

	          // parse date
	          date = Date.parse("1/1/1800 " + h + ":" + m + (AM_PM === "" ? "" : " " + AM_PM) ); 
	        }
	        // if it's still bad, return null
	        if (isNaN(date)) return null;
	        else return new Date(date);
	      }
	    }
	  };
	});

/***/ },
/* 52 */
/***/ function(module, exports) {

	
	// bootstrap form validation
	angular.module('avatech').directive('validate', function() {
	  return {
	    restrict: 'A',
	    compile: function(elem, attr) {
	      var formName = attr.name;

	      // turn off html5 validation
	      elem[0].setAttribute("novalidate","");

	      // ng-submit
	      var submitVariableName = "__submit_" + formName;

	      // get 'form-group' divs
	      var formGroups = elem[0].querySelectorAll('.form-group');

	      var inputs = [];
	      angular.forEach(formGroups, function(formGroup) {
	        formGroup = angular.element(formGroup);
	        var input = formGroup[0].querySelector('.form-control');

	        if (input) {

	          //var newName = input.attributes['ng-model'];
	          var newName = formGroup[0].getAttribute('name');

	          // if ngModel exists
	          if (newName) {
	            // replace '.' with '-'
	            //var newName = newName.replace(/\./g, '_');

	            // keep track of input blur
	            var blurVariableName = "__blur_" + formName + "_" + newName;
	            input.setAttribute("ng-blur", blurVariableName + " = true");

	            // set input name/id
	            input.setAttribute("name", newName);
	            input.setAttribute("id", newName);
	            
	            // set 'for' on label
	            var label = formGroup[0].querySelector('label');
	            if (label) label.setAttribute("for", newName);

	            // form group css ('has-error')
	            var errorClassVariableName = "__error_" + formName + "_" + newName;
	            formGroup[0].setAttribute("ng-class", "{ 'has-error': (" + submitVariableName + " || " + blurVariableName + ") && " + errorClassVariableName + " }");

	            // error message
	            var errorMessage = formGroup[0].querySelector(".error-message");
	            if (errorMessage) {
	              errorMessage.setAttribute("ng-show","(" + submitVariableName + " || " + blurVariableName + ")");
	              errorMessage.innerHTML = "{{ __message_" + formName + "_" + newName + " }}";
	            }

	            inputs.push(newName);
	          }
	        }
	      });

	      // link function
	      return function postLink(scope, elem, attrs, controller) { 
	          elem.bind('submit', function(e) {
	            e.preventDefault();
	            scope[submitVariableName] = true;
	            scope.$apply();
	          });

	          angular.forEach(inputs, function(newName) {
	            scope.$watch(function(){ if (scope[formName][newName]) return scope[formName][newName].$error; else return null; }, function(errors){
	              if (!errors) return;
	              
	              // field is valid
	              if (scope[formName][newName].$valid) {
	                scope["__error_" + formName + "_" + newName] = false;
	                scope["__message_" + formName + "_" + newName] = "";
	              }
	              // field is invalid
	              else {
	                scope["__error_" + formName + "_" + newName] = true;
	                angular.forEach(errors,function(isValid, field){
	                  var message = "";
	                  if (field == "required") message = "Required";
	                  else if (field == "email") message = "Enter a valid email address";
	                  else message = field;
	                  if (isValid) scope["__message_" + formName + "_" + newName] = message;
	                });
	              }

	            }, true);
	          });
	      };
	    }
	  };
	});

/***/ },
/* 53 */
/***/ function(module, exports) {

	angular.element(document).ready(function() {
	    // fix facebook bug with redirect
	    // (not using fb login at the moment, but still should keep this for reference)
	    if (window.location.hash == "#_=_") window.location.hash = "";

	    // if user already exists
	    var injector = angular.injector(["ng","LocalStorageModule"]);
	    var localStorageService = injector.get("localStorageService");
	    var $http = injector.get("$http");

	    var auth = localStorageService.get('auth');
	    if (auth) {
	    	$http.defaults.headers.common['Auth-Token'] = auth.authToken;
	    	$http.get(window.apiBaseUrl + 'users/' + auth.userId)
	    	.then(
	        // user found
	        function(response) {
	    		window._user = response.data;
	            angular.bootstrap(document, ['avatech']);
	    	},
	        // error
	        function(response) {
	            // if API is not found, show API error
	            // why don't we do this through Angular? 
	            // 1) it would be a sizeable amount of hacky code just for this (as opposed to one line here)
	            // 2) it would require the entire app to be boostrapped just to show an error (slow)
	            // 3) there's nothing interactive that needs to happen on the error page - purely static
	            // todo: well worth revisiting in the future...
	            if (response.status == 0 || response.status == 500) 
	                document.body.className += ' api-error';

	            // if 40X, start the app regularly (goes to login page)
	            else angular.bootstrap(document, ['avatech']);
	        });
	    }
	    // if no auth token is found, start the app (go to login page)
	    else angular.bootstrap(document, ['avatech']);
	});

/***/ }
/******/ ]);