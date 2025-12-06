var GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../modules/User");
require("dotenv").config();



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://airkart-backend.onrender.com/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase().trim();
        let user = await User.findOne({ email });
        if (user) {
          if (!user.providers.includes("google")) {
            user.providers.push("google");
          }

          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value;
          user.isLoggedin = true;

          await user.save();
          return done(null, user);
        }
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          providers: ["google"],
          avatar: profile.photos?.[0]?.value,
          password: null,
          isLoggedin: true,
        });

        return done(null, user);

      } catch (err) {
        console.log("Google Auth Error:", err);
        return done(err, null);
      }
    }
  )
);


