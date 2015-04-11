// REST endpoint
angular.module('avatech').factory("Tests", ['$resource', function($resource) {
    return $resource('/v1/tests/:testId', {
        testId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);