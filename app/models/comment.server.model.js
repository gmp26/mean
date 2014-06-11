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
 */
CommentSchema.pre('save', function(next) {

    if (this.content && this.content.length > 0) {
        this.content = validator.stripLow(this.content, true);
        this.content = validator.escape(this.content);
    }

    if (this.title && this.title.length > 0) {
        this.title = validator.stripLow(this.title, true);
        this.title = validator.escape(this.title);
    }

    // Only one vote saved per user
    // this.votes = _.uniq(this.votes);

    next();
});


mongoose.model('Comment', CommentSchema);