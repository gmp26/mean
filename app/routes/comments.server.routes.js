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

    app.route('/comment/id/:commentId')
        .post(users.requiresLogin, comments.appendReply)
        .put(users.requiresLogin, comments.hasAuthorization, comments.update)
        .get(comments.read)
        .delete(users.requiresLogin, comments.hasAuthorization, comments.delete);

    app.route('/comment/reply/:replyId')
        // .put(users.requiresLogin, comments.hasAuthorization, comments.updateReply)
        .delete(users.requiresLogin, comments.hasAuthorization, comments.deleteReply);

    app.route('/comment/id')
        .post(users.requiresLogin, comments.create);

    app.route('/comment/vote/id')
        .post(users.requiresLogin, comments.upvote);


    // Finish by binding the parameter comment middleware
    app.param('spotId', function(req, res, next, spotId) {
        req.spotId = spotId;
        next();
    });

    app.param('commentId', comments.commentByID);
    app.param('replyId', comments.replyId);
};