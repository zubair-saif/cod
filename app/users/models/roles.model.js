const Joi = require('joi');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    role: {
        type: String,
        required: true
    },
    //need to add page names with boolean type to create and assign permissions on per page of the app
    communityOption: {
        accessAllCommunities: {
            type: Boolean,
            default: false
        },
        editCommunity: {
            type: Boolean,
            default: false
        },
        createCommunity: {
            type: Boolean,
            default: false
        },
        deleteCommunity: {
            type: Boolean,
            default: false
        },
        makeCommunityAdmin: {
            type: Boolean,
            default: false
        },
        setSponsorUrl: {
            type: Boolean,
            default: false
        }
    },
    userOption: {
        blockUser: {
            type: Boolean,
            default: false
        },
        approveUser: {
            type: Boolean,
            default: false
        },
        mentorAssignment: {
            type: Boolean,
            default: false
        },
        accessChatLogs: {
            type: Boolean,
            default: false
        },
        accessAllUser: {
            type: Boolean,
            default: false
        },
        accessAllMentors: {
            type: Boolean,
            default: false
        },
        accessAllCommonUser: {
            type: Boolean,
            default: false
        }
    },
    alertOption: {
        accessAllAlerts: {
            type: Boolean,
            default: false
        },
        deleteAlert: {
            type: Boolean,
            default: false
        }
    },
    listingOption: {
        accessAllListings: {
            type: Boolean,
            default: false
        },
        createListing: {
            type: Boolean,
            default: false
        },
        deleteListing: {
            type: Boolean,
            default: false
        },
        blockListing: {
            type: Boolean,
            default:false
        },
        editListing: {
            type: Boolean,
            default:false
        }
    },
    isAdmin: Boolean,
    isCommunityAdmin: {
        type: Boolean
    }
});


const Role = mongoose.model('roles', schema);

function validate(role) {
    const schema = {
        role: Joi.string().required(),
        isAdmin: Joi,
        communityOption: Joi.object(),
        userOption: Joi.object(),
        alertOption: Joi.object(),
        listingOption: Joi.object(),
        isCommunityAdmin: Joi.boolean()
    };
    return Joi.validate(role, schema);
}

module.exports.validate = validate;
module.exports.Role = Role;
