const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'communities',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date
    }

});

const CommunityAdmin = mongoose.model('communities-admins', schema);

// function validate(community) {
//     const schema = {
//         communityId: Joi.ObjectId().required()
//     };
//     return Joi.validate(community, schema);
// }

// module.exports.validate = validate;
module.exports.CommunityAdmin = CommunityAdmin;
