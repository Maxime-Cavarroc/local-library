import fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { setupDatabase } from './db/setup';
import { seedAdmin } from './db/seed';

async function startServer() {
  // Initialize the database
  setupDatabase();
  await seedAdmin();

  // Initialize Fastify server
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

  app.get('/', async () => {
    return { message: 'Server is running!' };
  });

  app.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server is running at ${address}`);
    console.log('Swagger documentation is available at http://localhost:3000/docs');
  });
}

startServer();
