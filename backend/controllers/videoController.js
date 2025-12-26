const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private (Editor/Admin)
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded',
      });
    }

    const { title, description } = req.body;

    if (!title) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Video title is required',
      });
    }

    // Create video record
    const video = await Video.create({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      organization: req.user.organization,
    });

    // Trigger video processing
    const videoProcessor = req.app.get('videoProcessor');
    videoProcessor.addToQueue(video._id);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully and queued for processing',
      video,
    });
  } catch (error) {
    console.error('Upload video error:', error);
    
    // Delete file if database save failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message,
    });
  }
};

// @desc    Get all videos for user
// @route   GET /api/videos
// @access  Private
exports.getVideos = async (req, res) => {
  try {
    const { status, sensitivity, search } = req.query;
    
    // Build query based on user role
    let query = {};

    if (req.user.role === 'admin') {
      // Admin can see all videos in their organization
      query.organization = req.user.organization;
    } else {
      // Regular users see their own videos and shared videos
      query.$or = [
        { uploadedBy: req.user._id },
        { 'sharedWith.user': req.user._id },
      ];
    }

    // Apply filters
    if (status) {
      query.processingStatus = status;
    }

    if (sensitivity) {
      query.sensitivityStatus = sensitivity;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const videos = await Video.find(query)
      .populate('uploadedBy', 'username email')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
    });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'username email')
      .populate('sharedWith.user', 'username email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check access permissions
    const hasAccess =
      req.user.role === 'admin' ||
      video.uploadedBy._id.toString() === req.user._id.toString() ||
      video.sharedWith.some(
        (share) => share.user._id.toString() === req.user._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
      });
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
    });
  }
};

// @desc    Stream video
// @route   GET /api/videos/:id/stream
// @access  Private
exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check access permissions
    const hasAccess =
      req.user.role === 'admin' ||
      video.uploadedBy.toString() === req.user._id.toString() ||
      video.sharedWith.some(
        (share) => share.user.toString() === req.user._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to stream this video',
      });
    }

    const videoPath = video.filePath;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimeType,
      };

      res.writeHead(206, head);
      file.pipe(res);

      // Increment view count
      video.viewCount += 1;
      await video.save();
    } else {
      // No range, send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);

      // Increment view count
      video.viewCount += 1;
      await video.save();
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming video',
    });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (Owner/Admin)
exports.updateVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check permissions
    if (
      req.user.role !== 'admin' &&
      video.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video',
      });
    }

    if (title) video.title = title;
    if (description) video.description = description;

    await video.save();

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      video,
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Owner/Admin)
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check permissions
    if (
      req.user.role !== 'admin' &&
      video.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video',
      });
    }

    // Delete video file
    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    // Delete thumbnail if exists
    if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
      fs.unlinkSync(video.thumbnailPath);
    }

    // Delete from database
    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
    });
  }
};

// @desc    Share video with user
// @route   POST /api/videos/:id/share
// @access  Private (Owner/Admin)
exports.shareVideo = async (req, res) => {
  try {
    const { userId, permission } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check permissions
    if (
      req.user.role !== 'admin' &&
      video.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this video',
      });
    }

    // Check if already shared
    const alreadyShared = video.sharedWith.find(
      (share) => share.user.toString() === userId
    );

    if (alreadyShared) {
      alreadyShared.permission = permission || 'view';
    } else {
      video.sharedWith.push({
        user: userId,
        permission: permission || 'view',
      });
    }

    await video.save();

    res.status(200).json({
      success: true,
      message: 'Video shared successfully',
      video,
    });
  } catch (error) {
    console.error('Share video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing video',
    });
  }
};
