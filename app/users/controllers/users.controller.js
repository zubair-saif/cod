//core imports
const moment = require('moment');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');
var generator = require('generate-password')
const jwt = require('jsonwebtoken');
const config = require('config');

//custom imports
const { User } = require('../models/users.model');
const { UserMentorSettings } = require('../models/userAndMentorSettings.model');
const { ChatRoom } = require('../../conversation/models/chatRoom.model');
const { ChatRoomMessages } = require('../../conversation/models/chatRoomMessages.model');
const coreHelper = require('../../../helper_functions/core.helper');
const { FcmToken } = require('../models/userNotificationM');
const fcmHelper = require('../../../helper_functions/fcmTokenHelper');
const { Community } = require('../../community/models/communities.model');


module.exports.changeAdminEmailAndPassword = async (req, res) => {
  if (req.user.level && req.user.level.isAdmin) {
    if (!req.body.email && !(req.body.newPassword && req.body.password)) {
      res.status(400).json({ message: 'Invalid request!', status: false });
      return;
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      res.status(400).json({ message: 'Invalid account!', status: false });
      return;
    }
    if (req.body.email) {
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        res.status(400).json({ message: 'Invalid password!' });
        return;
      }
      let parsedEmail = (req.body.email).replace(/ /g, '');
      parsedEmail = (parsedEmail).toLowerCase();
      const email = await User.findOne({ email: parsedEmail }).select('email');
      if (email) {
        res.status(400).json({ message: 'Email is already registered!', status: false });
        return;
      }
      user.email = parsedEmail;
    }
    if (req.body.newPassword) {
      const salt = await bcrypt.genSalt(10);
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        res.status(400).json({ message: 'Invalid old password!' });
        return;
      }
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }
    await user.save();
    res.json({ message: 'Success!', status: true });
  } else {
    res.status(403).json({ message: 'Invalid request!', status: false });
    return;
  }

}

module.exports.sendResetPassEmail = async (req, res) => {
  const user = await User.findOne({ email: req.body.email, $or: [{ isDeleted: false }, { isDeleted: null }] }).select('nickName email');
  if (!user) {
    res.status(400).json({ message: 'User not Found!' })
    return;
  }

  const token = jwt.sign({
    _id: user._id,
  }, config.get('jwtSecretKey'), {
    expiresIn: 18000
  })

  try {
    let data = { email: user.email, output: `Hi <strong>${user.nickName}!</strong><br> Here is Your <a href="${config.get('LiveIp')}/reset/password/${token}">Reset Password Link</a>` }
    coreHelper.sendEmail(data)
    res.json({ message: 'Reset Password Link Sent To Your Eamil Please Check Your Inbox!' });
  } catch (ex) {
    res.status(400).json({ message: ex.message });
  }
}


module.exports.resetPassword = async (req, res) => {

  // const result = Joi.validate(req.body, schema);
  // if (result.error) {
  //   res.status(400).json({ message: result.error.details[0].message });
  //   return;
  // }
  try {
    const decodedToken = jwt.verify(req.body.token, config.get('jwtSecretKey'));
    const user = await User.findOne({ _id: decodedToken._id }).select('nickName email password');
    if (!user) {
      res.status(400).json({ message: 'User not Found!' })
      return;
    }

    const password = generator.generate({ length: 10, numbers: true, symbols: true })
    // var password = Math.random().toString(36).slice(-8);
    // console.log(password)
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    try {
      let data = { email: user.email, output: `Hi <strong>${user.nickName}!</strong><br> Here is Your New Password  <strong>${password}</strong> ` }
      coreHelper.sendEmail(data)
      res.json({ message: 'Password is Changed!' });

    } catch (ex) {
      return res.status(400).json({ message: ex.message });
    }
  } catch (err) {
    res.status(400).json({ message: "Invalid Token!" })
  }

}

module.exports.changePassword = async (req, res) => {
  const schema = {
    newPassword: Joi.string().required(),
    oldPassword: Joi.string().required()
  };
  const result = Joi.validate(req.body, schema);
  if (result.error) {
    res.status(400).json({ message: result.error.details[0].message });
    return;
  }
  const user = await User.findOne({ _id: req.user._id }).select('password');
  if (!user) {
    res.status(400).json({ message: 'User not Found!' })
    return;
  }
  const oldPassword = await bcrypt.compare(req.body.oldPassword, user.password);
  if (oldPassword) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();
    return res.json({ message: 'Password is Changed!' });
  }
  res.status(400).json({ message: 'Invalid Password' });

}

