
// define routes
angular.module('avatech').config(['$routeProvider','$stateProvider', '$urlRouterProvider', '$httpProvider',
    function($routeProvider,$stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.interceptors.push('httpRequestInterceptor');
        // register routes defined in routes.js
        // for (var route in window.routes) {
        //     $routeProvider.when(route,window.routes[route]);
        // };
        // 404
        //$routeProvider.otherwise({ templateUrl: '/views/404.html' });
    
      //$urlRouterProvider.otherwise("/404");


      $stateProvider
        // .state('map', {
        //     url: "/map",
        //     templateUrl: '/views/map.html',
        //     controller: 'MapController',
        //     data: { requireLogin: true }
        // })
        // .state('map.profile', {
        //     url: "/profile/:profileId",
        //     templateUrl: '/views/tests/preview2.html',
        //     data: { requireLogin: true }
        // })
    

        // .state('index', {
        //     url: '/',
        //     templateUrl: '/views/index.html',
        //     controller: 'IndexController',
        //     data: { 
        //         title: 'AvaTech',
        //         requireLogin: true 
        //     }
        // })
        .state('index', {
            url: '/',
            templateUrl: '/modules/map/map.html',
            data: { 
                title: 'AvaTech',
                requireLogin: true 
            }
        })
        .state('index.profile', {
            url: 'p/:profileId',
            templateUrl: '/modules/profiles/preview-side.html',
            // data: {
            //     title: 'AvaTech',
            //     requireLogin: true 
            // }
        })
        .state('index.test', {
            url: 't/:testId',
            templateUrl: '/modules/tests/preview-side.html',
            // data: {
            //     title: 'AvaTech',
            //     requireLogin: true 
            // }
        })
        .state('index.avalanche', {
            url: 'a/:observationId',
            templateUrl: '/modules/avalanches/preview-side.html',
            // data: {
            //     title: 'AvaTech',
            //     requireLogin: true 
            // }
        })
        .state('upload', {
            url: '/upload',
            templateUrl: '/views/upload.html',
            data: { 
                title: 'Upload / AvaTech',
                requireLogin: true 
            }
        })
        // .state('profile', {
        //     url: '/profiles/:profileId',
        //     templateUrl: '/views/snowpit.html',
        //     requireLogin: true,
        //     bodyCssClass: 'snowpit',
        //     title: 'New Snowpit / AvaTech'
        // })
        .state('profile', {
            abstract: true,
            //url: '/profiles/:profileId',
            templateUrl: '/modules/snowpit-editor/snowpit.html',
            data: { 
                title: 'Snowpit / AvaTech',
                requireLogin: true,
                bodyCssClass: 'snowpit'
            }
        })

        // manual profiles
        .state('profile.details', {
            url: '/profiles/:profileId'
        })

        // .state('profiles', {
        //     url: '/profiles',
        //     templateUrl: '/views/profiles/list.html',
        //     data: { 
        //         title: 'Profiles / AvaTech',
        //         requireLogin: true,
        //         bodyCssClass: 'profiles'
        //     }
        // })

        // device profiles
        .state('tests', {
            url: '/tests',
            templateUrl: '/modules/tests/list.html',
            data: { 
                title: 'Tests / AvaTech',
                requireLogin: true,
                bodyCssClass: 'profiles'
            }
        })
        .state('test', {
            url: '/tests/:testId',
            templateUrl: '/modules/tests/preview.html',
            data: { 
                title: 'Test Details / AvaTech',
                requireLogin: true,
                bodyCssClass: 'profiles'
            }
        })

        // field tests
        .state('fieldTests', {
            url: '/field-tests',
            templateUrl: '/modules/field-tests/list.html',
            data: { 
                title: 'Field Tests / AvaTech',
                requireLogin: true,
                bodyCssClass: 'profiles'
            }
        })
        .state('fieldTestNew', {
            url: '/field-tests/new',
            templateUrl: '/modules/field-tests/new.html',
            data: { 
                title: 'New Field Test / AvaTech',
                requireLogin: true,
                bodyCssClass: 'profiles'
            }
        })
        .state('fieldTest', {
            url: '/field-tests/:testId',
            templateUrl: '/modules/field-tests/view.html',
            data: { 
                title: 'Field Test Details / AvaTech',
                requireLogin: true,
                bodyCssClass: 'profiles'
            }
        })

        // organizations
        .state('orgNew', {
            url: '/orgs/new',
            templateUrl: '/modules/organizations/new.html',
            data: { 
                title: 'New Organization / AvaTech',
                requireLogin: true,
                //bodyCssClass: 'profiles'
            }
        })
        .state('org', {
            url: '/orgs/:orgId',
            templateUrl: '/modules/organizations/view.html',
            data: { 
                title: 'Organization / AvaTech',
                requireLogin: true,
                //bodyCssClass: 'profiles'
            }
        })

        // admin
        .state('admin', {
            url: '/admin',
            templateUrl: '/modules/admin/admin.html',
            data: { 
                title: 'Admin / AvaTech',
                requireLogin: true, 
                requireAdmin: true,
                bodyCssClass: 'admin'
            }
        })

        // user routes
        .state('login', {
            url: '/login',
            templateUrl: '/modules/user/login.html',
            data: { 
                title: 'Login / AvaTech',
                bodyCssClass: 'login'
            }
        })
        .state('forgotPassword', {
            url: '/forgot-password',
            templateUrl: '/modules/user/forgot-password.html',
            data: { 
                title: 'Password Reset / AvaTech',
                bodyCssClass: 'login'
            }
        })
        .state('forgotPasswordReset', {
            url: '/reset/:forgotPasswordToken',
            templateUrl: '/modules/user/reset-password.html',
            data: { 
                title: 'Password Reset / AvaTech',
                bodyCssClass: 'login'
            }
        })
        .state('register', {
            url: '/register',
            templateUrl: '/modules/user/register-new.html',
            data: { 
                title: 'Sign up / AvaTech',
                bodyCssClass: 'login'
            }
        })
        .state('signup', {
            url: '/signup',
            templateUrl: '/modules/user/register-new.html',
            data: { 
                title: 'Sign up / AvaTech',
                bodyCssClass: 'login'
            }
        })
        .state('registerPending', {
            url: '/register/:userHashId',
            templateUrl: '/modules/user/register-new.html',
            data: { 
                title: 'Register / AvaTech',
                bodyCssClass: 'login'
            }
        })
        .state('registerStudent', {
            url: '/join/:orgHashId',
            templateUrl: '/modules/user/register-new.html',
            data: { 
                title: 'Register / AvaTech',
                bodyCssClass: 'login'
            }
        })

        .state('settings', {
            url: '/settings',
            templateUrl: '/modules/user/settings.html',
            data: { 
                title: 'Settings / AvaTech',
                requireLogin: true,
                bodyCssClass: 'profiles'
            }
        })

        .state('obs', {
            url: '/avalanches/:observationId',
            templateUrl: '/modules/avalanches/new.html',
            data: { 
                title: 'Avalanche Observation / AvaTech',
                requireLogin: true,
                bodyCssClass: 'profiles'
            }
        })

        .state('SP1update2', {
            url: '/sp1update',
            templateUrl: '/modules/firmware-update/SP1update.html',
            data: { 
                title: 'SP1 Firmware Update / AvaTech',
                requireLogin: true,
            }
        }).state('SP1update', {
            url: '/SP1update',
            templateUrl: '/modules/firmware-update/SP1update.html',
            data: { 
                title: 'SP1 Firmware Update / AvaTech',
                requireLogin: true,
            }
        })

        .state('support', {
            url: '/support',
            templateUrl: '/modules/support/support.html',
            data: { 
                title: 'Support',
                requireLogin: true
            }
        })

        // logout
        .state('logout', {
            url: '/logout',
            controller: ['Global', function(Global) { Global.logout(); }]
        })
        // catchall 404 (instead of $urlRouterProvider.otherwise("/404"), which only supports url redirect)
        .state('404', {
            url: '/*path',
            templateUrl: '/views/404.html'
        })

    }
]);