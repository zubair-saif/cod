const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

module.exports = function (app) {
    const swaggerOptions = {
        swaggerDefinition: {
            info: {
                title: "KahfChat Api",
                description: "KahfChat Api Documentation",
                contact: {
                    name: "KahfChat"
                },
                servers: [
                    {
                        "url": "http://localhost:2000",
                        "description": "Development server"
                    },
                    {
                        "url": "http://140.82.50.108:2000",
                        "description": "Production server"
                    }
                ],
            }
        },
        apis: [
            'app/users/routes/*.js',
            'app/users/routes/roles.route.js',
            'app/community/routes/communities.route.js',
            'app/alerts/routes/alerts.route.js',
            'app/conversation/routes/chat.route.js',
            'app/settings/routes/settings.route.js'
        ]
    }
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

}