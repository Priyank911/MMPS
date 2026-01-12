import config from '../../config/config.js';
import logger from '../../config/logger.js';
import { ValidationError } from '../../utils/errors.js';

/**
 * Input Validation Service
 * Validates inputs at various pipeline stages
 */
class ValidationService {
  /**
   * Validate file upload
   */
  validateFileUpload(file, expectedType) {
    if (!file) {
      throw new ValidationError('No file provided', { expectedType });
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      throw new ValidationError(
        `File size exceeds maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`,
        { fileSize: file.size, maxSize: config.maxFileSize }
      );
    }

    // Validate file type
    if (expectedType === 'image' && !config.allowedImageTypes.includes(file.mimetype)) {
      throw new ValidationError(
        'Invalid image file type',
        {
          received: file.mimetype,
          allowed: config.allowedImageTypes
        }
      );
    }

    if (expectedType === 'document' && !config.allowedDocTypes.includes(file.mimetype)) {
      throw new ValidationError(
        'Invalid document file type',
        {
          received: file.mimetype,
          allowed: config.allowedDocTypes
        }
      );
    }

    return true;
  }

  /**
   * Validate text input
   */
  validateTextInput(text) {
    if (!text || typeof text !== 'string') {
      throw new ValidationError('Invalid text input', {
        received: typeof text
      });
    }

    const trimmed = text.trim();

    if (trimmed.length < config.minPromptLength) {
      throw new ValidationError(
        `Text input too short (minimum ${config.minPromptLength} characters)`,
        { length: trimmed.length, minLength: config.minPromptLength }
      );
    }

    if (trimmed.length > config.maxPromptLength) {
      throw new ValidationError(
        `Text input too long (maximum ${config.maxPromptLength} characters)`,
        { length: trimmed.length, maxLength: config.maxPromptLength }
      );
    }

    return true;
  }

  /**
   * Validate image URL from Cloudinary
   */
  validateImageUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new ValidationError('Invalid image URL', {
        received: typeof url
      });
    }

    try {
      const urlObj = new URL(url);
      
      // Should be HTTPS
      if (urlObj.protocol !== 'https:') {
        throw new ValidationError('Image URL must use HTTPS', {
          protocol: urlObj.protocol
        });
      }

      // Basic validation that it's a valid URL
      if (!urlObj.hostname) {
        throw new ValidationError('Invalid image URL hostname', {
          url
        });
      }

      return true;
    } catch (error) {
      throw new ValidationError('Malformed image URL', {
        url,
        error: error.message
      });
    }
  }

  /**
   * Validate pipeline request
   */
  validatePipelineRequest(request) {
    const { textInputs = [], imageUrls = [], documentPaths = [] } = request;

    // Must have at least one input
    const totalInputs = textInputs.length + imageUrls.length + documentPaths.length;

    if (totalInputs === 0) {
      throw new ValidationError('No inputs provided', {
        textInputs: textInputs.length,
        imageUrls: imageUrls.length,
        documentPaths: documentPaths.length
      });
    }

    // Validate each text input
    textInputs.forEach((text, idx) => {
      try {
        this.validateTextInput(text);
      } catch (error) {
        throw new ValidationError(`Text input ${idx + 1} validation failed: ${error.message}`, {
          inputIndex: idx,
          originalError: error.details
        });
      }
    });

    // Validate each image URL
    imageUrls.forEach((url, idx) => {
      try {
        this.validateImageUrl(url);
      } catch (error) {
        throw new ValidationError(`Image URL ${idx + 1} validation failed: ${error.message}`, {
          inputIndex: idx,
          originalError: error.details
        });
      }
    });

    logger.info('[Validation] Pipeline request validated', {
      textInputs: textInputs.length,
      imageUrls: imageUrls.length,
      documentPaths: documentPaths.length
    });

    return true;
  }

  /**
   * Calculate confidence score from pipeline results
   */
  calculateConfidenceScore(pipelineResults) {
    const {
      relevanceCheck,
      intentAnalysis,
      refinement,
      validation
    } = pipelineResults;

    const scores = [
      relevanceCheck?.result?.relevance_score || 0,
      intentAnalysis?.result?.confidence || 0,
      refinement?.result?.confidence || 0,
      validation?.result?.quality_score || 0
    ];

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      overallConfidence: Number(averageScore.toFixed(3)),
      scores: {
        relevance: relevanceCheck?.result?.relevance_score || 0,
        intentUnderstanding: intentAnalysis?.result?.confidence || 0,
        refinementQuality: refinement?.result?.confidence || 0,
        validationQuality: validation?.result?.quality_score || 0
      }
    };
  }
}

export default new ValidationService();
