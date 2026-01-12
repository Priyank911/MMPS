import logger from '../../config/logger.js';
import { NormalizationError } from '../../utils/errors.js';

/**
 * Normalization Layer
 * Converts heterogeneous perception outputs into canonical textual representation
 */
class NormalizationService {
  /**
   * Merge multiple perception results into a single normalized text
   * @param {Array<Object>} perceptionResults - Array of perception layer outputs
   * @returns {Promise<Object>} - Normalized canonical representation
   */
  async normalize(perceptionResults) {
    const startTime = Date.now();
    logger.info(`[Normalization Layer] Normalizing ${perceptionResults.length} perception results`);

    try {
      if (!Array.isArray(perceptionResults) || perceptionResults.length === 0) {
        throw new NormalizationError('No perception results to normalize', {
          receivedType: typeof perceptionResults,
          length: perceptionResults?.length || 0
        });
      }

      // Separate results by type
      const textInputs = perceptionResults.filter(r => r.type === 'text');
      const imageInputs = perceptionResults.filter(r => r.type === 'image');
      const documentInputs = perceptionResults.filter(r => r.type === 'document');

      // Build canonical representation with clear section markers
      const sections = [];

      // Add text inputs
      if (textInputs.length > 0) {
        const textContent = textInputs.map(t => t.content).join('\n\n');
        sections.push({
          label: 'Direct Text Input',
          content: textContent,
          metadata: {
            count: textInputs.length,
            totalLength: textContent.length
          }
        });
      }

      // Add image descriptions
      if (imageInputs.length > 0) {
        const imageDescriptions = imageInputs.map((img, idx) => {
          return `Image ${idx + 1}: ${img.content}`;
        }).join('\n');

        sections.push({
          label: 'Visual Content Descriptions',
          content: imageDescriptions,
          metadata: {
            count: imageInputs.length,
            sources: imageInputs.map(img => img.metadata.source)
          }
        });
      }

      // Add document content
      if (documentInputs.length > 0) {
        const documentContent = documentInputs.map((doc, idx) => {
          const preview = doc.content.length > 2000 
            ? doc.content.substring(0, 2000) + '... [content truncated]'
            : doc.content;
          return `Document ${idx + 1} (${doc.metadata.pages} pages):\n${preview}`;
        }).join('\n\n');

        sections.push({
          label: 'Document Content',
          content: documentContent,
          metadata: {
            count: documentInputs.length,
            totalPages: documentInputs.reduce((sum, doc) => sum + doc.metadata.pages, 0)
          }
        });
      }

      // Create normalized canonical text
      const normalizedText = this._buildCanonicalText(sections);

      // Calculate aggregate metadata
      const aggregateMetadata = this._aggregateMetadata(perceptionResults, sections);

      const processingTime = Date.now() - startTime;

      logger.info(`[Normalization Layer] Normalization completed in ${processingTime}ms`, {
        inputTypes: {
          text: textInputs.length,
          images: imageInputs.length,
          documents: documentInputs.length
        },
        outputLength: normalizedText.length
      });

      return {
        normalizedText,
        sections,
        metadata: {
          ...aggregateMetadata,
          processingTime
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error(`[Normalization Layer] Normalization failed: ${error.message}`, {
        processingTime
      });

      if (error instanceof NormalizationError) {
        throw error;
      }

      throw new NormalizationError('Failed to normalize perception results', {
        originalError: error.message
      });
    }
  }

  /**
   * Build canonical text representation from sections
   * @private
   */
  _buildCanonicalText(sections) {
    const header = '=== Multi-Modal Input Consolidation ===\n\n';
    
    const body = sections.map(section => {
      return `[${section.label}]\n${section.content}`;
    }).join('\n\n---\n\n');

    const footer = '\n\n=== End of Input ===';

    return header + body + footer;
  }

  /**
   * Aggregate metadata from all perception results
   * @private
   */
  _aggregateMetadata(perceptionResults, sections) {
    const totalConfidence = perceptionResults.reduce((sum, r) => sum + r.metadata.confidence, 0);
    const averageConfidence = totalConfidence / perceptionResults.length;

    return {
      inputCount: perceptionResults.length,
      sectionCount: sections.length,
      averageConfidence: Number(averageConfidence.toFixed(3)),
      inputTypes: {
        text: perceptionResults.filter(r => r.type === 'text').length,
        image: perceptionResults.filter(r => r.type === 'image').length,
        document: perceptionResults.filter(r => r.type === 'document').length
      },
      totalProcessingTime: perceptionResults.reduce((sum, r) => sum + r.metadata.processingTime, 0)
    };
  }

  /**
   * Health check for normalization service
   */
  async healthCheck() {
    return {
      status: 'healthy',
      processor: 'canonical-text-normalizer'
    };
  }
}

export default new NormalizationService();
