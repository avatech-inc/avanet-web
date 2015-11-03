angular.module('avatech').directive('graphBig', function() {
  return {
    restrict: 'A',
    scope: { 
        rows: '=graphBig', 
        detail: '=' 
    },
    link: function(scope, element) {

        scope.$watch('rows', function() {
            render();
        });
        scope.$watch('detail', function() {
            render();
        });

        function findTotalOffset(obj) {
          var ol = ot = 0;
          if (obj.offsetParent) {
            do {
              ol += obj.offsetLeft;
              ot += obj.offsetTop;
            }while (obj = obj.offsetParent);
          }
          return {left : ol, top : ot};
        }
        function fixEvent(ev) {
            if(typeof ev.offsetX === "undefined" || typeof ev.offsetY === "undefined") {
                var targetOffset = findTotalOffset(ev.target);
                ev.offsetX = ev.pageX - targetOffset.left;
                ev.offsetY = ev.pageY - targetOffset.top;
              }    
              return ev;
        }
        function getRelativeCoords(event) {
            var _event = fixEvent(event);
            var pixelRatio = window.devicePixelRatio;
            if (event.offsetX !== undefined && event.offsetY !== undefined) { return [ event.offsetX * pixelRatio, event.offsetY  * pixelRatio]; }
            return [event.layerX * pixelRatio, event.layerY * pixelRatio];
        }


        var paddingTop = 30;
        var paddingLeft = 40;


        // // handle mouseouver for highlighting
        // var debounce;
        // element.bind('mousemove',function(event) {
        //     if (debounce) clearTimeout(debounce);
        //     debounce = setTimeout(function(){
        //         var point = getRelativeCoords(event);
        //         // if mouse is within graph, render graph width highlighted depth
        //         if (point[1] > paddingTop && point[0] > paddingLeft) {
        //             render(point[1]);
        //         }

        //     }, 10);
        // })
        // // redraw on mouseout to clear highlight
        // element.bind('mouseout',function(event) {
        //     render();
        // });


        // graphing formula (by sam with revisions by joe)

        var A_P4 = -194.1;
        var B_P4 = .1304;
        var C_P4 = -.0023124;
        var D_P4 = 197.7;

        var magic = 195.95340007275328;

        function graphLogFunction(pressure, width) {
          pressure = Math.pow(B_P4 , -C_P4 * pressure);
          pressure *= A_P4;
          pressure += D_P4;
          pressure *= (width/magic);
          return pressure;
        }
        function graphLogFunctionReverse(pixels, width) {
          pixels /= (width/magic);
          pixels -= D_P4;
          pixels /= A_P4;
          pixels = (Math.log(pixels) / Math.log(B_P4)) /  -C_P4;
          return pixels;
        }


        function render(highlightDepth) {

            if (scope.detail == null) scope.detail = 1;

            var canvas = element[0];
            var context = element[0].getContext('2d');

            var graphHeight = canvas.height - paddingTop;
            var graphWidth = canvas.width - paddingLeft;

            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // draw white background

            context.fillStyle = "#fff";
            context.fillRect(paddingLeft, paddingTop, canvas.width, canvas.height);

            // pixel value at zero
            var valueAtZero = Math.round(graphLogFunction(0, graphWidth));

            // graph tick lines

            // calculate tick mark locations
            var tickMarks = [];
            for (var i = 1; i <= 6; i++) {
                var tickPixels = parseInt((graphWidth / 6) * i);
                var tickPressure = Math.round(graphLogFunctionReverse(tickPixels + valueAtZero, graphWidth + valueAtZero));
                tickMarks.push(tickPressure)
            }

            // draw tick marks

            context.beginPath();

            for (var i = 0; i < tickMarks.length;i++) {
                var tickMark = tickMarks[i];
                var tickMarkPosition = paddingLeft + graphLogFunction(tickMark, graphWidth + valueAtZero) - valueAtZero + 1; // - 1;

                context.moveTo(tickMarkPosition, paddingTop); // change to 0?
                context.lineTo(tickMarkPosition, graphHeight + paddingTop);

                // draw tick labels
                context.fillStyle = "#444";
                context.font = "22.5px 'roboto condensed'";
                context.fillText(tickMark, tickMarkPosition - context.measureText(tickMark).width, 22);
            }

            context.lineWidth = 2;
            context.strokeStyle = 'rgba(10,10,10,.28)';
            context.stroke();
            context.closePath();

            // data
            var rows = scope.rows;
            
            // if no data, don't continue
            if (!rows) return;

            var threshold = 3;

            var canvas = element[0];
            var context = element[0].getContext('2d');
                
            // calculate
            var graphRows = [];
            for (var i = 0; i < rows.length; i++) {

                var pressure_expanded = (.00008 * Math.pow(rows[i],3));

                var pressure_graph = graphLogFunction(pressure_expanded, graphWidth + valueAtZero) - valueAtZero;

                graphRows.push(pressure_graph);
            }


            // graph

            // empty bottom depth area
            var emptyDepth = (rows.length) * (graphHeight / 1500);
            emptyDepth *= threshold;
            context.fillStyle = "#d0d0d0";
            context.beginPath();
            context.moveTo(paddingLeft,emptyDepth + paddingTop);
            context.lineTo(canvas.width,emptyDepth + paddingTop);
            context.lineTo(canvas.width,graphHeight + paddingTop); 
            context.lineTo(paddingLeft,graphHeight + paddingTop);
            context.closePath();
            context.fill();

            // the four levels of blockiness, from less blocky to most blocky
            var details = {
                level2: .16,
                level3: .32,
                level4: .52,
                level5: .65
            }

            // profile
            context.beginPath();
            context.fillStyle = 'rgba(50,50,50,.9)';
            context.moveTo(paddingLeft, paddingTop);
            var canvasDepth;
            for (var i = 0; i < graphRows.length; i++) {


                canvasDepth = (i+1) * (graphHeight / 1500);
                canvasDepth *= threshold;
                canvasDepth += paddingTop;

                var pressure_graph = graphRows[i];

                // detail levels / blocking
                if (scope.detail > 1 && scope.detail < 6 && i != graphRows.length - 1) {
                    var pressure_graph_next = graphRows[i + 1];

                    if (Math.abs(1-pressure_graph_next/pressure_graph) < details['level' + scope.detail]) {
                        graphRows[i + 1] = pressure_graph;
                    }
                }

                context.lineTo(pressure_graph + paddingLeft, canvasDepth);
            }

            // finish up graph

            if (canvasDepth != null) {
                context.lineTo(paddingLeft, canvasDepth);
                context.lineTo(paddingLeft,0);
                context.fill();
            }


            // depth tick marks

            context.beginPath();
            var depthTicks = [0,10,20,30,40,50,60,70,80,90,100,110,120,120,130,140,150];
            for (var i = 0; i < depthTicks.length; i++) {
                var canvasDepth;
                canvasDepth = (depthTicks[i] * 10) * (graphHeight / 1500);

                if (canvasDepth <= emptyDepth) {
                    // draw tick marks
                    if (i > 0) {
                        context.moveTo(paddingLeft, canvasDepth + paddingTop);
                        context.lineTo(canvas.width, canvasDepth + paddingTop);
                    }
                    
                    // draw labels
                    context.textAlign="right";
                    context.fillStyle = "#444";
                    context.font = "22.5px 'roboto condensed'";
                    context.fillText(depthTicks[i], 34, canvasDepth + paddingTop);
                    context.textAlign="left";
                }
            }

            context.lineWidth = 2;
            context.strokeStyle = 'rgba(180,180,180,.1)';
            context.stroke();
            context.closePath();

            // highlight depth
            if (highlightDepth && highlightDepth <= emptyDepth) {
                // get depth from pixels
                var depthPixels = highlightDepth - paddingTop;
                var _depth = Math.round(depthPixels / (graphHeight / 1500));
                // get pressure from depth
                // todo: first need to expand graphRows from 150 to 1500
                // var _pressure = Math.round(graphRows[_depth]);
                // console.log(_pressure);

                context.beginPath();
                context.moveTo(paddingLeft, highlightDepth);
                context.lineTo(canvas.width, highlightDepth);
                context.lineWidth = 2;
                context.strokeStyle = 'red';
                context.stroke();
                context.closePath();

                context.fillStyle = "red";
                context.font = "22.5px 'roboto condensed'";
                context.fillText(_depth + ", " + _pressure, 100, highlightDepth);

            }
        }
    }
  };
});


