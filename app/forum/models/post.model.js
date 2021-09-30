const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'communities',
        required: true,
        index: true
    },
    content: {
        type: String,
        maxlength: 5000
    },
    parsedContent: [{
        _id: String,
        line: String
    }],
    innerComments: [{
        _id: String,
        count: Number
    }],
}, { timestamps: { updatedAt: false } });

schema.index({ user: 1, community: 1 });


const Forum_Post = mongoose.model('forum_posts', schema);

module.exports.Forum_Post = Forum_Post;
