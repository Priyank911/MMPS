import Groq from 'groq-sdk';
import config from '../../config/config.js';
import logger from '../../config/logger.js';
import { RefinementError } from '../../utils/errors.js';
import {
  INTENT_ANALYSIS_PROMPT,
  PROMPT_REFINEMENT_PROMPT,
  VALIDATION_PROMPT,
  RELEVANCE_CHECK_PROMPT
} from './prompts.js';

/**
 * Multi-Stage LLM Refinement Service
 * Uses Groq API with different system prompts for each stage
 */
class RefinementService {
  constructor() {
    if (!config.groqApiKey) {
      logger.warn('[Refinement Layer] Groq API key not configured');
    }
    this.groq = new Groq({ apiKey: config.groqApiKey });
    this.model = config.groqModel;
  }

  /**
   * Stage 1: Intent Analysis
   * Analyzes normalized input to extract intent and identify ambiguities
   */
  async analyzeIntent(normalizedText) {
    const startTime = Date.now();
    logger.info('[Refinement Layer - Stage 1] Starting intent analysis');

    try {
      const response = await this._callGroq(
        INTENT_ANALYSIS_PROMPT,
        normalizedText,
        'intent_analysis'
      );

      const result = this._parseJsonResponse(response, 'intent_analysis');
      const processingTime = Date.now() - startTime;

      logger.info('[Refinement Layer - Stage 1] Intent analysis completed', {
        confidence: result.confidence,
        processingTime
      });

      return {
        stage: 'intent_analysis',
        result,
        processingTime
      };

    } catch (error) {
      logger.error('[Refinement Layer - Stage 1] Intent analysis failed', {
        error: error.message
      });
      throw new RefinementError('Intent analysis failed', {
        stage: 'intent_analysis',
        originalError: error.message
      });
    }
  }

  /**
   * Stage 2: Prompt Refinement
   * Creates a refined, professional prompt based on intent analysis
   */
  async refinePrompt(normalizedText, intentAnalysis) {
    const startTime = Date.now();
    logger.info('[Refinement Layer - Stage 2] Starting prompt refinement');

    try {
      const contextualizedInput = this._buildRefinementContext(normalizedText, intentAnalysis);

      const response = await this._callGroq(
        PROMPT_REFINEMENT_PROMPT,
        contextualizedInput,
        'prompt_refinement'
      );

      const result = this._parseJsonResponse(response, 'prompt_refinement');
      const processingTime = Date.now() - startTime;

      logger.info('[Refinement Layer - Stage 2] Prompt refinement completed', {
        confidence: result.confidence,
        processingTime
      });

      return {
        stage: 'prompt_refinement',
        result,
        processingTime
      };

    } catch (error) {
      logger.error('[Refinement Layer - Stage 2] Prompt refinement failed', {
        error: error.message
      });
      throw new RefinementError('Prompt refinement failed', {
        stage: 'prompt_refinement',
        originalError: error.message
      });
    }
  }

  /**
   * Stage 3: Validation
   * Validates the refined prompt against quality criteria
   */
  async validatePrompt(refinedPrompt) {
    const startTime = Date.now();
    logger.info('[Refinement Layer - Stage 3] Starting validation');

    try {
      const response = await this._callGroq(
        VALIDATION_PROMPT,
        `Refined Prompt to Validate:\n\n${refinedPrompt}`,
        'validation'
      );

      const result = this._parseJsonResponse(response, 'validation');
      const processingTime = Date.now() - startTime;

      logger.info('[Refinement Layer - Stage 3] Validation completed', {
        isValid: result.is_valid,
        qualityScore: result.quality_score,
        processingTime
      });

      return {
        stage: 'validation',
        result,
        processingTime
      };

    } catch (error) {
      logger.error('[Refinement Layer - Stage 3] Validation failed', {
        error: error.message
      });
      throw new RefinementError('Validation failed', {
        stage: 'validation',
        originalError: error.message
      });
    }
  }

  /**
   * Stage 4: Relevance Check
   * Determines if input is relevant and appropriate
   */
  async checkRelevance(normalizedText) {
    const startTime = Date.now();
    logger.info('[Refinement Layer - Stage 4] Starting relevance check');

    try {
      const response = await this._callGroq(
        RELEVANCE_CHECK_PROMPT,
        normalizedText,
        'relevance_check'
      );

      const result = this._parseJsonResponse(response, 'relevance_check');
      const processingTime = Date.now() - startTime;

      logger.info('[Refinement Layer - Stage 4] Relevance check completed', {
        isRelevant: result.is_relevant,
        relevanceScore: result.relevance_score,
        processingTime
      });

      return {
        stage: 'relevance_check',
        result,
        processingTime
      };

    } catch (error) {
      logger.error('[Refinement Layer - Stage 4] Relevance check failed', {
        error: error.message
      });
      throw new RefinementError('Relevance check failed', {
        stage: 'relevance_check',
        originalError: error.message
      });
    }
  }

