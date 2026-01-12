# Quick Deployment Steps

## Recommended: Backend on Render + Frontend on Vercel

### Step 1: Get OpenRouter API Key
1. Go to https://openrouter.ai
2. Sign up (free)
3. Get your API key from dashboard
4. Copy: `sk-or-v1-xxxxx...`

### Step 2: Push Code to GitHub
```bash
cd "d:\Client Project\Multi-Model Prompt System"
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/multi-modal-prompt-system.git
git push -u origin main 
```

### Step 3: Deploy Backend to Render
1. Go to https://render.com → Sign up with GitHub
2. Click "New" → "Web Service"
3. Select your repository
4. **Configure:**
   - Name: `mmps-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**

5. **Add Environment Variables:**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. Click "Create Web Service" (wait 5-10 min)
7. **Copy your backend URL**: `https://mmps-backend.onrender.com`

### Step 4: Deploy Frontend to Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New" → "Project"
3. Import your repository
4. **Configure:**
   - Root Directory: `frontend`
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

5. **Add Environment Variables:**
   ```
   REACT_APP_API_URL=https://mmps-backend.onrender.com
   REACT_APP_CLOUDINARY_CLOUD_NAME=dq1ywsnr4
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=ml_default
   ```

6. Click "Deploy" (wait 2-3 min)
7. **Copy your frontend URL**: `https://your-app.vercel.app`

### Step 5: Update Backend CORS
1. Go back to Render → Your backend service
2. Click "Environment"
3. Update `FRONTEND_URL` to your actual Vercel URL
4. Save (auto redeploys)

### Step 6: Test Your Deployment
Visit your frontend URL and test:
- ✅ Text input
- ✅ Image upload
- ✅ PDF upload
- ✅ Check browser console (no errors)

---

## Alternative: Everything on Vercel

### Backend on Vercel:
1. Import repository → Select `backend` as root
2. Framework: Other
3. Add same environment variables
4. Deploy

### Frontend on Vercel:
1. Import repository → Select `frontend` as root
2. Framework: Create React App
3. Update `REACT_APP_API_URL` to your Vercel backend URL
4. Deploy

**Note**: Vercel backend has 10s timeout limit. May not work for long image processing.

---

## Important Notes

⚠️ **First Request on Render**: Takes 30-60s (free tier cold start)
✅ **Auto-Deploy**: Both platforms redeploy on git push
💡 **Custom Domain**: Available free on both platforms
📊 **Monitoring**: Check logs in Render/Vercel dashboards

---

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions and troubleshooting!
