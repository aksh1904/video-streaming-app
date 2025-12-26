import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToVideo(videoId, callback) {
    if (!this.socket) return;

    this.socket.emit('subscribe:video', videoId);
    
    const listener = (data) => {
      if (data.videoId === videoId) {
        callback(data);
      }
    };

    this.socket.on('video:progress', listener);
    this.listeners.set(videoId, listener);
  }

  unsubscribeFromVideo(videoId) {
    if (!this.socket) return;

    this.socket.emit('unsubscribe:video', videoId);
    
    const listener = this.listeners.get(videoId);
    if (listener) {
      this.socket.off('video:progress', listener);
      this.listeners.delete(videoId);
    }
  }

  onVideoProgress(callback) {
    if (!this.socket) return;
    this.socket.on('video:progress', callback);
  }

  offVideoProgress(callback) {
    if (!this.socket) return;
    this.socket.off('video:progress', callback);
  }
}

const socketService = new SocketService();
export default socketService;
