import pdf from 'pdf-parse';
import fs from 'fs';
import logger from '../../config/logger.js';
import { PerceptionError } from '../../utils/errors.js';

/**
 * Document Perception Module
 * Extracts text content from PDF files
 */
class DocumentPerceptionService {
  /**
   * Process PDF file and extract text
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processPdf(filePath) {
    const startTime = Date.now();
    logger.info(`[Perception Layer] Processing PDF: ${filePath}`);

    try {
      // Read PDF file
      const dataBuffer = fs.readFileSync(filePath);

      // Parse PDF
      const data = await pdf(dataBuffer);

      const processingTime = Date.now() - startTime;

      // Extract text content
      const text = data.text.trim();

      if (!text || text.length < 10) {
        throw new PerceptionError('PDF appears to be empty or contains no extractable text', {
          sublayer: 'document-perception',
          filePath,
          pages: data.numpages
        });
      }

      logger.info(`[Perception Layer] PDF processed successfully in ${processingTime}ms`, {
        pages: data.numpages,
        textLength: text.length
      });

      return {
        type: 'document',
        content: text,
        metadata: {
          source: filePath,
          pages: data.numpages,
          textLength: text.length,
          processingTime,
          confidence: 0.95, // PDF extraction is typically reliable
          info: data.info
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error(`[Perception Layer] PDF processing failed: ${error.message}`, {
        filePath,
        processingTime
      });

      if (error instanceof PerceptionError) {
        throw error;
      }

      throw new PerceptionError('Failed to process PDF document', {
        sublayer: 'document-perception',
        filePath,
        originalError: error.message
      });
    }
  }

  /**
   * Validate PDF file
   */
  validatePdf(filePath) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        throw new PerceptionError('PDF file is empty', {
          sublayer: 'document-perception',
          filePath
        });
      }
      return true;
    } catch (error) {
      throw new PerceptionError('Invalid PDF file', {
        sublayer: 'document-perception',
        filePath,
        originalError: error.message
      });
    }
  }

  /**
   * Health check for document perception service
   */
  async healthCheck() {
    return {
      status: 'healthy',
      parser: 'pdf-parse'
    };
  }
}

export default new DocumentPerceptionService();
