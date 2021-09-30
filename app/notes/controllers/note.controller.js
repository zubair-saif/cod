//core imports
const mongoose = require('mongoose');

//custom imports
const { Personal_Note } = require('../models/note.model');

module.exports.create = async (req, res) => {
    await Personal_Note.create({
        user: req.user._id,
        note: req.body.note,
        isShared: req.body.isShared ? req.body.isShared : false,
        lastUpdate: new Date(),
        createdAt: new Date()
    }, (err, note) => {
        if (!err){
            res.json({ message: 'Success!', status: true, note: note });
        }
    });
}

module.exports.updateNote = async (req, res) => {
    const note = await Personal_Note.updateOne({ _id: req.params.noteId, user: req.user._id }, {
        note: req.body.note,
        lastUpdate: new Date()
    });
    if (!note.nModified) {
        return res.status(400).json({ message: "Couldn't update!", status: false });
    }
    res.json({ message: 'Success!', status: true });
}

module.exports.delete = async (req, res) => {
    await Personal_Note.deleteOne({ _id: req.params.noteId, user: req.user._id });
    res.json({ message: 'Success!', status: true });
}

module.exports.getAllMyNotes = async (req, res) => {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;

    const notes = await Personal_Note.aggregate([
        { $match: { user: mongoose.Types.ObjectId(req.user._id), isShared: req.body.isShared ? req.body.isShared : false } },
        {
            $project: {
                note: 1, isShared: 1, lastUpdate: 1, createdAt: 1
            }
        },
        {
            $facet: {
                data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { lastUpdate: -1 } }],
                count: [{ $count: "count" }]
            }
        }
    ]);
    res.json({ data: notes, status: true });
}


module.exports.getSharedNotes = async (req, res) => {
    if (req.user.isCommunityAdmin || req.user.isMentor) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;

        const notes = await Personal_Note.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $match: {
                    isShared: true,
                    'user.communityId': mongoose.Types.ObjectId(req.user.communityId)
                }
            },
            {
                $project: {
                    note: 1, lastUpdate: 1, 'user.nickName': 1
                }
            },
            {
                $facet: {
                    data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }, { $sort: { lastUpdate: -1 } }],
                    count: [{ $count: "count" }]
                }
            }
        ]);
        res.json({ data: notes, status: true });
    } else {
        res.status(403).json({ message: 'Invalid request!', status: false });
    }

}


module.exports.activateSharing = async (req, res) => {
    if (req.user.isCommonUser) {
        await Personal_Note.updateOne({ _id: req.params.noteId, user: req.user._id }, {
            $set: {
                isShared: true
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: 'Invalid request!', status: false });
    }

}

module.exports.deactivateSharing = async (req, res) => {
    if (req.user.isCommonUser) {
        await Personal_Note.updateOne({ _id: req.params.noteId, user: req.user._id }, {
            $set: {
                isShared: false
            }
        })
        res.json({ message: "Success!", status: true });
    } else {
        res.status(403).json({ message: 'Invalid request!', status: false });
    }
}