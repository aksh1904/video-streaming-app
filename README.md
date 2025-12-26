# 🎥 Video Streaming Platform

A full-stack video upload, processing, and streaming application with real-time progress tracking, sensitivity analysis, and role-based access control.

## ✨ Features

### Core Functionality
- **Video Upload**: Upload videos with metadata (title, description)
- **Video Processing**: Automated sensitivity analysis and thumbnail generation
- **Real-Time Updates**: Live progress tracking via Socket.IO
- **Video Streaming**: HTTP range request-based video streaming
- **Multi-Tenant Architecture**: Organization-based user isolation
- **Role-Based Access Control (RBAC)**:
  - **Viewer**: Read-only access to videos
  - **Editor**: Upload, edit, and manage videos
  - **Admin**: Full system access including user management

### Advanced Features
- Sensitivity content detection and flagging
- Video metadata extraction (duration, file size)
- Automatic thumbnail generation
- Search and filter capabilities
- Responsive design for all devices
- Secure authentication with JWT
- Progress indicators for uploads and processing

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Video Processing**: FFmpeg (fluent-ffmpeg)
- **Security**: bcryptjs for password hashing

### Frontend
- **Build Tool**: Vite
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Styling**: Custom CSS with CSS Variables

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Running locally or MongoDB Atlas
- **FFmpeg** - For video processing

### Installing FFmpeg

**macOS** (using Homebrew):
```bash
brew install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows**:
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd video-streaming-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Configure `.env` file**:
```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/video-streaming
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
MAX_FILE_SIZE=524288000
CLIENT_URL=http://localhost:5173
UPLOAD_PATH=./uploads/videos
```

**For MongoDB Atlas**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-streaming
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:5002/api" > .env
echo "VITE_SOCKET_URL=http://localhost:5002" >> .env
```

### 4. Start the Application

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002

## 📁 Project Structure

```
video-streaming-app/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   └── videoController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # Authentication & authorization
│   │   └── upload.js        # File upload handling
│   ├── models/              # Database models
│   │   ├── User.js
│   │   └── Video.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   └── videoRoutes.js
│   ├── services/            # Business logic
│   │   └── videoProcessor.js
│   ├── uploads/             # Uploaded files (gitignored)
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   └── server.js            # Entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── UploadModal.jsx
    │   │   ├── VideoCard.jsx
    │   │   └── VideoPlayer.jsx
    │   ├── context/         # React Context
    │   │   └── AuthContext.jsx
    │   ├── pages/           # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/        # API services
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    ├── package.json
    └── vite.config.js
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `GET /api/auth/users` - Get all users (Admin only)
- `PUT /api/auth/users/:id/role` - Update user role (Admin only)

### Videos
- `POST /api/videos/upload` - Upload video (Editor/Admin)
- `GET /api/videos` - Get all videos (Protected)
- `GET /api/videos/:id` - Get single video (Protected)
- `GET /api/videos/:id/stream` - Stream video (Protected)
- `PUT /api/videos/:id` - Update video (Owner/Admin)
- `DELETE /api/videos/:id` - Delete video (Owner/Admin)
- `POST /api/videos/:id/share` - Share video (Owner/Admin)

## 👥 User Roles

### Viewer
- View assigned videos
- Stream videos
- Search and filter videos

### Editor
- All Viewer permissions
- Upload new videos
- Edit own videos
- Delete own videos
- Share videos with others

### Admin
- All Editor permissions
- View all videos in organization
- Manage all users
- Update user roles
- Delete any video

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Role-Based Authorization**: Fine-grained access control
4. **File Validation**: Type and size restrictions
5. **Input Sanitization**: Protection against injection attacks
6. **CORS Configuration**: Controlled cross-origin requests
7. **Multi-Tenant Isolation**: Organization-based data separation

## 📊 Video Processing Pipeline

1. **Upload**: File received and validated
2. **Storage**: Saved to disk with unique filename
3. **Database**: Metadata stored in MongoDB
4. **Queue**: Added to processing queue
5. **Metadata Extraction**: Duration, format details
6. **Thumbnail Generation**: Automatic preview image
7. **Sensitivity Analysis**: Content safety check
8. **Status Update**: Real-time progress via Socket.IO
9. **Completion**: Video ready for streaming

## 🎨 Key Features Demo

### Video Upload Flow
1. Click "Upload Video" button
2. Select video file (MP4, MOV, AVI, MKV, WebM)
3. Enter title and description
4. Watch real-time upload progress
5. See processing status updates live
6. Receive sensitivity analysis results

### Video Streaming
- Click play on any completed video
- Custom video player with controls
- Seek, play/pause, mute, fullscreen
- HTTP range requests for efficient streaming
- View count tracking

### Filtering & Search
- Filter by processing status
- Filter by sensitivity status
- Search by title/description
- Real-time results

## 🧪 Testing

### Test User Accounts
After starting the app, register users with different roles:

**Admin User**:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "organization": "test-org"
}
```

**Editor User**:
```json
{
  "username": "editor",
  "email": "editor@example.com",
  "password": "editor123",
  "role": "editor",
  "organization": "test-org"
}
```

**Viewer User**:
```json
{
  "username": "viewer",
  "email": "viewer@example.com",
  "password": "viewer123",
  "role": "viewer",
  "organization": "test-org"
}
```

## 🌐 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables on your platform
2. Ensure MongoDB connection string is set
3. Deploy backend code
4. Run database migrations if needed

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set environment variables:
```
VITE_API_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
```

3. Deploy the `dist` folder

### MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string and add to `.env`

## 🐛 Troubleshooting

### FFmpeg Not Found
```
Error: FFmpeg not found
```
**Solution**: Install FFmpeg and ensure it's in your system PATH

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running or check your connection string

### Upload Fails
```
File size is too large
```
**Solution**: Check `MAX_FILE_SIZE` in `.env` or reduce video size

### Socket.IO Not Connecting
```
Socket connection error
```
**Solution**: Check CORS settings and ensure backend Socket.IO port is accessible

## 📝 Environment Variables Reference

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5002 |
| MONGODB_URI | MongoDB connection | mongodb://localhost:27017/video-streaming |
| JWT_SECRET | JWT signing key | (required) |
| JWT_EXPIRE | Token expiration | 7d |
| MAX_FILE_SIZE | Max upload size | 524288000 (500MB) |
| CLIENT_URL | Frontend URL | http://localhost:5173 |
| UPLOAD_PATH | Video storage | ./uploads/videos |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5002/api |
| VITE_SOCKET_URL | Socket.IO URL | http://localhost:5002 |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built as part of the Pulsegen Technologies Senior AI Engineer Assignment.

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- React team for the amazing frontend library
- MongoDB team for the robust database
- Socket.IO team for real-time capabilities
- FFmpeg for video processing

---

For questions or issues, please open an issue on GitHub or contact the development team.
