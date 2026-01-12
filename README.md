# Multi-Modal Prompt System

A production-grade multi-modal prompt refinement system that processes heterogeneous inputs including text, images, and PDF documents through a sophisticated four-stage large language model pipeline. The system employs advanced computer vision capabilities through OpenRouter's vision API and leverages Groq's high-performance LLM infrastructure to deliver refined, contextually-aware prompts with comprehensive validation and confidence scoring.

## System Demonstration

<video width="100%" controls>
  <source src="shared/video/MMPS demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## API Architecture Validation

The system executes four distinct LLM API calls for each refinement request, corresponding to the four-stage pipeline architecture. The following metrics from the Groq dashboard demonstrate this multi-stage processing approach:

<table>
  <tr>
    <td><img src="shared/img/api call.png" alt="Groq API Call Metrics" width="100%"/></td>
    <td><img src="shared/img/api metric.png" alt="Groq API Performance Metrics" width="100%"/></td>
  </tr>
</table>

## Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Four-Stage LLM Pipeline](#four-stage-llm-pipeline)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## System Overview

The Multi-Modal Prompt System represents a comprehensive solution for transforming raw, multi-modal inputs into refined, production-ready prompts through intelligent processing and validation. The system architecture separates concerns across distinct processing layers, each with dedicated responsibilities and observable health metrics. This design enables granular monitoring, debugging, and optimization of the refinement pipeline while maintaining scalability and reliability in production environments.

The system processes inputs through a perception layer that handles image understanding via OpenRouter's vision models, PDF text extraction, and direct text validation. These heterogeneous inputs are normalized into a canonical textual representation before entering the refinement pipeline. The four-stage LLM pipeline then processes this normalized content through relevance checking, intent analysis, prompt refinement, and quality validation, with each stage employing specialized system prompts to guide the language model's behavior.

A key architectural principle is observability. Each processing layer exposes health check endpoints and structured metadata, allowing operators to monitor system performance, diagnose issues, and optimize processing workflows. The system employs comprehensive error handling with layer-specific error types that propagate context-rich information to both users and system logs, enabling rapid troubleshooting and graceful degradation under failure conditions.


## Architecture

The system architecture implements a layered pipeline design that separates concerns across distinct processing stages. Each layer has well-defined responsibilities, inputs, outputs, and error handling characteristics. This separation enables independent testing, monitoring, and optimization of each processing stage while maintaining end-to-end observability.

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ File Upload  │  │  Cloudinary  │  │   Result     │       │
│  │ & Selection  │  │  Integration │  │   Display    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           MODALITY ROUTING & ORCHESTRATION             │ │
│  │  Input Validation → Pipeline Coordination              │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              PERCEPTION LAYER (Observable)             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │  Image   │  │ Document │  │   Text   │              │ │
│  │  │ (OpenRtr)│  │  (PDF)   │  │ (Direct) │              │ │
│  │  └──────────┘  └──────────┘  └──────────┘              │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           NORMALIZATION LAYER (Observable)             │ │
│  │  Content Merging → Canonical Text Representation       │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          REFINEMENT LAYER - Four-Stage LLM             │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │ │
│  │  │ Relevance  │→ │   Intent   │→ │ Refinement │        │ │
│  │  │   Check    │  │  Analysis  │  │            │        │ │
│  │  └────────────┘  └────────────┘  └────────────┘        │ │
│  │                                         ↓              │ │
│  │                                  ┌────────────┐        │ │
│  │                                  │ Validation │        │ │
│  │                                  └────────────┘        │ │
│  │  Each stage: Independent Groq API call                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              VALIDATION & RESPONSE LAYER               │ │
│  │  Confidence Scoring → Error Handling → Formatting      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

The frontend layer provides a modern, responsive interface built with React that handles file uploads through drag-and-drop functionality, integrates with Cloudinary for image hosting, and displays rich formatted results. The backend implements the core processing pipeline with Express.js, coordinating between the perception layer for input understanding, the normalization layer for content standardization, and the refinement layer for LLM-powered prompt enhancement.

