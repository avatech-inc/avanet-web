
import './snowpit-stability.html'

const SnowpitStability = [
    '$http',
    'Global',

    ($http, Global) => ({
        restrict: 'A',
        templateUrl: '/modules/snowpit-editor/snowpit-stability.html',
        scope: {
            test: '=',
            profile: '=prof',
            depthDescending: '=',
            testType: '=',
            hideFormButton: '=',
            largeInputs: '=',
            hideComment: '=',
            longLabels: '='
        },
        controller: ['$scope', $scope => {
            $scope.global = Global

            let newCommentDefault = {
                isNew: true,
                type: $scope.testType,
                ECT: { score: 'ECTPV' },
                CT: { score: 'CTV' },
                RB: { score: 'RB1' },
                SB: { score: 'SBV' },
                DT: { score: 'DTV' },
                ST: { score: 'STC' },
                PST: { score: 'End' }
            }

            $scope.newComment = angular.copy($scope.test)

            if ($scope.newComment === undefined) $scope.newComment = angular.copy(newCommentDefault)
            if ($scope.newComment.isNew === undefined) $scope.newComment.isNew = false

            if (!$scope.newComment.isNew) {
                if ($scope.newComment.depth === -1) {
                    $scope.newComment.depth = null
                } else {
                    if ($scope.depthDescending) {
                        $scope.newComment.depth = $scope.profile.depth - $scope.test.depth
                    } else {
                        $scope.newComment.depth = $scope.test.depth
                    }
                }
            }

            $scope.$watch('profile.depth', () => {
                if ($scope.depthDescending === null) return
                if ($scope.newComment.isNew) return
                if (!$scope.profile || !$scope.newComment || !$scope.test) return

                if ($scope.depthDescending) {
                    $scope.newComment.depth = $scope.profile.depth - $scope.test.depth
                } else {
                    $scope.newComment.depth = $scope.test.depth
                }
            })

            $scope.$watch('depthDescending', () => {
                if ($scope.depthDescending === null) return
                if ($scope.newComment.isNew) return
                if (!$scope.newComment.depth) return

                if ($scope.depthDescending) {
                    $scope.newComment.depth = $scope.profile.depth - $scope.test.depth
                } else {
                    $scope.newComment.depth = $scope.test.depth
                }
            })

            $scope.deleteComment = () => {
                let index = null

                angular.forEach($scope.profile.tests, (_comment, i) => {
                    if (_comment === $scope.test) index = i
                })

                if (index === null) return
                if (index === 0) {
                    $scope.profile.tests.shift()
                } else {
                    $scope.profile.tests.splice(index, 1)
                }
            }

            $scope.saveComment = () => {
                if (
                    $scope.newComment.depth &&
                    $scope.newComment.depth > $scope.profile.depth
                ) {
                    $scope.newComment.depth = $scope.profile.depth
                } else if (
                    $scope.newComment.depth &&
                    $scope.newComment.depth < 0
                ) {
                    $scope.newComment.depth = 0
                }

                let newComment = angular.copy($scope.newComment)

                if (isNaN(newComment.depth)) {
                    newComment.depth = null
                }

                if (newComment.depth !== null && $scope.depthDescending) {
                    newComment.depth = $scope.profile.depth - newComment.depth
                }

                // save
                angular.copy(newComment, $scope.test)
            }

            $scope.addComment = () => {
                if ($scope.newComment.type === null) {
                    return
                } else if (
                    $scope.newComment.depth &&
                    $scope.newComment.depth > $scope.profile.dept
                ) {
                    $scope.newComment.depth = $scope.profile.depth
                } else if (
                    $scope.newComment.depth &&
                    $scope.newComment.depth < 0
                ) {
                    $scope.newComment.depth = 0
                }

                if (isNaN($scope.newComment.depth)) {
                    $scope.newComment.depth = null
                }

                if ($scope.newComment.depth !== null && $scope.depthDescending) {
                    $scope.newComment.depth = $scope.profile.depth - $scope.newComment.depth
                }

                $scope.newComment.isNew = false

                if (!$scope.profile.tests) {
                    $scope.profile.tests = []
                }

                $scope.profile.tests.push($scope.newComment)
                $scope.newComment = angular.copy(newCommentDefault)
            }
        }],
        link: (scope, elm, attrs) => {

        }
    })
]

export default SnowpitStability
