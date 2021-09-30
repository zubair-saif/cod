//core imports
const mongoose = require('mongoose');
const uid = require('unique-identity');
//custom imports
const { Forum_Post } = require('../models/post.model');
const { Post_Comment } = require('../models/comment.model');
const { User } = require('../../users/models/users.model');
const { Community } = require('../../community/models/communities.model');

module.exports.create = async (req, res) => {
    if (req.user.isCommonUser || req.user.isFM || req.user.isMentor) {
        if (req.user.isCommonUser) {
            const community = await Community.findOne({ _id: req.user.communityId })
                .select('forumPostsForUser communityName');
            if (!community || !community.forumPostsForUser) {
                return res.status(403).json({ message: "Couldn't do that!", status: false });
            }
        }
        let contentArray = ((req.body.content).trim()).split('.');
        let parsedContent = [];
        for (let i = 0; i < contentArray.length; i++) {
            if (contentArray[i]) {
                parsedContent.push({ _id: uid.get(), line: contentArray[i] });
                // content += contentArray[i] + '{{' + uid.get() + '}}';
            }
        }
        await Forum_Post.create({
            user: req.user._id,
            community: req.user.communityId,
            content: (req.body.content).trim(),
            parsedContent: parsedContent
        });
        res.json({ status: true, message: "success!" });
    } else {
        return res.status(403).json({ message: 'Invalid request!', status: false });
    }
}

module.exports.edit = async (req, res) => {
    if (req.user.isCommonUser || req.user.isFM || req.user.isMentor) {
        // if (req.user.isCommonUser) {
        //     const community = await Community.findOne({ _id: req.user.communityId })
        //         .select('forumPostsForUser communityName');
        //     if (!community || !community.forumPostsForUser) {
        //         return res.status(403).json({ message: "Couldn't do that!", status: false });
        //     }
        // }
        const post = await Forum_Post.findOne({ _id: req.params.postId, user: req.user._id });
        if (post.innerComments.length) {
            return res.status(400).json({ message: "Couldn't do that for now!", status: false });
        }
        let contentArray = ((req.body.content).trim()).split('.');
        let parsedContent = [];
        for (let i = 0; i < contentArray.length; i++) {
            if (contentArray[i]) {
                parsedContent.push({ _id: uid.get(), line: contentArray[i] });
                // content += contentArray[i] + '{{' + uid.get() + '}}';
            }
        }
        post.content = (req.body.content).trim();
        post.parsedContent = parsedContent;
        await post.save();
        res.json({ status: true, message: "success!" });
    } else {
        return res.status(403).json({ message: 'Invalid request!', status: false });
    }

}

module.exports.delete = async (req, res) => {
    if (req.user.isCommonUser || req.user.isFM || req.user.isMentor) {
        // if (req.user.isCommonUser) {
        //     const community = await Community.findOne({ _id: req.user.communityId })
        //         .select('forumPostsForUser communityName');
        //     if (!community || !community.forumPostsForUser) {
        //         return res.status(403).json({ message: "Couldn't do that!", status: false });
        //     }
        // }
        const post = await Forum_Post.findOneAndDelete({ _id: req.params.postId, user: req.user._id });
        if (!post) {
            return res.status(400).json({ message: "Couldn't do that!", status: false });
        }
        await Post_Comment.deleteMany({ post: post._id });
        res.json({ status: true, message: "success!" });
    } else {
        return res.status(403).json({ message: 'Invalid request!', status: false });
    }
}


module.exports.getAllPostsOfCommunity = async (req, res) => {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    const posts = await Forum_Post.aggregate([
        { $match: { community: mongoose.Types.ObjectId(req.user.communityId) } },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $project: {
                "user.name": 1, "user.nickName": 1, content: 1, parsedContent: 1, createdAt: 1
            }
        },
        {
            $facet: {
                data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: -1 } }],
                count: [{ $count: "count" }]
            }
        }
    ]);
    res.json({ data: posts, status: true });
}



module.exports.getAllPostsOfMine = async (req, res) => {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    const posts = await Forum_Post.aggregate([
        { $match: { user: mongoose.Types.ObjectId(req.user._id) } },
        {
            $project: {
                content: 1, parsedContent: 1, innerComments: 1, createdAt: 1
            }
        },
        {
            $facet: {
                data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: -1 } }],
                count: [{ $count: "count" }]
            }
        }
    ]);
    res.json({ data: posts, status: true });
}

module.exports.getPostDetail = async (req, res) => {
    const post = await Forum_Post.findOne({
        _id: req.params.postId,
        community: mongoose.Types.ObjectId(req.user.communityId)
    })
        .select('content parsedContent innerComments createdAt');
    res.json({ data: post, status: true });
}
