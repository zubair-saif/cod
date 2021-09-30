const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    communityName: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true
    },
    communityCode: {
        type: String
    },
    welcome_message: {
        type: String
    },
    chatRoomMessage: {
        type: String
    },
    sponsorUrl: {
        type: String
    },
    data: {
        video: {
            vLink: {
                type: String
            },
            vTitle: {
                type: String
            },
        },
        book: {
            bLink: {
                type: String
            },
            bTitle: {
                type: String
            },
        },
    },
    ageLimit: {
        type: Number,
        default: 17
    },
    forumPostsForUser: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date
    }

});

schema.index({ communityName: 'text', communityCode: 'text' });
const Community = mongoose.model('communities', schema);

function validate(community) {
    const schema = {
        communityName: Joi.string().required()
    };
    return Joi.validate(community, schema);
}

module.exports.validate = validate;
module.exports.Community = Community;
