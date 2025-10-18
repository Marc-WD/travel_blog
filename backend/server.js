// ====== ENV & CORE DEPENDENCIES ======
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ====== ROUTES ======
const authRoutes = require('./routes/auth');
const packagesRoutes = require('./routes/packages');
const bookingsRoutes = require('./routes/bookings');
const quizzesRoutes = require('./routes/quizzes');
const pollsRoutes = require('./routes/polls');
const plansRoutes = require('./routes/plans');
const reviewsRoutes = require('./routes/reviews');
const topLikedRoutes = require('./routes/topLikedPosts');
const postsRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');
const travelRoutes = require('./routes/travel');

const app = express();

// ====== SECURITY & MIDDLEWARES ======
app.use(helmet());

// ✅ Set manual CORS headers for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // your Vue frontend
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

// ✅ Also use cors() middleware (for API requests)
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// ====== STATIC FILES (IMAGES, UPLOADS) ======
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
console.log('✅ Serving uploads from:', path.resolve(__dirname, 'uploads'));

// ====== RATE LIMITER (PREVENT ABUSE) ======
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per window
});
app.use(limiter);

// ====== ROUTE MOUNTS ======
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/packages/:packageId/reviews', reviewsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', topLikedRoutes);
app.use('/api/travel', travelRoutes);

// ====== HEALTH CHECK ======
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ====== ERROR HANDLER ======
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// ====== DATABASE & SERVER INIT ======
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('✅ Mongo connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });
