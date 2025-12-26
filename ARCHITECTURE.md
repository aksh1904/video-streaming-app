# System Architecture

## Overview

This document describes the architecture of the Video Streaming Platform, including system components, data flow, and design decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (Vite)                                       │
│  - Authentication UI                                         │
│  - Video Upload Interface                                    │
│  - Video Library & Player                                    │
│  - Real-time Progress Display                                │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
         HTTP/REST API              WebSocket (Socket.IO)
               │                          │
┌──────────────┴──────────────────────────┴───────────────────┐
│                      APPLICATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js Server                                           │
│  - RESTful API Endpoints                                     │
│  - JWT Authentication                                        │
│  - Role-Based Authorization                                  │
│  - File Upload Handling (Multer)                             │
│  - Socket.IO Server                                          │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
          Database                   File System
               │                          │
┌──────────────┴────────────┐    ┌───────┴──────────────────┐
│     DATA LAYER            │    │   STORAGE LAYER          │
├───────────────────────────┤    ├──────────────────────────┤
│  MongoDB                  │    │  Local File System       │
│  - User Collection        │    │  - Video Files           │
│  - Video Collection       │    │  - Thumbnails            │
└───────────────────────────┘    └──────────────────────────┘
                                              │
                                              │
                                 ┌────────────┴───────────────┐
                                 │  PROCESSING LAYER          │
                                 ├────────────────────────────┤
                                 │  Video Processor Service   │
                                 │  - FFmpeg Integration      │
                                 │  - Metadata Extraction     │
                                 │  - Thumbnail Generation    │
                                 │  - Sensitivity Analysis    │
                                 └────────────────────────────┘
```

## Component Details

### 1. Frontend (React + Vite)

**Technology Stack:**
- React 18 for UI components
- Vite for fast development and building
- React Router for navigation
- Axios for HTTP requests
- Socket.IO Client for real-time updates
- React Hot Toast for notifications

**Key Components:**
- **AuthContext**: Global authentication state management
- **Dashboard**: Main application interface
- **UploadModal**: Video upload interface with progress
- **VideoCard**: Video preview and metadata display
- **VideoPlayer**: Custom video player with streaming

**State Management:**
- Context API for authentication state
- Local state for component-specific data
- No external state management library required

### 2. Backend (Express.js + Node.js)

**Technology Stack:**
- Express.js for web framework
- Socket.IO for real-time communication
- Mongoose for MongoDB ODM
- Multer for file uploads
- FFmpeg for video processing
- JWT for authentication
- bcryptjs for password hashing

**Architecture Pattern:**
- MVC (Model-View-Controller) inspired
- Separation of concerns
- Middleware-based request processing
- Service layer for business logic

**Directory Structure:**
```
backend/
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database schemas
├── routes/         # API route definitions
├── services/       # Business logic
└── server.js       # Application entry point
```

### 3. Database (MongoDB)

**Collections:**

**Users Collection:**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String (viewer|editor|admin),
  organization: String,
  isActive: Boolean,
  createdAt: Date
}
```

**Videos Collection:**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  filename: String,
  filePath: String,
  fileSize: Number,
  duration: Number,
  mimeType: String,
  uploadedBy: ObjectId (User reference),
  organization: String,
  processingStatus: String,
  processingProgress: Number,
  sensitivityStatus: String,
  sensitivityScore: Number,
  sensitivityDetails: String,
  thumbnailPath: String,
  viewCount: Number,
  sharedWith: [{
    user: ObjectId,
    permission: String
  }],
  uploadedAt: Date,
  processedAt: Date
}
```

**Indexes:**
- `uploadedBy` + `organization` (compound index for queries)
- `processingStatus` (for filtering)
- `sensitivityStatus` (for filtering)

## Data Flow

### Video Upload Flow

```
1. User selects video file
   │
   ▼
2. Frontend validates file (type, size)
   │
   ▼
3. FormData sent to backend with progress tracking
   │
   ▼
4. Multer middleware saves file to disk
   │
   ▼
5. Video metadata saved to MongoDB
   │
   ▼
6. Video added to processing queue
   │
   ▼
7. Response sent to client with video info
   │
   ▼
8. Frontend subscribes to Socket.IO for updates
   │
   ▼
9. Video Processor Service starts processing
   │
   ├── Extract metadata (duration, format)
   │   │
   │   ▼
   ├── Generate thumbnail
   │   │
   │   ▼
   └── Perform sensitivity analysis
       │
       ▼
10. Progress updates sent via Socket.IO
    │
    ▼
11. Database updated with results
    │
    ▼
