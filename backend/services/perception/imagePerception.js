import axios from 'axios';
import config from '../../config/config.js';
import logger from '../../config/logger.js';
import { PerceptionError } from '../../utils/errors.js';

/**
 * Image Perception Module
 * Uses OpenRouter API with allenai/molmo-2-8b:free for image-to-text
 */
class ImagePerceptionService {
  constructor() {
    this.apiKey = config.openRouterApiKey;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = config.visionModel;
    logger.info(`[Perception Layer] Using OpenRouter with model: ${this.model}`);
  }

  /**
   * Process image from URL using OpenRouter vision model
   * @param {string} imageUrl - Publicly accessible image URL from Cloudinary
   * @returns {Promise<Object>} - Extracted caption and metadata
   */
  async processImageFromUrl(imageUrl) {
    const startTime = Date.now();
    logger.info(`[Perception Layer] Processing image from URL: ${imageUrl}`);

    try {
      if (!this.apiKey) {
        throw new PerceptionError('OpenRouter API key not configured', {
          sublayer: 'image-perception',
          imageUrl
        });
      }

      return await this.processWithOpenRouter(imageUrl, startTime);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('[Perception Layer] Image processing failed', {
        error: error.message,
        imageUrl,
        processingTime
      });

      throw new PerceptionError('Failed to process image', {
        sublayer: 'image-perception',
        imageUrl,
        originalError: error.message
      });
    }
  }

  /**
   * Process image with OpenRouter vision model
   */
  async processWithOpenRouter(imageUrl, startTime) {
    try {
      logger.info('[Perception Layer] Using OpenRouter vision model');

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe this image in detail. Include any text visible in the image, objects, people, actions, and overall context. Be comprehensive and specific.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Multi-Model Prompt System'
          },
          timeout: config.visionTimeout
        }
      );

      const result = response.data;
      const processingTime = Date.now() - startTime;

      // Extract description from response
      const caption = result.choices?.[0]?.message?.content || 'Image analysis completed';
      const finishReason = result.choices?.[0]?.finish_reason || 'unknown';

      logger.info(`[Perception Layer] OpenRouter processed image in ${processingTime}ms`);

      return {
        type: 'image',
        caption,
        metadata: {
          url: imageUrl,
          model: this.model,
          confidence: finishReason === 'stop' ? 0.9 : 0.7,
          processingTime,
          captionLength: caption.length,
          processingMode: 'openrouter-vision',
          finishReason,
          usage: result.usage
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error(`[Perception Layer] OpenRouter processing failed: ${error.message}`, {
        imageUrl,
        processingTime,
        error: error.response?.data || error.message
      });

      throw new PerceptionError('OpenRouter vision processing failed', {
        sublayer: 'openrouter-vision',
        imageUrl,
        originalError: error.message,
        details: error.response?.data
      });
    }
  }

  /**
   * Health check for the image perception service
   */
  async healthCheck() {
    if (!this.apiKey) {
      return {
        status: 'unhealthy',
        mode: 'openrouter-vision',
        error: 'API key not configured'
      };
    }

    return {
      status: 'healthy',
      mode: 'openrouter-vision',
      model: this.model
    };
  }
}

export default new ImagePerceptionService();
