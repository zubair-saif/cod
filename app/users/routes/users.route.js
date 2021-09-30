const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registrations.controller')
const loginController = require('../controllers/login.controller')
const userController = require('../controllers/users.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')

/**
*@swagger
* paths:
*  /api/user/register:
*   post:
*     tags:
*      - "Users"
*     parameters:
*       - in: body
*         type: object
*         properties:
*            email:
*              type: string
*            bio:
*              type: string
*            gender:
*              type: string
*            age:
*              type: number
*            isCommonUser:
*              type: boolean
*            isMentor:
*              type: boolean
*            password:
*              type: string
*            communityName:
*              type: String         
*         required:
*             - email
*             - password
*             - communityName      
*     description: Register User
*     responses:
*       '200':
*         description: 'Successfully registered!...' 
*/


router.post('/register',
    registerController.register)

router.post('/system/register',
    authMiddleware.Auth,
    authMiddleware.AdminAuth,
    registerController.registerSystemUser)



/**
*@swagger
* paths:
*  /api/user/login:
*   post:
*     description: Login 
*     tags:
*      - "Users"
*     parameters:
*       - in: body
*         type: object
*         properties:
*            email:
*              type: string
*            password:
*              type: string      
*         required:
*             - email
*             - password   
*     responses:
*       '200':
*         description: JSON Token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGFkOGMyYzNkY2Y1MjAwMjBkNjkyYTciLCJlbWFpbCI6ImhhbnphbGEuYnV0dEBnbWFpbC5jb20iLCJpc01lbnRvciI6dHJ1ZSwiaWF0IjoxNTcyMjY5Njc2LCJleHAiOjE1NzI4NzQ0NzZ9.J6lYeihE8bXdTWxJ6viIsQhz2FNZrrNSs-wPzw-Nauw".
*       '400':
*         description: 'Invalid email or password!'        
*/


router.post('/login',
    loginController.login)

router.post('/adminPenal/login',
    loginController.loginAdminPenal)


/**
*@swagger
* paths:
*  /api/user/reset/password:
*   post:
*     description: Reset Password
*     tags:
*      - "Users"
*     parameters:
*       - in: body
*         type: object
*         properties:
*            token:
*              type: string      
*         required:
*             - email
*     responses:
*       '200':
*         description: 'Password is Changed!'
*       '400':
*         description: 'User not Found!'        
*/

router.post('/reset/password',
    userController.resetPassword);


/**
*@swagger
* paths:
*  /api/user/send/reset/password/email:
*   post:
*     description: get reset password email
*     tags:
*      - "Users"
*     parameters:
*       - in: body
*         type: object
*         properties:
*            email:
*              type: string      
*         required:
*             - email
*     responses:
*       '200':
*         description: 'Reset Password Link Sent To Your Eamil Please Check Your Inbox!'
*       '404':
*         description: 'User not Found!'        
*/

router.post('/send/reset/password/email',
    userController.sendResetPassEmail);


/**
*@swagger
* paths:
*  /api/user/verify:
*   post:
*     description: Verify User
*     tags:
*      - "Users"
*     parameters:
*       - in: body
*         type: object
*         properties:
*            token:
*              type: string      
*         required:
*             - token
*     responses:
*       '200':
*         description: 'User Verified!'
*       '400':
*         description: 'Invalid Token!User not found.'        
*/

router.post('/verify',
    userController.verifyUser);

/**
*@swagger
* paths:
*  /api/user/search:
*   post:
*     description: Search User
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         in: body
*         type: object
*         properties:
*            email:
*              type: string
*            userName:
*              type: string      
*     responses:
*       '200':
*         description: 'Array Of Matched Users'
*       '401':
*         description: 'Invalid Token!'
*/

router.post('/admin/update/email/password',
    authMiddleware.Auth,
    userController.changeAdminEmailAndPassword);

router.post('/search',
    authMiddleware.Auth,
    userController.searchUser);

//---------------------------------------------------------------------------------------------------------------------------------//


router.get('/:userId',
    authMiddleware.Auth,
    userController.getUser);

/**
*@swagger
* paths:
*  /api/user/{userId}:
*   put:
*     description: Update User
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: userId
*         in: path
*         description: objectId
*         required: true
*       - in: body
*         type: object
*         properties:
*            bio:
*              type: string
*            age:
*              type: number
*            isCommonUser:
*              type: boolean
*            isMentor:
*              type: boolean
*            communityId:
*              type: objectId
*            gender:
*              type: string
*     responses:
*       '200':
*         description: 'Updated'
*       '401':
*         description: 'Invalid Token!'  
*/

router.put('/:userId',
    authMiddleware.Auth,
    userController.updateUser);

/**
*@swagger
* paths:
*  /api/user/{userId}:
*   delete:
*     description: Delete User
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: userId
*         in: path
*         description: objectId
*         required: true
*     responses:
*       '200':
*         description: 'Deleted'
*       '400':
*         description: 'User not found!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'  
*/

router.delete('/:userId',
    authMiddleware.Auth,
    userController.deleteUser);


/**
*@swagger
* paths:
*  /api/user/get/all:
*   get:
*     description: Get All User
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     responses:
*       '200':
*         description: 'Array of All users'
*       '400':
*         description: 'User not found!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'  
*/

router.get('/get/all',
    authMiddleware.Auth,
    userController.getAllUsers);

/**
*@swagger
* paths:
*  /api/user/all/relatedToCommunity:
*   get:
*     description: Get All User Related to Community
*     tags:
*      - "Users"
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
*              type: objectId
*     responses:
*       '200':
*         description: 'Array of All Communities'
*       '400':
*         description: 'User not found!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'  
*/
router.post('/all/relatedToCommunity',
    authMiddleware.Auth,
    userController.getAllUsersRelatedToCommunity);

