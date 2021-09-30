const mongoose = require('mongoose');
const Joi = require('joi');

const schema = new mongoose.Schema({

    participants: [{
        _id: false,
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        nickNameForChat: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: new Date()
        },
        lastReadMsg: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    lastMessage: {
        _id: mongoose.Schema.Types.ObjectId,
        sentAt: Date,
        sender: Object,
        body: String,
        // isRead: {
        //     type: Boolean,
        //     default: false
        // }
    },
    isCommunityGroup: {
        type: Boolean,
    },
    isForumGroup: {
        type: Boolean,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'communities'
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const ChatRoom = mongoose.model('chatRooms', schema);

module.exports.ChatRoom = ChatRoom;
