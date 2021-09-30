//core imports
const mongoose = require('mongoose');
const uid = require('unique-identity');
//custom imports
const { Forum_Post } = require('../models/post.model');
const { Post_Comment } = require('../models/comment.model');
const { Community } = require('../../community/models/communities.model');

module.exports.create = async (req, res) => {
    if (req.user.isCommonUser || req.user.isFM || req.user.isMentor) {
        // if (req.user.isCommonUser) {
        //     const community = await Community.findOne({ _id: req.user.communityId })
        //         .select('forumPostsForUser communityName');
        //     if (!community) {
        //         return res.status(403).json({ message: "Couldn't do that!", status: false });
        //     }
        // }
        if (req.body.lineId) {
            const post = await Forum_Post.findOne({ _id: req.body.postId }).select('_id innerComments');
            let comment = post.innerComments.id(req.body.lineId);
            if (comment) {
                comment.count += 1;
            } else {
                post.innerComments.push({ _id: req.body.lineId, count: 1 });
            }
            await post.save();
        }
        await Post_Comment.create({
            user: req.user._id,
            comment: req.body.comment,
            post: req.body.postId,
            lineId: (req.body.lineId) ? req.body.lineId : undefined,
            isPostLineComment: (req.body.lineId) ? true : false,
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
        await Post_Comment.updateOne({ _id: req.params.commentId, user: req.user._id }, {
            $set: {
                comment: req.body.comment
            }
        });
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
        let query = {};
        query._id = req.params.commentId;
        if (req.user.isFM) {

        } else {
            query.user = req.user._id;
        }
        const comment = await Post_Comment.findOne(query);
        if (!comment) {
            return res.status(400).json({ message: "Invalid comment!", status: false });
        }
        // if (req.user.isFM && !comment.user.equals(req.user._id)) {
        //     const postExist = await Forum_Post.findOne({ _id: comment.post, user: req.user._id }).countDocuments();
        //     if (!postExist) {
        //         return res.status(403).json({ message: "Couldn't do that!", status: false });
        //     }
        // }
        if (comment && comment.isPostLineComment) {
            const post = await Forum_Post.findOne({ _id: comment.post }).select('_id innerComments');
            let postComment = post.innerComments.id(comment.lineId);
            if (postComment.count > 1) {
                postComment.count -= 1;
            } else {
                await postComment.remove();
            }
            await post.save();
        }
        await comment.remove();
        res.json({ status: true, message: "success!" });

    } else {
        return res.status(403).json({ message: 'Invalid request!', status: false });
    }

}


module.exports.getAllMainCommentsOfPost = async (req, res) => {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    const comments = await Post_Comment.aggregate([
        { $match: { post: mongoose.Types.ObjectId(req.body.postId), isPostLineComment: false } },
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
                "user._id": 1, "user.name": 1, "user.nickName": 1, comment: 1, createdAt: 1
            }
        },
        {
            $facet: {
                data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: -1 } }],
                count: [{ $count: "count" }]
            }
        }
    ]);
    res.json({ data: comments, status: true });
}

module.exports.getAllLineCommentsOfPost = async (req, res) => {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    const comments = await Post_Comment.aggregate([
        { $match: { post: mongoose.Types.ObjectId(req.body.postId), lineId: req.body.lineId, isPostLineComment: true } },
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
                "user._id": 1, "user.name": 1, "user.nickName": 1, comment: 1, createdAt: 1
            }
        },
        {
            $facet: {
                data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { createdAt: -1 } }],
                count: [{ $count: "count" }]
            }
        }
    ]);
    res.json({ data: comments, status: true });
}
