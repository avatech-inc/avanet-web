angular.module('avatech').controller('TestsModalController', [ '$scope','$modalInstance',
    function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss();
        };
        $scope.select = function (test) {
            $modalInstance.close(test);
        };
    }
]);

angular.module('avatech').controller('TestsController', ['$scope', '$stateParams', '$location', '$modal', 'Global', 'Tests', 
function ($scope, $stateParams, $location, $modal, Global, Tests) {
    $scope.global = Global;

    $scope.resource = 'tests';

    // $scope.open = function () {

    //     var modalInstance = $modal.open({
    //         templateUrl: '/views/upload.html',
    //         controller: 'UploadModalController',
    //         // resolve: {
    //         //     items: function () {
    //         //       return $scope.items;
    //         //     }
    //         // }
    //     });

    //     modalInstance.result.then(function (selectedItem) {
    //         //$scope.selected = selectedItem;
    //         }, function () {
    //             $scope.find();
    //             //console.log('Modal dismissed at: ' + new Date());
    //     });
    // };

    // $scope.create = function() {
    //     var article = new Profiles({
    //         title: this.title,
    //         content: this.content
    //     });
    //     article.$save(function(new_article) {
    //         // go to details page
    //         $location.path($scope.resource + '/' + new_article._id);
    //     });

    //     this.title = "";
    //     this.content = "";
    // };

    // $scope.remove = function(article) {
    //     article.$remove();

    //     for (var i in $scope.articles) {
    //         if ($scope.articles[i] == article) {
    //             $scope.articles.splice(i, 1);
    //         }
    //     }
    // };

    // $scope.update = function() {
    //     var article = $scope.article;
    //     if (!article.updated) {
    //         article.updated = [];
    //     }
    //     article.updated.push(new Date().getTime());

    //     article.$update(function() {
    //         $location.path($scope.resource + '/' + article._id);
    //     });
    // };

    $scope.loadPreview = function(testId) {
        console.log(testId);
        //$scope.$broadcast("loadTest",testId);
    };
    $scope.$on("loadTest", function(event, testId){
        console.log(testId);
        $scope.article = null;
        $scope.loadTest(testId);
    });


    $scope.find = function(query) {
        Tests.query(query, function(articles) {
            $scope.articles = articles;
        });
    };

    $scope.findOne = function() {
        if ($stateParams.testId) $scope.loadTest($stateParams.testId);
    };

    $scope.firstLoad = true;
    $scope.loadTest = function(testId) {
        $scope.firstLoad = false;
        Tests.get({
            testId: testId
        }, function(test) {
            $scope.article = test;
            //console.log(test.rows_small);
            //
            var vals = [];
            var lastDepth = 0;
            console.log(test);

            var count = 0;

            var avg = 0;

            // csv output

            // var _Test = "";
            // for (var i = 0; i < test.rows_compressed.length; i++) {
            //     _Test += test.rows_compressed[i][1] + "," + test.rows_compressed[i][0].toFixed(0) + "\n";
            // }
            // console.log(_Test);


            // arduino output

            for (var i = 0; i < test.rows_compressed.length; i++) {
                var currentDepth = Math.abs(test.rows_compressed[i][1])
                if (i == 0) vals.push(currentDepth);
                // if (count == 2)
                // {
                //     avg += (currentDepth - lastDepth);
                //     vals.push(test.rows_compressed[i][0].toFixed(0));
                //     count = 0;
                //     lastDepth = currentDepth;
                // }
                // count++;
                vals.push((test.rows_compressed[i][0] / 4).toFixed(0));
                //console.log(test.rows_compressed[i][0].toFixed(0) + "," + (currentDepth - lastDepth));
                //lastDepth = currentDepth;
            }
            console.log("AVG:");
            console.log(avg / vals.length);
            console.log(vals.length);
            console.log("static uint8_t profileData[" + vals.length + "] = {" + vals.toString() + "};");
        });
    };

}]);


angular.module('avatech').directive('graphBig', function() {
  return {
    restrict: 'A',
    scope: { rows: '=graphBig', detail: '=' },
    link: function(scope, element) {

        scope.$watch('rows', function() {
            render();
        });
        scope.$watch('detail', function() {
            render();
        });

        function render() {

            if (scope.detail == null) scope.detail = 1;

            var canvas = element[0];
            var context = element[0].getContext('2d');

            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // graph lines

            context.beginPath();
            context.moveTo(canvas.width / 3, 0);
            context.lineTo(canvas.width / 3, canvas.height);
            context.moveTo((canvas.width / 3) * 2, 0);
            context.lineTo((canvas.width / 3) * 2, canvas.height);
            context.lineWidth = 2;
            context.strokeStyle = '#ccc';
            context.stroke();

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

                var A_P4 = -194.1;
                var B_P4 = .1304;
                var C_P4 = -.0023124;
                var D_P4 = 197.7;
                var pressure_graph = (A_P4 * (Math.pow(B_P4 , -C_P4 * pressure_expanded)) + D_P4) * (canvas.width/198);

                //pressure_graph = pressure_graph * (canvas.width / 215);

                graphRows.push(pressure_graph);
            }


            // graph

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
            context.moveTo(-1,0);
            var canvasDepth;
            for (var i = 0; i < graphRows.length; i++) {


                canvasDepth = (i+1) * (canvas.height / 1500);
                canvasDepth *= threshold;

                var pressure_graph = graphRows[i];

                // detail levels / blocking
                if (scope.detail > 1 && scope.detail < 6 && i != graphRows.length - 1) {
                    var pressure_graph_next = graphRows[i + 1];

                    if (Math.abs(1-pressure_graph_next/pressure_graph) < details['level' + scope.detail]) {
                        graphRows[i + 1] = pressure_graph;
                    }
                }

                context.lineTo(pressure_graph, canvasDepth);
            }

            // finish up
            if (canvasDepth != null) {
                context.lineTo(-1, canvasDepth);
                context.lineTo(-1,0);
                context.fill();
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
    }
  };
});