12. Client receives completion notification
```

### Video Streaming Flow

```
1. User clicks play on video
   │
   ▼
2. Frontend requests video stream
   │
   ▼
3. Backend validates user access
   │
   ▼
4. Check video processing status
   │
   ▼
5. Read video file from disk
   │
   ▼
6. Parse Range header (if present)
   │
   ▼
7. Stream appropriate video chunk
   │
   ▼
8. Increment view count
   │
   ▼
9. Video plays in browser
```

### Authentication Flow

```
1. User submits credentials
   │
   ▼
2. Backend validates credentials
   │
   ▼
3. Generate JWT token
   │
   ▼
4. Return token + user data
   │
   ▼
5. Frontend stores token in localStorage
   │
   ▼
6. Token added to all subsequent requests
   │
   ▼
7. Middleware validates token
   │
   ▼
8. Request processed or rejected
```

## Security Architecture

### Authentication & Authorization

**JWT Token Structure:**
```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    id: "user_id",
    iat: timestamp,
    exp: timestamp
  },
  signature: "..."
}
```

**Authorization Levels:**
```
┌─────────────┬──────────┬──────────┬─────────┐
│   Action    │  Viewer  │  Editor  │  Admin  │
├─────────────┼──────────┼──────────┼─────────┤
│ View videos │    ✓     │    ✓     │    ✓    │
│ Upload      │    ✗     │    ✓     │    ✓    │
│ Edit own    │    ✗     │    ✓     │    ✓    │
│ Delete own  │    ✗     │    ✓     │    ✓    │
│ View all    │    ✗     │    ✗     │    ✓    │
│ Delete all  │    ✗     │    ✗     │    ✓    │
│ Manage users│    ✗     │    ✗     │    ✓    │
└─────────────┴──────────┴──────────┴─────────┘
```

### Multi-Tenant Architecture

**Organization Isolation:**
- Each user belongs to an organization
- Videos are scoped to organizations
- Queries automatically filter by organization
- Admin users can only manage their organization
- No cross-organization data access

**Data Segregation:**
```javascript
// Example query with organization filter
Video.find({
  $or: [
    { uploadedBy: userId },
    { 'sharedWith.user': userId }
  ],
  organization: userOrganization
});
```

## Video Processing Architecture

### Processing Queue

**Queue Design:**
- FIFO (First In, First Out)
- In-memory array (upgrade to Redis for production)
- Processes one video at a time
- Automatic retry on failure (future enhancement)

**Processing Steps:**
1. **Metadata Extraction** (25% progress)
   - Uses FFmpeg to extract video properties
   - Duration, format, codec information
   
2. **Thumbnail Generation** (50% progress)
   - Captures frame at 10% of video duration
   - Generates 320x240 preview image
   - Saves to thumbnails directory
   
3. **Sensitivity Analysis** (75% progress)
   - Mock implementation (replace with ML model)
   - Generates safety score (0-1)
   - Classifies as safe/flagged
   
4. **Completion** (100% progress)
   - Updates database with results
   - Notifies client via Socket.IO
   - Video ready for streaming

### FFmpeg Integration

**Use Cases:**
- Metadata extraction: `ffprobe`
- Thumbnail generation: `ffmpeg -screenshots`
- Future: Video transcoding, compression

## Real-Time Communication

### Socket.IO Architecture

**Connection Management:**
- Clients connect on page load
- Automatic reconnection on disconnect
- Room-based subscriptions for videos

**Event Flow:**
```
Client                    Server
  │                         │
  ├─── connect ─────────────▶│
  │                         │
  ├─ subscribe:video(id) ──▶│
  │                         │
  │◀── video:progress ──────┤
  │     (with updates)       │
  │                         │
  ├─ unsubscribe:video(id)─▶│
  │                         │
  ├─── disconnect ──────────▶│
```

**Scalability Considerations:**
- Current: In-memory Socket.IO
- Production: Redis adapter for multiple servers
- Horizontal scaling support

## File Storage

### Current Implementation

**Local File System:**
- Videos: `./uploads/videos/`
- Thumbnails: `./uploads/thumbnails/`
- Unique filenames: `video-{timestamp}-{random}.ext`

**File Naming Convention:**
```
video-1704067200000-123456789.mp4
└───┬─┴────────┬──────┴────┬────┘
    │          │           │
    │          │           └─ Random number
    │          └─ Timestamp
    └─ Prefix
