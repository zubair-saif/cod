//core imports
const mongoose = require('mongoose');
const fs = require('fs');
//custom imports
const { Listings } = require('../models/listings.model');

module.exports.create = async (req, res) => {
    console.log(req.body)
    if ((req.user.level && (req.user.level.isAdmin || req.user.level.listingOption.createListing)) || req.user.isCommunityAdmin ) {
        
        const listing = await Listings.create({ 
            name: req.body.name,
            description: req.body.description,
            address: req.body.address,
            image: (req.file && req.file.path)?req.file.path:undefined,
            communityId: (req.user.isCommunityAdmin) ? req.user.communityId : req.body.communityId,
            website: req.body.website,
            phone: req.body.phone,
            fbPage:req.body.fbPage
        });
        await listing.save();
        res.json({ message: 'Success!', status: true });    
    } else {
        res.status(403).json({ message: "Access Denied" })
    }
    
}

module.exports.updateListing = async (req, res) => {
    if ((req.user.level && (req.user.level.isAdmin || req.user.level.listingOption.editListing)) || req.user.isCommunityAdmin) {
        let query = {};
        if (req.user.isCommunityAdmin) {
            query.communityId = mongoose.Types.ObjectId(req.user.communityId);
            query._id = mongoose.Types.ObjectId(req.params.listingId);
        } else if(req.user.level && (req.user.level.isAdmin || req.user.level.listingOption.editListing)) {
            query._id = mongoose.Types.ObjectId(req.params.listingId);
        }
        const listing = await Listings.findById(query);
        if (!listing) {
            return res.status(200).json({message:"No listing Found!",status:false})
        }
        if (req.file && listing && listing.image) {
            fs.unlink(listing.image, function (err) {
              if (err) throw err;
            });
        }
        // console.log(req.body)
        listing.name = req.body.name;
        listing.description = req.body.description;
        listing.address = req.body.address;
        listing.image = (req.file && req.file.path) ? req.file.path : listing.image;
        listing.website = req.body.website;
        listing.phone = (req.body.phone && req.body.phone != "undefined" )?req.body.phone:0;
        listing.fbPage = req.body.fbPage;
        await listing.save();
        res.json({ message: 'Success!', status: true });    
    } else {
        res.status(403).json({ message: "Access Denied" })
    }
}

module.exports.getAllListings = async (req, res) => {
    if ((req.user.level && (req.user.level.isAdmin || req.user.level.listingOption.accessAllListings)) || req.user.isCommunityAdmin
        || req.user.isCommonUser || req.user.isMentor ) {
        const currentpage = (req.body.currPage) ? req.body.currPage : 1;
        const numOfItems = (req.body.numOfItems) ? req.body.numOfItems : 20;
        // console.log(currentpage)
        let query = {};
        if (req.user.isCommunityAdmin || req.user.isCommonUser || req.user.isMentor) {
        query.communityId = mongoose.Types.ObjectId(req.user.communityId);
        }
    // console.log(query)
        const listings = await Listings.aggregate([
            { $match: query },
            {
                $facet: {
                    data: [{ $sort: { createdAt: -1 } }, { $skip: ((currentpage - 1) * numOfItems) }, { $limit: numOfItems }],
                    count: [{ $count: "docCount" }]
                }
            }
        ]);
        if (listings.length < 0) {
            return res.status(200).json({status:false, message: "No Listing Found!" });
        }
        await Listings.populate(listings[0].data, [{ path: "communityId", select: 'communityName communityCode' }])
        res.json({ status: true, data: listings });
    } else {
        res.status(403).json({ message: "Access Denied!" });
    }
}


module.exports.setActiveOrInactive = async (req, res) => {
    if (req.user.isCommunityAdmin) {
        const listing = await Listings.findOne({ _id: req.params.listingId });
        if (listing.blockByAdmin) {
            return res.status(200).json({status:false,message:'Listing is blocked by admin.Kindly contact Admin to Active Or InActive this Listing!'})
        }
        listing.isActive = req.body.isActive;
        await listing.save();
        res.json({ status: true, message: "Success!" });
    } else {
        res.status(403).json({ message: "Access Denied!" });
    }
}

module.exports.blockByAdmin = async (req, res) => {
    // console.log(req.user)
    if(req.user.level && (req.user.level.isAdmin || req.user.level.listingOption.blockListing)){
        const listing = await Listings.findOneAndUpdate({ _id: req.params.listingId },{$set:{ blockByAdmin: req.body.setBlock}});
        res.json({ status: true, message: "Success!" });
    } else {
        res.status(403).json({ message: "Access Denied!" });
    }
}


module.exports.deleteListing = async (req, res) => {
    if ((req.user.level && (req.user.level.isAdmin || req.user.level.listingOption.deleteListing)) || req.user.isCommunityAdmin) {
        let query = {};
        if (req.user.isCommunityAdmin) {
            query.communityId = mongoose.Types.ObjectId(req.user.communityId);
            query._id = mongoose.Types.ObjectId(req.params.listingId);
        } else if(req.user.level && (req.user.level.isAdmin || req.user.level.listingOption.deleteListing)) {
            query._id = mongoose.Types.ObjectId(req.params.listingId);
        }
    // console.log(query)
        const listing = await Listings.findOneAndRemove(query);
        // console.log(listing);
        try {
            if (listing && listing.image) {
                fs.unlink(listing.image, function (err) {
                  if (err) throw err;
                });
              }
            res.json({ status: true, message: "Success!" });            
        } catch (error) {
            return res.status(400).json({status:false,message:error.message})
        }

    } else {
        res.status(403).json({ message: "Access Denied!" });
    }
}


module.exports.searchListing = async (req, res) => {
    // console.log(req.body)
    // console.log(req.user)
    let query = {};

    if (!(req.user.level && (req.user.level.isAdmin || req.user.level.isSystem))) {
        query.communityId = req.user.communityId;
    }
    if (req.body.isActive == true || req.body.isActive == false) {
        query.isActive = req.body.isActive;
    }
    if (req.body.blockByAdmin == true || req.body.blockByAdmin == false) {
        query.blockByAdmin = req.body.blockByAdmin;
    }
    
    if (req.body.search) {
        query.$text = { $search: req.body.search };
       // query.name = { $regex: '^' + req.body.search, $options: 'i' }
        // query.address = { $regex: '^' + req.body.search, $options: 'i' } 
    }
    // console.log(query)
    const listings = await Listings.find(query, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).populate('communityId',"communityName communityCode")
    // const listings = await Listings.find(query).populate('communityId',"communityName communityCode")
    res.json({status:true,data:listings});
  };
  