## Four-Stage LLM Pipeline

The refinement layer represents the core intelligence of the system, implementing a sophisticated four-stage pipeline where each stage makes an independent API call to the Groq LLM service. This design ensures that each processing stage benefits from a fresh context window and specialized system prompts that guide the model toward specific objectives. The sequential execution allows each stage to build upon the outputs of previous stages while maintaining clear separation of concerns.

### Stage 1: Relevance Check

The relevance check stage serves as the initial gatekeeper, evaluating whether the input content is appropriate for prompt refinement. This stage employs a permissive approach, accepting a wide range of inputs including images, questions, and exploratory requests while filtering out harmful, spam, or nonsensical content. The stage outputs a relevance score between 0 and 1, with scores above 0.6 considered relevant for image descriptions and vague requests. The system uses a rejection threshold of 0.3, meaning only clearly irrelevant content is filtered out at this stage. This permissive design ensures that users receive helpful assistance even when their initial inputs are somewhat ambiguous or exploratory in nature.

### Stage 2: Intent Analysis

Once relevance is established, the intent analysis stage examines the normalized content to extract the user's underlying goals, identify the problem domain, recognize key concepts and requirements, and detect any constraints or preferences. This stage produces a structured intent object containing the primary goal, domain classification, key concepts array, identified constraints, and confidence metrics. The intent analysis serves as the foundation for the subsequent refinement stage, ensuring that the refined prompt accurately reflects the user's objectives and requirements. This stage is particularly important for multi-modal inputs where the relationship between text, images, and documents may not be immediately apparent.

### Stage 3: Prompt Refinement

The refinement stage takes the extracted intent and normalized content to generate a professional, actionable prompt that addresses the user's needs. This stage employs sophisticated prompt engineering techniques to ensure clarity, specificity, and completeness. The refinement process considers the identified domain, incorporates key concepts, respects constraints, and structures the output in a format appropriate for the intended use case. The stage also generates improvement suggestions and documents any assumptions made during the refinement process. This metadata provides transparency into the refinement logic and allows users to understand how their inputs were interpreted and transformed.

### Stage 4: Validation

The final validation stage performs quality assessment of the refined prompt against multiple criteria including clarity, completeness, actionability, and adherence to the original intent. This stage outputs a validation object containing quality scores across various dimensions, identifies potential issues or gaps, suggests improvements if needed, and calculates an overall confidence score for the refinement. The validation stage ensures that only high-quality refined prompts reach the user, maintaining the system's reliability and usefulness. If validation identifies significant issues, the system can optionally trigger re-refinement or provide the user with specific feedback about areas needing clarification.

Each of these four stages executes as an independent API call to the Groq service using the llama-3.3-70b-versatile model with stage-specific system prompts. This architecture is evident in the API metrics shown above, where each refinement request generates exactly four LLM API calls with distinct processing characteristics and response times.


## Technology Stack

The system employs modern, production-grade technologies selected for performance, reliability, and developer experience. The technology choices reflect a balance between cutting-edge capabilities and proven stability, ensuring that the system can handle production workloads while remaining maintainable and extensible.

### Frontend Technologies

The frontend is built with React 18, leveraging the latest concurrent features and improved rendering performance. React Dropzone provides an intuitive drag-and-drop interface for file uploads with built-in accessibility features and mobile support. Axios serves as the HTTP client, offering promise-based request handling with interceptors for centralized error management. React Toastify delivers non-intrusive notifications for user feedback on operations and errors. Cloudinary integration enables cloud-based image hosting, providing reliable image delivery with automatic optimization and transformation capabilities. The user interface implements a professional black and white theme with compact, systematic formatting that emphasizes content over decoration.

### Backend Technologies

The backend runs on Node.js 16+ with Express 4.18.2 providing the web application framework. The Groq SDK connects to Groq's high-performance LLM infrastructure, specifically using the llama-3.3-70b-versatile model for all four pipeline stages. OpenRouter integration provides access to the allenai/molmo-2-8b:free vision model for image understanding, replacing deprecated HuggingFace inference endpoints. The pdf-parse library handles PDF text extraction without external dependencies, supporting both text-based and scanned documents. Multer middleware manages multipart form data for file uploads with configurable size limits and file type filtering. Winston logging framework provides structured logging with multiple transports for development and production environments. Configuration management uses dotenv for environment variable handling with validation and type coercion.


## Installation

The installation process requires setting up both the backend API server and the frontend React application. Each component has its own dependencies and configuration requirements. The following steps assume you have Node.js 16 or later installed on your system along with npm package manager.

### Prerequisites

Before beginning installation, ensure you have obtained the necessary API credentials from third-party services. You will need a Groq API key available free of charge from https://console.groq.com which provides access to their high-performance LLM infrastructure. An OpenRouter API key is required for vision capabilities, obtainable from https://openrouter.ai with free tier access to the allenai/molmo-2-8b model. Cloudinary credentials including cloud name and upload preset are necessary for image hosting, available through a free account at https://cloudinary.com.

### Backend Installation

Navigate to the backend directory and install dependencies using npm. Create a new environment configuration file by copying the example template and then populate it with your actual credentials. The backend requires configuration of the server port, Node environment, Groq API key for LLM processing, OpenRouter API key for vision capabilities, and the frontend URL for CORS configuration.

```bash
cd backend
npm install
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
PORT=5000
NODE_ENV=development

GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

FRONTEND_URL=http://localhost:3000
```

### Frontend Installation

Navigate to the frontend directory and install the React application dependencies. Create an environment configuration file from the template and configure it with your Cloudinary credentials and backend API endpoint.

```bash
cd frontend
npm install
cp .env.example .env
```

