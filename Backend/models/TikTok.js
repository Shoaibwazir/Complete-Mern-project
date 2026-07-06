// models/TikTok.js - Make sure this is correct
import mongoose from 'mongoose';

const TikTokSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true
  },
  title: {
    type: String,
    default: 'TikTok Video',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Index for better performance
TikTokSchema.index({ order: 1, active: 1 });

export default mongoose.model('TikTok', TikTokSchema);