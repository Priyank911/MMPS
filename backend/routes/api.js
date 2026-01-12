import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pipelineOrchestrator from '../services/orchestration/pipelineOrchestrator.js';
import logger from '../config/logger.js';
import { AppError } from '../utils/errors.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * POST /api/refine
 * Main endpoint for multi-modal prompt refinement
 * 
 * Request body:
 * {
 *   textInputs: string[],
 *   imageUrls: string[], // Cloudinary URLs
 *   documents: File[] // PDF files
 * }
 */
router.post('/refine', upload.array('documents', 5), async (req, res, next) => {
  const requestId = `req_${Date.now()}`;
  logger.info(`[API ${requestId}] Received refinement request`);

  try {
    // Parse request data
    const textInputs = req.body.textInputs 
      ? (Array.isArray(req.body.textInputs) ? req.body.textInputs : [req.body.textInputs])
      : [];

    const imageUrls = req.body.imageUrls
      ? (Array.isArray(req.body.imageUrls) ? req.body.imageUrls : JSON.parse(req.body.imageUrls))
      : [];

    const documentPaths = req.files ? req.files.map(f => f.path) : [];

    logger.info(`[API ${requestId}] Request parsed`, {
      textInputs: textInputs.length,
      imageUrls: imageUrls.length,
      documents: documentPaths.length
    });

    // Execute pipeline
    const result = await pipelineOrchestrator.executePipeline({
      textInputs,
      imageUrls,
      documentPaths
    });

    // Clean up uploaded files
    documentPaths.forEach(filePath => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        logger.warn(`Failed to delete temporary file: ${filePath}`);
      }
    });

    logger.info(`[API ${requestId}] Request completed successfully`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          logger.warn(`Failed to delete temporary file: ${file.path}`);
        }
      });
    }

    next(error);
  }
});

/**
 * GET /api/health
 * Health check endpoint for all pipeline layers
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await pipelineOrchestrator.getHealthStatus();
    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

/**
 * GET /api/layers/perception
 * Observable endpoint for perception layer status
 */
router.get('/layers/perception', async (req, res) => {
  try {
    const healthStatus = await pipelineOrchestrator.getHealthStatus();
    res.json({
      layer: 'perception',
      status: healthStatus.layers.perception,
      timestamp: healthStatus.timestamp
    });
  } catch (error) {
    res.status(500).json({
      layer: 'perception',
      status: 'error',
      error: error.message
    });
  }
});

/**
 * GET /api/layers/normalization
 * Observable endpoint for normalization layer status
 */
router.get('/layers/normalization', async (req, res) => {
  try {
    const healthStatus = await pipelineOrchestrator.getHealthStatus();
    res.json({
      layer: 'normalization',
      status: healthStatus.layers.normalization,
      timestamp: healthStatus.timestamp
    });
  } catch (error) {
    res.status(500).json({
      layer: 'normalization',
      status: 'error',
      error: error.message
    });
  }
});

/**
 * GET /api/layers/refinement
 * Observable endpoint for refinement layer status
 */
router.get('/layers/refinement', async (req, res) => {
  try {
    const healthStatus = await pipelineOrchestrator.getHealthStatus();
    res.json({
      layer: 'refinement',
      status: healthStatus.layers.refinement,
      timestamp: healthStatus.timestamp
    });
  } catch (error) {
    res.status(500).json({
      layer: 'refinement',
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Error handling middleware
 */
router.use((error, req, res, next) => {
  logger.error('API Error', {
    message: error.message,
    layer: error.layer,
    statusCode: error.statusCode,
    details: error.details
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        layer: error.layer,
        details: error.details
      }
    });
  }

  // Unexpected errors
  res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  });
});

export default router;
