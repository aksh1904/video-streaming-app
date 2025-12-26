import React from 'react';
import { Play, Trash2, Clock, Eye } from 'lucide-react';
import './VideoCard.css';

const VideoCard = ({ video, onPlay, onDelete, getStatusBadge, getSensitivityBadge, canDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canPlay = video.processingStatus === 'completed';

  return (
    <div className="video-card fade-in">
      <div className="video-thumbnail">
        {video.thumbnailPath ? (
          <img src={video.thumbnailPath} alt={video.title} />
        ) : (
          <div className="thumbnail-placeholder">
            <Play size={48} />
          </div>
        )}
        
        {video.processingStatus === 'processing' && (
          <div className="processing-overlay">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36" className="circular-progress">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${video.processingProgress}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">
                  {video.processingProgress}%
                </text>
              </svg>
            </div>
            <p>Processing...</p>
          </div>
        )}
        
        {canPlay && (
          <button onClick={() => onPlay(video)} className="play-button">
            <Play size={24} />
          </button>
        )}
        
        {video.duration > 0 && (
          <span className="duration-badge">{formatDuration(video.duration)}</span>
        )}
      </div>

      <div className="video-info">
        <div className="video-header">
          <h3 className="video-title">{video.title}</h3>
          <div className="video-badges">
            {getStatusBadge(video.processingStatus)}
            {video.sensitivityStatus !== 'unknown' && getSensitivityBadge(video.sensitivityStatus)}
          </div>
        </div>

        {video.description && (
          <p className="video-description">{video.description}</p>
        )}

        <div className="video-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{formatDate(video.uploadedAt)}</span>
          </div>
          <div className="meta-item">
            <Eye size={14} />
            <span>{video.viewCount || 0} views</span>
          </div>
        </div>

        {video.sensitivityDetails && video.processingStatus === 'completed' && (
          <div className="sensitivity-details">
            <p>{video.sensitivityDetails}</p>
            {video.sensitivityScore && (
              <span className="sensitivity-score">
                Score: {(video.sensitivityScore * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}

        <div className="video-footer">
          <div className="video-size">{formatFileSize(video.fileSize)}</div>
          {canDelete && (
            <button
              onClick={() => onDelete(video._id)}
              className="btn-icon btn-danger"
              title="Delete video"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
