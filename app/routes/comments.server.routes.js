'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
    comments = require('../../app/controllers/comments');

module.exports = function(app) {
    // Comment Routes
    // app.route('/comments')
    app.route('/comments/:spotId')
        .get(comments.list);

    app.route('/comment/:spotId/id')
        .post(users.requiresLogin, comments.create);

    app.route('/comment/:spotId/id/:commentId')
        .get(comments.read)
        .put(users.requiresLogin, comments.hasAuthorization, comments.update)
        .delete(users.requiresLogin, comments.hasAuthorization, comments.delete);


    // Finish by binding the parameter comment middleware
    app.param('spotId', function(req, res, next, spotId) {
        req.spotId = spotId;
        next();
    });

    app.param('commentId', comments.commentByID);
};