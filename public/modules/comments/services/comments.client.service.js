'use strict';

//Comments service used for communicating with the comments REST endpoints
angular.module('comments').factory('Comments', ['$resource',
    function($resource) {
        return $resource('/mean/comments/:commentId', {
            commentId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);