//core imports
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
//custom imports
const { User } = require('../models/users.model');
const { Community } = require('../../community/models/communities.model');
const { UserMentorSettings } = require('../models/userAndMentorSettings.model');
const { ChatRoom } = require('../../conversation/models/chatRoom.model');
const { ChatRoomMessages } = require('../../conversation/models/chatRoomMessages.model');
const coreHelper = require('../../../helper_functions/core.helper');

module.exports.register = async (req, res) => {
    // const result = validate(req.body);
    // if (result.error) {
    //     res.status(400).json({ message: result.error.details[0].message });
    //     return;
    // }
    const community = await Community.findOne({ communityName: req.body.communityName });
    if (!community) {
        return res.status(400).json({ message: "Community Not Found!" });
    }
    // if (community.ageLimit > req.body.age) {
    //     return res.status(400).json({ message: "Cannot Regiter in this Community because your Age is less than Community AgeLimit Policy!" });
    // }
    let parsedEmail = (req.body.email).replace(/ /g, '');
    parsedEmail = (parsedEmail).toLowerCase();
    const user = await User.findOne({ email: parsedEmail, isDeleted: false });
    if (user) {
        res.status(400).json({ message: 'This email is already registered!' });
        return;
    }
    let isApproved = false;
    if (req.body.isCommonUser) {
        if (req.body.age >= community.ageLimit) {
            isApproved = true;
        }
    }
    const salt = await bcrypt.genSalt(10);
    const register = await User.create({
        email: parsedEmail,
        age: req.body.age,
        bio: req.body.bio,
        gender: req.body.gender,
        communityId: community._id,
        isCommonUser: req.body.isCommonUser,
        isMentor: req.body.isMentor,
        isForumMentor: req.body.isForumMentor,
        isApproved: isApproved,
        password: await bcrypt.hash(req.body.password, salt)
    });
    const saveUser = await register.save();
    saveUser.nickName = "U-" + saveUser._id.toString().slice(-6)
    await saveUser.save();

    const token = jwt.sign({
        _id: saveUser._id
    }, config.get('jwtSecretKey'), {
        expiresIn: 604800 // 1 week, 
    })
    let data = {
        email: saveUser.email, output: `<html><body>Hello <strong>${saveUser.nickName}!</strong><br><br> Welcome to Kahf chat - Chat Anonymously with Anonymous Community Mentor.
        <br> We would like to verify your email address before getting you access. Your email address is used for verification only. It is not visible by other Users/Mentors.
        <br>Verify your email by clicking below.<br><br>  
        <a href=${config.get('LiveIp') + '/user/verify/' + token} 
            style="background-color: #b76ec6 ;
            color: white;
            padding: 10px 15px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            border-radius:10px" >Verify</a>
            <br><br>
            If you did not register for a KahfChat Account, someone may have registered with your information by mistake. Contact admin@kahfchat.com for further assistance.
            <br></body></html>` };
    coreHelper.sendEmail(data);
    // if (req.body.isCommonUser) {
    //     const mentor = await User.aggregate([{ $match: { communityId: mongoose.Types.ObjectId(community._id), isMentor: true, isApproved: true, isVerified: true } },
    //     { $project: { _id: 1, email: 1, gender: 1 } },
    //     {
    //         $lookup: {
    //             from: 'user-mentor-settings',
    //             localField: '_id',
    //             foreignField: 'mentor.mentorId',
    //             as: "mentorData"
    //         }
    //     },
    //     { $project: { _id: 1, email: 1, gender: 1, userCountByMentor: { $size: "$mentorData" } } },
    //     { $sort: { userCountByMentor: 1 } },
    //         // { $limit: 1 }
    //     ]);
    //     // console.log(mentor)
    //     // console.log(req.body.gender)


    //     if (mentor.length >= 1) {
    //         let query = {};
    //         let filterMentor = await mentor.find(mentor => {
    //             return mentor.gender == req.body.gender;
    //         });
    //         // console.log(filterMentor)
    //         if (filterMentor) {
    //             let userMentor = { user: { userId: saveUser._id, email: saveUser.email }, mentor: { mentorId: filterMentor._id, email: filterMentor.email } }
    //             Object.assign(query, userMentor)
    //             // console.log("Assign Mentor Query:" + query)
    //         } else {
    //             let userMentor = { user: { userId: saveUser._id, email: saveUser.email }, mentor: { mentorId: mentor[0]._id, email: mentor[0].email } }
    //             Object.assign(query, userMentor)
    //             // console.log("Mentor Query:" + query)
    //         }
    //         // console.log(query)
    //         const assignMentor = await UserMentorSettings.create(query);
    //         if (assignMentor) {
    //             const room = await ChatRoom.create({
    //                 participants: [{ participant: query.user.userId }, { participant: query.mentor.mentorId }],
    //                 lastMessage: { sentAt: new Date(), body: "HI! How Are You ?", createdAt: new Date() }
    //             })
    //             await room.save();
    //             const roomMessages = await ChatRoomMessages.create({
    //                 chatRoomId: room._id,
    //                 messages: [{ sentAt: new Date(), body: "HI! How Are You ?" }]
    //             })
    //             await roomMessages.save();
    //         }
    //     }
    // }
    res.json({ registered: true, message: "Successfully Registered!" })

}

module.exports.registerSystemUser = async (req, res) => {
    let parsedEmail = (req.body.email).replace(/ /g, '');
    parsedEmail = (parsedEmail).toLowerCase();
    const user = await User.findOne({ email: parsedEmail });
    if (user) {
        res.status(400).json({ message: 'This email is already registered!' });
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const register = await User.create({
        name: req.body.name,
        email: parsedEmail,
        // age: req.body.age,
        // bio: req.body.bio,
        // gender: req.body.gender,
        isApproved: true,
        isSystem: true,
        isVerified: true,
        password: await bcrypt.hash(req.body.password, salt)
    });
    const saveUser = await register.save();
    saveUser.nickName = "U-" + saveUser._id.toString().slice(-6)
    await saveUser.save();
    res.json({ status: true, message: "Successfully Registered!" })

}



