// src/Component/Pages/admin/AdminTikTok.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import { 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaVideo,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaTiktok
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import './AdminTikTok.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Improved function to convert TikTok URL to embed URL with parameters
const toTikTokEmbedUrl = (url = '') => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  
  // If already an embed URL, just return it
  if (trimmed.includes('/embed/')) {
    // Add parameters if missing
    if (!trimmed.includes('?')) {
      return trimmed + '?lang=en-US&autoplay=0&muted=1&loop=0&controls=1&rel=0&show_closed_caption=0&show_chat=0&show_follow=0&show_like=0&show_share=0&show_comments=0&disable_related=1';
    }
    return trimmed;
  }

  // Extract video ID from various TikTok URL formats
  let videoId = null;
  
  // Pattern 1: tiktok.com/@username/video/1234567890
  let match = trimmed.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/i);
  if (match) videoId = match[1];
  
  // Pattern 2: tiktok.com/v/1234567890
  if (!videoId) {
    match = trimmed.match(/tiktok\.com\/v\/(\d+)/i);
    if (match) videoId = match[1];
  }
  
  // Pattern 3: vm.tiktok.com/xxx/1234567890
  if (!videoId) {
    match = trimmed.match(/vm\.tiktok\.com\/[^\/]+\/(\d+)/i);
    if (match) videoId = match[1];
  }
  
  // Pattern 4: tiktok.com/embed/v2/1234567890
  if (!videoId) {
    match = trimmed.match(/tiktok\.com\/embed\/v2\/(\d+)/i);
    if (match) videoId = match[1];
  }

  if (videoId) {
    return `https://www.tiktok.com/embed/v2/${videoId}?lang=en-US&autoplay=0&muted=1&loop=0&controls=1&rel=0&show_closed_caption=0&show_chat=0&show_follow=0&show_like=0&show_share=0&show_comments=0&disable_related=1`;
  }

  // If no video ID found, return original
  return trimmed;
};

// Function to get clean URL with all parameters
const getCleanTikTokUrl = (url) => {
  if (!url) return '';
  
  // Extract video ID
  let videoId = '';
  const patterns = [
    /tiktok\.com\/embed\/v2\/(\d+)/,
    /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
    /tiktok\.com\/v\/(\d+)/,
    /vm\.tiktok\.com\/[^\/]+\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      videoId = match[1];
      break;
    }
  }
  
  if (!videoId) return url;
  
  // Return clean URL with all parameters
  return `https://www.tiktok.com/embed/v2/${videoId}?lang=en-US&autoplay=0&muted=1&loop=0&controls=1&rel=0&show_closed_caption=0&show_chat=0&show_follow=0&show_like=0&show_share=0&show_comments=0&disable_related=1`;
};

