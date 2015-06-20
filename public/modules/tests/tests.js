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
