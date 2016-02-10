
angular.element(document).ready(() => {
    // fix facebook bug with redirect
    // (not using fb login at the moment, but still should keep this for reference)
    if (window.location.hash === '#_=_') window.location.hash = ''

    // if user already exists
    let injector = angular.injector(['ng', 'LocalStorageModule'])
    let localStorageService = injector.get('localStorageService')
    let $http = injector.get('$http')
    let auth = localStorageService.get('auth')

    Stripe.setPublishableKey('pk_test_4aIRSupmfOGOAWL0wsM4NYZA')

    if (auth) {
        $http.defaults.headers.common['Auth-Token'] = auth.authToken
        $http
            .get(window.apiBaseUrl + 'users/' + auth.userId)
            .then(
                // user found
                response => {
                    window._user = response.data
                    angular.bootstrap(document, ['avatech'])
                },
                // error
                response => {
                    // if API is not found, show API error
                    // why don't we do this through Angular?
                    // 1) it would be a sizeable amount of hacky code just
                    // for this (as opposed to one line here)
                    // 2) it would require the entire app to be
                    // boostrapped just to show an error (slow)
                    // 3) there's nothing interactive that needs to
                    // happen on the error page - purely static
                    // todo: well worth revisiting in the future...

                    if (response.status === 0 || response.status === 500) {
                        document.body.className += ' api-error'
                    } else {
                        // if 40X, start the app regularly (goes to login page)
                        angular.bootstrap(document, ['avatech'])
                    }
                })

    // if no auth token is found, start the app (go to login page)
    } else {
        angular.bootstrap(document, ['avatech'])
    }
})
