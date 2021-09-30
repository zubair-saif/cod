//core imports
const mongoose = require('mongoose');

//custom imports
const { Alert } = require('../models/alert.model');
const { User } = require('../../users/models/users.model');
const { CommunityAdmin } = require('../../community/models/communityAdmin.model');
const fcmHelper = require('../../../helper_functions/fcmTokenHelper');

module.exports.create = async (req, res) => {
    // const result = validate(req.body);
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    console.log('message: ',req.body.message)
    const alert = await Alert.create({
        issue_report: req.body.issue_report,
        mentor_switch: req.body.mentor_switch,
        from: req.user._id,
        community: req.user.communityId,
        message: req.body.message,
        createdAt: new Date()

    });
    await alert.save();

    const communityadmin = await CommunityAdmin.findOne({ community: req.user.communityId });
    try {
        let data = {}
        if (req.body.issue_report) {
            data = { userId: communityadmin.user, message: "This is issue report by User to Admin Notification", title: "Issue Report", payload: { "key": "value" } };
        } else if (req.body.mentor_switch) {
            data = { userId: communityadmin.user, message: "This is mentor_switch request by User to Admin Notification", title: "Mentor Switch", payload: { "key": "value" } };
        }
        fcmHelper.sendPushNotification(data);
    } catch (ex) {
        return res.json({ message: ex.message });
    }
    res.json({ message: 'Successfully Created Alert!' });
}

module.exports.getAllAlerts = async (req, res) => {
    if ((req.user.level && (req.user.level.alertOption.accessAllAlerts ||
        req.user.level.isAdmin)) ||
        req.user.isCommunityAdmin) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        let query = {};
        if (req.user.isCommunityAdmin) {
    query.community = mongoose.Types.ObjectId(req.user.communityId);
        }
    // console.log(query)
        const alerts = await Alert.aggregate([
            { $match: query },
            // { $project: { _id: 1, name: 1, email: 1, profilePic: 1 } },
            {
                $facet: {
                    data: [{ $sort: { createdAt: -1 } }, { $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
                    count: [{ $count: "docCount" }]
                }
            }
        ]);
        if (alerts.length < 0) {
            return res.status(400).json({ message: "No Alert Found!" });
    }
        await Alert.populate(alerts[0].data, [{ path: "from", select: 'nickName email isMentor isCommonUser' }]);
        return res.json(alerts);
    } else {
        res.status(403).json({ message: "Access Denied" })
    }

}

module.exports.getAllUnReadAlerts = async (req, res) => {
    const alerts = await Alert.find({ isRead: false })
    res.json(alerts);
}

module.exports.deleteAlert = async (req, res) => {
    if (req.user.level && (req.user.level.alertOption.deleteAlert || req.user.level.isAdmin)) {
        const alert = await Alert.findByIdAndDelete(req.params.alertId)
        if (!alert) {
            return res.status(400).json({status:false, message: "No Alert Found!" });
        }
        return res.status(200).json({status:true, message: "Alert Deleted!" });
    } else {
        res.status(403).json({ status:false, message: "Access Denied" })
    }

}

module.exports.readAlert = async (req, res) => {
    const alert = await Alert.findByIdAndUpdate(req.params.alertId, { $set: { isRead: true } }, { new: true })
    if (!alert) {
        return res.status(400).json({ message: "No Alert Found!" });
    }
    res.status(200).json({ message: "Alert Read!" });
}

module.exports.readAllAlert = async (req, res) => {
    let query = {};
    if (req.user.isCommunityAdmin) {
        query.community = req.user.communityId;
    }
    await Alert.updateMany(query, { $set: { isRead: true } });
    res.json({ message: "Alert Read!" });
}