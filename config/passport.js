import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { emails, displayName } = profile;
        const email = emails[0]?.value;
        const name = displayName;

        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await User.getByEmail(email);

        if (user) {
          if (user.authenticatedWith === "Google") {
            return done(null, user);
          } else {
            return done(
              new Error(
                "An account with this email already exists. Please sign in with your email and password instead."
              ),
              null
            );
          }
        }

        let username = name?.replace(/\s+/g, "_").toLowerCase();
        if (!username || username.length < 3) {
          username = email.split("@")[0];
        }

        let uniqueUsername = username;
        let counter = 1;
        while (await User.getByUsername(uniqueUsername)) {
          uniqueUsername = `${username}_${counter}`;
          counter++;
        }

        const newUser = {
          username: uniqueUsername,
          email: email.toLowerCase().trim(),
          authenticatedWith: "Google",
        };

        const createdUser = await User.createOAuthUser(newUser);
        return done(null, createdUser);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.getById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
