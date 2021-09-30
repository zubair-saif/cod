const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chatRooms'
    },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        body: String,
        attachment: {
            t: {
                type: String,
                enum: ['audio', 'video', 'image']
            },
            audio: String,
            video: String,
            image: String,
            size: String
        },
        sentAt: {
            type: Date,
            default: new Date()
        },
        replyTo: {
            message: {
                type: mongoose.Schema.Types.ObjectId
            },
            body: {
                type: String,
            },
            type: {
                type: String
            }
        },
        isLastCheckInMsg: {
            type: Boolean
        }

        // isRead: {
        //     type: Boolean,
        //     default: false
        // }
    }]
});


const ChatRoomMessages = mongoose.model('chatRoomMessages', schema);

module.exports.ChatRoomMessages = ChatRoomMessages;