```

### Production Considerations

**Cloud Storage (AWS S3, Google Cloud Storage):**
- Scalability and durability
- CDN integration for fast delivery
- Reduced server load
- Automatic backups

**Implementation Path:**
1. Abstract storage layer
2. Implement S3/GCS adapter
3. Update upload/stream logic
4. Migrate existing files

## Performance Optimization

### Current Optimizations

1. **HTTP Range Requests**
   - Efficient video streaming
   - Seek support in player
   - Reduced bandwidth usage

2. **Database Indexing**
   - Compound indexes on frequent queries
   - Faster filtering and sorting

3. **Real-Time Updates**
   - Prevents polling overhead
   - Instant feedback to users

### Future Enhancements

1. **Caching Layer (Redis)**
   - Cache video metadata
   - Session storage
   - Rate limiting

2. **Video Transcoding**
   - Multiple quality levels
   - Adaptive bitrate streaming
   - Format optimization

3. **CDN Integration**
   - Global content delivery
   - Reduced latency
   - Improved availability

4. **Load Balancing**
   - Multiple server instances
   - Request distribution
   - Fault tolerance

## Scalability Considerations

### Horizontal Scaling

**Current Limitations:**
- In-memory processing queue
- Local file storage
- Single server deployment

**Scaling Strategy:**
1. Move to cloud storage (S3/GCS)
2. Implement Redis for queue and cache
3. Use load balancer (Nginx, AWS ELB)
4. Deploy multiple instances
5. Add database read replicas

### Vertical Scaling

**Resource Requirements:**
- CPU: Video processing (FFmpeg)
- Memory: File buffers, cache
- Storage: Video files
- Bandwidth: Streaming

## Error Handling

### Backend Error Strategy

**Levels:**
1. **Input Validation**: Catch at middleware
2. **Business Logic**: Try-catch in controllers
3. **Database Errors**: Mongoose middleware
4. **File System**: fs error handling
5. **Global**: Express error middleware

**Error Response Format:**
```javascript
{
  success: false,
  message: "Human-readable error",
  error: "Technical details (dev only)"
}
```

### Frontend Error Strategy

**Levels:**
1. **API Errors**: Axios interceptors
2. **Component Errors**: Error boundaries
3. **User Feedback**: Toast notifications
4. **Logging**: Console (dev), service (prod)

## Monitoring & Logging

### Current Implementation

**Backend:**
- Morgan for HTTP logging
- Console.log for debugging
- Error logging to console

**Frontend:**
- Console for development
- User-facing toast notifications

### Production Recommendations

**Backend:**
- Winston or Bunyan for structured logging
- Log aggregation (ELK stack, Datadog)
- Error tracking (Sentry)
- Performance monitoring (New Relic)

**Frontend:**
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring (Lighthouse)

## Testing Strategy

### Unit Testing
- Controllers with mock dependencies
- Services with test data
- Models with test database
- Utility functions

### Integration Testing
- API endpoints with test database
- File upload workflows
- Authentication flows

### End-to-End Testing
- User registration and login
- Video upload and processing
- Video playback
- Role-based access

## Deployment Architecture

### Development
```
Localhost:5173 (Frontend)
    │
    ▼
Localhost:5000 (Backend)
    │
    ▼
Localhost:27017 (MongoDB)
```

### Production (Recommended)
```
CDN (Cloudflare, AWS CloudFront)
    │
    ▼
Frontend (Vercel, Netlify)
    │
    ▼
Load Balancer (AWS ALB, Nginx)
    │
    ├─▶ Backend Instance 1
    ├─▶ Backend Instance 2
    └─▶ Backend Instance 3
         │
         ├─▶ MongoDB Atlas (Primary + Replicas)
         └─▶ S3/GCS (File Storage)
```

## Design Decisions

### Why MongoDB?
- Flexible schema for video metadata
- Easy to scale horizontally
- Good performance for read-heavy workloads
- Rich query capabilities

### Why Socket.IO?
- Real-time bidirectional communication
- Automatic reconnection
- Room-based broadcasting
- Fallback to polling

### Why Express?
- Mature and stable
- Large ecosystem
- Middleware architecture
- Easy to understand

### Why React?
- Component-based architecture
- Large community
- Great developer experience
- Virtual DOM performance

### Why JWT?
- Stateless authentication
- Scalable (no server-side sessions)
- Works across domains
- Industry standard

## Future Enhancements

1. **Video Transcoding**: Multiple quality levels
2. **Live Streaming**: RTMP support
3. **Social Features**: Comments, likes, shares
4. **Analytics**: View statistics, engagement metrics
5. **Content Recommendations**: ML-based suggestions
6. **Team Collaboration**: Annotations, reviews
7. **API Rate Limiting**: Prevent abuse
8. **Audit Logs**: Track all system actions
9. **Backup System**: Automated backups
10. **Mobile Apps**: iOS and Android clients
