const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
      done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: "535257943737-4sfl8h3be0mv68soe3fg22n3dgqmtg08.apps.googleusercontent.com",
    clientSecret: "fjm-k67ViT4kbMsDpObLs1Wy",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }
));