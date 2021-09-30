//core imports 
const mongoose = require('mongoose');

// custom imports
const { ChatRoomMessages } = require('../models/chatRoomMessages.model');



module.exports.getMessagesAgainstChatRoomId = async (req, res) => {
    const page = (req.body.page) ? req.body.page : 1;
    const numOfMessages = (req.body.numOfMessages) ? req.body.numOfMessages : 10;
    const chatRoomMessages = await ChatRoomMessages.findOne({ chatRoomId: req.body.chatRoomId },
        { messages: { $slice: [(page - 1) * numOfMessages, numOfMessages] } })
        .populate('messages.sender', 'nickName');
    res.json(chatRoomMessages);
}

module.exports.deleteMessage = async (req, res) => {
    const chatRoom = await ChatRoomMessages.findOne({ chatRoomId: req.body.chatRoomId })
    if (!chatRoom) {
        return res.status(400).json({ message: "ChatRoom Not Found!" });
    }
    let messages = await chatRoom.messages.id(mongoose.Types.ObjectId(req.body.messageId));
    await messages.remove();
    await chatRoomMessages.save();
    res.json({ message: 'Successfully removed the ChatRoom Message!' });
};

module.exports.updateMessage = async (req, res) => {
    const chatRoomMessages = await ChatRoomMessages.findOneAndUpdate({
        chatRoomId: req.body.chatRoomId,
        messages: { $elemMatch: { _id: req.body.message._id } }
    },
        {
            $set: {
                'messages.$.body': req.body.message.body
            }
        });

    res.json({ message: 'Successfully Update the ChatRoom Message!' });
};

