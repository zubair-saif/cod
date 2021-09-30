const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')

/**
*@swagger
* paths:
*  /api/roles:
*   post:
*     description: Create Role
*     tags:
*      - "Roles"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*          role:
*             type: string
*          isAdmin:
*             type: boolean
*          communityOption:
*             type: object
*             properties:
*                accessAllCommunities:
*                   type: boolean
*                editCommuity:
*                   type: boolean
*                deleteCommunity:
*                   type: boolean
*                makeCommunityAdmin:
*                   type: boolean
*          userOption:
*             type: object
*             properties:
*                blockUser:
*                   type: boolean
*                approveUser:
*                   type: boolean
*                mentorAssignment:
*                   type: boolean
*                accessAllUser:
*                   type: boolean
*                accessAllMentors:
*                   type: boolean
*                accessAllCommonUser:
*                   type: boolean
*          alertOption:
*             type: object
*             properties:
*                accessAllAlerts:
*                   type: boolean
*                deleteAlert:
*                   type: boolean
*     responses:
*       '200':
*         description: 'succeed'    
*/
router.post('/',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    rolesController.createRole)


/**
*@swagger
* paths:
*  /api/roles/{roleId}:
*   put:
*     description: Create Role
*     tags:
*      - "Roles"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: roleId
*         in: path
*         description: objectId
*         required: true
*       - in: body
*         type: object
*         properties:
*          role:
*             type: string
*          isAdmin:
*             type: boolean
*          communityOption:
*             type: object
*             properties:
*                accessAllCommunities:
*                   type: boolean
*                editCommuity:
*                   type: boolean
*                deleteCommunity:
*                   type: boolean
*                makeCommunityAdmin:
*                   type: boolean
*          userOption:
*             type: object
*             properties:
*                blockUser:
*                   type: boolean
*                approveUser:
*                   type: boolean
*                mentorAssignment:
*                   type: boolean
*                accessAllUser:
*                   type: boolean
*                accessAllMentors:
*                   type: boolean
*                accessAllCommonUser:
*                   type: boolean
*          alertOption:
*             type: object
*             properties:
*                accessAllAlerts:
*                   type: boolean
*                deleteAlert:
*                   type: boolean
*     responses:
*       '200':
*         description: 'Upated'    
*/
router.put('/:roleId',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    rolesController.updateRole)

router.put('/user/update/:userId',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    rolesController.updateSystemUserRole)    

router.get('/:roleId',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    rolesController.getRole)

router.get('/get/all',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    rolesController.getAllRoles)
    
router.delete('/:roleId',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    rolesController.deleteRole)    

module.exports = router;
