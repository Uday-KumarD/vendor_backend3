require('dotenv').config();
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  require('./config/db');
  const authRoutes = require('./routes/auth');
  const vendorRoutes = require('./routes/vendors');

  // Log uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  // Log unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
  });

  const app = express();

  const allowedOrigins = [
    'http://localhost:5173',
    'https://vendorfrontend2.netlify.app'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  app.use(express.json());
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/vendors', vendorRoutes);

  app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  });

  app.get('/', (req, res) => {
    res.send('Backend server is running');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));