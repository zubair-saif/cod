const postRoutes = require('../routes/post.routes')
const postCommentRoutes = require('../routes/postComment.routes')

module.exports = function (app) {
    app.use('/api/forum/post', postRoutes);
    app.use('/api/forum/post/comment', postCommentRoutes);
}