const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user.googleId);
});

passport.deserializeUser(async (googleId, done) => {
  console.log('Deserializing user with googleId:', googleId);
  try {
    const user = await User.findOne({ googleId });
    done(null, user || { googleId });
  } catch (err) {
    console.error('Deserialize Error:', err);
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google Profile:', profile);
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    console.error('Google Strategy Error:', err);
    done(err, null);
  }
}));