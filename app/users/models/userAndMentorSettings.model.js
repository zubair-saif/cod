const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    user: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    mentor: {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: new Date
    }

});


const UserAndMentorSettings = mongoose.model('user-mentor-settings', schema);

// function validate(role) {
//     const schema = {
//         role: Joi.string().required()
//     };
//     return Joi.validate(role, schema);
// }

// module.exports.validate = validate;
module.exports.UserMentorSettings = UserAndMentorSettings;
