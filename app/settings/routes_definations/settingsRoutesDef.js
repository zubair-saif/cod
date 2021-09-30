const settingsRoute = require('../routes/settings.route')

module.exports = function (app) {
    app.use('/api/settings', settingsRoute);

}