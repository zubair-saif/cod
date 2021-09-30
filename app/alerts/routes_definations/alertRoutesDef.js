const alertRoute = require('../routes/alerts.route')

module.exports = function (app) {
    app.use('/api/alert', alertRoute);

}