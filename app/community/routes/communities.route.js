const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communities.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')


/**
*@swagger
* paths:
*  /api/community:
*   post:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            communityName:
*              type: string        
*            ageLimit:
*              type: number        
*         required:
*             - communityName
*     description: Create Community
*     responses:
*       '200':
*         description: 'Successfully Created Community!' 
*/
router.post('/',
    authMiddleware.Auth,
    // authMiddleware.AdminAuth,
    communityController.create);


/**
*@swagger
* paths:
*  /api/community/update/{communityId}:
*   put:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: communityId
*         in: path
*         description: objectId
*         required: true
*       - in: body
*         type: object
*         properties:
*            communityName:
*              type: string
*            ageLimit:
*              type: number        
*     description: Update Community
*     responses:
*       '200':
*         description: 'Updated!' 
*       '401':
*         description: 'Invalid Token!'
*/

router.put('/update/:communityId',
    authMiddleware.Auth,
    communityController.updateCommunity);

router.put('/update/sponsorUrl/:communityId',
    authMiddleware.Auth,
    communityController.updateSponsorUrl);

/**
*@swagger
* paths:
*  /api/community/search:
*   post:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            communityName:
*              type: string
*            communityCode:
*              type: string        
*     description: Search Community
*     responses:
*       '200':
*         description: 'Array of Community that matches!' 
*       '401':
*         description: 'Invalid Token!'
*/

router.post('/search',
    authMiddleware.Auth,
    communityController.searchCommunity);


/**
*@swagger
* paths:
*  /api/community/all:
*   get:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     description: Get All Communities
*     responses:
*       '200':
*         description: 'Array of Communities'
*       '400':
*         description: 'No Community Found!' 
*/
router.post('/all',
    authMiddleware.Auth,
    communityController.getAllCommunities);

/**
*@swagger
* paths:
*  /api/community/{communityId}:
*   delete:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: communityId
*         in: path
*         description: objectId
*         required: true
*     description: Delete Community
*     responses:
*       '200':
*         description: 'Community Deleted!'
*       '400':
*         description: 'No Community Found!' 
*/

router.delete('/:communityId',
    authMiddleware.Auth,
    communityController.deleteCommunity);


/**
*@swagger
* paths:
*  /api/community/make/admin:
*   post:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            communityId:
*              type: ObjectId
*            userId:
*              type: ObjectId        
*     description: Make any user Community Admin
*     responses:
*       '200':
*         description: 'Successfully Make Community Admin!'
*/

router.post('/make/admin',
    authMiddleware.Auth,
    communityController.makeCommunityAdmin);

/**
*@swagger
* paths:
*  /api/community/remove/admin:
*   post:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            communityId:
*              type: ObjectId
*            userId:
*              type: ObjectId        
*     description: Remove any Community Admin
*     responses:
*       '200':
*         description: 'Admin Removed!'
*/


router.post('/remove/admin',
    authMiddleware.Auth,
    // authMiddleware.AdminAuth,
    communityController.removeCommunityAdmin);

router.put('/update/data/:communityId',
    authMiddleware.Auth,
    communityController.updateCommunityData);

/**
*@swagger
* paths:
*  /api/community/one/{communityId}:
*   get:
*     tags:
*      - "Community"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     description: Get community data containing community name and welcome message
*     responses:
*       '200':
*         description: 'Community Data'
*/


router.get('/one/:communityId',
    authMiddleware.Auth,
    communityController.getCommunity);


router.put('/allow/user/for/forum/:communityId',
    authMiddleware.Auth,
    communityController.allowCommonUsersToForum);


router.put('/disallow/user/for/forum/:communityId',
    authMiddleware.Auth,
    communityController.disallowCommonUsersToForum);


module.exports = router;
