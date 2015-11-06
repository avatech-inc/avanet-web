window.apiBaseUrl = 'http://127.0.0.1:10010/v2/';
//window.apiBaseUrl = 'https://avanet-api.herokuapp.com/v2/';

angular.element(document).ready(function() {
    // fix facebook bug with redirect
    // (not using fb login at the moment, but still should keep this for reference)
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
            angular.bootstrap(document, ['avatech']);
    	},
        function(response) {
            // if API is not found, show API error
            if (response.status == 0 || response.status == 500) {
                document.body.style = 'display: block !important';
                document.getElementById("api-error").style.display = '';
            }
        })
    }
    // if no auth token is found, start the app (go to login page)
    else angular.bootstrap(document, ['avatech']);
});