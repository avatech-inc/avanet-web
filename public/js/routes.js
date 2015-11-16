angular.module('avatech').config(['$routeProvider','$stateProvider', '$urlRouterProvider', '$httpProvider',
    function($routeProvider,$stateProvider, $urlRouterProvider, $httpProvider) {

        //$httpProvider.interceptors.push('httpRequestInterceptor');

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
            //reload: true,
            //sticky: true,
            data: {
                //showPreviewPane: true
            }
            // data: {
            //     title: 'AvaTech',
            //     requireLogin: true 
            // }
        })

        // .state('index.newObservation', {
        //     url: 'observations/:obType/new',
        //     data: { modal: true },
        //     onEnter: ['$stateParams', '$state', '$modal', '$resource', function($stateParams, $state, $modal, $resource, $window) {
        //         $modal.open({
        //             templateUrl: "/modules/observations/new.html",
        //             controller: "NewObservationModalController",
        //             backdrop: 'static',
        //             windowClass: 'width-480',
        //             resolve: {
        //               initialLocation: function() { return {}; }
        //               //item: "hey!"
        //             },
        //             // controller: ['$scope', 'item', function($scope, item) {
        //             //   $scope.dismiss = function() {
        //             //     $scope.$dismiss();
        //             //   };

        //             //   $scope.save = function() {
        //             //     item.update().then(function() {
        //             //       $scope.$close(true);
        //             //     });
        //             //   };
        //             // }]
        //         }).result.finally(function() {
        //             //alert("!");
        //             $state.go('^');
        //             //$window.history.back();
        //         });
        //     }]
        // })

        // .state('index.profile', {
        //     url: 'obs/:profileId',
        //     views: { "right-pane": { templateUrl: '/modules/profiles/preview-side.html' } },
        //     //sticky: true,
        //     data: {
        //         showPreviewPane: true
        //     }
        //     // data: {
        //     //     title: 'AvaTech',
        //     //     requireLogin: true 
        //     // }
        // })

        // .state('index.obs', {
        //     url: 'avalanches/:observationId',
        //     views: { "content": { templateUrl: '/modules/avalanches/new.html' } },
        //     data: { 
        //         title: 'Avalanche Observation / Avanet',
        //         requireLogin: true,
        //         bodyCssClass: 'profiles',
        //         fullScreen: true
        //     }
        // })

        // // Snowpit Editor
        // .state('index.profileEditor', {
        //     abstract: true,
        //     //url: '/profiles/:profileId',
        //     views: { "content": { templateUrl: '/modules/snowpit-editor/snowpit.html' } },
        //     data: { 
        //         title: 'Snow Profile | Avanet',
        //         requireLogin: true,
        //         bodyCssClass: 'snowpit',
        //         fullScreen: true
        //     }
        // })
        // .state('index.profileEditor.details', {
        //     url: 'profiles/:profileId'
        // })

        // organizations
        .state('index.orgNew', {
            url: 'orgs/new',
            views: { "content": { templateUrl: '/modules/organizations/new.html' } },
            data: { 
                title: 'New Organization / Avanet',
                requireLogin: true,
                fullScreen: true
                //bodyCssClass: 'profiles'
            }
        })
        .state('index.org', {
            url: 'orgs/:orgId',
            views: { "content": { templateUrl: '/modules/organizations/view.html' } },
            data: { 
                title: 'Organization / Avanet',
                requireLogin: true,
                fullScreen: true
                //bodyCssClass: 'profiles'
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
            data: { 
                title: 'SP1 Firmware Update / Avanet',
                requireLogin: true,
                fullScreen: true
            }
        }).state('index.SP1update', {
            url: 'SP1update',
            views: { "content": { templateUrl: '/modules/firmware-update/SP1update.html' } },
            data: { 
                title: 'SP1 Firmware Update / Avanet',
                requireLogin: true,
                fullScreen: true
            }
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
                bodyCssClass: 'login'
            }
        })
        .state('signup', {
            url: '/signup',
            templateUrl: '/modules/user/register-new.html',
            data: { 
                title: 'Sign up / Avanet',
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
        .state('registerStudent', {
            url: '/join/:orgHashId',
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
            templateUrl: '/404/404.html'
        });
    }
]);