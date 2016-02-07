
import './comments-new.html'

const CommentsNew = [
    '$log',
    '$timeout',
    '$sce',
    'Restangular',

    (
        $log,
        $timeout,
        $sce,
        Restangular
    ) => ({
        restrict: 'E',
        scope: {
            ownerType: '=',
            ownerId: '='
        },
        templateUrl: '/modules/comments/comments-new.html',
        controller: [
            '$scope',
            'Global',

            ($scope,
             Global) => {
                $scope.global = Global

                $('textarea.comment').mentionsInput({
                    minChars: 100, // to disable, make 100 (otherwise, 2)
                    onDataRequest: (mode, query, callback) => {
                        Restangular
                            .all('users')
                            .getList({ query: $scope.search.query })
                            .then(response => {
                                let results = response.map(result => ({
                                    id: result._id,
                                    name: result.fullName,
                                    avatar: '',
                                    type: 'user'
                                }))

                                callback.call(this, results);
                            })
                    }
                })

                // load comments
                $scope.$watch('ownerId', () => {
                    if (!$scope.ownerId) return

                    Restangular
                        .all('comments')
                        .customGETLIST($scope.ownerType + '/' + $scope.ownerId)
                        .then(
                            comments => $scope.comments = comments,
                            // error
                            () => {}
                        )
                })

                $scope.saveComment = () => {
                    $('textarea.comment').mentionsInput('val', comment => {
                        $log.debug(comment)

                        if (comment === '' || comment === null) return

                        $scope.saving = true

                        Restangular
                            .all('comments')
                            .customPOST(
                                { content: comment },
                                $scope.ownerType + '/' + $scope.ownerId
                            )
                            .then(
                                newComment => {
                                    newComment.new = true
                                    $scope.comments.unshift(newComment)
                                    $scope.newComment = ''
                                    $('textarea.comment').mentionsInput('reset')
                                    $scope.saving = false
                                },
                                // error
                                () => {}
                            )
                    })
                }

                $scope.deleteComment = (commentId, index) => {
                    // remove from server
                    Restangular.one('comments', commentId).remove()

                    // remove from local collection
                    $scope.comments.splice(index, 1)
                }

                // todo: (todo: not very angular-y)
                $scope.adjustHeight = () => $timeout(() => {
                    let _height = $('.modal-content .commentBox').outerHeight()
                    $('.modal-content  ul.comments.list').css('top', _height)

                    // reset nanoScroller
                    $('.modal-content .comments.list .nano').nanoScroller()
                }, 80)

                $scope.parseComment = comment => {
                    // replace markup with user link
                    let regex = /@\[([A-Za-z0-9 \-]+)\]\(user:([A-Za-z0-9\-]+)\)/igm
                    let match = regex.exec(comment)
                    let c = comment

                    if (match !== null) {
                        let name = match[1]
                        let id = match[2]
                        let spanS = '<span style="border-bottom:1px solid #ccc;">'
                        let spanE = '</span>'

                        $log.debug(match[0])

                        c = comment.replace(match[0], spanS + name + spanE)
                    }

                    return $sce.trustAsHtml(c);
                }
            }
        ]
    })
]

export default CommentsNew
