// REST endpoint
angular.module('avatech').factory("Users", ['$resource', function($resource) {
    return $resource('/v1/users/:userId', {
        userId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);