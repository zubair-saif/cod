const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    displayMessage: {
        type: String
    },
    terms_conditions: {
        type: String
    }
});


const Setting = mongoose.model('settings', schema);

// function validate(community) {
//     const schema = {
//         communityName: Joi.string().required()
//     };
//     return Joi.validate(community, schema);
// }

// module.exports.validate = validate;
module.exports.Setting = Setting;
