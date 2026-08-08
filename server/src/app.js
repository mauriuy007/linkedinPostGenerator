import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env')
];

dotenv.config({ path: envPaths });

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

mongoose.set('bufferCommands', false);

let mongoConnectionPromise = null;

const ensureMongoConnection = () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) return Promise.resolve();
  if (mongoose.connection.readyState === 1) return Promise.resolve();

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(MONGODB_URI)
      .then(() => console.log('MongoDB connected successfully'))
      .catch(error => {
        mongoConnectionPromise = null;
        console.error('MongoDB connection failed. Continuing without a database connection:', error.message);
      });
  }

  return mongoConnectionPromise;
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use((req, res, next) => {
  ensureMongoConnection().finally(next);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'The uploaded image is too large. Please choose a smaller file.',
    });
  }

  if (error) {
    console.error('Unhandled server error:', error);
    return res.status(500).json({
      error: error.message ?? 'Unexpected server error',
    });
  }

  return next();
});

export default app;
