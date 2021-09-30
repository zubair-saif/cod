//core imports
const mongoose = require('mongoose');

//custom imports
const { Community } = require('../models/communities.model');
const { ChatRoom } = require('../../conversation/models/chatRoom.model');
const { ChatRoomMessages } = require('../../conversation/models/chatRoomMessages.model');
const { CommunityAdmin } = require('../models/communityAdmin.model');
const { User } = require('../../users/models/users.model');
const { Role } = require('../../users/models/roles.model');

module.exports.create = async (req, res) => {
    if (req.user.level && (req.user.level.isAdmin || req.user.level.communityOption.createCommunity)) {
        // const result = validate(req.body);
        // if (result.error) {
        //     res.status(400).json({ message: result.error.details[0].message });
        //     return;
        // }
        let parsedCommunity = (req.body.communityName).replace(/ /g, '');
        parsedCommunity = (parsedCommunity).toLowerCase();
        const commmunityFound = await Community.findOne({ communityName: parsedCommunity });
        if (commmunityFound) {
            return res.status(400).json({ message: "Community is already exist!" });
        }
        const community = await Community.create({
            communityName: parsedCommunity,
            ageLimit: req.body.ageLimit
        });
        const saveCommunity = await community.save();
        let gcDate = new Date();
        const group = await ChatRoom.create({
            participants: [],
            isCommunityGroup: true,
            community: saveCommunity._id,
            lastMessage: { sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." },
            createdAt: gcDate
        })
        const savedGroup = await group.save();
        const groupMessages = await ChatRoomMessages.create({
            chatRoomId: savedGroup._id,
            messages: [{ sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." }]
        })
        await groupMessages.save();
        saveCommunity.communityCode = "C-" + saveCommunity._id.toString().slice(-6)
        await saveCommunity.save();
        res.json({ message: 'Successfully Created Community!', communityCode: saveCommunity.communityCode });

    } else {
        res.status(403).json({ mesage: "Access Denied!" })
    }
}

module.exports.getCommunity = async (req, res) => {
    const community = await Community.findOne({ _id: req.params.communityId })
        .select('-_id communityName forumPostsForUser welcome_message data sponsorUrl');
    res.json({ status: true, data: community });
}

module.exports.makeCommunityAdmin = async (req, res) => {
    // const result = validate(req.body);
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    if (req.user.level && (req.user.level.communityOption.makeCommunityAdmin || req.user.level.isAdmin) || req.user.isCommunityAdmin) {
        const communityAdmin = await CommunityAdmin.findOne({ user: req.body.userId }).populate('community', 'communityName');
        if (communityAdmin) {
            return res.json({ message: `User is Already Admin of ${communityAdmin.community.communityName} Community. Remove it first and then make Admin of this Community!`, status: false })
        }
        let communityId = '';
        if (req.user.isCommunityAdmin) {
            communityId = req.user.communityId;
        } else {
            communityId = req.body.communityId;
        }

        const admin = await CommunityAdmin.create({
            community: communityId,
            user: req.body.userId
        });
        await admin.save();
        await User.updateOne({ _id: req.body.userId }, { $set: { isCommunityAdmin: true } });
        const chatR = await ChatRoom.findOne({ community: communityId, isCommunityGroup: true }).select('participants');
        if (!chatR) {
            let gcDate = new Date();
            let msgId = mongoose.Types.ObjectId();
            const group = await ChatRoom.create({
                participants: [{ participant: req.body.userId }],
                isCommunityGroup: true,
                community: communityId,
                lastMessage: { _id: msgId, sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." },
                createdAt: gcDate
            })
            const savedGroup = await group.save();
            const groupMessages = await ChatRoomMessages.create({
                chatRoomId: savedGroup._id,
                messages: [{ _id: msgId, sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." }]
            })
            await groupMessages.save();
        } else {
            if (!chatR.participants.find(p => p.participant.equals(req.body.userId))) {
                chatR.participants.push({ participant: req.body.userId });
                await chatR.save();
            }
        }
        const forumChatR = await ChatRoom.findOne({ community: communityId, isForumGroup: true }).select('participants');
        if (!forumChatR) {
            let msgId = mongoose.Types.ObjectId();
            let gcDate = new Date();
            const group = await ChatRoom.create({
                participants: [{ participant: req.body.userId }],
                isForumGroup: true,
                community: communityId,
                lastMessage: { _id: msgId, sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." },
                createdAt: gcDate
            })
            const savedGroup = await group.save();
            const groupMessages = await ChatRoomMessages.create({
                chatRoomId: savedGroup._id,
                messages: [{ _id: msgId, sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." }]
            })
            await groupMessages.save();
        } else {
            if (!forumChatR.participants.find(p => p.participant.equals(req.body.userId))) {
                forumChatR.participants.push({ participant: req.body.userId });
                await forumChatR.save();
            }
        }
        return res.json({ message: 'Successfully made Community Admin!', status: true });
    } else {
        res.status(403).json({ mesage: "Access Denied!" })
    }

}

module.exports.allowCommonUsersToForum = async (req, res) => {
    if (req.user.level && (req.user.level.isAdmin) || req.user.isCommunityAdmin) {
        let query = {};
        if (req.user.isCommunityAdmin) {
            query._id = req.user.communityId;
        } else {
            query._id = req.params.communityId
        }
        await Community.updateOne(query, {
            $set: {
                forumPostsForUser: true
            }
        });
        res.json({ message: 'Success!', status: true });
    } else {
        res.status(403).json({ mesage: "Access Denied!" })
    }
};

module.exports.disallowCommonUsersToForum = async (req, res) => {
    if (req.user.level && (req.user.level.isAdmin) || req.user.isCommunityAdmin) {
        let query = {};
        if (req.user.isCommunityAdmin) {
            query._id = req.user.communityId;
        } else {
            query._id = req.params.communityId
        }
        await Community.updateOne(query, {
            $set: {
                forumPostsForUser: false
            }
        });
        res.json({ message: 'Success!', status: true });
    } else {
        res.status(403).json({ mesage: "Access Denied!" })
    }
};



module.exports.updateCommunity = async (req, res) => {
    if (req.user.level && (req.user.level.communityOption.editCommunity || req.user.level.isAdmin) || req.user.isCommunityAdmin) {
        let community = {};
        if (req.user.isCommunityAdmin) {
            community.ageLimit = req.body.ageLimit;
            community.forumPostsForUser = req.body.forumPostStatusForUser;
        } else {
            community.communityName = req.body.communityName;
            community.ageLimit = req.body.ageLimit;
            community.forumPostsForUser = req.body.forumPostStatusForUser;
        }
        if (community) {
            await Community.updateOne({ _id: req.params.communityId }, {
                $set: community
            });
        }
        return res.json({ message: 'Updated' });
    } else {
        res.status(403).json({ mesage: "Access Denied!" })
    }
};

module.exports.updateSponsorUrl = async (req, res) => {
    if (req.user.level && (req.user.level.isAdmin || req.user.level.communityOption.setSponsorUrl) || req.user.isCommunityAdmin) {
        console.log(req.body)
        const community = await Community.updateOne({ _id: req.params.communityId }, {
            $set: { sponsorUrl: req.body.sponsorUrl }
        });
        console.log(community);
        return res.json({ status: true, message: 'Updated' });
    } else {
        res.status(403).json({ status: false, mesage: "Access Denied!" })
    }
};

module.exports.updateCommunityData = async (req, res) => {
    if (req.user.level && (req.user.level.communityOption.editCommunity || req.user.level.isAdmin) || req.user.isCommunityAdmin) {
        let community = { welcome_message: req.body.message, chatRoomMessage: req.body.chatRoomMessage, data: req.body.data };

        if (community) {
            await Community.updateOne({ _id: req.params.communityId }, {
                $set: community
            });
        }
        return res.json({ message: 'Updated', status: true });
    } else {
        res.status(403).json({ mesage: "Access Denied!", status: false })
    }
};

module.exports.removeCommunityAdmin = async (req, res) => {
    if (req.user.level && (req.user.level.communityOption.deleteCommunity || req.user.level.isAdmin)) {
        await CommunityAdmin.findOneAndRemove({ community: req.body.communityId, user: req.body.userId })
        await User.updateOne({ _id: req.body.userId }, { $unset: { isCommunityAdmin: false } }, { new: true });
        await ChatRoom.updateMany({
            community: req.body.communityId,
            $or: [{ isCommunityGroup: true }, { isForumGroup: true }]
        }, {
            $pull: {
                participants: { participant: { $in: [req.body.userId] } }
            }
        });
        res.json({ message: "Admin Removed!" });
    } else {
        res.status(403).json({ message: "Access Denied!" })
    }
}

module.exports.getAllCommunities = async (req, res) => {
    if (req.user.level && (req.user.level.communityOption.accessAllCommunities || req.user.level.isAdmin) || req.user.isCommunityAdmin) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        // let communities = [];
        let query = {};
        if (req.user.isCommunityAdmin) {
            query._id = mongoose.Types.ObjectId(req.user.communityId);
            // communities = await Community.find({ _id: req.user.communityId }).lean();
        }
        const communities = await Community.aggregate([
            { $match: query },
            // { $project: { _id: 1, name: 1, email: 1, profilePic: 1 } },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
                    count: [{ $count: "docCount" }]
                }
            }
        ]);
        if (!communities[0].data.length) {
            communities[0].data = [];
        }
        for (let i = 0; i < communities[0].data.length; i++) {
            const communityadmins = await CommunityAdmin.find({ community: communities[0].data[i]._id }).select('user').populate('user', 'email').lean()
            // console.log(communityadmin)
            if (communityadmins.length) {
                communities[0].data[i].admins = communityadmins;
            }
        }
        return res.json(communities);
    } else {
        res.status(403).json({ mesage: "Access Denied!" })
    }
}

module.exports.deleteCommunity = async (req, res) => {
    if (req.user.level && (req.user.level.communityOption.deleteCommunity || req.user.level.isAdmin)) {
        await CommunityAdmin.deleteMany({ community: req.params.communityId });
        await User.updateMany({ communityId: req.params.communityId, isCommunityAdmin: true },
            { $unset: { isCommunityAdmin: 1 } });
        const community = await Community.findByIdAndDelete(req.params.communityId);
        if (!community) {
            return res.status(400).json({ message: "No Community Found!" });
        }

        return res.status(200).json({ message: "Community Deleted!" });
    } else {
        res.status(403).json({ mesage: "Access Denied!" })
    }

}

module.exports.searchCommunity = async (req, res) => {

    let search = "";
    if (req.body.communityName) {
        search += req.body.communityName + " "
    }
    if (req.body.communityCode) {
        search += req.body.communityCode + " "
    }
    const community = await Community.find({ $text: { $search: search } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } })
    res.json(community);
};

