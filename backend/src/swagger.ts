import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const path = require('path');
const { SERVER_URL } = require(path.resolve(__dirname, '../../shared/config'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClassPeek API Documentation',
      version: '1.0.0',
      description: 'API documentation for the ClassPeek application',
    },
    servers: [
      {
        url: SERVER_URL, // Change this to your production URL when deploying
      },
    ],
  },
  apis: ['./routes/*.ts'], // Path to your route files where the Swagger annotations will be added
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
