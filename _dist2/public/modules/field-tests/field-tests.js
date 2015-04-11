angular.module('avatech').controller('FieldTestsController', ['$scope', '$stateParams', '$route', '$location', '$modal', '$http', '$sce','Global', 'FieldTests', 
function ($scope, $stateParams, $route, $location, $modal, $http, $sce, Global, FieldTests) {
    $scope.global = Global;

    $scope.resource = 'field-tests';

    $scope.currentTest = {};
    $scope.error = {};

    $scope.submit = function() {
        $scope.error = {};

        if (!$scope.currentTest.profile) {
            $scope.error.selectManualProfile = true;
            $('#manualProfile')[0].scrollIntoView( true );
            return;
            // select profile
        }
        if (!$scope.reviewed) {
            $scope.error.review = true;
            return;
            // check review box
        }

        console.log($scope.currentTest);

        var fieldTest = new FieldTests({
            profile: $scope.currentTest.profile._id,
            feedback1: $scope.currentTest.feedback1,
            feedback2: $scope.currentTest.feedback2,
            feedback3: $scope.currentTest.feedback3
        });

        for (var i = 0; i < 18; i++) {
            var test = $scope.currentTest["test" + (i + 1)];
            if (test) fieldTest["test" + (i + 1)] = test._id;
        }

        $scope.submitted = true;

        fieldTest.$save(function(new_fieldTest) {
            console.log(new_fieldTest);
        });

    };

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

    $scope.selectDeviceTest = function(testNum) {

        var modalInstance = $modal.open({
            templateUrl: '/views/tests/list-select-modal.html',
            controller: 'TestsModalController'
        });

        modalInstance.result.then(function (test) {
            if (test) {
                console.log(test);
                $scope.currentTest['test' + testNum] = test;
            }
        }, function () {
            // on dismiss
        });
    }

    
    $scope.selectManualProfile = function() {
        $scope.error = {};

        var modalInstance = $modal.open({
            templateUrl: '/views/profiles/list-select-modal.html',
            controller: 'ProfilesModalController'
        });

        modalInstance.result.then(function (profile) {
            console.log(profile);
            if (profile) {
                $scope.currentTest.profile = profile;
            }
        }, function () {
            // on dismiss
        });
    }

    $scope.find = function(query) {
        FieldTests.query(query, function(fieldTests) {
            $scope.fieldTests = fieldTests;
        });
    };


    $scope.findOne = function() {
        FieldTests.get({
            fieldTestId: $stateParams.testId
        }, function(test) {
            $scope.currentTest = test;
        });
    };

    $scope.reload = function() {
        $route.reload();
    }

    $scope.lineBreaks = function(str) {
        if (str) str = str.replace(/\n/g, '<br /><br />')
        else str = "N/A";
        return $sce.trustAsHtml(str);
    }

    $scope.download = function() {
        console.log($scope.currentTest.profile);

        $scope.downloading = true;

        var hashes = [];
        for (var i = 1; i <= 18; i++) {
            var test = $scope.currentTest['test' + i];
            if (test) hashes.push({ hash: test.hash, fileName: test.title });
        }

        var zipFileName = $scope.currentTest._id;
        if ($scope.currentTest.profile.metaData.location && $scope.currentTest.profile.metaData.location != "")
            zipFileName += "_" + $scope.currentTest.profile.metaData.location.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        var metaData = "";
        metaData += "ID: " + $scope.currentTest._id + "\n";
        metaData += "URL: http://beta.avatechsafety.com/field-tests/" + $scope.currentTest._id + "\n";
        metaData += "USER: " + $scope.currentTest.user.fullName + "\n";
        metaData += "LOCATION: " + $scope.currentTest.profile.metaData.location + "\n";
        metaData += "CREATED: " + $scope.currentTest.profile.created + "\n";
        metaData += "TESTS: \n";
        for (var i = 1; i <= 18; i++) {
            var test = $scope.currentTest['test' + i];
            metaData += i + ",";
            if (test) metaData += test.title;
            metaData += "\n";
        }

        $http.post("/v1/downloadRawData", { 
            hashes: hashes,
            metaData: metaData,
            zipFileName: zipFileName
        })
        .success(function (data) { 
            // var zipFileName = $scope.currentTest.profile.metaData.location;
            // zipFileName += "_" + $scope.currentTest.profile.
            // download in browser
            // var dataUrl = data.buffer;
            console.log(data);
            var link = document.createElement('a');
            angular.element(link).attr('href', data.url);//.attr('download', zipFileName + ".zip")
            link.click();
            $scope.downloading = false;
        })
        .error(function(){
            $scope.downloading = false;
        });
    }
}]);

