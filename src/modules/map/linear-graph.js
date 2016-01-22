angular.module('avatech').directive('linearGraph', function($timeout, $q, $parse) {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {

        var labels;
        var colorMap;
        var labelValues;

        var a = $q.defer();
        var b = $q.defer();
        var c = $q.defer();

        attrs.$observe('legend', function(value) {
            a.resolve();
        });

        attrs.$observe('labelValues', function(value) {
            b.resolve();
        });

        attrs.$observe('labels', function(value) {
            c.resolve();
        });

        $q.all([a.promise,b.promise,c.promise]).then(function() {
            colorMap = getColorMap($parse(attrs.legend)(scope));
            labels = $parse(attrs.labels)(scope);
            labelValues = $parse(attrs.labelValues)(scope);

            render();
        })

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
            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // draw colors

            var min = attrs.min ? parseInt(attrs.min) : 0;
            var max = parseInt(attrs.max);
            var width = canvas.width;

            context.lineWidth = 1;

            for (var i = 0; i < width; i++) {
                var slope = (((i / width) * (max - min)) + min);
                var color = colorMap[parseInt(slope)]

                // blend between stops
                if (slope % 1 > 0) {
                    var previousColor = colorMap[parseInt(slope - 1)];
                    var percent = (slope - parseInt(slope)) * 100;
                    color = blendRGBColors(previousColor, color, percent);
                }

                // draw
                context.strokeStyle = "rgb(" + color.join() + ")";
                context.beginPath();
                context.moveTo(i, 0);
                context.lineTo(i, 28 * window.devicePixelRatio);
                context.stroke();
            }

            // draw labels

            context.fillStyle = 'black';
            context.font = (19 * window.devicePixelRatio) + 'px sans-serif';

            angular.forEach(labels, function(label, i) {
                var x = ((label - min) / (max - min)) * width;
                if (attrs.labelSuffix) label += attrs.labelSuffix;

                if (labelValues) label = labelValues[i];

                var measured = context.measureText(label);
                context.fillText(label, x - (measured.width / 2), 50 * window.devicePixelRatio);
            });
        }
    }
  };
});