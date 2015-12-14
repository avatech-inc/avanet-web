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