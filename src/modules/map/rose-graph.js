angular.module('avatech').directive('roseGraph', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
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
            var padding = 3 * window.devicePixelRatio;
            var length = radius - padding;

            // draw colors

            context.lineWidth = 3;

            for (var i = 0; i <= 360; i++) {
                context.strokeStyle = "rgb(" + scope.colorMap[i].join() + ")";

                var angle = (i - 90) * (Math.PI/180);
                context.beginPath();
                context.moveTo(radius, radius);
                context.lineTo(radius + length * Math.cos(angle), radius + length * Math.sin(angle));
                context.stroke();
            }

            // draw pie

            context.lineWidth = 2 * window.devicePixelRatio;
            context.strokeStyle = "#000";
            context.beginPath();
            context.arc(radius, radius, length, 0, 2 * Math.PI);
            context.stroke();

            // draw aspect direction lines

            for (var i = 1; i <= 8; i++) {
                var angle = (67.5 + (45 * i)) * (Math.PI/180);
                context.moveTo(radius, radius);
                context.lineTo(radius + length * Math.cos(angle), radius + length * Math.sin(angle));
            }
            context.stroke();

            // draw direction labels

            var labelLength = radius - (28 * window.devicePixelRatio);

            // context.shadowColor = "#fff";
            // context.shadowOffsetX = 0; 
            // context.shadowOffsetY = 0; 
            // context.shadowBlur = .1;
            context.fillStyle = "black";

            var fontSize = 16 * window.devicePixelRatio;
            context.font = fontSize + "px sans-serif";
            var angles = [ 'N', 'E', 'S', 'W']
            for (var i = 0; i < 4; i++) {
                var angle = ((90 * i) - 90) * (Math.PI/180);
                var label = angles[i];

                var x = radius + labelLength * Math.cos(angle);
                var y = radius + labelLength * Math.sin(angle);

                var measured = context.measureText(label);

                if (label == "N") {
                    x -= measured.width / 2;
                    y -= fontSize / 4;
                }
                else if (label == "S") {
                    x -= measured.width / 2;
                    y += fontSize;
                }
                else if (label == "W") {
                    x -= measured.width;
                    y += fontSize / 2.5;
                }
                else if (label == "E") {
                    x += measured.width / 6;
                    y += fontSize / 2.5;
                }
                context.fillText(label, x, y);
            }
        }
    }
  };
}]);
