import fastify from 'fastify';
import exampleRoutes from '../routes/example';

test('GET /example', async () => {
  const app = fastify();
  app.register(exampleRoutes);

  const response = await app.inject({
    method: 'GET',
    url: '/example',
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ message: 'Hello from Fastify' });
});