const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google Profile:', profile); // Debug log
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      });
      await user.save();
      console.log('New user saved:', user);
    }
    done(null, user);
  } catch (err) {
    console.error('Passport Error:', err);
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id); // Debug log
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('Deserialized user:', user); // Debug log
    done(null, user);
  } catch (err) {
    console.error('Deserialize Error:', err);
    done(err, null);
  }
});