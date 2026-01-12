# Deployment Guide - Multi-Modal Prompt System

## Overview
This guide covers deploying your application with two options:
- **Option 1**: Full deployment on Vercel (Frontend + Backend)
- **Option 2**: Frontend on Vercel + Backend on Render (recommended for production)

---

## Option 1: Deploy Everything to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git installed on your computer

### Step 1: Prepare Your Code

1. **Initialize Git Repository** (if not already done)
```bash
cd "d:\Client Project\Multi-Model Prompt System"
git init
git add .
git commit -m "Initial commit - Multi-Modal Prompt System"
```

2. **Create GitHub Repository**
- Go to https://github.com/new
- Create a new repository named `multi-modal-prompt-system`
- Don't initialize with README (we already have files)

3. **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/multi-modal-prompt-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Vercel

1. **Login to Vercel**
- Go to https://vercel.com
- Click "Sign Up" or "Login"
- Connect with GitHub

2. **Import Backend Project**
- Click "Add New" → "Project"
- Select your `multi-modal-prompt-system` repository
- Click "Import"

3. **Configure Backend**
- **Root Directory**: Select `backend`
- **Framework Preset**: Other
- **Build Command**: Leave empty
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

4. **Add Environment Variables**
Click "Environment Variables" and add:
```
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

5. **Deploy Backend**
- Click "Deploy"
- Wait 2-3 minutes
- Copy your backend URL (e.g., `https://your-backend.vercel.app`)

### Step 3: Deploy Frontend to Vercel

1. **Import Frontend Project Again**
- Click "Add New" → "Project"
- Select same repository
- Click "Import"

2. **Configure Frontend**
- **Root Directory**: Select `frontend`
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

3. **Add Environment Variables**
```
REACT_APP_API_URL=https://your-backend.vercel.app
REACT_APP_CLOUDINARY_CLOUD_NAME=dq1ywsnr4
REACT_APP_CLOUDINARY_UPLOAD_PRESET=ml_default
```

4. **Deploy Frontend**
- Click "Deploy"
- Wait 2-3 minutes
- Get your frontend URL

5. **Update Backend Environment**
- Go back to backend project settings
- Update `FRONTEND_URL` to your actual frontend URL
- Redeploy backend

### Step 4: Test Deployment

Visit your frontend URL and test:
- ✅ Upload text, image, or PDF
- ✅ Check if refinement works
- ✅ Verify no CORS errors in browser console

---

## Option 2: Frontend on Vercel + Backend on Render (Recommended)

### Why This Approach?
- ✅ Vercel has limitations for long-running Node.js processes
- ✅ Render is optimized for backend APIs
- ✅ Free tier on both platforms
- ✅ Better reliability for file uploads and API calls

### Step 1: Deploy Backend to Render

1. **Create Render Account**
- Go to https://render.com
- Sign up with GitHub

2. **Create New Web Service**
- Click "New" → "Web Service"
- Connect your GitHub repository
- Select `multi-modal-prompt-system`

3. **Configure Service**
```
Name: mmps-backend
Region: Choose closest region
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

4. **Select Free Plan**
- Instance Type: **Free** (0$/month)
- Note: Free tier spins down after inactivity, takes 30-60s to wake up

5. **Add Environment Variables**
Click "Environment" tab and add:
```
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

6. **Deploy**
- Click "Create Web Service"
- Wait 5-10 minutes for first deployment
- Copy your Render URL (e.g., `https://mmps-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Follow Steps from Option 1, Step 3** (Deploy Frontend to Vercel)

2. **Update Backend URL**
Use your Render backend URL:
```
REACT_APP_API_URL=https://mmps-backend.onrender.com
```

### Step 3: Update Backend CORS

1. **Go to Render Dashboard**
- Open your backend service
- Click "Environment"
- Update `FRONTEND_URL` to your actual Vercel frontend URL
- Save changes (auto redeploys)

---

## Environment Variables Checklist

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# API Keys
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=sk-or-v1-your-actual-key

# CORS
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```env
# Backend API
REACT_APP_API_URL=https://your-backend.onrender.com
# OR if using Vercel backend:
# REACT_APP_API_URL=https://your-backend.vercel.app

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=dq1ywsnr4
REACT_APP_CLOUDINARY_UPLOAD_PRESET=ml_default
```

---

## Deployment Comparison

| Feature | Vercel (Full) | Vercel + Render |
|---------|---------------|-----------------|
| Setup Complexity | Easy | Medium |
| Backend Reliability | Medium | High |
| File Upload Handling | Limited | Good |
| Long API Calls | 10s timeout | 100s timeout |
| Free Tier | Yes | Yes (both) |
| Cold Start | Fast | 30-60s (Render) |
| Cost (Free Tier) | $0/month | $0/month |
| **Recommended?** | Development | **Production** |

---

## Troubleshooting

### Issue: "Failed to fetch" in frontend
**Solution**: Check CORS settings
1. Verify `FRONTEND_URL` in backend matches your actual frontend URL
2. Make sure backend is deployed and running

### Issue: Backend timeout on Vercel
**Solution**: Switch to Render for backend
- Vercel has 10-second timeout for serverless functions
- Image processing can take longer
- Use Render for unlimited timeout

### Issue: Render backend slow to start
**Solution**: This is normal for free tier
- First request after inactivity takes 30-60s
- Subsequent requests are fast
- Consider upgrading to paid tier ($7/month) for always-on

### Issue: Environment variables not working
**Solution**: 
1. Check variable names match exactly (case-sensitive)
2. Redeploy after adding/changing variables
3. Don't use quotes in values on Vercel/Render dashboard

### Issue: Image upload fails
**Solution**:
1. Check Cloudinary credentials in frontend
2. Verify Cloudinary account is active
3. Check browser console for errors

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Frontend loads without errors
- [ ] Text input works and shows refined prompt
- [ ] Image upload works (check Cloudinary)
- [ ] PDF upload works
- [ ] Combined inputs (text + image) work
- [ ] Error messages display correctly
- [ ] Loading states show properly
- [ ] No CORS errors in browser console
- [ ] Backend logs show successful processing (check Render/Vercel logs)

---

## Monitoring & Logs

### Vercel Logs
- Go to your project → "Deployments"
- Click on latest deployment
- View "Functions" tab for backend logs

### Render Logs
- Go to your service dashboard
- Click "Logs" tab
- Real-time log streaming

---

## Updating Your Deployment

### For Git-based deployment (recommended):
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```
Both Vercel and Render will auto-deploy on push!

### Manual deployment:
- Vercel: Click "Redeploy" in dashboard
- Render: Click "Manual Deploy" → "Deploy latest commit"

---

## Cost Estimates

### Free Tier Limits

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Serverless function execution time: 100 hours/month
- Perfect for personal projects

**Render Free Tier:**
- 750 hours/month (covers 24/7 for one service)
- Spins down after 15 minutes of inactivity
- 512 MB RAM
- Suitable for low-traffic apps

**Combined Cost**: **$0/month** for reasonable usage

### When to Upgrade?

Consider paid plans if:
- Getting 1000+ users/day
- Need faster cold starts (Render: $7/month)
- Need more than 100GB bandwidth (Vercel: $20/month)
- Want custom domain with SSL (free on both!)

---

## Next Steps

1. **Get OpenRouter API Key**
   - Go to https://openrouter.ai
   - Sign up and get your key
   - Add to backend environment variables

2. **Deploy using recommended approach** (Vercel + Render)

3. **Test thoroughly** using the checklist above

4. **Monitor usage** in first few days

5. **Share your deployed app!** 🚀

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **OpenRouter Docs**: https://openrouter.ai/docs

Need help? Check the logs first, then review the troubleshooting section!