/**
*@swagger
* paths:
*  /api/user/all/commonUser:
*   get:
*     description: Get All CommonUser
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     responses:
*       '200':
*         description: 'Array of All Common Users'
*       '400':
*         description: 'User not found!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'  
*/

router.post('/all/commonUser',
    authMiddleware.Auth,
    userController.getAllCommonUsers);


router.post('/all/SystemUser',
    authMiddleware.Auth,
    userController.getAllSystemUsers);


/**
*@swagger
* paths:
*  /api/user/all/mentors:
*   get:
*     description: Get All Mentors
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     responses:
*       '200':
*         description: 'Array Of All Mentors'
*       '400':
*         description: 'User not found!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'  
*/

router.post('/all/mentors',
    authMiddleware.Auth,
    userController.getAllMentors);

router.post('/all/forum/mentors',
    authMiddleware.Auth,
    userController.getAllForumMentors);

router.post('/all/composite/mentors',
    authMiddleware.Auth,
    userController.getAllCompositeMentors);

router.post('/all/mentors/toAssign',
    authMiddleware.Auth,
    userController.getAllMentorsToAssign);


/**
*@swagger
* paths:
*  /api/user/block/{userId}:
*   put:
*     description: Block User
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: userId
*         in: path
*         description: objectId
*         required: true
*       - in: body
*         type: object
*         properties:
*            setBlocked:
*              type: boolean
*     responses:
*       '200':
*         description: 'User Blocked!'    
*       '400':
*         description: 'User not found!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'  
*/


router.put('/block/:userId',
    authMiddleware.Auth,
    userController.blockUser);

/**
*@swagger
* paths:
*  /api/user/approve/{userId}:
*   put:
*     description: Approve User
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: userId
*         in: path
*         description: objectId
*         required: true
*       - in: body
*         type: object
*         properties:
*            setApproved:
*              type: boolean
*     responses:
*       '200':
*         description: 'Approved User!'    
*       '400':
*         description: 'User not found!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'  
*/

router.put('/approve/:userId',
    authMiddleware.Auth,
    userController.approvedUser);


/**
*@swagger
* paths:
*  /api/user/assign/mentor:
*   post:
*     description: Assign Mentor to User
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            user:
*              type: object
*              required: 
*                  - userId    
*                  - email 
*              properties:
*                 userId:
*                   type: objectId    
*                 email:
*                   type: string
*            mentor:
*              type: object
*              required: 
*                  - mentorId    
*                  - email 
*              properties:
*                 mentorId:
*                   type: objectId    
*                 email:
*                   type: string
*     responses:
*       '200':
*         description: 'Mentor Assigned to User!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'    
*/

router.post('/assign/mentor',
    authMiddleware.Auth,
    userController.assignMentorToUser);

/**
*@swagger
* paths:
*  /api/user/get/mentorUsers:
*   post:
*     description: Get All User Related to Mentor
*     tags:
*      - "Users"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*          mentorId:
*             type: objectId      
*     responses:
*       '200':
*         description: 'Mentor Assigned to User!'
*       '401':
*         description: 'Invalid Token!'
*       '403':
*         description: 'Access denied. No permission to access this!'    
*/
router.post('/get/mentorUsers',
    authMiddleware.Auth,
    userController.getAllUsersAssignToMentor);


/**
*@swagger
* paths:
*  /api/user/fcm/token:
*   post:
*     description: Register FCM Token
*     tags:
*      - "Notification"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*          token:
*              type: string
*     responses:
*       '200':
*         description: 'Successfull!...'
*       '401':
*         description: 'Invalid Token!'
*/
router.post('/fcm/token',
    authMiddleware.Auth,
    userController.registerFcmToken);

// router.get('/fcm/token/all',
//     userController.getallfcm);


/**
*@swagger
* paths:
*  /api/user/fcm/token:
*   delete:
*     description: Delete FCM Token
*     tags:
*      - "Notification"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*          token:
*             type: string
*          userId:
*             type: objectId      
*     responses:
*       '200':
*         description: 'Removed Token!'
*       '401':
*         description: 'Invalid Token!'
*/
router.delete('/fcm/token',
    authMiddleware.Auth,
    userController.removeFcmToken);

/**
*@swagger
* paths:
*  /api/user/change/Password:
*   post:
*     description: Change Password
*     tags:
*      - "Users"
*     parameters:
*      - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*      -  in: body
*         type: object
*         properties:
*            newPassword:
*              type: string
*            oldPassword:
*              type: string      
*         required:
*             - newPassword
*             - oldPassword

*     responses:
*       '200':
*         description: 'Password is Changed!'
*       '404':
*         description: 'User not Found!'        
*/

router.post('/change/Password',
    authMiddleware.Auth,
    userController.changePassword);

/**
*@swagger
* paths:
*  /api/user/email/verification:
*   get:
*     description: Email Verification
*     tags:
*      - "Users"
*     parameters:
*      - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     responses:
*       '200':
*         description: 'Verification Email Sent!'
*       '400':
*         description: 'User not Found!'        
*/

router.get('/email/verification',
    authMiddleware.Auth,
    userController.verificationEmail);

router.get('/set/mentor/lastCheckIn',
    authMiddleware.Auth,
    userController.setMentorLastCheckIn);

router.get('/session/validate',
    authMiddleware.Auth,
    userController.sessionValidation);

module.exports = router;
