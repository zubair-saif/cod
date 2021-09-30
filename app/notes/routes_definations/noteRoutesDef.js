const noteRoutes = require('../routes/note.routes')

module.exports = function (app) {
    app.use('/api/note', noteRoutes);

}