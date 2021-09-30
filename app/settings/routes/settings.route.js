const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settings.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')



router.post('/update',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    settingController.updateSettings);

router.get('/all',
    authMiddleware.Auth,
    settingController.getSettings);

/**
*@swagger
* paths:
*  /api/settings/terms&conditions:
*   get:
*     tags:
*      - "Settings"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     description: Get Terms & Conditions
*     responses:
*       '200':
*         description: 'Terms & Conditions Data'
*/

router.get('/terms&conditions',
    settingController.getTermsConditions);


module.exports = router;
