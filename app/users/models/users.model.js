const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // firstName: {
    //     type: String
    // },
    name: {
        type: String
    },
    nickName: {
        type: String
    },
    gender: {
        type: String,
        // required: true
    },
    age: {
        type: Number,
        // required: true
    },
    bio: {
        type: String
    },
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "communities"
    },
    email: {
        type: String,
        // unique: true,
        trim: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    lev: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles'
    },
    isCommonUser: {
        type: Boolean,
        default: false
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    isMentor: {
        type: Boolean,
        default: false
    },
    isForumMentor: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isCommunityAdmin: {
        type: Boolean,
        default: false
    },
    lastCheckIn: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});
// schema.pre('save', function (next) {
//     if (this.isNew) {
//         if (this.categoriesToWorkIn.length == 0) {
//             this.categoriesToWorkIn = undefined;
//         }
//     }
//     next();
// });
schema.index({ nickName: 'text', email: 'text' }, { name: 'My text index', weights: { nickName: 2, email: 1 } })
const User = mongoose.model('users', schema);



// function validate(user) {
//     const schema = {
//         email: Joi.string().email().required(),
//         password: Joi.string().required(),
//         lev: Joi.objectId()
//     };
//     return Joi.validate(user, schema);
// }



// module.exports.validate = validate;
module.exports.User = User;
