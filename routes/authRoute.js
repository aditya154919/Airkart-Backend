
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { Authmiddleware } = require("../middleware/Authmiddleware");
const User = require("../modules/User");

require("../GoogleAuth/passport");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const clientURL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
      const dbUser = req.user;

      if (!dbUser) {
        console.error("❌ Passport did not return user");
        return res.redirect(`${clientURL}/#/login?error=no_user`);
      }

      await User.findByIdAndUpdate(dbUser._id, { isLoggedin: true });

      const token = jwt.sign(
        { id: dbUser._id.toString(), email: dbUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("🔥 Google Callback User:", dbUser);
      console.log("🔥 JWT Signed:", token);

      return res.redirect(`${clientURL}#/auth-success?token=${token}`);
    } catch (error) {
      console.error("Google login error:", error);
      return res.redirect(`${clientURL}/#/login?error=google_failed`);
    }
  }
);


// STEP 3: Get logged-in user
router.get("/me", Authmiddleware, (req, res) => {
  console.log("Authenticated user:", req.user);

  return res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
