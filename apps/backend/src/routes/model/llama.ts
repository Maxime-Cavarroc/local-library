import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util'; // Import promisify to handle async execution
import path from 'path';

const execAsync = promisify(exec); // Promisify the exec function

// Define the system preset as a constant
const SYSTEM_PRESET = `You are a helpfull AI Assistant and you keep your responses short.`;
const TRANSLATOR_SYSTEM_PRESET = `You are a highly skilled translation expert. Your sole task is to translate any text provided to you into French. Do not add any additional information, explanations, or commentary. Provide only the French translation of the input text.`;

// Define sampling parameters for translation
const TRANSLATION_SAMPLING_PARAMS = {
    temp: 0.5,          // Lower temperature for more deterministic outputs
    top_k: 40,          // Keeps the diversity while maintaining quality
    top_p: 0.95,        // Nucleus sampling
    repeat_penalty: 1.2, // Higher penalty to prevent repetition
    min_p: 0.05         // Ensures some flexibility
};

export default async function llamaRoutes(app: FastifyInstance) {
    const LLAMA_CLI_PATH = path.join(__dirname, '../../../../../../llama.cpp/llama-cli'); // Path to your llama-cli executable
    const MODEL_PATH = path.join(__dirname, '../../../../../../Llama-3.2-1B-Instruct-Q4_K_M.gguf'); // Path to your GGUF model

    /**
     * Generate Text from Llama Model (Authenticated)
     */
    app.post<{
        Body: { prompt: string };
    }>(
        '/llama',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['LLAMA'],
                description: 'Generate text from Llama model (Authenticated)',
                security: [{ Bearer: [] }],
                body: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string', description: 'Prompt to send to the model', minLength: 1 },
                    },
                    required: ['prompt'],
                },
                response: {
                    200: {
                        description: 'Generated text from the model',
                        type: 'object',
                        properties: {
                            result: { type: 'string', description: 'Model-generated output' },
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
        async (request: FastifyRequest<{ Body: { prompt: string } }>, reply: FastifyReply) => {
            const { prompt } = request.body;

            try {
                const fullPrompt = `${SYSTEM_PRESET} ${prompt}`;
                // Build the llama-cli command
                const command = `"${LLAMA_CLI_PATH}" -m "${MODEL_PATH}" -p "${fullPrompt}" --temp ${TRANSLATION_SAMPLING_PARAMS.temp} --top_k ${TRANSLATION_SAMPLING_PARAMS.top_k} --top_p ${TRANSLATION_SAMPLING_PARAMS.top_p} --repeat_penalty ${TRANSLATION_SAMPLING_PARAMS.repeat_penalty} --min_p ${TRANSLATION_SAMPLING_PARAMS.min_p}`;

                console.log('Run...')

                // Execute the command asynchronously
                const { stdout, stderr } = await execAsync(command);

                if (stderr) {
                    app.log.warn(`stderr: ${stderr}`);
                }

                console.log(stdout)

                // Return the model output
                return reply.send({ result: stdout.trim() });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to process the request' });
            }
        }
    );

    /**
     * Translate Text to French using Llama Model (Authenticated)
     */
    app.post<{
        Body: { text: string };
    }>(
        '/translate',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['LLAMA'],
                description: 'Translate text to French using Llama model (Authenticated)',
                security: [{ Bearer: [] }],
                body: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', description: 'Text to translate to French', minLength: 1 },
                    },
                    required: ['text'],
                },
                response: {
                    200: {
                        description: 'French translation of the input text',
                        type: 'object',
                        properties: {
                            translation: { type: 'string', description: 'French translation' },
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
        async (request: FastifyRequest<{ Body: { text: string } }>, reply: FastifyReply) => {
            const { text } = request.body;

            try {
                // Combine the system preset with the user input
                const fullPrompt = `${TRANSLATOR_SYSTEM_PRESET} ${text}`;

                // Build the llama-cli command with sampling parameters
                const command = `"${LLAMA_CLI_PATH}" -m "${MODEL_PATH}" -p "${fullPrompt}" --temp ${TRANSLATION_SAMPLING_PARAMS.temp} --top_k ${TRANSLATION_SAMPLING_PARAMS.top_k} --top_p ${TRANSLATION_SAMPLING_PARAMS.top_p} --repeat_penalty ${TRANSLATION_SAMPLING_PARAMS.repeat_penalty} --min_p ${TRANSLATION_SAMPLING_PARAMS.min_p}`;

                app.log.info('Executing llama-cli command for /translate endpoint.');

                // Execute the command asynchronously
                const { stdout, stderr } = await execAsync(command);

                if (stderr) {
                    app.log.warn(`stderr: ${stderr}`);
                }

                app.log.info(`llama-cli output: ${stdout}`);

                // Extract the translation from the output
                const translation = stdout.trim();

                // Optionally, you can further process the translation to ensure it's clean
                // For example, remove any text before or after the translation if needed

                return reply.send({ translation });
            } catch (error) {
                app.log.error(error);
                return reply.status(500).send({ error: 'Failed to process the translation request' });
            }
        }
    );
}
