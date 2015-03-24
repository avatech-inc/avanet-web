angular.element(document).ready(function() {
    // fix facebook bug with redirect
    if (window.location.hash == "#_=_") window.location.hash = "";

    // init the app
    angular.bootstrap(document, ['avatech']);
});