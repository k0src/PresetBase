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

module.exports = router;
