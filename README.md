# 🚀 Multi-Modal Prompt Refinement System

A production-grade, full-stack system that processes multi-modal inputs (text, images, PDFs) through a layered, observable pipeline to generate refined, professional prompts using AI-powered analysis and refinement.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Architecture Details](#architecture-details)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

This system demonstrates production-grade engineering principles by implementing a **layered, observable architecture** that processes heterogeneous inputs through distinct pipeline stages:

1. **Perception Layer**: Extracts meaning from images (via BLIP), PDFs, and text
2. **Normalization Layer**: Converts multi-modal inputs to canonical text representation
3. **Refinement Layer**: Multi-stage LLM processing (intent analysis, refinement, validation, relevance checking)
4. **Presentation Layer**: Human-readable output with structured metadata

### Key Differentiators

- ✅ **Observable Pipeline**: Each layer has dedicated health check endpoints
- ✅ **Modality Routing**: Intelligent detection and processing of different input types
- ✅ **Cloud Integration**: Cloudinary for image storage, Hugging Face for perception
- ✅ **Multi-Stage LLM**: Same model, different system prompts for specialized tasks
- ✅ **Production Error Handling**: Comprehensive validation, error propagation, user feedback
- ✅ **Structured Output**: Human-readable UI, internal structured schema

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Drag & Drop  │  │  Cloudinary  │  │   Result     │     │
│  │  File Upload │  │  Integration │  │   Display    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           MODALITY ROUTING & ORCHESTRATION              │ │
│  │  • Input Validation  • Pipeline Coordination            │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              PERCEPTION LAYER (Observable)              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Image   │  │ Document │  │   Text   │            │ │
│  │  │  (BLIP)  │  │  (PDF)   │  │ (Direct) │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           NORMALIZATION LAYER (Observable)              │ │
│  │  • Content Merging  • Canonical Text Representation    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          REFINEMENT LAYER - Multi-Stage LLM             │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │ │
│  │  │ Relevance  │→ │   Intent   │→ │ Refinement │       │ │
│  │  │   Check    │  │  Analysis  │  │            │       │ │
│  │  └────────────┘  └────────────┘  └────────────┘       │ │
│  │                                         ↓               │ │
│  │                                  ┌────────────┐        │ │
│  │                                  │ Validation │        │ │
│  │                                  └────────────┘        │ │
│  │  All stages use Groq API with different prompts        │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              VALIDATION & RESPONSE LAYER                │ │
│  │  • Confidence Scoring  • Error Handling  • Formatting  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Features

### Frontend
- 📤 **Drag-and-drop file upload** with visual feedback
- 🖼️ **Image preview** with thumbnails and metadata
- 📝 **Editable text areas** for direct input
- ☁️ **Cloudinary integration** for cloud image storage
- 🎨 **Modern, responsive UI** with gradient design
- ⚠️ **Comprehensive error handling** with toast notifications
- 📊 **Rich result display** with metrics and insights

### Backend
- 🔍 **Image Understanding**: Salesforce BLIP via Hugging Face API
- 📄 **PDF Text Extraction**: pdf-parse library
- 🤖 **Multi-Stage LLM Pipeline**: Groq API (Mixtral-8x7b)
  - Intent Analysis
  - Prompt Refinement
  - Quality Validation
  - Relevance Checking
- 📈 **Observable Architecture**: Health check endpoints for each layer
- 🛡️ **Robust Error Handling**: Layer-specific error types and propagation
- ✅ **Input Validation**: File type, size, and content validation
- 📊 **Confidence Scoring**: Multi-dimensional quality metrics

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **React Dropzone** - File upload
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Cloudinary** - Image hosting

### Backend
- **Node.js & Express** - Server framework
- **Groq SDK** - LLM API (Free tier)
- **Hugging Face API** - Image captioning
- **pdf-parse** - PDF text extraction
- **Multer** - File upload handling
- **Winston** - Logging
- **dotenv** - Configuration

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Groq API key (free at https://console.groq.com)
- Hugging Face API key (free at https://huggingface.co/settings/tokens)
- Cloudinary account (free at https://cloudinary.com)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file from template:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

FRONTEND_URL=http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file from template:
```bash
cp .env.example .env
```

Edit `.env` with your Cloudinary credentials:
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
REACT_APP_API_URL=http://localhost:5000
```

### Cloudinary Configuration

1. Go to https://cloudinary.com and create a free account
2. Navigate to Settings → Upload → Add upload preset
3. Set **Signing Mode** to "Unsigned"
4. Note the **Preset name** and **Cloud name**
5. Use these values in your frontend `.env` file

## 🚀 Usage

### Start Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000`

### Using the System

1. **Add Text Input** (optional): Type or paste text directly
2. **Upload Images** (optional): Drag & drop or click to select images
   - Images are automatically uploaded to Cloudinary
   - BLIP model generates descriptions
3. **Upload PDFs** (optional): Drag & drop or click to select PDF documents
   - Text is extracted from PDFs
4. **Click "Refine Prompt"**: Submit all inputs for processing
5. **View Results**: See refined prompt with insights and metrics

## 📚 API Documentation

### Main Endpoints

#### `POST /api/refine`
Processes multi-modal inputs through the complete pipeline.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `textInputs`: string[] (optional)
  - `imageUrls`: string[] (optional, Cloudinary URLs)
  - `documents`: File[] (optional, PDF files)

**Response:**
```json
{
  "success": true,
  "data": {
    "pipelineId": "pipeline_1234567890_abc123",
    "success": true,
    "rejected": false,
    "refinedPrompt": "Complete refined prompt...",
    "details": {
      "intent": { ... },
      "improvements": [...],
      "assumptions": [...],
      "validationResults": { ... }
    },
    "confidence": {
      "overallConfidence": 0.85,
      "scores": { ... }
    },
    "metadata": {
      "totalProcessingTime": 3500,
      "perceptionLayer": { ... },
      "normalizationLayer": { ... },
      "refinementLayer": { ... }
    }
  }
}
```

#### `GET /api/health`
Returns health status of all pipeline layers.

**Response:**
```json
{
  "status": "operational",
  "layers": {
    "perception": { ... },
    "normalization": { ... },
    "refinement": { ... }
  },
  "timestamp": "2026-01-11T..."
}
```

#### Observable Layer Endpoints
- `GET /api/layers/perception` - Perception layer status
- `GET /api/layers/normalization` - Normalization layer status
- `GET /api/layers/refinement` - Refinement layer status

## 🏛️ Architecture Details

### Perception Layer

**Image Processing:**
- Uses Salesforce BLIP via Hugging Face Inference API
- Accepts images from Cloudinary URLs
- Returns caption with confidence score
- Handles model loading states

**Document Processing:**
- Extracts text from PDF files using pdf-parse
- Preserves document structure
- Returns page count and metadata

**Text Processing:**
- Direct pass-through with validation
- Word count and length metrics

### Normalization Layer

Converts heterogeneous perception outputs into canonical textual representation:
- Groups inputs by type
- Creates structured sections
- Preserves metadata
- Generates aggregate confidence scores

### Refinement Layer (Multi-Stage LLM)

Uses **Groq API** with **Mixtral-8x7b-32768** model:

1. **Relevance Check**: Filters inappropriate/irrelevant inputs
2. **Intent Analysis**: Extracts goals, domain, concepts, constraints
3. **Prompt Refinement**: Creates professional, actionable prompt
4. **Validation**: Quality assessment against multiple criteria

Each stage uses the same LLM with different system-level prompts to ensure specialized behavior.

### Error Handling

**Layer-Specific Errors:**
- `PerceptionError` - Image/document processing failures
- `NormalizationError` - Content merging issues
- `RefinementError` - LLM API failures
- `ValidationError` - Input validation failures
- `RoutingError` - Modality detection issues

**Error Propagation:**
- Errors include layer information
- User-friendly messages in frontend
- Detailed logging for debugging
- Graceful degradation when possible

## 🔧 Troubleshooting

### Common Issues

**1. Hugging Face Model Loading Error**
```
Error: Image perception model is loading
```
**Solution:** Wait 20-30 seconds and retry. Cold start loads model.

**2. Cloudinary Upload Failed**
```
Error: Failed to upload image to Cloudinary
```
**Solution:** Check `.env` credentials and upload preset settings.

**3. Groq Rate Limit**
```
Error: Rate limit exceeded
```
**Solution:** Wait a moment and retry. Free tier has rate limits.

**4. PDF Extraction Empty**
```
Error: PDF appears to be empty
```
**Solution:** Ensure PDF contains extractable text (not scanned images).

### Debug Mode

Enable verbose logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

Check layer health:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/layers/perception
```

## 🎓 Key Engineering Decisions

1. **Layered Architecture**: Clear separation of concerns enables testing, debugging, and monitoring
2. **Observable Design**: Each layer exposes health/status endpoints
3. **Cloud-First Images**: Cloudinary ensures reliable, scalable image hosting
4. **Multi-Stage LLM**: Single model with different prompts = cost-effective specialization
5. **Structured + Human Output**: Internal JSON schema + user-friendly display
6. **Comprehensive Validation**: Input validation, confidence scoring, rejection handling
7. **Error Propagation**: Layer-specific errors with clear user feedback

## 📝 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding authentication/authorization
- Implementing rate limiting
- Adding caching layers
- Database for result persistence
- Kubernetes deployment
- Monitoring (Prometheus/Grafana)
- Load balancing

---

**Built with ❤️ to demonstrate production-grade full-stack architecture**
