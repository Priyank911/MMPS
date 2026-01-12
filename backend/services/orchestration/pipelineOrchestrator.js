import imagePerception from '../perception/imagePerception.js';
import documentPerception from '../perception/documentPerception.js';
import textPerception from '../perception/textPerception.js';
import normalizationService from '../normalization/normalizationService.js';
import refinementService from '../refinement/refinementService.js';
import validationService from '../validation/validationService.js';
import logger from '../../config/logger.js';
import { AppError, RoutingError } from '../../utils/errors.js';

/**
 * Pipeline Orchestration Service
 * Coordinates the flow through all layers with observability
 */
class PipelineOrchestrator {
  /**
   * Execute the complete multi-modal prompt refinement pipeline
   */
  async executePipeline(request) {
    const pipelineId = this._generatePipelineId();
    const startTime = Date.now();

    logger.info(`[Pipeline ${pipelineId}] Starting execution`, {
      textInputs: request.textInputs?.length || 0,
      imageUrls: request.imageUrls?.length || 0,
      documentPaths: request.documentPaths?.length || 0
    });

    try {
      // Step 1: Validate request
      validationService.validatePipelineRequest(request);

      // Step 2: Modality Routing & Perception Layer
      const perceptionResults = await this._executePerceptionLayer(
        request.textInputs || [],
        request.imageUrls || [],
        request.documentPaths || [],
        pipelineId
      );

      // Step 3: Normalization Layer
      const normalizationResult = await this._executeNormalizationLayer(
        perceptionResults,
        pipelineId
      );

      // Step 4: Refinement Layer (Multi-Stage LLM Pipeline)
      const refinementResult = await this._executeRefinementLayer(
        normalizationResult.normalizedText,
        pipelineId
      );

      // Step 5: Calculate final confidence and assemble response
      const finalResult = this._assembleFinalResult(
        perceptionResults,
        normalizationResult,
        refinementResult,
        pipelineId,
        startTime
      );

      logger.info(`[Pipeline ${pipelineId}] Completed successfully`, {
        totalTime: finalResult.metadata.totalProcessingTime,
        success: finalResult.success
      });

      return finalResult;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error(`[Pipeline ${pipelineId}] Failed`, {
        error: error.message,
        layer: error.layer || 'unknown',
        processingTime
      });

      throw error;
    }
  }

  /**
   * Execute perception layer for all inputs
   * @private
   */
  async _executePerceptionLayer(textInputs, imageUrls, documentPaths, pipelineId) {
    logger.info(`[Pipeline ${pipelineId}] Executing Perception Layer`);

    const perceptionPromises = [];

    // Process text inputs
    textInputs.forEach(text => {
      perceptionPromises.push(
        textPerception.processText(text).catch(error => ({
          error: true,
          type: 'text',
          message: error.message
        }))
      );
    });

    // Process images
    imageUrls.forEach(url => {
      perceptionPromises.push(
        imagePerception.processImageFromUrl(url).catch(error => ({
          error: true,
          type: 'image',
          message: error.message
        }))
      );
    });

    // Process documents
    documentPaths.forEach(path => {
      perceptionPromises.push(
        documentPerception.processPdf(path).catch(error => ({
          error: true,
          type: 'document',
          message: error.message
        }))
      );
    });

    const results = await Promise.all(perceptionPromises);

    // Filter out errors and collect error details
    const successfulResults = results.filter(r => !r.error);
    const errors = results.filter(r => r.error);

    if (successfulResults.length === 0) {
      throw new RoutingError('All perception processes failed', {
        errors: errors.map(e => ({ type: e.type, message: e.message }))
      });
    }

    if (errors.length > 0) {
      logger.warn(`[Pipeline ${pipelineId}] Some perception processes failed`, {
        successful: successfulResults.length,
        failed: errors.length
      });
    }

    return successfulResults;
  }

