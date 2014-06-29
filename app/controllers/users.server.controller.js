'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    passport = require('passport'),
    nodemailer = require('nodemailer'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    util = require('util'),
    debug = require('debug')('users');


var oneTimes = {};

function clearOneTime(email) {
    debug('deleting one time password ' + email);

    // cancel the timeout
    oneTimes[email][0]();

    // delete the record from the oneTimes object
    delete oneTimes[email];
}

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
            default:
                message = 'database error, code=' + err.code;
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    return message;
};

/**
 * Signup
 */
exports.signup = function(req, res) {
    // For security measurement we remove the roles from the req.body object

    delete req.body.roles;

    // Init Variables
    var user = new User(req.body);
    var message = null;
    var s = req.body.school;

    // Add missing user fields
    user.provider = 'local';
    user.displayName = user.firstName + ' ' + user.lastName;

    if (s) {
        user.schoolurn = '' + s.urn;
        user.schoolname = s.name;
        user.schooladdr1 = s.addr1;
        user.schooladdr2 = s.addr2;
        user.schooladdr3 = s.addr3;
        user.schooltown = s.town;
        user.schoolpostCode = s.postCode;
    }

    // Then save the user 
    user.save(function(err) {
        if (err) {
            return res.send(400, getErrorMessage(err));
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;

            req.login(user, function(err) {
                if (err) {
                    res.send(400, err);
                } else {
                    res.jsonp(user);
                }
            });
        }
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    debug('signin request');
    // First check whether this is a one-time sign-in
    debug('req.body = ' + util.inspect(req.body));

    if (req.body) {
        var email = req.body.email;
        var password = req.body.password;
        if (oneTimes) {
            var ot = oneTimes[email];
            if (ot && ot[1] === password) {

                // clear the oneTime password timeout
                ot[0]();
                delete oneTimes[email];

                // fetch user details
                User.findOne({
                    email: email
                }).exec(function(err, user) {
                    if (err) {
                        debug(err);
                        res.send(400, {
                            message: 'Lookup failure on ' + email
                        });
                    } else {

                        // We need to set the session cookie so user
                        // can be redirected to settings page.

                        res.json(200, {
                            user: user
                        });
                    }
                });
            }
        }
    }

    // otherwise drop through to normal authenticate
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            debug('signin err = ' + err);
            res.send(400, err);
        } else if (!user) {
            debug('no user ' + info.message);
            res.send(400, info);
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;

            req.login(user, function(err) {
                if (err) {
                    debug('signin 400 failure');
                    debug(util.inspect(err));
                    res.send(400, err);
                } else {
                    res.jsonp(user);
                }
            });
        }
    })(req, res, next);
};


/**
 * Find user by email or username
 */
exports.findOne = function(req, res) {
    //debug('findOne');
    // debug(util.inspect(req));
    //debug('username = ' + req.query.username);
    //debug('email = ' + req.query.email);

    var email = req.query.email;
    var username = req.query.username;

    if (email) {
        User.findOne({
            email: email
        }).exec(function(err, user) {
            if (err) {
                debug(err);
                res.send(400, {
                    message: 'Lookup failure on ' + email
                });
            } else res.json({
                user: user
            });
        });
    } else if (username) {
        User.findOne({
            username: username
        }).exec(function(err, user) {
            if (err) {
                debug(err);
                res.send(400, {
                    message: 'Lookup failure on ' + username
                });
            } else res.json({
                user: user
            });
        });
    } else {
        res.send(400, {
            message: 'empty query'
        });
    }

};


/**
 * Update user details
 */
exports.update = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;
        user.username = user.email;

        user.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.send(400, err);
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    } else {
        res.send(400, {
            message: 'User is not signed in'
        });
    }
};

// This is an example that works on the server:

var smtpTransport = nodemailer.createTransport('SMTP', {
    host: 'smtp.hermes.cam.ac.uk',
    port: 587,
    debug: true,
    auth: {
        user: process.env.crsid,
        pass: process.env.hermesPassword
    }
});

var mailOptions = {
    from: '<gmp26@cam.ac.uk>',
    to: 'gmp26@cam.ac.uk',
    subject: 'CMEP Password Reset Request (testing)',
    html: '<p>We received a password reset request for your CMEP account.</p>' +
        '<p>A new password has been generated for you which is good ' +
        'for one sign-in only within the next hour. ' +
        'Your one-time password is</p>' +
        '<div style="font-weight:bold;font-size:1.8em">password</div>' +
        '<p>Please sign in with this password. ' +
        'You will then be redirected to your settings page where you can choose a new password</p>' +
        '<p>If this password has already expired, you will be given an opportunity to request another.</p>'
};

