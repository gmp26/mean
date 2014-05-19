'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
    // User Routes
    var users = require('../../app/controllers/users');
    app.route('/mean/users/me').get(users.me);
    app.route('/mean/users').put(users.update);
    app.route('/mean/users/password').post(users.changePassword);
    app.route('/mean/users/accounts').delete(users.removeOAuthProvider);

    // Setting up the users api
    app.route('/mean/auth/signup').post(users.signup);
    app.route('/mean/auth/signin').post(users.signin);
    app.route('/mean/auth/signout').get(users.signout);

    // Setting the facebook oauth routes
    app.route('/mean/auth/facebook').get(passport.authenticate('facebook', {
        scope: ['email']
    }));
    app.route('/mean/auth/facebook/callback').get(users.oauthCallback('facebook'));

    // Setting the twitter oauth routes
    app.route('/mean/auth/twitter').get(passport.authenticate('twitter'));
    app.route('/mean/auth/twitter/callback').get(users.oauthCallback('twitter'));

    // Setting the google oauth routes
    app.route('/mean/auth/google').get(passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));
    app.route('/mean/auth/google/callback').get(users.oauthCallback('google'));

    // Setting the linkedin oauth routes
    app.route('/mean/auth/linkedin').get(passport.authenticate('linkedin'));
    app.route('/mean/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

    // Finish by binding the user middleware
    app.param('userId', users.userByID);
};