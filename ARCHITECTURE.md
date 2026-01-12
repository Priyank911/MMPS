# 🏗️ Architecture Deep Dive

## System Architecture

### High-Level Flow

```
User Input (Text/Images/PDFs)
         ↓
    Frontend UI
         ↓
  Cloudinary Upload (Images Only)
         ↓
    Backend API (/api/refine)
         ↓
┌────────────────────────────────┐
│   MODALITY ROUTING LAYER       │
│   • Detect input types          │
│   • Validate inputs             │
│   • Route to appropriate        │
│     perception handlers         │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│    PERCEPTION LAYER            │
│                                │
│  ┌──────────────────────┐     │
│  │ Image Perception     │     │
│  │ • Fetch from URL     │     │
│  │ • Send to HF BLIP    │     │
│  │ • Extract caption    │     │
│  └──────────────────────┘     │
│                                │
│  ┌──────────────────────┐     │
│  │ Document Perception  │     │
│  │ • Read PDF file      │     │
│  │ • Parse with pdf-lib │     │
│  │ • Extract text       │     │
│  └──────────────────────┘     │
│                                │
│  ┌──────────────────────┐     │
│  │ Text Perception      │     │
│  │ • Validate input     │     │
│  │ • Pass through       │     │
│  └──────────────────────┘     │
│                                │
│  Output: Array of perception   │
│  results with metadata         │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│   NORMALIZATION LAYER          │
│   • Group by modality          │
│   • Create canonical text      │
│   • Merge metadata             │
│   • Calculate confidence       │
│                                │
│   Output: Single normalized    │
│   text with structure          │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│   REFINEMENT LAYER             │
│   (Multi-Stage LLM Pipeline)   │
│                                │
│   Stage 1: Relevance Check     │
│   ┌──────────────────────┐    │
│   │ System Prompt:        │    │
│   │ "Analyze relevance"   │    │
│   │                       │    │
│   │ LLM: Groq Mixtral     │    │
│   │                       │    │
│   │ Output: is_relevant,  │    │
│   │ relevance_score       │    │
│   └──────────────────────┘    │
│           ↓                    │
│   [If not relevant: REJECT]    │
│           ↓                    │
│   Stage 2: Intent Analysis     │
│   ┌──────────────────────┐    │
│   │ System Prompt:        │    │
│   │ "Extract intent"      │    │
│   │                       │    │
│   │ LLM: Groq Mixtral     │    │
│   │                       │    │
│   │ Output: intent,       │    │
│   │ domain, concepts      │    │
│   └──────────────────────┘    │
│           ↓                    │
│   [If confidence < 0.6: REJECT]│
│           ↓                    │
│   Stage 3: Prompt Refinement   │
│   ┌──────────────────────┐    │
│   │ System Prompt:        │    │
│   │ "Refine prompt"       │    │
│   │                       │    │
│   │ LLM: Groq Mixtral     │    │
│   │                       │    │
│   │ Output: refined text, │    │
│   │ improvements          │    │
│   └──────────────────────┘    │
│           ↓                    │
│   Stage 4: Validation          │
│   ┌──────────────────────┐    │
│   │ System Prompt:        │    │
│   │ "Validate quality"    │    │
│   │                       │    │
│   │ LLM: Groq Mixtral     │    │
│   │                       │    │
│   │ Output: is_valid,     │    │
│   │ quality metrics       │    │
│   └──────────────────────┘    │
│                                │
│   Output: Complete pipeline    │
│   results with all stages      │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│   VALIDATION & ASSEMBLY        │
│   • Calculate confidence       │
│   • Assemble final result      │
│   • Format metadata            │
└────────────────────────────────┘
         ↓
    JSON Response to Frontend
         ↓
    Human-Readable Display
```

## Component Architecture

### Backend Components

