# StayVibe CI/CD Deployment Guide

This document outlines the CI/CD pipeline setup for the StayVibe hotel booking application.

## 🚀 Deployment Architecture

- **Frontend**: React + Vite deployed on Vercel
- **Backend**: Node.js + Express deployed on Render
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

### Required Secrets in GitHub Repository

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### For Vercel Deployment:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

#### For Render Deployment:
- `RENDER_API_KEY`: Your Render API key
- `RENDER_STAGING_SERVICE_ID`: Staging service ID for develop branch
- `RENDER_PRODUCTION_SERVICE_ID`: Production service ID for main branch

## 🔧 Setup Instructions

### 1. Vercel Setup (Frontend)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Configure environment variables** in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_APP_NAME`: StayVibe
   - `VITE_APP_VERSION`: 1.0.0

### 2. Render Setup (Backend)

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - Build Command: `cd backend && npm ci`
   - Start Command: `cd backend && npm start`
   - Environment: Node

4. **Add environment variables** in Render dashboard:
   - `NODE_ENV`: production
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `EMAIL_USER`: Your email for notifications
   - `EMAIL_PASS`: Your email password/app password

### 3. MongoDB Atlas Setup

1. **Create a MongoDB Atlas account**
2. **Create a new cluster**
3. **Get your connection string**
4. **Add it to your environment variables**

## 🏗️ CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) includes:

### Frontend Pipeline:
- ✅ ESLint code quality checks
- ✅ TypeScript type checking
- ✅ Unit tests with Vitest
- ✅ Build verification
- ✅ Artifact upload

### Backend Pipeline:
- ✅ ESLint code quality checks
- ✅ Unit tests with Jest
- ✅ Test coverage reporting
- ✅ MongoDB integration tests

### Security Pipeline:
- ✅ Trivy vulnerability scanning
- ✅ SARIF security report upload

### Deployment:
- 🚀 **Staging**: Auto-deploy to Render on `develop` branch
- 🚀 **Production**: Auto-deploy to Vercel on `main` branch

## 🧪 Testing

### Frontend Tests
```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

### Backend Tests
```bash
cd backend

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting
```bash
# Frontend linting
npm run lint
npm run lint:fix

# Backend linting
cd backend
npm run lint
npm run lint:fix
```

## 📊 Monitoring

### Build Status
- Check GitHub Actions tab for build status
- View logs for detailed error information

### Deployment Status
- **Vercel**: Check Vercel dashboard for frontend deployment status
- **Render**: Check Render dashboard for backend deployment status

### Test Coverage
- Frontend coverage reports are generated in `coverage/` directory
- Backend coverage reports are uploaded as GitHub artifacts

## 🔄 Branch Strategy

- **`main`**: Production branch → Deploys to production
- **`develop`**: Staging branch → Deploys to staging
- **Feature branches**: Trigger CI pipeline but no deployment

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check ESLint errors: `npm run lint`
   - Check TypeScript errors: `npx tsc --noEmit`
   - Check test failures: `npm run test:run`

2. **Deployment Failures**:
   - Verify all required secrets are set
   - Check environment variables in deployment platforms
   - Verify database connectivity

3. **Test Failures**:
   - Run tests locally first
   - Check test environment setup
   - Verify mock configurations

### Getting Help

1. Check GitHub Actions logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure all dependencies are properly installed
4. Check database connectivity and permissions

## 📝 Environment Variables Reference

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=StayVibe
VITE_APP_VERSION=1.0.0
```

### Backend (Render)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stayvibe
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@stayvibe.com
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## 🎯 Next Steps

1. Set up monitoring and alerting
2. Configure custom domains
3. Set up SSL certificates
4. Implement database backups
5. Add performance monitoring
6. Set up error tracking (Sentry, etc.)
