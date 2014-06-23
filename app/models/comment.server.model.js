'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator'),
    voting = require('mongoose-voting'),
    debug = require('debug')('model'),
    _ = require('lodash');

/**
 * Comment Schema
 */
var CommentSchema = new Schema({
    spotId: {
        type: String,
        default: '',
        required: 'SpotId cannot be empty'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be empty'
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    replies: [{
        content: String
    }]
});

CommentSchema.plugin(voting);


/**
 * Hook to strip out all html tags and all control chars
 * Also to restrict length of input
 */
CommentSchema.pre('save', function(next) {

    var maxTitle = 80;
    var maxContent = 576;
    var maxReply = 144;

    if (this.title && this.title.length > 0) {
        if (this.title.length > maxTitle) {
            this.title = this.title.substr(0, maxTitle);
        }
        this.title.trim();
        // this.title = _.escape(validator.stripLow(this.title.trim(), true));
    }

    if (this.content && this.content.length > 0) {
        // debug('content = ' + this.content);
        if (this.content.length > maxContent) {
            this.content = this.content.substr(0, maxContent);
        }
        this.content.trim();
        // this.content = _.escape(validator.stripLow(this.content.trim(), true));
        // debug('content = ' + this.content);
    }

    for (var i = 0; i < this.replies.length; i++) {
        var reply = this.replies[i];
        if (reply && reply.length > 0) {
            if (reply.length > maxReply) {
                reply = reply.substr(0, maxReply);
            }
            reply = reply.trim();
            debug('reply = ' + reply);
        }
    }

    next();
});


mongoose.model('Comment', CommentSchema);