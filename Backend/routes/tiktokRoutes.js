// routes/tiktokRoutes.js
import express from 'express';
import TikTok from '../models/TikTok.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const toTikTokEmbedUrl = (url = '') => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes('/embed/')) return trimmed;

  const videoMatch =
    trimmed.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/i) ||
    trimmed.match(/tiktok\.com\/.*\/video\/(\d+)/i) ||
    trimmed.match(/\/video\/(\d+)/i);

  if (videoMatch?.[1]) {
    return `https://www.tiktok.com/embed/v2/${videoMatch[1]}`;
  }

  return trimmed;
};

// @desc    Get all TikTok videos (Admin)
// @route   GET /api/admin/tiktok
// @access  Private/Admin
router.get('/admin/tiktok', protect, admin, async (req, res) => {
  try {
    const videos = await TikTok.find().sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get active TikTok videos for homepage (Public)
// @route   GET /api/tiktok/active
// @access  Public
router.get('/tiktok/active', async (req, res) => {
  try {
    const videos = await TikTok.find({ active: true }).sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add TikTok video (Admin)
// @route   POST /api/admin/tiktok
// @access  Private/Admin
router.post('/admin/tiktok', protect, admin, async (req, res) => {
  try {
    const { videoUrl, title, description, order, active } = req.body;
    
    // Validate TikTok URL
    const isValidUrl = videoUrl.includes('tiktok.com/embed') || 
                       videoUrl.includes('www.tiktok.com/embed') ||
                       videoUrl.includes('tiktok.com');
    
    if (!isValidUrl) {
      return res.status(400).json({ 
        message: 'Invalid TikTok URL. Please use embed URL format.' 
      });
    }
    
    const video = new TikTok({
      videoUrl: toTikTokEmbedUrl(videoUrl),
      title: title || 'TikTok Video',
      description: description || '',
      order: order || 0,
      active: active !== undefined ? active : true
    });
    
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update TikTok video (Admin)
// @route   PUT /api/admin/tiktok/:id
// @access  Private/Admin
router.put('/admin/tiktok/:id', protect, admin, async (req, res) => {
  try {
    const { videoUrl, title, description, order, active } = req.body;
    const video = await TikTok.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    if (videoUrl) {
      const isValidUrl = videoUrl.includes('tiktok.com/embed') || 
                         videoUrl.includes('www.tiktok.com/embed') ||
                         videoUrl.includes('tiktok.com');
      if (!isValidUrl) {
        return res.status(400).json({ 
          message: 'Invalid TikTok URL. Please use embed URL format.' 
        });
      }
      video.videoUrl = toTikTokEmbedUrl(videoUrl);
    }
    
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (order !== undefined) video.order = order;
    if (active !== undefined) video.active = active;
    
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete TikTok video (Admin)
// @route   DELETE /api/admin/tiktok/:id
// @access  Private/Admin
router.delete('/admin/tiktok/:id', protect, admin, async (req, res) => {
  try {
    const video = await TikTok.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;