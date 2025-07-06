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
    role: "users.is_admin",
  };

  const sortDirections = {
    asc: "ASC",
    desc: "DESC",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.joined;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  if (!sortKey || !sortDirection) {
    return res.status(400).send("Invalid sort key");
  }

  const userData = await User.getAllUsersData(sortKey, sortDirection);

  const isAuth = req.isAuthenticated();
  const userIsAdmin = req.user && req.user.is_admin;
  const adminId = req.user.id;

  try {
    res.render("admin/manage-users", {
      isAuth,
      userIsAdmin,
      userData,
      adminId,
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

router.post("/ban-user", isAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    if (!(await User.exists(userId))) {
      return res.status(404).json({ error: "User not found." });
    }

    await User.banUser(userId);

    res.json({ message: "User banned successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while banning the user.",
    });
  }
});

router.post("/unban-user", isAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    if (!(await User.exists(userId))) {
      return res.status(404).json({ error: "User not found." });
    }

    await User.unbanUser(userId);

    res.json({ message: "User unbanned successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while unbanning the user.",
    });
  }
});

router.post("/promote-user", isAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    if (!(await User.exists(userId))) {
      return res.status(404).json({ error: "User not found." });
    }

    await User.setAdmin(userId);

    res.json({ message: "User promoted to admin successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while promoting the user.",
    });
  }
});

router.post("/demote-user", isAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    if (!(await User.exists(userId))) {
      return res.status(404).json({ error: "User not found." });
    }

    await User.unsetAdmin(userId);

    res.json({ message: "User demoted from admin successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while demoting the user.",
    });
  }
});

router.get("/user-data/:userId", isAdmin, async (req, res) => {
  const userId = req.params.userId;

  try {
    if (!(await User.exists(userId))) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = await User.getUserData(userId);

    if (!userData) {
      return res.status(404).json({ error: "User data not found." });
    }

    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching user data.",
    });
  }
});

module.exports = router;
