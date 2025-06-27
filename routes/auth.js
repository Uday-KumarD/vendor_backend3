const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.get('/google', (req, res) => {
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${process.env.BACKEND_URL}/api/auth/google/callback&` +
    `response_type=code&` +
    `scope=profile email`);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/auth/google/callback`
    );
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    console.log('Google Token Payload:', payload);
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = new User({
        googleId: payload.sub,
        displayName: payload.name,
        email: payload.email
      });
      await user.save();
    }
    const jwtToken = jwt.sign(
      { googleId: user.googleId, email: user.email, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/vendors?token=${jwtToken}`);
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

router.post('/google', async (req, res) => {
  const { token } = req.body;
  console.log('Received Token:', token);
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    console.log('Google Token Payload:', payload);
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = new User({
        googleId: payload.sub,
        displayName: payload.name,
        email: payload.email
      });
      await user.save();
    }
    const jwtToken = jwt.sign(
      { googleId: user.googleId, email: user.email, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ user, token: jwtToken });
  } catch (err) {
    console.error('Token Verification Error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ googleId: decoded.googleId, email: decoded.email, displayName: decoded.displayName });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;