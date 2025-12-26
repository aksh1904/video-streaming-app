const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  mimeType: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  sensitivityStatus: {
    type: String,
    enum: ['unknown', 'safe', 'flagged'],
    default: 'unknown',
  },
  sensitivityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  sensitivityDetails: {
    type: String,
  },
  thumbnailPath: {
    type: String,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    },
  }],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
});

// Index for faster queries
videoSchema.index({ uploadedBy: 1, organization: 1 });
videoSchema.index({ processingStatus: 1 });
videoSchema.index({ sensitivityStatus: 1 });

module.exports = mongoose.model('Video', videoSchema);
