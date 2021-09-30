const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    note: {
        type: String,
        maxlength: 500
    },
    isShared: {
        type: Boolean
    },
    lastUpdate: {
        type: Date
    },
    createdAt: {
        type: Date
    }
}, { timestamps: { updatedAt: false } });


const Personal_Note = mongoose.model('personal_notes', schema);

module.exports.Personal_Note = Personal_Note;
