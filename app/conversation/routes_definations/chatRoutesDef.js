const chatRoutes = require('../routes/chat.route');


module.exports = function (app) {
    app.use('/api/chat', chatRoutes);
}