```
backend/
│
├── server.js                 # Express app entry point
├── config/
│   ├── config.js            # Centralized configuration
│   └── logger.js            # Winston logging setup
│
├── routes/
│   └── api.js               # API route definitions
│
├── services/
│   ├── perception/
│   │   ├── imagePerception.js      # HuggingFace BLIP integration
│   │   ├── documentPerception.js   # PDF parsing
│   │   └── textPerception.js       # Text processing
│   │
│   ├── normalization/
│   │   └── normalizationService.js # Content merger
│   │
│   ├── refinement/
│   │   ├── prompts.js              # System prompts for each stage
│   │   └── refinementService.js    # Multi-stage LLM orchestration
│   │
│   ├── validation/
│   │   └── validationService.js    # Input/output validation
│   │
│   └── orchestration/
│       └── pipelineOrchestrator.js # Main pipeline controller
│
└── utils/
    └── errors.js            # Custom error classes
```

### Frontend Components

```
frontend/
│
├── src/
│   ├── App.js               # Main application component
│   ├── config.js            # API and Cloudinary config
│   │
│   ├── components/
│   │   ├── TextInput/
│   │   │   ├── TextInput.js
│   │   │   └── TextInput.css
│   │   │
│   │   ├── FileUpload/
│   │   │   ├── FileUpload.js       # Drag-drop file upload
│   │   │   └── FileUpload.css
│   │   │
│   │   └── ResultDisplay/
│   │       ├── ResultDisplay.js    # Rich result visualization
│   │       └── ResultDisplay.css
│   │
│   ├── services/
│   │   └── api.js           # Backend API client
│   │
│   └── utils/
│       └── fileUtils.js     # File validation, Cloudinary upload
│
└── public/
    └── index.html
```

## Data Flow

### 1. Input Processing

**Text Input:**
```javascript
User types text
    ↓
TextInput component validates
    ↓
Stored in App state
    ↓
Sent to backend as textInputs array
```

**Image Input:**
```javascript
User drops image
    ↓
FileUpload component validates (type, size)
    ↓
Upload to Cloudinary via uploadToCloudinary()
    ↓
Receive secure_url
    ↓
Sent to backend as imageUrls array
    ↓
Backend fetches from URL for BLIP processing
```

**PDF Input:**
```javascript
User uploads PDF
    ↓
FileUpload component validates
    ↓
Stored as File object
    ↓
Sent to backend via multipart/form-data
    ↓
Backend saves temporarily, processes, deletes
```

### 2. Backend Processing

**Request Reception:**
```javascript
POST /api/refine receives:
{
  textInputs: ["text1", "text2"],
  imageUrls: ["https://cloudinary.../img1.jpg"],
  documents: [File, File]
}
```

**Perception Layer Processing:**
```javascript
For each text input:
  → textPerception.processText()
  → Returns: { type: 'text', content: text, metadata: {...} }

For each image URL:
  → imagePerception.processImageFromUrl(url)
  → Fetches image
  → Sends to Hugging Face BLIP API
  → Returns: { type: 'image', content: caption, metadata: {...} }

For each document:
  → documentPerception.processPdf(path)
  → Parses PDF
  → Returns: { type: 'document', content: text, metadata: {...} }
```

**Normalization:**
```javascript
All perception results → normalizationService.normalize()
    ↓
Groups by type (text, image, document)
    ↓
Creates structured sections
    ↓
Merges into canonical text:

"=== Multi-Modal Input Consolidation ===

[Direct Text Input]
User's text content...

---

[Visual Content Descriptions]
Image 1: A description of the image...
Image 2: Another image description...

---

[Document Content]
Document 1 (5 pages):
Extracted PDF text...

=== End of Input ==="
```

**Refinement Pipeline:**
```javascript
Stage 1: relevanceCheck(normalizedText)
  → Groq API with RELEVANCE_CHECK_PROMPT
  → Returns: { is_relevant, relevance_score, recommendation }
  → If not relevant: EXIT with rejection

Stage 2: analyzeIntent(normalizedText)
  → Groq API with INTENT_ANALYSIS_PROMPT
  → Returns: { intent, domain, key_concepts, constraints, confidence }
  → If confidence < 0.6: EXIT with rejection

Stage 3: refinePrompt(normalizedText, intentAnalysis)
  → Groq API with PROMPT_REFINEMENT_PROMPT
  → Returns: { refined_prompt, improvements, assumptions, confidence }

Stage 4: validatePrompt(refinedPrompt)
  → Groq API with VALIDATION_PROMPT
  → Returns: { is_valid, quality_score, validation_results }
```