module.exports.searchUser = async (req, res) => {

  let search = "";
  if (req.body.userName) {
    search += req.body.userName + " "
  }
  if (req.body.email) {
    search += req.body.email + " "
  }
  const user = await User.find({ $text: { $search: search } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).select('-password')
  res.json(user);
};

//---------------------------------------------------------------------------------------------------------------------------//


module.exports.getUser = async (req, res) => {

  const user = await User.findById(req.params.userId)
    .select('-password -lev')

  if (!user) {
    return res.status(400).json({ message: 'User not found!' });
  }
  res.json(user);
};

module.exports.updateUser = async (req, res) => {
  const user = {
    age: req.body.age,
    gender: req.body.gender,
    bio: req.body.bio,
    communityId: req.body.communityId,
    isCommonUser: req.body.isCommonUser,
    isMentor: req.body.isMentor
  };
  const updateuser = await User.findByIdAndUpdate(req.params.userId, {
    $set: user
  },
    { new: true }
  );
  res.json({ message: 'Updated' });
};

module.exports.deleteUser = async (req, res) => {
  // const deleteuser = await User.findByIdAndRemove(req.params.userId);
  if ((req.user.level && req.user.level.isAdmin) || req.user.isCommunityAdmin) {
    const deleteuser = await User.findByIdAndUpdate(req.params.userId, { $set: { isDeleted: true } }, { new: true });
    if (!deleteuser) {
      return res.status(400).json({ message: "User not found!" })
    }
    const chatRoom = await ChatRoom.update({
      participants: {
        $elemMatch: {
          participant: mongoose.Types.ObjectId(req.params.userId),
        }
      },
      $and: [
        { $or: [{ isCommunityGroup: false }, { isCommunityGroup: undefined }] },
        { $or: [{ isForumGroup: false }, { isForumGroup: undefined }] }
      ]
    }, { $set: { isDisabled: true } },
      {
        multi: true
      });
    // console.log(chatRoom)
    res.json({ message: 'Deleted', status: true });
  } else {
    res.status(403).json({ message: "Invalid Request!", status: false });
  }

};


module.exports.getAllUsers = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.accessAllUser ||
    req.user.level.isAdmin)) ||
    req.user.isCommunityAdmin) {

    let query = { _id: { $ne: req.user._id } };
    if (req.user.isCommunityAdmin) {
      query.communityId = req.user.communityId;
    }
    query.isDeleted = false;
    const users = await User.find(query)
      .select('-password')

    if (users.length < 1) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.json(users);
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};

module.exports.getAllCommonUsers = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.accessAllCommonUser ||
    req.user.level.isAdmin)) ||
    req.user.isCommunityAdmin) {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    let query = { _id: { $ne: mongoose.Types.ObjectId(req.user._id) } };
    if (req.user.level && (req.user.level.userOption.accessAllCommonUser || req.user.level.isAdmin)) {
      query.isCommonUser = true;
    } else if (req.user.isCommunityAdmin) {
      query.isCommonUser = true;
      query.communityId = mongoose.Types.ObjectId(req.user.communityId);
    } else {
      return res.status(403).json({ message: "Invalid Request!" });
    }
    query.isDeleted = false;

    const users = await User.aggregate([
      { $match: query },
      { $project: { password: 0 } },
      {
        $facet: {
          data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
          count: [{ $count: "docCount" }]
        }
      }
    ]);
    if (!users[0].data.length) {
      users[0].data = [];
    }
    await User.populate(users[0].data, [{ path: "communityId", select: 'communityName' }]);
    // const users = await User.find(query)
    //   .populate('communityId', 'communityName')
    //   .select('-password').lean();
    for (let i = 0; i < users[0].data.length; i++) {
      const mentorOfTheUser = await UserMentorSettings.findOne({ "user.userId": users[0].data[i]._id });
      users[0].data[i].mentor = mentorOfTheUser;
    }
    return res.json(users);
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};


