# Quick Deployment Checklist

## Pre-Deployment

### 1. Environment Setup
- [ ] Copy `.env.production.example` files and fill with actual values
- [ ] Test all components locally with production environment variables
- [ ] Ensure all sensitive data is in environment variables, not code

### 2. Database Migration
- [ ] Set up production MySQL database (PlanetScale/Railway)
- [ ] Run database migrations
- [ ] Seed initial data if needed

### 3. File Storage
- [ ] Set up Cloudinary account
- [ ] Configure upload folders and transformations

## Deployment Order

### 1. Database (First)
```bash
# Create production database
# Update connection strings
# Test connection
```

### 2. Backend (Second)
```bash
cd Backend
heroku create your-backend-app
heroku config:set NODE_ENV=production
# Set all environment variables
git push heroku main
```

### 3. AI Service (Third)
```bash
cd AI/rice-disease-detection
# Deploy to Render or Railway
# Set environment variables
# Test API endpoints
```

### 4. Frontend (Last)
```bash
cd Frontend
# Set environment variables in Netlify
# Connect GitHub repository
# Deploy
```

## Post-Deployment Testing

### Health Checks
- [ ] Backend: `https://your-backend.com/health`
- [ ] AI Service: `https://your-ai-api.com/health`
- [ ] Frontend: Load main page

### Core Functionality
- [ ] User registration/login
- [ ] Product CRUD operations
- [ ] File upload (images)
- [ ] Chat system (real-time)
- [ ] AI disease detection
- [ ] Payment processing
- [ ] Email notifications

### Integration Testing
- [ ] Frontend ↔ Backend API calls
- [ ] Backend ↔ Database queries
- [ ] Backend ↔ AI service communication
- [ ] Real-time chat via Socket.io
- [ ] Image uploads to Cloudinary

## Quick Deploy Commands

### Backend (Heroku)
```bash
cd Backend
heroku login
heroku create your-app-name
git push heroku main
```

### Frontend (Netlify)
```bash
cd Frontend
npm run build
netlify deploy --prod --dir=out
```

### AI Service (Render)
```bash
# Connect GitHub repository
# Configure build: pip install -r requirements.txt
# Configure start: uvicorn predict-leaf-rice-disease:app --host 0.0.0.0 --port $PORT
```

## Environment Variables Quick Reference

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
NEXT_PUBLIC_AI_API_URL=https://your-ai-service.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend.herokuapp.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Backend (.env.production)
```
NODE_ENV=production
PORT=3001
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
JWT_SECRET=your-32-char-secret
FRONTEND_URL=https://your-app.netlify.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### AI Service (.env.production)
```
ROBOFLOW_API_KEY=your-roboflow-key
MODEL_PATH=detect-leaf-rice-disease-model.pt
PORT=8000
```

## Troubleshooting Quick Fixes

### CORS Issues
```bash
# Update backend CORS settings
heroku config:set ALLOWED_ORIGINS=https://your-app.netlify.app
```

### Database Connection
```bash
# Test database connection
heroku run node -e "require('./configs/mysql-database-connect').authenticate().then(() => console.log('OK')).catch(console.error)"
```

### Build Failures
```bash
# Check logs
heroku logs --tail
netlify logs
```

## Monitoring URLs

After deployment, bookmark these for monitoring:

- Frontend: `https://your-app.netlify.app`
- Backend Health: `https://your-backend.herokuapp.com/health`
- AI Health: `https://your-ai-service.onrender.com/health`
- Database Dashboard: PlanetScale/Railway dashboard
- Logs: Heroku/Railway/Render dashboards

## Rollback Plan

If deployment fails:

1. **Frontend**: Previous deployment auto-available in Netlify
2. **Backend**: `heroku rollback` or redeploy previous commit
3. **AI Service**: Redeploy previous version
4. **Database**: Restore from backup if needed

## Production Ready Checklist

- [ ] All services deployed and healthy
- [ ] HTTPS enabled on all endpoints
- [ ] Environment variables configured
- [ ] CORS properly set
- [ ] Database connected and seeded
- [ ] File uploads working
- [ ] Real-time chat functional
- [ ] AI predictions working
- [ ] Payment processing tested
- [ ] Error monitoring set up
- [ ] Backup strategy in place
