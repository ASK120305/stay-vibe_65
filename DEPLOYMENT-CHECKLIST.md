# Deployment Checklist for StayVibe

## 📋 Pre-Deployment Setup

### 1. Environment Variables Setup

#### Frontend (Vercel)
Set these environment variables in Vercel Dashboard → Settings → Environment Variables:

```bash
VITE_API_URL=https://stay-vibe-65-1.onrender.com/api
VITE_WS_URL=wss://stay-vibe-65-1.onrender.com/ws
VITE_APP_NAME=StayVibe
VITE_APP_VERSION=1.0.0
```

#### Backend (Render)
Set these environment variables in Render Dashboard → Environment Variables:

```bash
# Required - Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stayvibe?retryWrites=true&w=majority

# Required - Security
JWT_SECRET=<generate-32-char-random-string>
JWT_REFRESH_SECRET=<generate-32-char-random-string>
NODE_ENV=production
PORT=5000

# Required - CORS
FRONTEND_URL=https://stay-vibe-65.vercel.app

# Optional - Email (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Optional - Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional - Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔐 Security Setup

### Generate JWT Secrets
Run these commands locally to generate secure random strings:

```bash
# For JWT_SECRET
openssl rand -base64 32

# For JWT_REFRESH_SECRET
openssl rand -base64 32
```

Copy the output and use them in your environment variables.

---

## 🗄️ Database Setup (MongoDB)

### Option 1: MongoDB Atlas (Recommended for Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist Render's IP (or use 0.0.0.0/0 for all IPs)
5. Get connection string from "Connect" → "Connect your application"
6. Replace `<username>`, `<password>`, and database name in connection string
7. Add to `MONGODB_URI` in Render environment variables

### Option 2: Local MongoDB (Development Only)
- Use: `mongodb://localhost:27017/stayvibe`

---

## ☁️ Cloudinary Setup (Optional - for image uploads)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get credentials from Dashboard:
   - Cloud name
   - API Key
   - API Secret
3. Add to environment variables in Render

---

## 📧 Email Setup (Optional - for notifications)

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the 16-character app password in `EMAIL_PASS`
4. Set `EMAIL_USER` to your Gmail address

---

## 🚀 Deployment Steps

### Backend (Render)
1. ✅ Push code to GitHub repository: `https://github.com/ASK120305/stay-vibe_65.git`
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect GitHub repository: `ASK120305/stay-vibe_65`
5. Configure:
   - **Name**: stay-vibe-65
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node src/server.js`)
   - **Plan**: Free (or paid)
6. Add all environment variables from checklist above
7. Click "Create Web Service"
8. Wait for deployment (first deploy takes ~5-10 minutes)
9. Verify deployment: `https://stay-vibe-65-1.onrender.com/api/health` (if you have health endpoint)

### Frontend (Vercel)
1. ✅ Code already pushed to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import Git Repository: `ASK120305/stay-vibe_65`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add environment variables (from checklist above)
7. Click "Deploy"
8. Wait for deployment (~2-3 minutes)
9. Visit: `https://stay-vibe-65.vercel.app`

---

## ✅ Post-Deployment Verification

### Backend Health Checks
- [ ] Backend is accessible: `https://stay-vibe-65-1.onrender.com`
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] CORS is configured correctly (check browser console)

### Frontend Health Checks
- [ ] Frontend loads: `https://stay-vibe-65.vercel.app`
- [ ] Can make API calls to backend
- [ ] WebSocket connections work (check browser console)
- [ ] Authentication works (login/signup)
- [ ] No CORS errors in browser console

### Browser Console Checks
Open browser console (F12) and check for:
- ❌ No CORS errors
- ❌ No 404 errors for API calls
- ❌ No WebSocket connection errors
- ✅ API calls succeed

---

## 🐛 Common Issues & Fixes

### CORS Errors
**Problem**: Frontend can't connect to backend
**Fix**: 
- Verify `FRONTEND_URL` in backend env vars matches Vercel URL exactly
- Check backend logs for CORS-related errors

### Database Connection Errors
**Problem**: Backend can't connect to MongoDB
**Fix**:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (use 0.0.0.0/0 for Render)
- Ensure database user has correct permissions

### WebSocket Connection Fails
**Problem**: Real-time features don't work
**Fix**:
- Verify backend supports WebSocket (Render supports it by default)
- Check `VITE_WS_URL` uses `wss://` (secure WebSocket)
- Check browser console for WebSocket errors

### Environment Variables Not Loading
**Problem**: App behavior is wrong
**Fix**:
- Redeploy after adding/changing environment variables
- Check environment variable names match exactly (case-sensitive)
- For Vercel: Ensure production environment is selected

---

## 📝 Important Notes

1. **Free Tier Limitations**:
   - Render free tier: Service spins down after 15 mins of inactivity (first request takes ~30s to wake up)
   - Vercel free tier: 100GB bandwidth/month
   - MongoDB Atlas free tier: 512MB storage

2. **Secrets Management**:
   - ❌ NEVER commit `.env` files to git
   - ✅ Only commit `.env.example` files
   - ✅ Add `.env` to `.gitignore`

3. **Monitoring**:
   - Check Render logs: Dashboard → Service → Logs
   - Check Vercel logs: Dashboard → Project → Deployments → View Function Logs

4. **Custom Domains** (Optional):
   - Vercel: Settings → Domains → Add Domain
   - Render: Settings → Custom Domain → Add Domain

---

## 🔄 Update Deployment

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render will auto-deploy on push.

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel will auto-deploy on push.

---

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Cloudinary Docs: https://cloudinary.com/documentation

---

## ✨ Your Deployment URLs

- **Frontend**: https://stay-vibe-65.vercel.app
- **Backend**: https://stay-vibe-65-1.onrender.com
- **Repository**: https://github.com/ASK120305/stay-vibe_65

---

**Last Updated**: October 17, 2025
