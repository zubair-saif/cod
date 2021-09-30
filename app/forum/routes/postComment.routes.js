const express = require('express');
const router = express.Router();
const postCommentController = require('../controllers/comment.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')


router.post('/create',
    authMiddleware.Auth,
    postCommentController.create);


router.delete('/:commentId',
    authMiddleware.Auth,
    postCommentController.delete);


router.put('/:commentId',
    authMiddleware.Auth,
    postCommentController.edit);


router.post('/get/all/of/post/line',
    authMiddleware.Auth,
    postCommentController.getAllLineCommentsOfPost);


router.post('/get/all/of/post',
    authMiddleware.Auth,
    postCommentController.getAllMainCommentsOfPost);

module.exports = router;
