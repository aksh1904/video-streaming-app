# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need v18+)
node --version

# Check MongoDB (need v6+)
mongod --version

# Check FFmpeg
ffmpeg -version
```

If any are missing, install them:
- **Node.js**: https://nodejs.org/
- **MongoDB**: https://www.mongodb.com/try/download/community
- **FFmpeg**: See README.md for installation instructions

## Installation Steps

### 1. Start MongoDB

**Option A - Local MongoDB:**
```bash
# macOS/Linux
sudo systemctl start mongod

# Or just run
mongod
```

**Option B - MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Use in backend/.env

### 2. Backend Setup

```bash
# Navigate to backend
cd video-streaming-app/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (use nano, vim, or any text editor)
nano .env
```

**Minimal .env configuration:**
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/video-streaming
JWT_SECRET=change-this-to-something-secure-and-random
CLIENT_URL=http://localhost:5173
```

**Start backend:**
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Server running on port 5002
📡 Socket.IO server ready
```

### 3. Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd video-streaming-app/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
```

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

## First Time Usage

### Create Your First User

1. Click "Sign up" on the login page
2. Fill in the form:
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `admin123`
   - Organization: `my-company`
   - Role: `Admin`
3. Click "Sign Up"

You'll be automatically logged in and redirected to the dashboard.

### Upload Your First Video

1. Click "Upload Video" button
2. Select a video file (MP4, MOV, etc.)
3. Enter a title (e.g., "Test Video")
4. Click "Upload Video"
5. Watch the progress bar
6. See real-time processing updates
7. Once complete, click play to watch!

## Testing the Features

### Test Video Processing
- Upload a short video (< 50MB for faster testing)
- Watch the real-time progress updates
- See the sensitivity analysis results

### Test Different Roles
Create three users with different roles:
1. **Admin**: Full access
2. **Editor**: Can upload and manage
3. **Viewer**: Can only view

### Test Video Streaming
- Click play on a completed video
- Test pause/play controls
- Try seeking to different positions
- Test volume and fullscreen

### Test Filtering
- Upload multiple videos
- Use status filter (completed, processing, etc.)
- Use sensitivity filter (safe, flagged)
- Try search functionality

## Common Issues & Solutions

### "MongoDB connection error"
**Problem**: MongoDB is not running
**Solution**: 
```bash
# Start MongoDB
mongod
# Or use your system's service manager
sudo systemctl start mongod
```

### "Port 5002 is already in use"
**Problem**: Another app is using port 5002
**Solution**: Change PORT in backend/.env to something else (e.g., 5001)

### "FFmpeg not found"
**Problem**: FFmpeg not installed or not in PATH
**Solution**: Install FFmpeg (see README.md) and restart terminal

### "Upload failed"
**Problem**: File too large
**Solution**: 
- Reduce file size
- Or increase MAX_FILE_SIZE in backend/.env

### Videos not playing
**Problem**: Video processing failed
**Solution**: 
- Check backend console for errors
- Ensure FFmpeg is installed
- Try uploading a different video format

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# MongoDB
mongod               # Start MongoDB
mongo                # Open MongoDB shell
```

## Next Steps

✅ Application is running
✅ User created
✅ Video uploaded and processed

**Now explore:**
1. Upload multiple videos
2. Test different user roles
3. Try sharing videos
4. Explore the API (see API_DOCUMENTATION.md)
5. Read architecture docs (ARCHITECTURE.md)
6. Customize for your needs

## Need Help?

- **Full Documentation**: See README.md
- **API Reference**: See API_DOCUMENTATION.md
- **Architecture**: See ARCHITECTURE.md
- **Issues**: Check backend/frontend console logs

## Production Deployment

Ready to deploy? See README.md section on deployment for:
- Heroku/Railway/Render deployment
- MongoDB Atlas setup
- Environment configuration
- Security best practices

---

**Congratulations! You're all set up! 🎉**

Start uploading and streaming videos!