  /**
   * Execute full refinement pipeline
   */
  async executeFullPipeline(normalizedText) {
    const pipelineStart = Date.now();
    logger.info('========================================');
    logger.info('[Refinement Layer] Starting full refinement pipeline');
    logger.info('========================================');

    try {
      // Stage 1: Relevance Check (run first to reject irrelevant inputs early)
      logger.info('[Refinement Layer] Stage 1/4: RELEVANCE CHECK');
      const relevanceCheck = await this.checkRelevance(normalizedText);
      logger.info(`[Refinement Layer] Stage 1/4 complete - Relevant: ${relevanceCheck.result.is_relevant}, Score: ${relevanceCheck.result.relevance_score}`);
      
      if (!relevanceCheck.result.is_relevant || relevanceCheck.result.relevance_score < 0.3) {
        return {
          success: false,
          rejected: true,
          reason: relevanceCheck.result.rejection_reason || 'Input deemed not relevant for processing',
          relevanceCheck,
          totalProcessingTime: Date.now() - pipelineStart
        };
      }

      // Stage 2: Intent Analysis
      logger.info('[Refinement Layer] Stage 2/4: INTENT ANALYSIS');
      const intentAnalysis = await this.analyzeIntent(normalizedText);
      logger.info(`[Refinement Layer] Stage 2/4 complete - Intent: ${intentAnalysis.result.intent}, Confidence: ${intentAnalysis.result.confidence}`);

      // Check confidence threshold
      if (intentAnalysis.result.confidence < config.minConfidenceScore) {
        return {
          success: false,
          rejected: true,
          reason: 'Input is too ambiguous or unclear to process confidently',
          intentAnalysis,
          relevanceCheck,
          totalProcessingTime: Date.now() - pipelineStart
        };
      }

      // Stage 3: Prompt Refinement
      logger.info('[Refinement Layer] Stage 3/4: PROMPT REFINEMENT');
      const refinement = await this.refinePrompt(normalizedText, intentAnalysis.result);
      logger.info(`[Refinement Layer] Stage 3/4 complete - Refined prompt length: ${refinement.result.refined_prompt?.length || 0}`);

      // Stage 4: Validation
      logger.info('[Refinement Layer] Stage 4/4: VALIDATION');
      const validation = await this.validatePrompt(refinement.result.refined_prompt);
      logger.info(`[Refinement Layer] Stage 4/4 complete - Valid: ${validation.result.is_valid}, Quality: ${validation.result.quality_score}`);

      const totalProcessingTime = Date.now() - pipelineStart;

      logger.info('========================================');
      logger.info('[Refinement Layer] Full pipeline completed', {
        totalProcessingTime,
        isValid: validation.result.is_valid
      });
      logger.info('========================================');

      return {
        success: validation.result.is_valid,
        rejected: false,
        relevanceCheck,
        intentAnalysis,
        refinement,
        validation,
        totalProcessingTime
      };

    } catch (error) {
      logger.error('[Refinement Layer] Pipeline failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Call Groq API with retry logic
   * @private
   */
  async _callGroq(systemPrompt, userMessage, stageName) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: this.model,
        temperature: 0.3, // Lower temperature for more consistent outputs
        max_tokens: 4096, // Increased for longer refined prompts
        top_p: 0.9
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from Groq API');
      }

      return content;

    } catch (error) {
      if (error.status === 429) {
        throw new RefinementError('Rate limit exceeded, please try again later', {
          stage: stageName,
          apiError: 'rate_limit'
        });
      }

      throw new RefinementError(`Groq API call failed: ${error.message}`, {
        stage: stageName,
        apiError: error.message
      });
    }
  }

  /**
   * Parse JSON response from LLM
   * @private
   */
  _parseJsonResponse(response, stageName) {
    try {
      let jsonString = response.trim();

      // Step 1: Try to extract JSON from markdown code blocks
      const markdownMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (markdownMatch) {
        jsonString = markdownMatch[1].trim();
      }

      // Step 2: Find the complete JSON object from { to matching }
      const firstBrace = jsonString.indexOf('{');
      if (firstBrace === -1) {
        throw new Error('No JSON object found in response');
      }

      // Find matching closing brace using a simple brace counter
      let braceCount = 0;
      let lastBrace = -1;
      let inString = false;
      let escapeNext = false;

      for (let i = firstBrace; i < jsonString.length; i++) {
        const char = jsonString[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastBrace = i;
              break;
            }
          }
        }
      }

      if (lastBrace === -1) {
        throw new Error('No matching closing brace found');
      }

      // Extract just the JSON object
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);

      // Step 3: Clean control characters inside string values
      jsonString = this._cleanJsonString(jsonString);

      // Step 4: Parse the JSON
      return JSON.parse(jsonString);

    } catch (error) {
      logger.error(`[Refinement Layer] Failed to parse JSON response for ${stageName}`, {
        response: response.substring(0, 500),
        responseLength: response.length,
        parseError: error.message
      });
      throw new RefinementError(`Failed to parse ${stageName} response`, {
        stage: stageName,
        parseError: error.message
      });
    }
  }

  /**
   * Clean control characters inside JSON string values
   * @private
   */
  _cleanJsonString(jsonString) {
    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];

      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        result += char;
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        result += char;
        inString = !inString;
        continue;
      }

      // If we're inside a string value, escape control characters
      if (inString) {
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else if (char === '\b') {
          result += '\\b';
        } else if (char === '\f') {
          result += '\\f';
        } else {
          result += char;
        }
      } else {
        // Outside string values, keep as-is
        result += char;
      }
    }

    return result;
  }

  /**
   * Build contextualized input for refinement stage
   * @private
   */
  _buildRefinementContext(normalizedText, intentAnalysis) {
    return `Original Input:
${normalizedText}

Intent Analysis:
- Intent: ${intentAnalysis.intent}
- Domain: ${intentAnalysis.domain}
- Key Concepts: ${intentAnalysis.key_concepts.join(', ')}
- Constraints: ${intentAnalysis.constraints.join(', ')}
- Ambiguities: ${intentAnalysis.ambiguities.join(', ')}

Please create a refined prompt based on this analysis.`;
  }

  /**
   * Health check for refinement service
   */
  async healthCheck() {
    try {
      const testResponse = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: this.model,
        max_tokens: 10
      });

      return {
        status: 'healthy',
        model: this.model,
        apiStatus: 'connected'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        model: this.model,
        apiStatus: 'disconnected',
        error: error.message
      };
    }
  }
}

export default new RefinementService();
