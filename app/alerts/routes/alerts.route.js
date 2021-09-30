const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')


/**
*@swagger
* paths:
*  /api/alert/create:
*   post:
*     tags:
*      - "Alert"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            issue_report:
*              type: boolean 
*            mentor_switch:
*              type: boolean 
*            message:
*              type: string        
*     description: Create Alert
*     responses:
*       '200':
*         description: 'Successfully Created Alert!' 
*/
router.post('/create',
    authMiddleware.Auth,
    alertController.create);


/**
*@swagger
* paths:
*  /api/alert/all:
*   get:
*     tags:
*      - "Alert"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     description: Get All Alerts
*     responses:
*       '200':
*         description: 'Array of Alerts'
*       '400':
*         description: 'No Alert Found!' 
*/

router.post('/all',
    authMiddleware.Auth,
    alertController.getAllAlerts);

/**
*@swagger
* paths:
*  /api/alert/unread/all:
*   get:
*     tags:
*      - "Alert"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     description: Get All UnRead Alerts
*     responses:
*       '200':
*         description: 'Array of Alerts'
*       '400':
*         description: 'No Alert Found!' 
*/
router.get('/unread/all',
    authMiddleware.Auth,
    alertController.getAllUnReadAlerts);

/**
*@swagger
* paths:
*  /api/alert/read/{alertId}:
*   post:
*     tags:
*      - "Alert"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: alertId
*         in: path
*         description: objectId
*         required: true
*     description: Read Alert
*     responses:
*       '200':
*         description: 'Alert Read!'
*       '400':
*         description: 'No Alert Found!' 
*/

router.post('/read/:alertId',
    authMiddleware.Auth,
    alertController.readAlert);

/**
*@swagger
* paths:
*  /api/alert/{alertId}:
*   delete:
*     tags:
*      - "Alert"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: alertId
*         in: path
*         description: objectId
*         required: true
*     description: Delete Alert
*     responses:
*       '200':
*         description: 'Alert Deleted!'
*       '400':
*         description: 'No Alert Found!'
*       '403':
*         description: 'Access denied. No permission to access this!' 
*/

router.delete('/:alertId',
    authMiddleware.Auth,
    alertController.deleteAlert);

router.get('/read/all',
    authMiddleware.Auth,
    alertController.readAllAlert);




module.exports = router;
