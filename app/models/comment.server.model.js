'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator'),
    voting = require('mongoose-voting'),
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
    // votes: [{
    //     type: Schema.ObjectId,
    //     ref: 'User'
    // }],
    content: {
        type: String,
        default: '',
        trim: true
    }
});

CommentSchema.plugin(voting);


/**
 * Hook to strip out all html tags and all control chars
 * Also restrict length of input
 */
CommentSchema.pre('save', function(next) {

    var maxTitle = 80;
    var maxContent = 576;

    if (this.title && this.title.length > 0) {
        if (this.title.length > maxTitle) {
            this.title = this.title.substr(0, maxTitle);
        }
        this.title = validator.stripLow(this.title, true);
        this.title = validator.escape(this.title);
    }

    if (this.content && this.content.length > 0) {
        if (this.content.length > maxContent) {
            this.content = this.content.substr(0, maxContent);
        }
        this.content = validator.stripLow(this.content, true);
        this.content = validator.escape(this.content);
    }

    next();
});


mongoose.model('Comment', CommentSchema);