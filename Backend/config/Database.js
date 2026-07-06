import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('MongoDB Connected:', conn.connection.host);
    console.log('Database Name:', conn.connection.name);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    return conn;
    
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    // Don't exit here, let the caller handle it
    throw error;
  }
};

export default connectDB;