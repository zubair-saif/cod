const fs = require('fs').promises;


//custom imports
const { ChatRoomMessages } = require('../models/chatRoomMessages.model');
const { ChatRoom } = require('../models/chatRoom.model');
const coreHelper = require('../../../helper_functions/core.helper');
const mongoose = require('mongoose');
const fcmHelper = require('../../../helper_functions/fcmTokenHelper');

module.exports = function (io) {
    var nsp = io.of('/');
    nsp.on('connection', (socket) => {
        socket.on('connectToRoom', (data) => {
            socket.leaveAll();
            socket.join(data.chatRoomId);

        })

        socket.on('connectToChats', (data) => {
            const user = coreHelper.extractUserFromTokenForStreams(data.token, socket);
            if (!user) {
                return socket.emit('exception', { status: false, message: "User Not Found!" });
            }
            socket.leave(user._id);
            socket.join(user._id);
            // console.log("Connect To Chats")
        })

        socket.on('typing', async (data) => {
            const user = coreHelper.extractUserFromTokenForStreams(data.token, socket);
            if (!user) {
                return;
            }
            socket.broadcast.to(data.chatRoomId).emit('userTyping', { message: user.name + ' is typing...' });
        })

        socket.on("readChat", async (data) => {

            const user = coreHelper.extractUserFromTokenForStreams(data.token, socket);
            if (!user) {
                return;
            }
            let setQuery = {};
            if ((data.lastMsgById && data.lastMsgById != user._id) || data.isLastCheckInMsg) {
                setQuery = { $set: { 'participants.$.isRead': true, 'participants.$.readAt': new Date(), 'participants.$.lastReadMsg': data.lastMsgID } };
            }

            const chatRoom = await ChatRoom.findOneAndUpdate({ _id: data.chatRoomId, participants: { $elemMatch: { participant: mongoose.Types.ObjectId(user._id) } } }, setQuery, { new: true });
            for (let i = 0; i < chatRoom.participants.length; i++) {
                // if (chatRoom.participants[i].participant != user._id) {
                nsp.to(chatRoom.participants[i].participant).emit('updatedChatRoomStatus', { chatRoom: chatRoom });
                // }
            }

        })

        socket.on("getUnReadMessages", async (data) => {
            const user = coreHelper.extractUserFromTokenForStreams(data.token, socket);
            if (!user) {
                return;
            }
            // console.log(user)
            const chatRoom = await ChatRoom.findById(data.chatRoomId);
            if (!chatRoom) {
                socket.emit('exception', { message: 'Invalid Request Chat Room Not Found!.' });
                return;
            }
            // console.log(chatRoom.participants)
            let participant = chatRoom.participants.find(participant => {
                return participant.participant == user._id
            })
            // console.log(participant)
            if (participant.lastReadMsg) {
                const chatRoomMessages = await ChatRoomMessages.findOne({ chatRoomId: data.chatRoomId })
                const index = chatRoomMessages.messages.findIndex(x => {
                    // console.log("X :", x._id)
                    // console.log("Participant:",participant.lastReadMsg)
                    return x._id.toString() === participant.lastReadMsg.toString()
                })
                // console.log(index)
                // chatRoomMessages.messages.slice(index - 1)
                nsp.to(user._id).emit('unReadMessages', { messages: chatRoomMessages.messages.slice(0, index) });
                // socket.emit('unReadMessages', { messages: chatRoomMessages.messages.slice(0, index) });
            }

        })

        socket.on('sendMessage', async (data) => {
            try {
                const user = coreHelper.extractUserFromTokenForStreams(data.token, socket);
                if (!user) {
                    return;
                }
                let message = {};
                
                if (data.replyTo && data.replyTo.message) {
                    console.log(data.replyTo)
                    message = {
                        sender: user._id,
                        body: data.message,
                        replyTo: {
                            message: data.replyTo.message,
                            body: (!data.replyTo.body) ? '' : ((data.replyTo.body).length > 49) ? (data.replyTo.body).substring(0, 50) + '...' : data.replyTo.body,
                            type: (data.replyTo.msgType) ? data.replyTo.msgType : 'text'
                        },
                        sentAt: new Date()
                    }
                } else {
                    message = {
                        sender: user._id,
                        body: data.message,
                        sentAt: new Date()
                    }
                }


                if (!data.chatRoomId) {
                    socket.emit('exception', { message: 'Invalid Request Chat Room Not Specified!.' });

                } else if (data.chatRoomId) {
                    const chatRoom = await ChatRoom.findOne({ _id: data.chatRoomId });
                    // console.log(chatRoom);
                    if (!chatRoom) {
                        socket.emit('exception', { message: 'Invalid Request Chat Room Not Found!.' });
                        return;

                    } else if (chatRoom.isDisabled) {
                        socket.emit('exception', { message: "You Can't reply to this coversation because chat is disabled!." });
                        return;
                    }
                    if (!chatRoom.participants.find(p => p.participant.equals(user._id))) {
                        socket.emit('exception', { message: "You Can't reply to this coversation!." });
                        return;
                    }
                    let fileResult = {};
                    try {
                        if ((data.msgType == 'image') || (data.msgType == 'video') || (data.msgType == 'audio')) {
                            message.attachment = {};
                            if (data.msgType == 'image') {
                                fileResult = await coreHelper.socketUploadStaticFile(socket, data.file, 2, 'messages_static_data', 'img.jpg')
                                if (!fileResult.success) {
                                    socket.emit('exception', { message: "Couldn't upload!.", status: false });
                                    return;
                                } else {
                                    message.attachment.image = fileResult.path;
                                    message.attachment.t = 'image';
                                    message.attachment.size = data.attachmentSize;
                                }
                            } else if (data.msgType == 'audio') {
                                fileResult = await coreHelper.socketUploadStaticFile(socket, data.file, 5, 'attachments', 'audio.aac')
                                if (!fileResult.success) {
                                    socket.emit('exception', { message: "Couldn't upload!.", status: false });
                                    return;
                                } else {
                                    message.attachment.audio = fileResult.path;
                                    message.attachment.t = 'audio';
                                    message.attachment.size = data.attachmentSize;
                                }
                            } else if (data.msgType == 'video') {
                                fileResult = await coreHelper.socketUploadStaticFile(socket, data.file, 10, 'messages_static_data', 'video.mp4')
                                if (!fileResult.success) {
                                    socket.emit('exception', { message: "Couldn't upload!.", status: false });
                                    return;
                                } else {
                                    message.attachment.video = fileResult.path;
                                    message.attachment.t = 'video';
                                    message.attachment.size = data.attachmentSize;
                                }
                            }
                        }
                        const chatRoomMessagesFound = await ChatRoomMessages.updateOne(
                            { chatRoomId: chatRoom._id },
                            { $push: { messages: { $each: [message], $position: 0 } } }
                        );
                        // console.log(chatRoomMessagesFound)
                        if ((chatRoomMessagesFound.n == 0) || (chatRoomMessagesFound.nModified == 0)) {
                            const chatRoomMessages = await ChatRoomMessages.create({
                                chatRoomId: data.chatRoomId,
                                messages: [message]
                            })
                            const savedChatRoomMessages = await chatRoomMessages.save();

                            const chatRoomMessagesDoc = await ChatRoomMessages.populate(savedChatRoomMessages, [
                                { path: 'messages.sender', select: 'nickName' }
                            ]);
                            if (chatRoomMessagesDoc.messages[0].attachment && chatRoomMessagesDoc.messages[0].attachment.t) {
                                chatRoom.lastMessage = {
                                    _id: chatRoomMessagesDoc.messages[0]._id,
                                    sender: chatRoomMessagesDoc.messages[0].sender,
                                    sentAt: chatRoomMessagesDoc.messages[0].sentAt,
                                    body: 'Attachment'
                                }
                            } else {
                                chatRoom.lastMessage = chatRoomMessagesDoc.messages[0];
                            }

                            for (let i = 0; i < chatRoom.participants.length; i++) {
                                if (chatRoom.participants[i].participant != user._id) {
                                    chatRoom.participants[i].isRead = false;
                                }
                            }
                            const savedChatRoom = await chatRoom.save();


                            let participant = []
                            chatRoom.participants.forEach(element => {
                                if (element.participant != user._id) {
                                    participant.push(element.participant)
                                }
                            })
                            let dataToSend = {
                                _id: chatRoomMessagesDoc._id,
                                chatRoom: savedChatRoom,
                                messages: chatRoomMessagesDoc.messages
                            };
                            for (let i = 0; i < chatRoom.participants.length; i++) {
                                nsp.to(chatRoom.participants[i].participant).emit('messageData', dataToSend);
                            }
                            // nsp.in(data.chatRoomId).emit('messageData', dataToSend);
                            try {
                                let tokendata = {}
                                for (let i = 0; i < participant.length; i++) {
                                    tokendata = { userId: participant[i], message: data.message, title: "New Message", payload: { "key": "value" } };
                                    fcmHelper.sendPushNotification(tokendata);
                                }

                            } catch (ex) {
                                console.log(ex.message);
                            }
                            return;
                            // res.send(updatedChatRoomMessages);
                        }

                        // chatRoomMessages.messages.unshift(message);
                        // await chatRoomMessages.save();
                        const updatedChatRoomMessages = await ChatRoomMessages.findOne({ chatRoomId: data.chatRoomId }, { messages: { $slice: [0, 1] } })
                            .populate('messages.sender', 'nickName').lean();
                        // const savedChatRoomMessages = await chatRoomMessages.save();
                        // console.log(savedChatRoomMessages)
                        // savedChatRoomMessages.messages.splice(1, updatedChatRoomMessages.messages.length - 1);
                        // const chatRoomMessagesDoc = await ChatRoomMessages.populate(savedChatRoomMessages, [{ path: 'messages.sender', select: 'nickName' }]);
                        // chatRoom.lastMessage = updatedChatRoomMessages.messages[0];
                        if (updatedChatRoomMessages.messages[0].attachment && updatedChatRoomMessages.messages[0].attachment.t) {
                            chatRoom.lastMessage = {
                                _id: updatedChatRoomMessages.messages[0]._id,
                                sender: updatedChatRoomMessages.messages[0].sender,
                                sentAt: updatedChatRoomMessages.messages[0].sentAt,
                                body: 'Attachment'
                            }
                        } else {
                            chatRoom.lastMessage = updatedChatRoomMessages.messages[0];
                        }

                        for (let i = 0; i < chatRoom.participants.length; i++) {
                            if (chatRoom.participants[i].participant != user._id) {
                                chatRoom.participants[i].isRead = false;
                            }
                        }
                        const savedChatRoom = await chatRoom.save();

                        let participant = []
                        chatRoom.participants.forEach(element => {
                            if (element.participant != user._id) {
                                participant.push(element.participant)
                            }
                        })
                        let dataToSend = {
                            _id: updatedChatRoomMessages._id,
                            chatRoom: savedChatRoom,
                            messages: updatedChatRoomMessages.messages
                        };
                        for (let i = 0; i < chatRoom.participants.length; i++) {
                            nsp.to(chatRoom.participants[i].participant).emit('messageData', dataToSend);
                        }
                        // nsp.in(data.chatRoomId).emit('messageData', dataToSend);
                        try {
                            let tokendata = {}
                            for (let i = 0; i < participant.length; i++) {
                                tokendata = { userId: participant[i], message: data.message, title: "New Message", payload: { "key": "value" } };
                                fcmHelper.sendPushNotification(tokendata);
                            }

                        } catch (ex) {
                            console.log(ex.message);
                        }
                    } catch (error) {
                        await fs.unlink(fileResult.path).catch(er => { return false; });
                        console.log(error.message);
                    }
                }

                // io.of('/chat/sendMessage').in(data.chatRoomId).emit('msg', data.msg);
            } catch (error) {
                socket.emit('exception', { message: error.message, status: false });
            }

        })
        socket.on('disconnect', () => {
            console.log('diconnected');

        })
        socket.on('disconnecting', () => {
            console.log('diconnecting');

        })


    })
}