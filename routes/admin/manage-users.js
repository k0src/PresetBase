const express = require("express");
const router = express.Router();
const isAdmin = require("../../middleware/is-admin.js");
const User = require("../../models/user");

router.get("/", isAdmin, async (req, res) => {
  const sortKeys = {
    username: "users.username",
    email: "users.email",
    joined: "users.timestamp",
    auth: "users.authenticated_with",
    role: "users.is_admin DESC",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.joined;

  if (!sortKey) {
    return res.status(400).send("Invalid sort key");
  }

  const userData = await User.getAllUserData(sortKey);

  const isAuth = req.isAuthenticated();
  const userIsAdmin = req.user && req.user.is_admin;

  try {
    res.render("admin/manage-users", {
      isAuth,
      userIsAdmin,
      userData,
      totalUsers: userData.length,
      PATH_URL: "admin",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

router.put("/update-username", isAdmin, async (req, res) => {
  const { newUsername, userId } = req.body;

  try {
    const user = await User.getUserById(userId);

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

module.exports = router;
