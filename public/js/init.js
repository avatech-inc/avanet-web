window.apiBaseUrl = 'http://127.0.0.1:10010/v2/';

angular.element(document).ready(function() {
    // fix facebook bug with redirect
    if (window.location.hash == "#_=_") window.location.hash = "";

    // if user already exists
    var initInjector = angular.injector(["ng","LocalStorageModule"]);
    var localStorageService = initInjector.get("localStorageService");
    var $http = initInjector.get("$http");

    var auth = localStorageService.get('auth');
    if (auth) {
    	$http.defaults.headers.common['Auth-Token'] = auth.authToken;
    	$http.get(window.apiBaseUrl + 'users/' + auth.userId)
    	.then(function(response) {
    		window._user = response.data;
    	})
    	.finally(function() {
		    // init the app
		    angular.bootstrap(document, ['avatech']);
		})
    }
    else angular.bootstrap(document, ['avatech']);
});