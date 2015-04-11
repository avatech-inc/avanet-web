// REST endpoint
angular.module('avatech').factory("FieldTests", ['$resource', function($resource) {
    return $resource('/v1/field-tests/:fieldTestId', {
        fieldTestId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);