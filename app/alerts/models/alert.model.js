const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    issue_report: {
        type: Boolean
    },
    mentor_switch: {
        type: Boolean
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "communities"
    },
    message: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date
    }

});


const Alert = mongoose.model('alerts', schema);

// function validate(community) {
//     const schema = {
//         communityName: Joi.string().required()
//     };
//     return Joi.validate(community, schema);
// }

// module.exports.validate = validate;
module.exports.Alert = Alert;
