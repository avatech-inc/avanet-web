angular.module('avatech').directive('commentsNew', 
  ['$http', '$log', '$timeout', '$sce', 'Restangular',
  function($http, $log, $timeout, $sce, Restangular) {
  return {
    restrict: 'E',
    scope: { 
      ownerType: '=',
      ownerId: '='
    },
    templateUrl: '/modules/comments/comments-new.html',
    controller: ['$scope','Global', function($scope, Global) {

      $scope.global = Global;

        $('textarea.comment').mentionsInput({
          minChars: 100, // to disable, make 100 (otherwise, 2)
          onDataRequest:function (mode, query, callback) {

            Restangular.all("users").getList({ query: $scope.search.query }).then(function(response) {
              var results = [];
              for (var i = 0; i < response.length; i++) {
                $log.debug(result);
                var result = response[i];
                results.push({ id: result._id, name: result.fullName, avatar: '', type: 'user' });
              }
              callback.call(this, results);
            });
          }

        });

        // load comments 
        $scope.$watch('ownerId', function(){
          if (!$scope.ownerId) return;

          Restangular.all('comments').customGETLIST($scope.ownerType + "/" + $scope.ownerId)
          .then(function(comments) {
            $scope.comments = comments;
          },
          // error
          function() { 

          });

        });

      $scope.saveComment = function() {
          
          $('textarea.comment').mentionsInput('val', function(comment) {

          $log.debug(comment);

          if (comment == "" || comment == null) return;

            $scope.saving = true;

            // $http.post("/v1/comments/" + $scope.ownerType + "/" + $scope.ownerId, { content: comment })
            // .success(function(newComment){
            //   newComment.new = true;
            //   $scope.comments.unshift(newComment);
            //   $scope.newComment = "";
            //    $('textarea.comment').mentionsInput('reset');
            //   $scope.saving = false;
            // });


            Restangular.all('comments').customPOST({ content: comment },
              $scope.ownerType + "/" + $scope.ownerId)
            .then(function(newComment) {
              newComment.new = true;
              $scope.comments.unshift(newComment);
              $scope.newComment = "";
              $('textarea.comment').mentionsInput('reset');
              $scope.saving = false;
            },
            // error
            function() { 

            });
            // scroll to top (todo: not angular-y)
            //$(".modal-content .comments.list .nano").nanoScroller({ scroll: 'top' });
        });
      }

      $scope.deleteComment = function(commentId, index) {
        // remove from server
        Restangular.one("comments", commentId).remove();
        // remove from local collection
        $scope.comments.splice(index, 1);
      }

      // todo: (todo: not very angular-y)
      $scope.adjustHeight = function() {
        $timeout(function(){
          var _height = $(".modal-content .commentBox").outerHeight();
          $(".modal-content  ul.comments.list").css("top",_height);
          // reset nanoScroller
          $(".modal-content .comments.list .nano").nanoScroller();
        },80);
      }

      $scope.parseComment = function(comment) {
        // replace markup with user link
        var regex = /@\[([A-Za-z0-9 \-]+)\]\(user:([A-Za-z0-9\-]+)\)/igm;
        //var match = regex.exec(comment);

        var match;
        while ((match = regex.exec(comment)) !== null)
        {
          var name = match[1];
          var id = match[2];
          $log.debug(match[0]);
          comment = comment.replace(match[0],"<span style='border-bottom:1px solid #ccc;'>" + name + "</span>");
        }
        // if (match.length == 3) {

        //   var name = match[1];
        //   var id = match[2];

        //   console.log(match);

        //   comment = comment.replace(new RegExp(match[0], 'g'),"<span style='border-bottom:1px solid #ccc;'>" + name + "</span>");
        // }

        return $sce.trustAsHtml(comment);
      }

    }]
  }
}]);

// angular.module('avatech').directive('comments', function($http, $timeout) {
//   return {
//     restrict: 'E',
//     scope: { 
//       // onadd: '&',
//       // onload: '&',
//       // onprogress: '&',
//       // onupload: '&'
//       ownerType: '=',
//       ownerId: '='
//     },
//     templateUrl: '/modules/comments/comments.html',
//     controller: ['$scope','Global', function($scope, Global) {

//       $scope.global = Global;

//       // load comments 
//       $scope.$watch('ownerId', function(){
//         if (!$scope.ownerId) return;

//         $http.get("/v1/comments/" + $scope.ownerType + "/" + $scope.ownerId)
//         .success(function(comments){
//           $scope.comments = comments;
//         });

//         Restangular.all('comments').customGETLIST($scope.ownerType + "/" + $scope.ownerId)

//       });

//       $scope.saveComment = function() {
//         if ($scope.newComment == "" || $scope.newComment == null) return;

//         $scope.saving = true;
//         console.log("post:");
//         $http.post("/v1/comments/" + $scope.ownerType + "/" + $scope.ownerId, { content: $scope.newComment })
//         .success(function(newComment){
//           newComment.new = true;
//           $scope.comments.unshift(newComment);
//           $scope.newComment = "";
//           $scope.saving = false;
//         });

//         // scroll to top (todo: not angular-y)
//         $(".modal-content .comments.list .nano").nanoScroller({ scroll: 'top' });
//       }

//       $scope.deleteComment = function(commentId, index) {
//         // remove from server
//         $http.delete("/v1/comments/" + commentId);
//         // remove from local collection
//         $scope.comments.splice(index, 1);
//       }

//       // todo: (todo: not very angular-y)
//       $scope.adjustHeight = function() {
//         $timeout(function(){
//           var _height = $(".modal-content .commentBox").outerHeight();
//           $(".modal-content  ul.comments.list").css("top",_height);
//           // reset nanoScroller
//           $(".modal-content .comments.list .nano").nanoScroller();
//         },80);
//       }

//     }]
//   }
// });