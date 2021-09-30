const userRoute = require('../routes/users.route')
const rolesRoute = require('../routes/roles.route')


module.exports = function (app) {
    app.use('/api/user', userRoute);
    app.use('/api/roles', rolesRoute);
}