angular.module('avatech').directive('graph', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

        // expand compressed ascii string
        function expand(str) {
            var unsplitInt = function(_str) {
                if (_str.length != 2) return null; // 3
                return  (_str[0].charCodeAt(0) - 32) +
                        (_str[1].charCodeAt(0) - 32);
                        // + (str[2].charCodeAt(0) - 32);
            }
            // expand ascii string
            var expanded = "";
            for (var e = 0; e < str.length; e++) {
                var ch = str[e];
                if (ch != "\n") expanded += ch;
                else {
                    var streak = str.substr(e + 1, 2); //3
                    streak = unsplitInt(streak);
                    var _ch = str[e+3]; //4
                    for (var k = 0; k < streak; k++) expanded += _ch;
                    e += 3; //4
                }
            }
            // convert ascii string into array of numbers
            var _rows = [];
            for (var i = 0; i < expanded.length; i++) {
                // adjust for ascii offset and multiply by 4 (decompress)
                _rows.push((expanded[i].charCodeAt(0) - 32) * 3.9);
            }
            return _rows;
        }

        var rows = scope.$eval(attrs.graph);
        if (!rows) return;

        // expand if compressed ascii string
        if (typeof rows === 'string') {
            rows = expand(rows);
        }

        var threshold = 10;

        var canvas = element[0];
        var context = element[0].getContext('2d');

        // empty bottom depth area
        var emptyDepth = (rows.length) * (canvas.height / 1500);
        emptyDepth *= threshold;
        context.fillStyle = "#d0d0d0";
        context.beginPath();
        context.moveTo(0,emptyDepth);
        context.lineTo(canvas.width,emptyDepth);
        context.lineTo(canvas.width,canvas.height);
        context.lineTo(0,canvas.height);
        context.closePath();
        context.fill();
        
        // graph
        context.beginPath();
        context.fillStyle = 'rgba(50,50,50,.9)';
        context.moveTo(-1,0);
        var canvasDepth;
        for (var i = 0; i < rows.length; i++) {

            canvasDepth = (i+1) * (canvas.height / 1500);
            canvasDepth *= threshold;

            var pressure_expanded = (.00008 * Math.pow(rows[i],3));

            var A_P4 = -194.1;
            var B_P4 = .1304;
            var C_P4 = -.0023124;
            var D_P4 = 197.7;
            var pressure_graph = (A_P4 * (Math.pow(B_P4 , -C_P4 * pressure_expanded)) + D_P4) * (217/198);

            pressure_graph = pressure_graph * (canvas.width / 212);

            context.lineTo(pressure_graph, canvasDepth);
        }
        // finish up
        if (canvasDepth != null) {
            context.lineTo(-1, canvasDepth);
            context.lineTo(-1,0);
            context.fill();
        }
        context.closePath();
    }
  };
});