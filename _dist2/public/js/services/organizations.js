// REST endpoint
angular.module('avatech').factory("Organizations", ['$resource', function($resource) {
    return $resource('/v1/orgs/:orgId', {
        orgId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);