// core imports
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

//custom imports
const { User } = require('../models/users.model');
const { CommunityAdmin } = require('../../community/models/communityAdmin.model');


module.exports.login = async (req, res) => {
    const result = Validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.details[0].message });
        return;
    }
    const user = await User.findOne({ email: req.body.email, $or: [{ isDeleted: false }, { isDeleted: null }] });
    if (!user) {
        res.status(400).json({ message: 'Invalid email or password!' });
        return;
    }
    if (user.isBlocked || user.isDeleted) {
        res.status(400).json({ message: "Invalid Request! Your account is blocked or might be deleted." });
        return;
    }
    if (!user.isApproved) {
        const communityAdmin = await CommunityAdmin.findOne({ community: user.communityId }).populate('user', 'email');
        if (communityAdmin && communityAdmin.user && communityAdmin.user.email) {
            return res.status(400).json({ message: `You Are Not Approved Yet Please Contact Here ${communityAdmin.user.email} For Approval!` });
        } else {
            return res.status(400).json({ message: "You Are Not Approved Yet Please Contact Here 'admin@kahfchat.com' For Approval!" });
        }
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        res.status(400).json({ message: 'Invalid email or password!' });
        return;
    }
    const token = jwt.sign({
        _id: user._id,
        name: user.nickName,
        email: user.email,
        isCommonUser: user.isCommonUser,
        isFM: user.isForumMentor,
        isMentor: user.isMentor,
        isSystem: user.isSystem,
        communityId: user.communityId,
        isCommunityAdmin: user.isCommunityAdmin
    }, config.get('jwtSecretKey'), {
        // expiresIn: 604800 // 1 week, 
    })
    let user2 = user.toObject()
    delete user2.password;
    res.json({ token: token, user: user2 });
}

module.exports.loginAdminPenal = async (req, res) => {
    const result = Validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.details[0].message });
        return;
    }
    const user = await User.findOne({ email: req.body.email, $or: [{ isDeleted: false }, { isDeleted: null }] }).populate('lev', '-_id');
    if (!user) {
        res.status(400).json({ message: 'Invalid email or password!' });
        return;
    }
    if (user.isBlocked || user.isDeleted) {
        res.status(400).json({ message: "Invalid Request! Your account is blocked or might be deleted." });
        return;
    }
    if ((user.lev && user.lev.isAdmin) || user.isSystem || user.isCommunityAdmin) {
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Invalid email or password!' });
            return;
        }
        const token = jwt.sign({
            _id: user._id,
            name: user.nickName,
            email: user.email,
            level: user.lev,
            isSystem: user.isSystem,
            communityId: user.communityId,
            isCommunityAdmin: user.isCommunityAdmin
        }, config.get('jwtSecretKey'), {
            // expiresIn: 604800 // 1 week, 
        })
        res.json({ token: token });
    } else {
        res.status(403).json({ message: "Invalid Request!" });
    }
}

function Validate(user) {
    const schema = {
        email: Joi.required(),
        password: Joi.required()
    };
    return Joi.validate(user, schema);

}
