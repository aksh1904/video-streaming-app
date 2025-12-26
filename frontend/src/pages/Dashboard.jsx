import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { videoAPI } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import {
  Upload,
  Video,
  Filter,
  Search,
  Play,
  Trash2,
  Edit,
  Eye,
  LogOut,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import './Dashboard.css';
import UploadModal from '../components/UploadModal';
import VideoPlayer from '../components/VideoPlayer';
import VideoCard from '../components/VideoCard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    sensitivity: '',
    search: '',
  });

  useEffect(() => {
    fetchVideos();
    
    // Connect to socket
    socketService.connect();
    
    // Listen for video progress updates
    socketService.onVideoProgress(handleVideoProgress);

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideos(filters);
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = (data) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video._id === data.videoId
          ? {
              ...video,
              processingProgress: data.progress,
              processingStatus: data.progress === 100 ? 'completed' : 'processing',
            }
          : video
      )
    );

    if (data.progress === 100) {
      toast.success(`Video processing completed!`);
      fetchVideos(); // Refresh to get updated sensitivity status
    }
  };

  const handleUploadSuccess = (newVideo) => {
    setVideos([newVideo, ...videos]);
    setShowUploadModal(false);
    toast.success('Video uploaded successfully!');
    socketService.subscribeToVideo(newVideo._id, handleVideoProgress);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await videoAPI.deleteVideo(videoId);
      setVideos(videos.filter((v) => v._id !== videoId));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setShowPlayer(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, class: 'badge-info', text: 'Pending' },
      processing: { icon: AlertCircle, class: 'badge-warning', text: 'Processing' },
      completed: { icon: CheckCircle, class: 'badge-success', text: 'Completed' },
      failed: { icon: XCircle, class: 'badge-danger', text: 'Failed' },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`badge ${badge.class}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const getSensitivityBadge = (status) => {
    const badges = {
      safe: { class: 'badge-success', text: 'Safe' },
      flagged: { class: 'badge-danger', text: 'Flagged' },
      unknown: { class: 'badge-info', text: 'Unknown' },
    };

    const badge = badges[status] || badges.unknown;

    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const canUpload = user?.role === 'editor' || user?.role === 'admin';

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Video size={32} className="logo-icon" />
              <div>
                <h1>Video Platform</h1>
                <p>Welcome back, {user?.username}!</p>
              </div>
            </div>
            <div className="header-right">
              <span className="user-role badge badge-info">{user?.role}</span>
              <button onClick={logout} className="btn btn-outline">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Actions Bar */}
          <div className="actions-bar">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search videos..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filters">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={filters.sensitivity}
                onChange={(e) => handleFilterChange('sensitivity', e.target.value)}
              >
                <option value="">All Sensitivity</option>
                <option value="safe">Safe</option>
                <option value="flagged">Flagged</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                <Upload size={18} />
                Upload Video
              </button>
            )}
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="empty-state">
              <Video size={64} />
              <h2>No videos found</h2>
              <p>
                {canUpload
                  ? 'Upload your first video to get started'
                  : 'No videos available to view'}
              </p>
              {canUpload && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-primary"
                >
                  <Upload size={18} />
                  Upload Video
                </button>
              )}
            </div>
          ) : (
            <div className="videos-grid">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onPlay={handlePlayVideo}
                  onDelete={handleDeleteVideo}
                  getStatusBadge={getStatusBadge}
                  getSensitivityBadge={getSensitivityBadge}
                  canDelete={
                    user?.role === 'admin' ||
                    video.uploadedBy._id === user?.id ||
                    video.uploadedBy === user?.id
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Video Player Modal */}
      {showPlayer && selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => {
            setShowPlayer(false);
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