Edit the `.env` file with your Cloudinary configuration:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
REACT_APP_API_URL=http://localhost:5000
```

### Cloudinary Configuration

To set up Cloudinary for image hosting, create a free account at https://cloudinary.com and navigate to the Settings section. Under the Upload tab, create a new upload preset by clicking Add Upload Preset. Set the Signing Mode to Unsigned to allow client-side uploads without backend authentication. Note the Preset Name and Cloud Name from your dashboard. Use these values in your frontend environment configuration to enable image upload functionality.


## Configuration

The system configuration is managed through environment variables for both security and flexibility. Configuration files should never be committed to version control, and the repository includes appropriate gitignore rules to prevent accidental exposure of credentials. The backend configuration controls server behavior, API integrations, timeouts, and logging levels. The frontend configuration manages external service integrations and API endpoint references.

### Backend Environment Variables

The backend requires several critical environment variables to function properly. The PORT variable determines which network port the Express server listens on, defaulting to 5000 if not specified. NODE_ENV controls the runtime environment and should be set to development for local work or production for deployed instances, affecting logging verbosity and error handling. The GROQ_API_KEY provides authentication for the Groq LLM service and must be obtained from the Groq console. The OPENROUTER_API_KEY enables access to OpenRouter's vision models for image understanding. The FRONTEND_URL specifies the allowed origin for CORS requests, preventing unauthorized cross-origin access while enabling the frontend to communicate with the backend.

Additional optional configuration includes LOG_LEVEL for controlling Winston logging verbosity, VISION_TIMEOUT for setting the maximum processing time for image understanding requests, and LLM_TIMEOUT for controlling the maximum duration of LLM API calls. These timeout values help prevent long-running requests from consuming server resources indefinitely.

### Frontend Environment Variables

The frontend configuration centers around external service integration and backend communication. REACT_APP_CLOUDINARY_CLOUD_NAME identifies your Cloudinary account for image uploads. REACT_APP_CLOUDINARY_UPLOAD_PRESET specifies which upload preset to use, controlling image processing and storage options. REACT_APP_API_URL points to the backend server endpoint, typically http://localhost:5000 during development or the production backend URL when deployed.

These variables must be prefixed with REACT_APP_ to be accessible in the React application, as Create React App only exposes environment variables with this prefix to prevent accidental exposure of server-side secrets in the client bundle.

## Deployment

The system is designed for cloud deployment with the backend hosted on Render and the frontend on Vercel. This architecture separates concerns, allowing each component to scale independently while leveraging platform-specific optimizations. Render provides a robust Node.js hosting environment with persistent storage and long-running process support, essential for handling file uploads and LLM processing. Vercel offers optimized static site hosting with global CDN distribution, ensuring fast frontend delivery worldwide.

### Backend Deployment on Render

Create a new Web Service on Render and connect it to your GitHub repository. Configure the build command as `npm install` and the start command as `npm start`. Set the environment to Node and specify Node.js 16 or later as the runtime version. Add all required environment variables through the Render dashboard, including GROQ_API_KEY, OPENROUTER_API_KEY, NODE_ENV set to production, and PORT set to 5000. Critically, configure FRONTEND_URL to point to your Vercel deployment URL to enable proper CORS handling.

Render automatically deploys on every push to the main branch and provides a production URL in the format https://your-service-name.onrender.com. The free tier includes automatic HTTPS, environment variable management, and continuous deployment from GitHub. Note that free tier services may spin down after periods of inactivity, resulting in cold start delays on the first request after inactivity.

### Frontend Deployment on Vercel

Import your repository into Vercel and select the frontend directory as the root directory for deployment. Vercel automatically detects the React application and configures appropriate build settings. Add environment variables through the Vercel dashboard, including REACT_APP_CLOUDINARY_CLOUD_NAME, REACT_APP_CLOUDINARY_UPLOAD_PRESET, and REACT_APP_API_URL set to your Render backend URL. Vercel builds the application using `npm run build` and serves the static files from the build directory.

The deployment is accessible at a Vercel-provided URL in the format https://your-app.vercel.app with automatic HTTPS and global CDN distribution. Vercel automatically deploys on every push to the main branch and provides preview deployments for pull requests, enabling safe testing of changes before merging to production.

### Post-Deployment Verification

After deploying both components, verify the deployment by accessing the frontend URL and testing the complete flow from file upload through prompt refinement. Check the Render logs to confirm the backend is receiving requests and processing them successfully. Verify that CORS is configured correctly by ensuring the frontend can communicate with the backend without cross-origin errors. Test all input modalities including text input, image uploads, and PDF document processing to confirm end-to-end functionality. Monitor the API metrics in the Groq dashboard to confirm that each refinement request generates exactly four LLM API calls corresponding to the four pipeline stages.


## Usage

The system provides a streamlined interface for multi-modal prompt refinement with support for text, images, and PDF documents. Users can combine multiple input types in a single refinement request, allowing for rich, contextual prompt generation that incorporates information from diverse sources.

### Starting the Development Environment

For local development, start the backend server first by navigating to the backend directory and running the start command. The server will initialize on port 5000 by default and begin listening for requests. Winston logging will output startup information and health check results to the console.

```bash
cd backend
npm start
```

In a separate terminal window, start the frontend development server by navigating to the frontend directory and running the React start script. The application will automatically open in your default browser at http://localhost:3000 with hot module replacement enabled for rapid development.

```bash
cd frontend
npm start
```

### Providing Input

The interface supports three input modalities that can be used individually or in combination. For text input, type or paste content directly into the text area provided on the interface. The system accepts plain text, structured data, or even code snippets that should be refined into prompts.

For image inputs, use the drag-and-drop zone or click to select files from your file system. Supported image formats include JPEG, PNG, and GIF files up to 10MB in size. Images are automatically uploaded to Cloudinary and then processed through the OpenRouter vision model to generate detailed descriptions including any visible text through OCR capabilities. The vision model analyzes image content, identifies objects, scenes, and text, and produces a comprehensive textual description that feeds into the refinement pipeline.

For document inputs, drag and drop PDF files or use the file selector to upload documents. The system extracts text content from PDFs using the pdf-parse library, supporting both text-based PDFs and scanned documents. Extracted text is combined with other inputs during the normalization phase before entering the refinement pipeline.

### Executing Refinement

Once you have provided your desired inputs, click the Refine Prompt button to submit your content for processing. The system will display a loading indicator while processing occurs. During this time, the backend is executing the full pipeline including perception, normalization, and all four stages of the LLM refinement process. Total processing time typically ranges from 3 to 8 seconds depending on input complexity and API response times.

### Viewing Results

After processing completes, the interface displays the refined prompt along with detailed metadata about the refinement process. The result display includes several key sections. The refined prompt section shows the final, polished prompt that incorporates all your inputs and reflects the identified intent. The intent analysis section breaks down what the system understood as your primary goal, the problem domain, key concepts, and any constraints or preferences detected in your input.

The improvements section lists specific enhancements made during refinement, explaining how the system transformed your raw input into a more structured and actionable prompt. The assumptions section documents any inferences or assumptions made during processing, providing transparency into the refinement logic. The validation results section shows quality scores across multiple dimensions including clarity, completeness, and actionability.

The interface provides a toggle between TXT and JSON format views. The TXT view presents information in a human-readable paragraph format optimized for quick comprehension. The JSON view exposes the complete structured data including all metadata fields, confidence scores, and processing timestamps, useful for debugging or integration with other systems.

Key concepts identified during intent analysis are highlighted with visual tags, making it easy to verify that the system correctly understood the important elements of your request. Overall confidence scores provide a quantitative measure of refinement quality, with higher scores indicating greater confidence in the result.

## API Documentation

The backend exposes a RESTful API that handles multi-modal input processing and provides health monitoring capabilities. All endpoints return JSON responses with consistent structure for success and error cases. The API implements comprehensive error handling with appropriate HTTP status codes and descriptive error messages.

### Primary Refinement Endpoint

The POST /api/refine endpoint serves as the main entry point for prompt refinement requests. This endpoint accepts multipart form data containing combinations of text inputs, image URLs, and PDF document files. The endpoint processes all provided inputs through the complete pipeline and returns a structured response containing the refined prompt, metadata, and confidence scores.

**Request Specification:**

```
POST /api/refine
Content-Type: multipart/form-data

