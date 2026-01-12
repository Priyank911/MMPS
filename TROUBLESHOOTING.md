# 🔧 Troubleshooting & FAQ

## Common Issues and Solutions

### Backend Issues

#### 1. Server Won't Start

**Error:** `Error: Cannot find module 'express'`

**Solution:**
```bash
cd backend
npm install
```

---

**Error:** `Error: GROQ_API_KEY is not defined`

**Solution:**
1. Ensure `.env` file exists in `backend/` directory
2. Check that `GROQ_API_KEY=your_key_here` is set
3. No spaces around `=` sign
4. No quotes around the key value

---

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
Port 5000 is already in use. Either:

**Option A - Kill the process:**
```powershell
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Option B - Use different port:**
Edit `backend/.env`:
```env
PORT=5001
```

Then update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001
```

---

#### 2. Hugging Face API Issues

**Error:** `Image perception model is loading, please try again in a few seconds`

**Solution:**
This is **normal** on the first request. Hugging Face loads models on-demand.
- Wait 20-30 seconds
- Retry the request
- Subsequent requests will be faster

---

**Error:** `Failed to process image: 503 Service Unavailable`

**Solution:**
The Hugging Face Inference API is temporarily overloaded.
- Wait a few minutes and retry
- Try a different time of day
- Consider using Hugging Face Pro for dedicated endpoints

---

**Error:** `Hugging Face API key not configured`

**Solution:**
1. Get free API key from https://huggingface.co/settings/tokens
2. Add to `backend/.env`:
   ```env
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```
3. Restart backend server

---

#### 3. Groq API Issues

**Error:** `Rate limit exceeded, please try again later`

**Solution:**
Free tier rate limits hit. Wait 60 seconds and retry.

For higher limits:
- Check Groq console for current limits
- Consider Groq paid plans
- Implement client-side rate limiting

---

**Error:** `Groq API call failed: 401 Unauthorized`

**Solution:**
Invalid API key.
1. Verify key at https://console.groq.com
2. Generate new key if needed
3. Update `backend/.env`
4. Restart server

---

#### 4. PDF Processing Issues

**Error:** `PDF appears to be empty or contains no extractable text`

**Solution:**
The PDF contains scanned images, not text.

Workarounds:
- Use PDFs with actual text (not scanned documents)
- Use OCR tool to convert scanned PDF to text first
- Manually copy text from PDF and use text input instead

---

**Error:** `Failed to process PDF document: Invalid PDF structure`

**Solution:**
PDF file is corrupted or invalid.
- Try opening in Adobe Reader to verify
- Re-download the PDF
- Try a different PDF file

---

### Frontend Issues

#### 1. React App Won't Start

**Error:** `'react-scripts' is not recognized`

**Solution:**
```bash
cd frontend
npm install
```

---

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# On Windows - find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or set different port
set PORT=3001 && npm start
```

---

#### 2. Cloudinary Issues

**Error:** `Cloudinary configuration missing`

**Solution:**
1. Create free account at https://cloudinary.com
2. Get Cloud Name from dashboard
3. Create unsigned upload preset:
   - Settings → Upload → Add upload preset
   - Set Signing Mode to "Unsigned"
4. Add to `frontend/.env`:
   ```env
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```
5. Restart frontend

---

**Error:** `Upload preset must be whitelisted for unsigned uploads`

**Solution:**
Your upload preset is not configured correctly.
1. Go to Cloudinary Settings → Upload
2. Find your upload preset
3. Change "Signing Mode" to **"Unsigned"**
4. Save changes

---

**Error:** `Failed to upload image to Cloudinary: 401 Unauthorized`

**Solution:**
Cloud name or preset name is incorrect.
1. Double-check Cloud Name on Cloudinary dashboard
2. Verify upload preset name
3. Ensure no typos in `.env` file
4. Restart frontend

---

#### 3. Image Upload Issues

**Error:** `Some files were rejected. Please upload only JPG, PNG, WEBP, or GIF images under 10MB`

**Solution:**
- Check file format (must be JPG, PNG, WEBP, or GIF)
- Check file size (must be under 10MB)
- Compress large images using online tools
- Convert incompatible formats (e.g., TIFF → JPG)

---

**Error:** Images upload but processing fails

**Solution:**
1. Check that images are publicly accessible from Cloudinary
2. Check browser console for errors
3. Verify backend can reach Cloudinary URLs
4. Check firewall/proxy settings

---

#### 4. CORS Issues

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
Backend CORS not configured correctly.

Verify in `backend/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

If using different ports, update accordingly.

Restart backend after changes.

---

### Processing Issues

#### 1. Long Processing Times

**Symptom:** Processing takes 30+ seconds

**Possible Causes & Solutions:**

**Cold Start (First Request):**
- Normal: 20-30 seconds on first request
- Hugging Face loads model on-demand
- Subsequent requests: 5-10 seconds

**Multiple Images:**
- Each image adds ~5-10 seconds
- Process images sequentially
- Consider reducing image count

**Large PDFs:**
- Large PDFs take longer to parse
- Try splitting into smaller documents
- Extract relevant pages only

**Network Issues:**
- Slow internet connection
- API endpoints far from your location
- Check network speed

---

#### 2. Input Rejected

**Error Display:** "Input Rejected" with reason

**Common Reasons:**

**"Input deemed not relevant for processing"**
- Input is too vague or unclear
- Add more specific details
- Provide context about your goal

**"Input is too ambiguous or unclear to process confidently"**
- Intent cannot be determined
- Rephrase with clearer objectives
- Add constraints and requirements