  /**
   * Execute normalization layer
   * @private
   */
  async _executeNormalizationLayer(perceptionResults, pipelineId) {
    const startTime = Date.now();
    logger.info(`[Pipeline ${pipelineId}] ========================================`);
    logger.info(`[Pipeline ${pipelineId}] EXECUTING NORMALIZATION LAYER`);
    logger.info(`[Pipeline ${pipelineId}] ========================================`);
    const result = await normalizationService.normalize(perceptionResults);
    logger.info(`[Pipeline ${pipelineId}] Normalization completed in ${Date.now() - startTime}ms`);
    return result;
  }

  /**
   * Execute multi-stage refinement layer
   * @private
   */
  async _executeRefinementLayer(normalizedText, pipelineId) {
    const startTime = Date.now();
    logger.info(`[Pipeline ${pipelineId}] ========================================`);
    logger.info(`[Pipeline ${pipelineId}] EXECUTING REFINEMENT LAYER`);
    logger.info(`[Pipeline ${pipelineId}] ========================================`);
    const result = await refinementService.executeFullPipeline(normalizedText);
    logger.info(`[Pipeline ${pipelineId}] Refinement completed in ${Date.now() - startTime}ms`);
    return result;
  }

  /**
   * Assemble final result with all metadata
   * @private
   */
  _assembleFinalResult(perceptionResults, normalizationResult, refinementResult, pipelineId, startTime) {
    const totalProcessingTime = Date.now() - startTime;

    // Calculate confidence scores
    const confidenceScores = validationService.calculateConfidenceScore(refinementResult);

    // Determine if processing was successful
    const success = refinementResult.success && !refinementResult.rejected;

    // Build final response
    const result = {
      pipelineId,
      success,
      rejected: refinementResult.rejected || false,
      rejectionReason: refinementResult.reason || null,
      
      // Main output
      refinedPrompt: refinementResult.refinement?.result?.refined_prompt || null,
      
      // Structured details for internal use
      details: {
        intent: refinementResult.intentAnalysis?.result || null,
        improvements: refinementResult.refinement?.result?.key_improvements || [],
        assumptions: refinementResult.refinement?.result?.assumptions_made || [],
        validationResults: refinementResult.validation?.result?.validation_results || null,
        recommendations: refinementResult.validation?.result?.recommendations || []
      },

      // Confidence and quality metrics
      confidence: confidenceScores,

      // Pipeline metadata for observability
      metadata: {
        totalProcessingTime,
        perceptionLayer: {
          inputCount: perceptionResults.length,
          processingTime: normalizationResult.metadata.totalProcessingTime
        },
        normalizationLayer: {
          processingTime: normalizationResult.metadata.processingTime
        },
        refinementLayer: {
          totalProcessingTime: refinementResult.totalProcessingTime,
          stages: {
            relevanceCheck: refinementResult.relevanceCheck?.processingTime || 0,
            intentAnalysis: refinementResult.intentAnalysis?.processingTime || 0,
            refinement: refinementResult.refinement?.processingTime || 0,
            validation: refinementResult.validation?.processingTime || 0
          }
        }
      }
    };

    return result;
  }

  /**
   * Generate unique pipeline ID for tracking
   * @private
   */
  _generatePipelineId() {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get health status of all layers
   */
  async getHealthStatus() {
    const [
      imageHealth,
      documentHealth,
      textHealth,
      normalizationHealth,
      refinementHealth
    ] = await Promise.all([
      imagePerception.healthCheck(),
      documentPerception.healthCheck(),
      textPerception.healthCheck(),
      normalizationService.healthCheck(),
      refinementService.healthCheck()
    ]);

    return {
      status: 'operational',
      layers: {
        perception: {
          image: imageHealth,
          document: documentHealth,
          text: textHealth
        },
        normalization: normalizationHealth,
        refinement: refinementHealth
      },
      timestamp: new Date().toISOString()
    };
  }
}

export default new PipelineOrchestrator();