Fields:
- textInputs: Array of strings (optional)
- imageUrls: Array of Cloudinary URLs (optional)
- documents: Array of PDF files (optional)
```

**Response Specification:**

```json
{
  "success": true,
  "data": {
    "pipelineId": "pipeline_1234567890_abc123",
    "success": true,
    "rejected": false,
    "refinedPrompt": "Your refined, professional prompt incorporating all inputs...",
    "details": {
      "intent": {
        "primaryGoal": "Identified user objective",
        "domain": "problem domain classification",
        "concepts": ["key", "concepts", "identified"],
        "constraints": ["any", "constraints", "detected"]
      },
      "improvements": [
        "List of specific improvements made",
        "Transformations applied during refinement"
      ],
      "assumptions": [
        "Any assumptions made during processing",
        "Inferences drawn from input"
      ],
      "validationResults": {
        "clarity": 0.9,
        "completeness": 0.85,
        "actionability": 0.88,
        "issues": []
      }
    },
    "confidence": {
      "overallConfidence": 0.85,
      "scores": {
        "perception": 0.9,
        "intent": 0.82,
        "refinement": 0.87,
        "validation": 0.85
      }
    },
    "metadata": {
      "totalProcessingTime": 3500,
      "perceptionLayer": {
        "processedImages": 1,
        "processedDocuments": 0,
        "processedText": 1
      },
      "refinementLayer": {
        "stagesExecuted": 4,
        "llmCalls": 4,
        "totalTokens": 2450
      }
    }
  }
}
```

### Health Monitoring Endpoints

The API provides several health check endpoints for monitoring system status and diagnosing issues. The GET /api/health endpoint returns comprehensive health information for all pipeline layers, including operational status, recent error counts, and performance metrics. This endpoint is useful for monitoring dashboards and automated health checks.

```
GET /api/health

