'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
    }
});

mongoose.model('Comment', CommentSchema);