'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

var validateStringLength = function(limit) {
    return function(property) {
        ((this.provider !== 'local' && !this.updated) || property.length <= limit);
    }
};

var validateString80 = validateStringLength(80);
var validateString60 = validateStringLength(60);
var validateString40 = validateStringLength(40);
var validateString20 = validateStringLength(20);
var validateString10 = validateStringLength(10);

// var validateString60 = function(property) {
//     return ((this.provider !== 'local' && !this.updated) || property.length <= 60);
// };

// var validateString40 = function(property) {
//     return ((this.provider !== 'local' && !this.updated) || property.length <= 40);
// };

// var validateString20 = function(property) {
//     return ((this.provider !== 'local' && !this.updated) || property.length <= 20);
// };

// var validateString10 = function(property) {
//     return ((this.provider !== 'local' && !this.updated) || property.length <= 10);
// };

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (this.provider !== 'local' || (password && password.length > 6));
};

var validateAffiliated = function(checked) {
    return (this.provider !== 'local' || !checked || this.schoolname !== '');
};

var validateTitle = function(title) {
    console.log("title=" + title);
    console.log("isValid = " + ['MrMrsMsMissDr'].indexOf(title));
    return (this.provider !== 'local' || 'MrMrsMsMissDr'.indexOf(title) >= 0);
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    title: {
        type: String,
        trim: true,
        default: 'Mr.',
        validate: [validateTitle, 'Please provide a valid title']
    },
    firstName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateString40, 'Please fill in your first name']
    },
    lastName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateString40, 'Please fill in your last name']
    },
    displayName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        default: '',
        validate: [validateString60, 'Please fill in your email'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    username: {
        type: String,
        unique: true,
        required: 'Please fill in a username',
        match: [/.+\@.+\..+/, 'Please fill in a username'],
        trim: true
    },
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'Password should be longer']
    },
    affiliated: {
        type: Boolean,
        default: false,
        validate: [validateAffiliated, 'Please enter school details']
    },
    schoolurn: {
        type: String,
        default: '',
        trim: true
    },
    schoolname: {
        type: String,
        default: '',
        trim: true,
        validate: [validateString80, 'school name too long']
    },
    schooladdr1: {
        type: String,
        default: '',
        trim: true,
        validate: [validateString60, 'school address line 1 too long']
    },
    schooladdr2: {
        type: String,
        default: '',
        trim: true,
        validate: [validateString60, 'school address line 2 too long']
    },
    schooladdr3: {
        type: String,
        default: '',
        trim: true,
        validate: [validateString60, 'school address line 3 too long']
    },
    schooltown: {
        type: String,
        default: '',
        trim: true,
        validate: [validateString40, 'school town too long']
    },
    schoolpostCode: {
        type: String,
        default: '',
        trim: true,
        validate: [validateString10, 'school post code too long']
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerData: {},
    additionalProvidersData: {},
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

mongoose.model('User', UserSchema);