module.exports.getAllSystemUsers = async (req, res) => {
  if (req.user.level && req.user.level.isAdmin) {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    let query = { _id: { $ne: mongoose.Types.ObjectId(req.user._id) } };
    query.isSystem = true;
    const users = await User.aggregate([
      { $match: query },
      { $project: { password: 0 } },
      {
        $facet: {
          data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
          count: [{ $count: "docCount" }]
        }
      }
    ]);
    if (!users[0].data.length) {
      users[0].data = [];
    }
    await User.populate(users[0].data, [{ path: "lev", select: 'role' }]);
    res.json(users);
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};


module.exports.getAllUsersRelatedToCommunity = async (req, res) => {
  if ((req.user.level && (req.user.level.isAdmin || req.user.level.userOption.accessAllUser)) || req.user.isCommunityAdmin) {
    const users = await User.find({ _id: { $ne: req.user._id }, communityId: req.body.communityId, isApproved: true, isVerified: true, isBlocked: false, isDeleted: false })
      .select('-password').lean();
    res.json(users);
  } else {
    res.status(403).json({ message: "Invalid Request!" })
  }
};

module.exports.getAllMentors = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.accessAllMentors ||
    req.user.level.isAdmin)) ||
    req.user.isCommunityAdmin) {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    let query = {
      _id: { $ne: mongoose.Types.ObjectId(req.user._id) },
      $or: [{ isForumMentor: false }, { isForumMentor: undefined }]
    };
    if (req.user.level && (req.user.level.userOption.accessAllMentors || req.user.level.isAdmin)) {
      query.isMentor = true;
    } else if (req.user.isCommunityAdmin) {
      query.isMentor = true;
      query.communityId = mongoose.Types.ObjectId(req.user.communityId);
    } else {
      return res.status(403).json({ message: "Invalid Request!" });
    }
    query.isDeleted = false;

    const users = await User.aggregate([
      { $match: query },
      { $project: { password: 0 } },
      {
        $facet: {
          data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
          count: [{ $count: "docCount" }]
        }
      }
    ]);
    if (!users[0].data.length) {
      users[0].data = [];
    }
    await User.populate(users[0].data, [{ path: "communityId", select: 'communityName' }]);
    // const users = await User.find(query)
    //   .populate('communityId', 'communityName')
    //   .select('-password').lean();
    res.json(users);
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};

module.exports.getAllForumMentors = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.accessAllMentors ||
    req.user.level.isAdmin)) ||
    req.user.isCommunityAdmin) {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    let query = { _id: { $ne: mongoose.Types.ObjectId(req.user._id) }, isMentor: false };
    if (req.user.level && (req.user.level.userOption.accessAllMentors || req.user.level.isAdmin)) {
      query.isForumMentor = true;
    } else if (req.user.isCommunityAdmin) {
      query.isForumMentor = true;
      query.communityId = mongoose.Types.ObjectId(req.user.communityId);
    } else {
      return res.status(403).json({ message: "Invalid Request!" });
    }
    query.isDeleted = false;

    const users = await User.aggregate([
      { $match: query },
      { $project: { password: 0 } },
      {
        $facet: {
          data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
          count: [{ $count: "docCount" }]
        }
      }
    ]);
    if (!users[0].data.length) {
      users[0].data = [];
    }
    await User.populate(users[0].data, [{ path: "communityId", select: 'communityName' }]);
    // const users = await User.find(query)
    //   .populate('communityId', 'communityName')
    //   .select('-password').lean();
    res.json(users);
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};

module.exports.getAllCompositeMentors = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.accessAllMentors ||
    req.user.level.isAdmin)) ||
    req.user.isCommunityAdmin) {
    const currentpage = (req.body.currPage) ? req.body.currPage : 1;
    const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
    let query = { _id: { $ne: mongoose.Types.ObjectId(req.user._id) }, isMentor: true };
    if (req.user.level && (req.user.level.userOption.accessAllMentors || req.user.level.isAdmin)) {
      query.isForumMentor = true;
    } else if (req.user.isCommunityAdmin) {
      query.isForumMentor = true;
      query.communityId = mongoose.Types.ObjectId(req.user.communityId);
    } else {
      return res.status(403).json({ message: "Invalid Request!" });
    }
    query.isDeleted = false;

    const users = await User.aggregate([
      { $match: query },
      { $project: { password: 0 } },
      {
        $facet: {
          data: [{ $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
          count: [{ $count: "docCount" }]
        }
      }
    ]);
    if (!users[0].data.length) {
      users[0].data = [];
    }
    await User.populate(users[0].data, [{ path: "communityId", select: 'communityName' }]);
    // const users = await User.find(query)
    //   .populate('communityId', 'communityName')
    //   .select('-password').lean();
    res.json(users);
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};

module.exports.getAllMentorsToAssign = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.accessAllMentors ||
    req.user.level.isAdmin)) ||
    req.user.isCommunityAdmin) {

    const users = await User.find({ _id: { $ne: req.user._id }, isMentor: true, isApproved: true, isVerified: true, communityId: req.body.communityId, isDeleted: false, isBlocked: false })
      .select('nickName email').lean();

    if (users.length < 1) {
      return res.json(users);
    }

    for (let i = 0; i < users.length; i++) {
      const count = await UserMentorSettings.find({ "mentor.mentorId": users[i]._id }).countDocuments();
      users[i].assignedToNoOfUser = count;
    }
    res.json(users);
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};

