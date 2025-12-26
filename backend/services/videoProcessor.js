const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');

class VideoProcessor {
  constructor(io) {
    this.io = io;
    this.processingQueue = [];
  }

  // Add video to processing queue
  async addToQueue(videoId) {
    this.processingQueue.push(videoId);
    this.processNext();
  }

  // Process next video in queue
  async processNext() {
    if (this.processingQueue.length === 0) return;

    const videoId = this.processingQueue.shift();
    await this.processVideo(videoId);

    // Process next if queue not empty
    if (this.processingQueue.length > 0) {
      this.processNext();
    }
  }

  // Main video processing function
  async processVideo(videoId) {
    try {
      const video = await Video.findById(videoId);
      if (!video) return;

      // Update status to processing
      video.processingStatus = 'processing';
      video.processingProgress = 0;
      await video.save();

      this.emitProgress(videoId, 0, 'Starting video analysis...');

      // Step 1: Extract video metadata
      await this.extractMetadata(video);
      this.emitProgress(videoId, 25, 'Metadata extracted...');

      // Step 2: Generate thumbnail
      await this.generateThumbnail(video);
      this.emitProgress(videoId, 50, 'Thumbnail generated...');

      // Step 3: Perform sensitivity analysis
      await this.analyzeSensitivity(video);
      this.emitProgress(videoId, 75, 'Sensitivity analysis completed...');

      // Step 4: Finalize processing
      video.processingStatus = 'completed';
      video.processingProgress = 100;
      video.processedAt = new Date();
      await video.save();

      this.emitProgress(videoId, 100, 'Processing completed!');

      console.log(`Video ${videoId} processed successfully`);
    } catch (error) {
      console.error(`Error processing video ${videoId}:`, error);
      
      const video = await Video.findById(videoId);
      if (video) {
        video.processingStatus = 'failed';
        video.processingProgress = 0;
        await video.save();
      }

      this.emitProgress(videoId, 0, 'Processing failed');
    }
  }

  // Extract video metadata (duration, etc.)
  async extractMetadata(video) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(video.filePath, async (err, metadata) => {
        if (err) {
          console.error('Error extracting metadata:', err);
          resolve(); // Don't fail the whole process
          return;
        }

        try {
          const duration = metadata.format.duration || 0;
          video.duration = Math.round(duration);
          await video.save();
          resolve();
        } catch (error) {
          console.error('Error saving metadata:', error);
          resolve();
        }
      });
    });
  }

  // Generate video thumbnail
  async generateThumbnail(video) {
    return new Promise((resolve, reject) => {
      const thumbnailDir = './uploads/thumbnails';
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      const thumbnailFilename = `thumb-${path.basename(video.filename, path.extname(video.filename))}.jpg`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

      ffmpeg(video.filePath)
        .screenshots({
          timestamps: ['10%'],
          filename: thumbnailFilename,
          folder: thumbnailDir,
          size: '320x240',
        })
        .on('end', async () => {
          video.thumbnailPath = thumbnailPath;
          await video.save();
          resolve();
        })
        .on('error', (err) => {
          console.error('Error generating thumbnail:', err);
          resolve(); // Don't fail the whole process
        });
    });
  }

  // Simulate sensitivity analysis
  async analyzeSensitivity(video) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock sensitivity analysis
    // In production, this would use ML models, cloud APIs, etc.
    const mockAnalysis = this.performMockSensitivityAnalysis(video);

    video.sensitivityStatus = mockAnalysis.status;
    video.sensitivityScore = mockAnalysis.score;
    video.sensitivityDetails = mockAnalysis.details;
    await video.save();
  }

  // Mock sensitivity analysis logic
  performMockSensitivityAnalysis(video) {
    // Generate a random score for demonstration
    const score = Math.random();

    let status, details;

    if (score < 0.3) {
      status = 'safe';
      details = 'No sensitive content detected. Video appears appropriate for all audiences.';
    } else if (score < 0.7) {
      status = 'safe';
      details = 'Minor concerns detected but content is generally appropriate. Review recommended.';
    } else {
      status = 'flagged';
      details = 'Potentially sensitive content detected. Manual review required before publication.';
    }

    return { status, score: parseFloat(score.toFixed(2)), details };
  }

  // Emit progress updates via Socket.IO
  emitProgress(videoId, progress, message) {
    this.io.emit('video:progress', {
      videoId,
      progress,
      message,
      timestamp: new Date(),
    });
  }
}

module.exports = VideoProcessor;