Response:
{
  "status": "operational",
  "layers": {
    "perception": {
      "status": "operational",
      "capabilities": ["image", "document", "text"]
    },
    "normalization": {
      "status": "operational"
    },
    "refinement": {
      "status": "operational",
      "stages": 4
    }
  },
  "timestamp": "2026-01-11T10:30:00.000Z"
}
```

Layer-specific health endpoints provide detailed information about individual pipeline stages. The GET /api/layers/perception endpoint shows perception layer status including supported modalities and recent processing statistics. The GET /api/layers/normalization endpoint provides normalization layer status and recent operation counts. The GET /api/layers/refinement endpoint shows refinement layer status including LLM model information and API connectivity.

### Error Response Format

All error responses follow a consistent structure with success set to false, an error object containing type and message fields, and an optional details field providing additional context. HTTP status codes appropriately reflect the error category with 400 for client errors, 500 for server errors, and 503 for service unavailability.

```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Human-readable error description",
    "details": "Additional context when available"
  }
}
```

## Troubleshooting

Common issues during development and deployment can typically be resolved through systematic checking of configuration, credentials, and service availability. This section documents frequently encountered problems and their solutions.

### OpenRouter API Errors

If you encounter errors related to image processing stating that the vision model is unavailable or returning unexpected responses, first verify that your OPENROUTER_API_KEY is correctly set in the backend environment variables. Confirm that the key has access to the allenai/molmo-2-8b:free model by checking your OpenRouter dashboard. Ensure that image URLs are publicly accessible and properly formatted, as the vision API requires the ability to fetch images from the provided URLs.

The OpenRouter API has rate limits even on free tier models, so if you receive rate limit errors, wait a few moments before retrying your request. Check the OpenRouter status page to confirm that the service and specific model are operational.

### Cloudinary Upload Failures

When image uploads to Cloudinary fail, verify that your REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET are correctly configured in the frontend environment variables. Confirm that the upload preset exists in your Cloudinary account and is set to unsigned mode. Check that the image file size does not exceed Cloudinary's limits for your account tier. Examine the browser console for detailed error messages from the Cloudinary upload widget.

### Groq API Issues

If the refinement pipeline fails with Groq API errors, confirm that your GROQ_API_KEY is valid and has not exceeded rate limits. The free tier has generous limits but can be exceeded with rapid successive requests. Check the Groq console to monitor your API usage and confirm that the llama-3.3-70b-versatile model is available. If you see timeout errors, check your network connection and consider increasing the LLM_TIMEOUT value in your backend configuration.

### PDF Processing Errors

When PDF text extraction returns empty results or errors, ensure that the PDF file contains extractable text rather than scanned images, as the pdf-parse library cannot perform OCR on image-based PDFs. Verify that the PDF file is not corrupted and can be opened in a standard PDF viewer. Check that the PDF file size is within acceptable limits defined in the backend Multer configuration.

### CORS Errors in Production

If the frontend cannot communicate with the backend in production due to CORS errors, verify that the FRONTEND_URL environment variable on Render is set to your exact Vercel deployment URL including the https protocol. Confirm that both services are deployed and accessible. Check the Render logs to see if requests are reaching the backend. Ensure that the frontend REACT_APP_API_URL points to the correct Render backend URL.

### Development Environment Issues

For local development problems, confirm that both backend and frontend are running on their expected ports (5000 and 3000 respectively) without port conflicts. Verify that all environment variables are set in the respective .env files. Check that Node.js version is 16 or later using node --version. Clear npm cache and reinstall dependencies if you encounter module resolution errors. Examine the terminal output for both backend and frontend for detailed error messages and stack traces.

For additional assistance, consult the comprehensive deployment guides in the repository including DEPLOYMENT_GUIDE.md and QUICK_DEPLOY.md which contain detailed troubleshooting sections and platform-specific configuration guidance.

---

This system demonstrates production-grade architecture for multi-modal prompt refinement, combining modern frontend technologies with sophisticated backend processing through a four-stage LLM pipeline. The observable architecture enables comprehensive monitoring and debugging while the layered design ensures maintainability and scalability in production environments.
