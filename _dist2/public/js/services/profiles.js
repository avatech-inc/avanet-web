// REST endpoint
angular.module('avatech').factory("Profiles", ['$resource', function($resource) {
    return $resource('/v1/profiles/:profileId', {
        profileId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);