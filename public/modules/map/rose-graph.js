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

        var canvas = element[0];
        var context = canvas.getContext('2d');

        // scale for retina
        if (window.devicePixelRatio > 1) {
            context.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.height *= window.devicePixelRatio;
            canvas.width *= window.devicePixelRatio;
        }

        var graphHeight = canvas.height;
        var graphWidth = canvas.width;

        function render() {
            // convert string to JSON
            var points = [];
            if (scope.points != "") points = JSON.parse(scope.points);

            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // stroke style
            context.lineWidth = 3;
            context.strokeStyle = "#000";

            // draw circle
            context.beginPath();
            context.arc(graphWidth / 2, graphWidth / 2, (graphWidth / 2) - 1, 0, 2 * Math.PI);
            context.stroke();
        }
    }
  };
});