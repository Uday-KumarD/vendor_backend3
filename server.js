require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('./config/db');
require('./config/passport');
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.FRONTEND_URL, // https://vendorfrontend2.netlify.app
  credentials: true 
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none for cross-origin
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));