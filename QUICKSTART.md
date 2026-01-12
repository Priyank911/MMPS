# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional, for cloning)

## API Keys Required

You need **free** accounts for these services:

### 1. Groq API Key (Free)
1. Visit https://console.groq.com
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### 2. Hugging Face API Key (Free)
1. Visit https://huggingface.co
2. Create a free account
3. Go to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token

### 3. Cloudinary Account (Free)
1. Visit https://cloudinary.com
2. Sign up for free account
3. Note your **Cloud Name** from dashboard
4. Go to Settings → Upload
5. Click "Add upload preset"
6. Configure:
   - **Preset name**: Choose any name (e.g., "multimodal-uploads")
   - **Signing Mode**: Select **"Unsigned"**
   - **Folder**: (optional) e.g., "prompt-system"
7. Save and note the **Preset name**

## Step-by-Step Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env file with your favorite editor
# On Windows:
notepad .env

# Add your API keys:
# GROQ_API_KEY=your_groq_api_key_here
# HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Configure Frontend Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env file
# On Windows:
notepad .env

# Add your Cloudinary credentials:
# REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
# REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### Step 5: Start Backend Server

```bash
# From the backend directory
cd ../backend
npm start
```

You should see:
```
🚀 Multi-Modal Prompt Refinement System started
📡 Server running on port 5000
```

### Step 6: Start Frontend (New Terminal)

```bash
# From the frontend directory
cd frontend
npm start
```

Browser should open automatically at http://localhost:3000

## Testing the System

### Test 1: Text-Only Input
1. Enter text in the text area: "Create a REST API for managing tasks"
2. Click "Refine Prompt"
3. Wait for processing (~5-10 seconds)
4. View refined prompt and metrics

### Test 2: Image Input
1. Upload an image (drag & drop or click)
2. Wait for Cloudinary upload
3. Optionally add text context
4. Click "Refine Prompt"
5. See image description integrated into prompt

### Test 3: PDF Input
1. Upload a PDF document
2. Optionally add text context
3. Click "Refine Prompt"
4. See extracted text processed

### Test 4: Multi-Modal
1. Add text input
2. Upload 1-2 images
3. Upload a PDF
4. Click "Refine Prompt"
5. See all inputs merged and refined

## Verification Checklist

✅ Backend starts without errors
✅ Frontend opens in browser
✅ Text input works
✅ Image upload to Cloudinary works
✅ PDF upload works
✅ Processing completes successfully
✅ Refined prompt displays
✅ Metrics and confidence scores show

## Common First-Time Issues

### Issue: "Hugging Face API key not configured"
**Fix:** Add HUGGINGFACE_API_KEY to backend/.env

### Issue: "Groq API key not configured"
**Fix:** Add GROQ_API_KEY to backend/.env

### Issue: "Cloudinary configuration missing"
**Fix:** Add cloud name and preset to frontend/.env

### Issue: "Model is loading"
**Fix:** This is normal on first request. Wait 20-30 seconds and retry.

### Issue: Images won't upload
**Fix:** Ensure Cloudinary upload preset is set to "Unsigned" mode

### Issue: CORS errors
**Fix:** Ensure backend is running on port 5000 and frontend on 3000

## Performance Notes

**First Request:**
- Hugging Face model cold start: ~20-30 seconds
- Subsequent requests: ~5-10 seconds

**Image Processing:**
- Cloudinary upload: ~2-5 seconds per image
- BLIP captioning: ~3-8 seconds per image

**Text/PDF Processing:**
- Usually completes in 5-10 seconds total

## Next Steps

Once everything works:
1. Review the [Architecture Documentation](README.md#architecture)
2. Explore the [API Documentation](README.md#api-documentation)
3. Check health endpoints:
   - http://localhost:5000/api/health
   - http://localhost:5000/api/layers/perception
4. Review logs in backend/logs/ for debugging

## Getting Help

If you encounter issues:
1. Check backend console for error messages
2. Check browser console (F12) for frontend errors
3. Review backend/logs/combined.log
4. Verify all API keys are correct
5. Ensure ports 3000 and 5000 are not in use

## Production Deployment Notes

For production deployment, consider:
- Use environment-specific .env files
- Enable HTTPS for both frontend and backend
- Set up proper CORS policies
- Implement rate limiting
- Add authentication
- Use process managers (PM2)
- Set up monitoring and logging
- Configure CDN for frontend assets

---

**Happy Building! 🎉**