**"Text input too short"**
- Must be at least 10 characters
- Provide more detailed input

---

#### 3. Low Confidence Scores

**Symptom:** Confidence < 70%

**Solutions:**
- Be more specific in text input
- Provide clear context and goals
- Ensure images are relevant to text
- Check PDF content is related to task
- Avoid mixing unrelated topics

---

### Development Issues

#### 1. Hot Reload Not Working

**Frontend:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

**Backend:**
Install nodemon for auto-reload:
```bash
cd backend
npm install -D nodemon
npm run dev  # Uses nodemon
```

---

#### 2. Environment Variables Not Loading

**Solution:**
1. Ensure `.env` file is in correct directory
   - Backend: `backend/.env`
   - Frontend: `frontend/.env`
2. Restart server after `.env` changes
3. Frontend vars must start with `REACT_APP_`
4. No spaces around `=` sign
5. No quotes needed for values

---

#### 3. Logs Not Appearing

**Solution:**
Create logs directory:
```bash
cd backend
mkdir logs
```

Enable debug logging in `backend/.env`:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

---

## Performance Optimization

### Reduce Processing Time

1. **Enable Request Caching:**
   Consider caching responses for identical inputs

2. **Reduce Image Count:**
   Process 1-2 images instead of many

3. **Optimize PDFs:**
   Use shorter, more focused documents

4. **Use Smaller Images:**
   Resize before upload (Cloudinary can do this automatically)

### Reduce Costs

1. **Use Free Tiers:**
   - Groq: Free tier
   - Hugging Face: Free Inference API
   - Cloudinary: Free tier (25 credits/month)

2. **Implement Caching:**
   Cache BLIP results for same images

3. **Rate Limiting:**
   Prevent excessive API usage

---

## Debugging Tips

### Check Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "operational",
  "layers": {
    "perception": { ... },
    "normalization": { ... },
    "refinement": { ... }
  }
}
```

### Check Specific Layers

```bash
# Perception layer
curl http://localhost:5000/api/layers/perception

# Normalization layer
curl http://localhost:5000/api/layers/normalization

# Refinement layer
curl http://localhost:5000/api/layers/refinement
```

### Enable Verbose Logging

Backend `backend/.env`:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

View logs:
```bash
tail -f backend/logs/combined.log
```

### Test Individual Endpoints

**Test text-only input:**
```bash
curl -X POST http://localhost:5000/api/refine \
  -H "Content-Type: application/json" \
  -d '{"textInputs": ["Create a REST API for task management"]}'
```

---

## FAQ

### Q: Can I use a different LLM provider?

**A:** Yes! Modify `backend/services/refinement/refinementService.js` to use OpenAI, Anthropic, or any other provider. Update the API calls and keep the same interface.

---

### Q: Can I process video files?

**A:** Not currently. You would need to:
1. Extract frames from video
2. Process frames as images
3. Combine frame descriptions

---

### Q: How do I deploy to production?

**A:** See production deployment considerations:
- Use environment-specific `.env` files
- Enable HTTPS
- Set up reverse proxy (nginx)
- Use process manager (PM2)
- Configure monitoring
- Set up CI/CD pipeline

---

### Q: Can I add authentication?

**A:** Yes! Add middleware like:
- JWT authentication
- OAuth2 (Google, GitHub)
- API key validation
- Session management

---

### Q: How do I handle concurrent requests?

**A:** Current implementation is synchronous. For production:
- Use message queue (RabbitMQ, Redis)
- Implement job processing (Bull, Bee-Queue)
- Add WebSocket for real-time updates
- Scale horizontally

---

### Q: Can I use my own image captioning model?

**A:** Yes! Options:
1. Host your own BLIP instance
2. Use OpenAI Vision API
3. Use Google Cloud Vision API
4. Train custom model

Update `backend/services/perception/imagePerception.js` with new API calls.

---

### Q: What's the maximum file size?

**A:** Current limits:
- Images: 10MB (configurable in both frontend and backend)
- PDFs: 10MB (configurable)
- Text: 5000 characters (configurable in `backend/config/config.js`)

---

### Q: Can I process multiple languages?

**A:** Yes! The system works with any language that:
- BLIP can describe (primarily English descriptions)
- PDF parser can extract
- Groq's Mixtral model understands (multilingual support)

---

### Q: How accurate is the image understanding?

**A:** BLIP provides:
- Good general scene understanding
- Basic object detection
- Scene context
- Not suitable for: OCR, fine-grained details, specific text reading

For text in images, consider adding OCR preprocessing.

---

### Q: Can I customize the refinement prompts?

**A:** Yes! Edit `backend/services/refinement/prompts.js`:
- Modify system prompts for each stage
- Add new validation criteria
- Change output format requirements
- Add domain-specific instructions

---

### Q: How do I backup user data?

**A:** Current implementation doesn't persist data. To add:
1. Set up database (MongoDB, PostgreSQL)
2. Store pipeline results
3. Implement backup strategy
4. Add user accounts

---

## Getting Further Help

If you're still stuck:

1. **Check Logs:**
   - Backend: `backend/logs/combined.log`
   - Browser console: F12 → Console tab

2. **Verify Configuration:**
   - All API keys set correctly
   - All services accessible
   - Ports not blocked by firewall

3. **Test Components Individually:**
   - Test Cloudinary upload separately
   - Test Groq API with curl
   - Test Hugging Face API separately

4. **Review Documentation:**
   - [README.md](README.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [QUICKSTART.md](QUICKSTART.md)

---

**Last Updated:** January 2026
