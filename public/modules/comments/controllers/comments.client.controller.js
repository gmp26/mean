'use strict';

angular.module('comments').controller('CommentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Comments',
    function($scope, $stateParams, $location, Authentication, Comments) {
        $scope.authentication = Authentication;

        $scope.create = function() {
            var comment = new Comments({
                title: this.title,
                content: this.content
            });
            comment.$save(function(response) {
                $location.path('comments/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            this.title = '';
            this.content = '';
        };

        $scope.remove = function(comment) {
            if (comment) {
                comment.$remove();

                for (var i in $scope.comments) {
                    if ($scope.comments[i] === comment) {
                        $scope.comments.splice(i, 1);
                    }
                }
            } else {
                $scope.comment.$remove(function() {
                    $location.path('comments');
                });
            }
        };

        $scope.update = function() {
            var comment = $scope.comment;

            comment.$update(function() {
                $location.path('comments/' + comment._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.comments = Comments.query();
        };

        $scope.findOne = function() {
            $scope.comment = Comments.get({
                commentId: $stateParams.commentId
            });
        };
    }
]);