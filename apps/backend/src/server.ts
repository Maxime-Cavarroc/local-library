import fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const app = fastify();

// Swagger configuration
app.register(swagger, {
  swagger: {
    info: {
      title: 'API Documentation',
      description: 'API documentation for the backend',
      version: '1.0.0',
    },
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});

app.register(swaggerUi, {
  routePrefix: '/docs', // Swagger UI available at http://localhost:3000/docs
});

// Example route
app.get('/example', {
  schema: {
    description: 'Get example data',
    tags: ['Example'],
    response: {
      200: {
        description: 'Successful response',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
}, async () => {
  return { message: 'Hello, Fastify!' };
});

app.get('/protected', {
  schema: {
    description: 'Protected route',
    tags: ['Protected'],
    security: [{ bearerAuth: [] }],
    response: {
      200: { type: 'string' },
    },
  },
}, async (req, reply) => {
  return 'Protected data';
});

// Start the server
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at ${address}`);
  console.log('Swagger documentation is available at http://localhost:3000/docs');
});
