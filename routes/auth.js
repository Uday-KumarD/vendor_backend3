const express = require('express');
const passport = require('passport');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    console.log('Callback Success:', req.user);
    res.redirect(`${process.env.FRONTEND_URL}/vendors`);
  }
);

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Received Token:', token);
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

    req.login(user, (err) => {
      if (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ message: 'Login failed' });
      }
      res.json({ user });
    });
  } catch (err) {
    console.error('Token Verification Error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;