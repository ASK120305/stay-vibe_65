# Quick Environment Variables Setup Guide

## 🚀 Setting Environment Variables in Deployment Platforms

### Vercel (Frontend)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `stay-vibe_65`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click "Add New"
   - Enter **Key** (e.g., `VITE_API_URL`)
   - Enter **Value** (e.g., `https://stay-vibe-65-1.onrender.com/api`)
   - Select environments: **Production**, **Preview**, **Development**
   - Click "Save"
5. Repeat for all variables
6. **Redeploy** your app after adding variables (Deployments → Redeploy)

#### Variables to Add:
```
VITE_API_URL=https://stay-vibe-65-1.onrender.com/api
VITE_WS_URL=wss://stay-vibe-65-1.onrender.com/ws
VITE_APP_NAME=StayVibe
VITE_APP_VERSION=1.0.0
```

---

### Render (Backend)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your service: `stay-vibe-65`
3. Go to **Environment** (left sidebar)
4. Click **Add Environment Variable**
5. Add each key-value pair
6. Click **Save Changes** (will auto-redeploy)

#### Required Variables:
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stayvibe
JWT_SECRET=<use-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<use-openssl-rand-base64-32>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=https://stay-vibe-65.vercel.app
```

#### Optional Variables (if using features):
```bash
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔐 Generate Secure JWT Secrets

### Windows (PowerShell)
```powershell
# Generate JWT_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Generate JWT_REFRESH_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### macOS/Linux (Terminal)
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

### Online Tool (if no terminal access)
- Visit: https://generate-secret.vercel.app/32
- Click "Generate" twice (once for each secret)

---

## 📧 Gmail App Password Setup

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App passwords**: https://myaccount.google.com/apppasswords
5. Select app: **Mail**
6. Select device: **Other (Custom name)** → Enter "StayVibe"
7. Click **Generate**
8. Copy the 16-character password (remove spaces)
9. Use this as `EMAIL_PASS` in environment variables

---

## 🗄️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Click **Create** → **Deploy a free cluster**
4. Choose provider (AWS recommended) and region (closest to your Render server)
5. Click **Create Cluster** (takes 3-5 minutes)
6. Click **Database Access** (left sidebar)
   - Add Database User
   - Username: `stayvibe-user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Read and write to any database**
7. Click **Network Access** (left sidebar)
   - Click **Add IP Address**
   - Select **Allow Access from Anywhere** (0.0.0.0/0)
   - Click **Confirm**
8. Click **Database** (left sidebar)
   - Click **Connect** on your cluster
   - Choose **Connect your application**
   - Driver: **Node.js**
   - Copy connection string:
     ```
     mongodb+srv://stayvibe-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://stayvibe-user:yourpassword@cluster0.xxxxx.mongodb.net/stayvibe?retryWrites=true&w=majority`
9. Use this as `MONGODB_URI` in Render environment variables

---

## ☁️ Cloudinary Setup (Optional)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (click "eye" icon to reveal)
4. Add to Render environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

---

## ✅ Verification Checklist

After setting all environment variables:

- [ ] All required variables are set in Render
- [ ] All required variables are set in Vercel
- [ ] JWT secrets are secure random strings (not placeholders)
- [ ] MongoDB URI is correct and cluster is accessible
- [ ] Email credentials are correct (if using email)
- [ ] Cloudinary credentials are correct (if using image uploads)
- [ ] Redeploy both frontend and backend after adding variables
- [ ] Test the deployed app: https://stay-vibe-65.vercel.app

---

## 🐛 Troubleshooting

### Backend won't start on Render
- Check Render logs for errors
- Verify `MONGODB_URI` is correct
- Ensure all required variables are set

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel matches your Render URL
- Check backend CORS settings (should allow your Vercel URL)
- Check browser console for errors

### Database connection errors
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user permissions
- Test connection string locally first

---

**Need Help?**
- Vercel Support: https://vercel.com/support
- Render Support: https://render.com/support
- MongoDB Support: https://support.mongodb.com
