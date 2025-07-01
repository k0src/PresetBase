const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const { formatDate, titleCase } = require("../../util/UTIL.js");
const isAuth = require("../../middleware/is-auth.js");

router.get("/", isAuth, async (req, res) => {
  try {
    const isAuth = req.isAuthenticated();
    const { id, email, username, timestamp, is_admin, authenticated_with } =
      req.user;
    res.render("auth/account-info", {
      isAuth,
      user: {
        id,
        username,
        email,
        timestamp: formatDate(timestamp),
        is_admin,
        authenticated_with: titleCase(authenticated_with),
      },
      PATH_URL: "account",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

router.put("/update-username", isAuth, async (req, res) => {
  const { newUsername } = req.body;

  try {
    const user = await User.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await user.setUsername(newUsername);

    res.json({ username: newUsername });
  } catch (err) {
    console.error(err);

    if (err.message === "Invalid username format") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({
      error: "An error occurred while updating the username.",
    });
  }
});

router.post("/sign-out", isAuth, async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Failed to destroy session." });
      }

      return res.status(200).json({ message: "Signed out successfully." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while attempting to sign out.",
    });
  }
});

router.post("/delete-account", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await User.deleteAccountById(userId);

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Failed to destroy session." });
      }

      return res.status(200).json({ message: "Signed out successfully." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while attempting to delete account.",
    });
  }
});

module.exports = router;
