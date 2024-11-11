import dotenv from 'dotenv';

// Load .env variables globally
dotenv.config();

import fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import corsPlugin from './plugins/cors'; // CORS plugin
import { setupDatabase } from './db/setup'; // Database setup
import { seedAdmin } from './db/seed'; // Seed admin user

async function startServer() {
  const app: FastifyInstance = fastify();

  try {
    // Initialize the database and seed admin user
    console.log('Setting up the database...');
    await setupDatabase(); // Ensure database setup completes before proceeding
    console.log('Seeding admin user...');
    await seedAdmin();

    console.log('Database setup and seeding complete.');

    // Register CORS plugin
    app.register(corsPlugin);

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
        host: `localhost:${process.env.PORT || 3000}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
    });

    app.register(swaggerUi, {
      routePrefix: '/docs', // Swagger UI available at http://localhost:<PORT>/docs
    });

    // Base route
    app.get('/', async () => {
      return { message: 'Server is running!' };
    });

    // Start the server
    const port = Number(process.env.PORT) || 3000;
    app.listen({ port }, (err, address) => {
      if (err) {
        console.error('Error starting server:', err);
        process.exit(1);
      }
      console.log(`Server is running at ${address}`);
      console.log(`Swagger documentation is available at ${address}/docs`);
    });
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
}

startServer();
