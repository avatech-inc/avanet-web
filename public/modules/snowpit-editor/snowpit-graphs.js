
angular.module('avatech').directive('profile', ['$timeout','snowpitConstants', function($timeout, snowpitConstants) {
  return {
    restrict: 'A',
    //scope: { profile: '=profile' },
    link: function(scope, element, attrs) {

        //return;
        var profile = scope.$eval(attrs.profile);
        if (!profile) return;

        // using '$watch' allows the canvas to be redrawn
        //scope.$watch('profile', function(profile) {

            var canvas = element[0];
            var context = element[0].getContext('2d');

            // clear canvas
            //context.clearRect(0, 0, canvas.width, canvas.height);


            context.lineWidth = 1;
            context.strokeStyle = "#444";
            context.fillStyle = '#444';

            var hardness = snowpitConstants.hardness;

            var runningHeight = 0;

            if (profile.layers) {
                for (var i = 0; i < profile.layers.length; i++) {

                    var layer = profile.layers[i];

                    var _height = layer.height  * (canvas.height / profile.depth);
                    var _width = Math.round(hardness[layer.hardness].width * canvas.width);
                    var _width2 = _width;
                    if (layer.hardness2)
                        _width2 = Math.round(hardness[layer.hardness2].width * canvas.width);

                    context.beginPath();

                    context.moveTo(canvas.width,runningHeight);
                    context.lineTo(canvas.width - _width, runningHeight);
                    context.lineTo(canvas.width - _width2, runningHeight + _height);
                    context.lineTo(canvas.width, runningHeight + _height);

                    context.closePath();
                    context.fill();
                    context.stroke();

                    runningHeight += _height;
                }
            }
        //});
    }
  };
}]);

angular.module('avatech').directive('profileBig', ['$timeout', 'snowpitConstants', function($timeout, snowpitConstants) {
  return {
    restrict: 'A',
    scope: { profile: '=profileBig' },
    link: function(scope, element) {

        // using '$watch' allows the canvas to be redrawn
        scope.$watch('profile', function(profile) {

            var canvas = element[0];
            var context = element[0].getContext('2d');

            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // background 
            context.fillStyle = "#fff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fill();

            if (!profile) return;

            context.lineWidth = 1.2;
            context.strokeStyle = "#000";
            context.fillStyle = '#bbb';

            var hardness = snowpitConstants.hardness;

            var runningHeight = 0;

            for (var i = 0; i < scope.profile.layers.length; i++) {

                var layer = scope.profile.layers[i];

                var _height = layer.height  * (canvas.height / scope.profile.depth);
                var _width = Math.round(hardness[layer.hardness].width * canvas.width);
                var _width2 = _width;
                if (layer.hardness2)
                    _width2 = Math.round(hardness[layer.hardness2].width * canvas.width);

                context.beginPath();

                context.moveTo(canvas.width,runningHeight);
                context.lineTo(canvas.width - _width, runningHeight);
                context.lineTo(canvas.width - _width2, runningHeight + _height);
                context.lineTo(canvas.width, runningHeight + _height);

                context.closePath();
                context.fill();
                context.stroke();

                runningHeight += _height;
            }
            // plot temps

            // todo: sort temps by depth

            if (profile.temps.length > 0) {
                context.beginPath();
                for (var i = 0; i < profile.temps.length; i++){
                    var plotTemp = (60 - Math.abs(profile.temps[i].temp)) * (canvas.width / 60);
                    context.lineTo(
                        plotTemp, 
                        (profile.depth - profile.temps[i].depth) * (canvas.height / profile.depth)
                    );
                }

                context.lineWidth = 3;
                context.strokeStyle = 'red';
                context.stroke();
            }

            // canvas border

            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.beginPath();

            context.moveTo(0,0);
            context.lineTo(canvas.width, 0);
            context.lineTo(canvas.width, canvas.height);
            context.lineTo(0, canvas.height);
            context.closePath();
            context.stroke();
        });
    }
  };
}]);
