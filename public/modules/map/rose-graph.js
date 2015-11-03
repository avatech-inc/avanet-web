angular.module('avatech').directive('roseGraph', function($timeout) {
  
  return {
    restrict: 'A',
    scope: { 
        points: '@roseGraph' // must use @ instead of = because of angular filter
    },
    link: function(scope, element) {
        var timer;
        scope.$watch('points', function() {
            if (timer) $timeout.cancel(timer);
            timer = $timeout(render, 300);
        });
    }
  };
});