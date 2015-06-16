// define app
angular.module('avatech', ['ngResource', 'ngRoute', 'restangular', 'ui.bootstrap', 'ui.router', 'ui.route', 'uiSlider', 'ngQuickDate', 'LocalStorageModule', 'angularMoment', 'sun.scrollable', 'vr.directives.slider', 'FontLoader', 'checklist-model', 'mentio', 
    'pascalprecht.translate',
    'pasvaz.bindonce',
    'bootstrapLightbox',
    'angulartics', 'angulartics.mixpanel',
    'avatech.system',
    'avatech.profiles'
]);

angular.module('avatech.system', []);
angular.module('avatech.profiles', []);


angular.module('avatech').factory('httpRequestInterceptor', function ($q, $location) {
    return {
        'responseError': function(rejection) {
            // do something on error
            console.log("ERROR!");
            console.log(rejection);
            $q.reject(rejection);
            // if(rejection.status === 404){
            //     $location.path('/404/');
            //     return $q.reject(rejection);
            // }
         }
     };
});



// angular.module('avatech').factory('Lightbox', function() {    
//     return {
//         // restrict: 'A',
//         // link: function(scope, el, attrs) {    
//         //     // el.bind('click', function($event) {
//         //     //   var el = $($event.target).closest(".open");
//         //     //   if (el && el.data().$dropdownController) el.data().$dropdownController.toggle();
//         //     //   scope.$apply();
//         //     // });
//         // }
//     };        
// });

// configure Restangular
angular.module('avatech').config(function(RestangularProvider) {
    // api url prefix
    RestangularProvider.setBaseUrl('/v1/');
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
        'mouseenter': 'mouseleave',
        'click': 'click',
        'focus': 'blur',
        'never': 'mouseleave',
        'show': 'hide'
    });
});

// configure translation
angular.module('avatech').config(function($translateProvider, $translatePartialLoaderProvider) {

    $translatePartialLoaderProvider.addPart('test');
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '/translate/{lang}/{part}.json'
    });
    $translateProvider.preferredLanguage('en');
    //$translateProvider.preferredLanguage('en');

});

angular.module('avatech').config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
});

// catch angular errors
// angular.module('avatech').config(['$provide',
//     function($provide) {
//         $provide.decorator("$exceptionHandler", function($delegate) {
//             return function(exception, cause) {
//                 $delegate(exception, cause);
//                 Raven.captureException(exception);
//             };
//         });
//     }
// ]);

// angular.module('avatech').run(['$rootScope','$urlRouter', function($rootScope, $urlRouter) {
//     $rootScope.$on('$locationChangeSuccess', function(evt) {
//       // Halt state change from even starting
//       evt.preventDefault();
//       console.log("HALT!!!!");
//       // Perform custom logic
//       // var meetsRequirement = ...
//       // // Continue with the update and state transition if logic allows
//       // if (meetsRequirement) $urlRouter.sync();
//     });
// }]);

angular.module('avatech').run(
 function($rootScope, $route, $location, $state, $stateParams, $document, $http, pathRoute, $modalStack, Observations, Global) {
        
    // the first thing that gets run:
    // initialize global service
    $rootScope.initPromise = Global.init();
    if ($rootScope.initPromise) $rootScope.initPromise.then(function(orgs) {
        $rootScope.orgsLoaded = true;
    });

    // init
    Observations.init();

    // todo: this should throw a 404
    // since the app matches * and returns the angular page for everything, this will return 200
    //$http.get('/sfsdsfsdg');
    //$http.get('/test500');

    // 1. before route change

    // $rootScope.$on("$locationChangeStart", function(event, next, current) {


    //     // match the current path to the route 
    //     var currentRoute = pathRoute();
    //     // if path not found or serverRedirect option enabled, force full server refresh
    //     // of current route (will cause a 404 if route doesn't exist)
    //     //if (!currentRoute || $route.routes[currentRoute].serverRedirect) {
    //     // if (!currentRoute) {
    //     //     event.preventDefault();
    //     //     //window.location.href = $location.path(); 
    //     //     //$location.path()
    //     //     return;
    //     // }
    //     // // adminOnly?
    //     // if (currentRoute && $route.routes[currentRoute].requireAdmin && !Global.user.admin) {
    //     //     event.preventDefault();
    //     //     //window.location.href = $location.path();
    //     //     return;
    //     // }
    // });

    // 2. on route change
    //$rootScope.$on("$routeChangeStart", function(event, next, current) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {

        // close modals
        $modalStack.dismissAll();

        console.log("loading state:")
        if (!toState) return;
        if (toState.name == fromState.name) return;


        // todo: kludgy way to get rid of tooltips. not ideal, but only solution for now
        $(".tooltip").remove();

        // redirect from login page if already logged in
        if (toState.name == "login" && Global.user) {
            console.log("already logged in...")
            event.preventDefault();
            $state.transitionTo("index", null, {location:'replace'});
            return;
        }
        // access control
        if (toState.data && toState.data.requireLogin && !Global.user) {
            console.log("must be logged in");
            event.preventDefault();
            Global.redirectUrl = $location.url();
            $state.transitionTo("login", null, {location:'replace'});
            return;
        }
        if (toState.data && toState.data.requireAdmin && !Global.user.admin) {
            console.log("admin only");
            event.preventDefault();
            $state.transitionTo("index", null, {location:'replace'});
            return;
        }
        // set title
        // todo: there's gotta be a more angular-y way to do this
        $document.prop('title', (toState.data && toState.data.title ? toState.data.title : ""));
    });

    // 3. after route change
    //$rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        // add class to body for page-specific styling
        // todo: there's gotta be a more angular-y way to do this
        //        ^^ in fact there is, <body class='{{ bodyCssClass }}' $rootScope.bodyCssClass
        $document[0].body.className = (toState.data && toState.data.bodyCssClass ? toState.data.bodyCssClass : "");
    });

});


(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
