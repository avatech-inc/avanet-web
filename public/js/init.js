window.apiBaseUrl = 'http://127.0.0.1:10010/v2/';
//window.apiBaseUrl = 'https://avanet-api.herokuapp.com/v2/';

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
    	.then(function(response) {
    		window._user = response.data;
            angular.bootstrap(document, ['avatech']);
    	},
        function(response) {
            // if API is not found, show API error
            if (response.status == 0 || response.status == 500) 
                document.body.className += ' api-error';
            
            // if 404, start the app (go to login page)
            else angular.bootstrap(document, ['avatech']);
        });
    }
    // if no auth token is found, start the app (go to login page)
    else angular.bootstrap(document, ['avatech']);
});