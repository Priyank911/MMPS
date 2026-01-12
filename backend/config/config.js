import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // API Keys
  groqApiKey: process.env.GROQ_API_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,

  // Model Configuration
  groqModel: 'llama-3.3-70b-versatile',
  visionModel: 'allenai/molmo-2-8b:free', // OpenRouter free vision model

  // Pipeline Configuration
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocTypes: ['application/pdf'],

  // Timeout Configuration
  visionTimeout: 30000, // 30 seconds
  groqTimeout: 20000, // 20 seconds

  // Validation Configuration
  minConfidenceScore: 0.6,
  minPromptLength: 10,
  maxPromptLength: 5000
};

export default config;
