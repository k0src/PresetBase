const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await User.getUserByEmail(email);
        if (!user) {
          user = await User.createUser({
            email,
            username: generateUsername(name),
            authenticated_with: "google",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);

  if (!user || !user.id) {
    return done(new Error("Invalid user object"), null);
  }
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const generateUsername = function (name) {
  return (
    name.toLowerCase().replace(/\s+/g, "_") +
    "_" +
    Math.floor(Math.random() * 10000)
  );
};
