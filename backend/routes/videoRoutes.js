const express = require('express');
const router = express.Router();
const {
  uploadVideo,
  getVideos,
  getVideo,
  streamVideo,
  updateVideo,
  deleteVideo,
  shareVideo,
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Video upload (editor and admin only)
router.post(
  '/upload',
  authorize('editor', 'admin'),
  upload.single('video'),
  handleMulterError,
  uploadVideo
);

// Get all videos
router.get('/', getVideos);

// Get single video
router.get('/:id', getVideo);

// Stream video
router.get('/:id/stream', streamVideo);

// Update video (editor and admin only)
router.put('/:id', authorize('editor', 'admin'), updateVideo);

// Delete video (editor and admin only)
router.delete('/:id', authorize('editor', 'admin'), deleteVideo);

// Share video (editor and admin only)
router.post('/:id/share', authorize('editor', 'admin'), shareVideo);

module.exports = router;
