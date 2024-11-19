import dotenv from 'dotenv';
dotenv.config();

import fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import corsPlugin from './plugins/cors';
import { setupDatabase } from './db/setup';
import { seedAdmin } from './db/seed';
import authenticationRoutes from './routes/authentication/authentication';
import epubRoutes from './routes/books/epubs';
import fastifyStatic from '@fastify/static';
import path from 'path';
import llamaRoutes from './routes/model/llama';

async function startServer() {
  const app: FastifyInstance = fastify();

  try {
    // Initialize the database and seed admin user
    console.log('Setting up the database...');
    await setupDatabase();
    console.log('Seeding admin user...');
    await seedAdmin();

    console.log('Database setup and seeding complete.');

    // Register CORS plugin
    app.register(corsPlugin);

    // Register Swagger plugins
    app.register(swagger, {
      swagger: {
        info: {
          title: 'API Documentation',
          description: 'API documentation for the backend',
          version: '1.0.0',
        },
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
        },
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
    });

    app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });

    // Register fastify-static to serve EPUB files
    app.register(fastifyStatic, {
      root: path.join(__dirname, '../../../../../../epubs'), // Adjust the path as needed
      prefix: '/epubs/files/',
    });

    // Register routes
    app.register(authenticationRoutes, { prefix: '/api' });
    app.register(epubRoutes, { prefix: '/api' });
    app.register(llamaRoutes, { prefix: '/api' });

    // Base route
    app.get('/', async () => {
      return { message: 'Server is running!' };
    });

    // Start the server
    const port = Number(process.env.PORT) || 3000;
    const address = await app.listen({ port });
    console.log(`Server is running at ${address}`);
    console.log(`Swagger documentation is available at ${address}/docs`);
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
}

startServer();
