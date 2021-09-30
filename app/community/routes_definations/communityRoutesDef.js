const communityRoute = require('../routes/communities.route')

module.exports = function (app) {
    app.use('/api/community', communityRoute);

}