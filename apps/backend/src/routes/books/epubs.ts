import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { EPUBParser } from 'epub-parser';

export default async function epubRoutes(app: FastifyInstance) {
  const EPUB_DIR = path.join(__dirname, '../../../../../../epubs'); // Adjust directory path as needed

  /**
   * Serve EPUB Covers (Authenticated)
   */
  app.get(
    '/epubs/covers',
    {
      preHandler: app.authenticate, // Authentication middleware
      schema: {
        tags: ['EPUB'],
        description: 'Get covers of all EPUB files in the directory (Authenticated)',
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: 'Covers fetched successfully',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                cover: { type: 'string' }, // Base64 or URL to cover image
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
          500: {
            description: 'Server error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Read all EPUB files in the directory
        const epubFiles = fs.readdirSync(EPUB_DIR).filter(file => file.endsWith('.epub'));

        const covers = [];
        for (const file of epubFiles) {
          const filePath = path.join(EPUB_DIR, file);

          // Parse the EPUB to extract metadata
          const epub = await EPUBParser(filePath);
          const coverPath = epub.metadata.cover?.path;

          if (coverPath) {
            const coverFullPath = path.join(EPUB_DIR, coverPath);

            if (fs.existsSync(coverFullPath)) {
              // Encode the cover image as a Base64 string
              const coverBase64 = fs.readFileSync(coverFullPath).toString('base64');
              covers.push({
                title: epub.metadata.title || file,
                cover: `data:image/png;base64,${coverBase64}`, // Use Base64 or save as public static URL
              });
            }
          }
        }

        return reply.send(covers);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Failed to process EPUB files' });
      }
    }
  );
}
