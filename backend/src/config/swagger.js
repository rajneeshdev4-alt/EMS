const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Expense Management API',
      version: '1.0.0',
      description: 'REST API for the Expense Management System',
    },
    servers: [
      { url: '/api/v1', description: 'API base' },
      { url: `http://localhost:${env.port}/api/v1`, description: 'Local' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
    },
  },
  apis: ['src/modules/**/*.routes.js'],
};

module.exports = swaggerJsdoc(options);