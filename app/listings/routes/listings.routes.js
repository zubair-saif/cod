const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')
const multer = require('multer')

let storage = multer.diskStorage({
    destination: "public/listings/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
let uploadListingImg = multer({ storage: storage }).single('listImg');

router.post('/',
    authMiddleware.Auth,
    uploadListingImg,
    listingsController.create);

router.put('/update/:listingId',
    authMiddleware.Auth,
    uploadListingImg,
    listingsController.updateListing);

router.post('/get/all',
    authMiddleware.Auth,
    listingsController.getAllListings);

router.post('/set/activeOrInactive/:listingId',
    authMiddleware.Auth,
    listingsController.setActiveOrInactive);    

router.post('/block/by/admin/:listingId',
    authMiddleware.Auth,
    listingsController.blockByAdmin); 

router.delete('/:listingId',
    authMiddleware.Auth,
    listingsController.deleteListing);    

router.post('/search',
    authMiddleware.Auth,
    listingsController.searchListing);    


module.exports = router;
