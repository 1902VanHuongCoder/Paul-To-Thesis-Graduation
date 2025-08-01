# Deployment Guide

This guide covers deploying the Agricultural Management System to production.

## Architecture

- **Frontend**: Next.js → Netlify
- **Backend**: Express.js + Socket.io → Heroku/Railway
- **AI Service**: FastAPI → Render/Railway
- **Database**: MySQL → PlanetScale/Railway
- **File Storage**: Cloudinary

## 1. Frontend Deployment (Netlify)

### Prerequisites
- Netlify account
- GitHub repository

### Steps

1. **Prepare the build**
   ```bash
   cd Frontend
   npm install
   npm run build
   ```

2. **Configure environment variables in Netlify**
   - Go to Site settings → Environment variables
   - Add variables from `.env.production.example`

3. **Deploy methods**
   
   **Option A: Connect GitHub (Recommended)**
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   
   **Option B: Manual deploy**
   ```bash
   npm run deploy
   netlify deploy --prod --dir=out
   ```

### Configuration Files
- `netlify.toml` - Build and redirect configuration
- `next.config.ts` - Modified for static export
- `.env.production.example` - Environment variables template

## 2. Backend Deployment (Heroku)

### Prerequisites
- Heroku CLI
- Heroku account
- MySQL database (PlanetScale recommended)

### Steps

1. **Create Heroku app**
   ```bash
   cd Backend
   heroku create your-app-name
   ```

2. **Configure environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DB_HOST=your-mysql-host
   heroku config:set DB_USER=your-mysql-username
   heroku config:set DB_PASSWORD=your-mysql-password
   heroku config:set DB_NAME=your-database-name
   heroku config:set JWT_SECRET=your-jwt-secret
   # Add all variables from .env.production.example
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```

### Alternative: Railway Deployment

1. **Connect GitHub to Railway**
   - Sign up at railway.app
   - Connect your repository
   - Select the Backend folder

2. **Configure environment variables**
   - Add variables from `.env.production.example`
   - Railway will auto-deploy on git push

## 3. AI Service Deployment (Render)

### Prerequisites
- Render account
- Model file (`detect-leaf-rice-disease-model.pt`)

### Steps

1. **Create Render service**
   - Connect your repository
   - Select "Web Service"
   - Choose the AI folder

2. **Configure build settings**
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn predict-leaf-rice-disease:app --host 0.0.0.0 --port $PORT`

3. **Environment variables**
   - Add from `.env.production.example`
   - Set `PORT=8000`

### Alternative: Railway AI Deployment

```bash
cd AI/rice-disease-detection
railway login
railway init
railway up
```

## 4. Database Setup (PlanetScale)

### Steps

1. **Create database**
   - Sign up at planetscale.com
   - Create new database
   - Get connection strings

2. **Update connection strings**
   - Add to backend environment variables
   - Test connection

### Alternative: Railway Database

1. **Add MySQL service**
   - In Railway dashboard
   - Add → Database → MySQL
   - Get connection details

## 5. File Storage (Cloudinary)

### Steps

1. **Create Cloudinary account**
   - Get cloud name, API key, API secret

2. **Configure**
   - Add to backend environment variables
   - Update frontend environment variables

## 6. Post-Deployment Configuration

### Update CORS Origins

1. **Backend**
   ```bash
   heroku config:set ALLOWED_ORIGINS=https://your-netlify-app.netlify.app
   ```

2. **AI Service**
   - Update CORS settings if needed

### Update API URLs

1. **Frontend environment variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
   NEXT_PUBLIC_AI_API_URL=https://your-ai-service.onrender.com
   ```

### Test Deployment

1. **Health checks**
   - Backend: `https://your-backend.herokuapp.com/health`
   - AI Service: `https://your-ai-service.onrender.com/health`

2. **Functionality tests**
   - User registration/login
   - Product management
   - Chat functionality
   - AI disease detection

## 7. Monitoring and Logs

### Heroku
```bash
heroku logs --tail --app your-app-name
```

### Railway
- View logs in Railway dashboard

### Render
- View logs in Render dashboard

## 8. Custom Domain (Optional)

### Netlify
1. Domain settings → Add custom domain
2. Configure DNS records

### Backend
1. Configure custom domain in hosting platform
2. Update CORS settings

## 9. SSL/HTTPS

All platforms provide automatic SSL certificates. Ensure all API calls use HTTPS in production.

## 10. Scaling Considerations

### Database
- Monitor connection limits
- Consider read replicas for high traffic

### Backend
- Enable auto-scaling if available
- Monitor memory/CPU usage

### AI Service
- Consider GPU instances for faster inference
- Implement caching for common predictions

## Troubleshooting

### Common Issues

1. **CORS errors**
   - Check ALLOWED_ORIGINS configuration
   - Verify frontend URL in backend settings

2. **Database connection issues**
   - Verify connection strings
   - Check firewall settings

3. **Build failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed

4. **AI model loading issues**
   - Ensure model file is included in deployment
   - Check file permissions

### Debug Commands

```bash
# Backend logs
heroku logs --tail

# Test endpoints
curl https://your-backend.herokuapp.com/health
curl https://your-ai-service.onrender.com/health

# Database connection test
heroku run node -e "require('./configs/mysql-database-connect').authenticate().then(() => console.log('DB OK')).catch(console.error)"
```

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] JWT secret is secure (32+ characters)
- [ ] Database credentials are secure
- [ ] CORS is properly configured
- [ ] HTTPS is enabled
- [ ] API rate limiting is configured
- [ ] File upload limits are set
- [ ] Input validation is implemented

## Performance Optimization

- [ ] Database queries are optimized
- [ ] Images are compressed
- [ ] Caching is implemented
- [ ] CDN is configured for static assets
- [ ] Gzip compression is enabled
