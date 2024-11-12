import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserService } from '../../db/services/users';
import { SignupRequest } from '../../data/request/authentication/signupRequest';
import { LoginRequest } from '../../data/request/authentication/loginRequest';

export default async function authRoutes(app: FastifyInstance) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

  // Password validation function
  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
  };

  /**
   * User Signup
   */
  app.post<{ Body: SignupRequest }>(
    '/auth/signup',
    {
      schema: {
        tags: ['Authentication'],
        description: 'User signup',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          201: {
            description: 'User created successfully',
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
            },
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      // Validate password strength
      if (!validatePassword(password)) {
        return reply.status(400).send({
          error:
            'Password must be at least 12 characters long and include at least one uppercase letter, one number, and one special character.',
        });
      }

      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return reply.status(400).send({ error: 'Email already in use' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user
      const newUser = await UserService.insertUser({
        email,
        password: hashedPassword,
      });

      return reply.status(201).send({ id: newUser.id, email: newUser.email });
    }
  );

  /**
   * User Login
   */
  app.post<{ Body: LoginRequest }>(
    '/auth/login',
    {
      schema: {
        tags: ['Authentication'],
        description: 'User login',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Login successful',
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      // Find user in the database
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      // Generate JWT
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

      return reply.send({ token });
    }
  );

  /**
   * Verify JWT Token Middleware
   */
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new Error('Missing authorization header');
      }

      // Extract and verify token
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Ensure decoded is an object (JwtPayload)
      if (typeof decoded === 'object' && decoded !== null) {
        request.user = decoded as JwtPayload; // Safely cast to JwtPayload
      } else {
        throw new Error('Invalid token payload');
      }
    } catch (error) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  /**
   * Protected Route Example
   */
  app.get(
    '/auth/me',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Authentication'],
        description: 'Get current user',
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: 'Current user data',
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return reply.send({ user: request.user });
    }
  );
}
