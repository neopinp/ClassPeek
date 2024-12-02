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
      description: 'API documentation for the ClassPeek application. This API is used to fetch and manage data for the ClassPeek application. These go from getting the courses, subjects, majors, and professors of an institution, to managing the students registered and various comments and ratings associated with accounts and pages.',
    },
    servers: [
      {
        url: SERVER_URL, // Change this to your production URL when deploying
      },
    ],
  },
  apis: [
          path.join(__dirname, './routes/*.ts'), // Development
          path.join(__dirname, './routes/*.js'), // Production
    ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
