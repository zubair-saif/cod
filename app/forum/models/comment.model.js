const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    comment: {
        type: String,
        maxlength: 500
    },
    lineId: {
        type: String,
    },
    isPostLineComment: {
        type: Boolean,
        required: true
    }
}, { timestamps: { updatedAt: false } });

schema.index({ post: 1, user: 1 });

const Post_Comment = mongoose.model('post_comments', schema);

module.exports.Post_Comment = Post_Comment;
