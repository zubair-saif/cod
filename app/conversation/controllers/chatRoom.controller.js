//core imports 
const mongoose = require('mongoose');

// custom imports
const { ChatRoom } = require('../models/chatRoom.model');
const { ChatRoomMessages } = require('../models/chatRoomMessages.model');

// module.exports.getchatRoomMessages = async (req, res) => {
//     const page = (req.body.page) ? req.body.page : 1;
//     const numOfMessages = (req.body.numOfMessages) ? req.body.numOfMessages : 10;

//     const chatRoom = await ChatRoom.findOne({ participants: { $elemMatch: { participant: mongoose.Types.ObjectId(req.user._id), participant: mongoose.Types.ObjectId(req.body.participant) } } });

//     if (!chatRoom) {
//         return res.status(200).json({ message: "No Chat Room found!", status: false });
//     }

//     const chatRoomMessages = await ChatRoomMessages.findOne({ chatRoomId: chatRoom._id }, { messages: { $slice: [(page - 1) * numOfMessages, numOfMessages] } })
//         .populate('messages.sender', 'nickName')
//         .populate({
//             path: 'chatRoomId',
//             populate: { path: 'participants.participant', select: 'nickName' }
//         })
//     res.send(chatRoomMessages);
// }

module.exports.getchatRooms = async (req, res) => {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 100;
    const chatRooms = await ChatRoom.aggregate([
        {
            $match: {
                participants: {
                    $elemMatch: {
                        participant: mongoose.Types.ObjectId(req.user._id),
                        isDeleted: false
                    }
                },
                $and: [
                    { $or: [{ isCommunityGroup: false }, { isCommunityGroup: undefined }] },
                    { $or: [{ isForumGroup: false }, { isForumGroup: undefined }] }
                ]
            }
        },
        {
            $project: {
                _id: 1, lastMessage: 1, isDisabled: 1, participants: 1
            }
        },
        {
            $facet: {
                data: [{ $sort: { "lastMessage.sentAt": -1 } }, { $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
                count: [{ $count: "items" }]
            }
        }
    ]);
    await ChatRoom.populate(chatRooms[0].data, [{ path: "participants.participant", select: 'nickName email gender age bio' }]);
    // const chatRooms = await ChatRoom.find({ participants: { $elemMatch: { participant: mongoose.Types.ObjectId(req.user._id), isDeleted: false } }, $or: [{ isCommunityGroup: false }, { isCommunityGroup: null }] }).sort({ "lastMessage.sentAt": -1 })
    //     .populate('participants.participant', 'nickName email gender');
    res.json(chatRooms);
}

module.exports.getchatRoomsForSuperRights = async (req, res) => {
    let userId = "";
    if ((req.user.level && req.user.level.isAdmin) || req.user.isCommunityAdmin) {
        userId = req.body.userId;
        const chatRooms = await ChatRoom.find({ participants: { $elemMatch: { participant: mongoose.Types.ObjectId(userId) } } }).sort({ "lastMessage.sentAt": -1 })
            .populate('participants.participant', 'nickName');
        res.json(chatRooms);
    } else {
        res.status(403).json({ message: "Invalid Request!" });
    }
}

module.exports.assignNickName = async (req, res) => {

    const chatRoom = await ChatRoom.findOneAndUpdate({
        _id: req.params.chatRoomId,
        participants: { $elemMatch: { participant: mongoose.Types.ObjectId(req.body.participantId) } }
    },
        {
            $set: {
                'participants.$.nickNameForChat': req.body.nickName
            }
        });

    res.json({ message: 'Successfully Update the Participant NickName!' });
}

module.exports.deleteChat = async (req, res) => {
    // const chatRooms = await ChatRoom.findOne({ _id: mongoose.Types.ObjectId(req.body.chatRoomId), participants: { $elemMatch: { participant: mongoose.Types.ObjectId(req.body.participant) } } })
    const chatRooms = await ChatRoom.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.chatRoomId) } },
        {
            $project: {
                participants: {
                    $filter: {
                        input: "$participants",
                        as: "participants",
                        cond: {
                            $and: [
                                { $ne: ["$$participants.participant", mongoose.Types.ObjectId(req.user._id)] },
                                { $eq: ["$$participants.isDeleted", false] }
                            ]
                        }
                    }
                }
            }
        }
    ])
    if (chatRooms.length < 1) {
        return res.status(400).json({ message: "ChatRoom Not Found" });
    }
    if (chatRooms.length > 0 && chatRooms[0].participants.length > 0) {
        await ChatRoom.updateOne({ _id: mongoose.Types.ObjectId(req.params.chatRoomId), participants: { $elemMatch: { participant: mongoose.Types.ObjectId(req.user._id) } } },
            { $set: { "participants.$.isDeleted": true } })
        return res.status(200).json({ message: "Conversation Deleted!..." })
    }
    await ChatRoom.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.chatRoomId) })
    res.status(200).json({ message: "Conversation Deleted!..." })
}



module.exports.createChatRoom = async (req, res) => {
    const chatRoom = await ChatRoom.create({
        participants: req.body.participants,
        createdAt: new Date()
    });
    await chatRoom.save();
    res.json({ message: "Chat Room Successfully Created!" })
}

module.exports.getCommunityGroup = async (req, res) => {
    if (req.user.isMentor || req.user.isCommunityAdmin) {
        const chatRoom = await ChatRoom.findOne({
            community: req.user.communityId,
            isCommunityGroup: true
        }).select('participants lastMessage community')
            .populate('community', '-_id communityName')
            .populate('participants.participant', 'nickName gender email');
        res.json(chatRoom)
    } else {
        res.status(403).json({ message: 'Invalid request!', status: false });
    }
}

module.exports.getForumGroup = async (req, res) => {
    if (req.user.isFM) {
        const chatRoom = await ChatRoom.findOne({
            community: req.user.communityId,
            isForumGroup: true
        }).select('participants lastMessage community')
            .populate('community', '-_id communityName')
            .populate('participants.participant', 'nickName gender email');
        res.json(chatRoom)
    } else {
        res.status(403).json({ message: 'Invalid request!', status: false });
    }
}