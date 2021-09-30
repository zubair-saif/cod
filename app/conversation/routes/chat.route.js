const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoom.controller')
const chatRoomMessagesController = require('../controllers/chatRoomMessages.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')

// router.post('/get/room/messages',
//     authMiddleware.Auth,
// chatRoomController.getchatRoomMessages)

/**
*@swagger
* paths:
*  /api/chat/get/rooms:
*   get:
*     description: Get ChatRooms
*     tags:
*      - "Conversation"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*     responses:
*       '200':
*         description: 'Array of Chat Rooms'
*       '401':
*         description: 'Invalid Token!'
*/
router.post('/get/rooms',
    authMiddleware.Auth,
    chatRoomController.getchatRooms)

router.post('/get/rooms/of/users/for/superRights',
    authMiddleware.Auth,
    chatRoomController.getchatRoomsForSuperRights)

/**
*@swagger
* paths:
*  /api/chat/room/{chatRoomId}:
*   delete:
*     description: Delete Conversation
*     tags:
*      - "Conversation"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: chatRoomId
*         in: path
*         description: objectId
*         required: true
*     responses:
*       '200':
*         description: 'Conversation Deleted!...'
*       '400':
*         description: 'ChatRoom Not Found!'
*       '401':
*         description: 'Invalid Token!'
*/

router.delete('/room/:chatRoomId',
    authMiddleware.Auth,
    chatRoomController.deleteChat);


/**
*@swagger
* paths:
*  /api/chat/get/room/messages:
*   post:
*     description: Get ChatRoom Messages
*     tags:
*      - "Conversation"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            chatRoomId:
*              type: objectId
*            page:
*              type: number
*            numOfMessages:
*              type: number
*     responses:
*       '200':
*         description: 'Messages Array'
*       '401':
*         description: 'Invalid Token!'
*/

router.post('/get/room/messages',
    authMiddleware.Auth,
    chatRoomMessagesController.getMessagesAgainstChatRoomId)

/**
*@swagger
* paths:
*  /api/chat/delete/room/message:
*   delete:
*     description: Delete ChatRoom Message
*     tags:
*      - "Conversation"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            chatRoomId:
*              type: objectId
*            messageId:
*              type: objectId
*     responses:
*       '200':
*         description: 'Successfully removed the ChatRoom Message!'
*       '400':
*         description: 'ChatRoom Not Found!'
*       '401':
*         description: 'Invalid Token!'
*/

router.delete('/delete/room/message',
    authMiddleware.Auth,
    chatRoomMessagesController.deleteMessage)

/**
*@swagger
* paths:
*  /api/chat/update/room/message:
*   put:
*     description: Update ChatRoom Message
*     tags:
*      - "Conversation"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - in: body
*         type: object
*         properties:
*            chatRoomId:
*              type: objectId
*            message:
*              type: object
*              properties:
*                 _id:
*                   type: objectId
*                 body:
*                   type: string
*     responses:
*       '200':
*         description: 'Successfully Update the ChatRoom Message!'
*       '401':
*         description: 'Invalid Token!'
*/

router.put('/update/room/message',
    authMiddleware.Auth,
    chatRoomMessagesController.updateMessage)

/**
*@swagger
* paths:
*  /api/chat/participant/nickName/{chatRoomId}:
*   put:
*     description: Add Participant NickName
*     tags:
*      - "Conversation"
*     parameters:
*       - 
*         name: auth-token
*         in: header
*         type: string
*         required: true
*       - 
*         name: chatRoomId
*         in: path
*         description: objectId
*         required: true
*       - in: body
*         type: object
*         properties:
*            participantId:
*              type: objectId
*            nickName:
*              type: string
*     responses:
*       '200':
*         description: 'Successfully Update the Participant NickName!'
*       '401':
*         description: 'Invalid Token!'
*/

router.put('/participant/nickName/:chatRoomId',
    authMiddleware.Auth,
    chatRoomController.assignNickName)

router.get('/community/group',
    authMiddleware.Auth,
    chatRoomController.getCommunityGroup)

router.get('/forum/group',
    authMiddleware.Auth,
    chatRoomController.getForumGroup)


module.exports = router;