module.exports.blockUser = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.blockUser || req.user.level.isAdmin)) || req.user.isCommunityAdmin) {
    const user = await User.findByIdAndUpdate(req.params.userId, { $set: { isBlocked: req.body.setBlocked } }, { new: true })

    if (!user) {
      return res.status(400).json({ message: 'User not found!' });
    }

    return res.json({ message: "User Blocked!" });
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};

module.exports.approvedUser = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.approveUser || req.user.level.isAdmin)) || req.user.isCommunityAdmin) {
    const user = await User.findByIdAndUpdate(req.params.userId, { $set: { isApproved: req.body.setApproved } }, { new: true })

    if (!user) {
      return res.status(400).json({ message: 'User not found!' });
    }

    return res.json({ message: "Approved User!" });
  } else {
    res.status(403).json({ message: "Access Denied!" })
  }

};




module.exports.assignMentorToUser = async (req, res) => {
  if ((req.user.level && (req.user.level.userOption.mentorAssignment || req.user.level.isAdmin)) || req.user.isCommunityAdmin) {
    let previousSettings;
    // console.log('user: ', req.body.user.userId)
    const userAndMentorSettings = await UserMentorSettings.findOne({ "user.userId": req.body.user.userId });
    previousSettings = userAndMentorSettings;
    // console.log("previous Settings", previousSettings)
    let asigningDate = new Date();
    let id = mongoose.Types.ObjectId();
    if (!userAndMentorSettings) {
      const userAndMentorSetting = await UserMentorSettings.create({
        user: req.body.user,
        mentor: req.body.mentor
      })
      const userSetting = await userAndMentorSetting.save();
      // console.log("User Settings", userSetting)
      if (userSetting) {
        const room = await ChatRoom.create({
          participants: [{ participant: req.body.user.userId }, { participant: req.body.mentor.mentorId }],
          lastMessage: { _id: id, sentAt: asigningDate, body: " Welcome from Kahf Chat. You have been assigned a community Mentor to ask your questions and share your thoughts anonymously" },
          createdAt: asigningDate
        })
        await ChatRoomMessages.create({
          chatRoomId: room._id,
          messages: [{ _id: id, sentAt: asigningDate, body: " Welcome from Kahf Chat. You have been assigned a community Mentor to ask your questions and share your thoughts anonymously" }]
        })
      }
      try {
        let data = { userId: req.body.user.userId, message: "A new mentor has been assigned to you!", title: "Mentor Assign", payload: { "key": "value" } }
        fcmHelper.sendPushNotification(data);
        data = { userId: req.body.mentor.mentorId, message: "A new user has been assigned to you!", title: "User Assign", payload: { "key": "value" } }
        fcmHelper.sendPushNotification(data);
      } catch (ex) {
        res.json({ message: ex.message });
      }
      return res.json({ message: "Mentor Assigned to User!" });
    }

    // here need to add transactions for below logic
    const cr = await ChatRoom.updateMany({
      $and: [
        {
          participants: {
            $elemMatch: {
              participant: mongoose.Types.ObjectId(req.body.user.userId),
              // participant: mongoose.Types.ObjectId(previousSettings.mentor.mentorId)
            }
          }
        },
        { $or: [{ isCommunityGroup: false }, { isCommunityGroup: { $exists: false } }] }
      ]

    }, {
      $set: {
        isDisabled: true
      }
    });

    userAndMentorSettings.mentor = req.body.mentor;
    await userAndMentorSettings.save();

    const newRoom = await ChatRoom.create({
      participants: [{ participant: req.body.user.userId }, { participant: req.body.mentor.mentorId }],
      lastMessage: { _id: id, sentAt: asigningDate, body: " Welcome from Kahf Chat. You have been assigned a community Mentor to ask your questions and share your thoughts anonymously" },
      createdAt: asigningDate
    })
    await ChatRoomMessages.create({
      chatRoomId: newRoom._id,
      messages: [{ _id: id, sentAt: asigningDate, body: " Welcome from Kahf Chat. You have been assigned a community Mentor to ask your questions and share your thoughts anonymously" }]
    })
    try {
      let data = { userId: req.body.user.userId, message: "A new mentor has been assigned to you!", title: "Mentor Assign", payload: { "key": "value" } }
      fcmHelper.sendPushNotification(data);
      data = { userId: req.body.mentor.mentorId, message: "A new user has been assigned to you!", title: "User Assign", payload: { "key": "value" } }
      fcmHelper.sendPushNotification(data);
    } catch (ex) {
      res.json({ message: ex.message });
    }
    return res.json({ message: "Mentor Updated!" })
  } else {
    res.status(403).json({ message: "Invalid Request!" });
  }

};

