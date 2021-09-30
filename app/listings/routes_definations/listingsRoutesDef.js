const listignsRoute = require('../routes/listings.routes')

module.exports = function (app) {
    app.use('/api/listings', listignsRoute);

}