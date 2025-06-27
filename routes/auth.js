const express = require('express');
const passport = require('passport');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.FRONTEND_URL}/login`
}), (req, res) => {
  console.log('Session after login:', req.session);
  console.log('User on callback:', req.user);
  res.redirect(`${process.env.FRONTEND_URL}/vendors`);
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
    const user = {
      googleId: payload.sub,
      displayName: payload.name,
      email: payload.email
    };
    let dbUser = await User.findOne({ googleId: payload.sub });
    if (!dbUser) {
      dbUser = new User(user);
      await dbUser.save();
    }
    req.login(user, { session: true }, (err) => {
      if (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ message: 'Login failed' });
      }
      console.log('Session after login:', req.session);
      res.json({ user });
    });
  } catch (err) {
    console.error('Token Verification Error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/user', (req, res) => {
  console.log('Session on /user:', req.session);
  console.log('User on /user:', req.user);
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

router.post('/logout', (req, res) => {
  console.log('Session before logout:', req.session);
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
      res.clearCookie('connect.sid', {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });
      res.json({ message: 'Logged out' });
    });
  });
});

module.exports = router;