/**
 * Reset Password
 */
exports.resetPassword = function(req, res) {
    debug('body email = ' + req.body.resetEmail);
    var resetEmail = req.body.resetEmail;
    if (resetEmail) {
        User.findOne({
            email: resetEmail
        }).exec(function(err, user) {
            if (err) {
                debug(err);
                return res.send(400, {
                    message: 'Lookup failure on ' + resetEmail
                });
            } else {
                // generate one-time password
                var oneTime = 'password ';

                // start timeout on password
                var timeout = setTimeout(clearOneTime, 1000 * 3600, resetEmail);

                // store one-time password along with timeoutObject
                oneTimes[resetEmail] = [oneTime, timeout];

                // email user with password
                // send mail with defined transport object
                smtpTransport.sendMail(mailOptions, function(err, response) {
                    if (err) {
                        console.log(err);
                        res.send(400, {
                            message: 'unable to send email '
                        });
                    } else {
                        console.log('Message sent: ' + response.message);
                        // simple success displays instructions to user
                        return res.json(200, {
                            message: 'email sent '
                        });
                    }
                    // if you don't want to use this transport object anymore, uncomment following line
                    //smtpTransport.close(); // shut down the connection pool, no more messages
                });
            }
        });
    } else {
        return res.json(400, {
            message: 'no email in request'
        });
    }
};

/**
 * Change Password
 */
exports.changePassword = function(req, res, next) {
    // Init Variables
    var passwordDetails = req.body;
    var message = null;

    if (req.user) {
        User.findById(req.user.id, function(err, user) {
            if (!err && user) {
                if (user.authenticate(passwordDetails.currentPassword)) {
                    if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                        user.password = passwordDetails.newPassword;

                        user.save(function(err) {
                            if (err) {
                                return res.send(400, {
                                    message: getErrorMessage(err)
                                });
                            } else {
                                req.login(user, function(err) {
                                    if (err) {
                                        res.send(400, err);
                                    } else {
                                        res.send({
                                            message: 'Password changed successfully'
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.send(400, {
                            message: 'Passwords do not match'
                        });
                    }
                } else {
                    res.send(400, {
                        message: 'Current password is incorrect'
                    });
                }
            } else {
                res.send(400, {
                    message: 'User is not found'
                });
            }
        });
    } else {
        res.send(400, {
            message: 'User is not signed in'
        });
    }
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    console.log('signout called');
    req.logout();
    // force page reload so user data will update
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.redirect('back');
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
    return function(req, res, next) {
        passport.authenticate(strategy, function(err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/mean/#!/signin');
            }
            req.login(user, function(err) {
                if (err) {
                    return res.redirect('/mean/#!/signin');
                }

                return res.redirect(redirectURL || '/mean/');
            });
        })(req, res, next);
    };
};

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.profile = user;
        next();
    });
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, {
            message: 'User is not logged in'
        });
    }

    next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
    var _this = this;

    return function(req, res, next) {
        _this.requiresLogin(req, res, function() {
            if (_.intersection(req.user.roles, roles).length) {
                return next();
            } else {
                return res.send(403, {
                    message: 'User is not authorized'
                });
            }
        });
    };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
    if (!req.user) {
        // Define a search query fields
        var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
        var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

        // Define main provider search query
        var mainProviderSearchQuery = {};
        mainProviderSearchQuery.provider = providerUserProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define additional provider search query
        var additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define a search query to find existing user with current provider profile
        var searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        };

        User.findOne(searchQuery, function(err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

                    User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
                        user = new User({
                            firstName: providerUserProfile.firstName,
                            lastName: providerUserProfile.lastName,
                            username: availableUsername,
                            displayName: providerUserProfile.displayName,
                            email: providerUserProfile.email,
                            provider: providerUserProfile.provider,
                            providerData: providerUserProfile.providerData
                        });

                        // And save the user
                        user.save(function(err) {
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    } else {
        // User is already logged in, join the provider data to the existing user
        User.findById(req.user.id, function(err, user) {
            if (err) {
                return done(err);
            } else {
                // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
                if (user && user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
                    // Add the provider data to the additional provider data field
                    if (!user.additionalProvidersData) user.additionalProvidersData = {};
                    user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

                    // Then tell mongoose that we've updated the additionalProvidersData field
                    user.markModified('additionalProvidersData');

                    // And save the user
                    user.save(function(err) {
                        return done(err, user, '/#!/settings/accounts');
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
    var user = req.user;
    var provider = req.param('provider');

    if (user && provider) {
        // Delete the additional provider
        if (user.additionalProvidersData[provider]) {
            delete user.additionalProvidersData[provider];

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');
        }

        user.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.send(400, err);
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    }
};