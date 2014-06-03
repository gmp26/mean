'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
    function($resource) {
        return $resource('/mean/articles/:articleId', {
            articleId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);