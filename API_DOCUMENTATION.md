# API Documentation

## Base URL
```
http://localhost:5002/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "editor",
  "organization": "my-org"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "editor",
    "organization": "my-org"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "editor",
    "organization": "my-org"
  }
}
```

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "editor",
    "organization": "my-org"
  }
}
```

### Get All Users (Admin Only)
**GET** `/auth/users`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "editor",
      "organization": "my-org"
    }
  ]
}
```

### Update User Role (Admin Only)
**PUT** `/auth/users/:id/role`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

## Video Endpoints

### Upload Video
**POST** `/videos/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `video` (file): Video file
- `title` (string): Video title
- `description` (string, optional): Video description

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully and queued for processing",
  "video": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Video",
    "description": "A great video",
    "filename": "video-1234567890-123456789.mp4",
    "fileSize": 10485760,
    "uploadedBy": "507f1f77bcf86cd799439011",
    "processingStatus": "pending",
    "sensitivityStatus": "unknown"
  }
}
```

### Get All Videos
**GET** `/videos`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by processing status (pending, processing, completed, failed)
- `sensitivity` (optional): Filter by sensitivity status (safe, flagged, unknown)
- `search` (optional): Search by title or description

**Response:**
```json
{
  "success": true,
  "count": 5,
  "videos": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "My Video",
      "description": "A great video",
      "filename": "video-1234567890-123456789.mp4",
      "fileSize": 10485760,
      "duration": 120,
      "uploadedBy": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "johndoe"
      },
      "processingStatus": "completed",
      "sensitivityStatus": "safe",
      "sensitivityScore": 0.15,
      "viewCount": 10,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Video
**GET** `/videos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "video": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Video",
    "description": "A great video",
    "filename": "video-1234567890-123456789.mp4",
    "fileSize": 10485760,
    "duration": 120,
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "processingStatus": "completed",
    "sensitivityStatus": "safe",
    "sensitivityScore": 0.15,
    "sensitivityDetails": "No sensitive content detected.",
    "viewCount": 10
  }
}
```

### Stream Video
**GET** `/videos/:id/stream`

**Headers:**
```
Authorization: Bearer <token>
Range: bytes=0-1023 (optional for partial content)
```

**Response:**
- Status: 206 Partial Content (with Range) or 200 OK (full file)
- Headers:
  - `Content-Type`: video/mp4
  - `Content-Length`: File size
  - `Content-Range`: bytes 0-1023/10485760 (if Range requested)
  - `Accept-Ranges`: bytes

### Update Video
**PUT** `/videos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video updated successfully",
  "video": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "description": "Updated description"
  }
}
```

### Delete Video
**DELETE** `/videos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### Share Video
**POST** `/videos/:id/share`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "permission": "view"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video shared successfully",
  "video": {
    "_id": "507f1f77bcf86cd799439011",
    "sharedWith": [
      {
        "user": "507f1f77bcf86cd799439012",
        "permission": "view"
      }
    ]
  }
}
```

---

## Socket.IO Events

### Client → Server

#### Subscribe to Video Updates
```javascript
socket.emit('subscribe:video', videoId);
```

#### Unsubscribe from Video Updates
```javascript
socket.emit('unsubscribe:video', videoId);
```

### Server → Client

#### Video Processing Progress
```javascript
socket.on('video:progress', (data) => {
  console.log(data);
  // {
  //   videoId: '507f1f77bcf86cd799439011',
  //   progress: 50,
  //   message: 'Generating thumbnail...',
  //   timestamp: '2024-01-01T00:00:00.000Z'
  // }
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding rate limiting for:
- Authentication endpoints: 5 requests per minute
- Upload endpoints: 10 requests per hour
- Other endpoints: 100 requests per minute

---

## File Upload Limits

- **Maximum file size**: 500MB (configurable via `MAX_FILE_SIZE` env variable)
- **Allowed formats**: MP4, MOV, AVI, MKV, WebM
- **Maximum concurrent uploads**: No limit (consider implementing queue system)

---

## Security Considerations

1. All endpoints except `/auth/register` and `/auth/login` require authentication
2. JWT tokens expire after 7 days (configurable)
3. Passwords are hashed using bcrypt with 12 salt rounds
4. File uploads are validated for type and size
5. CORS is configured to allow only specified origins
6. Input validation is performed on all endpoints

---

## Testing with cURL

### Register a user
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "editor"
  }'
```

### Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Upload video
```bash
curl -X POST http://localhost:5002/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "video=@/path/to/video.mp4" \
  -F "title=My Video" \
  -F "description=A test video"
```

### Get videos
```bash
curl -X GET http://localhost:5002/api/videos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Stream video
```bash
curl -X GET http://localhost:5002/api/videos/VIDEO_ID/stream \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output video.mp4
```
