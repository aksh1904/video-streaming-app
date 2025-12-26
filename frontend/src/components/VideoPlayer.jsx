import React, { useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { videoAPI } from '../services/api';
import './VideoPlayer.css';

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const token = localStorage.getItem('token');
  const streamUrl = `${videoAPI.getStreamUrl(video._id)}?token=${token}`;

  return (
    <div className="player-overlay" onClick={onClose}>
      <div className="player-container" onClick={(e) => e.stopPropagation()}>
        <div className="player-header">
          <div>
            <h3>{video.title}</h3>
            {video.description && <p>{video.description}</p>}
          </div>
          <button onClick={onClose} className="player-close">
            <X size={24} />
          </button>
        </div>

        <div className="player-video-wrapper">
          <video
            ref={videoRef}
            src={streamUrl}
            className="player-video"
            onClick={togglePlay}
          />

          <div className="player-controls">
            <div className="progress-container" onClick={handleSeek}>
              <div className="progress-bar">
                <div
                  className="progress-filled"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            <div className="controls-row">
              <div className="controls-left">
                <button onClick={togglePlay} className="control-btn">
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={toggleMute} className="control-btn">
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="controls-right">
                <button onClick={toggleFullscreen} className="control-btn">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {video.sensitivityStatus === 'flagged' && (
          <div className="sensitivity-warning">
            <strong>⚠️ Content Warning:</strong> This video has been flagged during sensitivity analysis.
            {video.sensitivityDetails && <p>{video.sensitivityDetails}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
