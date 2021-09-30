const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    name: {
        type: String
    },
    description: {
        type: String
    },
    address: {
        type: String
    },
    isActive: {
        type: Boolean,
        default:true
    },
    blockByAdmin: {
        type: Boolean,
        default:false
    },
    image: {
        type: String
    },
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "communities",
        required:true
    },
    website: {
        type:String
    },
    phone: {
        type:Number
    },
    fbPage: {
        type:String
    }
},{timestamps:true});

schema.index({ name: 'text', address: 'text' }, { name: 'listingIndex', weights: { name: 1, address: 1 } });
const Listings = mongoose.model('listings', schema);

module.exports.Listings = Listings;
