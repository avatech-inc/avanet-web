angular.module('avatech').directive('roseGraph', function($timeout) {
  return {
    restrict: 'A',
    // scope: { 
    //     //points: '@roseGraph' // must use @ instead of = because of angular filter
    //     legend: '@legend'
    // },
    link: function(scope, element, attrs) {
        // var timer;
        // scope.$watch('points', function() {
        //     if (timer) $timeout.cancel(timer);
        //     timer = $timeout(render, 300);
        // });

        attrs.$observe('legend', function(value) {
            scope.colorMap = getColorMap(JSON.parse(value));
            render();
        });

        function blendRGBColors(c0, c1, p) {
            return [Math.round(Math.round(c1[0] - c0[0]) * (p / 100)) + c0[0],
                    Math.round(Math.round(c1[1] - c0[1]) * (p / 100)) + c0[1],
                    Math.round(Math.round(c1[2] - c0[2]) * (p / 100)) + c0[2]
                ];
        }
        function blendHexColors(c0, c1, p) {
            c0 = hexToRGB(c0);
            c1 = hexToRGB(c1);
            return blendRGBColors(c0, c1, p);
        }
        function hexToRGB(hex) {
            return [
                parseInt(hex.substring(0,2),16),
                parseInt(hex.substring(2,4),16),
                parseInt(hex.substring(4,6),16)
            ];
        }

        function getPercent(min, max, val) {
            return Math.floor(((val - min) * 100) / (max - min));
        }

        function getColorMap(steps){
            var colorMap = [];
            //var maxValue = steps[steps-1].val;
            //var increment = parseInt(maxValue / steps.length);

            for (var s = 0; s < steps.length; s++) {
                if (s == steps.length - 1) break;
                var min = steps[s].val;
                var max = steps[s+1].val;

                var minColor = steps[s].color;
                var maxColor = steps[s+1].color;

                for (var i = min; i <= max; i++)
                    colorMap[i] = blendHexColors(minColor,maxColor, getPercent(min, max, i));
            }
            return colorMap;
        }



        var timer;
        scope.$watch('points', function() {
            if (timer) $timeout.cancel(timer);
            timer = $timeout(render, 100);
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
            // var points = [];
            // if (scope.points != "") points = JSON.parse(scope.points);

            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            var radius = graphWidth / 2;

            // draw colors

            context.lineWidth = 3;

            for (var i = 0; i <= 360; i++) {
                context.strokeStyle = "rgb(" + scope.colorMap[i].join() + ")";

                var angle = (i - 90) * (Math.PI/180);
                context.beginPath();
                context.moveTo(radius, radius);
                context.lineTo(radius + radius * Math.cos(angle), radius + radius * Math.sin(angle));
                context.stroke();
            }

            // draw pie

            context.lineWidth = 4;
            context.strokeStyle = "#000";
            context.beginPath();
            context.arc(graphWidth / 2, graphWidth / 2, (graphWidth / 2) - 1, 0, 2 * Math.PI);
            context.stroke();

            // draw aspect slices
            for (var i = 1; i <= 8; i++) {
                var angle = (67.5 + (45 * i)) * (Math.PI/180);
                context.moveTo(radius, radius);
                context.lineTo(radius + radius * Math.cos(angle), radius + radius * Math.sin(angle));
            }
            context.stroke();

            // if no points, return
            //if (points.length == 0) return

            // otherwise, continue...

            // todo: calculate

            // todo: draw points
            
        }
    }
  };
});