const AdminTikTok = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    order: 0,
    active: true
  });

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991);
      if (window.innerWidth > 991 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && isMobile) {
        const sidebar = document.querySelector('.admin-sidebar');
        const menuBtn = document.querySelector('.menu-toggle-btn');
        if (sidebar && !sidebar.contains(event.target) && !menuBtn?.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, isMobile]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = userInfo?.token;
      if (!token) {
        setLoading(false);
        const savedVideos = localStorage.getItem('tiktokVideos');
        if (savedVideos) {
          // Clean URLs when loading from localStorage
          const cleaned = JSON.parse(savedVideos).map(v => ({
            ...v,
            videoUrl: getCleanTikTokUrl(v.videoUrl)
          }));
          setVideos(cleaned);
        }
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/admin/tiktok`, config);
      
      // Clean all video URLs
      const cleanedVideos = response.data.map(v => ({
        ...v,
        videoUrl: getCleanTikTokUrl(v.videoUrl)
      }));
      
      setVideos(cleanedVideos);
      localStorage.setItem('tiktokVideos', JSON.stringify(cleanedVideos));
    } catch (error) {
      console.error('Error fetching videos:', error);
      const savedVideos = localStorage.getItem('tiktokVideos');
      if (savedVideos) {
        const cleaned = JSON.parse(savedVideos).map(v => ({
          ...v,
          videoUrl: getCleanTikTokUrl(v.videoUrl)
        }));
        setVideos(cleaned);
        toast.info('Loaded videos from local storage');
      } else {
        setVideos([
          {
            _id: '1',
            videoUrl: 'https://www.tiktok.com/embed/v2/1234567890123456789?lang=en-US&autoplay=0&muted=1&rel=0&disable_related=1',
            title: 'Our Latest Collection',
            description: 'Check out our new arrivals!',
            order: 1,
            active: true
          }
        ]);
      }
      toast.error('Failed to fetch videos from server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setFormData({
      videoUrl: '',
      title: '',
      description: '',
      order: 0,
      active: true
    });
    setShowModal(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      title: video.title || '',
      description: video.description || '',
      order: video.order || 0,
      active: video.active
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({
      videoUrl: '',
      title: '',
      description: '',
      order: 0,
      active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.videoUrl.trim()) {
      toast.error('Please enter a TikTok video URL');
      return;
    }
    
    const embedUrl = toTikTokEmbedUrl(formData.videoUrl);

    if (!embedUrl.includes('tiktok.com')) {
      toast.error('Please enter a valid TikTok URL');
      return;
    }

    const payload = { ...formData, videoUrl: embedUrl };

    setSaving(true);
    
    try {
      const token = userInfo?.token;
      
      if (!token) {
        saveToLocalStorage(payload);
        return;
      }
      
      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };
      
      let response;
      if (editingVideo) {
        response = await axios.put(`${API_URL}/admin/tiktok/${editingVideo._id}`, payload, config);
      } else {
        response = await axios.post(`${API_URL}/admin/tiktok`, payload, config);
      }
      
      toast.success(editingVideo ? 'Video updated!' : 'Video added!');
      
      // Clean the response URL
      const cleanedData = {
        ...response.data,
        videoUrl: getCleanTikTokUrl(response.data.videoUrl)
      };
      
      const updatedVideos = editingVideo 
        ? videos.map(v => v._id === editingVideo._id ? cleanedData : v)
        : [...videos, cleanedData];
      
      setVideos(updatedVideos);
      localStorage.setItem('tiktokVideos', JSON.stringify(updatedVideos));
      
      closeModal();
    } catch (error) {
      console.error('Error saving video:', error);
      
      if (error.response?.status === 404 || error.response?.status === 500) {
        saveToLocalStorage(payload);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save video';
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveToLocalStorage = (payload = formData) => {
    const cleanUrl = toTikTokEmbedUrl(payload.videoUrl);
    const newVideo = {
      _id: editingVideo ? editingVideo._id : Date.now().toString(),
      videoUrl: cleanUrl,
      title: payload.title || 'TikTok Video',
      description: payload.description || '',
      order: parseInt(payload.order) || 0,
      active: payload.active,
      createdAt: new Date().toISOString()
    };
    
    let updatedVideos;
    if (editingVideo) {
      updatedVideos = videos.map(v => v._id === editingVideo._id ? newVideo : v);
    } else {
      updatedVideos = [...videos, newVideo];
    }
    
    setVideos(updatedVideos);
    localStorage.setItem('tiktokVideos', JSON.stringify(updatedVideos));
    toast.success(editingVideo ? 'Video updated locally!' : 'Video added locally!');
    closeModal();
  };

  const deleteVideo = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const token = userInfo?.token;
        if (token) {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`${API_URL}/admin/tiktok/${id}`, config);
        }
        
        const updatedVideos = videos.filter(v => v._id !== id);
        setVideos(updatedVideos);
        localStorage.setItem('tiktokVideos', JSON.stringify(updatedVideos));
        toast.success('Video deleted successfully!');
      } catch (error) {
        console.error('Error deleting video:', error);
        toast.error('Failed to delete video');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = userInfo?.token;
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`${API_URL}/admin/tiktok/${id}`, { active: !currentStatus }, config);
      }
      
      const updatedVideos = videos.map(v => 
        v._id === id ? { ...v, active: !currentStatus } : v
      );
      setVideos(updatedVideos);
      localStorage.setItem('tiktokVideos', JSON.stringify(updatedVideos));
      toast.success(`Video ${!currentStatus ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen && isMobile ? 'active' : ''}`} 
           onClick={() => setIsMobileMenuOpen(false)}>
      </div>
      
      {/* Sidebar with mobile support */}
      <div className={`admin-sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <AdminSidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </div>

      <div className="admin-main-content">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button 
            className="menu-toggle-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu size={24} />
            <span className="menu-label">Menu</span>
          </button>
          <h2>TikTok Videos</h2>
          <div className="mobile-header-spacer"></div>
        </div>

        {isMobile && isMobileMenuOpen && (
          <button 
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        )}

        <div className="admin-tiktok-container">
          {/* Header */}
          <div className="tiktok-header">
            <div className="header-left">
              <div className="header-icon">
                <FaTiktok size={24} />
              </div>
              <div className="header-text">
                <h1>TikTok Videos</h1>
                <p>Manage TikTok videos for your homepage</p>
              </div>
            </div>
            <div className="header-right">
              <button className="add-video-btn" onClick={openAddModal}>
                <FaPlus /> Add Video
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="tiktok-stats">
            <div className="stat-card total">
              <div className="stat-icon"><FaVideo size={20} /></div>
              <div className="stat-info">
                <h3>{videos.length}</h3>
                <p>Total Videos</p>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon"><FaEye size={20} /></div>
              <div className="stat-info">
                <h3>{videos.filter(v => v.active).length}</h3>
                <p>Active Videos</p>
              </div>
            </div>
            <div className="stat-card inactive">
              <div className="stat-icon"><FaEyeSlash size={20} /></div>
              <div className="stat-info">
                <h3>{videos.filter(v => !v.active).length}</h3>
                <p>Inactive Videos</p>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video._id} className="video-card">
                <div className="video-wrapper">
                  <iframe
                    src={video.videoUrl}
                    className="video-iframe"
                    frameBorder="0"
                    allowFullScreen
                    scrolling="no"
                    title={video.title || 'TikTok Video'}
                    allow="encrypted-media; picture-in-picture"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  ></iframe>
                </div>
                <div className="video-info">
                  <h3>{video.title || 'TikTok Video'}</h3>
                  {video.description && <p>{video.description}</p>}
                  <div className="video-meta">
                    <span className={`status-badge ${video.active ? 'active' : 'inactive'}`}>
                      {video.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="video-order">Order: {video.order}</span>
                  </div>
                </div>
                <div className="video-actions">
                  <button 
                    className={`action-btn toggle ${video.active ? 'active' : 'inactive'}`}
                    onClick={() => toggleStatus(video._id, video.active)}
                    title={video.active ? 'Deactivate' : 'Activate'}
                  >
                    {video.active ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => openEditModal(video)}
                    title="Edit Video"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => deleteVideo(video._id)}
                    title="Delete Video"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="no-videos">
              <FaVideo className="no-icon" />
              <h3>No TikTok Videos</h3>
              <p>Add your first TikTok video to showcase on your homepage</p>
              <button className="add-video-btn primary" onClick={openAddModal}>
                <FaPlus /> Add Video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVideo ? 'Edit Video' : 'Add TikTok Video'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>TikTok URL *</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.tiktok.com/@user/video/1234567890"
                  required
                  disabled={saving}
                />
                <small>Paste any TikTok video link — embed URL is created automatically</small>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Video title"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Video description"
                  rows="2"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  disabled={saving}
                />
                <small>Lower numbers appear first</small>
              </div>

              <div className="form-group checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span className="checkmark"></span>
                  Active (Show on homepage)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <FaSave /> {editingVideo ? 'Update Video' : 'Add Video'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTikTok;