import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env')
];

dotenv.config({ path: envPaths });

const app = express();
const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set('bufferCommands', false);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

const connectToMongoIfConfigured = async () => {
  if (!MONGODB_URI) {
    console.warn('MongoDB is not configured. Starting server without database connection.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed. Starting server without database connection:', error.message);
  }
};

const startServer = async () => {
  try {
    await connectToMongoIfConfigured();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