**Final Assembly:**
```javascript
Calculate overall confidence from all stages
Assemble structured response:
{
  success: true/false,
  rejected: true/false,
  refinedPrompt: "...",
  details: { intent, improvements, assumptions, validationResults },
  confidence: { overallConfidence, scores: {...} },
  metadata: { timings, pipelineId, layerBreakdown }
}
```

### 3. Frontend Display

**Result Processing:**
```javascript
Response received
    ↓
ResultDisplay component renders:
    ↓
If rejected:
  → Show rejection message
  → Display recommendations

If success:
  → Show refined prompt (formatted, readable)
  → Display intent analysis
  → Show improvements made
  → List assumptions
  → Visualize quality metrics (progress bars)
  → Expandable processing metadata
```

## Error Handling Flow

```
Error occurs in any layer
    ↓
Wrapped in layer-specific error class
(PerceptionError, NormalizationError, etc.)
    ↓
Caught by orchestrator
    ↓
Logged with Winston (file + console)
    ↓
Transformed to API error response
    ↓
Sent to frontend with:
- User-friendly message
- Layer information
- Error details (dev mode)
    ↓
Frontend displays toast notification
```

## Observability & Monitoring

### Health Check Endpoints

**System Health:**
```
GET /api/health
Response: Status of all layers
```

**Layer-Specific Health:**
```
GET /api/layers/perception
GET /api/layers/normalization
GET /api/layers/refinement

Each returns:
- Layer status
- Component health
- Timestamp
```

### Logging Strategy

**Winston Logger Levels:**
- **Error**: All errors with stack traces
- **Warn**: Partial failures, degraded performance
- **Info**: Pipeline stages, successful operations
- **Debug**: Detailed internal state (dev only)

**Log Files:**
- `logs/error.log`: Error-level only
- `logs/combined.log`: All levels
- Console: Colored output (dev mode)

### Metadata Tracking

Every pipeline execution includes:
- **pipelineId**: Unique identifier
- **Processing times**: Per-layer breakdown
- **Confidence scores**: Multi-dimensional
- **Input metadata**: Counts, types, sizes

## Security Considerations

### Current Implementation

✅ Input validation (file types, sizes)
✅ CORS configuration
✅ Environment variable protection
✅ Temporary file cleanup
✅ HTTPS for external APIs

### Production Recommendations

- Add authentication/authorization
- Implement rate limiting per user
- Add request signing for API calls
- Enable CSRF protection
- Sanitize all text inputs
- Implement file scanning for malware
- Add audit logging
- Use API gateway for backend

## Scalability Considerations

### Current Limitations

- Synchronous processing (blocking)
- No caching
- Single server instance
- In-memory state

### Scaling Strategies

**Horizontal Scaling:**
- Deploy multiple backend instances
- Use load balancer (nginx, AWS ALB)
- Stateless design enables easy scaling

**Caching:**
- Cache image captions (Redis)
- Cache PDF extractions (Redis)
- Cache LLM responses for identical inputs

**Async Processing:**
- Use message queue (RabbitMQ, AWS SQS)
- Background workers for long tasks
- WebSocket for real-time updates

**Database:**
- Store processed results
- User history and preferences
- Analytics and metrics

## Technology Choices Rationale

### Why Groq?
- **Free tier** with generous limits
- **Fast inference** (<1s for most prompts)
- **Good models** (Mixtral-8x7b)
- Simple API

### Why BLIP for Images?
- **State-of-art** image captioning
- **Available on Hugging Face** Inference API
- **Free tier** sufficient for demo
- Good accuracy

### Why Cloudinary?
- **Free tier** with good limits
- **Reliable** global CDN
- **Simple API** for uploads
- Automatic optimization

### Why React?
- **Component-based** architecture
- **Rich ecosystem** (dropzone, toastify)
- **Developer experience**
- Industry standard

### Why Express?
- **Minimal** and flexible
- **Middleware** ecosystem
- **Easy to understand**
- Industry standard for Node.js

---

This architecture demonstrates production-grade patterns while remaining accessible for learning and demonstration purposes.
