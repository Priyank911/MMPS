import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import config from './config/config.js';
import logger from './config/logger.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Create necessary directories
const directories = ['uploads', 'logs'];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Multi-Modal Prompt Refinement System',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/health',
    architecture: {
      layers: ['Perception', 'Normalization', 'Refinement', 'Validation'],
      observability: [
        '/api/layers/perception',
        '/api/layers/normalization',
        '/api/layers/refinement'
      ]
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack
  });

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: config.nodeEnv === 'development' ? error.message : undefined
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      path: req.path
    }
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Multi-Modal Prompt Refinement System started`);
  logger.info(`📡 Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
  logger.info(`\n🏗️  Architecture Layers:`);
  logger.info(`   ├─ Perception Layer (Image/Document/Text)`);
  logger.info(`   ├─ Normalization Layer`);
  logger.info(`   ├─ Refinement Layer (Multi-Stage LLM)`);
  logger.info(`   └─ Validation Layer`);
  logger.info(`\n📊 Observable Endpoints:`);
  logger.info(`   ├─ GET /api/health`);
  logger.info(`   ├─ GET /api/layers/perception`);
  logger.info(`   ├─ GET /api/layers/normalization`);
  logger.info(`   └─ GET /api/layers/refinement`);
  logger.info(`\n🎯 Main Endpoint:`);
  logger.info(`   └─ POST /api/refine\n`);
});

export default app;
