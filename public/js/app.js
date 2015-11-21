// define app
angular.module('avatech', ['ngResource', 'ngRoute', 'restangular', 'ui.bootstrap', 'ui.router', 'ui.route', 'uiSlider', 'LocalStorageModule', 'angularMoment', 'sun.scrollable', 'vr.directives.slider', 'FontLoader', 'checklist-model', 'mentio',
    'pascalprecht.translate',
    'schemaForm',
    'pasvaz.bindonce',
    'ct.ui.router.extras',
    'bootstrapLightbox',
    'angulartics', 'angulartics.mixpanel',
    'avatech.system',
    'avatech.profiles',
    'colorpicker.module',
    'credit-cards',
    'angular-country-picker',
    'pikaday',
    'ngjsColorPicker',
    'ngAudio'
]);

angular.module('avatech.system', []);

angular.module('avatech.profiles', []);

angular.module('avatech').config(function (LightboxProvider) {
  LightboxProvider.getImageUrl = function (image) {
    return image.URL;
  };
});

// configure angular schema forms
angular.module('schemaForm').config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
  function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
      'direction-select',
      '/js/forms/direction-select.html'
    );

    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
      'radiobuttons-nullable',
      '/js/forms/radiobuttons-nullable.html'
    );

    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
      'datepicker',
      '/js/forms/datepicker.html'
    );

    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
      'grainTypeSelect',
      '/js/forms/grain-type-select.html'
    );

    schemaFormDecoratorsProvider.addMapping('bootstrapDecorator',
      'trend-select',
      '/js/forms/trend-select.html'
    );

  }
]);

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

    // enable proper escaping of HTML
    //$translateProvider.useSanitizeValueStrategy('escape');
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

// the first thing that gets run
angular.module('avatech').run(
 function($rootScope, $route, $location, $state, $stateParams, $document, $http, $modalStack, Observations, Routes, Global) {

    // init global service
    Global.init();

    // init observations service
    Observations.init();
    // init routes service
    Routes.init();

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        // close all modals (todo: what is this from?)
        $modalStack.dismissAll();

        if (!toState) return;
        if (toState.name == fromState.name) return;

        // todo: kludgy non-angular way to clear tooltips on state change. 
        // not ideal, but best solution for now
        $(".tooltip").remove();

        // redirect from login page if already logged in
        if (toState.name == "login" && Global.user) {
            console.log("already logged in...");
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
        // resize map based on new layout
        $rootScope.$broadcast('resizeMap');

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
