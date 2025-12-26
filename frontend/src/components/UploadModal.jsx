import React, { useState } from 'react';
import { X, Upload, File } from 'lucide-react';
import { videoAPI } from '../services/api';
import toast from 'react-hot-toast';
import './UploadModal.css';

const UploadModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Please upload a video file.');
        return;
      }

      // Validate file size (500MB max)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 500MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append('video', file);
    formDataToSend.append('title', formData.title);
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }

    try {
      const response = await videoAPI.upload(formDataToSend, (progress) => {
        setUploadProgress(progress);
      });

      onSuccess(response.data.video);
    } catch (error) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload video';
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Video</h2>
          <button onClick={onClose} className="modal-close" disabled={uploading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-upload-area">
            <input
              type="file"
              id="video-file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <label htmlFor="video-file" className={`file-upload-label ${file ? 'has-file' : ''}`}>
              {file ? (
                <>
                  <File size={32} />
                  <div className="file-info">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{formatFileSize(file.size)}</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={48} />
                  <p>Click to select video or drag and drop</p>
                  <span>MP4, MOV, AVI, MKV, WebM (Max 500MB)</span>
                </>
              )}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Video Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter video title"
              value={formData.title}
              onChange={handleChange}
              disabled={uploading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter video description"
              value={formData.description}
              onChange={handleChange}
              disabled={uploading}
              rows="4"
            />
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="progress-text">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
