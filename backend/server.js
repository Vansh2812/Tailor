// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import repairWorkRoutes from './routes/repairWorkRoutes.js';
import workOrderRoutes from './routes/workOrderRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MongoDB URI is missing in .env');
  process.exit(1);
}

mongoose.connect(uri) // no deprecated options
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);          // Authentication routes
app.use('/api/stores', storeRoutes);       // Store CRUD routes
app.use('/api/repairWorks', repairWorkRoutes); // Repair work routes
app.use('/api/workOrders', workOrderRoutes);   // Work order routes

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
