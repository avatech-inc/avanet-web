angular.module('avatech').directive('stabilityTest', ['$http', 'Global', function ($http, Global) {
    return {
      restrict: 'A',
      templateUrl: '/modules/snowpit-editor/snowpit-stability.html',
      scope: { 
        test: '=',
        profile: '=prof',
        depthDescending: "=", 
        testType: "=",
        hideFormButton: "="
       },
      controller: ['$scope', function($scope) {

        $scope.global = Global;

        var newCommentDefault = { isNew: true, 
            type: $scope.testType, 
            ECT: { score: 'ECTPV' }, 
            CT: { score: 'CTV' }, 
            RB: { score: 'RB1' },
            SB: { score: 'SBV' },
            DT: { score: 'DTV' },
            ST: { score: 'STC' },
            PST: { score: 'End' }
        }; 

        $scope.newComment = angular.copy($scope.test);
        if ($scope.newComment == null) $scope.newComment = angular.copy(newCommentDefault);
        if ($scope.newComment.isNew == null) $scope.newComment.isNew = false;

        if (!$scope.newComment.isNew){
            if ($scope.newComment.depth == -1) $scope.newComment.depth = null;
            else {
                if ($scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.test.depth;
                else $scope.newComment.depth = $scope.test.depth;
            }
        }

        $scope.$watch("profile.depth",function(){
            if ($scope.depthDescending == null) return;
            if ($scope.newComment.isNew) return;
            if (!$scope.profile || !$scope.newComment || !$scope.test) return;
            
            if ($scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.test.depth;
            else $scope.newComment.depth = $scope.test.depth;
        });

        $scope.$watch("depthDescending",function(){
            if ($scope.depthDescending == null) return;
            if ($scope.newComment.isNew) return;
            if (!$scope.newComment.depth) return;

            if ($scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.test.depth;
            else $scope.newComment.depth = $scope.test.depth;
        });

        $scope.deleteComment = function() {
            var index = null;
            angular.forEach($scope.profile.notes, function(_comment, i) {
                if (_comment == $scope.test) index = i;
            });
            if (index == null) return;
            if (index == 0) $scope.profile.notes.shift();
            else $scope.profile.notes.splice(index, 1);
        };

        $scope.saveComment = function() {
            if ($scope.newComment.depth && $scope.newComment.depth > $scope.profile.depth) $scope.newComment.depth = $scope.profile.depth;
            else if ($scope.newComment.depth && $scope.newComment.depth < 0) $scope.newComment.depth = 0;

            var newComment = angular.copy($scope.newComment);
            if (isNaN(newComment.depth)) newComment.depth = null;
            if (newComment.depth != null && $scope.depthDescending) newComment.depth = $scope.profile.depth - newComment.depth;

            console.log(newComment);

            // save
            angular.copy(newComment, $scope.test);

        }
        
        $scope.addComment = function() {
            if ($scope.newComment.type == null) return;
            else if ($scope.newComment.depth && $scope.newComment.depth > $scope.profile.depth) $scope.newComment.depth = $scope.profile.depth;
            else if ($scope.newComment.depth && $scope.newComment.depth < 0) $scope.newComment.depth = 0;

            if (isNaN($scope.newComment.depth)) $scope.newComment.depth = null;
            if ($scope.newComment.depth != null && $scope.depthDescending) $scope.newComment.depth = $scope.profile.depth - $scope.newComment.depth;

            $scope.newComment.isNew = false;

            console.log($scope.newComment);

            if (!$scope.profile.notes) $scope.profile.notes = [];
            $scope.profile.notes.push($scope.newComment);
            $scope.newComment = angular.copy(newCommentDefault);
        }
      }],
      link: function(scope, elm, attrs) {

      }
    };
  }]);