module.exports.getAllUsersAssignToMentor = async (req, res) => {

  const users = await UserMentorSettings.find({ "mentor.mentorId": req.body.mentorId })
    .select('user')

  if (users.length < 1) {
    return res.status(404).json({ message: 'User not found!' });
  }

  res.json(users);
};

module.exports.verificationEmail = async (req, res) => {
  const token = jwt.sign({
    _id: req.user._id
  }, config.get('jwtSecretKey'), {
    expiresIn: '2h'
  })
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(400).json({ message: "User not found.!" });
  }
  // console.log(req.user);
  // console.log(token)
  let data = {
    email: user.email, output: `<html><body>Hello <strong>${user.nickName}!</strong><br><br> Welcome to Kahf chat - Chat Anonymously with Anonymous Community Mentor.
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
    <br></body></html>
    ` };
  coreHelper.sendEmail(data);
  res.json({ message: "Verification Email Sent!" })
};

module.exports.verifyUser = async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.body.token, config.get('jwtSecretKey'));
    const user = await User.findById(decodedToken._id).select('-password');
    // console.log(user)
    if (!user) {
      return res.status(400).json({ message: 'User Not Found!' });
    }
    if (user.isVerified) {
      return res.json({ message: 'Your account is already verified!', status: true });
    }
    user.isVerified = true;
    const saveUser = await user.save();

    // const community = await Community.findById(user.communityId);
    // console.log(community)
    // if (user.age >= community.ageLimit) {
    //   user.isVerified = true;
    //   user.isApproved = true;
    // }
    // else {
    //   user.isVerified = true;
    // }
    // await user.save();
    let msgId = mongoose.Types.ObjectId();
    if (user.isCommonUser) {
      const settings = await UserMentorSettings.findOne({ 'user.userId': saveUser._id });
      if (!settings) {
        const mentor = await User.aggregate([{ $match: { communityId: mongoose.Types.ObjectId(user.communityId), isMentor: true, isApproved: true, isVerified: true, isBlocked: false, isDeleted: false } },
        { $project: { _id: 1, email: 1, gender: 1 } },
        {
          $lookup: {
            from: 'user-mentor-settings',
            localField: '_id',
            foreignField: 'mentor.mentorId',
            as: "mentorData"
          }
        },
        { $project: { _id: 1, email: 1, gender: 1, userCountByMentor: { $size: "$mentorData" } } },
        { $sort: { userCountByMentor: 1 } },
          // { $limit: 1 }
        ]);
        // console.log(mentor)
        // console.log(saveUser.gender)


        if (mentor.length >= 1) {
          let query = {};
          let filterMentor = await mentor.find(mentor => {
            return mentor.gender == saveUser.gender;
          });
          // console.log(filterMentor)
          if (filterMentor) {
            let userMentor = { user: { userId: saveUser._id, email: saveUser.email }, mentor: { mentorId: filterMentor._id, email: filterMentor.email } }
            Object.assign(query, userMentor)
            // console.log("Assign Mentor Query:" + query)
          } else {
            let userMentor = { user: { userId: saveUser._id, email: saveUser.email }, mentor: { mentorId: mentor[0]._id, email: mentor[0].email } }
            Object.assign(query, userMentor)
            // console.log("Mentor Query:" + query)
          }
          // console.log(query)
          const assignMentor = await UserMentorSettings.create(query);
          if (assignMentor) {
            let assigningDate = new Date();
            const room = await ChatRoom.create({
              participants: [{ participant: query.user.userId }, { participant: query.mentor.mentorId }],
              lastMessage: { _id: msgId, sentAt: assigningDate, body: " Welcome from Kahf Chat. You have been assigned a community Mentor to ask your questions and share your thoughts anonymously" },
              createdAt: assigningDate
            })
            const savedRoom = await room.save();
            const roomMessages = await ChatRoomMessages.create({
              chatRoomId: savedRoom._id,
              messages: [{ _id: msgId, sentAt: assigningDate, body: " Welcome from Kahf Chat. You have been assigned a community Mentor to ask your questions and share your thoughts anonymously" }]
            })
            await roomMessages.save();
          }
        }
      }
    } else if (user.isMentor) {
      const chatR = await ChatRoom.findOne({ community: user.communityId, isCommunityGroup: true }).select('participants');
      if (!chatR) {
        let gcDate = new Date();
        const group = await ChatRoom.create({
          participants: [{ participant: saveUser._id }],
          isCommunityGroup: true,
          community: user.communityId,
          lastMessage: { _id: msgId, sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." },
          createdAt: gcDate
        })
        const savedGroup = await group.save();
        const groupMessages = await ChatRoomMessages.create({
          chatRoomId: savedGroup._id,
          messages: [{ _id: msgId, sentAt: gcDate, body: " Welcome to Mentor’s Kahf Group chat." }]
        })
      } else {
        if (!chatR.participants.find(p => p.participant.equals(saveUser._id))) {
          chatR.participants.push({ participant: saveUser._id });
          await chatR.save();
        }
      }
    } else if (user.isForumMentor) {
      const chatR = await ChatRoom.findOne({ community: user.communityId, isForumGroup: true }).select('participants');
      if (!chatR) {
        let gcDate = new Date();
        const group = await ChatRoom.create({
          participants: [{ participant: saveUser._id }],
          isForumGroup: true,
          community: user.communityId,
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
        if (!chatR.participants.find(p => p.participant.equals(saveUser._id))) {
          chatR.participants.push({ participant: saveUser._id });
          await chatR.save();
        }
      }
    }
    res.json({ message: "User Verified!" });

  } catch (error) {
    res.status(401).json({ message: 'Invalid Token!' });
  }
};

module.exports.registerFcmToken = async (req, res) => {
  // console.log(mongoose.Types.ObjectId.isValid(req.user._id))
  const user = await FcmToken.findOne({ user: mongoose.Types.ObjectId(req.user._id) });
  // , { $push: { tokens: { $each: [req.body.token], $position: 0 } } }
  if (!user) {
    const user = await FcmToken.create({
      user: req.user._id,
      token: req.body.token
    });
    await user.save();
    return res.json({ message: "Success!" });
  }
  user.token = req.body.token;
  // let filtertoken = await user.tokens.find(user => {
  //   // console.log(user.token)
  //   // console.log(req.body.token)
  //   return user.token === req.body.token
  // });
  // if (!filtertoken) {
  // user.tokens.push({ token: req.body.token })
  await user.save()
  // }
  res.json({ message: 'Success!', status: true });
};

module.exports.removeFcmToken = async (req, res) => {

  const user = await FcmToken.updateOne({ user: mongoose.Types.ObjectId(req.user._id) }, {
    $set: {
      token: ''
    }
  });
  // const user = await FcmToken.update(
  //   { user: mongoose.Types.ObjectId(req.body.userId) },
  //   { $pull: { tokens: { token: req.body.token } } },
  //   { upsert: true }
  // );
  // if (!(user.n == 1 && user.nModified == 1)) {
  //   return res.json({ message: "No Token found!" })
  // }
  res.json({ message: ' Token Removed!', status: true });
};

// module.exports.getallfcm = async (req, res) => {
//   const uts = await FcmToken.find()
//   res.json(uts);
// };

module.exports.setMentorLastCheckIn = async (req, res) => {
  if (req.user.isMentor || req.user.isCommunityAdmin) {
    await User.updateOne({ _id: req.user._id }, {
      $set: {
        lastCheckIn: new Date()
      }
    });
    res.json({ message: "Success!", status: true });
  } else {
    res.status(403).json({ message: "Invalid request!", status: false });
  }
};

module.exports.sessionValidation = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).select('-password');
  if (!user) {
    return res.status(400).json({ message: "Account details not found!", status: false });
  }
  const token = jwt.sign({
    _id: user._id,
    name: user.nickName,
    email: user.email,
    isCommonUser: user.isCommonUser,
    isMentor: user.isMentor,
    isSystem: user.isSystem,
    communityId: user.communityId,
    isCommunityAdmin: user.isCommunityAdmin
  }, config.get('jwtSecretKey'), {
    // expiresIn: 604800 // 1 week, 
  });
  res.json({
    data: {
      t: token,
      user: user
    },
    status: true
  });
}