const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')

router.post('/create',
    authMiddleware.Auth,
    postController.create);

router.delete('/:postId',
    authMiddleware.Auth,
    postController.delete);

router.put('/:postId',
    authMiddleware.Auth,
    postController.edit);

router.post('/get/all/of/community',
    authMiddleware.Auth,
    postController.getAllPostsOfCommunity);

router.post('/get/all/mine',
    authMiddleware.Auth,
    postController.getAllPostsOfMine);

router.get('/:postId',
    authMiddleware.Auth,
    postController.getPostDetail);



module.exports = router;
