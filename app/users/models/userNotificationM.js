const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    // tokens: [{
    token: {
        type: String,
        required: true
    }
    // }]
});


const FcmToken = mongoose.model('fcm-tokens', schema);

// function validate(role) {
//     const schema = {
//         role: Joi.string().required(),
//         createCategoryPage:Joi.boolean()
//     };
//     return Joi.validate(role, schema);
// }

// module.exports.validate = validate;
module.exports.FcmToken = FcmToken;
