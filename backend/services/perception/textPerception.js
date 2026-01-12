import logger from '../../config/logger.js';
import { PerceptionError } from '../../utils/errors.js';

/**
 * Text Perception Module
 * Handles plain text input with minimal processing
 */
class TextPerceptionService {
  /**
   * Process plain text input
   * @param {string} text - Plain text content
   * @returns {Promise<Object>} - Processed text and metadata
   */
  async processText(text) {
    const startTime = Date.now();
    logger.info(`[Perception Layer] Processing text input (${text.length} characters)`);

    try {
      // Validate text
      if (!text || typeof text !== 'string') {
        throw new PerceptionError('Invalid text input', {
          sublayer: 'text-perception',
          receivedType: typeof text
        });
      }

      const trimmedText = text.trim();

      if (trimmedText.length === 0) {
        throw new PerceptionError('Text input is empty', {
          sublayer: 'text-perception'
        });
      }

      const processingTime = Date.now() - startTime;

      logger.info(`[Perception Layer] Text processed successfully in ${processingTime}ms`);

      return {
        type: 'text',
        content: trimmedText,
        metadata: {
          source: 'direct-input',
          textLength: trimmedText.length,
          processingTime,
          confidence: 1.0, // Direct text has perfect confidence
          wordCount: trimmedText.split(/\s+/).length
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error(`[Perception Layer] Text processing failed: ${error.message}`, {
        processingTime
      });

      if (error instanceof PerceptionError) {
        throw error;
      }

      throw new PerceptionError('Failed to process text input', {
        sublayer: 'text-perception',
        originalError: error.message
      });
    }
  }

  /**
   * Health check for text perception service
   */
  async healthCheck() {
    return {
      status: 'healthy',
      processor: 'native'
    };
  }
}

export default new TextPerceptionService();
