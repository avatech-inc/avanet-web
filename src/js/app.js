
var DEPS = [
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
]

if (__DEV__) {
    window.apiBaseUrl = 'http://localhost:10010/v2/';
}

if (__STAGE__) {
    window.apiBaseUrl = 'https://avanet-api-dev.herokuapp.com/v2/';
}

if (__PROD__) {
    window._releaseVersion = '@@release';
    window.apiBaseUrl = 'https://api.avatech.com/v2/';

    DEPS.unshift('ngRaven')
}

// define app and dependencies
angular.module('avatech', DEPS);

// configure console debug
angular.module('avatech').config(['$logProvider', function($logProvider) {
    if (__PROD__) {
        $logProvider.debugEnabled(false);
    }
}]);

// configure lightbox
angular.module('avatech').config(['LightboxProvider', function (LightboxProvider) {
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
}]);

// configure angular schema forms
angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
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
}]);

// configure Restangular
angular.module('avatech').config(['RestangularProvider', function(RestangularProvider) {
    // set API base url
    RestangularProvider.setBaseUrl(window.apiBaseUrl);
    // support mongodb "_id" format
    RestangularProvider.setRestangularFields({ id: "_id" });
}]);

// enable html5 pushstate
angular.module('avatech').config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);

// define additional triggers on Tooltip and Popover 
// (show this be in this file? doesn't feel totally right to have it here)
angular.module('avatech').config(['$tooltipProvider', function($tooltipProvider){
    $tooltipProvider.setTriggers({
        mouseenter: 'mouseleave',
        click: 'click',
        focus: 'blur',
        never: 'mouseleave',
        show: 'hide',
    });
}]);

// configure translation
angular.module('avatech').config(['$translateProvider', '$translatePartialLoaderProvider',
    function($translateProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('test');
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '/translate/{lang}/{part}.json'
    });
    // set language
    $translateProvider.preferredLanguage('en');
    // enable proper escaping of translation content
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
}]);

// the first thing that gets run
angular.module('avatech').run(
 ['$rootScope', '$location', '$state', '$stateParams', '$log', '$document', '$http', '$uibModalStack', 'Observations', 'Routes', 'Global',
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

        if (__PROD__) {
            analytics.page()
        }

        // add class to body for page-specific styling
        // todo: there's gotta be a more angular-y way to do this
        //        ^^ in fact there is, <body class='{{ bodyCssClass }}' $rootScope.bodyCssClass
        $document[0].body.className = (toState.data && toState.data.bodyCssClass ? toState.data.bodyCssClass : "");
    });

}]);

// requestAnimationFrame
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
